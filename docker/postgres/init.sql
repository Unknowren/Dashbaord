-- ============================================
-- BrainTestStudio - PostgreSQL Initialisierung
-- ============================================
-- Erstellt die notwendigen Datenbanken und Rollen
-- für Supabase und N8N
-- ============================================

-- N8N Datenbank erstellen
CREATE DATABASE n8n;

-- Supabase Rollen erstellen (falls nicht vorhanden)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
        CREATE ROLE anon NOLOGIN NOINHERIT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
        CREATE ROLE authenticated NOLOGIN NOINHERIT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
        CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
        CREATE ROLE supabase_admin LOGIN SUPERUSER;
    END IF;
END
$$;

-- Grants für Supabase
GRANT anon TO postgres;
GRANT authenticated TO postgres;
GRANT service_role TO postgres;

-- Auth Schema für Supabase erstellen
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS _realtime;
CREATE SCHEMA IF NOT EXISTS graphql_public;

-- ============================================
-- STORAGE SCHEMA (für Supabase Storage)
-- ============================================
-- Die Storage-API benötigt diese Basis-Tabellen
-- WICHTIG: path_tokens wird von Storage-Migrations hinzugefügt!

-- Buckets Tabelle
CREATE TABLE IF NOT EXISTS storage.buckets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    owner UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Objects Tabelle (OHNE path_tokens - kommt von Storage-Migration 0002!)
CREATE TABLE IF NOT EXISTS storage.objects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bucket_id TEXT REFERENCES storage.buckets(id),
    name TEXT,
    owner UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_objects_name ON storage.objects(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_objects_bucket_name ON storage.objects(bucket_id, name);

-- Grants für Storage Schema
GRANT USAGE ON SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated, service_role;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pgjwt";

-- ============================================
-- BRAINSTUDIO SCHEMA
-- ============================================
-- Hier können später Tabellen für das Dashboard
-- hinzugefügt werden
-- ============================================

CREATE SCHEMA IF NOT EXISTS brainstudio;

-- Sequence für Prozess ID
CREATE SEQUENCE IF NOT EXISTS brainstudio.processes_process_id_seq START 1000;

-- Haupttabelle: Prozesse/Workflows mit vollständiger Struktur
CREATE TABLE IF NOT EXISTS brainstudio.processes (
    -- Primäre Identifier
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    process_id INT UNIQUE NOT NULL DEFAULT nextval('brainstudio.processes_process_id_seq'),
    
    -- Basis-Informationen
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- Formular & Konfiguration
    form_configuration JSONB NOT NULL DEFAULT '{}',
    form_schema TEXT,
    
    -- Versionierung
    version INT DEFAULT 1,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Metadaten für erweiterte Informationen
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Status & Aktivität
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    is_active BOOLEAN DEFAULT true,
    
    -- Verwaltung & Auditierung
    creator_id UUID,
    execution_count INT DEFAULT 0,
    last_executed_at TIMESTAMP WITH TIME ZONE,
    
    -- Automatische Zeitstempel (von DB verwaltet)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_name CHECK (name ~ '^\S.*$')
);

-- Index für bessere Abfrageleistung
CREATE INDEX IF NOT EXISTS idx_processes_status ON brainstudio.processes(status);
CREATE INDEX IF NOT EXISTS idx_processes_category ON brainstudio.processes(category);
CREATE INDEX IF NOT EXISTS idx_processes_is_active ON brainstudio.processes(is_active);
CREATE INDEX IF NOT EXISTS idx_processes_process_id ON brainstudio.processes(process_id);
CREATE INDEX IF NOT EXISTS idx_processes_created_at ON brainstudio.processes(created_at);

-- Trigger für updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION brainstudio.update_processes_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS processes_update_timestamp ON brainstudio.processes;
CREATE TRIGGER processes_update_timestamp
    BEFORE UPDATE ON brainstudio.processes
    FOR EACH ROW
    EXECUTE FUNCTION brainstudio.update_processes_timestamp();

-- Kommentar für Dokumentation
COMMENT ON TABLE brainstudio.processes IS 'Zentrale Tabelle für alle Prozesse und Workflows im BrainTestStudio';
COMMENT ON COLUMN brainstudio.processes.process_id IS 'Menschenlesbare eindeutige Prozess-ID (z.B. 1000, 1001, ...)';
COMMENT ON COLUMN brainstudio.processes.form_configuration IS 'JSON-Konfiguration des Formulars mit allen Feldern und Validierungsregeln';
COMMENT ON COLUMN brainstudio.processes.form_schema IS 'Optional: Kompletter Quellcode oder Schema als Text (z.B. für UI-Generator)';
COMMENT ON COLUMN brainstudio.processes.metadata IS 'Flexible JSON-Struktur für zusätzliche, benutzerdefinierte Daten';
COMMENT ON COLUMN brainstudio.processes.execution_count IS 'Zähler für Prozessausführungen (für Statistiken und Monitoring)';
COMMENT ON COLUMN brainstudio.processes.last_executed_at IS 'Zeitstempel der letzten erfolgreichen Ausführung';

-- Beispiel-Tabelle für Workflows (später zu erweitern)
CREATE TABLE IF NOT EXISTS brainstudio.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Rollen-Tabelle (z.B. Admin, Editor, Viewer)
CREATE TABLE IF NOT EXISTS brainstudio.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Benutzer-Tabelle
CREATE TABLE IF NOT EXISTS brainstudio.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255),
    role_id UUID REFERENCES brainstudio.roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Benutzer-Prozess Zuordnung (Wer kann welche Prozesse sehen/ausführen)
CREATE TABLE IF NOT EXISTS brainstudio.user_process_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES brainstudio.users(id) ON DELETE CASCADE,
    process_id INT NOT NULL REFERENCES brainstudio.processes(process_id) ON DELETE CASCADE,
    access_level VARCHAR(50) DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'execute', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, process_id)
);

-- Beispiel-Tabelle für Feedback (später zu erweitern)
CREATE TABLE IF NOT EXISTS brainstudio.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES brainstudio.workflows(id),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index für Benutzer-Zugriff
CREATE INDEX IF NOT EXISTS idx_users_email ON brainstudio.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON brainstudio.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON brainstudio.users(role_id);
CREATE INDEX IF NOT EXISTS idx_user_process_access_user_id ON brainstudio.user_process_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_process_access_process_id ON brainstudio.user_process_access(process_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON brainstudio.roles(name);

-- Trigger für updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION brainstudio.update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_update_timestamp ON brainstudio.users;
CREATE TRIGGER users_update_timestamp
    BEFORE UPDATE ON brainstudio.users
    FOR EACH ROW
    EXECUTE FUNCTION brainstudio.update_users_timestamp();

CREATE OR REPLACE FUNCTION brainstudio.update_roles_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS roles_update_timestamp ON brainstudio.roles;
CREATE TRIGGER roles_update_timestamp
    BEFORE UPDATE ON brainstudio.roles
    FOR EACH ROW
    EXECUTE FUNCTION brainstudio.update_roles_timestamp();

-- Standard-Rollen erstellen (falls noch nicht vorhanden)
INSERT INTO brainstudio.roles (name, description, permissions) VALUES
    ('admin', 'Administrator mit vollständiger Kontrolle', ARRAY['create_process', 'edit_process', 'delete_process', 'manage_users', 'manage_roles', 'view_process']),
    ('editor', 'Editor kann Prozesse erstellen und bearbeiten', ARRAY['create_process', 'edit_process', 'view_process']),
    ('viewer', 'Viewer kann nur Prozesse anschauen', ARRAY['view_process'])
ON CONFLICT (name) DO NOTHING;

-- Row Level Security aktivieren
ALTER TABLE brainstudio.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.user_process_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ALLOW-ALL POLICIES (für Testing/Debugging)
-- ============================================
-- Im Debug-Modus werden alle Daten angezeigt
-- Later: Restrict based on actual permissions

-- Prozess Policies (erlauben alles für jetzt)
DROP POLICY IF EXISTS "Allow public read access" ON brainstudio.processes;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON brainstudio.processes;
DROP POLICY IF EXISTS "Allow creators to update" ON brainstudio.processes;

CREATE POLICY "Allow all read on processes" ON brainstudio.processes
    FOR SELECT USING (true);

CREATE POLICY "Allow all insert on processes" ON brainstudio.processes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on processes" ON brainstudio.processes
    FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on processes" ON brainstudio.processes
    FOR DELETE USING (true);

-- Benutzer Policies (erlauben alles für jetzt)
CREATE POLICY "Allow all read on users" ON brainstudio.users
    FOR SELECT USING (true);

CREATE POLICY "Allow all insert on users" ON brainstudio.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on users" ON brainstudio.users
    FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on users" ON brainstudio.users
    FOR DELETE USING (true);

-- Rollen Policies (erlauben alles für jetzt)
CREATE POLICY "Allow all read on roles" ON brainstudio.roles
    FOR SELECT USING (true);

CREATE POLICY "Allow all insert on roles" ON brainstudio.roles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on roles" ON brainstudio.roles
    FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on roles" ON brainstudio.roles
    FOR DELETE USING (true);

-- User Process Access Policies (erlauben alles für jetzt)
CREATE POLICY "Allow all read on user_process_access" ON brainstudio.user_process_access
    FOR SELECT USING (true);

CREATE POLICY "Allow all insert on user_process_access" ON brainstudio.user_process_access
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all update on user_process_access" ON brainstudio.user_process_access
    FOR UPDATE USING (true);

CREATE POLICY "Allow all delete on user_process_access" ON brainstudio.user_process_access
    FOR DELETE USING (true);

-- Workflows & Feedback (erlauben alles)
CREATE POLICY "Allow public read access" ON brainstudio.workflows
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON brainstudio.feedback
    FOR SELECT USING (true);

-- Grants für API-Zugriff
GRANT USAGE ON SCHEMA brainstudio TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA brainstudio TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA brainstudio TO anon, authenticated, service_role;

COMMENT ON SCHEMA brainstudio IS 'BrainTestStudio Dashboard Schema';

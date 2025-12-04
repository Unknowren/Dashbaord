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

-- Beispiel-Tabelle für Feedback (später zu erweitern)
CREATE TABLE IF NOT EXISTS brainstudio.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES brainstudio.workflows(id),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security aktivieren
ALTER TABLE brainstudio.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.feedback ENABLE ROW LEVEL SECURITY;

-- Policies für Prozess-Tabelle
CREATE POLICY "Allow public read access" ON brainstudio.processes
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert" ON brainstudio.processes
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR true);

CREATE POLICY "Allow creators to update" ON brainstudio.processes
    FOR UPDATE USING (creator_id = auth.uid() OR true);

-- Öffentlicher Lesezugriff (später durch Auth einschränken)
CREATE POLICY "Allow public read access" ON brainstudio.workflows
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON brainstudio.feedback
    FOR SELECT USING (true);

-- Grants für API-Zugriff
GRANT USAGE ON SCHEMA brainstudio TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA brainstudio TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA brainstudio TO anon, authenticated, service_role;

COMMENT ON SCHEMA brainstudio IS 'BrainTestStudio Dashboard Schema';

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
ALTER TABLE brainstudio.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE brainstudio.feedback ENABLE ROW LEVEL SECURITY;

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

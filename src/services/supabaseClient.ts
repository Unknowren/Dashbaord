/**
 * Supabase Client Konfiguration
 * ==============================
 * Zentrale Verbindung zur Supabase/PostgreSQL Datenbank
 *
 * Verwendet Umgebungsvariablen aus .env:
 * - VITE_SUPABASE_URL: API Gateway URL (Kong auf Port 8000)
 * - VITE_SUPABASE_ANON_KEY: Anonymer API Key für öffentliche Zugriffe
 */

import { createClient } from "@supabase/supabase-js";

// Dynamische URL basierend auf aktuellem Host (für Mobile-Zugriff)
const getSupabaseUrl = () => {
  // Wenn env Variable gesetzt, diese verwenden
  if (import.meta.env.VITE_SUPABASE_URL) {
    return import.meta.env.VITE_SUPABASE_URL;
  }

  // Für lokale Entwicklung: gleicher Host wie Frontend, aber Port 8000
  const currentHost = window.location.hostname;
  return `http://${currentHost}:8000`;
};

const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzMzMzU2ODAwLCJleHAiOjE4OTExMjMyMDB9.1oGZGdGXbZKoGD9bCEleJSL75v_J-bPnkzjM490vcTk";

// URL und Key laden
const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Debug-Logging
console.log("🔗 Supabase URL:", supabaseUrl);

// Supabase Client erstellen mit brainstudio Schema
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "brainstudio",
  },
  auth: {
    persistSession: false,
  },
  global: {
    headers: {
      "Content-Profile": "brainstudio",
      "Accept-Profile": "brainstudio",
    },
  },
});

export { supabase };
export default supabase;

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

// Fallback-Werte für lokale Entwicklung
const DEFAULT_URL = "http://localhost:8000";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzMzMzU2ODAwLCJleHAiOjE4OTExMjMyMDB9.1oGZGdGXbZKoGD9bCEleJSL75v_J-bPnkzjM490vcTk";

// Umgebungsvariablen laden mit Fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

// Debug-Logging
if (import.meta.env.DEV) {
  console.log("🔗 Supabase URL:", supabaseUrl);
  console.log("🔑 Using", import.meta.env.VITE_SUPABASE_ANON_KEY ? "env key" : "default key");
}

// Supabase Client erstellen mit brainstudio Schema
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "brainstudio",
  },
  auth: {
    persistSession: false,
  },
});

export { supabase };
export default supabase;

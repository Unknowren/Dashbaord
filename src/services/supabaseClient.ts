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

// Umgebungsvariablen laden
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "http://localhost:8000";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Warnung wenn Key fehlt
if (!supabaseAnonKey) {
  console.warn("⚠️ VITE_SUPABASE_ANON_KEY ist nicht gesetzt!");
}

// Supabase Client erstellen
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: "brainstudio", // Unser Schema
  },
  auth: {
    persistSession: false, // Keine Session-Persistenz für jetzt
  },
});

// Debug-Logging
if (import.meta.env.VITE_DEBUG === "true") {
  console.log("🔗 Supabase verbunden:", supabaseUrl);
}

export default supabase;

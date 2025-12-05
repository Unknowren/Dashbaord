/**
 * Settings Service
 * =================
 * Verwaltung von Benutzereinstellungen in der Datenbank
 */

import supabase from "./supabaseClient";

// TypeScript Interface für Standardfilter
export interface DefaultWorkflowFilters {
  statuses: string[];
  categories: string[];
}

export interface UserSetting {
  id?: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Einstellung nach Key laden
 */
export async function getSetting<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from("user_settings")
    .select("setting_value")
    .eq("setting_key", key)
    .single();

  if (error) {
    console.error(`❌ Fehler beim Laden der Einstellung '${key}':`, error);
    return null;
  }

  return data?.setting_value as T;
}

/**
 * Einstellung speichern/aktualisieren
 */
export async function saveSetting<T>(key: string, value: T): Promise<boolean> {
  // Erst die aktuelle ID holen
  const { data: existing } = await supabase
    .from("user_settings")
    .select("id")
    .eq("setting_key", key)
    .single();

  if (!existing) {
    console.error(`❌ Einstellung '${key}' nicht gefunden`);
    return false;
  }

  // Dann mit ID updaten
  const { error } = await supabase
    .from("user_settings")
    .update({ 
      setting_value: value as Record<string, unknown>,
      updated_at: new Date().toISOString()
    })
    .eq("id", existing.id);

  if (error) {
    console.error(`❌ Fehler beim Speichern der Einstellung '${key}':`, error);
    return false;
  }

  console.log(`✅ Einstellung '${key}' gespeichert:`, value);
  return true;
}

/**
 * Standardfilter für Workflows laden
 */
export async function getDefaultWorkflowFilters(): Promise<DefaultWorkflowFilters> {
  const filters = await getSetting<DefaultWorkflowFilters>("default_workflow_filters");
  return filters || { statuses: [], categories: [] };
}

/**
 * Standardfilter für Workflows speichern
 */
export async function saveDefaultWorkflowFilters(filters: DefaultWorkflowFilters): Promise<boolean> {
  return saveSetting("default_workflow_filters", filters);
}

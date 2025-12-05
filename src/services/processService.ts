/**
 * Prozesse Service
 * =================
 * CRUD-Operationen für die brainstudio.processes Tabelle
 */

import supabase from "./supabaseClient";

// TypeScript Interface für Prozess
export interface Process {
  id?: string;
  process_id?: number;
  name: string;
  description?: string;
  category?: string;
  status: "draft" | "active" | "paused" | "archived";
  is_active?: boolean;
  form_configuration?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  tags?: string[];
  version?: number;
  execution_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Alle Prozesse laden
 */
export async function getProcesses(): Promise<Process[]> {
  const { data, error } = await supabase
    .from("processes")
    .select("*")
    .order("process_id", { ascending: true });

  if (error) {
    console.error("❌ Fehler beim Laden der Prozesse:", error);
    throw error;
  }

  return data || [];
}

/**
 * Prozesse durchsuchen (nach Name, Beschreibung, Kategorie)
 */
export async function searchProcesses(query: string): Promise<Process[]> {
  if (!query.trim()) {
    return getProcesses();
  }

  const { data, error } = await supabase
    .from("processes")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .order("process_id", { ascending: true });

  if (error) {
    console.error("❌ Fehler bei der Suche:", error);
    throw error;
  }

  return data || [];
}

/**
 * Einzelnen Prozess laden
 */
export async function getProcess(processId: number): Promise<Process | null> {
  const { data, error } = await supabase
    .from("processes")
    .select("*")
    .eq("process_id", processId)
    .single();

  if (error) {
    console.error("❌ Fehler beim Laden des Prozesses:", error);
    throw error;
  }

  return data;
}

/**
 * Neuen Prozess erstellen
 */
export async function createProcess(process: Omit<Process, "id" | "process_id" | "created_at" | "updated_at">): Promise<Process> {
  const { data, error } = await supabase
    .from("processes")
    .insert(process)
    .select()
    .single();

  if (error) {
    console.error("❌ Fehler beim Erstellen des Prozesses:", error);
    throw error;
  }

  return data;
}

/**
 * Prozess aktualisieren
 */
export async function updateProcess(processId: number, updates: Partial<Process>): Promise<Process> {
  const { data, error } = await supabase
    .from("processes")
    .update(updates)
    .eq("process_id", processId)
    .select()
    .single();

  if (error) {
    console.error("❌ Fehler beim Aktualisieren des Prozesses:", error);
    throw error;
  }

  return data;
}

/**
 * Prozess löschen
 */
export async function deleteProcess(processId: number): Promise<void> {
  const { error } = await supabase
    .from("processes")
    .delete()
    .eq("process_id", processId);

  if (error) {
    console.error("❌ Fehler beim Löschen des Prozesses:", error);
    throw error;
  }
}

/**
 * Benutzer & Rollen Service
 * ==========================
 * CRUD-Operationen für brainstudio.users und brainstudio.roles
 */

import supabase from "./supabaseClient";

// ==================== INTERFACES ====================

export interface Role {
  id?: string;
  name: string;
  description?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id?: string;
  email: string;
  display_name?: string;
  role_id?: string;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  // Joined data
  role?: Role;
}

// ==================== ROLLEN ====================

/**
 * Alle Rollen laden
 */
export async function getRoles(): Promise<Role[]> {
  const { data, error } = await supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("❌ Fehler beim Laden der Rollen:", error);
    throw error;
  }

  return data || [];
}

/**
 * Neue Rolle erstellen
 */
export async function createRole(
  role: Omit<Role, "id" | "created_at" | "updated_at">
): Promise<Role> {
  const { data, error } = await supabase
    .from("roles")
    .insert(role)
    .select()
    .single();

  if (error) {
    console.error("❌ Fehler beim Erstellen der Rolle:", error);
    throw error;
  }

  return data;
}

/**
 * Rolle aktualisieren
 */
export async function updateRole(
  roleId: string,
  updates: Partial<Role>
): Promise<Role> {
  const { data, error } = await supabase
    .from("roles")
    .update(updates)
    .eq("id", roleId)
    .select()
    .single();

  if (error) {
    console.error("❌ Fehler beim Aktualisieren der Rolle:", error);
    throw error;
  }

  return data;
}

/**
 * Rolle löschen
 */
export async function deleteRole(roleId: string): Promise<void> {
  const { error } = await supabase.from("roles").delete().eq("id", roleId);

  if (error) {
    console.error("❌ Fehler beim Löschen der Rolle:", error);
    throw error;
  }
}

// ==================== BENUTZER ====================

/**
 * Alle Benutzer laden (mit Rollen-Info)
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      role:roles(*)
    `
    )
    .order("display_name", { ascending: true });

  if (error) {
    console.error("❌ Fehler beim Laden der Benutzer:", error);
    throw error;
  }

  return data || [];
}

/**
 * Benutzer durchsuchen
 */
export async function searchUsers(query: string): Promise<User[]> {
  if (!query.trim()) {
    return getUsers();
  }

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      role:roles(*)
    `
    )
    .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
    .order("display_name", { ascending: true });

  if (error) {
    console.error("❌ Fehler bei der Benutzersuche:", error);
    throw error;
  }

  return data || [];
}

/**
 * Neuen Benutzer erstellen
 */
export async function createUser(
  user: Omit<User, "id" | "created_at" | "updated_at" | "role">
): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();

  if (error) {
    console.error("❌ Fehler beim Erstellen des Benutzers:", error);
    throw error;
  }

  return data;
}

/**
 * Benutzer aktualisieren
 */
export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User> {
  // Role entfernen falls vorhanden (ist ein Join, kein echtes Feld)
  const { role, ...cleanUpdates } = updates;

  const { data, error } = await supabase
    .from("users")
    .update(cleanUpdates)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("❌ Fehler beim Aktualisieren des Benutzers:", error);
    throw error;
  }

  return data;
}

/**
 * Benutzer löschen
 */
export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", userId);

  if (error) {
    console.error("❌ Fehler beim Löschen des Benutzers:", error);
    throw error;
  }
}

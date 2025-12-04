/**
 * Supabase Client Service
 * Zentrale Stelle für alle Supabase-Operationen
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { configService } from './configService';

// Supabase Client initialisieren
let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = configService.getSupabaseUrl();
    const supabaseAnonKey = configService.getSupabaseAnonKey();

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL oder Anon Key nicht konfiguriert');
      throw new Error('Supabase credentials missing');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

/**
 * Typen für Datenbankoperationen
 */
export interface ProcessRow {
  id: string;
  process_id: number;
  name: string;
  description: string | null;
  category: string | null;
  form_configuration: Record<string, any>;
  form_schema: string | null;
  version: number;
  tags: string[];
  metadata: Record<string, any>;
  status: 'draft' | 'active' | 'paused' | 'archived';
  is_active: boolean;
  creator_id: string | null;
  execution_count: number;
  last_executed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role_id: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Prozess-Operationen
 */
export const processOperations = {
  async getAllProcesses() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('processes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as ProcessRow[];
    } catch (err) {
      console.error('Fehler beim Laden von Prozessen:', err);
      return [];
    }
  },

  async getProcessById(processId: number) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('processes')
        .select('*')
        .eq('process_id', processId)
        .single();

      if (error) throw error;
      return data as ProcessRow;
    } catch (err) {
      console.error('Fehler beim Laden des Prozesses:', err);
      throw err;
    }
  },

  async createProcess(process: Omit<ProcessRow, 'id' | 'process_id' | 'created_at' | 'updated_at'>) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('processes')
        .insert([process])
        .select();

      if (error) throw error;
      return data?.[0] as ProcessRow;
    } catch (err) {
      console.error('Fehler beim Erstellen des Prozesses:', err);
      throw err;
    }
  },

  async updateProcess(processId: number, updates: Partial<ProcessRow>) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('processes')
        .update(updates)
        .eq('process_id', processId)
        .select();

      if (error) throw error;
      return data?.[0] as ProcessRow;
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Prozesses:', err);
      throw err;
    }
  },

  async deleteProcess(processId: number) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('processes')
        .delete()
        .eq('process_id', processId);

      if (error) throw error;
    } catch (err) {
      console.error('Fehler beim Löschen des Prozesses:', err);
      throw err;
    }
  },
};

/**
 * Benutzer-Operationen
 */
export const userOperations = {
  async getAllUsers() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as UserRow[];
    } catch (err) {
      console.error('Fehler beim Laden von Benutzern:', err);
      return [];
    }
  },

  async getUserById(userId: string) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserRow;
    } catch (err) {
      console.error('Fehler beim Laden des Benutzers:', err);
      throw err;
    }
  },

  async createUser(user: Omit<UserRow, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .insert([user])
        .select();

      if (error) throw error;
      return data?.[0] as UserRow;
    } catch (err) {
      console.error('Fehler beim Erstellen des Benutzers:', err);
      throw err;
    }
  },

  async updateUser(userId: string, updates: Partial<UserRow>) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select();

      if (error) throw error;
      return data?.[0] as UserRow;
    } catch (err) {
      console.error('Fehler beim Aktualisieren des Benutzers:', err);
      throw err;
    }
  },

  async deleteUser(userId: string) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
    } catch (err) {
      console.error('Fehler beim Löschen des Benutzers:', err);
      throw err;
    }
  },
};

/**
 * Rollen-Operationen
 */
export const roleOperations = {
  async getAllRoles() {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RoleRow[];
    } catch (err) {
      console.error('Fehler beim Laden von Rollen:', err);
      return [];
    }
  },

  async getRoleById(roleId: string) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('roles')
        .select('*')
        .eq('id', roleId)
        .single();

      if (error) throw error;
      return data as RoleRow;
    } catch (err) {
      console.error('Fehler beim Laden der Rolle:', err);
      throw err;
    }
  },

  async createRole(role: Omit<RoleRow, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('roles')
        .insert([role])
        .select();

      if (error) throw error;
      return data?.[0] as RoleRow;
    } catch (err) {
      console.error('Fehler beim Erstellen der Rolle:', err);
      throw err;
    }
  },

  async updateRole(roleId: string, updates: Partial<RoleRow>) {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('roles')
        .update(updates)
        .eq('id', roleId)
        .select();

      if (error) throw error;
      return data?.[0] as RoleRow;
    } catch (err) {
      console.error('Fehler beim Aktualisieren der Rolle:', err);
      throw err;
    }
  },

  async deleteRole(roleId: string) {
    try {
      const client = getSupabaseClient();
      const { error } = await client
        .from('roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    } catch (err) {
      console.error('Fehler beim Löschen der Rolle:', err);
      throw err;
    }
  },
};

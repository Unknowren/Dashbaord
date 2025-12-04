/**
 * Supabase Client Service
 * Zentrale Stelle für alle Supabase-Operationen
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as ProcessRow[];
  },

  async getProcessById(processId: number) {
    const { data, error } = await supabase
      .from('processes')
      .select('*')
      .eq('process_id', processId)
      .single();

    if (error) throw error;
    return data as ProcessRow;
  },

  async createProcess(process: Omit<ProcessRow, 'id' | 'process_id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('processes')
      .insert([process])
      .select();

    if (error) throw error;
    return data[0] as ProcessRow;
  },

  async updateProcess(processId: number, updates: Partial<ProcessRow>) {
    const { data, error } = await supabase
      .from('processes')
      .update(updates)
      .eq('process_id', processId)
      .select();

    if (error) throw error;
    return data[0] as ProcessRow;
  },

  async deleteProcess(processId: number) {
    const { error } = await supabase
      .from('processes')
      .delete()
      .eq('process_id', processId);

    if (error) throw error;
  },
};

/**
 * Benutzer-Operationen
 */
export const userOperations = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as UserRow[];
  },

  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as UserRow;
  },

  async createUser(user: Omit<UserRow, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select();

    if (error) throw error;
    return data[0] as UserRow;
  },

  async updateUser(userId: string, updates: Partial<UserRow>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();

    if (error) throw error;
    return data[0] as UserRow;
  },

  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
  },
};

/**
 * Rollen-Operationen
 */
export const roleOperations = {
  async getAllRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RoleRow[];
  },

  async getRoleById(roleId: string) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error) throw error;
    return data as RoleRow;
  },

  async createRole(role: Omit<RoleRow, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('roles')
      .insert([role])
      .select();

    if (error) throw error;
    return data[0] as RoleRow;
  },

  async updateRole(roleId: string, updates: Partial<RoleRow>) {
    const { data, error } = await supabase
      .from('roles')
      .update(updates)
      .eq('id', roleId)
      .select();

    if (error) throw error;
    return data[0] as RoleRow;
  },

  async deleteRole(roleId: string) {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) throw error;
  },
};

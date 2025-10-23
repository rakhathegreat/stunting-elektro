import type { Parent } from '../types/parent';
import { supabase } from '../lib/supabase/client';

export const getParents = async (): Promise<Parent[]> => {
  const { data, error } = await supabase.from('DataOrangTua').select('*').order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getParentById = async (id: string | number): Promise<Parent | null> => {
  const { data, error } = await supabase.from('DataOrangTua').select('*').eq('id', id).single();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};

export const createParent = async (payload: Record<string, unknown>) => {
  const { error } = await supabase.from('DataOrangTua').insert([payload]);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateParent = async (id: string | number, payload: Partial<Parent>) => {
  const { error } = await supabase.from('DataOrangTua').update(payload).eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteParent = async (id: string | number) => {
  const { error } = await supabase.from('DataOrangTua').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

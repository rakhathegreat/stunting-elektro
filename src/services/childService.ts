import type { Child } from '../types/children';
import { supabase } from '../lib/supabase/client';

export const getChildren = async (): Promise<Child[]> => {
  const { data, error } = await supabase
    .from('DataAnak')
    .select(`*, DataOrangTua(nama_ayah, nama_ibu, id)`)
    .neq('nama', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const deleteChild = async (id: string | number) => {
  const { error } = await supabase.from('DataAnak').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const updateChild = async (id: string | number, payload: Partial<Child>) => {
  const { error } = await supabase.from('DataAnak').update(payload).eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

export const createChild = async (payload: Partial<Child>) => {
  const { error } = await supabase.from('DataAnak').insert([payload]);

  if (error) {
    throw new Error(error.message);
  }
};

export const getChildrenByParent = async (parentId: string | number): Promise<Child[]> => {
  const { data, error } = await supabase.from('DataAnak').select('*').eq('id_orang_tua', parentId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const getChildById = async (id: string | number): Promise<Child | null> => {
  const { data, error } = await supabase
    .from('DataAnak')
    .select('*, DataOrangTua(id, nama_ayah, nama_ibu)')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
};

export const getPendingChildren = async (): Promise<Child[]> => {
  const { data, error } = await supabase
    .from('DataAnak')
    .select('*')
    .or("nama.is.null,nama.eq.''")
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

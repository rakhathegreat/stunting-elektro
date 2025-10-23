import type { Examination } from '../types/examination';
import { supabase } from '../lib/supabase/client';

export const getExaminations = async (): Promise<Examination[]> => {
  const { data, error } = await supabase
    .from('DataPemeriksaan')
    .select(`*, DataAnak(id, nama, gender, umur), DataOrangTua(id, nama_ayah, nama_ibu)`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

export const createExamination = async (payload: Partial<Examination>) => {
  const { error } = await supabase.from('DataPemeriksaan').insert([payload]);

  if (error) {
    throw new Error(error.message);
  }
};

export const deleteExamination = async (id: string | number) => {
  const { error } = await supabase.from('Analisis').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
};

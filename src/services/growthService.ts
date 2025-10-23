import type { GrowthRecord } from '../types/growth';
import { supabase } from '../lib/supabase/client';

export const getGrowthRecordsByChild = async (childId: string | number): Promise<GrowthRecord[]> => {
  const { data, error } = await supabase
    .from('Analisis')
    .select('*')
    .eq('id_anak', childId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
};

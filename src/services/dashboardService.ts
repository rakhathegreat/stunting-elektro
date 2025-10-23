import { supabase } from '../lib/supabase/client';

export interface DashboardCounts {
  parents: number;
  babies: number;
  checkups: number;
}

export interface AnalysisRow {
  status_tinggi: string | null;
  status_berat: string | null;
  id_anak: {
    gender: string;
  };
}

export const getDashboardCounts = async (): Promise<DashboardCounts> => {
  const [{ count: parents }, { count: babies }, { count: checkups }] = await Promise.all([
    supabase.from('DataOrangTua').select('*', { count: 'exact', head: true }),
    supabase.from('DataAnak').select('*', { count: 'exact', head: true }),
    supabase.from('Analisis').select('*', { count: 'exact', head: true }),
  ]);

  return {
    parents: parents ?? 0,
    babies: babies ?? 0,
    checkups: checkups ?? 0,
  };
};

export const getAnalysisRows = async (): Promise<AnalysisRow[]> => {
  const { data, error } = await supabase
    .from('Analisis')
    .select('status_tinggi, status_berat, id_anak!inner(gender)');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as AnalysisRow[];
};

export interface MonthlyAnalysisRow {
  status_tinggi: string;
  status_berat: string;
  bulan: number;
}

export const getMonthlyAnalysis = async (): Promise<MonthlyAnalysisRow[]> => {
  const { data, error } = await supabase
    .from('Analisis')
    .select('status_tinggi, status_berat, bulan')
    .order('bulan', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MonthlyAnalysisRow[];
};

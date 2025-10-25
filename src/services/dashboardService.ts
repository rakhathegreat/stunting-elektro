import { supabase } from '../lib/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';

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
  const today = new Date();

  const start = startOfDay(today).toISOString();
  const end = endOfDay(today).toISOString();
  
  const [{ count: parents }, { count: babies }, { count: checkups }] = await Promise.all([
    supabase.from('DataOrangTua').select('*', { count: 'exact', head: true }),
    supabase.from('DataAnak').select('*', { count: 'exact', head: true }),
    supabase.from('Analisis').select('*', { count: 'exact', head: true }).gte('created_at', start).lt('created_at', end),
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
  status_tinggi: string | null;
  status_berat: string | null;
  created_at: string;
}

export const getMonthlyAnalysis = async (): Promise<MonthlyAnalysisRow[]> => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();

  const { data, error } = await supabase
    .from('Analisis')
    .select('status_tinggi, status_berat, created_at')
    .gte('created_at', startOfYear)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as MonthlyAnalysisRow[];
};

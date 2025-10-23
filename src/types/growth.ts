export interface GrowthRecord {
  id: string | number;
  created_at: string;
  bulan: number;
  tinggi: number | null;
  berat: number | null;
  status_tinggi: string | null;
  status_berat: string | null;
  gender?: string;
  catatan?: string | null;
}

export interface Examination {
  id: string;
  status_tinggi: string;
  status_berat: string;
  created_at: string;
  DataAnak?: {
    id: string;
    nama: string;
    gender: string;
    umur: number;
  } | null;
  DataOrangTua?: {
    id: string;
    nama_ayah: string;
    nama_ibu: string;
  } | null;
}

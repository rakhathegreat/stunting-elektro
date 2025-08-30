// import type { Vaccination } from "./vaccination";
import type {Parent} from "./parent"

export interface Child {
    id_anak: any;
    status_tinggi: string;
    status_berat: string;
    id?: number;
    nama: string;
    tanggal_lahir: string;
    gender: string;
    umur: number;
    updated_at: string;
    id_orang_tua?: string;
    DataOrangTua?: Parent;
    created_at: string;
    catatan?: string;
    alergi?: string;
}

export interface EditChildProps {
    nama: string;
    tanggal_lahir: string;
    gender: string;
    umur: number;
    id_orang_tua: string;
}
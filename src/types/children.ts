// import type { Vaccination } from "./vaccination";
import type {Parent} from "./parent"

export interface Child {
    status_tinggi: string;
    status_tinggi: string;
    status_berat: string;
    id?: number;
    nama: string;
    tanggal_lahir: string;
    gender: string;
    umur: number;
    updated_at: string;
    status: string;
    id_orang_tua?: Parent;
    created_at: string;
}

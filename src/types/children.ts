import type { Vaccination } from "./vaccination";
import type {Parent} from "./parent"

export interface Child {
    id: number;
    name: string;
    gender: string;
    birthDate: string;
    age: string;
    parentName?: string;
    status: string;
    statusColor: string;
    registrationDate: string;
    birthWeight: number;
    birthHeight: number;
    notes: string;
    allergies: string;
    vaccinations: Vaccination[];
    id_orang_tua?: Parent;
    created_at: string;
    updated_at: string;
}
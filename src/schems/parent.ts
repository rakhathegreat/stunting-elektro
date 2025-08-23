import { z } from "zod"


export const parentSchema = z.object({
    nama_ayah: z.string(),
    nama_ibu: z.string(),
    tanggal_lahir_ayah: z.date(),
    tanggal_lahir_ibu: z.date(),
    no_hp: z.string(),
    email: z.email(),
    alamat: z.string(),
    pekerjaan: z.string(),
    pendidikan: z.string(),
});
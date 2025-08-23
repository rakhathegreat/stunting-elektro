import { z } from "zod"

export const childrenSchema = z.object({
    nama: z.string().min(1, "Nama wajib diisi"),
    tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
    gender: z.string().min(1, "Gender wajib diisi"),
    umur: z.number().min(0, "Umur wajib diisi").optional(),
    id_orang_tua: z.string().min(1, "Orang tua wajib diisi"),
});
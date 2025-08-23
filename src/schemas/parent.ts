import { z } from "zod"


export const parentSchema = z.object({
    nama_ayah: z.string()
        .min(1, "Nama ayah wajib diisi")
        .min(2, "Nama ayah minimal 2 karakter"),
    nama_ibu: z.string()
        .min(1, "Nama ibu wajib diisi")
        .min(2, "Nama ibu minimal 2 karakter"),
    tanggal_lahir_ayah: z.date({
        message: "Tanggal lahir ayah wajib diisi"
    }),
    tanggal_lahir_ibu: z.date({
        message: "Tanggal lahir ibu wajib diisi"
    }),
    no_hp: z.string()
        .min(1, "Nomor HP wajib diisi")
        .min(10, "Nomor HP minimal 10 digit")
        .regex(/^[0-9\-+\s()]+$/, "Format nomor HP tidak valid"),
    email: z.string()
        .min(1, "Email wajib diisi")
        .email("Format email tidak valid"),
    alamat: z.string()
        .min(1, "Alamat wajib diisi")
        .min(10, "Alamat minimal 10 karakter"),
    pekerjaan: z.string()
        .min(1, "Pekerjaan wajib diisi")
        .min(2, "Pekerjaan minimal 2 karakter"),
    pendidikan: z.string()
        .min(1, "Pendidikan wajib dipilih"),
});
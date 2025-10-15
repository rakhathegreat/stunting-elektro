import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { EditChildProps, Child } from "../../types/children"
import { childrenSchema } from "../../schemas/children"
import { supabase } from "../../supabaseClient"
import { showError, showSuccess } from "../../utils/feedback"
import { useEffect, useState } from "react"
import type { Parent } from "../../types/parent"


interface IProps {
    child: Child
    updateBaby: (id: string) => void;
}

export default function BabyData({child, updateBaby} : IProps){
    const [parents, setParents] = useState<Parent[]>([])
    const [selectedParentId, setSelectedParentId] = useState<string>("");

    const formDefaultValue: EditChildProps = {
        nama: child?.nama || "",
        tanggal_lahir: child?.tanggal_lahir || "",
        gender: child?.gender || "",
        umur: child?.umur || 0,
        id_orang_tua: (child?.id_orang_tua)?.toString() || ""
    }

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(childrenSchema),
        defaultValues: formDefaultValue
    });

    const onSubmitAddChild = async (data: z.infer<typeof childrenSchema>) => {
        const payload = {
            ...data,
            id_orang_tua: Number(data.id_orang_tua as string)
        }

        try {
            const { data: returned, error } = await supabase
                .from('DataAnak')
                .update([payload])
                .eq('id', child.id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            if (returned) {
                showSuccess("Data anak berhasil diperbarui");
                updateBaby(returned.id);
            }
        } catch (error) {
            showError("Gagal memperbarui data anak", error);
        }
    }

    const onError = (error: unknown) => {
        showError("Gagal memvalidasi data anak", error);
    }

    const fetchParents = async() => {
        try {
            const { data, error } = await supabase.from('DataOrangTua').select();
            if (error) {
                throw error;
            }
            if (data) {
                setParents(data);
            }
        } catch (error) {
            showError("Gagal memuat data orang tua", error);
        }
    }

    useEffect(() => {
        fetchParents();
        reset(formDefaultValue);
        setSelectedParentId((child?.id_orang_tua)?.toString() || "");
    },[]) //eslint-disable-line

    return (
        <div className="flex items-center justify-center p-4 z-50 backdrop-blur-xs w-full">
          <div className="bg-white rounded-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Biodata bayi</h3>
            <form onSubmit={handleSubmit(onSubmitAddChild, onError)} className="space-y-4">
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  id="nama"
                  type="text"
                  placeholder="Nama Lengkap"
                  {...register("nama")}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.nama && <p className="text-red-500 text-xs">{errors.nama.message}</p>}
              </div>
              <div>
                <label htmlFor="tanggal_lahir" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Lahir <span className="text-red-500">*</span>
                </label>
                <input
                  id="tanggal_lahir"
                  type="date"
                  placeholder="Tanggal Lahir"
                  {...register("tanggal_lahir")}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.tanggal_lahir && <p className="text-red-500 text-xs">{errors.tanggal_lahir.message}</p>}
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Kelamin <span className="text-red-500">*</span>
                </label>
                <select id="gender" {...register("gender")} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Pilih Gender</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
              </div>
              <div>
                <label htmlFor="umur" className="block text-sm font-medium text-gray-700 mb-1">
                  Umur (opsional)
                </label>
                <input
                  id="umur"
                  type="number"
                  placeholder="Umur (optional)"
                  {...register("umur", { valueAsNumber: true })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {errors.umur && <p className="text-red-500 text-xs">{errors.umur.message}</p>}
              </div>
              <div>
                <label htmlFor="id_orang_tua" className="block text-sm font-medium text-gray-700 mb-1">
                  Orang Tua <span className="text-red-500">*</span>
                </label>
                <select id="id_orang_tua" {...register("id_orang_tua")} className="w-full px-3 py-2 border rounded-lg" value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)}>
                  <option value="">Pilih Orang Tua</option>
                  {parents.map((parent) => (
                    <option key={parent.id} value={parent.id} >
                      {parent.nama_ayah} & {parent.nama_ibu}
                    </option>
                  ))}
                </select>
                {errors.id_orang_tua && <p className="text-red-500 text-xs">{errors.id_orang_tua.message}</p>}
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
        )
}
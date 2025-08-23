import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { EditChildProps, Child } from "../../../types/children"
import { childrenSchema } from "../../../schemas/children"
import { supabase } from "../../../supabaseClient"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import type { Parent } from "../../../types/parent"


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
        status: child?.status || "",
        id_orang_tua: (child?.id_orang_tua?.id)?.toString() || ""
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
        console.log(payload)
        const {data: returned, error} = await supabase.from('DataAnak').update([payload]).eq('id', child.id).select().single();

        if(error){
            toast.error("Gagal menambahkan data anak");
            console.log(error);
            return;
        } else {
            if(returned){
                toast.success("Data anak berhasil diperbarui");
                updateBaby(returned.id);
            }
        }
    }

    const onError = (error: unknown) => {
        console.log(error);
        toast.error("Gagal menambahkan data anak");
    }

    const fetchParents = async() => {
        const {data, error} = await supabase.from('DataOrangTua').select();
        if(error){
            console.log(error);
            return;
        }
        if(data){
            setParents(data);
        }
    }

    useEffect(() => {
        fetchParents();
        reset(formDefaultValue);
        setSelectedParentId((child?.id_orang_tua?.id)?.toString() || "");
    },[]) //eslint-disable-line

    return (
        <div className="flex items-center justify-center p-4 z-50 backdrop-blur-xs w-full">
          <div className="bg-white rounded-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Biodata bayi</h3>
            <form onSubmit={handleSubmit(onSubmitAddChild, onError)} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                {...register("nama")}
                className="w-full px-3 py-2 border rounded-lg"
              />
              {errors.nama && <p className="text-red-500 text-xs">{errors.nama.message}</p>}
              <input
                type="date"
                placeholder="Tanggal Lahir"
                {...register("tanggal_lahir")}
                className="w-full px-3 py-2 border rounded-lg"
              />
              {errors.tanggal_lahir && <p className="text-red-500 text-xs">{errors.tanggal_lahir.message}</p>}
              <select {...register("gender")} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Pilih Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
              <input
                type="number"
                placeholder="Umur (optional)"
                {...register("umur", { valueAsNumber: true })}
                className="w-full px-3 py-2 border rounded-lg"
              />
              {errors.umur && <p className="text-red-500 text-xs">{errors.umur.message}</p>}
              <select {...register("id_orang_tua")} className="w-full px-3 py-2 border rounded-lg" value={selectedParentId} onChange={(e) => setSelectedParentId(e.target.value)}>
                <option value="">Pilih Orang Tua</option>
                {parents.map((parent) => (
                  <option key={parent.id} value={parent.id} >
                    {parent.nama_ayah} & {parent.nama_ibu}
                  </option>
                ))}
              </select>
              {errors.id_orang_tua && <p className="text-red-500 text-xs">{errors.id_orang_tua.message}</p>}
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
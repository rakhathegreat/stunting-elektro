import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { Child, EditChildProps } from '../../types/children';
import type { Parent } from '../../types/parent';
import { childrenSchema } from '../../schemas/children';
import { getParents } from '../../services/parentService';
import { updateChild } from '../../services/childService';

interface Props {
  child: Child;
  onClose: () => void;
}

export default function BabyData({ child, onClose }: Props) {
  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const formDefaultValue: EditChildProps = {
    nama: child?.nama || '',
    tanggal_lahir: child?.tanggal_lahir || '',
    gender: child?.gender || '',
    umur: child?.umur || 0,
    id_orang_tua: child?.id_orang_tua?.toString() || '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(childrenSchema),
    defaultValues: formDefaultValue,
  });

  const onSubmit = async (formData: z.infer<typeof childrenSchema>) => {
    try {
      const payload: Partial<Child> = {
        ...formData,
        id_orang_tua: formData.id_orang_tua,
      };

      const childId = child.id ?? child.id_anak;
      if (!childId) {
        throw new Error('ID anak tidak ditemukan');
      }

      await updateChild(childId, payload);
      toast.success('Data anak berhasil diperbarui');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal memperbarui data anak';
      toast.error(message);
    }
  };

  const onError = (error: unknown) => {
    console.error(error);
    toast.error('Gagal memvalidasi data anak');
  };

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const data = await getParents();
        setParents(data);
      } catch (error) {
        console.error(error);
        toast.error('Gagal memuat data orang tua');
      }
    };

    void fetchParents();
    reset(formDefaultValue);
    setSelectedParentId(child?.id_orang_tua?.toString() || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [child?.id]);

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="w-full rounded-lg bg-white">
        <h3 className="mb-6 text-lg font-medium text-gray-900">Biodata bayi</h3>
        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-4">
          <div>
            <label htmlFor="nama" className="mb-1 block text-sm font-medium text-gray-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              id="nama"
              type="text"
              placeholder="Nama Lengkap"
              {...register('nama')}
              className="w-full rounded-lg border px-3 py-2"
            />
            {errors.nama ? <p className="text-xs text-red-500">{errors.nama.message}</p> : null}
          </div>
          <div>
            <label htmlFor="tanggal_lahir" className="mb-1 block text-sm font-medium text-gray-700">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <input
              id="tanggal_lahir"
              type="date"
              placeholder="Tanggal Lahir"
              {...register('tanggal_lahir')}
              className="w-full rounded-lg border px-3 py-2"
            />
            {errors.tanggal_lahir ? <p className="text-xs text-red-500">{errors.tanggal_lahir.message}</p> : null}
          </div>
          <div>
            <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
              Jenis Kelamin <span className="text-red-500">*</span>
            </label>
            <select id="gender" {...register('gender')} className="w-full rounded-lg border px-3 py-2">
              <option value="">Pilih Gender</option>
              <option value="boys">Laki-laki</option>
              <option value="girls">Perempuan</option>
            </select>
            {errors.gender ? <p className="text-xs text-red-500">{errors.gender.message}</p> : null}
          </div>
          <div>
            <label htmlFor="umur" className="mb-1 block text-sm font-medium text-gray-700">
              Umur (opsional)
            </label>
            <input
              id="umur"
              type="number"
              placeholder="Umur (optional)"
              {...register('umur', { valueAsNumber: true })}
              className="w-full rounded-lg border px-3 py-2"
            />
            {errors.umur ? <p className="text-xs text-red-500">{errors.umur.message}</p> : null}
          </div>
          <div>
            <label htmlFor="id_orang_tua" className="mb-1 block text-sm font-medium text-gray-700">
              Orang Tua <span className="text-red-500">*</span>
            </label>
            <select
              id="id_orang_tua"
              {...register('id_orang_tua')}
              className="w-full rounded-lg border px-3 py-2"
              value={selectedParentId}
              onChange={(event) => setSelectedParentId(event.target.value)}
            >
              <option value="">Pilih Orang Tua</option>
              {parents.map((parent) => (
                <option key={parent.id} value={parent.id}>
                  {parent.nama_ayah} & {parent.nama_ibu}
                </option>
              ))}
            </select>
            {errors.id_orang_tua ? <p className="text-xs text-red-500">{errors.id_orang_tua.message}</p> : null}
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              className="rounded-lg bg-gray-200 px-4 py-2 text-sm text-gray-700"
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { parentSchema } from '../../schemas/parent';
import type { Parent } from '../../types/parent';
import { updateParent } from '../../services/parentService';

type ParentFormData = z.infer<typeof parentSchema>;

interface Props {
  parent: Parent;
  onClose: () => void;
}

const ParentData = ({ parent, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ParentFormData>({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      email: parent.email ?? '',
      no_hp: parent.no_hp ?? '',
      alamat: parent.alamat ?? '',
      nama_ayah: parent.nama_ayah ?? '',
      tanggal_lahir_ayah: parent.tanggal_lahir_ayah ? new Date(parent.tanggal_lahir_ayah).toISOString().slice(0, 10) : '',
      nama_ibu: parent.nama_ibu ?? '',
      tanggal_lahir_ibu: parent.tanggal_lahir_ibu ? new Date(parent.tanggal_lahir_ibu).toISOString().slice(0, 10) : '',
      pekerjaan: parent.pekerjaan ?? '',
      pendidikan: parent.pendidikan ?? '',
    },
  });

  useEffect(() => {
    reset({
      email: parent.email ?? '',
      no_hp: parent.no_hp ?? '',
      alamat: parent.alamat ?? '',
      nama_ayah: parent.nama_ayah ?? '',
      tanggal_lahir_ayah: parent.tanggal_lahir_ayah ? new Date(parent.tanggal_lahir_ayah).toISOString().slice(0, 10) : '',
      nama_ibu: parent.nama_ibu ?? '',
      tanggal_lahir_ibu: parent.tanggal_lahir_ibu ? new Date(parent.tanggal_lahir_ibu).toISOString().slice(0, 10) : '',
      pekerjaan: parent.pekerjaan ?? '',
      pendidikan: parent.pendidikan ?? '',
    });
  }, [parent, reset]);

  const onSubmit = async (data: ParentFormData) => {
    try {
      await updateParent(parent.id, data);
      toast.success('Data orang tua berhasil diperbarui');
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menyimpan data';
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">Informasi Kontak</h3>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="jokowi@example.com"
              />
              {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
            </div>
            <div>
              <label htmlFor="no_hp" className="mb-2 block text-sm font-medium text-gray-700">
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="no_hp"
                {...register('no_hp')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.no_hp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0834-7658-2346"
              />
              {errors.no_hp ? <p className="mt-1 text-sm text-red-600">{errors.no_hp.message}</p> : null}
            </div>
            <div>
              <label htmlFor="alamat" className="mb-2 block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                id="alamat"
                rows={3}
                {...register('alamat')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.alamat ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Solo"
              />
              {errors.alamat ? <p className="mt-1 text-sm text-red-600">{errors.alamat.message}</p> : null}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold text-gray-800">Informasi Pribadi</h3>
            <div>
              <label htmlFor="nama_ayah" className="mb-2 block text-sm font-medium text-gray-700">
                Nama Ayah
              </label>
              <input
                type="text"
                id="nama_ayah"
                {...register('nama_ayah')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.nama_ayah ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama ayah"
              />
              {errors.nama_ayah ? <p className="mt-1 text-sm text-red-600">{errors.nama_ayah.message}</p> : null}
            </div>
            <div>
              <label htmlFor="tanggal_lahir_ayah" className="mb-2 block text-sm font-medium text-gray-700">
                Tanggal Lahir Ayah
              </label>
              <input
                type="date"
                id="tanggal_lahir_ayah"
                {...register('tanggal_lahir_ayah')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.tanggal_lahir_ayah ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tanggal_lahir_ayah ? <p className="mt-1 text-sm text-red-600">{errors.tanggal_lahir_ayah.message}</p> : null}
            </div>
            <div>
              <label htmlFor="nama_ibu" className="mb-2 block text-sm font-medium text-gray-700">
                Nama Ibu
              </label>
              <input
                type="text"
                id="nama_ibu"
                {...register('nama_ibu')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.nama_ibu ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Masukkan nama ibu"
              />
              {errors.nama_ibu ? <p className="mt-1 text-sm text-red-600">{errors.nama_ibu.message}</p> : null}
            </div>
            <div>
              <label htmlFor="tanggal_lahir_ibu" className="mb-2 block text-sm font-medium text-gray-700">
                Tanggal Lahir Ibu
              </label>
              <input
                type="date"
                id="tanggal_lahir_ibu"
                {...register('tanggal_lahir_ibu')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.tanggal_lahir_ibu ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.tanggal_lahir_ibu ? <p className="mt-1 text-sm text-red-600">{errors.tanggal_lahir_ibu.message}</p> : null}
            </div>
            <div>
              <label htmlFor="pekerjaan" className="mb-2 block text-sm font-medium text-gray-700">
                Pekerjaan
              </label>
              <input
                type="text"
                id="pekerjaan"
                {...register('pekerjaan')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.pekerjaan ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Presiden"
              />
              {errors.pekerjaan ? <p className="mt-1 text-sm text-red-600">{errors.pekerjaan.message}</p> : null}
            </div>
            <div>
              <label htmlFor="pendidikan" className="mb-2 block text-sm font-medium text-gray-700">
                Pendidikan
              </label>
              <select
                id="pendidikan"
                {...register('pendidikan')}
                className={`w-full rounded-lg border px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                  errors.pendidikan ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Pilih tingkat pendidikan</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
              {errors.pendidikan ? <p className="mt-1 text-sm text-red-600">{errors.pendidikan.message}</p> : null}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 border-t pt-6">
          <button type="button" className="rounded-lg bg-gray-500 px-6 py-3 font-medium text-white" onClick={onClose}>
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`rounded-lg px-6 py-3 font-medium text-white ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ParentData;

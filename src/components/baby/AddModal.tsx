import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import Input from '../Input';
import { usePendingChildRegistration } from '../../hooks/usePendingChildRegistration';
import { updateChild } from '../../services/childService';

interface AddModalProps {
  onClose: () => void;
}

interface FormState {
  nama: string;
  tanggal_lahir: string;
  gender: string;
  id_orang_tua: string;
  alergi: string;
  catatan: string;
}

const initialFormState: FormState = {
  nama: '',
  tanggal_lahir: '',
  gender: '',
  id_orang_tua: '',
  alergi: '',
  catatan: '',
};

const calculateAgeInMonths = (value: string): number => {
  if (!value) {
    return 0;
  }

  const today = new Date();
  const birthDate = new Date(value);

  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months += today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) {
    months -= 1;
  }

  return Math.max(months, 0);
};

const AddModal = ({ onClose }: AddModalProps) => {
  const { pendingChild, isWaiting, isLoading, error: pendingError, refresh } = usePendingChildRegistration();
  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (pendingChild) {
      setFormData({
        nama: pendingChild.nama ?? '',
        tanggal_lahir: pendingChild.tanggal_lahir ?? '',
        gender: pendingChild.gender ?? '',
        id_orang_tua: pendingChild.id_orang_tua ?? '',
        alergi: pendingChild.alergi ?? '',
        catatan: pendingChild.catatan ?? '',
      });
      setError(null);
    } else {
      setFormData(initialFormState);
    }
  }, [pendingChild]);

  const ageInMonths = useMemo(
    () => (formData.tanggal_lahir ? calculateAgeInMonths(formData.tanggal_lahir) : null),
    [formData.tanggal_lahir],
  );

  const handleChange = <T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    field: keyof FormState,
  ) =>
    (event: ChangeEvent<T>) => {
      const { value } = event.target;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!pendingChild?.id) {
      const message = 'Tidak ada data anak yang terdeteksi';
      setError(message);
      toast.error(message);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await updateChild(pendingChild.id, {
        nama: formData.nama,
        tanggal_lahir: formData.tanggal_lahir,
        gender: formData.gender,
        id_orang_tua: formData.id_orang_tua,
        alergi: formData.alergi,
        catatan: formData.catatan,
        umur: typeof ageInMonths === 'number' ? ageInMonths : 0,
        updated_at: new Date().toISOString(),
      });

      toast.success('Data anak berhasil diperbarui');
      await refresh();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menyimpan data anak';
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const combinedError = error ?? pendingError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 mx-4 w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        {isWaiting ? (
          <div className="relative mx-4 w-full max-w-4xl rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <h3 className="text-xl font-semibold text-gray-900">Tambah Data Anak</h3>
              <button type="button" onClick={onClose} className="text-gray-400 transition hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex h-full flex-col items-center justify-center gap-4 py-20">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Menunggu Kartu RFID</h2>
              <p className="font-medium text-gray-500">Silakan tempelkan kartu RFID pada reader</p>

              {(isLoading || isSaving) && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  Memuat data terbaru...
                </div>
              )}

              {combinedError ? (
                <div className="mt-2 rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700">{combinedError}</div>
              ) : null}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative mx-4 w-full max-w-4xl rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <h3 className="text-xl font-semibold text-gray-900">Edit Data Anak</h3>
              <button type="button" onClick={onClose} className="text-gray-400 transition hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <div className="space-y-5">
                <Input
                  name="Nama Anak"
                  value={formData.nama}
                  onChange={handleChange<HTMLInputElement>('nama')}
                  placeholder="Masukkan nama lengkap anak"
                  required
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    name="Tanggal Lahir"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={handleChange<HTMLInputElement>('tanggal_lahir')}
                    placeholder="Contoh: 2000-01-01"
                    required
                  />
                  <Input
                    name="Umur (Bulan)"
                    type="number"
                    value={typeof ageInMonths === 'number' ? ageInMonths : ''}
                    placeholder="Contoh: 36"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="gender">
                      Jenis Kelamin
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={handleChange<HTMLSelectElement>('gender')}
                      className={`block w-full rounded-lg border border-gray-400 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 ${
                        formData.gender ? 'text-gray-900' : 'text-gray-500'
                      }`}
                      required
                    >
                      <option value="" disabled>
                        Pilih jenis kelamin
                      </option>
                      <option value="boys">Laki-laki</option>
                      <option value="girls">Perempuan</option>
                    </select>
                  </div>
                  <Input
                    name="No KK"
                    value={formData.id_orang_tua}
                    onChange={handleChange<HTMLInputElement>('id_orang_tua')}
                    placeholder="Masukkan nomor kartu keluarga"
                    required
                  />
                </div>
              </div>

              <div className="space-y-5">
                <Input
                  name="Alergi"
                  value={formData.alergi}
                  onChange={handleChange<HTMLInputElement>('alergi')}
                  placeholder="Contoh: Kacang, susu sapi, debu"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="catatan">
                    Catatan
                  </label>
                  <textarea
                    id="catatan"
                    name="catatan"
                    rows={4}
                    value={formData.catatan}
                    onChange={handleChange<HTMLTextAreaElement>('catatan')}
                    placeholder="Masukkan catatan khusus tentang anak"
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {combinedError ? (
              <div className="px-6">
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{combinedError}</div>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddModal;


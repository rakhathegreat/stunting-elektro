import { useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSupabaseResource } from '../hooks/useSupabaseResource';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { deleteExamination, getExaminations } from '../services/examinationService';
import { Pagination } from '../features/shared/components/Pagination';
import DeleteModal from '../components/DeleteModal';
import type { Examination } from '../types/examination';

const formatDate = (dateString?: string | null) => {
  if (!dateString) {
    return '-';
  }

  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const ExaminationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusTinggiFilter, setStatusTinggiFilter] = useState('');
  const [statusBeratFilter, setStatusBeratFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [selectedAnalisis, setSelectedAnalisis] = useState<Examination | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, 400);
  const dangerActionButtonClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-red-600 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1';

  const {
    data: examinations,
    isLoading,
    error,
    refresh,
  } = useSupabaseResource<Examination[]>('examinations', getExaminations, { initialData: [] });

  const filteredData = useMemo(() => {
    const term = debouncedSearch.toLowerCase();

    return examinations.filter((item) => {
      const matchSearch =
        !term ||
        (item.DataAnak?.nama || '').toLowerCase().includes(term) ||
        `${item.DataOrangTua?.nama_ayah || ''} ${item.DataOrangTua?.nama_ibu || ''}`
          .toLowerCase()
          .includes(term) ||
        (item.DataAnak?.gender || '').toLowerCase().includes(term);

      const matchStatusTinggi = !statusTinggiFilter || (item.status_tinggi || '') === statusTinggiFilter;
      const matchStatusBerat = !statusBeratFilter || (item.status_berat || '') === statusBeratFilter;
      const matchGender = !genderFilter || (item.DataAnak?.gender || '') === genderFilter;

      return matchSearch && matchStatusTinggi && matchStatusBerat && matchGender;
    });
  }, [examinations, debouncedSearch, statusTinggiFilter, statusBeratFilter, genderFilter]);

  const {
    items: paginatedExaminations,
    page,
    pageSize,
    totalItems,
    totalPages,
    setPage,
    setPageSize,
  } = usePagination(filteredData, 10);

  const handleDelete = async () => {
    if (!selectedAnalisis) return;
    try {
      await deleteExamination(selectedAnalisis.id);
      toast.success('Data pemeriksaan berhasil dihapus');
      setShowDeleteModal(false);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus data pemeriksaan';
      toast.error(message);
    }
  };

  const isEmpty = !isLoading && paginatedExaminations.length === 0;

  return (
    <div className="space-y-6">
      <div className="px-6">
        <div className="rounded-2xl bg-white shadow-md">
          <div className="w-full px-4 py-5 sm:p-6">
            <h3 className="mb-6 text-lg font-bold leading-6 text-gray-900">Pemeriksaan Terbaru</h3>

            <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari data anak..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="block text-sm w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <select
                  value={statusTinggiFilter}
                  onChange={(event) => setStatusTinggiFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                >
                  <option value="">Status Tinggi</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Normal">Normal</option>
                  <option value="Pendek">Pendek</option>
                  <option value="Sangat Pendek">Sangat Pendek</option>
                </select>
                <select
                  value={statusBeratFilter}
                  onChange={(event) => setStatusBeratFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                >
                  <option value="">Status Berat</option>
                  <option value="Gemuk">Gemuk</option>
                  <option value="Normal">Normal</option>
                  <option value="Kurus">Kurus</option>
                  <option value="Sangat Kurus">Sangat Kurus</option>
                </select>
                <select
                  value={genderFilter}
                  onChange={(event) => setGenderFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                >
                  <option value="">Semua Gender</option>
                  <option value="boys">Laki-laki</option>
                  <option value="girls">Perempuan</option>
                </select>
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Nama', 'Gender', 'Usia', 'Status Tinggi', 'Status Berat', 'Tanggal', 'Aksi'].map((head) => (
                      <th key={head} className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        Memuat data pemeriksaan...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-red-500">
                        Terjadi kesalahan saat memuat data.
                      </td>
                    </tr>
                  ) : isEmpty ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        Tidak ada data pemeriksaan yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedExaminations.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-100">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.DataAnak?.nama || '-'}</td>
                        <td className="px-6 py-4 text-sm">{item.DataAnak?.gender === 'boys' ? 'Laki-laki' : 'Perempuan'}</td>
                        <td className="px-6 py-4 text-sm">{item.DataAnak?.umur ? `${item.DataAnak.umur} bulan` : '-'}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              item.status_tinggi === 'Normal'
                                ? 'bg-green-100 text-green-800'
                                : item.status_tinggi === 'Stunting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status_tinggi}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              item.status_berat === 'Normal'
                                ? 'bg-green-100 text-green-800'
                                : item.status_berat === 'Stunting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.status_berat}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{formatDate(item.created_at)}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            aria-label={`Hapus pemeriksaan ${item.DataAnak?.nama || ''}`}
                            onClick={() => {
                              setSelectedAnalisis(item);
                              setShowDeleteModal(true);
                            }}
                            className={dangerActionButtonClass}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal && Boolean(selectedAnalisis)}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Pemeriksaan"
        message={
          selectedAnalisis ? `Apakah Anda yakin ingin menghapus pemeriksaan ${selectedAnalisis.DataAnak?.nama ?? 'ini'}?` : ''
        }
      />
    </div>
  );
};

export default ExaminationManagement;

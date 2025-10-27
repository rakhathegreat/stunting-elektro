import { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, Search, Trash2, X } from 'lucide-react';
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

type FiltersState = {
  statusTinggi: string;
  statusBerat: string;
  gender: string;
  startDate: string;
  endDate: string;
};

const INITIAL_FILTERS: FiltersState = {
  statusTinggi: '',
  statusBerat: '',
  gender: '',
  startDate: '',
  endDate: '',
};

const ExaminationManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FiltersState>(() => ({ ...INITIAL_FILTERS }));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement | null>(null);
  const filterPopoverRef = useRef<HTMLDivElement | null>(null);
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

      const matchStatusTinggi = !filters.statusTinggi || (item.status_tinggi || '') === filters.statusTinggi;
      const matchStatusBerat = !filters.statusBerat || (item.status_berat || '') === filters.statusBerat;
      const matchGender = !filters.gender || (item.DataAnak?.gender || '') === filters.gender;

      const matchDateRange = (() => {
        if (!filters.startDate && !filters.endDate) {
          return true;
        }

        if (!item.created_at) {
          return false;
        }

        const createdAt = new Date(item.created_at);
        if (Number.isNaN(createdAt.getTime())) {
          return false;
        }

        if (filters.startDate) {
          const start = new Date(filters.startDate);
          start.setHours(0, 0, 0, 0);
          if (createdAt < start) {
            return false;
          }
        }

        if (filters.endDate) {
          const end = new Date(filters.endDate);
          end.setHours(23, 59, 59, 999);
          if (createdAt > end) {
            return false;
          }
        }

        return true;
      })();

      return matchSearch && matchStatusTinggi && matchStatusBerat && matchGender && matchDateRange;
    });
  }, [examinations, debouncedSearch, filters]);

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

  const activeFiltersCount = useMemo(() => {
    return (Object.keys(filters) as Array<keyof FiltersState>).reduce((count, key) => {
      return filters[key] ? count + 1 : count;
    }, 0);
  }, [filters]);

  const trimmedSearchTerm = searchTerm.trim();
  const canResetFilters = Boolean(trimmedSearchTerm) || activeFiltersCount > 0;

  const handleFilterChange = <Key extends keyof FiltersState>(key: Key, value: FiltersState[Key]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ ...INITIAL_FILTERS });
  };

  useEffect(() => {
    if (activeFiltersCount > 0) {
      setIsFilterOpen(true);
    }
  }, [activeFiltersCount]);

  useEffect(() => {
    if (!isFilterOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      const popover = filterPopoverRef.current;
      const button = filterButtonRef.current;

      if (popover?.contains(target) || button?.contains(target)) {
        return;
      }

      setIsFilterOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterOpen]);

  return (
    <div className="space-y-6">
      <div className="px-6">
        <div className="rounded-2xl bg-white shadow-md">
          <div className="w-full px-4 py-5 sm:p-6">
            <h3 className="mb-6 text-lg font-bold leading-6 text-gray-900">Pemeriksaan Terbaru</h3>

            <form className="grid gap-3 pb-4" onSubmit={(event) => event.preventDefault()}>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <label className="block w-full text-sm font-medium text-gray-700 md:max-w-md">
                  <span className="sr-only">Cari data anak</span>
                  <div className="relative mt-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari data anak..."
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </label>
                <div className="relative flex items-center gap-3 md:justify-end">
                  <button
                    type="button"
                    ref={filterButtonRef}
                    onClick={() => setIsFilterOpen((prev) => !prev)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:bg-gray-100"
                    aria-haspopup="true"
                    aria-expanded={isFilterOpen}
                    aria-controls="examination-filter-dialog"
                  >
                    <Filter className="h-4 w-4" />
                    Filter
                    {activeFiltersCount > 0 && (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-semibold text-white">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>
                  {isFilterOpen && (
                    <div
                      ref={filterPopoverRef}
                      id="examination-filter-dialog"
                      role="dialog"
                      aria-labelledby="examination-filter-title"
                      className="absolute right-0 top-full z-30 mt-2 w-[min(90vw,420px)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                        <div>
                          <h4 id="examination-filter-title" className="text-sm font-semibold text-gray-900">
                            Filter Pemeriksaan
                          </h4>
                          <p className="text-xs text-gray-500">Sesuaikan kriteria untuk mempersempit hasil.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsFilterOpen(false)}
                          className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                          aria-label="Tutup filter"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex max-h-[70vh] overflow-y-auto px-5 py-4">
                        <div className="grid w-full gap-4">
                          <div className="grid grid-cols-2 w-full gap-3">
                            <label className="flex flex-col col-start-1 gap-2 text-xs font-semibold text-gray-600">
                              Status Tinggi
                              <select
                                value={filters.statusTinggi}
                                onChange={(event) => handleFilterChange('statusTinggi', event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                              >
                                <option value="">Semua Status</option>
                                <option value="Tinggi">Tinggi</option>
                                <option value="Normal">Normal</option>
                                <option value="Pendek">Pendek</option>
                                <option value="Sangat Pendek">Sangat Pendek</option>
                              </select>
                            </label>
                            <label className="flex flex-col col-start-2 gap-2 text-xs font-semibold text-gray-600">
                              Status Berat
                              <select
                                value={filters.statusBerat}
                                onChange={(event) => handleFilterChange('statusBerat', event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                              >
                                <option value="">Semua Status</option>
                                <option value="Gemuk">Gemuk</option>
                                <option value="Normal">Normal</option>
                                <option value="Kurus">Kurus</option>
                                <option value="Sangat Kurus">Sangat Kurus</option>
                              </select>
                            </label>
                            <label className="flex flex-col col-span-2 gap-2 text-xs font-semibold text-gray-600">
                              Gender Anak
                              <select
                                value={filters.gender}
                                onChange={(event) => handleFilterChange('gender', event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                              >
                                <option value="">Semua Gender</option>
                                <option value="boys">Laki-laki</option>
                                <option value="girls">Perempuan</option>
                              </select>
                            </label>
                          </div>

                          <div className="grid grid-col-2 gap-3">
                            <label className="flex flex-col col-start-1 gap-2 text-xs font-semibold text-gray-600">
                              Tanggal Mulai
                              <input
                                type="date"
                                value={filters.startDate}
                                onChange={(event) => handleFilterChange('startDate', event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                              />
                            </label>
                            <label className="flex flex-col col-start-2 gap-2 text-xs font-semibold text-gray-600">
                              Tanggal Selesai
                              <input
                                type="date"
                                value={filters.endDate}
                                onChange={(event) => handleFilterChange('endDate', event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={resetFilters}
                          disabled={!canResetFilters}
                          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                            canResetFilters
                              ? 'border border-gray-300 text-gray-700 transition hover:border-gray-400 hover:bg-gray-100'
                              : 'cursor-not-allowed border border-gray-200 text-gray-400'
                          }`}
                        >
                          Atur Ulang
                        </button>
                        <div className="flex w-full gap-3 sm:w-auto">
                          <button
                            type="button"
                            onClick={() => setIsFilterOpen(false)}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-400 hover:bg-gray-100 sm:flex-none"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsFilterOpen(false)}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:flex-none"
                          >
                            Gunakan Filter
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(activeFiltersCount > 0 || trimmedSearchTerm) && (
                <div className="flex flex-col gap-1 text-xs text-gray-500 md:flex-row md:items-center md:justify-between">
                  <span className="truncate">
                    {activeFiltersCount > 0 ? `Filter aktif: ${activeFiltersCount}` : 'Tidak ada filter tambahan'}
                    {trimmedSearchTerm ? ` | Pencarian: ${trimmedSearchTerm}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={resetFilters}
                    disabled={!canResetFilters}
                    className={`self-start rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      canResetFilters
                        ? 'bg-gray-100 text-gray-600 transition hover:bg-gray-200'
                        : 'cursor-not-allowed bg-gray-100 text-gray-400'
                    }`}
                  >
                    Bersihkan
                  </button>
                </div>
              )}
            </form>

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

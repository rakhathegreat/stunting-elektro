import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Eye,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Parent } from '../types/parent';
import type { Child } from '../types/children';
import { useSupabaseResource } from '../hooks/useSupabaseResource';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { createParent, getParents } from '../services/parentService';
import { getChildren } from '../services/childService';
import { Pagination } from '../features/shared/components/Pagination';

const today = () => new Date().toISOString().slice(0, 10);

interface Snapshot {
  date: string;
  total: number;
  aktif: number;
  anak: number;
}

const loadHistory = (): Snapshot[] => {
  try {
    return JSON.parse(localStorage.getItem('parent_history') || '[]');
  } catch {
    return [];
  }
};

const saveHistory = (list: Snapshot[]) => {
  localStorage.setItem('parent_history', JSON.stringify(list));
};

const ParentManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const createInitialFormState = () => ({
    no_kk: '',
    nama_ayah: '',
    nama_ibu: '',
    tanggal_lahir_ayah: '',
    tanggal_lahir_ibu: '',
    no_hp: '',
    email: '',
    alamat: '',
    status_aktif: true,
    kunjungan_terakhir: today(),
    pekerjaan: '',
    pendidikan: '',
  });
  const [formData, setFormData] = useState(createInitialFormState);
  const debouncedSearch = useDebounce(searchTerm, 400);
  const actionButtonClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1';
  const dangerActionButtonClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-red-600 transition hover:border-red-500 hover:bg-red-50 hover:text-red-600 hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1';

  const {
    data: parents,
    isLoading: isParentsLoading,
    error: parentsError,
    refresh: refreshParents,
  } = useSupabaseResource<Parent[]>('parents', getParents, { initialData: [] });

  const {
    data: children,
    isLoading: isChildrenLoading,
    error: childrenError,
  } = useSupabaseResource<Child[]>('children', getChildren, { initialData: [] });

  const [trend, setTrend] = useState({ total: 0, aktif: 0, anak: 0 });

  useEffect(() => {
    const totalParents = parents.length;
    const aktifParents = parents.filter((p) => p.status_aktif === true).length;
    const totalChildren = children.length;

    const history = loadHistory();
    const todayKey = today();
    const todayData = { date: todayKey, total: totalParents, aktif: aktifParents, anak: totalChildren };
    const index = history.findIndex((entry) => entry.date === todayKey);
    if (index === -1) {
      history.push(todayData);
    } else {
      history[index] = todayData;
    }
    saveHistory(history);

    const yesterdayKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const yesterday = history.find((entry) => entry.date === yesterdayKey) ?? {
      total: 0,
      aktif: 0,
      anak: 0,
    };

    setTrend({
      total: totalParents - yesterday.total,
      aktif: aktifParents - yesterday.aktif,
      anak: totalChildren - yesterday.anak,
    });
  }, [parents, children]);

  const statsData = useMemo(
    () => {
      const totalParents = parents.length;
      const aktifParents = parents.filter((parent) => parent.status_aktif === true).length;
      const totalChildren = children.length;
      const yesterdayKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const inactiveYesterday =
        loadHistory().find((entry) => entry.date === yesterdayKey)?.aktif ?? 0;

      return [
        {
          name: 'Total Orang Tua',
          stat: totalParents.toLocaleString('id-ID'),
          change: `${trend.total >= 0 ? '+' : ''}${trend.total}`,
          color: 'blue',
          icon: Users,
        },
        {
          name: 'Aktif',
          stat: aktifParents.toLocaleString('id-ID'),
          change: `${trend.aktif >= 0 ? '+' : ''}${trend.aktif}`,
          color: 'blue',
          icon: Users,
        },
        {
          name: 'Tidak Aktif',
          stat: (totalParents - aktifParents).toLocaleString('id-ID'),
          change: `${totalParents - aktifParents - inactiveYesterday}`,
          color: 'blue',
          icon: Users,
        },
        {
          name: 'Total Anak',
          stat: totalChildren.toLocaleString('id-ID'),
          change: `${trend.anak >= 0 ? '+' : ''}${trend.anak}`,
          color: 'blue',
          icon: Users,
        },
      ];
    },
    [parents, children, trend],
  );

  const filteredParents = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    if (!term) {
      return parents;
    }

    return parents.filter((parent) => {
      const ibu = parent.nama_ibu?.toLowerCase() ?? '';
      const ayah = parent.nama_ayah?.toLowerCase() ?? '';
      const email = parent.email?.toLowerCase() ?? '';
      return ibu.includes(term) || ayah.includes(term) || email.includes(term);
    });
  }, [parents, debouncedSearch]);

  const {
    items: paginatedParents,
    page,
    pageSize,
    totalItems,
    totalPages,
    setPage,
    setPageSize,
  } = usePagination(filteredParents, 10);

  const getChildCount = (parentId: string) => children.filter((child) => child?.DataOrangTua?.id === parentId).length;

  const handleAddParent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const trimmedKK = formData.no_kk.trim();
      if (!trimmedKK) {
        toast.error('Nomor KK wajib diisi');
        return;
      }

      if (!/^\d{16}$/.test(trimmedKK)) {
        toast.error('Nomor KK harus terdiri dari 16 digit angka');
        return;
      }

      const payload = {
        id: trimmedKK,
        nama_ayah: formData.nama_ayah.trim(),
        nama_ibu: formData.nama_ibu.trim(),
        tanggal_lahir_ayah: formData.tanggal_lahir_ayah,
        tanggal_lahir_ibu: formData.tanggal_lahir_ibu,
        no_hp: formData.no_hp.trim(),
        email: formData.email.trim(),
        alamat: formData.alamat.trim(),
        status_aktif: formData.status_aktif,
        kunjungan_terakhir: formData.kunjungan_terakhir,
        pekerjaan: formData.pekerjaan.trim() || null,
        pendidikan: formData.pendidikan.trim() || null,
      };

      await createParent({
        ...payload,
      });
      toast.success('Data orang tua berhasil ditambahkan');
      setShowAddModal(false);
      setFormData(createInitialFormState());
      await refreshParents();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menambahkan data orang tua';
      toast.error(message);
    }
  };

  const isLoading = isParentsLoading || isChildrenLoading;
  const hasError = parentsError || childrenError;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-white px-6 pb-6 pt-6 shadow-md transition-all hover:scale-[1.02] hover:shadow-modern-lg"
          >
            <dt>
              <div className={`absolute rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 p-3 shadow-modern`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-semibold text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-2">
              <p className="text-2xl font-bold text-gray-900">{item.stat}</p>
              <p className={`ml-3 flex items-baseline text-sm font-semibold ${Number(item.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Number(item.change) >= 0 ?
                  <TrendingUp className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                :
                  <TrendingDown className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                }
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="w-full px-6">
        <div className="rounded-2xl bg-white shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-6 text-lg font-bold leading-6 text-gray-900">Pemeriksaan Terbaru</h3>

            <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari orang tua..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="block w-full text-sm rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Orang Tua
              </button>
            </div>
            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Nama</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Alamat</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Jumlah Anak</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Tanggal Daftar</th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                        Memuat data orang tua...
                      </td>
                    </tr>
                  ) : hasError ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-sm text-red-500">
                        Gagal memuat data, silakan coba lagi.
                      </td>
                    </tr>
                  ) : paginatedParents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-500">
                        Tidak ada data yang sesuai dengan pencarian.
                      </td>
                    </tr>
                  ) : (
                    paginatedParents.map((parent) => (
                      <tr
                        key={parent.id}
                        onClick={() => navigate(`/parents/${parent.id}`)}
                        className="cursor-pointer transition-colors hover:bg-gray-100"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {parent.nama_ayah} & <br />
                          {parent.nama_ibu}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground text-gray-700">
                          <div className="mt-1 flex items-center">
                            {parent.alamat || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{getChildCount(String(parent.id))} anak</td>
                        <td className="px-6 py-2 text-sm text-gray-700">
                          <span
                            className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
                              parent.status_aktif
                                ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                                : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                            }`}
                          >
                            {parent.status_aktif ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium text-muted-foreground">
                          {parent.created_at?.slice(0, 10) || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label="Lihat detail orang tua"
                              className={actionButtonClass}
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/parents/${parent.id}`);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Edit data orang tua"
                              className={actionButtonClass}
                              onClick={(event) => {
                                event.stopPropagation();
                                navigate(`/parents/${parent.id}`, { state: { startEdit: true } });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Hapus data orang tua"
                              className={dangerActionButtonClass}
                              onClick={(event) => {
                                event.stopPropagation();
                                toast.info('Fitur hapus data orang tua belum tersedia');
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
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

      {showAddModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-5xl rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Tambah Orang Tua Baru</h3>
            <form onSubmit={handleAddParent}>
              <div className='grid grid-cols-2 gap-3'>

                <div className="col-start-1 space-y-4 rounded-lg border border-gray-200 px-4 py-6">
                  <h4 className="text-sm font-semibold text-gray-800">Informasi Identitas</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label htmlFor="no_kk" className="text-sm font-medium text-gray-700">
                        Nomor KK
                      </label>
                      <input
                        id="no_kk"
                        type="text"
                        value={formData.no_kk}
                        onChange={(event) => setFormData({ ...formData, no_kk: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        placeholder="Masukkan nomor KK"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="nama_ayah" className="text-sm font-medium text-gray-700">
                        Nama Ayah
                      </label>
                      <input
                        id="nama_ayah"
                        type="text"
                        value={formData.nama_ayah}
                        placeholder='Masuan nama ayah'
                        onChange={(event) => setFormData({ ...formData, nama_ayah: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="nama_ibu" className="text-sm font-medium text-gray-700">
                        Nama Ibu
                      </label>
                      <input
                        id="nama_ibu"
                        type="text"
                        value={formData.nama_ibu}
                        placeholder='Masukan nama ibu'
                        onChange={(event) => setFormData({ ...formData, nama_ibu: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="tanggal_lahir_ayah" className="text-sm font-medium text-gray-700">
                        Tanggal Lahir Ayah
                      </label>
                      <input
                        id="tanggal_lahir_ayah"
                        type="date"
                        value={formData.tanggal_lahir_ayah}
                        onChange={(event) =>
                          setFormData({ ...formData, tanggal_lahir_ayah: event.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="tanggal_lahir_ibu" className="text-sm font-medium text-gray-700">
                        Tanggal Lahir Ibu
                      </label>
                      <input
                        id="tanggal_lahir_ibu"
                        type="date"
                        value={formData.tanggal_lahir_ibu}
                        onChange={(event) =>
                          setFormData({ ...formData, tanggal_lahir_ibu: event.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="col-start-2 space-y-4 rounded-lg border border-gray-200 px-4 py-6">
                  <h4 className="text-sm font-semibold text-gray-800">Kontak & Alamat</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        placeholder='Masukan email'
                        onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="no_hp" className="text-sm font-medium text-gray-700">
                        Nomor Telepon
                      </label>
                      <input
                        id="no_hp"
                        type="tel"
                        value={formData.no_hp}
                        placeholder='Masukan nomor telepon'
                        onChange={(event) => setFormData({ ...formData, no_hp: event.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="alamat" className="text-sm font-medium text-gray-700">
                      Alamat Lengkap
                    </label>
                    <textarea
                      id="alamat"
                      value={formData.alamat}
                      onChange={(event) => setFormData({ ...formData, alamat: event.target.value })}
                      className="h-full w-full rounded-lg border border-gray-300 px-3 py-2"
                      required
                    />
                  </div>
                </div>

              </div>
              <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData(createInitialFormState());
                    }}
                    className="rounded-lg bg-gray-200 border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300 hover:cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 hover:cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ParentManagement;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  User,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Child } from '../types/children';
import { useSupabaseResource } from '../hooks/useSupabaseResource';
import { useDebounce } from '../hooks/useDebounce';
import { usePagination } from '../hooks/usePagination';
import { getChildren, deleteChild } from '../services/childService';
import EditModal from '../components/Dashboard/EditModal';
import DeleteModal from '../components/DeleteModal';
import AddModal from '../components/baby/AddModal';
import { Pagination } from '../features/shared/components/Pagination';

const today = () => new Date().toISOString().slice(0, 10);

interface Snapshot {
  date: string;
  total: number;
  boys: number;
  girls: number;
}

const loadHistory = (): Snapshot[] => {
  try {
    return JSON.parse(localStorage.getItem('baby_history') || '[]');
  } catch {
    return [];
  }
};

const saveHistory = (list: Snapshot[]) => {
  localStorage.setItem('baby_history', JSON.stringify(list));
};

const BabyManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [statusTinggiFilter, setStatusTinggiFilter] = useState('');
  const [statusBeratFilter, setStatusBeratFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  const {
    data: children,
    isLoading,
    error,
    refresh,
  } = useSupabaseResource<Child[]>('children-management', getChildren, { initialData: [] });

  const totalChildren = children.length;
  const boys = children.filter((child) => child.gender === 'boys').length;
  const girls = children.filter((child) => child.gender === 'girls').length;
  const avgAge =
    totalChildren === 0
      ? 0
      : children.reduce((sum, child) => sum + (child.umur || 0), 0) / totalChildren;

  const [trend, setTrend] = useState({ total: 0, boys: 0, girls: 0 });

  useEffect(() => {
    const history = loadHistory();
    const todayKey = today();
    const todayData = { date: todayKey, total: totalChildren, boys, girls };
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
      boys: 0,
      girls: 0,
    };

    setTrend({
      total: totalChildren - yesterday.total,
      boys: boys - yesterday.boys,
      girls: girls - yesterday.girls,
    });
  }, [totalChildren, boys, girls]);

  const statsData = useMemo(
    () => [
      {
        name: 'Total Anak',
        stat: new Intl.NumberFormat('id-ID').format(totalChildren),
        change: `${trend.total >= 0 ? '+' : ''}${trend.total}`,
        color: 'blue',
        icon: Users,
      },
      {
        name: 'Jumlah Laki-laki',
        stat: new Intl.NumberFormat('id-ID').format(boys),
        change: `${trend.boys >= 0 ? '+' : ''}${trend.boys}`,
        color: 'blue',
        icon: Users,
      },
      {
        name: 'Jumlah Perempuan',
        stat: new Intl.NumberFormat('id-ID').format(girls),
        change: `${trend.girls >= 0 ? '+' : ''}${trend.girls}`,
        color: 'blue',
        icon: Users,
      },
      {
        name: 'Rata-Rata Usia',
        stat: `${avgAge.toFixed(1)} bln`,
        change: '+0',
        color: 'blue',
        icon: User,
      },
    ],
    [totalChildren, boys, girls, trend, avgAge],
  );

  const filteredChildren = useMemo(() => {
    const term = debouncedSearch.toLowerCase();
    return children.filter((child) => {
      const matchSearch =
        !term ||
        (child.nama || '').toLowerCase().includes(term) ||
        (child.gender || '').toLowerCase().includes(term) ||
        `${child.DataOrangTua?.nama_ayah || ''} ${child.DataOrangTua?.nama_ibu || ''}`
          .toLowerCase()
          .includes(term);

      const heightStatus = (child.status_tinggi || '').toLowerCase();
      const weightStatus = (child.status_berat || '').toLowerCase();
      const heightFilter = statusTinggiFilter.toLowerCase();
      const weightFilter = statusBeratFilter.toLowerCase();

      const matchStatusTinggi = !statusTinggiFilter || heightStatus === heightFilter;
      const matchStatusBerat = !statusBeratFilter || weightStatus === weightFilter;
      const matchGender = !genderFilter || (child.gender || '') === genderFilter;

      return matchSearch && matchStatusTinggi && matchStatusBerat && matchGender;
    });
  }, [children, debouncedSearch, statusTinggiFilter, statusBeratFilter, genderFilter]);

  const {
    items: paginatedChildren,
    page,
    pageSize,
    totalItems,
    totalPages,
    setPage,
    setPageSize,
  } = usePagination(filteredChildren, 10);

  const openDeleteModal = (child: Child) => {
    setSelectedChild(child);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedChild) return;
    try {
      await deleteChild(String(selectedChild.id));
      toast.success('Data anak berhasil dihapus');
      setShowDeleteModal(false);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus data anak';
      toast.error(message);
    }
  };

  const handleEditClose = async () => {
    setShowEditModal(false);
    await refresh();
  };

  const handleAddClose = async () => {
    setShowAddModal(false);
    await refresh();
  };

  const isEmpty = !isLoading && paginatedChildren.length === 0;

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
                <TrendingUp className="mr-1 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="w-full px-6">
        <div className="rounded-2xl bg-white shadow-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="mb-6 text-lg font-bold leading-6 text-gray-900">Data Anak</h3>

            <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex w-full flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari anak atau orang tua..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={statusTinggiFilter}
                  onChange={(event) => setStatusTinggiFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Status Tinggi</option>
                  <option value="tinggi">Tinggi</option>
                  <option value="normal">Normal</option>
                  <option value="pendek">Pendek</option>
                  <option value="sangat pendek">Sangat Pendek</option>
                </select>
                <select
                  value={statusBeratFilter}
                  onChange={(event) => setStatusBeratFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Status Berat</option>
                  <option value="gemuk">Gemuk</option>
                  <option value="normal">Normal</option>
                  <option value="kurus">Kurus</option>
                  <option value="sangat kurus">Sangat Kurus</option>
                </select>
                <select
                  value={genderFilter}
                  onChange={(event) => setGenderFilter(event.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Jenis Kelamin</option>
                  <option value="boys">Laki-laki</option>
                  <option value="girls">Perempuan</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Nama</th>
                    <th className="px-6 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Orang Tua</th>
                    <th className="px-6 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Jenis Kelamin</th>
                    <th className="px-6 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Umur (bulan)</th>
                    <th className="px-6 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Status Tinggi</th>
                    <th className="px-6 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Status Berat</th>
                    <th className="px-6 py-2 text-left text-xs font-bold uppercase tracking-wider text-gray-600">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white/50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                        Memuat data anak...
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
                        Tidak ada data anak yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedChildren.map((child) => (
                      <tr 
                        key={child.id}
                        className="transition-colors hover:bg-gray-100"
                        onClick={() => navigate(`/babies/${child.id}`)}
                      >
                        <td className="px-6 py-2 text-xs font-medium text-gray-900">{child.nama}</td>
                        <td className="px-6 py-2 text-sm text-gray-700">
                          {child.DataOrangTua?.nama_ayah} & {child.DataOrangTua?.nama_ibu}
                        </td>
                        <td className="px-6 py-2 text-sm text-center capitalize text-gray-700">{child.gender == 'boys' ? 'Laki-laki' : 'Perempuan'}</td>
                        <td className="px-6 py-2 text-sm text-center text-gray-700">{child.umur}</td>
                        <td className="px-6 py-2 text-sm text-gray-700">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              child.status_tinggi === 'Normal'
                                ? 'bg-green-100 text-green-800'
                                : child.status_tinggi === 'Stunting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {child.status_tinggi}
                          </span>
                        </td>
                        <td className="px-6 py-2 text-sm text-gray-700">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              child.status_berat === 'Normal'
                                ? 'bg-green-100 text-green-800'
                                : child.status_berat === 'Stunting'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {child.status_berat}
                          </span>
                        </td>
                        <td className="px-6 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded p-2 text-gray-600 transition hover:bg-blue-400 hover:text-white"
                              onClick={() => {
                                setSelectedChild(child);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded p-2 text-red-600 transition hover:bg-red-400 hover:text-white"
                              onClick={() => openDeleteModal(child)}
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

      {showAddModal ? <AddModal onClose={handleAddClose} /> : null}
      {showEditModal && selectedChild ? (
        <EditModal child={selectedChild} onClose={handleEditClose} onUpdate={refresh} />
      ) : null}
      <DeleteModal
        isOpen={showDeleteModal && Boolean(selectedChild)}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Data Anak"
        message={selectedChild ? `Apakah Anda yakin ingin menghapus data ${selectedChild.nama}?` : ''}
      />
    </div>
  );
};

export default BabyManagement;

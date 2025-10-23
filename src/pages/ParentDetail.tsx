import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  Baby,
  Calendar,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Parent } from '../types/parent';
import type { Child } from '../types/children';
import { useSupabaseResource } from '../hooks/useSupabaseResource';
import { getParentById } from '../services/parentService';
import { getChildrenByParent } from '../services/childService';
import ParentData from '../components/parent/parent-data-form';

const visitHistory = [
  {
    date: '2024-01-15',
    purpose: 'Pemeriksaan Rutin',
    children: ['Andi Pratama', 'Sari Dewi Jr.'],
    notes: 'Pemeriksaan berjalan lancar',
  },
  {
    date: '2023-12-15',
    purpose: 'Konsultasi Gizi',
    children: ['Sari Dewi Jr.'],
    notes: 'Konsultasi mengenai pola makan',
  },
  {
    date: '2023-11-15',
    purpose: 'Pemeriksaan Rutin',
    children: ['Andi Pratama', 'Sari Dewi Jr.'],
    notes: 'Semua dalam kondisi baik',
  },
];

const ParentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditParent, setEditParent] = useState(false);

  const {
    data: parent,
    isLoading: isParentLoading,
    error: parentError,
  } = useSupabaseResource<Parent | null>(
    `parent-${id}`,
    () => getParentById(id as string),
    { initialData: null, enabled: Boolean(id) },
  );

  const {
    data: children,
    isLoading: isChildrenLoading,
    error: childrenError,
  } = useSupabaseResource<Child[]>(
    `children-parent-${id}`,
    () => getChildrenByParent(id as string),
    { initialData: [], enabled: Boolean(id) },
  );

  const tabs = useMemo(
    () => [
      { id: 'info', name: 'Informasi Pribadi', icon: User },
      { id: 'children', name: 'Data Anak', icon: Baby },
      { id: 'history', name: 'Riwayat Kunjungan', icon: Activity },
      { id: 'notes', name: 'Catatan', icon: FileText },
    ],
    [],
  );

  const handleEditToggle = () => {
    if (!parent) {
      toast.error('Data orang tua belum tersedia');
      return;
    }
    setEditParent((prev) => !prev);
  };

  const isLoading = isParentLoading || isChildrenLoading;
  const hasError = parentError || childrenError;

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/parents')}
            className="rounded-lg border border-gray-300 p-2 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {parent ? `${parent.nama_ayah} & ${parent.nama_ibu}` : 'Memuat...'}
            </h1>
            <p className="text-gray-600">Detail Orang Tua</p>
          </div>
        </div>
        <button
          className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={handleEditToggle}
          disabled={!parent}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isEditParent ? 'Batalkan' : 'Edit Data'}
        </button>
      </div>

      {hasError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Terjadi kesalahan saat memuat data orang tua. Silakan coba lagi.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Jumlah Anak</p>
          <p className="text-2xl font-bold text-blue-600">{children.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Kunjungan Terakhir</p>
          <p className="text-lg font-semibold text-gray-900">
            {parent?.kunjungan_terakhir
              ? new Date(parent.kunjungan_terakhir as unknown as string).toLocaleDateString('id-ID')
              : '-'}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Kunjungan</p>
          <p className="text-2xl font-bold text-green-600">{visitHistory.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-600">Status Aktif</p>
          <p className="text-lg font-semibold text-green-600">{parent?.status_aktif ?? '-'}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {isLoading ? (
            <p className="text-sm text-gray-500">Memuat data detail orang tua...</p>
          ) : activeTab === 'info' ? (
            !isEditParent ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Informasi Kontak</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{parent?.email ?? '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Nomor Telepon</p>
                        <p className="font-medium">{parent?.no_hp ?? '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <MapPin className="mt-1 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Alamat</p>
                        <p className="font-medium">{parent?.alamat ?? '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Informasi Tambahan</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Tanggal Daftar</p>
                        <p className="font-medium">
                          {parent?.created_at
                            ? new Date(parent.created_at).toLocaleDateString('id-ID')
                            : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Pekerjaan</p>
                        <p className="font-medium">{parent?.pekerjaan ?? '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Pendidikan</p>
                        <p className="font-medium">{parent?.pendidikan ?? '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ParentData parent={parent as Parent} onClose={handleEditToggle} />
            )
          ) : activeTab === 'children' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Data Anak</h3>
              {children.length === 0 ? (
                <p className="text-sm text-gray-500">Belum ada data anak untuk orang tua ini.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {children.map((child) => (
                    <div key={child.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                      <h4 className="text-lg font-semibold text-gray-900">{child.nama}</h4>
                      <p className="text-sm text-gray-600">Usia: {child.umur} bulan</p>
                      <p className="text-sm text-gray-600">Jenis Kelamin: {child.gender}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Riwayat Kunjungan</h3>
              <div className="space-y-3">
                {visitHistory.map((visit) => (
                  <div key={visit.date} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">{visit.purpose}</p>
                    <p className="text-sm text-gray-600">Tanggal: {new Date(visit.date).toLocaleDateString('id-ID')}</p>
                    <p className="text-sm text-gray-600">Anak: {visit.children.join(', ')}</p>
                    <p className="text-sm text-gray-600">Catatan: {visit.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900">Catatan Tambahan</h3>
              <p className="mt-2 text-sm text-gray-600">{parent?.notes ?? 'Belum ada catatan.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDetail;

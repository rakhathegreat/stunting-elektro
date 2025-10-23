import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  Ruler,
  TrendingDown,
  TrendingUp,
  User,
} from 'lucide-react';
import BabyData from '../components/baby/baby-data-form';
import type { Child } from '../types/children';
import type { GrowthRecord } from '../types/growth';
import GrowthChart from '../components/GrowthChart';
import { useSupabaseResource } from '../hooks/useSupabaseResource';
import { getChildById } from '../services/childService';
import { getGrowthRecordsByChild } from '../services/growthService';

const tabs = [
  { id: 'overview', name: 'Overview', icon: Activity },
  { id: 'growth', name: 'Grafik Pertumbuhan', icon: TrendingUp },
  { id: 'examinations', name: 'Riwayat Pemeriksaan', icon: FileText },
  { id: 'babydata', name: 'Data Bayi', icon: Ruler },
];

const BabyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState<'tinggi' | 'berat'>('tinggi');

  const {
    data: child,
    isLoading: isChildLoading,
    error: childError,
    refresh: refreshChild,
  } = useSupabaseResource<Child | null>(
    `child-${id}`,
    () => getChildById(id as string),
    { initialData: null, enabled: Boolean(id) },
  );

  const {
    data: growthData,
    isLoading: isGrowthLoading,
    error: growthError,
    refresh: refreshGrowth,
  } = useSupabaseResource<GrowthRecord[]>(
    `child-growth-${id}`,
    () => getGrowthRecordsByChild(id as string),
    { initialData: [], enabled: Boolean(id) },
  );

  const refreshAll = async () => {
    await refreshChild();
    await refreshGrowth();
  };

  const latestGrowth = growthData[0];
  const previousGrowth = growthData[1];

  const getGrowthTrend = (current?: number | null, previous?: number | null) => {
    const currentValue = current ?? 0;
    const previousValue = previous ?? 0;
    if (currentValue > previousValue) {
      return { icon: TrendingUp, color: 'text-green-600', text: 'Naik' };
    }
    if (currentValue < previousValue) {
      return { icon: TrendingDown, color: 'text-red-600', text: 'Turun' };
    }
    return { icon: TrendingUp, color: 'text-gray-600', text: 'Stabil' };
  };

  const heightTrend = useMemo(
    () => getGrowthTrend(latestGrowth?.tinggi ?? null, previousGrowth?.tinggi ?? null),
    [latestGrowth, previousGrowth],
  );
  const weightTrend = useMemo(
    () => getGrowthTrend(latestGrowth?.berat ?? null, previousGrowth?.berat ?? null),
    [latestGrowth, previousGrowth],
  );

  if (isChildLoading || isGrowthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Memuat data bayi...</p>
      </div>
    );
  }

  if (childError || growthError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          Terjadi kesalahan saat memuat data bayi. Silakan coba lagi.
        </p>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Data bayi tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="max-h-dvh grid grid-cols-4 gap-4 px-6">
      <div className="col-span-1 h-full rounded-2xl bg-white shadow-md">
        <div className="flex h-full flex-col gap-4 px-6 py-6">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full bg-gray-300" />
          </div>

          <div className="flex flex-col items-center gap-1">
            <h3 className="text-center text-xl font-semibold text-gray-900">{child.nama}</h3>
            <p className="font-medium text-gray-500">
              {child.umur} bulan • {child.gender}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-lg font-bold text-gray-900">Informasi Dasar</h4>

            <div className="space-y-1 rounded-2xl bg-gray-50 py-2">
              <div className="flex items-center space-x-4 py-2">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Tanggal Lahir</p>
                  <p className="font-bold text-gray-900">{child.tanggal_lahir}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 py-2">
                <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-2">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Orang Tua</p>
                  <button
                    onClick={() => navigate(`/parents/${child.id_orang_tua}`)}
                    className="text-start font-bold text-blue-600 transition-colors hover:text-blue-800"
                  >
                    {child.DataOrangTua?.nama_ayah} & {child.DataOrangTua?.nama_ibu}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4 py-2">
                <div className="rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 p-2">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Terdaftar Sejak</p>
                  <p className="font-bold text-gray-900">
                    {new Date(child.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-3 h-full overflow-y-auto rounded-2xl bg-white p-6 shadow-md">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Tinggi Badan</h3>
                  <heightTrend.icon className={`h-5 w-5 ${heightTrend.color}`} />
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">{latestGrowth?.tinggi ?? '-'} cm</p>
                <p className={`mt-1 text-sm font-medium ${heightTrend.color}`}>{heightTrend.text}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Berat Badan</h3>
                  <weightTrend.icon className={`h-5 w-5 ${weightTrend.color}`} />
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">{latestGrowth?.berat ?? '-'} kg</p>
                <p className={`mt-1 text-sm font-medium ${weightTrend.color}`}>{weightTrend.text}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">Status Kesehatan</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm font-semibold text-green-700">Status Tinggi</p>
                    <p className="text-sm text-gray-600">{latestGrowth?.status_tinggi ?? '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <AlertCircle className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Status Berat</p>
                    <p className="text-sm text-gray-600">{latestGrowth?.status_berat ?? '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'growth' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Perkembangan Anak</h3>
              <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-2">
                <button
                  onClick={() => setSelectedMetric('tinggi')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    selectedMetric === 'tinggi' ? 'bg-blue-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Tinggi
                </button>
                <button
                  onClick={() => setSelectedMetric('berat')}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    selectedMetric === 'berat' ? 'bg-blue-600 text-white' : 'text-gray-600'
                  }`}
                >
                  Berat
                </button>
              </div>
            </div>
            <GrowthChart selectedMetric={selectedMetric} data={growthData} gender={child.gender} />
          </div>
        ) : activeTab === 'examinations' ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Riwayat Pemeriksaan</h3>
            {growthData.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada data pemeriksaan.</p>
            ) : (
              <div className="space-y-3">
                {growthData.map((record) => (
                  <div key={record.id} className="rounded-lg border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(record.created_at).toLocaleDateString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-600">Tinggi: {record.tinggi} cm</p>
                    <p className="text-sm text-gray-600">Berat: {record.berat} kg</p>
                    <p className="text-sm text-gray-600">Catatan: {record.catatan ?? '-'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <BabyData child={child} onClose={refreshAll} />
        )}
      </div>
    </div>
  );
};

export default BabyDetail;

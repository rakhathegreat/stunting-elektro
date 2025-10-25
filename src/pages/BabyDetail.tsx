import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, Calendar, FileText, TrendingDown, TrendingUp, User } from 'lucide-react';
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
    { initialData: null, enabled: Boolean(id) }
  );

  const {
    data: growthData,
    isLoading: isGrowthLoading,
    error: growthError,
    refresh: refreshGrowth,
  } = useSupabaseResource<GrowthRecord[]>(
    `child-growth-${id}`,
    () => getGrowthRecordsByChild(id as string),
    { initialData: [], enabled: Boolean(id) }
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
    if (currentValue > previousValue) return { icon: TrendingUp, color: 'text-green-600', text: 'Naik' };
    if (currentValue < previousValue) return { icon: TrendingDown, color: 'text-red-600', text: 'Turun' };
    return { icon: TrendingUp, color: 'text-gray-600', text: 'Stabil' };
  };

  const heightTrend = useMemo(
    () => getGrowthTrend(latestGrowth?.tinggi ?? null, previousGrowth?.tinggi ?? null),
    [latestGrowth, previousGrowth]
  );
  const weightTrend = useMemo(
    () => getGrowthTrend(latestGrowth?.berat ?? null, previousGrowth?.berat ?? null),
    [latestGrowth, previousGrowth]
  );

  const calendarMonths = useMemo(() => {
    const monthMap = new Map<number, GrowthRecord>();
    growthData.forEach((record) => {
      if (typeof record.bulan === 'number') {
        monthMap.set(record.bulan, record);
      }
    });

    return Array.from({ length: 61 }, (_, month) => ({
      month,
      record: monthMap.get(month) ?? null,
    }));
  }, [growthData]);

  const getStatusBadgeClasses = (status?: string | null) => {
    const normalized = status?.trim().toLowerCase();
    switch (normalized) {
      case 'normal':
        return 'bg-emerald-100 text-emerald-700';
      case 'tinggi':
      case 'gemuk':
        return 'bg-blue-100 text-blue-700';
      case 'pendek':
      case 'kurus':
        return 'bg-amber-100 text-amber-700';
      case 'sangat pendek':
      case 'sangat kurus':
        return 'bg-red-100 text-red-600';
      case 'tidak diketahui':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusLabel = (status?: string | null) => {
    const value = status?.trim();
    return value && value.length > 0 ? value : 'Tidak diketahui';
  };

  const getColumnCountForWidth = (width: number) => {
    if (width >= 1024) return 11;
    if (width >= 640) return 6;
    return 4;
  };

const [columnCount, setColumnCount] = useState(() => {
  if (typeof window === 'undefined') {
    return 11;
  }
  return getColumnCountForWidth(window.innerWidth);
});

  const formatMetricValue = (value?: number | null, unit = '') => {
    if (value == null) return '-';
    const formatted = Number(value).toLocaleString('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return `${formatted} ${unit}`.trim();
  };

  const getMetricChange = (current?: number | null, previous?: number | null, unit = '') => {
    if (current == null || previous == null) {
      return {
        text: 'Data belum lengkap',
        badgeClass: 'bg-slate-100 text-slate-500',
        direction: 'neutral' as const,
      };
    }

    const diff = Number((current - previous).toFixed(1));
    if (diff > 0) {
      return {
        text: `+${diff} ${unit}`.trim(),
        badgeClass: 'bg-emerald-100 text-emerald-700',
        direction: 'up' as const,
      };
    }
    if (diff < 0) {
      return {
        text: `${diff} ${unit}`.trim(),
        badgeClass: 'bg-rose-100 text-rose-700',
        direction: 'down' as const,
      };
    }
    return {
      text: 'Stabil',
      badgeClass: 'bg-blue-100 text-blue-700',
      direction: 'stable' as const,
    };
  };

  const [tooltipPlacements, setTooltipPlacements] = useState<Record<number, 'top' | 'bottom'>>({});
  const monthRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleResize = () => {
      setColumnCount(getColumnCountForWidth(window.innerWidth));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateTooltipPlacement = (monthId: number) => {
    if (typeof window === 'undefined') return;
    const element = monthRefs.current[monthId];
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const estimatedTooltipHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    const placement: 'top' | 'bottom' =
      spaceBelow < estimatedTooltipHeight && spaceAbove > spaceBelow ? 'top' : 'bottom';

    setTooltipPlacements((prev) => {
      if (prev[monthId] === placement) return prev;
      return { ...prev, [monthId]: placement };
    });
  };

  const heightChangeBadge = getMetricChange(latestGrowth?.tinggi ?? null, previousGrowth?.tinggi ?? null, 'cm');
  const weightChangeBadge = getMetricChange(latestGrowth?.berat ?? null, previousGrowth?.berat ?? null, 'kg');

  const latestCheckupDate = latestGrowth?.created_at ? new Date(latestGrowth.created_at) : null;
  const latestCheckupLabel = latestCheckupDate
    ? latestCheckupDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-';
  const latestNote =
    latestGrowth?.catatan && latestGrowth.catatan.trim().length > 0
      ? latestGrowth.catatan
      : 'Belum ada catatan tambahan dari pemeriksaan terakhir.';

  const recentRecords = useMemo(() => growthData.slice(0, 3), [growthData]);

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
    <div className="relative max-h-dvh grid grid-cols-4 gap-4">
      {/* Sidebar */}
      <div className="col-span-1 rounded-2xl bg-white shadow-md">
        <div className="flex h-full flex-col gap-4 px-6 py-6">
          <div className="flex justify-center">
            <div className="h-32 w-32 rounded-full bg-gray-300" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h3 className="max-w-2/3 text-center text-lg font-semibold text-gray-900">{child.nama}</h3>
            <p className="font-medium text-gray-500">
              {child.umur} bulan • {child.gender == 'boys' ? 'Laki-laki' : 'Perempuan'}
            </p>
          </div>

          <div className="flex flex-col gap-2 px-5">
            <h4 className="text-lg font-bold text-gray-900">Informasi Dasar</h4>
            <div className="space-y-1 rounded-2xl bg-white py-2">
              {/* Tanggal Lahir */}
              <div className="flex items-center space-x-4 py-2">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 p-2">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Tanggal Lahir</p>
                  <p className="font-bold text-gray-900">{child.tanggal_lahir}</p>
                </div>
              </div>
              {/* Orang Tua */}
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
              {/* Terdaftar Sejak */}
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

        </div>
      </div>
      
      <div className='col-span-3 h-full overflow-y-auto '>

        <div className='mb-3'>
          {/* Tabs */}
          <div className="flex flex-row gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
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

        {/* Content */}
        <div className="py-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Tinggi Badan</p>
                          <p className="mt-2 text-3xl font-semibold text-slate-900">
                            {formatMetricValue(latestGrowth?.tinggi ?? null, 'cm')}
                          </p>
                        </div>
                        <heightTrend.icon className={`h-6 w-6 ${heightTrend.color}`} />
                      </div>
                      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                        <span
                          className={`inline-flex whitespace-nowrap items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${heightChangeBadge.badgeClass}`}
                        >
                          {heightChangeBadge.text}
                        </span>
                        <span>dibanding pemeriksaan sebelumnya</span>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-600">Berat Badan</p>
                          <p className="mt-2 text-3xl font-semibold text-slate-900">
                            {formatMetricValue(latestGrowth?.berat ?? null, 'kg')}
                          </p>
                        </div>
                        <weightTrend.icon className={`h-6 w-6 ${weightTrend.color}`} />
                      </div>
                      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                        <span
                          className={`inline-flex whitespace-nowrap items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${weightChangeBadge.badgeClass}`}
                        >
                          {weightChangeBadge.text}
                        </span>
                        <span>dibanding pemeriksaan sebelumnya</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900">Status Tinggi</h3>
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">Kondisi terakhir</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">
                            {getStatusLabel(latestGrowth?.status_tinggi)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                            latestGrowth?.status_tinggi,
                          )}`}
                        >
                          {getStatusLabel(latestGrowth?.status_tinggi)}
                        </span>
                      </div>
                      <p className="mt-4 text-xs text-slate-500">
                        Periksa secara berkala untuk memantau pertumbuhan tinggi badan anak.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900">Status Berat</h3>
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-500">Kondisi terakhir</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">
                            {getStatusLabel(latestGrowth?.status_berat)}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(
                            latestGrowth?.status_berat,
                          )}`}
                        >
                          {getStatusLabel(latestGrowth?.status_berat)}
                        </span>
                      </div>
                      <p className="mt-4 text-xs text-slate-500">
                        Evaluasi pola makan dan aktivitas anak untuk menjaga berat ideal.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Pemeriksaan terakhir</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{latestCheckupLabel}</p>
                    </div>

                    <div className="rounded-xl bg-slate-50 py-4 text-sm leading-relaxed text-slate-600">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Catatan petugas</p>
                      <p className="mt-1 whitespace-pre-line">{latestNote}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Riwayat singkat</p>
                      <ul className="mt-3 space-y-3">
                        {recentRecords.length > 0 ? (
                          recentRecords.map((record) => {
                            const timelineDate = record.created_at
                              ? new Date(record.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : '-';
                            return (
                              <li key={record.id} className="flex items-start gap-3">
                                <span className="mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-emerald-500" />
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold text-slate-900">{timelineDate}</p>
                                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${getStatusBadgeClasses(
                                        record.status_tinggi,
                                      )}`}
                                    >
                                      Tinggi: {getStatusLabel(record.status_tinggi)}
                                    </span>
                                    <span
                                      className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${getStatusBadgeClasses(
                                        record.status_berat,
                                      )}`}
                                    >
                                      Berat: {getStatusLabel(record.status_berat)}
                                    </span>
                                  </div>
                                </div>
                              </li>
                            );
                          })
                        ) : (
                          <li className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                            Belum ada riwayat pemeriksaan yang dapat ditampilkan.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'growth' ? (
            <div className="">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Perkembangan Anak</h3>
                <div className="flex items-center gap-2 rounded-lg bg-gray-200 px-2 py-1 border border-gray-300">
                  <button
                    onClick={() => setSelectedMetric('tinggi')}
                    className={`rounded-lg px-6 py-2 text-sm font-medium ${
                      selectedMetric === 'tinggi' ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    Tinggi
                  </button>
                  <button
                    onClick={() => setSelectedMetric('berat')}
                    className={`rounded-lg px-6 py-2 text-sm font-medium ${
                      selectedMetric === 'berat' ? 'bg-blue-600 text-white' : 'text-gray-600'
                    }`}
                  >
                    Berat
                  </button>
                </div>
              </div>
              <GrowthChart selectedMetric={selectedMetric} data={growthData} gender={child.gender} />
            </div>
          ) : null}

          {activeTab === 'examinations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Riwayat Pemeriksaan</h3>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-11">
                {calendarMonths.map(({ month, record }, index) => {
                  const hasRecord = Boolean(record);
                  const baseClasses =
                    'group relative flex h-12 flex-col items-center justify-center rounded-xl text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';
                  const stateClasses = hasRecord
                    ? 'bg-sky-700 text-white shadow-md hover:bg-sky-600'
                    : 'border-dashed border border-gray-300 bg-gray-200 text-gray-500';
                  const effectiveColumnCount = columnCount || 1;
                  const totalRows = Math.max(1, Math.ceil(calendarMonths.length / effectiveColumnCount));
                  const columnIndex = index % effectiveColumnCount;
                  const rowIndex = Math.floor(index / effectiveColumnCount);
                  const isLastRow = rowIndex >= totalRows - 1;
                  const isFirstColumn = columnIndex === 0;
                  const isLastColumn = columnIndex === effectiveColumnCount - 1;

                  const horizontalPlacement = isFirstColumn
                    ? 'left-0'
                    : isLastColumn
                    ? 'right-0'
                    : 'left-1/2 -translate-x-1/2';

                  const arrowHorizontalPlacement = isFirstColumn
                    ? 'left-8'
                    : isLastColumn
                    ? 'right-8'
                    : 'left-1/2 -translate-x-1/2';

                  const defaultPlacement = isLastRow ? 'top' : 'bottom';
                  const placement = tooltipPlacements[month] ?? defaultPlacement;
                  const verticalPlacement =
                    placement === 'top'
                      ? 'bottom-full -translate-y-3 sm:-translate-y-4'
                      : 'top-full translate-y-3';

                  const tooltipPositionClass = `${horizontalPlacement} ${verticalPlacement}`;
                  const arrowPlacementClass = `${placement === 'top' ? '-bottom-2' : '-top-2'} ${arrowHorizontalPlacement}`;
                  const formattedDate = record?.created_at
                    ? new Date(record.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-';
                  const heightStatusClasses = getStatusBadgeClasses(record?.status_tinggi);
                  const weightStatusClasses = getStatusBadgeClasses(record?.status_berat);

                  return (
                    <div
                      key={month}
                      className={`${baseClasses} ${stateClasses}`}
                      tabIndex={hasRecord ? 0 : -1}
                      title={hasRecord ? undefined : 'Belum ada data'}
                      aria-label={
                        hasRecord
                          ? `Detail pemeriksaan bulan ${month}`
                          : `Belum ada pemeriksaan pada bulan ${month}`
                      }
                      ref={(node) => {
                        monthRefs.current[month] = node;
                      }}
                      onMouseEnter={() => hasRecord && updateTooltipPlacement(month)}
                      onFocus={() => hasRecord && updateTooltipPlacement(month)}
                      onTouchStart={() => hasRecord && updateTooltipPlacement(month)}
                    >
                      <span>{month}</span>
                      {hasRecord ? (
                        <div
                          className={`absolute z-30 hidden w-64 max-w-[min(18rem,calc(100vw-3rem))] rounded-2xl border border-slate-200 bg-white/95 p-4 text-left text-xs text-slate-600 shadow-2xl ring-1 ring-black/5 backdrop-blur-sm opacity-0 transition-all duration-500 ease-out group-hover:flex group-hover:opacity-100 group-focus-visible:flex group-focus-visible:opacity-100 ${tooltipPositionClass}`}
                          role="tooltip"
                        >
                          <span
                            className={`pointer-events-none absolute h-4 w-4 rotate-45 border border-slate-200 bg-white/95 shadow-sm transition-all duration-200 ease-out ${arrowPlacementClass}`}
                            aria-hidden="true"
                          />
                          <div className="flex w-full flex-col gap-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-slate-400">Tanggal pemeriksaan</p>
                              <p className="text-sm font-semibold text-slate-900">{formattedDate}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Tinggi
                                </p>
                                <p className="text-sm font-semibold text-slate-900">
                                  {record?.tinggi ?? '-'} cm
                                </p>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${heightStatusClasses}`}
                                >
                                  {getStatusLabel(record?.status_tinggi)}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                  Berat
                                </p>
                                <p className="text-sm font-semibold text-slate-900">
                                  {record?.berat ?? '-'} kg
                                </p>
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${weightStatusClasses}`}
                                >
                                  {getStatusLabel(record?.status_berat)}
                                </span>
                              </div>
                            </div>

                            <div className="rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
                              <p className="font-semibold text-slate-500">Catatan</p>
                              <p className="mt-1">
                                {record?.catatan && record.catatan.trim().length > 0
                                  ? record.catatan
                                  : 'Tidak ada catatan tambahan.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'babydata' && <BabyData child={child} onClose={refreshAll} />}
        </div>
      </div>
      
    </div>
  );
};

export default BabyDetail;

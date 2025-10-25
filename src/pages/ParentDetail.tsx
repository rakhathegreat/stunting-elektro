import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  ShieldCheck,
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

const formatDate = (input?: string | null, options: Intl.DateTimeFormatOptions = {}) => {
  if (!input) return '-';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  });
};

const ParentDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const startEditFromState = Boolean((location.state as { startEdit?: boolean } | null)?.startEdit);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditParent, setEditParent] = useState(startEditFromState);

  useEffect(() => {
    const shouldEnableEdit = Boolean((location.state as { startEdit?: boolean } | null)?.startEdit);
    if (shouldEnableEdit) {
      setEditParent(true);
    }
  }, [location.state]);

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

  const parentNames = parent ? `${parent.nama_ayah} & ${parent.nama_ibu}` : 'Memuat...';
  const totalChildren = children.length;
  const totalVisits = visitHistory.length;
  const lastVisitLabel = parent?.kunjungan_terakhir
    ? formatDate(parent.kunjungan_terakhir as unknown as string)
    : '-';
  const registeredLabel = parent?.created_at ? formatDate(parent.created_at) : '-';
  const statusActive = parent?.status_aktif ? 'Aktif' : 'Non Aktif';
  const normalizedStatus = typeof statusActive === 'string' ? statusActive.trim().toLowerCase() : statusActive;
  const statusBadgeClass =
    normalizedStatus === 'aktif'
      ? 'bg-emerald-100 text-emerald-700'
      : normalizedStatus === 'non aktif' || normalizedStatus === 'non-aktif'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-slate-100 text-slate-600';

  const summaryCards = useMemo(
    () => [
      {
        id: 'children',
        title: 'Total Anak',
        value: totalChildren,
        description: 'Anak terdaftar dalam keluarga ini',
        icon: Baby,
        accent: 'from-sky-500 to-blue-600',
      },
      {
        id: 'last-visit',
        title: 'Kunjungan Terakhir',
        value: lastVisitLabel,
        description: 'Tanggal pemeriksaan terakhir',
        icon: Calendar,
        accent: 'from-indigo-500 to-purple-600',
      },
      {
        id: 'visit-count',
        title: 'Total Kunjungan',
        value: totalVisits,
        description: 'Jumlah kunjungan yang tercatat',
        icon: Activity,
        accent: 'from-emerald-500 to-green-600',
      },
      {
        id: 'status',
        title: 'Status Aktif',
        value: statusActive,
        description: 'Status kepesertaan saat ini',
        icon: ShieldCheck,
        accent: 'from-orange-500 to-amber-600',
      },
    ],
    [lastVisitLabel, statusActive, totalChildren, totalVisits],
  );

  const quickContacts = [
    { id: 'email', label: 'Email', value: parent?.email ?? '-', icon: Mail },
    { id: 'phone', label: 'Telepon', value: parent?.no_hp ?? '-', icon: Phone },
    { id: 'address', label: 'Alamat', value: parent?.alamat ?? '-', icon: MapPin },
  ];

  return (
    <div className="mx-auto space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white shadow-modern">
        <div className="flex flex-col gap-6 border-b border-gray-200 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate('/parents')}
              className="rounded-full border border-gray-200 bg-white p-2 text-gray-600 transition hover:border-blue-200 hover:text-blue-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{parentNames}</h1>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}>
                  {statusActive}
                </span>
              </div>
              <p className="text-sm text-gray-500">Detail profil orang tua dan riwayat keluarga</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {quickContacts.map((item) => (
                  <div key={item.id} className="flex items-center gap-1.5">
                    <item.icon className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium text-gray-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-gray-400">Terdaftar sejak</p>
              <p className="text-sm font-semibold text-gray-900">{registeredLabel}</p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              onClick={handleEditToggle}
              disabled={!parent}
            >
              <Edit className="h-4 w-4" />
              {isEditParent ? 'Batalkan' : 'Edit Data'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div
              key={card.id}
              className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-modern"
            >
              <div
                className={`absolute -right-10 -top-10 h-33 w-33 rounded-full bg-gradient-to-br ${card.accent} opacity-10`}
                aria-hidden="true"
              />
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{card.title}</p>
                  <p className="mt-2 text-xl font-semibold text-gray-900">
                    {typeof card.value === 'number' ? card.value.toLocaleString('id-ID') : card.value}
                  </p>
                </div>
                <div className={`rounded-xl p-3`}>
                  <card.icon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-500">{card.description}</p>
            </div>
          ))}
        </div>
      </div>

      {hasError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Terjadi kesalahan saat memuat data orang tua. Silakan coba lagi.
        </div>
      ) : null}

      <div className="rounded-3xl border border-gray-200 bg-white shadow-modern">
        <div className="border-b border-gray-100 px-6 pb-4 pt-6">
          <nav className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
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
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Informasi Kontak</h3>
                      <span className="text-xs text-gray-500">Terakhir diperbarui {registeredLabel}</span>
                    </div>
                    <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                      {quickContacts.map((item) => (
                        <div key={item.id} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                            <item.icon className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <dt className="text-xs uppercase tracking-wide text-gray-500">{item.label}</dt>
                            <dd className="text-sm font-medium text-gray-900">{item.value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h4 className="text-base font-semibold text-gray-900">Informasi Latar Belakang</h4>
                      <div className="mt-4 space-y-3 text-sm text-gray-600">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">Pekerjaan</p>
                          <p className="mt-1 font-medium text-gray-800">{parent?.pekerjaan ?? '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">Pendidikan</p>
                          <p className="mt-1 font-medium text-gray-800">{parent?.pendidikan ?? '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-400">Kunjungan terakhir</p>
                          <p className="mt-1 font-medium text-gray-800">{lastVisitLabel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                      <h4 className="text-base font-semibold text-gray-900">Catatan Singkat</h4>
                      <p className="mt-4 text-sm leading-relaxed text-gray-600">
                        {parent?.notes && parent.notes.trim().length > 0
                          ? parent.notes
                          : 'Belum ada catatan tambahan untuk orang tua ini.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h4 className="text-base font-semibold text-gray-900">Ringkasan Aktivitas</h4>
                    <ul className="mt-4 space-y-3 text-sm text-gray-600">
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                        <div>
                          <p className="font-semibold text-gray-800">{totalVisits} kunjungan tercatat</p>
                          <p className="text-xs text-gray-500">
                            {totalVisits > 0
                              ? 'Rutin mengikuti jadwal pemeriksaan'
                              : 'Belum pernah melakukan kunjungan terdata'}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <div>
                          <p className="font-semibold text-gray-800">{totalChildren} anak dalam perwalian</p>
                          <p className="text-xs text-gray-500">
                            {totalChildren > 0
                              ? 'Semua anak terpantau dalam sistem'
                              : 'Belum ada anak yang terdaftar'}
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                        <div>
                          <p className="font-semibold text-gray-800">Status keanggotaan</p>
                          <p className="text-xs text-gray-500">
                            {statusActive}
                          </p>
                        </div>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h4 className="text-base font-semibold text-gray-900">Kontak Cepat</h4>
                    <div className="mt-4 space-y-3 text-sm">
                      <button
                        type="button"
                        disabled={!parent?.no_hp}
                        className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 font-medium text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                        onClick={() => {
                          if (parent?.no_hp) {
                            window.open(`https://wa.me/${parent.no_hp}`, '_blank');
                          }
                        }}
                      >
                        <span>Hubungi via WhatsApp</span>
                        <Phone className="h-4 w-4" />
                      </button>
                      <p className="text-xs text-gray-500">
                        Gunakan tombol di atas untuk komunikasi cepat dengan orang tua.
                      </p>
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
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {children.map((child) => {
                    const genderLabel = child.gender === 'boys' ? 'Laki-laki' : 'Perempuan';
                    return (
                      <div
                        key={child.id}
                        className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-modern"
                      >
                        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-100 opacity-30 transition group-hover:opacity-50" />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">{child.nama}</h4>
                            <p className="mt-1 text-sm text-gray-500">
                              Terdaftar sejak{' '}
                              {child.created_at
                                ? formatDate(child.created_at, {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })
                                : '-'}
                            </p>
                          </div>
                          <div className="rounded-xl bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {genderLabel}
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">Usia</p>
                            <p className="mt-1 font-semibold text-gray-900">{child.umur ?? '-'} bulan</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">ID Anak</p>
                            <p className="mt-1 font-semibold text-gray-900">#{child.id}</p>
                          </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {child.updated_at
                              ? `Pembaharuan terakhir ${formatDate(child.updated_at, {
                                  day: 'numeric',
                                  month: 'short',
                                })}`
                              : 'Data terbaru belum tersedia'}
                          </span>
                          <button
                            onClick={() => navigate(`/babies/${child.id}`)}
                            className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1.5 font-semibold text-white transition hover:bg-blue-700"
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'history' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Riwayat Kunjungan</h3>
                <span className="text-xs text-gray-500">{totalVisits} kunjungan tercatat</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-0 h-full w-px bg-gradient-to-b from-blue-200 via-gray-200 to-transparent" />
                <ul className="space-y-6">
                  {visitHistory.map((visit, idx) => (
                    <li key={visit.date} className="relative flex gap-4">
                      <span className="mt-1.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shadow-sm">
                        {idx + 1}
                      </span>
                      <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{visit.purpose}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(visit.date, {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {visit.children.length} anak
                          </span>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-gray-600">
                          <p>
                            <span className="font-semibold text-gray-800">Anak: </span>
                            {visit.children.join(', ')}
                          </p>
                          <p>
                            <span className="font-semibold text-gray-800">Catatan: </span>
                            {visit.notes}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Catatan Tambahan</h3>
              <div className="rounded-2xl border border-gray-200 bg-slate-50 p-6 text-sm leading-relaxed text-gray-600">
                {parent?.notes && parent.notes.trim().length > 0
                  ? parent.notes
                  : 'Belum ada catatan yang ditambahkan untuk orang tua ini. Gunakan mode edit untuk menambahkan catatan penting atau pengingat khusus.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDetail;

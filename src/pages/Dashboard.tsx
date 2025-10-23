import { useEffect, useMemo, useState } from 'react';
import { Baby, Stethoscope, TrendingUp, Users } from 'lucide-react';
import BarChart from '../components/Dashboard/BarChart';
import Example from '../components/Dashboard/PieChart';
import { FullScreenLoader } from '../features/shared/components/FullScreenLoader';
import { useSupabaseResource } from '../hooks/useSupabaseResource';
import { getAnalysisRows, getDashboardCounts, type AnalysisRow } from '../services/dashboardService';

const today = () => new Date().toISOString().slice(0, 10);

interface Snapshot {
  date: string;
  parents: number;
  babies: number;
  checkups: number;
}

const loadHistory = (): Snapshot[] => {
  try {
    return JSON.parse(localStorage.getItem('dashboard_history') || '[]');
  } catch {
    return [];
  }
};

const saveHistory = (list: Snapshot[]) => {
  localStorage.setItem('dashboard_history', JSON.stringify(list));
};

const useTrend = (counts: { parents: number; babies: number; checkups: number }) => {
  const [trend, setTrend] = useState({ parents: 0, babies: 0, checkups: 0 });

  useEffect(() => {
    if (!counts) return;

    const history = loadHistory();
    const todayKey = today();
    const todaySnapshot = { date: todayKey, ...counts };
    const index = history.findIndex((entry) => entry.date === todayKey);
    if (index === -1) {
      history.push(todaySnapshot);
    } else {
      history[index] = todaySnapshot;
    }
    saveHistory(history);

    const yesterdayKey = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const yesterday = history.find((entry) => entry.date === yesterdayKey) ?? {
      parents: 0,
      babies: 0,
      checkups: 0,
    };

    setTrend({
      parents: counts.parents - yesterday.parents,
      babies: counts.babies - yesterday.babies,
      checkups: counts.checkups - yesterday.checkups,
    });
  }, [counts]);

  return trend;
};

const Dashboard = () => {
  const {
    data: counts,
    isLoading: isCountsLoading,
    error: countsError,
  } = useSupabaseResource('dashboard-counts', getDashboardCounts, {
    initialData: { parents: 0, babies: 0, checkups: 0 },
  });

  const {
    data: analysisRows,
    isLoading: isAnalysisLoading,
    error: analysisError,
  } = useSupabaseResource<AnalysisRow[]>('dashboard-analysis', getAnalysisRows, { initialData: [] });

  const trend = useTrend(counts);

  const stats = useMemo(
    () => [
      {
        name: 'Total Orang Tua',
        stat: counts.parents.toLocaleString(),
        change: `${trend.parents >= 0 ? '+' : ''}${trend.parents}`,
        icon: Users,
        color: 'blue',
      },
      {
        name: 'Total Bayi',
        stat: counts.babies.toLocaleString(),
        change: `${trend.babies >= 0 ? '+' : ''}${trend.babies}`,
        icon: Baby,
        color: 'blue',
      },
      {
        name: 'Pemeriksaan Hari Ini',
        stat: counts.checkups.toLocaleString(),
        change: `${trend.checkups >= 0 ? '+' : ''}${trend.checkups}`,
        icon: Stethoscope,
        color: 'blue',
      },
    ],
    [counts, trend],
  );

  const pieData = useMemo(() => {
    const countByStatus = (rows: AnalysisRow[], key: 'status_tinggi' | 'status_berat') =>
      rows.reduce<Record<string, number>>((acc, row) => {
        const value = row[key] ?? 'Tidak Diketahui';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});

    const formatPie = (entries: Record<string, number>) =>
      Object.entries(entries).map(([name, value]) => ({ name, value }));

    const maleRows = analysisRows.filter((row) => row.id_anak.gender === 'boys');
    const femaleRows = analysisRows.filter((row) => row.id_anak.gender === 'girls');

    return {
      maleHeight: formatPie(countByStatus(maleRows, 'status_tinggi')),
      maleWeight: formatPie(countByStatus(maleRows, 'status_berat')),
      femaleHeight: formatPie(countByStatus(femaleRows, 'status_tinggi')),
      femaleWeight: formatPie(countByStatus(femaleRows, 'status_berat')),
    };
  }, [analysisRows]);

  if (isCountsLoading && isAnalysisLoading) {
    return <FullScreenLoader />;
  }

  if (countsError || analysisError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
        Terjadi kesalahan saat memuat dashboard. Silakan muat ulang halaman.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative overflow-hidden rounded-2xl bg-white px-6 pb-6 pt-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-modern-lg"
          >
            <dt>
              <div className={`absolute rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 p-3 shadow-modern`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-semibold text-gray-500">{item.name}</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-2">
              <p className="text-3xl font-bold text-gray-900">{item.stat}</p>
              <p
                className={`ml-3 flex items-baseline text-sm font-semibold ${Number(item.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                <TrendingUp className="mr-1 h-4 w-4 flex-shrink-0 text-green-500" aria-hidden="true" />
                <span className="sr-only">{Number(item.change) >= 0 ? 'Meningkat' : 'Menurun'} sebesar</span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-2">
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl border-0 shadow-modern">
            <div className="px-4 pt-5 sm:pt-6">
              <h3 className="mb-6 text-lg font-bold leading-6 text-gray-900">Tren Pemeriksaan Bulanan</h3>
              <BarChart />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 h-fit">
          <div className="glass rounded-2xl border-0 shadow-modern">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="mb-6 text-lg font-bold leading-6 text-gray-900">Distribusi Status Gizi</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-300 p-4">
                  <h3 className="mb-2 font-medium">Laki-laki</h3>
                  <p className="mb-4 text-sm text-gray-600">Persentase status berat dan tinggi pada anak laki-laki saat ini</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Example data={pieData.maleHeight} />
                    <Example data={pieData.maleWeight} />
                  </div>
                </div>
                <div className="rounded-2xl border border-gray-300 p-4">
                  <h3 className="mb-2 font-medium">Perempuan</h3>
                  <p className="mb-4 text-sm text-gray-600">Persentase status berat dan tinggi pada anak perempuan saat ini</p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Example data={pieData.femaleHeight} />
                    <Example data={pieData.femaleWeight} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

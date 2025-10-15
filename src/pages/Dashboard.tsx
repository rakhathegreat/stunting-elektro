import React, { useEffect, useMemo, useState } from 'react';
import { Users, Baby, Stethoscope, TrendingUp } from 'lucide-react';
import BarChart from '../components/Dashboard/BarChart';
import Example from '../components/Dashboard/PieChart';
import { supabase } from '../supabaseClient';
import { showError } from '../utils/feedback';

interface AnalisisRow {
  status_tinggi: string | null;
  status_berat: string | null;
  id_anak: { gender: string };
}

/* ---------- helper trending ---------- */
const today = () => new Date().toISOString().slice(0, 10);
interface Snapshot {
  date: string;
  parents: number;
  babies: number;
  checkups: number;
}
const loadHistory = (): Snapshot[] => {
  try {
    return JSON.parse(localStorage.getItem("dashboard_history") || "[]");
  } catch {
    return [];
  }
};
const saveHistory = (list: Snapshot[]) =>
  localStorage.setItem("dashboard_history", JSON.stringify(list));

/* ---------- komponen ---------- */
const Dashboard: React.FC = () => {
  const [maleHeight, setMaleHeight] = useState<any[]>([]);
  const [maleWeight, setMaleWeight] = useState<any[]>([]);
  const [femaleHeight, setFemaleHeight] = useState<any[]>([]);
  const [femaleWeight, setFemaleWeight] = useState<any[]>([]);

  /* statistik & trending */
  const [trend, setTrend] = useState({ parents: 0, babies: 0, checkups: 0});
  const [dashboardHistory, setDashboardHistory] = useState<Snapshot[]>(() => loadHistory());

  /* fetch pie tetap */
  useEffect(() => {
    const fetchPieByGender = async () => {
      try {
        const { data, error } = await supabase
          .from('Analisis')
          .select('status_tinggi, status_berat, id_anak!inner(gender)');

        if (error) {
          throw error;
        }

        const rows = (data ?? []) as unknown as AnalisisRow[];
        const count = (arr: AnalisisRow[], key: 'status_tinggi' | 'status_berat') =>
          arr.reduce<Record<string, number>>((acc, r) => {
            const value = r[key] ?? 'Tidak Diketahui';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
          }, {});
        const toPie = (obj: Record<string, number>) =>
          Object.entries(obj).map(([name, value]) => ({ name, value }));
        const male = rows.filter(r => r.id_anak.gender === 'boys');
        const female = rows.filter(r => r.id_anak.gender === 'girls');
        setMaleHeight(toPie(count(male, 'status_tinggi')));
        setMaleWeight(toPie(count(male, 'status_berat')));
        setFemaleHeight(toPie(count(female, 'status_tinggi')));
        setFemaleWeight(toPie(count(female, 'status_berat')));
      } catch (error) {
        showError('Gagal memuat distribusi status gizi', error);
      }
    };
    fetchPieByGender();
  }, []);

  /* fetch angka & hitung trending */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [parentsRes, babiesRes, checkupsRes] = await Promise.all([
          supabase.from('DataOrangTua').select('*', { count: 'exact', head: true }),
          supabase.from('DataAnak').select('*', { count: 'exact', head: true }),
          supabase.from('Analisis').select('*', { count: 'exact', head: true }),
        ]);

        if (parentsRes.error) throw parentsRes.error;
        if (babiesRes.error) throw babiesRes.error;
        if (checkupsRes.error) throw checkupsRes.error;

        const parents = parentsRes.count ?? 0;
        const babies = babiesRes.count ?? 0;
        const checkups = checkupsRes.count ?? 0;

        /* simpan / update hari ini */
        const history = loadHistory();
        const todayStr = today();
        const todayData = {
          date: todayStr,
          parents,
          babies,
          checkups,
        };
        const idx = history.findIndex(h => h.date === todayStr);
        idx === -1 ? history.push(todayData) : (history[idx] = todayData);
        saveHistory(history);
        setDashboardHistory([...history]);

        /* bandingkan kemarin */
        const y = history.find(h => h.date === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) || {
          parents: 0,
          babies: 0,
          checkups: 0,
        };
        setTrend({
          parents: parents - y.parents,
          babies: babies - y.babies,
          checkups: checkups - y.checkups
        });
      } catch (error) {
        showError('Gagal memuat statistik dashboard', error);
      }
    };
    fetchStats();
  }, []);

  const todaySnapshot = useMemo(() => {
    return (
      dashboardHistory.find(h => h.date === today()) || {
        date: today(),
        parents: 0,
        babies: 0,
        checkups: 0,
      }
    );
  }, [dashboardHistory]);

  /* stats card dengan trending */
  const stats = [
    { name: 'Total Orang Tua', stat: (todaySnapshot.parents ?? 0).toLocaleString(), icon: Users, change: `${trend.parents >= 0 ? '+' : ''}${trend.parents}`, color: 'blue' },
    { name: 'Total Bayi', stat: (todaySnapshot.babies ?? 0).toLocaleString(), icon: Baby, change: `${trend.babies >= 0 ? '+' : ''}${trend.babies}`, color: 'blue' },
    { name: 'Pemeriksaan Hari Ini', stat: (todaySnapshot.checkups ?? 0).toLocaleString(), icon: Stethoscope, change: `${trend.checkups >= 0 ? '+' : ''}${trend.checkups}`, color: 'blue' },
  ];

  /* ---------- render tetap sama ---------- */
  return (
    <div className="space-y-6">
      <div className="px-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-6 px-6 pb-6 rounded-2xl overflow-hidden hover:shadow-modern-lg transition-all hover:scale-[1.02] shadow-sm"
          >
            <dt>
              <div className={`absolute bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl p-3 shadow-modern`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-semibold text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{item.stat}</p>
              <p
                className={`ml-3 flex items-baseline text-sm font-semibold ${
                  Number(item.change) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500 mr-1" aria-hidden="true" />
                <span className="sr-only">{Number(item.change) >= 0 ? 'Increased' : 'Decreased'} by</span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* bagian grafik tetap sama */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-2">
        <div className="lg:col-span-3">
          <div className="glass shadow-modern rounded-2xl border-0">
            <div className="px-4 pt-5 sm:pt-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">Tren Pemeriksaan Bulanan</h3>
              <BarChart />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 h-fit">
          <div className="glass shadow-modern rounded-2xl border-0">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">Distribusi Status Gizi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="border border-gray-300 rounded-2xl p-4">
                  <h3 className="font-medium mb-2">Laki-laki</h3>
                  <p className="text-sm text-gray-600 mb-4">Persentase status berat dan tinggi pada anak laki-laki saat ini</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Example data={maleHeight} />
                    <Example data={maleWeight} />
                  </div>
                </div>
                <div className="border border-gray-300 rounded-2xl p-4">
                  <h3 className="font-medium mb-2">Perempuan</h3>
                  <p className="text-sm text-gray-600 mb-4">Persentase status berat dan tinggi pada anak perempuan saat ini</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Example data={femaleHeight} />
                    <Example data={femaleWeight} />
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
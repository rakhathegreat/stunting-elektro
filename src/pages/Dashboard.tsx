import React, { useEffect, useState } from 'react';
import { Users, Baby, Stethoscope, CheckCircle, TrendingUp } from 'lucide-react';
import BarChart from '../components/Dashboard/BarChart';
import Example from '../components/Dashboard/PieChart';
import { supabase } from '../supabaseClient';

interface PieData {
  name: string;
  value: number;
}

interface AnalisisRow {
  status_tinggi: string | null;
  status_berat: string | null;
  id_anak: {
    gender: string;
  };
}


const Dashboard: React.FC = () => {
  /* ------------- STATE ------------- */
  const [maleHeight,  setMaleHeight]  = useState<PieData[]>([]);
  const [maleWeight,  setMaleWeight]  = useState<PieData[]>([]);
  const [femaleHeight,setFemaleHeight]= useState<PieData[]>([]);
  const [femaleWeight,setFemaleWeight]= useState<PieData[]>([]);

  /* ------------- FETCH ------------- */
  useEffect(() => {
    const fetchPieByGender = async () => {
      const { data, error } = await supabase
        .from('Analisis')
        .select('status_tinggi, status_berat, id_anak!inner(gender)');

      if (error) {
        console.error('Error fetching growth_records:', error);
        return;
      }

      const typedata = data as unknown as AnalisisRow[];

      /* helper: hitung kemunculan status */
      const count = (rows: any[], key: 'status_tinggi' | 'status_berat') =>
        rows.reduce<Record<string, number>>((acc, row) => {
          const val = row[key] ?? 'Tidak Diketahui';
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {});

      const toPie = (obj: Record<string, number>) =>
        Object.entries(obj).map(([name, value]) => ({ name, value }));

      /* filter gender */
      const male   = typedata?.filter(r => r.id_anak.gender === 'boys');
      const female = typedata?.filter(r => r.id_anak.gender === 'girls');

      /* set state */
      setMaleHeight(toPie(count(male,   'status_tinggi')));
      setMaleWeight(toPie(count(male,   'status_berat')));
      setFemaleHeight(toPie(count(female, 'status_tinggi')));
      setFemaleWeight(toPie(count(female, 'status_berat')));
    };

    fetchPieByGender();
  }, []);

  /* ------------- STATS CARD ------------- */
  const stats = [
    { name: 'Total Orang Tua', stat: '127', icon: Users, change: '+12%', changeType: 'increase', color: 'blue' },
    { name: 'Total Bayi', stat: '89', icon: Baby, change: '+8%', changeType: 'increase', color: 'blue' },
    { name: 'Pemeriksaan Bulan Ini', stat: '234', icon: Stethoscope, change: '+23%', changeType: 'increase', color: 'blue' },
    { name: 'Tingkat Stunting', stat: '78%', icon: CheckCircle, change: '+5%', changeType: 'increase', color: 'blue' },
  ];

    /* ------------- HANDLER ------------- */

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="px-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500 mr-1" aria-hidden="true" />
                <span className="sr-only">{item.changeType === 'increase' ? 'Increased' : 'Decreased'} by</span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:grid-rows-2">
        {/* Tren Pemeriksaan */}
        <div className="lg:col-span-3">
          <div className="glass shadow-modern rounded-2xl border-0">
            <div className="px-4 pt-5 sm:pt-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">Tren Pemeriksaan Bulanan</h3>
              <BarChart />
            </div>
          </div>
        </div>

        {/* Distribusi Status Gizi */}
        <div className="lg:col-span-3 h-fit">
          <div className="glass shadow-modern rounded-2xl border-0">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">Distribusi Status Gizi</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Laki-laki */}
                <div className="border border-gray-300 rounded-2xl p-4">
                  <h3 className="font-medium mb-2">Laki-laki</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Persentase status berat dan tinggi pada anak laki-laki saat ini
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Example data={maleHeight} />
                    <Example data={maleWeight} />
                  </div>
                </div>

                {/* Perempuan */}
                <div className="border border-gray-300 rounded-2xl p-4">
                  <h3 className="font-medium mb-2">Perempuan</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Persentase status berat dan tinggi pada anak perempuan saat ini
                  </p>
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
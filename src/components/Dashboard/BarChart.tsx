import { useMemo } from 'react';
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useSupabaseResource } from '../../hooks/useSupabaseResource';
import { getMonthlyAnalysis, type MonthlyAnalysisRow } from '../../services/dashboardService';

interface ChartData {
  bulan: number;
  gemuk: number;
  normalBerat: number;
  kurus: number;
  sangatKurus: number;
  tinggi: number;
  normalTinggi: number;
  pendek: number;
  sangatPendek: number;
}

const LoadingState = () => <p className="px-4 py-6 text-sm text-gray-500">Memuat data grafik...</p>;
const ErrorState = ({ message }: { message: string }) => (
  <p className="px-4 py-6 text-sm text-red-600">Terjadi kesalahan: {message}</p>
);

const StackedBarChartComponent = () => {
  const {
    data,
    isLoading,
    error,
  } = useSupabaseResource<MonthlyAnalysisRow[]>('dashboard-monthly-analysis', getMonthlyAnalysis, {
    initialData: [],
  });

  const chartData = useMemo<ChartData[]>(() => {
    const grouped = data.reduce<Record<number, ChartData>>((acc, item) => {
      const month = item.bulan;
      if (!acc[month]) {
        acc[month] = {
          bulan: month,
          gemuk: 0,
          normalBerat: 0,
          kurus: 0,
          sangatKurus: 0,
          tinggi: 0,
          normalTinggi: 0,
          pendek: 0,
          sangatPendek: 0,
        };
      }

      const lowerWeight = item.status_berat.toLowerCase();
      if (lowerWeight === 'gemuk') acc[month].gemuk += 1;
      else if (lowerWeight === 'normal') acc[month].normalBerat += 1;
      else if (lowerWeight === 'kurus') acc[month].kurus += 1;
      else if (lowerWeight === 'sangat kurus') acc[month].sangatKurus += 1;

      const lowerHeight = item.status_tinggi.toLowerCase();
      if (lowerHeight === 'tinggi') acc[month].tinggi += 1;
      else if (lowerHeight === 'normal') acc[month].normalTinggi += 1;
      else if (lowerHeight === 'pendek') acc[month].pendek += 1;
      else if (lowerHeight === 'sangat pendek') acc[month].sangatPendek += 1;

      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.bulan - b.bulan);
  }, [data]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bulan" label={{ value: 'Bulan', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Jumlah Anak', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          <Bar dataKey="gemuk" stackId="berat" fill="#E53935" name="Gemuk" />
          <Bar dataKey="normalBerat" stackId="berat" fill="#43A047" name="Normal (Berat)" />
          <Bar dataKey="kurus" stackId="berat" fill="#FB8C00" name="Kurus" />
          <Bar dataKey="sangatKurus" stackId="berat" fill="#6D4C41" name="Sangat Kurus" />

          <Bar dataKey="tinggi" stackId="tinggi" fill="#1E88E5" name="Tinggi" />
          <Bar dataKey="normalTinggi" stackId="tinggi" fill="#7CB342" name="Normal (Tinggi)" />
          <Bar dataKey="pendek" stackId="tinggi" fill="#FDD835" name="Pendek" />
          <Bar dataKey="sangatPendek" stackId="tinggi" fill="#546E7A" name="Sangat Pendek" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StackedBarChartComponent;

import { useMemo } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useSupabaseResource } from '../../hooks/useSupabaseResource';
import { getMonthlyAnalysis, type MonthlyAnalysisRow } from '../../services/dashboardService';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const LoadingState = () => <p className="px-4 py-6 text-sm text-gray-500">Memuat data grafik...</p>;
const ErrorState = ({ message }: { message?: string | null }) => (
  <p className="px-4 py-6 text-sm text-red-600">Terjadi kesalahan: {message ?? 'Tidak dapat memuat data.'}</p>
);

interface ChartDataPoint {
  month: number;
  monthLabel: string;
  total: number;
  normal: number;
  needsAttention: number;
  weightAttention: number;
  heightAttention: number;
}

const EmptyState = () => <p className="px-4 py-6 text-sm text-gray-500">Belum ada data pemeriksaan bulanan.</p>;

const CustomTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload as ChartDataPoint;

  return (
    <div className="w-64 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-modern">
      <p className="font-semibold text-gray-900">{data.monthLabel}</p>
      <p className="text-xs text-gray-500">Total pemeriksaan: {data.total}</p>

      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between text-sky-700">
          <span>Normal</span>
          <span>{data.normal}</span>
        </div>
        <div className="flex justify-between text-sky-800">
          <span>Perlu perhatian</span>
          <span>{data.needsAttention}</span>
        </div>
      </div>

      <div className="mt-3 border-t pt-2 text-[11px] text-gray-500">
        <p>Berat perlu perhatian: {data.weightAttention}</p>
        <p>Tinggi perlu perhatian: {data.heightAttention}</p>
        <p className="mt-1 leading-snug">Catatan: satu pemeriksaan dapat muncul di kedua kategori.</p>
      </div>
    </div>
  );
};

const BarChart = () => {
  const {
    data,
    isLoading,
    error,
  } = useSupabaseResource<MonthlyAnalysisRow[]>('dashboard-monthly-analysis', getMonthlyAnalysis, {
    initialData: [],
  });

  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (!data.length) return [];

    const normalizeStatus = (value?: string | null) => (value ? value.toLowerCase().trim() : '');

    const grouped = data.reduce<Record<number, ChartDataPoint>>((acc, item) => {
      const month = new Date(item.created_at).getMonth() + 1; // Jan = 1
      if (!acc[month]) {
        acc[month] = {
          month,
          monthLabel: MONTH_LABELS[month - 1],
          total: 0,
          normal: 0,
          needsAttention: 0,
          weightAttention: 0,
          heightAttention: 0,
        };
      }
      const entry = acc[month];

      entry.total += 1;

      const weightStatus = normalizeStatus(item.status_berat);
      const heightStatus = normalizeStatus(item.status_tinggi);

      const isWeightNormal = weightStatus === 'normal';
      const isHeightNormal = heightStatus === 'normal';

      if (!isWeightNormal) entry.weightAttention += 1;
      if (!isHeightNormal) entry.heightAttention += 1;
      if (isWeightNormal && isHeightNormal) entry.normal += 1;

      entry.needsAttention = Math.max(entry.total - entry.normal, 0);

      return acc;
    }, {});

    const latestMonth = Math.max(...Object.keys(grouped).map(Number), new Date().getMonth() + 1);
    const monthsToRender = Array.from({ length: latestMonth }, (_, i) => i + 1);

    return monthsToRender.map((month) => {
      const entry = grouped[month];
      return (
        entry || {
          month,
          monthLabel: MONTH_LABELS[month - 1],
          total: 0,
          normal: 0,
          needsAttention: 0,
          weightAttention: 0,
          heightAttention: 0,
        }
      );
    });
  }, [data]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!chartData.length) return <EmptyState />;

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="monthLabel" tickLine={false} />
          <YAxis allowDecimals={false} label={{ value: 'Jumlah Pemeriksaan', angle: -90, position: 'insideLeft', offset: 10 }} />
          <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} content={<CustomTooltip active={false} payload={[]} coordinate={{ x: 0, y: 0 }} accessibilityLayer={false} />} />
          <Legend wrapperStyle={{ paddingTop: 12 }} />

          <Bar dataKey="normal" stackId="checkups" fill="oklch(50% 0.134 242.749)" name="Normal" radius={[6, 6, 0, 0]} />
          <Bar dataKey="needsAttention" stackId="checkups" fill="oklch(44.3% 0.11 240.79)" name="Perlu perhatian" radius={[6, 6, 0, 0]} />
          <Line type="monotone" dataKey="total" name="Total pemeriksaan" stroke="oklch(58.8% 0.158 241.966)" strokeWidth={2} dot={{ r: 4, strokeWidth: 1, stroke: '#2563eb', fill: '#ffffff' }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;

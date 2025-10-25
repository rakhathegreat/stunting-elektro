import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { TooltipContentProps } from 'recharts';
import type { PieLabelRenderProps } from 'recharts/types/polar/Pie';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';

interface PieData {
  name: string;
  value: number;
}

interface StatusPieChartProps {
  data: PieData[];
}

interface PreparedSlice extends PieData {
  key: string;
  label: string;
  color: string;
  percent: number;
}

const STATUS_COLOR_MAP: Record<string, string> = {
  normal: 'oklch(50% 0.134 242.749)',
  gemuk: 'oklch(44.3% 0.11 240.79)',
  kurus: 'oklch(58.8% 0.158 241.966)',
  'sangat kurus': 'oklch(68.5% 0.169 237.323)',
  tinggi: 'oklch(44.3% 0.11 240.79)',
  pendek: 'oklch(58.8% 0.158 241.966)',
  'sangat pendek': 'oklch(68.5% 0.169 237.323)',
  'tidak diketahui': '#94a3b8',
};

const FALLBACK_COLOR = '#64748b';

const toKey = (value?: string) => value?.trim().toLowerCase() || 'tidak diketahui';

const toLabel = (value?: string) => {
  const normalized = value ? value.trim().toLowerCase() : 'tidak diketahui';
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const resolveRadius = (value?: number | string | ((dataPoint: any) => number)) => {
  if (typeof value === 'function') {
    return 0;
  }
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
};

const renderSliceLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelRenderProps) => {
  if (!percent || percent < 0.07) {
    return null;
  }

  const inner = resolveRadius(innerRadius);
  const outer = resolveRadius(outerRadius);
  const effectiveOuter = outer > inner ? outer : inner + 1;
  const radius = inner + (effectiveOuter - inner) * 0.6;
  const x = resolveRadius(cx) + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = resolveRadius(cy) + radius * Math.sin((-midAngle * Math.PI) / 180);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;

  const slice = payload[0].payload as PreparedSlice;

  return (
    <div className="min-w-[160px] z-50 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs shadow-modern">
      <p className="font-medium text-gray-900">{slice.label}</p>
      <p className="mt-1 text-gray-600">
        {slice.value} anak · {(slice.percent * 100).toFixed(1)}%
      </p>
    </div>
  );
};

const prepareSlices = (data: PieData[]): PreparedSlice[] => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return [];

  return data
    .filter((item) => item.value > 0)
    .map((item) => {
      const key = toKey(item.name);
      return {
        ...item,
        key,
        label: toLabel(item.name),
        color: STATUS_COLOR_MAP[key] ?? FALLBACK_COLOR,
        percent: item.value / total,
      };
    })
    .sort((a, b) => b.value - a.value);
};

const StatusPieChart = ({ data }: StatusPieChartProps) => {
  const slices = prepareSlices(data);
  const total = slices.reduce((sum, item) => sum + item.value, 0);

  if (!slices.length) {
    return (
      <div className="flex h-[280px] w-full items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-500">
        Belum ada data status gizi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={slices.length > 1 ? 2 : 0}
              labelLine={false}
              label={renderSliceLabel}
              stroke="#ffffff"
              strokeWidth={2}
            >
              {slices.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip active={false} payload={[]} coordinate={{ x: 0, y: 0 }} accessibilityLayer={false} />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <span className="text-xs font-medium text-gray-500">Total Anak</span>
          <span className="text-xl font-semibold text-gray-900">{total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <ul className="space-y-2 text-sm">
        {slices.map((slice) => (
          <li key={slice.key} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              {slice.label}
            </span>
            <span className="text-xs text-gray-600">
              {slice.value.toLocaleString('id-ID')} anak · {(slice.percent * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StatusPieChart;

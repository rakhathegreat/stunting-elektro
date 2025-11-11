import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { GrowthRecord } from '../types/growth';
import { whoStandards } from '../data/whoStandards';

interface GrowthChartProps {
  data: GrowthRecord[];
  selectedMetric: 'tinggi' | 'berat';
  gender?: string;
}

type WhoStandardRow = {
  bulan: number;
  sd3neg?: number;
  sd2neg?: number;
  sdneg?: number;
  sd1neg?: number;
  median?: number;
  sd1?: number;
  sd2?: number;
  sd3?: number;
};

const normalizeGender = (gender?: string) => {
  if (!gender) return 'boys';
  if (gender.toLowerCase().startsWith('l')) return 'boys';
  return 'girls';
};

const GrowthChart = ({ data, selectedMetric, gender: genderProp }: GrowthChartProps) => {
  const gender = normalizeGender(genderProp);

  const chartData = useMemo(() => {
    const source =
      selectedMetric === 'tinggi'
        ? gender === 'boys'
          ? whoStandards.heightBoys
          : whoStandards.heightGirls
        : gender === 'boys'
        ? whoStandards.weightBoys
        : whoStandards.weightGirls;
    const sourceRows = source as WhoStandardRow[];

    const childMap = new Map<number, GrowthRecord>();
    data.forEach((record) => {
      if (record.bulan !== undefined && record.bulan !== null) {
        childMap.set(record.bulan, record);
      }
    });

    const whoMap = new Map<number, WhoStandardRow>(sourceRows.map((item) => [item.bulan, item]));

    const allMonths = new Set<number>();
    sourceRows.forEach((who) => allMonths.add(who.bulan));
    data.forEach((record) => allMonths.add(record.bulan ?? 0));

    return Array.from(allMonths)
      .sort((a, b) => a - b)
      .map((month) => {
        const who = whoMap.get(month);
        const record = childMap.get(month);
        const anakValue = selectedMetric === 'tinggi' ? record?.tinggi : record?.berat;

        return {
          bulan: month,
          minus3sd: who?.sd3neg ?? null,
          minus2sd: who?.sd2neg ?? null,
          minus1sd: (who?.sdneg ?? who?.sd1neg) ?? null,
          median: who?.median ?? null,
          plus1sd: who?.sd1 ?? null,
          plus2sd: who?.sd2 ?? null,
          plus3sd: who?.sd3 ?? null,
          anak: anakValue ?? null,
        };
      });
  }, [data, selectedMetric, gender]);

  const yLabel = selectedMetric === 'tinggi' ? 'Tinggi (cm)' : 'Berat (kg)';

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="bulan" label={{ value: 'Usia (bulan)', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 6 }} />
          <Tooltip />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />

          {[
            { key: 'minus3sd', label: '-3 SD', stroke: '#dc2626' },
            { key: 'minus2sd', label: '-2 SD', stroke: '#ea580c' },
            { key: 'minus1sd', label: '-1 SD', stroke: '#16a34a' },
            { key: 'median', label: 'Median', stroke: '#22c55e' },
            { key: 'plus1sd', label: '+1 SD', stroke: '#16a34a' },
            { key: 'plus2sd', label: '+2 SD', stroke: '#ea580c' },
            { key: 'plus3sd', label: '+3 SD', stroke: '#dc2626' },
          ].map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={line.stroke}
              strokeDasharray="4 4"
              opacity={0.7}
              name={line.label}
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          ))}

          <Line
            type="monotone"
            dataKey="anak"
            stroke="#6082B6"
            name="Data Anak"
            strokeWidth={3}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;

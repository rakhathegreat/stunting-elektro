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

    const childMap = new Map<number, GrowthRecord>();
    data.forEach((record) => {
      if (record.bulan !== undefined && record.bulan !== null) {
        childMap.set(record.bulan, record);
      }
    });

    const allMonths = new Set<number>();
    source.forEach((who) => allMonths.add(who.bulan));
    data.forEach((record) => allMonths.add(record.bulan ?? 0));

    return Array.from(allMonths)
      .sort((a, b) => a - b)
      .map((month) => {
        const who = source.find((item) => item.bulan === month);
        const record = childMap.get(month);

        const sangatPendek = who?.sd3neg ?? null;
        const pendek = who?.sd2neg ?? null;
        const normal = who?.median ?? null;
        const tinggi = who?.sd1 ?? null;
        const anakValue = selectedMetric === 'tinggi' ? record?.tinggi : record?.berat;

        if (selectedMetric === 'tinggi') {
          return {
            bulan: month,
            sangat_pendek: sangatPendek,
            pendek,
            normal,
            tinggi,
            anak: anakValue ?? null,
          };
        }

        return {
          bulan: month,
          sangat_kurus: sangatPendek,
          kurus: pendek,
          normal,
          gemuk: tinggi,
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

          {selectedMetric === 'tinggi' ? (
            <>
              <Line type="monotone" dataKey="normal" stroke="#82ca9d" strokeDasharray="5 5" opacity={0.5} name="Normal" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="pendek" stroke="#8884d8" strokeDasharray="5 5" opacity={0.5} name="Pendek" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="sangat_pendek" stroke="#ff0000" strokeDasharray="5 5" opacity={0.5} name="Sangat Pendek" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="tinggi" stroke="#ff7300" strokeDasharray="5 5" opacity={0.5} name="Tinggi" dot={false} strokeWidth={2} />
            </>
          ) : (
            <>
              <Line type="monotone" dataKey="sangat_kurus" stroke="#ff0000" strokeDasharray="5 5" opacity={0.5} name="Sangat Kurus" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="kurus" stroke="#8884d8" strokeDasharray="5 5" opacity={0.5} name="Kurus" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="normal" stroke="#82ca9d" strokeDasharray="5 5" opacity={0.5} name="Normal" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="gemuk" stroke="#ff7300" strokeDasharray="5 5" opacity={0.5} name="Gemuk" dot={false} strokeWidth={2} />
            </>
          )}

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

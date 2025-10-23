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

    const growthMonths = data.map((record) => record.bulan);
    const filteredSource = source.filter((entry) => growthMonths.includes(entry.bulan));

    return filteredSource.map((entry) => {
      const record = data.find((item) => item.bulan === entry.bulan);
      if (selectedMetric === 'tinggi') {
        return {
          bulan: entry.bulan,
          sangat_pendek: entry.sd3neg - 3,
          pendek: entry.sd2neg,
          normal: entry.median,
          tinggi: entry.sd1,
          anak: record?.tinggi ?? null,
        };
      }

      return {
        bulan: entry.bulan,
        sangat_kurus: entry.sd3neg,
        kurus: entry.sd2neg,
        normal: entry.median,
        gemuk: entry.sd1,
        anak: record?.berat ?? null,
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

          <Line type="monotone" dataKey="anak" stroke="#6082B6" name="Data Anak" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GrowthChart;

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { whoStandards } from "../data/whoStandards";
import { supabase } from "../supabaseClient";

interface GrowthChartProps {
  gender: string;
  id: number | undefined;
  type: string;
}

const GrowthChart: React.FC<GrowthChartProps> = ({ gender, id, type }) => {
  const [growthData, setGrowthData] = useState<any[]>([]);

  const fetchGrowthData = async () => {
    if (!id) return;

    try {
      const { data: growth, error } = await supabase
        .from("Analisis")
        .select("*")
        .eq("id_anak", id)
        .order("bulan", { ascending: true });

      if (error) {
        console.error("Error fetching growth data:", error);
      } else {
        setGrowthData(growth || []);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchGrowthData();
  }, [id]);

  const height = gender === "Laki-laki" ? whoStandards.heightBoys : whoStandards.heightGirls;
  const weight = gender === "Laki-laki" ? whoStandards.weightBoys : whoStandards.weightGirls;

  // Ambil semua bulan yang ada di growthData
  const growthMonths = growthData.map((g) => g.bulan);
  

  // Filter WHO data sesuai bulan di growthData
  const filteredHeight = height.filter((d) => growthMonths.includes(d.bulan));
  const filteredWeight = weight.filter((d) => growthMonths.includes(d.bulan));


  // Gabungkan WHO + data anak
  const heightData = filteredHeight.map((d) => {
    const childRecord = growthData.find((g) => g.bulan === d.bulan);
    return {
      bulan: d.bulan,
      sangat_pendek: d.sd3neg - 3,
      pendek: d.sd2neg,
      normal: d.median,
      tinggi: d.sd1,
      tinggi_anak: childRecord ? childRecord.tinggi || childRecord.height : null,
    };
  });

  const weightData = filteredWeight.map((d) => {
    const childRecord = growthData.find((g) => g.bulan === d.bulan);
    return {
      bulan: d.bulan,
      sangat_kurus: d.sd3neg,
      kurus: d.sd2neg,
      normal: d.median,
      gemuk: d.sd1,
      berat_anak: childRecord ? childRecord.berat || childRecord.weight : null,
    };
  })

  return (
    <div className="w-full h-96">
      {type === 'height' ? (
        <ResponsiveContainer>
            <LineChart data={heightData} margin={{ top: 20, right: 20, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
                dataKey="bulan"
                label={{ value: "Usia (bulan)", position: "insideBottom", offset: -5 }}
            />
            <YAxis label={{ value: "Tinggi (cm)", angle: -90, position: "insideLeft", offset: 6 }} />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {/* WHO lines */}
            <Line type="monotone" dataKey="normal" stroke="#82ca9d" strokeDasharray="5 5" opacity={0.5} name="Normal" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="pendek" stroke="#8884d8" strokeDasharray="5 5" opacity={0.5} name="Pendek" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="sangat_pendek" stroke="#ff0000" strokeDasharray="5 5" opacity={0.5} name="Sangat Pendek" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="tinggi" stroke="#ff7300" strokeDasharray="5 5" opacity={0.5} name="Tinggi" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="tinggi_anak" stroke="#6082B6" name="Tinggi Anak" strokeWidth={3} />
            </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer>
            <LineChart data={weightData} margin={{ top: 20, right: 20, left: 0, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
                dataKey="bulan"
                label={{ value: "Usia (bulan)", position: "insideBottom", offset: -5 }}
            />
            <YAxis label={{ value: "Berag (kg)", angle: -90, position: "insideLeft", offset: 6 }} />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            {/* WHO lines */}
            <Line type="monotone" dataKey="sangat_kurus" stroke="#ff0000" strokeDasharray={"5 5"} opacity={0.5} name="Sangat Kurus" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="kurus" stroke="#8884d8" strokeDasharray={"5 5"} opacity={0.5} name="Kurus" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="normal" stroke="#82ca9d" strokeDasharray={"5 5"} opacity={0.5} name="Normal" dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="gemuk" stroke="#ff7300" strokeDasharray={"5 5"} opacity={0.5} name="Gemuk" dot={false} strokeWidth={2} />
            {/* Anak line */}
            <Line type="monotone" dataKey="berat_anak" stroke="#6082B6" name="Berat Anak" strokeWidth={3} />
            </LineChart>
        </ResponsiveContainer>   
      )}
    </div>
  );
};

export default GrowthChart;

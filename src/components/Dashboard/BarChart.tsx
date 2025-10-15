import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../supabaseClient';
import { extractErrorMessage, showError } from '../../utils/feedback';

interface Analisis {
    status_tinggi: string;
    status_berat: string;
    bulan: number;
}

interface ChartData {
    bulan: number;
    
    //status_berat
    gemuk: number;
    normalBerat: number;
    kurus: number;
    sangatKurus: number;

    //status_tinggi
    tinggi: number;
    normalTinggi: number;
    pendek: number;
    sangatPendek: number;
}

const StackedBarChartComponent: React.FC = () => {
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGrowthData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('Analisis')
                .select('status_tinggi, status_berat, bulan')
                .order('bulan', { ascending: true });

            if (error) {
                const message = extractErrorMessage(error, 'Gagal memuat data grafik');
                setError(message);
                showError('Gagal memuat data grafik', error);
            } else if (data) {
                // Group data by bulan
                const groupedByBulan: Record<number, ChartData> = {};

                data.forEach((item: Analisis) => {
                    const bulan = item.bulan;
                    if (!groupedByBulan[bulan]) {
                        groupedByBulan[bulan] = {
                            bulan: bulan,
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

                    // Hitung berdasarkan status berat
                    switch ((item.status_berat || '').toLowerCase()) {
                        case 'gemuk':
                            groupedByBulan[bulan].gemuk++;
                            break;
                        case 'normal':
                            groupedByBulan[bulan].normalBerat++;
                            break;
                        case 'kurus':
                            groupedByBulan[bulan].kurus++;
                            break;
                        case 'sangat kurus':
                            groupedByBulan[bulan].sangatKurus++;
                            break;
                    }

                    // Hitung berdasarkan status tinggi
                    switch ((item.status_tinggi || '').toLowerCase()) {
                        case 'tinggi':
                            groupedByBulan[bulan].tinggi++;
                            break;
                        case 'normal':
                            groupedByBulan[bulan].normalTinggi++;
                            break;
                        case 'pendek':
                            groupedByBulan[bulan].pendek++;
                            break;
                        case 'sangat pendek':
                            groupedByBulan[bulan].sangatPendek++;
                            break;
                    }
                });

                // Convert ke array dan sort by bulan
                const chartDataArray: ChartData[] = Object.values(groupedByBulan)
                    .sort((a, b) => a.bulan - b.bulan);

                setChartData(chartDataArray);
            }
        } catch (err) {
            const message = extractErrorMessage(err, 'Terjadi kesalahan saat memuat data.');
            setError(message);
            showError('Terjadi kesalahan saat memuat data.', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGrowthData();
    }, [fetchGrowthData]);

    if (loading) return <p>Memuat data grafik...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={chartData}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                dataKey="bulan"
                label={{ value: 'Bulan', position: 'insideBottom', offset: -5 }}
                />
                <YAxis label={{ value: 'Jumlah Anak', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />

                {/* Status Berat */}
                <Bar dataKey="gemuk" stackId="berat" fill="#E53935" name="Gemuk" /> {/* Merah */}
                <Bar dataKey="normalBerat" stackId="berat" fill="#43A047" name="Normal (Berat)" /> {/* Hijau */}
                <Bar dataKey="kurus" stackId="berat" fill="#FB8C00" name="Kurus" /> {/* Oranye */}
                <Bar dataKey="sangatKurus" stackId="berat" fill="#6D4C41" name="Sangat Kurus" /> {/* Cokelat */}

                {/* Status Tinggi */}
                <Bar dataKey="tinggi" stackId="tinggi" fill="#1E88E5" name="Tinggi" /> {/* Biru */}
                <Bar dataKey="normalTinggi" stackId="tinggi" fill="#7CB342" name="Normal (Tinggi)" /> {/* Hijau Muda */}
                <Bar dataKey="pendek" stackId="tinggi" fill="#FDD835" name="Pendek" /> {/* Kuning */}
                <Bar dataKey="sangatPendek" stackId="tinggi" fill="#546E7A" name="Sangat Pendek" /> {/* Abu Kebiruan */}
            </BarChart>
            </ResponsiveContainer>
        </div>
    );

};

export default StackedBarChartComponent;
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, 
  User, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  FileText,
  Ruler,
} from 'lucide-react';
import type { Child } from '../types/children';
import type { GrowthRecord } from '../types/growth';
import {supabase} from '../supabaseClient';

const BabyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [baby, setBaby] = useState<Child | null>(null);

  const fetchBabyById = async(id: string) => {
    const { data, error } = await supabase
      .from('DataAnak')
      .select(`*, id_orang_tua (id, nama_ayah, nama_ibu)`)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching baby:', error);
      return null;
    }

    return data;
  }

  useEffect(() => {
    if (id) {
      fetchBabyById(id).then(setBaby);
    }
  }, [id]);

  const growthData: GrowthRecord[] = [
    {
      date: '2024-01-15',
      age: '14 bulan',
      height: 78,
      weight: 9.2,
      headCircumference: 46,
      status: 'Normal',
      statusColor: 'green',
      confidence: 85,
      notes: 'Pertumbuhan sesuai kurva normal'
    },
    {
      date: '2023-12-15',
      age: '13 bulan',
      height: 76,
      weight: 8.8,
      headCircumference: 45.5,
      status: 'Normal',
      statusColor: 'green',
      confidence: 88,
      notes: 'Perkembangan baik'
    },
    {
      date: '2023-11-15',
      age: '12 bulan',
      height: 74,
      weight: 8.4,
      headCircumference: 45,
      status: 'Normal',
      statusColor: 'green',
      confidence: 90,
      notes: 'Milestone perkembangan tercapai'
    },
    {
      date: '2023-10-15',
      age: '11 bulan',
      height: 72,
      weight: 8.0,
      headCircumference: 44.5,
      status: 'Normal',
      statusColor: 'green',
      confidence: 87,
      notes: 'Mulai belajar berjalan'
    }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Activity },
    { id: 'growth', name: 'Grafik Pertumbuhan', icon: TrendingUp },
    { id: 'examinations', name: 'Riwayat Pemeriksaan', icon: FileText },
  ];

  const getGrowthTrend = (current: number, previous: number) => {
    if (current > previous) {
      return { icon: TrendingUp, color: 'text-green-600', text: 'Naik' };
    } else if (current < previous) {
      return { icon: TrendingDown, color: 'text-red-600', text: 'Turun' };
    } else {
      return { icon: TrendingUp, color: 'text-gray-600', text: 'Stabil' };
    }
  };

  const latestGrowth = growthData[0];
  const previousGrowth = growthData[1];
  const heightTrend = getGrowthTrend(latestGrowth.height, previousGrowth.height);
  // const weightTrend = getGrowthTrend(latestGrowth.weight, previousGrowth.weight);

  return (
    <div className="grid grid-cols-4 grid-rows-1 gap-4 px-6 h-[calc(75vh)]">
      <div className="col-span-1 bg-white shadow-md rounded-2xl h-full">
        <div className='flex flex-col h-full py-6 px-6 gap-4'>
            <div className='flex justify-center'>
              <div className='w-42 h-42 bg-gray-500 rounded-full'>
              </div>
            </div>  

            <div className='flex flex-col items-center gap-1'>
              <h3 className="text-xl font-bold text-gray-900">{baby?.nama}</h3>
              <p className="text-gray-500 font-medium">0 Bulan • Laki-laki</p>
            </div>

            <div className='flex flex-col gap-2'>

              <h4 className='text-lg font-bold text-gray-900'>Informasi Dasar</h4>

              <div className="space-y-1 bg-gray-50 py-2 rounded-2xl">
                <div className="flex items-center space-x-4 py-2 rounded-xl">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Tanggal Lahir</p>
                    <p className="font-bold text-gray-900">{new Date(baby?.tanggal_lahir as string).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 py-2 rounded-xl">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-2">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Orang Tua</p>
                    <button 
                      onClick={() => navigate(`/parents/${baby?.id_orang_tua?.id}`)}
                      className="font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {baby?.id_orang_tua?.nama_ayah || baby?.id_orang_tua?.nama_ibu}
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 py-2 rounded-xl">
                  <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-2">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">Terdaftar Sejak</p>
                    <p className="font-bold text-gray-900">{new Date(baby?.created_at as string).toLocaleDateString()}</p>
                  </div>
                </div>

              </div>
            </div>
        </div>
      </div>
      <div className="col-span-3 col-start-2 bg-white shadow-md rounded-2xl h-full overflow-scroll">

        <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className='p-6'>
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className={`p-4 rounded-2xl border-2 shadow-modern-lg ${
                baby?.status === 'Normal' 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : baby?.status === 'Stunting'
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                  : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    {baby?.status === 'Normal' ? (
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-modern">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4 shadow-modern">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Status: {baby?.status}</h3>
                      <p className="text-sm text-gray-600 font-medium mt-1">Berdasarkan pemeriksaan terakhir ({latestGrowth.date})</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className='space-y-2 mt-6'>
                <h3 className='text-lg font-bold text-gray-900'>Statistik</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-row items-center card-modern px-6 py-4 space-x-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-modern">
                        <Ruler className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Tinggi Badan</p>
                      <p className="text-xl font-bold text-gray-900">{latestGrowth.height} cm</p>
                      <p className="text-xs text-gray-500 font-medium">Sebelum: {previousGrowth.height} cm</p>
                    </div>
                    <div className={`flex items-start ${heightTrend.color} h-full`}>
                      <heightTrend.icon className="h-4 w-4 mr-1" />
                      <span className="text-xs font-semibold">{heightTrend.text}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-row items-center card-modern px-6 py-4 space-x-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-modern">
                        <Ruler className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Berat Badan</p>
                      <p className="text-xl font-bold text-gray-900">{latestGrowth.height} cm</p>
                      <p className="text-xs text-gray-500 font-medium">Sebelum: {previousGrowth.height} cm</p>
                    </div>
                    <div className={`flex items-start ${heightTrend.color} h-full`}>
                      <heightTrend.icon className="h-4 w-4 mr-1" />
                      <span className="text-xs font-semibold">{heightTrend.text}</span>
                    </div>
                  </div>

                  <div className="flex flex-row items-center card-modern px-6 py-4 space-x-4 border border-gray-200 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-3 shadow-modern">
                        <Ruler className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">Pemeriksaan</p>
                      <p className="text-xl font-bold text-gray-900">{growthData.length}</p>
                      <p className="text-xs text-gray-500 font-medium">Sejak: {new Date(baby?.created_at as string).toLocaleDateString()}</p>
                    </div>
                  </div>

                </div>
              </div>

              <div className='space-y-2 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <h3 className='text-lg font-bold text-gray-900'>Catatan Medis</h3>
                  <div className='border border-gray-200 rounded-xl p-4'>
                    <p className='text-gray-600 font-medium'>Tidak ada catatan medis</p>
                  </div>
                </div>
                <div className='space-y-2'>
                  <h3 className='text-lg font-bold text-gray-900'>Alergi</h3>
                  <div className='border border-gray-200 rounded-xl p-4'>
                    <p className='text-gray-600 font-medium'>Tidak ada alergi yang diketahui</p>
                  </div>
                </div>
              </div>

            </div>

          )}

          {/* Growth Chart Tab */}
          {activeTab === 'growth' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-gray-900">Grafik Pertumbuhan</h3>
              <div className="card-modern p-12 text-center bg-gradient-to-br">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 inline-block mb-6">
                  <TrendingUp className="h-12 w-12 text-white" />
                </div>
                <p className="text-gray-600 mb-4 font-medium text-lg">Grafik pertumbuhan akan ditampilkan di sini</p>
                <p className="text-sm text-gray-500">Integrasi dengan library chart seperti Chart.js atau Recharts</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-modern p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Tinggi Badan</h4>
                  <div className="space-y-3">
                    {growthData.slice(0, 3).map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{data.date}</span>
                        <span className="font-bold text-blue-900">{data.height} cm</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-modern p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">Berat Badan</h4>
                  <div className="space-y-3">
                    {growthData.slice(0, 3).map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600 font-medium">{data.date}</span>
                        <span className="font-bold text-green-900">{data.weight} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Examinations Tab */}
          {activeTab === 'examinations' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">Riwayat Pemeriksaan Lengkap</h3>
                <div className="grid grid-cols-12 grid-rows-5 gap-4">
                  {Array.from({ length: 60 }, (_, index) => (
                    <div
                      key={index}
                      className="flex bg-gray-200 rounded-xl p-4 font-medium items-center justify-center"
                    >
                      {index}
                    </div>
                  ))}
                </div>
              {/* <div className="space-y-4">
                {growthData.map((exam, index) => (
                  <div key={index} className="card-modern px-6 py-4 border border-gray-200 rounded-xl">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">Pemeriksaan {exam.age}</h4>
                        <p className="text-sm text-gray-600 font-medium">{exam.date}</p>
                      </div>
                      <span className={`px-4 py-2 text-sm font-bold rounded-full ${
                        exam.statusColor === 'green' 
                          ? 'badge-success'
                          : exam.statusColor === 'yellow'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}>
                        {exam.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-sm text-gray-600 font-semibold">Tinggi</p>
                        <p className="font-bold text-blue-900 text-xl">{exam.height} cm</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <p className="text-sm text-gray-600 font-semibold">Berat</p>
                        <p className="font-bold text-green-900 text-xl">{exam.weight} kg</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default BabyDetail;
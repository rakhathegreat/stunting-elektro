import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { supabase } from "../supabaseClient";
import BabyData from "../components/baby/baby-data-form";
import type { Child } from "../types/children";
import type { GrowthRecord } from "../types/growth";

const BabyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [children, setChildren] = useState<Child | null>(null);
  const [growthData, setGrowthData] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>('tinggi');

  /* ---------- fetch data bayi ---------- */
  const fetchChildren = async () => {
    if (!id) return;
    setLoading(true);

    // 1) data anak + ortu
    const { data: baby, error: babyError } = await supabase
      .from("DataAnak")
      .select("*, DataOrangTua(id, nama_ayah, nama_ibu)")
      .eq("id", id)
      .single();

    if (babyError) {
      console.error("Error fetching children:", babyError);
      setLoading(false);
      return;
    }

    // 2) data pertumbuhan
    const { data: growth, error: growthError } = await supabase
      .from("Analisis")
      .select("*")
      .eq("id_anak", id)
      .order("created_at", { ascending: false });

    if (growthError) {
      console.error("Error fetching growth:", growthError);
    } else {
      setGrowthData(growth || []);
    }

    setChildren(baby);
    setLoading(false);
  };

  /* ---------- useEffect ---------- */

  useEffect(() => {
    fetchChildren();
  }, []); //eslint-disable-line

  const getGrowthTrend = (current: number, previous: number) => {
    if (current > previous) {
      return { icon: TrendingUp, color: "text-green-600", text: "Naik" };
    } else if (current < previous) {
      return { icon: TrendingDown, color: "text-red-600", text: "Turun" };
    } else {
      return { icon: TrendingUp, color: "text-gray-600", text: "Stabil" };
    }
  };

  const latestGrowth = growthData[0];
  const previousGrowth = growthData[1];
  const heightTrend = getGrowthTrend(
    latestGrowth?.tinggi || 0,
    previousGrowth?.tinggi || 0
  );
  const weightTrend = getGrowthTrend(
    latestGrowth?.berat || 0,
    previousGrowth?.berat || 0
  );

  /* ---------- tabs ---------- */
  const tabs = [
    { id: "overview", name: "Overview", icon: Activity },
    { id: "growth", name: "Grafik Pertumbuhan", icon: TrendingUp },
    { id: "examinations", name: "Riwayat Pemeriksaan", icon: FileText },
    { id: "babydata", name: "Data Bayi", icon: Ruler },
  ];

  const updateBaby = () => {
    fetchChildren();
  };

  /* ---------- loading / not found ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Memuat data bayi...</p>
      </div>
    );
  }

  if (!children) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">Data bayi tidak ditemukan.</p>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="grid grid-cols-4 grid-rows-1 gap-4 px-6 h-[calc(75vh)]">
      {/* SIDEBAR */}
      <div className="col-span-1 bg-white shadow-md rounded-2xl h-full">
        <div className="flex flex-col h-full py-6 px-6 gap-4">
          <div className="flex flex-col h-full py-6 px-6 gap-4">
            <div className="flex justify-center">
              <div className="w-32 h-32 bg-gray-300 rounded-full" />
            </div>

            <div className="flex flex-col items-center gap-1">
              <h3 className="text-xl font-bold text-gray-900">
                {children.nama}
              </h3>
              <p className="text-gray-500 font-medium">
                {children.umur} bulan • {children.gender}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-lg font-bold text-gray-900">
                Informasi Dasar
              </h4>

              <div className="space-y-1 bg-gray-50 py-2 rounded-2xl">
                {/* Tanggal Lahir */}
                <div className="flex items-center space-x-4 py-2">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Tanggal Lahir
                    </p>
                    <p className="font-bold text-gray-900">
                      {children.tanggal_lahir}
                    </p>
                  </div>
                </div>

                {/* Orang Tua */}
                <div className="flex items-center space-x-4 py-2">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-2">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Orang Tua
                    </p>
                    <button
                      onClick={() =>
                        navigate(`/parents/${children.id_orang_tua}`)
                      }
                      className="font-bold text-blue-600 hover:text-blue-800 transition-colors text-start"
                    >
                      {children.DataOrangTua?.nama_ayah} &{" "}
                      {children.DataOrangTua?.nama_ibu}
                    </button>
                  </div>
                </div>

                {/* Terdaftar Sejak */}
                <div className="flex items-center space-x-4 py-2">
                  <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg p-2">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">
                      Terdaftar Sejak
                    </p>
                    <p className="font-bold text-gray-900">
                      {new Date(children.created_at).toLocaleDateString(
                        "id-ID"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="col-span-3 col-start-2 bg-white shadow-md rounded-2xl h-full overflow-y-auto">
        {/* TABS */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* ---------- Overview ---------- */}
          {activeTab === 'overview' && (
            <div className='w-full'>
              {/* Status Card */}
              <div className='grid grid-cols-2 gap-4'>
                <div
                  className={`p-4 rounded-2xl border-2 shadow-lg ${
                    children.status_tinggi === 'Normal'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : children.status === 'Pendek'
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    {children.status_berat === 'Normal' ? ( 
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Status Tinggi: {children.status_tinggi}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Berdasarkan pemeriksaan terakhir (
                        {latestGrowth.created_at
                          ? new Date(latestGrowth.created_at).toLocaleDateString('id-ID')
                          : '-'})
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={`p-4 rounded-2xl border-2 shadow-lg ${
                    children.status_berat === 'Normal'
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : children.status === 'Kurus'
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-6">
                    {children.status_berat === 'Normal' ? (
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-4">
                        <AlertCircle className="h-5 w-5 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Status Berat: {children.status_berat}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Berdasarkan pemeriksaan terakhir (
                        {latestGrowth.created_at
                          ? new Date(latestGrowth.created_at).toLocaleDateString('id-ID')
                          : '-'})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistik */}
              <div className="space-y-2 mt-6">
                <h3 className="text-lg font-bold text-gray-900">Statistik</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tinggi */}
                  <div className="flex flex-row items-center px-6 py-4 space-x-4 border border-gray-200 rounded-xl">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3">
                      <Ruler className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600">
                        Tinggi Badan
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {latestGrowth.tinggi || "-"} cm
                      </p>
                      <p className="text-xs text-gray-500">
                        Sebelum: {previousGrowth.berat || "-"} cm
                      </p>
                    </div>
                    <div
                      className={`flex items-start ${heightTrend.color} h-full`}
                    >
                      <heightTrend.icon className="h-4 w-4 mr-1" />
                      <span className="text-xs font-semibold">
                        {heightTrend.text}
                      </span>
                    </div>
                  </div>

                  {/* Berat */}
                  <div className="flex flex-row items-center px-6 py-4 space-x-4 border border-gray-200 rounded-xl">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3">
                      <Ruler className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600">
                        Berat Badan
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {latestGrowth.tinggi || "-"} kg
                      </p>
                      <p className="text-xs text-gray-500">
                        Sebelum: {previousGrowth.tinggi || "-"} kg
                      </p>
                    </div>
                    <div
                      className={`flex items-start ${weightTrend.color} h-full`}
                    >
                      <weightTrend.icon className="h-4 w-4 mr-1" />
                      <span className="text-xs font-semibold">
                        {weightTrend.text}
                      </span>
                    </div>
                  </div>

                  {/* Jumlah Pemeriksaan */}
                  <div className="flex flex-row items-center px-6 py-4 space-x-4 border border-gray-200 rounded-xl">
                    <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3">
                      <Ruler className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        Pemeriksaan
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {growthData.length}
                      </p>
                      <p className="text-xs text-gray-500">
                        Sejak:{" "}
                        {new Date(children.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Catatan Medis & Alergi */}
              <div className="space-y-2 mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Catatan Medis
                  </h3>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-600 font-medium">
                      {children.catatan ||
                        "Tidak ada catatan medis yang diketahui"}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Alergi</h3>
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-gray-600 font-medium">
                      {children.alergi || "Tidak ada alergi yang diketahui"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------- Growth Chart ---------- */}
          {activeTab === 'growth' && (
      <div className="space-y-6">
        <div className='flex items-center justify-between'>
          <h3 className="text-xl font-bold text-gray-900">Grafik Pertumbuhan</h3>

          {/* Toggle Button */}
          <div className='border border-gray-200 p-1 rounded-lg flex items-center'>
            <button
              className={`font-medium px-8 py-2 rounded-lg transition-colors duration-200 hover:cursor-pointer ${
                selected === 'tinggi' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}
              onClick={() => setSelected('tinggi')}
            >
              Tinggi
            </button>
            <button
              className={`font-medium px-8 py-2 rounded-lg transition-colors duration-200 hover:cursor-pointer ${
                selected === 'berat' ? 'bg-blue-600 text-white' : 'text-gray-300'
              }`}
              onClick={() => setSelected('berat')}
            >
              Berat
            </button>
          </div>
        </div>

        {growthData.length === 0 ? (
          <div className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
            <div className="bg-blue-500 rounded-2xl p-6 inline-block mb-6">
              <TrendingUp className="h-12 w-12 text-white" />
            </div>
            <p className="text-gray-600 mb-4 font-medium text-lg">
              Grafik pertumbuhan akan ditampilkan di sini
            </p>
            <p className="text-sm text-gray-500">
              Belum ada data pemeriksaan untuk ditampilkan.
            </p>
          </div>
        ) : (
          <>
            {/* CHART */}
            {selected === 'tinggi' ? (
              <GrowthChart type="height" gender={children.gender} id={children.id} />
            ) : (
              <GrowthChart type="weight" gender={children.gender} id={children.id} />
            )}
          </>
        )}
      </div>
    )}

    {/* TABS */}

          {/* ---------- Examinations ---------- */}
          {activeTab === "examinations" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                Riwayat Pemeriksaan Lengkap
              </h3>
              {growthData.length === 0 ? (
                <p className="text-gray-500">Belum ada data pemeriksaan.</p>
              ) : (
                <div className="space-y-4">
                  {growthData.map((exam, i) => (
                    <div
                      key={i}
                      className="px-6 py-4 border border-gray-200 rounded-xl"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">
                            Pemeriksaan ke-{i + 1}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium">
                            {new Date(exam.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-2 text-sm font-bold rounded-full ${
                            exam.status === "Normal"
                              ? "bg-green-100 text-green-800"
                              : exam.status === "Stunting"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {exam.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-xl">
                          <p className="text-sm text-gray-600 font-semibold">Tinggi</p>
                          <p className="font-bold text-blue-900 text-xl">{exam.tinggi} cm</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-xl">
                          <p className="text-sm text-gray-600 font-semibold">Berat</p>
                          <p className="font-bold text-green-900 text-xl">{exam.berat} kg</p>
                        </div>
                        {exam.lingkarKepala && (
                          <div className="text-center p-4 bg-purple-50 rounded-xl">
                            <p className="text-sm text-gray-600 font-semibold">
                              Lingkar Kepala
                            </p>
                            <p className="font-bold text-purple-900 text-xl">
                              {exam.lingkarKepala} cm
                            </p>
                          </div>
                        )}
                      </div>

                      {exam.notes && (
                        <p className="mt-3 text-sm text-gray-600 italic">
                          Catatan: {exam.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "babydata" && (
            <BabyData child={children as Child} updateBaby={updateBaby} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BabyDetail;

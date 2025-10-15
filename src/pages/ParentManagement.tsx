import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, MapPin, Users, TrendingUp, Phone, Mail, Eye, Edit, Trash2 } from "lucide-react";
import { supabase } from "../supabaseClient";
import type { Parent } from "../types/parent";
import type { Child } from "../types/children";
import { showError, showSuccess } from "../utils/feedback";

const today = () => new Date().toISOString().slice(0, 10);

interface Snapshot {
  date: string;
  total: number;
  aktif: number;
  anak: number;
}

const loadHistory = (): Snapshot[] => {
  try {
    return JSON.parse(localStorage.getItem("parent_history") || "[]");
  } catch {
    return [];
  }
};

const saveHistory = (list: Snapshot[]) =>
  localStorage.setItem("parent_history", JSON.stringify(list));

const ParentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_hp: "",
  });

  /* fetch data */
  const fetchParents = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("DataOrangTua").select("*");
      if (error) {
        throw error;
      }
      setParents(data || []);
    } catch (error) {
      showError("Gagal memuat data orang tua", error);
    }
  }, []);

  const fetchChildren = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("DataAnak")
        .select(`*, DataOrangTua(id, nama_ayah, nama_ibu)`);

      if (error) {
        throw error;
      }

      setChildren(data || []);
    } catch (error) {
      showError("Gagal memuat data anak", error);
    }
  }, []);

  useEffect(() => {
    fetchParents();
    fetchChildren();
  }, [fetchParents, fetchChildren]);

  /* statistik + trending per-hari */
  const totalParents = parents.length;
  const aktifParents = parents.filter((p) => p.status_aktif === "Aktif").length;
  const totalChildrenCount = children.length;

  const [trend, setTrend] = useState({ total: 0, aktif: 0, anak: 0, inactive: 0 });

  useEffect(() => {
    const history = loadHistory();
    const todayStr = today();
    const yesterdayStr = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    const todayData = {
      date: todayStr,
      total: totalParents,
      aktif: aktifParents,
      anak: totalChildrenCount,
    };
    const idx = history.findIndex((h) => h.date === todayStr);
    idx === -1 ? history.push(todayData) : (history[idx] = todayData);
    saveHistory(history);

    const y = history.find((h) => h.date === yesterdayStr) || {
      total: 0,
      aktif: 0,
      anak: 0,
    };
    const inactiveToday = totalParents - aktifParents;
    const inactiveYesterday = y.total - y.aktif;
    setTrend({
      total: totalParents - y.total,
      aktif: aktifParents - y.aktif,
      anak: totalChildrenCount - y.anak,
      inactive: inactiveToday - inactiveYesterday,
    });
  }, [totalParents, aktifParents, totalChildrenCount]);

  const statsData = [
    {
      name: "Total Orang Tua",
      stat: totalParents.toLocaleString("id-ID"),
      change: `${trend.total >= 0 ? "+" : ""}${trend.total}`,
      color: "blue",
      icon: Users,
    },
    {
      name: "Aktif",
      stat: aktifParents.toLocaleString("id-ID"),
      change: `${trend.aktif >= 0 ? "+" : ""}${trend.aktif}`,
      color: "green",
      icon: Users,
    },
    {
      name: "Tidak Aktif",
      stat: (totalParents - aktifParents).toLocaleString("id-ID"),
      change: `${trend.inactive >= 0 ? "+" : ""}${trend.inactive}`,
      color: "red",
      icon: Users,
    },
    {
      name: "Total Anak",
      stat: totalChildrenCount.toLocaleString("id-ID"),
      change: `${trend.anak >= 0 ? "+" : ""}${trend.anak}`,
      color: "blue",
      icon: Users,
    },
  ];

  /* tambah data */
  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from("DataOrangTua").insert([formData]);
      if (error) {
        throw error;
      }

      setShowAddModal(false);
      setFormData({ nama: "", email: "", no_hp: "" });
      await fetchParents();
      showSuccess("Data orang tua berhasil ditambahkan");
    } catch (error) {
      showError("Gagal menambahkan data orang tua", error);
    }
  };

  /* filter */
  const filteredParents = parents.filter(
    (p) =>
      (p.nama_ibu || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.nama_ayah || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChildCount = (parentId: string) =>
    children.filter((c) => c?.DataOrangTua?.id === parentId).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <div
            key={item.name}
            className="bg-white relative glass pt-6 px-6 pb-6 shadow-modern rounded-2xl overflow-hidden hover:shadow-modern-lg transition-all hover:scale-[1.02] shadow-md"
          >
            <dt>
              <div
                className={`absolute bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 rounded-xl p-3 shadow-modern`}
              >
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-semibold text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{item.stat}</p>
              <p
                className={`ml-3 flex items-baseline text-sm font-semibold ${
                  Number(item.change) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp
                  className="self-center flex-shrink-0 h-4 w-4 mr-1"
                  aria-hidden="true"
                />
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Parents Grid */}
        <div className="w-full px-6">
          <div className="bg-white rounded-2xl shadow-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">
                Pemeriksaan Terbaru
              </h3>

              <div className="flex flex-col pb-4 sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari orang tua..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Orang Tua
                </button>
              </div>
                      
              {/* Wrapper dengan scroll horizontal untuk mobile */}
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-full divide-y divide-gray-100">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Nama
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Kontak
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Alamat
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Pekerjaan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Jumlah Anak
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Tanggal Daftar
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {filteredParents.map((parent) => (
                      <tr key={parent.id} onClick={() => navigate(`/parents/${parent.id}`)} className="hover:bg-gray-100 hover:cursor-pointer transition-colors">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/parents/${parent.id}`)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                          >
                            {parent.nama_ayah} & <br />{parent.nama_ibu}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium">
                              <Phone className="h-3 w-3 mr-2" />
                              {parent.no_hp}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="h-3 w-3 mr-2" />
                              {parent.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {parent.alamat}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium">{parent.pekerjaan}</div>
                            <div className="text-sm text-muted-foreground">{parent.pendidikan}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{getChildCount(parent?.id as string)} anak</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            parent.status_aktif === 'Aktif' 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                              : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800'
                          }`}>
                            {parent.status_aktif}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-muted-foreground">{parent.created_at.slice(0, 10)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-start gap-2">
                            <button className="text-gray-600 p-2 rounded hover:text-white hover:bg-blue-400">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 p-2 rounded hover:text-white hover:bg-blue-400">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 p-2 rounded hover:text-white hover:bg-red-400">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        
      </div>

      {filteredParents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">Tidak ada data orang tua</p>
          <p className="mt-2">
            Coba ubah kata kunci pencarian atau tambah orang tua baru
          </p>
        </div>
      )}

      {/* Add Parent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600/50 backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tambah Orang Tua Baru
            </h3>
            <form onSubmit={handleAddParent} className="space-y-4">
              <input
                type="text"
                placeholder="Nama Lengkap"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Nomor Telepon"
                value={formData.no_hp}
                onChange={(e) =>
                  setFormData({ ...formData, no_hp: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg"
              />
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentManagement;

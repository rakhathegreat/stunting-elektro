import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  User,
  Users,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { supabase } from "../supabaseClient";
import type { Child } from "../types/children";
import type { Parent } from "../types/parent";
import EditModal from "../components/Dashboard/EditModal";
import DeleteModal from "../components/DeleteModal";
import AddModal from "../components/baby/AddModal";

const today = () => new Date().toISOString().slice(0, 10);

interface Snapshot {
  date: string;
  total: number;
  boys: number;
  girls: number;
}

const loadHistory = (): Snapshot[] => {
  try {
    return JSON.parse(localStorage.getItem("baby_history") || "[]");
  } catch {
    return [];
  }
};

const saveHistory = (list: Snapshot[]) =>
  localStorage.setItem("baby_history", JSON.stringify(list));

const BabyManagement: React.FC = () => {
  const formatNumber = (n: number) => new Intl.NumberFormat('id-ID').format(n);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [statusTinggiFilter, setStatusTinggiFilter] = useState("");
  const [statusBeratFilter,  setStatusBeratFilter]  = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const totalChildren = children.length;
  const boys   = children.filter(c => c.gender === "boys").length;
  const girls  = children.filter(c => c.gender === "girls").length;
  const avgAge =
    totalChildren === 0
      ? 0
      : children.reduce((sum, c) => sum + (c.umur || 0), 0) / totalChildren;

  const [trend, setTrend] = useState({ total: 0, boys: 0, girls: 0 });

  useEffect(() => {
    const history = loadHistory();
    const todayStr = today();
    const yesterdayStr = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);

    // simpan/ update hari ini
    const todayIdx = history.findIndex(h => h.date === todayStr);
    const todayData = { date: todayStr, total: totalChildren, boys, girls };
    if (todayIdx === -1) history.push(todayData);
    else history[todayIdx] = todayData;
    saveHistory(history);

    // ambil snapshot kemarin
    const y = history.find(h => h.date === yesterdayStr) || {
      total: 0,
      boys: 0,
      girls: 0,
    };
    setTrend({
      total: totalChildren - y.total,
      boys: boys - y.boys,
      girls: girls - y.girls,
    });
  }, [totalChildren, boys, girls]);

  // statsData otomatis ter-update
  const statsData = [
    {
      name: "Total Anak",
      stat: formatNumber(totalChildren),
      change: `${trend.total >= 0 ? "+" : ""}${trend.total}`,
      color: "blue",
      icon: Users,
    },
    {
      name: "Jumlah Laki-laki",
      stat: formatNumber(boys),
      change: `${trend.boys >= 0 ? "+" : ""}${trend.boys}`,
      color: "green",
      icon: Users,
    },
    {
      name: "Jumlah Perempuan",
      stat: formatNumber(girls),
      change: `${trend.girls >= 0 ? "+" : ""}${trend.girls}`,
      color: "yellow",
      icon: Users,
    },
    {
      name: "Rata-Rata Usia",
      stat: `${avgAge.toFixed(1)} bln`,
      change: "+0",
      color: "indigo",
      icon: Users,
    },
  ];

  // 🔹 Ambil data dari Supabase
  const fetchParents = async () => {
    const { data, error } = await supabase.from("DataOrangTua").select("*");
    if (error) {
      console.error("Error fetching parents:", error);
    } else {
      setParents(data || []);
    }
  };

 useEffect(() => {
    fetchParents();
    fetchChildren();
  }, []);


  const fetchChildren = async () => {
    const { data, error } = await supabase.from("DataAnak").select(`
        *,
        DataOrangTua (
          nama_ayah,
          nama_ibu
        )
      `)
      .neq("nama", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching children:", error);
    } else {
      setChildren(data || []);
    }
  };


  // 🔹 Filter pencarian
  const filteredChildren = children.filter((child) => {
    const term = searchTerm.toLowerCase();

    const matchSearch =
      (child?.nama || "").toLowerCase().includes(term) ||
      (child?.gender || "").toLowerCase().includes(term) ||
      (
        (child.DataOrangTua?.nama_ayah || "") +
        (child.DataOrangTua?.nama_ibu || "")
      ).toLowerCase().includes(term);

    const matchStatusTinggi =
      !statusTinggiFilter || (child?.status_tinggi || "") === statusTinggiFilter;

    const matchStatusBerat =
      !statusBeratFilter || (child?.status_berat || "") === statusBeratFilter;

    const matchGender =
      !genderFilter || (child?.gender || "") === genderFilter;

    return matchSearch && matchStatusTinggi && matchStatusBerat && matchGender;
  });

  // Buka modal hapus
  const openDeleteModal = (child: Child) => {
    setSelectedChild(child);
    setShowDeleteModal(true);
  };

  /* ------------- HANDLER ------------- */

  // Konfirmasi hapus
  const handleDelete = async () => {
    if (!selectedChild) return;
    console.log("Deleting child id:", selectedChild.id);

    const { error, status } = await supabase
      .from("DataAnak")
      .delete()
      .eq("id", selectedChild.id);

    if (error) {
      console.error("Delete error:", error);
    } else {
      console.log("Delete success, status:", status); // 204
      await fetchChildren(); // refresh UI
      setShowDeleteModal(false);
    }
  };

  const handleEditChild = (child: Child) => {
    setSelectedChild(child);
    setShowEditModal(true);
  };

  const handleUpdateChild = async () => {
    await fetchChildren(); // refresh data dari Supabase
  };

  const openCreateBabyModal = async (open: boolean) => {
    setShowAddModal(open);
  };

  return (
    <div className="space-y-6">
      <div className="px-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <div
            key={item.name}
            className="bg-white relative glass py-6 px-6 shadow-modern rounded-2xl overflow-hidden hover:shadow-modern-lg transition-all hover:scale-[1.02] shadow-md"
          >
            <dt>
              <div className={`absolute bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl p-3 shadow-modern`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-semibold text-gray-500 truncate">
                {item.name}
              </p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{item.stat}</p>
              <p className={`ml-3 flex items-baseline text-sm font-semibold text-green-600`}>
                <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500 mr-1" />
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="px-6">
        <div className="bg-white rounded-2xl shadow-md">
          <div className="px-4 py-5 sm:p-6 w-full">
            <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">
              Pemeriksaan Terbaru
            </h3>

            <div className="flex pb-4 flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Cari data anak..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-4">
                <select
                  value={statusTinggiFilter}
                  onChange={(e) => setStatusTinggiFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <option value="">Status Tinggi</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Normal">Normal</option>
                  <option value="Pendek">Pendek</option>
                  <option value="Sangat Pendek">Sangat Pendek</option>
                </select>
                <select
                  value={statusBeratFilter}
                  onChange={(e) => setStatusBeratFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <option value="">Status Berat</option>
                  <option value="Gemuk">Gemuk</option>
                  <option value="Normal">Normal</option>
                  <option value="Kurus">Kurus</option>
                  <option value="Sangat Kurus">Sangat Kurus</option>
                </select>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <option value="">Semua Gender</option>
                  <option value="boys">Laki-laki</option>
                  <option value="girls">Perempuan</option>
                </select>
                <button
                  onClick={() => openCreateBabyModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Data Anak
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Jenis Kelamin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Orang Tua
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Usia
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status Tinggi
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Status Berat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Pengukuran Terakhir
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Terdaftar Sejak
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-100">
                  {filteredChildren.map((child) => (
                    <tr
                      onClick={() => navigate(`/babies/${child.id}`)}
                      key={child.id}
                      className="hover:cursor-pointer hover:bg-gray-100"
                    >
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/childs/${child.id}`)}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                        >
                          {child.nama}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-muted-foreground flex items-center mt-1">
                          {child.gender === 'boys' ? 'Laki-laki' : 'Perempuan'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm font-medium">
                            <User className="h-3 w-3 mr-2" />
                            {child.DataOrangTua?.nama_ayah ||
                              child?.DataOrangTua?.nama_ibu ||
                              "-"}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-3 w-3 mr-2" />
                            {child.DataOrangTua?.nama_ibu || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium">
                            {child.umur} bulan
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            child.status_tinggi === "Normal"
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                              : child.status_tinggi === "Stunting"
                              ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800"
                              : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                          }`}
                        >
                          {child.status_tinggi}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            child.status_berat === "Normal"
                              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                              : child.status_berat === "Stunting"
                              ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800"
                              : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                          }`}
                        >
                          {child.status_berat}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">
                          {child.updated_at}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-muted-foreground">
                          {child.created_at.slice(0, 10)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-start gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Mencegah navigate
                              handleEditChild(child);
                            }}
                            className="text-gray-600 p-2 rounded hover:text-white hover:bg-blue-400"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(child);
                            }}
                            className="text-red-600 p-2 rounded hover:text-white hover:bg-red-400"
                          >
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

      {filteredChildren.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">Tidak ada data anak</p>
          <p className="mt-2">
            Coba ubah kata kunci pencarian
          </p>
        </div>
      )}

      {showDeleteModal && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Hapus Data Pemeriksaan"
          message="Anda akan menghapus data ini secara permanen.
Semua informasi terkait tidak dapat dikembalikan. Lanjutkan?"
        />
      )}

      {showAddModal && (
        <AddModal 
          onClose={() => {
            setShowAddModal(false);
          }}
        />
      )}

      {showEditModal && selectedChild && (
        <EditModal
          child={selectedChild}
          onClose={() => {
            setShowEditModal(false);
            setSelectedChild(null);
          }}
          onUpdate={handleUpdateChild}
        />
      )}

      
    </div>
  );
};

export default BabyManagement;

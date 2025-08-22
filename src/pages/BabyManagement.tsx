import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, User, Users, TrendingUp, Eye, Edit, Trash2 } from "lucide-react";
import { supabase } from "../supabaseClient";


const stats = [
    {
      name: 'Total Anak',
      stat: '127',
      icon: Users,
      change: '+12%',
      changeType: 'increase',
      color: 'blue'
    },
    {
      name: 'Normal',
      stat: '89',
      icon: Users,
      change: '+8%',
      changeType: 'increase',
      color: 'green'
    },
    {
      name: 'Stunting',
      stat: '234',
      icon: Users,
      change: '+23%',
      changeType: 'increase',
      color: 'yellow'
    },
    {
      name: 'Stunting Berat',
      stat: '78%',
      icon: Users,
      change: '+5%',
      changeType: 'increase',
      color: 'red'
    },
    {
      name: 'Usia Rata-Rata',
      stat: '78%',
      icon: Users,
      change: '+5%',
      changeType: 'increase',
      color: 'blue'
    }
  ];

const BabyManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_hp: "",
  });

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
  }, []);

  const fetchChildren = async () => {
    const { data, error } = await supabase
      .from("DataAnak")
      .select(`
        *,
        id_orang_tua (
          nama_ayah,
          nama_ibu
        )
      `);

    if (error) {
      console.error("Error fetching children:", error);
    } else {
      setChildren(data || []);
    }
  };

  useEffect(() => {
    fetchParents();
    fetchChildren();
  }, []);


  // 🔹 Tambah data baru
  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("DataOrangTua").insert([formData]);
    if (error) {
      console.error("Error inserting parent:", error);
    } else {
      setShowAddModal(false);
      setFormData({ nama: "", email: "", no_hp: "" });
      fetchParents(); // refresh data
    }
  };

  // 🔹 Filter pencarian
  const filteredChildren = children.filter((child) => {
    const term = searchTerm.toLowerCase();

    const matchSearch =
      (child?.nama || "").toLowerCase().includes(term) ||
      (child?.gender || "").toLowerCase().includes(term) ||
      (child?.id_orang_tua?.nama_ayah || "").toLowerCase().includes(term) ||
      (child?.id_orang_tua?.nama_ibu || "").toLowerCase().includes(term);

    const matchStatus =
      !statusFilter || (child?.status || "") === statusFilter;

    const matchGender =
      !genderFilter || (child?.gender || "") === genderFilter;

    return matchSearch && matchStatus && matchGender;
  });


  // Buka modal hapus
  const openDeleteModal = (child: any) => {
    setSelectedChild(child);
    setShowDeleteModal(true);
  };

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
      await fetchChildren();        // refresh UI
      setShowDeleteModal(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="px-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((item) => (
          <div key={item.name} className="bg-white relative glass pt-6 px-6 pb-6 shadow-modern rounded-2xl overflow-hidden hover:shadow-modern-lg transition-all hover:scale-[1.02] shadow-md">
            <dt>
              <div className={`absolute bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 rounded-xl p-3 shadow-modern`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-semibold text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-2 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900">{item.stat}</p>
              <p className={`ml-3 flex items-baseline text-sm font-semibold ${
                item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className="self-center flex-shrink-0 h-4 w-4 text-green-500 mr-1" aria-hidden="true" />
                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
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
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    <option value="">Semua Status</option>
                    <option value="Normal">Normal</option>
                    <option value="Stunting">Stunting</option>
                    <option value="Stunting Parah">Stunting Parah</option>
                  </select>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    <option value="">Semua Gender</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  <button
                    onClick={() => setShowAddModal(true)}
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
                        Orang Tua
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Usia
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Pengukuran Terakhir
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Pemeriksaan Terakhir
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-100">
                    {filteredChildren.map((child) => (
                      <tr onClick={() => navigate(`/babies/${child.id}`)} key={child.id} className="hover:cursor-pointer hover:bg-gray-100">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/childs/${child.id}`)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors text-left"
                          >
                            {child.nama}
                          </button>
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            {child.gender}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center text-sm font-medium">
                              <User className="h-3 w-3 mr-2" />
                              {child.id_orang_tua?.nama_ayah || '-'}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <User className="h-3 w-3 mr-2" />
                              {child.id_orang_tua?.nama_ibu || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium">{child.umur} bulan</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{ child.updated_at }</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                            child.status === 'Normal' 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                              : child.status === 'Stunting'
                              ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800'
                              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800'
                              
                          }`}>
                            {child.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-muted-foreground">{child.created_at.slice(0, 10)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-start gap-2">
                            <button className="text-gray-600 p-2 rounded hover:text-white hover:bg-blue-400">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 p-2 rounded hover:text-white hover:bg-blue-400">
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
          <p className="text-lg font-medium">Tidak ada data orang tua</p>
          <p className="mt-2">
            Coba ubah kata kunci pencarian atau tambah orang tua baru
          </p>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Hapus Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus data anak{" "}
              <strong>{selectedChild?.nama}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Tambah Data Anak
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

export default BabyManagement;

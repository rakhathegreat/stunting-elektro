import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Trash2 } from "lucide-react";
import { supabase } from "../supabaseClient";
import DeleteModal from "../components/DeleteModal";


const ExaminationManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [examination, setExamination] = useState<any[]>([]);
  const [statusTinggiFilter, setStatusTinggiFilter] = useState("");
  const [statusBeratFilter,  setStatusBeratFilter]  = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [selectedAnalisis, setSelectedAnalisis] = useState<any | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchExamination = async () => {
    const { data, error } = await supabase
      .from("Analisis")
      .select("id, status_tinggi, status_berat, created_at, DataAnak(nama, gender, umur)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching examination:", error);
    } else {
      setExamination(data || []);
    }
  };

  useEffect(() => {
    fetchExamination();
  }, []);

  const filteredData = examination.filter((child) => {
    const term = searchTerm.toLowerCase();

    const matchSearch =
      (child?.DataAnak?.nama || "").toLowerCase().includes(term) ||
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
      !genderFilter || (child?.DataAnak?.gender || "") === genderFilter;

    return matchSearch && matchStatusTinggi && matchStatusBerat && matchGender;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDelete = async () => {
    if (!selectedAnalisis.id) return;

    const { error, status } = await supabase
      .from("Analisis")
      .delete()
      .eq("id", selectedAnalisis.id);

    if (error) {
      console.error("Delete error:", error);
    } else {
      console.log("Delete success, status:", status);
      await fetchExamination(); // refresh UI
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="px-6">
        <div className="bg-white rounded-2xl shadow-md">
          <div className="px-4 py-5 sm:p-6 w-full">
            <h3 className="text-lg leading-6 font-bold text-gray-900 mb-6">
              Pemeriksaan Terbaru
            </h3>

            {/* Filter & Search */}
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
              </div>
            </div>

            {/* Tabel */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {["Nama", "Gender", "Usia", "Status Tinggi", "Status Berat", "Tanggal", "Aksi"].map((head) => (
                      <th key={head} className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-100">
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/childs/${item.id}`)}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600"
                          >
                            {item.DataAnak?.nama || "-"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm">{item.DataAnak?.gender === "boys" ? "Laki-laki" : "Perempuan"}</td>
                        <td className="px-6 py-4 text-sm">{item.DataAnak?.umur ? `${item.DataAnak.umur} bulan` : "-"}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            item.status_tinggi === "Normal"
                              ? "bg-green-100 text-green-800"
                              : item.status_tinggi === "Stunting"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status_tinggi}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            item.status_berat === "Normal"
                              ? "bg-green-100 text-green-800"
                              : item.status_berat === "Stunting"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {item.status_berat}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{formatDate(item.created_at)}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedAnalisis(item);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 p-2 rounded hover:text-white hover:bg-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-gray-500">
                        Tidak ada data pemeriksaan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && selectedAnalisis && (
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Hapus Data Pemeriksaan"
          message="Anda akan menghapus data ini secara permanen.
Semua informasi terkait tidak dapat dikembalikan. Lanjutkan?"
        />
      )}
    </div>
  );
};

export default ExaminationManagement;

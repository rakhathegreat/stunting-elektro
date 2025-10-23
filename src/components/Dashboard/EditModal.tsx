import Input from "../Input";
import { useState, useEffect } from "react";
import { updateChild } from '../../services/childService';

interface EditModalProps {
  child: any;
  onClose: () => void;
  onUpdate: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ child, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    nama: "",
    tanggal_lahir: "",
    umur: 0,
    gender: "",
    id_orang_tua: "",
    alergi: "",
    catatan: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (child) {
      setFormData({
        nama: child.nama || "",
        tanggal_lahir: child.tanggal_lahir || "",
        umur: child.umur || 0,
        gender: child.gender || "",
        id_orang_tua: child.id_orang_tua || "",
        alergi: child.alergi || "",
        catatan: child.catatan || ""
      });
    }
  }, [child]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateChild(child.id, {
        ...formData,
        updated_at: new Date().toISOString(),
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating child:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl z-10 mx-4">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Edit Data Anak</h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Kolom Kiri */}
            <div className="space-y-5">
              <div>
                <Input 
                  name="Nama Anak" 
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                  placeholder="Masukkan nama lengkap anak"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input 
                    name="Tanggal Lahir"
                    placeholder="Contoh: 2000-01-01"
                    type="date"
                    value={formData.tanggal_lahir}
                    onChange={(e) => setFormData({...formData, tanggal_lahir: e.target.value})}
                  />
                </div>
                <div>
                  <Input 
                    name="Umur (Bulan)"
                    type="number"
                    value={formData.umur}
                    onChange={(e) => setFormData({...formData, umur: parseInt(e.target.value) || 0})}
                    placeholder="Contoh: 36"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                  <select 
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    name="gender"
                    className={`py-3 px-4 block w-full border border-gray-400 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 ${!formData.gender ? "text-gray-500" : "text-gray-900"}`}
                    required
                  >
                    <option value="" disabled>Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
                <div>
                  <Input 
                    name="No KK"
                    value={formData.id_orang_tua}
                    onChange={(e) => setFormData({...formData, id_orang_tua: e.target.value})}
                    placeholder="Masukkan nomor kartu keluarga"
                  />
                </div>
              </div>
            </div>

            {/* Kolom Kanan */}
            <div className="space-y-5">
              <div>
                <Input 
                  name="Alergi"
                  value={formData.alergi}
                  onChange={(e) => setFormData({...formData, alergi: e.target.value})}
                  placeholder="Contoh: Kacang, susu sapi, debu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
                <textarea 
                  name="catatan"
                  rows={4}
                  value={formData.catatan}
                  onChange={(e) => setFormData({...formData, catatan: e.target.value})}
                  placeholder="Masukkan catatan khusus tentang anak"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
};

export default EditModal;
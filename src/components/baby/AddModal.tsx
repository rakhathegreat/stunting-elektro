import Input from "../Input";
import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import { type RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface AddModalProps {
  onClose: () => void;
}

interface FormData {
  id: string;
  nama: string;
  tanggal_lahir: string;
  umur: number;
  gender: string;
  id_orang_tua: string;
  alergi: string;
  catatan: string;
}

const initialFormData: FormData = {
  id: "",
  nama: "",
  tanggal_lahir: "",
  umur: 0,
  gender: "",
  id_orang_tua: "",
  alergi: "",
  catatan: ""
};

const AddModal: React.FC<AddModalProps> = ({ onClose }) => {
  const [children, setChildren] = useState<FormData[]>([]);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [waitingCard, setWaitingCard] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegister = async () => {
    const { data, error } = await supabase
      .from("DataAnak")
      .select("*")
      .or('nama.is.null,nama.eq.""');

    if (error) {
      console.error("Error fetching children:", error);
    }

    if (data?.length === 0) {
      setWaitingCard(true);
    } else {
      setWaitingCard(false);
      setChildren(data || []);
      // Isi form dengan data dari kartu yang terdeteksi
      if (data && data.length > 0) {
        setFormData({
          ...data[0],
          nama: data[0].nama || "",
          tanggal_lahir: data[0].tanggal_lahir || "",
          umur: data[0].umur || 0,
          gender: data[0].gender || "",
          id_orang_tua: data[0].id_orang_tua || "",
          alergi: data[0].alergi || "",
          catatan: data[0].catatan || ""
        });
      }
    }
  };

  useEffect(() => {
    fetchRegister();

    const subscription = supabase
      .channel('public:DataAnak')
      .on<RealtimePostgresChangesPayload<FormData>>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'DataAnak' },
        (payload) => {
          const newData = payload.new as FormData | undefined;
          if (!newData?.nama) {
            fetchRegister();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (children.length === 0) {
        throw new Error("Tidak ada data anak yang dipilih");
      }

      const child = children[0];
      
      const { error } = await supabase
        .from('DataAnak')
        .update({
          nama: formData.nama,
          tanggal_lahir: formData.tanggal_lahir,
          umur: formData.umur,
          gender: formData.gender,
          id_orang_tua: formData.id_orang_tua,
          alergi: formData.alergi,
          catatan: formData.catatan,
          updated_at: new Date().toISOString()
        })
        .eq('id', child.id);

      if (error) throw error;
      
      onClose();
    } catch (error: any) {
      setError(error.message || "Gagal menyimpan data");
      console.error("Error updating child:", error);
    } finally {
      setLoading(false);
    }
  };

  const ageCalculate = (dateString: string): number => {
    if (!dateString) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age * 12 + (today.getMonth() - birthDate.getMonth() + (today.getDate() < birthDate.getDate() ? -1 : 0));
  };

  useEffect(() => {
    if (formData.tanggal_lahir) {
      const calculatedAge = ageCalculate(formData.tanggal_lahir);
      
      // Update formData.umur dengan umur yang sudah dihitung (dalam bulan)
      setFormData(prev => ({
        ...prev,
        umur: calculatedAge
      }));
    }
  }, [formData.tanggal_lahir]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl z-10 mx-4">
        {waitingCard ? (
          <div className="relative w-full max-w-4xl bg-white rounded-2xl z-10 mx-4">
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Tambah Data Anak</h3>
                <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Body */}
              <div className="flex flex-col items-center justify-center h-full py-20">
                <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v6a2 2 0 002 2h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h2 className="text-xl text-gray-900 font-semibold mb-2">Menunggu Kartu RFID</h2>
                <p className="text-gray-500 font-medium mb-4">Silakan tempelkan kartu RFID pada reader</p>
                
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
          </div>
        ) : (
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
                        value={formData.umur} // Gunakan nilai dari state yang sudah dihitung
                        onChange={(e) => setFormData({...formData, umur: parseInt(e.target.value)})}
                        placeholder="Contoh: 36"
                        disabled={true} // Tetap disabled karena dihitung otomatis
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
                        <option value="boys">Laki-laki</option>
                        <option value="girls">Perempuan</option>
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
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddModal;
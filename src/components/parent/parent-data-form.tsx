
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { parentSchema } from "../../schemas/parent";
import { toast } from "sonner";
import { z } from "zod";

type ParentFormData = z.infer<typeof parentSchema>;

interface IProps {
    changeEditMode: () => void;
}

export default function ParentData({ changeEditMode }: IProps) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ParentFormData>({
        resolver: zodResolver(parentSchema),
    });

    const onSubmit = async (data: ParentFormData) => {
        try {
            // Simulasi proses submit - ganti dengan API call yang sesuai
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log("Form Data:", data);
            toast.success("Data berhasil disimpan!");
            reset();
        } catch {
            toast.error("Terjadi kesalahan saat menyimpan data");
        }
    };

    return (
        <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-lg">

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Informasi Kontak */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                            Informasi Kontak
                        </h3>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register("email")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.email ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="jokowi@example.com"
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Nomor Telepon */}
                        <div>
                            <label htmlFor="no_hp" className="block text-sm font-medium text-gray-700 mb-2">
                                Nomor Telepon
                            </label>
                            <input
                                type="tel"
                                id="no_hp"
                                {...register("no_hp")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.no_hp ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="0834-7658-2346"
                            />
                            {errors.no_hp && (
                                <p className="mt-1 text-sm text-red-600">{errors.no_hp.message}</p>
                            )}
                        </div>

                        {/* Alamat */}
                        <div>
                            <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-2">
                                Alamat
                            </label>
                            <textarea
                                id="alamat"
                                rows={3}
                                {...register("alamat")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.alamat ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Solo"
                            />
                            {errors.alamat && (
                                <p className="mt-1 text-sm text-red-600">{errors.alamat.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Informasi Pribadi */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                            Informasi Pribadi
                        </h3>

                        {/* Nama Ayah */}
                        <div>
                            <label htmlFor="nama_ayah" className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Ayah
                            </label>
                            <input
                                type="text"
                                id="nama_ayah"
                                {...register("nama_ayah")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.nama_ayah ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Masukkan nama ayah"
                            />
                            {errors.nama_ayah && (
                                <p className="mt-1 text-sm text-red-600">{errors.nama_ayah.message}</p>
                            )}
                        </div>

                        {/* Tanggal Lahir Ayah */}
                        <div>
                            <label htmlFor="tanggal_lahir_ayah" className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Lahir Ayah
                            </label>
                            <input
                                type="date"
                                id="tanggal_lahir_ayah"
                                {...register("tanggal_lahir_ayah", {
                                    valueAsDate: true,
                                })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.tanggal_lahir_ayah ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.tanggal_lahir_ayah && (
                                <p className="mt-1 text-sm text-red-600">{errors.tanggal_lahir_ayah.message}</p>
                            )}
                        </div>

                        {/* Nama Ibu */}
                        <div>
                            <label htmlFor="nama_ibu" className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Ibu
                            </label>
                            <input
                                type="text"
                                id="nama_ibu"
                                {...register("nama_ibu")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.nama_ibu ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Masukkan nama ibu"
                            />
                            {errors.nama_ibu && (
                                <p className="mt-1 text-sm text-red-600">{errors.nama_ibu.message}</p>
                            )}
                        </div>

                        {/* Tanggal Lahir Ibu */}
                        <div>
                            <label htmlFor="tanggal_lahir_ibu" className="block text-sm font-medium text-gray-700 mb-2">
                                Tanggal Lahir Ibu
                            </label>
                            <input
                                type="date"
                                id="tanggal_lahir_ibu"
                                {...register("tanggal_lahir_ibu", {
                                    valueAsDate: true,
                                })}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.tanggal_lahir_ibu ? "border-red-500" : "border-gray-300"
                                }`}
                            />
                            {errors.tanggal_lahir_ibu && (
                                <p className="mt-1 text-sm text-red-600">{errors.tanggal_lahir_ibu.message}</p>
                            )}
                        </div>

                        {/* Pekerjaan */}
                        <div>
                            <label htmlFor="pekerjaan" className="block text-sm font-medium text-gray-700 mb-2">
                                Pekerjaan
                            </label>
                            <input
                                type="text"
                                id="pekerjaan"
                                {...register("pekerjaan")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.pekerjaan ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Presiden"
                            />
                            {errors.pekerjaan && (
                                <p className="mt-1 text-sm text-red-600">{errors.pekerjaan.message}</p>
                            )}
                        </div>

                        {/* Pendidikan */}
                        <div>
                            <label htmlFor="pendidikan" className="block text-sm font-medium text-gray-700 mb-2">
                                Pendidikan
                            </label>
                            <select
                                id="pendidikan"
                                {...register("pendidikan")}
                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                    errors.pendidikan ? "border-red-500" : "border-gray-300"
                                }`}
                            >
                                <option value="">Pilih tingkat pendidikan</option>
                                <option value="SD">SD</option>
                                <option value="SMP">SMP</option>
                                <option value="SMA">SMA</option>
                                <option value="D3">D3</option>
                                <option value="S1">S1</option>
                                <option value="S2">S2</option>
                                <option value="S3">S3</option>
                            </select>
                            {errors.pendidikan && (
                                <p className="mt-1 text-sm text-red-600">{errors.pendidikan.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t space-x-2">
                    <button
                        type="button"
                        className={`px-6 py-3 rounded-lg font-medium text-white bg-gray-500 transition-colors`}
                        onClick={() => changeEditMode()}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-3 rounded-lg font-medium text-white transition-colors ${
                            isSubmitting
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isSubmitting ? "Menyimpan..." : "Simpan Data"}
                    </button>
                </div>
            </form>
        </div>
    );
}
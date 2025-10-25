import { useState } from 'react';
import { BarChart3, CircuitBoard, Eye, EyeOff, Sparkles, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../app/providers/auth-context';

const Login = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const { success, error: signInError } = await signIn({ email, password });

    if (!success) {
      const message = signInError || 'Login gagal, silakan coba lagi.';
      setError(message);
      toast.error(message);
    } else {
      toast.success('Berhasil masuk, selamat datang kembali!');
    }

    setLoading(false);
  };

  return (
    <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-3 py-6 sm:px-4">
      {/* background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-8 top-10 h-24 w-24 rounded-full bg-blue-100 blur-2xl sm:h-32 sm:w-32" />
        <div className="absolute bottom-10 right-6 h-28 w-28 rounded-full bg-emerald-100 blur-3xl sm:h-40 sm:w-40" />
      </div>

      <div className="relative z-10 h-full w-full max-w-5xl">
        {/* Card penuh layar tanpa overflow */}
        <div className="grid h-full grid-rows-1 gap-4 rounded-[2rem] border border-slate-200/70 bg-white/95 p-4 shadow-xl backdrop-blur sm:gap-6 sm:p-6 lg:grid-cols-2 lg:gap-8 lg:p-10">
          {/* kolom kiri */}
          <div className="flex min-h-0 flex-col justify-evenly gap-4 text-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 sm:text-sm">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Stethoscope className="h-4 w-4" />
              </span>
              StuntingCare Platform
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-2xl mb-4 font-bold leading-snug text-slate-900 sm:text-3xl lg:text-[2.2rem]">
                Deteksi stunting cepat. Cerdas. Terintegrasi.
              </h1>
              <p className="text-sm text-slate-600 sm:text-base lg:line-clamp-3">
                Pantau pertumbuhan berbasis AI dengan rekomendasi klinis untuk keputusan lebih cepat.
              </p>
            </div>

            {/* fitur – ringkas */}
            <div className="grid min-h-0 grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-blue-50/60 p-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl text-blue-600">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">Analitik AI Presisi</p>
                  <p className="text-xs text-slate-600 sm:text-sm">Model AI memberi skor risiko instan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-emerald-50/60 p-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-xl text-emerald-600">
                  <CircuitBoard className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">Integrasi IoT Klinik</p>
                  <p className="text-xs text-slate-600 sm:text-sm">Perangkat ukur terhubung mengirim data langsung.</p>
                </div>
              </div>

              <div className="col-span-1 flex items-start gap-3 rounded-2xl border border-slate-200 bg-indigo-50/60 p-3 sm:col-span-2">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-indigo-600">
                  <BarChart3 className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">Insight Klinis Real-Time</p>
                  <p className="line-clamp-2 text-xs text-slate-600 sm:text-sm">Grafik progres yang jelas dan informatif, membantu mengarahkan tindak lanjut secara cepat dan tepat.</p>
                </div>
              </div>
            </div>
          </div>

          {/* kolom kanan (form) */}
          <div className="relative flex min-h-0 flex-col justify-center rounded-[1.5rem] bg-white p-5 shadow-lg ring-1 ring-slate-200 sm:p-6 lg:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md sm:h-14 sm:w-14">
                <Stethoscope className="h-6 w-6 text-white sm:h-7 sm:w-7" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">Masuk StuntingCare</h2>
              <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">Silahkan gunakan akun petugas.</p>
            </div>

            <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-6" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              ) : null}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Email Anda"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700" htmlFor="password">
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    placeholder="Password Anda"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-400/40 transition hover:from-blue-500 hover:to-indigo-600 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

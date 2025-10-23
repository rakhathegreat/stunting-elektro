import { useState } from 'react';
import { Eye, EyeOff, Stethoscope } from 'lucide-react';
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="glass rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="flex justify-center">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 shadow">
                <Stethoscope className="h-10 w-10 text-white" />
              </div>
            </div>
            <h2 className="mt-6 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent">
              StuntingCare
            </h2>
            <p className="mt-3 font-medium text-gray-500">Sistem Deteksi Stunting Berbasis AI</p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border bg-white/80 px-4 py-3"
                placeholder="Masukkan email Anda"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border bg-white/80 px-4 py-3 pr-12"
                  placeholder="Masukkan password Anda"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 font-semibold text-white transition disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            <p>Demo Account:</p>
            <p className="mt-2 rounded bg-gray-50 px-3 py-2 font-mono">admin@stuntingcare.com / admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

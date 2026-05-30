import React, { useState } from 'react';
import { Lock, User, Building, AlertCircle, Loader2, HeartHandshake, Sparkles } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate clinical credentials latency
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin' && password === 'admin123') {
        onLoginSuccess();
      } else {
        setError('Nama Pengguna atau Kata Sandi salah. Silakan coba kembali.');
      }
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-4 md:p-8 flex items-center justify-center min-h-[580px]">
      
      {/* Absolute Decorative Floating Elements for a 3D Deep Glowing Canvas */}
      <div className="absolute top-10 left-4 w-32 h-32 bg-teal-400/30 rounded-full blur-3xl animate-pulse duration-[8s] pointer-events-none" />
      <div className="absolute bottom-12 right-2 w-40 h-40 bg-emerald-400/25 rounded-full blur-3xl animate-pulse duration-[12s] pointer-events-none" />
      <div className="absolute top-1/2 -translate-y-1/2 left-1/3 w-20 h-20 bg-indigo-300/20 rounded-full blur-2xl pointer-events-none" />

      {/* Main Floating Glassmorphic Container card */}
      <div className="relative w-full backdrop-blur-xl bg-white/90 border border-white/80 rounded-[36px] shadow-[0_25px_50px_-12px_rgba(13,148,136,0.15)] ring-1 ring-teal-500/5 p-8 md:p-10 space-y-6 transform hover:-translate-y-1 transition-all duration-500 animate-scaleUp">
        
        {/* Upper Floating Badge */}
        <div className="flex justify-center -mt-16 md:-mt-18">
          <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-emerald-400 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-teal-500/20 ring-4 ring-white">
            <Building className="w-8 h-8 animate-bounce duration-[4s]" />
          </div>
        </div>

        {/* Header Title with Custom Polish */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center justify-center gap-1.5">
            Otentikasi Dokter & Admin
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-gray-500 font-medium">Masuk untuk memantau rekam medis & notifikasi Prolanis</p>
        </div>
          <p className="leading-relaxed text-gray-600 font-medium">
            Gunakan kredensial resmi BPJS berikut untuk meluncurkan dashboard medis: <br />
            <span className="inline-block mt-1">
              Username: <strong className="font-mono bg-white/80 border border-amber-200/50 px-2 py-0.5 rounded text-amber-800">admin</strong>
              <span className="mx-2">•</span>
              Password: <strong className="font-mono bg-white/80 border border-amber-200/50 px-2 py-0.5 rounded text-amber-800">admin123</strong>
            </span>
          </p>
        </div>

        {/* Input Form with Floating Style focus bindings */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Nama Pengguna (Username)</label>
            <div className="relative group">
              <User className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50/60 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none placeholder-gray-450 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kata Sandi (Password)</label>
            <div className="relative group overflow-hidden">
              <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50/60 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none placeholder-gray-450 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-100/60 flex items-start gap-2 animate-fadeIn font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons with high micro-interaction levels */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-[0.98] hover:shadow-lg hover:shadow-slate-950/10 transition-all text-center flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-55 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Memeriksa Klinik...</span>
                </>
              ) : (
                'Verifikasi Keaslian & Masuk Portal'
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 bg-gradient-to-r from-gray-50 to-gray-100/80 border border-gray-200/50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold active:scale-[0.98] transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              ← Kembali ke Portal Pasien
            </button>
          </div>
        </form>

        <div className="text-center pt-3 border-t border-gray-50 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
          <HeartHandshake className="w-3.5 h-3.5 text-teal-500" />
          <span>Sistem Integrasi Pengawasan Lansia Mandiri</span>
        </div>
      </div>
    </div>
  );
}


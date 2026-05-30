import React, { useState } from 'react';
import { Peserta } from '../types';
import { HeartHandshake, CreditCard, ChevronRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface ParticipantLoginProps {
  pesertaList: Peserta[];
  onLoginSuccess: (pesertaId: string) => void;
}

export function ParticipantLogin({ pesertaList, onLoginSuccess }: ParticipantLoginProps) {
  const [noBpjsInput, setNoBpjsInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBpjsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      // Find matching peserta by BPJS Number (exact or partial matches)
      const cleanedInput = noBpjsInput.trim().replace(/\s/g, '');
      const matched = pesertaList.find(p => p.noBpjs.replace(/\s/g, '') === cleanedInput);

      if (matched) {
        onLoginSuccess(matched.id);
      } else {
        setError('Nomor BPJS tidak ditemukan di sistem Prolanis. Hubungi Admin Puskesmas untuk pendaftaran awal diri Anda.');
      }
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[580px] animate-fadeIn">
      
      {/* Decorative Warm Backlighting Spheres for Patient comfort */}
      <div className="absolute top-12 left-6 w-36 h-36 bg-teal-300/20 rounded-full blur-3xl animate-pulse duration-[7s] pointer-events-none" />
      <div className="absolute bottom-16 right-4 w-44 h-44 bg-emerald-300/15 rounded-full blur-3xl animate-pulse duration-[10s] pointer-events-none" />

      {/* Main Glassmorphic Panel */}
      <div className="relative w-full backdrop-blur-xl bg-white/95 border border-white/80 rounded-[36px] shadow-[0_25px_50px_-12px_rgba(13,148,136,0.12)] p-8 md:p-10 space-y-6 transform hover:-translate-y-1 transition-all duration-500">
        
        {/* Top Rounded Icon Visual representing Health Card validation */}
        <div className="flex justify-center -mt-16 md:-mt-18">
          <div className="w-16 h-16 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-teal-600/15 ring-4 ring-white">
            <HeartHandshake className="w-8 h-8 animate-pulse text-emerald-100" />
          </div>
        </div>

        {/* Headings */}
        <div className="text-center space-y-1">
          <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center justify-center gap-1.5">
            Portal Mandiri Peserta
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </h3>
          <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">
            Gunakan Nomor Kartu BPJS Kesehatan Anda untuk melihat riwayat medis & jadwal kontrol Prolanis Anda pribadi.
          </p>
        </div>

        {/* BPJS Card Search Form */}
        <form onSubmit={handleBpjsSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Nomor BPJS (13 Digit)
            </label>
            <div className="relative group">
              <CreditCard className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
              <input
                type="text"
                required
                maxLength={13}
                value={noBpjsInput}
                onChange={(e) => setNoBpjsInput(e.target.value.replace(/\D/g, ''))} // numbers only
                placeholder="misal: 0001249386291"
                className="w-full pl-11 pr-4 py-3 text-xs font-semibold bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:outline-none transition-all placeholder-gray-400 tracking-wider font-mono"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-100 flex items-start gap-2 animate-fadeIn font-semibold">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-800 active:scale-[0.98] transition-all text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memverifikasi BPJS...</span>
              </>
            ) : (
              'Masuk Aman Sekarang'
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-[10px] text-gray-400 font-medium">
          Keamanan pasien divalidasi langsung oleh Puskesmas setempat & BPJS Kesehatan.
        </div>
      </div>
    </div>
  );
}

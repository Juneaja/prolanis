import React, { useState } from 'react';
import { Peserta, HealthLog, JadwalKontrol, Notification, VideoEdukasi } from '../types';
import { CustomChart } from './CustomChart';
import { 
  Activity, 
  Heart, 
  Bell, 
  MapPin, 
  Clock, 
  Plus, 
  CheckCircle, 
  BookOpen, 
  Info, 
  TrendingUp, 
  Loader2, 
  Calendar,
  Sparkles,
  UserCheck,
  Pencil,
  Trash2,
  X,
  Check,
  Youtube,
  Play,
  Video
} from 'lucide-react';

export function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) 
    ? `https://www.youtube.com/embed/${match[2]}`
    : '';
}

interface ParticipantDashboardProps {
  peserta: Peserta[];
  logs: HealthLog[];
  jadwal: JadwalKontrol[];
  notifications: Notification[];
  videos?: VideoEdukasi[];
  activePesertaId: string;
  onSetActivePesertaId: (id: string) => void;
  onAddLog: (newLog: any) => Promise<any>;
  onUpdateLog?: (updatedLog: any) => Promise<any>;
  onDeleteLog?: (id: string) => Promise<any>;
  onMarkNotificationRead: (id: string) => Promise<void>;
}

export function ParticipantDashboard({
  peserta,
  logs,
  jadwal,
  notifications,
  videos = [],
  activePesertaId,
  onSetActivePesertaId,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  onMarkNotificationRead
}: ParticipantDashboardProps) {

  // Tab switcher state for Clinical vs Self-monitoring
  const [activeTab, setActiveTab] = useState<'dokter' | 'mandiri'>('dokter');

  // Video Edukasi Selection State
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const activeVideo = videos.find(v => v.id === activeVideoId) || videos[0];

  // Form input logs
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [gulaDarah, setGulaDarah] = useState('');
  const [sistolik, setSistolik] = useState('');
  const [diastolik, setDiastolik] = useState('');
  const [catatan, setCatatan] = useState('');
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState('');
  const [logError, setLogError] = useState('');

  // In-table editing & deleting states for Patient Self-Monitoring logs
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editTanggal, setEditTanggal] = useState('');
  const [editGulaDarah, setEditGulaDarah] = useState('');
  const [editSistolik, setEditSistolik] = useState('');
  const [editDiastolik, setEditDiastolik] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tableFeedback, setTableFeedback] = useState({ type: '', message: '' });

  const handleStartEdit = (log: HealthLog) => {
    setEditingLogId(log.id);
    setEditTanggal(log.tanggal);
    setEditGulaDarah(String(log.gulaDarah));
    setEditSistolik(String(log.sistolik));
    setEditDiastolik(String(log.diastolik));
    setEditCatatan(log.catatan || '');
    setTableFeedback({ type: '', message: '' });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setTableFeedback({ type: '', message: '' });
  };

  const handleSaveEdit = async (logId: string) => {
    if (!editTanggal || !editGulaDarah || !editSistolik || !editDiastolik) {
      setTableFeedback({ type: 'error', message: 'Semua kolom wajib diisi!' });
      return;
    }
    setIsSavingEdit(true);
    setTableFeedback({ type: '', message: '' });
    try {
      if (onUpdateLog) {
        await onUpdateLog({
          id: logId,
          tanggal: editTanggal,
          gulaDarah: Number(editGulaDarah),
          sistolik: Number(editSistolik),
          diastolik: Number(editDiastolik),
          catatan: editCatatan,
          isMandiri: true
        });
        setEditingLogId(null);
        setTableFeedback({ type: 'success', message: 'Pemeriksaan mandiri berhasil diperbarui!' });
      }
    } catch (err: any) {
      setTableFeedback({ type: 'error', message: err.message || 'Gagal memperbarui data.' });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    setIsDeleting(true);
    setTableFeedback({ type: '', message: '' });
    try {
      if (onDeleteLog) {
        await onDeleteLog(logId);
        setDeletingLogId(null);
        setTableFeedback({ type: 'success', message: 'Pemeriksaan mandiri berhasil dihapus.' });
      }
    } catch (err: any) {
      setTableFeedback({ type: 'error', message: err.message || 'Gagal menghapus data.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Active participant instance
  const currentPeserta = peserta.find(p => p.id === activePesertaId) || peserta[0];

  if (!currentPeserta) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-500">Menyiapkan profil kesehatan peserta...</p>
      </div>
    );
  }

  // Filter logs & schedules & notifications for active participant
  const myLogs = logs.filter(l => l.pesertaId === currentPeserta.id);
  const clinicalLogs = myLogs.filter(l => !l.isMandiri);
  const mandiriLogs = myLogs.filter(l => !!l.isMandiri);

  // Determine active logs based on chosen view
  const activeLogs = activeTab === 'dokter' ? clinicalLogs : mandiriLogs;
  const latestLog = activeLogs[0];

  const myJadwal = jadwal.filter(j => j.pesertaId === currentPeserta.id && j.status === 'Akan Datang');
  const myNotifications = notifications.filter(n => n.pesertaId === currentPeserta.id);
  const unreadNotificationsCount = myNotifications.filter(n => !n.dibaca).length;

  // Form submission handler
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !gulaDarah || !sistolik || !diastolik) {
      setLogError('Harap lengkapi seluruh isian angka vital Anda!');
      return;
    }
    setLogError('');
    setLogSuccess('');
    setIsSubmittingLog(true);

    try {
      const res = await onAddLog({
        pesertaId: currentPeserta.id,
        tanggal,
        gulaDarah: Number(gulaDarah),
        sistolik: Number(sistolik),
        diastolik: Number(diastolik),
        catatan,
        isMandiri: true // Mark as self-check
      });
      setLogSuccess(res.message || 'Log gula darah & tekanan darah berhasil diunggah!');
      // Seamlessly switch to 'mandiri' view so they see their dynamic self-monitoring updates immediately
      setActiveTab('mandiri');
      setGulaDarah('');
      setSistolik('');
      setDiastolik('');
      setCatatan('');
    } catch (err: any) {
      setLogError(err.message || 'Gagal menyimpan catatan medis harian.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Elegantly Polished Profil Banner with Active session indicator */}
      <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-lux flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="w-14 h-14 bg-gradient-to-tr from-teal-600 to-emerald-500 text-white rounded-2xl flex items-center justify-center font-display font-black text-xl border border-teal-200/20 shrink-0 shadow-md">
            {currentPeserta.nama.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-extrabold text-slate-800 text-lg tracking-tight">{currentPeserta.nama}</h3>
              <span className="text-[10px] uppercase font-bold text-teal-605 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 font-mono">LANSIA BINAAN</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Diagnosis Utama: <span className="text-teal-600 font-semibold">{currentPeserta.diagnosis}</span> • No. Kartu BPJS: <span className="font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{currentPeserta.noBpjs}</span>
            </p>
          </div>
        </div>

        {/* Secure active session indicator */}
        <div className="flex items-center">
          <span className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-100 h-9">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-400" />
            Sesi Pasien Aktif
          </span>
        </div>
      </div>

      {/* Segmented Control Tab Switcher - Clinical vs Self-monitoring */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-lg border border-slate-200/60 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab('dokter')}
          className={`flex-1 py-2 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'dokter'
              ? 'bg-white text-teal-700 shadow border border-slate-200/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🩺 Pemeriksaan Klinik / Dokter
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('mandiri')}
          className={`flex-1 py-1.5 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'mandiri'
              ? 'bg-white text-teal-700 shadow border border-slate-200/30'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          🏡 Pemeriksaan Mandiri (Pasien)
        </button>
      </div>

      {/* Grid Dashboard Atas: Ringkasan Nilai & Input form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Kolom Vital Statistik Terbaru */}
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box 1: Gula Darah Terakhir */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 shadow-lux hover:shadow-lux-hover ${
              !latestLog ? 'bg-white border-slate-100' :
              latestLog.statusGulaDarah === 'Tinggi' 
                ? 'bg-gradient-to-br from-rose-50/70 via-white to-white border-rose-150' 
                : 'bg-gradient-to-br from-emerald-50/70 via-white to-white border-emerald-150'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display">GULA DARAH SEWAKTU (GDS)</span>
                <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg tracking-wide uppercase border ${
                  !latestLog ? 'bg-slate-100 text-slate-400 border-slate-200' :
                  latestLog.statusGulaDarah === 'Tinggi' 
                    ? 'bg-rose-100/80 text-rose-700 border-rose-205' 
                    : 'bg-emerald-100/80 text-emerald-700 border-emerald-205'
                }`}>
                  {latestLog ? latestLog.statusGulaDarah : 'Kosong'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-4xl font-display font-black text-slate-800 tracking-tight font-mono">
                  {latestLog ? latestLog.gulaDarah : '--'}
                </span>
                <span className="text-xs font-bold text-slate-450 uppercase font-sans">mg/dL</span>
              </div>
              <p className="text-[10.5px] text-slate-450 mt-4 font-semibold flex items-center gap-1.5 leading-none">
                <span className={`w-2 h-2 rounded-full ${!latestLog ? 'bg-slate-300' : latestLog.statusGulaDarah === 'Tinggi' ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                {latestLog 
                  ? `Hasil deteksi terakhir: ${new Date(latestLog.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}` 
                  : 'Belum ada rekaman medis'}
              </p>
              <div className="absolute right-4 bottom-3 opacity-[0.06] text-slate-900 group-hover:scale-110 group-hover:opacity-[0.12] transition-all duration-300">
                <Activity className="w-14 h-14" />
              </div>
            </div>

            {/* Box 2: Tekanan Darah Terakhir */}
            <div className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 shadow-lux hover:shadow-lux-hover ${
              !latestLog ? 'bg-white border-slate-100' :
              latestLog.statusTekananDarah === 'Hipertensi' 
                ? 'bg-gradient-to-br from-rose-50/70 via-white to-white border-rose-150' 
                : 'bg-gradient-to-br from-emerald-50/70 via-white to-white border-emerald-150'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-display">TEKANAN DARAH (TENSI)</span>
                <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg tracking-wide uppercase border ${
                  !latestLog ? 'bg-slate-100 text-slate-400 border-slate-200' :
                  latestLog.statusTekananDarah === 'Hipertensi' 
                    ? 'bg-rose-100/80 text-rose-700 border-rose-205'
                    : 'bg-emerald-100/80 text-emerald-700 border-emerald-205'
                }`}>
                  {latestLog ? latestLog.statusTekananDarah : 'Kosong'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-4xl font-display font-black text-slate-800 tracking-tight font-mono">
                  {latestLog ? `${latestLog.sistolik}/${latestLog.diastolik}` : '--/--'}
                </span>
                <span className="text-xs font-bold text-slate-450 uppercase font-sans">mmHg</span>
              </div>
              <p className="text-[10.5px] text-slate-450 mt-4 font-semibold flex items-center gap-1.5 leading-none">
                <span className={`w-2 h-2 rounded-full ${!latestLog ? 'bg-slate-300' : latestLog.statusTekananDarah === 'Hipertensi' ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                {latestLog 
                  ? `Tensi dipotret terakhir: ${new Date(latestLog.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
                  : 'Siap menerima input tensi pagi'}
              </p>
              <div className="absolute right-4 bottom-3 opacity-[0.06] text-slate-900 group-hover:scale-110 group-hover:opacity-[0.12] transition-all duration-300">
                <Heart className="w-14 h-14" />
              </div>
            </div>

          </div>

          {/* Interactive SVG charts container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {currentPeserta.diagnosis !== 'Hipertensi' && <CustomChart logs={activeLogs} type="gula" />}
            {currentPeserta.diagnosis !== 'Diabetes Mellitus' && <CustomChart logs={activeLogs} type="tensi" />}
          </div>

          {/* List of active logs representing history */}
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <span className="text-xs font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                {activeTab === 'dokter' ? '🩺 Riwayat Pemeriksaan dari Dokter' : '🏡 Riwayat Pemeriksaan Mandiri Pasien'}
              </span>
              <span className="text-[10px] bg-teal-50 text-teal-605 font-bold px-2 py-0.5 rounded border border-teal-100 font-mono">
                {activeLogs.length} Data Tercatat
              </span>
            </div>

            {tableFeedback.message && (
              <p className={`text-center text-[11px] font-semibold p-2.5 rounded-xl ${tableFeedback.type === 'error' ? 'text-red-700 bg-red-50 border border-red-100' : 'text-emerald-700 bg-emerald-50 border border-emerald-100'}`}>
                {tableFeedback.type === 'error' ? '✕' : '✓'} {tableFeedback.message}
              </p>
            )}

            {activeLogs.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-8">
                {activeTab === 'dokter' 
                  ? '🏥 Klinik belum merekam hasil cek fisik resmi Anda. Hubungi Administrator.' 
                  : '🏡 Anda belum mencatat pemeriksaan mandiri apa pun. Silakan catat di formulir sebelah kanan.'}
              </p>
            ) : (
              <>
                {/* Desktop View Table (Visible on sm and up) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tanggal</th>
                        <th className="py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">GDS (mg/dL)</th>
                        <th className="py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Tensi (mmHg)</th>
                        <th className="py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-3">Catatan / Status</th>
                        {activeTab === 'mandiri' && (
                          <th className="py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center w-24">Aksi</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                      {activeLogs.map((log) => {
                        const isEditing = editingLogId === log.id;
                        const isDeletingThis = deletingLogId === log.id;

                        return (
                          <tr key={log.id} className={`hover:bg-slate-50/50 transition-colors ${isEditing ? 'bg-teal-50/15' : ''}`}>
                            {/* TANGGAL */}
                            <td className="py-2.5 font-bold text-gray-600">
                              {isEditing ? (
                                <input
                                  type="date"
                                  value={editTanggal}
                                  onChange={(e) => setEditTanggal(e.target.value)}
                                  className="p-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-full"
                                />
                              ) : (
                                new Date(log.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              )}
                            </td>

                            {/* GULA DARAH */}
                            <td className="py-2.5 text-center font-mono">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={editGulaDarah}
                                  onChange={(e) => setEditGulaDarah(e.target.value)}
                                  className="p-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-16 text-center font-mono font-bold"
                                />
                              ) : (
                                <span className={`px-1.5 py-0.5 rounded font-black ${log.statusGulaDarah === 'Tinggi' ? 'text-red-650 bg-red-50' : 'text-emerald-700 bg-emerald-50'}`}>
                                  {log.gulaDarah}
                                </span>
                              )}
                            </td>

                            {/* TEKANAN DARAH */}
                            <td className="py-2.5 text-center font-mono font-bold text-gray-700">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={editSistolik}
                                    onChange={(e) => setEditSistolik(e.target.value)}
                                    className="p-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-11 text-center font-mono font-bold"
                                    placeholder="Sist"
                                  />
                                  <span className="text-gray-400">/</span>
                                  <input
                                    type="number"
                                    value={editDiastolik}
                                    onChange={(e) => setEditDiastolik(e.target.value)}
                                    className="p-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-11 text-center font-mono font-bold"
                                    placeholder="Dias"
                                  />
                                </div>
                              ) : (
                                <span className={`px-1.5 py-0.5 rounded font-black ${log.statusTekananDarah === 'Hipertensi' ? 'text-red-500 bg-red-50' : 'text-emerald-700 bg-emerald-50'}`}>
                                  {log.sistolik}/{log.diastolik}
                                </span>
                              )}
                            </td>

                            {/* CATATAN */}
                            <td className="py-2.5 pl-3 text-gray-500">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editCatatan}
                                  onChange={(e) => setEditCatatan(e.target.value)}
                                  className="p-1.5 text-xs bg-slate-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 w-full"
                                  placeholder="Edit catatan..."
                                />
                              ) : (
                                <div className="flex flex-col">
                                  <span className="text-[10px] italic">{log.catatan || '-'}</span>
                                  <span className="text-[8px] font-extrabold mt-1 tracking-wider uppercase text-teal-605">
                                    {log.isMandiri ? '🏡 Mandiri' : '🏥 Resmi Dokter'}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* AKSI EDIT & DELETE */}
                            {activeTab === 'mandiri' && (
                              <td className="py-2.5 text-center">
                                {isEditing ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleSaveEdit(log.id)}
                                      disabled={isSavingEdit}
                                      className="p-1.5 bg-emerald-55 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg transition-all"
                                      title="Simpan"
                                    >
                                      {isSavingEdit ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      ) : (
                                        <Check className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={handleCancelEdit}
                                      disabled={isSavingEdit}
                                      className="p-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 rounded-lg transition-all"
                                      title="Batal"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : isDeletingThis ? (
                                  <div className="flex flex-col items-center justify-center gap-1">
                                    <span className="text-[8px] text-red-650 font-black uppercase tracking-wider block">Hapus?</span>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLog(log.id)}
                                        disabled={isDeleting}
                                        className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded text-[8px] transition-all"
                                      >
                                        {isDeleting ? '...' : 'Ya'}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setDeletingLogId(null)}
                                        disabled={isDeleting}
                                        className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-500 rounded text-[8px] transition-all"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(log)}
                                      className="p-1.5 bg-teal-50 hover:bg-teal-100 border border-teal-200/50 text-teal-700 rounded-lg transition-all cursor-pointer"
                                      title="Ubah Pemeriksaan"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletingLogId(log.id);
                                        setEditingLogId(null);
                                        setTableFeedback({ type: '', message: '' });
                                      }}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200/50 text-red-750 rounded-lg transition-all cursor-pointer"
                                      title="Hapus Pemeriksaan"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card List (Visible on tiny screen sizes under sm) */}
                <div className="block sm:hidden space-y-4">
                  {activeLogs.map((log) => {
                    const isEditing = editingLogId === log.id;
                    const isDeletingThis = deletingLogId === log.id;

                    return (
                      <div 
                        key={log.id} 
                        className={`p-4 rounded-2xl border transition-all duration-300 space-y-3.5 ${
                          isEditing 
                            ? 'bg-teal-50/10 border-teal-250 shadow-sm' 
                            : 'bg-slate-50/20 border-slate-100 hover:border-slate-150'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-700 font-mono">
                            {new Date(log.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase ${
                            log.isMandiri 
                              ? 'bg-amber-50 border-amber-100 text-amber-700' 
                              : 'bg-teal-50 border-teal-100 text-teal-700'
                          }`}>
                            {log.isMandiri ? '🏡 Mandiri' : '🏥 Klinik'}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-3.5 text-left">
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tanggal</label>
                              <input
                                type="date"
                                value={editTanggal}
                                onChange={(e) => setEditTanggal(e.target.value)}
                                className="w-full p-2 text-xs bg-white border border-gray-250 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">GDS (mg/dL)</label>
                                <input
                                  type="number"
                                  value={editGulaDarah}
                                  onChange={(e) => setEditGulaDarah(e.target.value)}
                                  className="w-full p-2 text-xs bg-white border border-gray-255 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono text-center font-bold"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Tensi (mmHg)</label>
                                <div className="flex items-center gap-1 bg-white p-1 border border-gray-255 rounded-xl">
                                  <input
                                    type="number"
                                    value={editSistolik}
                                    onChange={(e) => setEditSistolik(e.target.value)}
                                    className="w-full p-1 text-xs text-center focus:outline-none font-mono"
                                    placeholder="Sist"
                                  />
                                  <span className="text-gray-300">/</span>
                                  <input
                                    type="number"
                                    value={editDiastolik}
                                    onChange={(e) => setEditDiastolik(e.target.value)}
                                    className="w-full p-1 text-xs text-center focus:outline-none font-mono"
                                    placeholder="Dias"
                                  />
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catatan</label>
                              <input
                                type="text"
                                value={editCatatan}
                                onChange={(e) => setEditCatatan(e.target.value)}
                                className="w-full p-2 text-xs bg-white border border-gray-250 rounded-xl focus:outline-none"
                                placeholder="Edit keterangan log..."
                              />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-50">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(log.id)}
                                disabled={isSavingEdit}
                                className="px-3.5 py-1.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 transition-all flex items-center gap-1 shadow shadow-emerald-100 cursor-pointer"
                              >
                                {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Simpan
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                disabled={isSavingEdit}
                                className="px-3.5 py-1.5 bg-gray-100 border border-gray-200 text-gray-600 font-extrabold text-xs rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              {currentPeserta.diagnosis !== 'Hipertensi' && (
                                <div className="p-2.5 bg-red-50/40 border border-red-100/50 rounded-xl">
                                  <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block leading-none">Gula Darah</span>
                                  <span className="font-mono text-[14px] font-black text-slate-800 leading-tight block mt-1">{log.gulaDarah} <span className="text-[9px] font-bold text-gray-400">mg/dL</span></span>
                                  <span className={`inline-block text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-md ${
                                    log.statusGulaDarah === 'Tinggi' ? 'text-red-700 bg-red-100/60' : 'text-emerald-700 bg-emerald-50'
                                  }`}>
                                    {log.statusGulaDarah || 'Normal'}
                                  </span>
                                </div>
                              )}
                              
                              {currentPeserta.diagnosis !== 'Diabetes Mellitus' && (
                                <div className="p-2.5 bg-emerald-50/40 border border-emerald-100/50 rounded-xl">
                                  <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest block leading-none">Tekanan Darah</span>
                                  <span className="font-mono text-[14px] font-black text-slate-800 leading-tight block mt-1">{log.sistolik}/{log.diastolik} <span className="text-[9px] font-bold text-gray-400">mmHg</span></span>
                                  <span className={`inline-block text-[9px] font-extrabold mt-1 px-1.5 py-0.5 rounded-md ${
                                    log.statusTekananDarah === 'Hipertensi' ? 'text-red-700 bg-red-100/60' : 'text-emerald-700 bg-emerald-50'
                                  }`}>
                                    {log.statusTekananDarah || 'Normal'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {log.catatan && (
                              <div className="p-2.5 bg-white text-[11px] text-gray-500 italic rounded-xl border border-slate-100 leading-normal">
                                Candy: &quot;{log.catatan}&quot;
                              </div>
                            )}

                            {activeTab === 'mandiri' && (
                              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-dashed border-gray-100">
                                {isDeletingThis ? (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] text-red-650 font-extrabold">Yakin hapus?</span>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteLog(log.id)}
                                      disabled={isDeleting}
                                      className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-sm shadow-red-100"
                                    >
                                      Hapus
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setDeletingLogId(null)}
                                      className="px-2.5 py-1 bg-white border border-gray-200 text-gray-500 rounded-lg text-[10px] font-bold cursor-pointer"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(log)}
                                      className="p-1 px-2.5 bg-teal-50 hover:bg-teal-100 border border-teal-100 text-teal-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Pencil className="w-3 h-3" /> Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setDeletingLogId(log.id);
                                        setEditingLogId(null);
                                        setTableFeedback({ type: '', message: '' });
                                      }}
                                      className="p-1 px-2.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-650 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" /> Hapus
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Input Log Vital baru */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
            <Activity className="w-5 h-5 text-teal-500" />
            <h4 className="font-extrabold text-gray-800 text-sm">Catat Hasil Pemeriksaan Mandiri</h4>
          </div>

          <form onSubmit={handleLogSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Pengecekan</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Gula Sewaktu (mg/dL)</label>
                <input
                  type="number"
                  required
                  value={gulaDarah}
                  onChange={(e) => setGulaDarah(e.target.value)}
                  placeholder="misal: 120"
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Tekanan Darah (mmHg)</label>
                <div className="flex items-center gap-1 bg-gray-50 px-1 border border-gray-100 rounded-xl">
                  <input
                    type="number"
                    required
                    value={sistolik}
                    onChange={(e) => setSistolik(e.target.value)}
                    placeholder="Sis"
                    className="w-full p-1.5 text-xs bg-transparent text-center focus:outline-none placeholder-gray-300"
                  />
                  <span className="text-gray-300 text-xs">/</span>
                  <input
                    type="number"
                    required
                    value={diastolik}
                    onChange={(e) => setDiastolik(e.target.value)}
                    placeholder="Dia"
                    className="w-full p-1.5 text-xs bg-transparent text-center focus:outline-none placeholder-gray-300"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Catatan Fisik (Optional)</label>
              <input
                type="text"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="misal: badan terasa bugar setelah senam"
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLog}
              className="w-full py-2.5 bg-teal-600 text-white font-bold text-xs rounded-xl hover:bg-teal-700 active:scale-95 transition-all text-center flex items-center justify-center gap-1 shadow-sm"
            >
              {isSubmittingLog ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Simpan Hasil Cek Mandiri
            </button>

            {logSuccess && (
              <p className="text-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg animate-fadeIn">
                ✓ {logSuccess}
              </p>
            )}

            {logError && (
              <p className="text-center text-[11px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg animate-fadeIn">
                ✕ {logError}
              </p>
            )}
          </form>
        </div>

      </div>

      {/* Grid Bawah: Rencana Jadwal Kontrol & Notifikasi Pengingat Otomatis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Box Jadwal Kontrol Terencana */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h4 className="font-extrabold text-gray-800 text-sm">Kalender Jadwal Kontrol</h4>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {myJadwal.length === 0 ? (
              <div className="p-8 text-center text-gray-300 text-xs">
                Belum ada jadwal kegiatan terencana di portal Anda. Hubungi administrator Puskesmas.
              </div>
            ) : (
              myJadwal.map((j) => (
                <div key={j.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800 text-sm">{j.tipe}</span>
                    <span className="text-[10px] font-semibold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-lg border border-teal-100">Akan Datang</span>
                  </div>
                  <div className="space-y-1 text-gray-500 text-[11px]">
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      Waktu: <span className="font-semibold text-gray-600">{j.tanggal} pukul {j.pukul} WIB</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      Lokasi: <span className="font-semibold text-gray-600">{j.lokasi}</span>
                    </p>
                  </div>
                  {j.catatan && (
                    <div className="p-2 bg-white rounded-xl border border-gray-100 text-[10px] leading-relaxed italic text-gray-400">
                      💡 Catatan: &quot;{j.catatan}&quot;
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Box Live Notifikasi Hub & Automatic Warning Center */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-orange-500" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-bounce">
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-gray-800 text-sm">Pusat Pengingat & Info Otomatis</h4>
            </div>
            <span className="text-[10px] text-gray-400 font-semibold">{unreadNotificationsCount} belum terbaca</span>
          </div>

          <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
            {myNotifications.length === 0 ? (
              <p className="text-center text-xs text-gray-300 p-8">Belum ada pengingat masuk.</p>
            ) : (
              myNotifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-3.5 rounded-2xl border transition-all text-xs flex items-start gap-3 relative overflow-hidden ${
                    n.dibaca 
                      ? 'bg-gray-50/50 border-gray-100 opacity-60' 
                      : n.tipe === 'alert'
                        ? 'bg-red-50/70 border-red-100 shadow-sm shadow-red-50/10'
                        : n.tipe === 'warning'
                          ? 'bg-orange-50/40 border-orange-100'
                          : 'bg-teal-50/20 border-teal-50'
                  }`}
                >
                  {/* Color strip marker for priority visually */}
                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                    n.tipe === 'alert' ? 'bg-red-500' :
                    n.tipe === 'warning' ? 'bg-orange-500' :
                    n.tipe === 'success' ? 'bg-emerald-500' : 'bg-blue-400'
                  }`} />

                  {/* Icon depending on type */}
                  <div className={`p-1.5 rounded-xl text-xs shrink-0 mt-0.5 ${
                    n.tipe === 'alert' ? 'bg-red-100 text-red-500' :
                    n.tipe === 'warning' ? 'bg-orange-100 text-orange-600' :
                    n.tipe === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-500'
                  }`}>
                    {n.tipe === 'alert' ? <Info className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 flex-1 pr-12 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-800 text-sm leading-tight">{n.judul}</span>
                      <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">{n.tanggal}</span>
                    </div>
                    <p className="text-gray-500 leading-relaxed text-[11px]">{n.pesan}</p>
                  </div>

                  {!n.dibaca && (
                    <button 
                      onClick={() => onMarkNotificationRead(n.id)}
                      className="absolute right-3.5 top-3.5 px-2 py-1 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 hover:border-gray-200 text-[10px] text-teal-600 font-bold flex items-center gap-1 active:scale-95 transition-all shadow-sm"
                    >
                      <CheckCircle className="w-3 h-3 text-teal-500" />
                      Baca
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Video Edukasi Pasien (YouTube Embed Portal) */}
      <div id="video-edukasi-sec" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-50 pb-2.5">
          <Youtube className="w-5 h-5 text-red-600 animate-pulse" />
          <h4 className="font-black text-sm tracking-wide text-gray-800 uppercase font-display">Portal Video Edukasi Kesehatan Pasien</h4>
        </div>

        {videos.length === 0 ? (
          <p className="text-center text-xs text-gray-400 italic py-6">Puskesmas belum mengunggah video edukasi prolanis saat ini.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Active Main Video Player */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-sm border border-gray-100">
                {activeVideo && getYouTubeEmbedUrl(activeVideo.url) ? (
                  <iframe
                    className="absolute inset-0 w-full h-full border-0"
                    src={getYouTubeEmbedUrl(activeVideo.url)}
                    title={activeVideo.judul}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                    Link video tidak valid atau kosong
                  </div>
                )}
              </div>
              <div>
                <h5 className="font-extrabold text-[15px] text-gray-800 leading-snug">{activeVideo?.judul}</h5>
                {activeVideo?.deskripsi && (
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{activeVideo.deskripsi}</p>
                )}
                <div className="mt-2.5 flex items-center gap-2 text-[9.5px] font-bold text-gray-400">
                  <span className="px-2 py-0.5 bg-red-50 text-red-650 rounded">Materi Edukasi Puskesmas</span>
                  <span>•</span>
                  <span>Diunggah secara resmi oleh tim medis prolanis</span>
                </div>
              </div>
            </div>

            {/* Right: Playlist List Selector */}
            <div className="lg:col-span-1 space-y-3 flex flex-col">
              <h6 className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase">Daftar Video Edukasi ({videos.length})</h6>
              <div className="space-y-3 overflow-y-auto max-h-[340px] pr-1 flex-1">
                {videos.map((vid) => {
                  const isActive = activeVideo && vid.id === activeVideo.id;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setActiveVideoId(vid.id)}
                      className={`w-full p-2.5 text-left rounded-2xl border transition-all duration-200 flex gap-2.5 items-start cursor-pointer group ${
                        isActive 
                        ? 'bg-red-50/15 border-red-150 shadow-sm' 
                        : 'bg-slate-50/40 border-transparent hover:border-gray-150 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 shrink-0 transition-colors ${isActive ? 'bg-red-600 text-white' : 'bg-slate-150 text-gray-400 group-hover:bg-red-50 group-hover:text-red-600'}`}>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-black leading-snug line-clamp-2 transition-colors ${isActive ? 'text-red-750' : 'text-gray-700 group-hover:text-gray-900'}`}>{vid.judul}</p>
                        {vid.deskripsi && (
                          <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1 leading-relaxed">{vid.deskripsi}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edukasi Prolanis BPJS Guidelines */}
      <div className="bg-gradient-to-r from-emerald-950 to-teal-900 text-white p-6 rounded-3xl space-y-4 shadow-md shadow-emerald-100">
        <div className="flex items-center gap-2 pb-1">
          <BookOpen className="w-5 h-5 text-emerald-300" />
          <h4 className="font-black text-sm tracking-wide">PANDUAN HIDUP SEHAT PROLANIS</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed text-xs text-emerald-100">
          <div className="space-y-2 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/50">
            <h5 className="font-bold text-white text-sm flex items-center gap-1 text-red-300">🍬 Edukasi Diabetes Mellitus (Pemberantasan Gula)</h5>
            <p>Konsumsi nasi merah, ubi jalar, roti gandum utuh sebagai pengganti nasi putih. Hindari cemilan minuman manis kemasan, sirup, atau gorengan bertepung.</p>
            <p className="text-[10.5px] italic text-emerald-200">Tips: Luangkan waktu 30 menit porsi pagi hari mengikuti Senam Prolanis untuk mendominasi otot menyerap sisa kadar gula darah.</p>
          </div>
          <div className="space-y-2 bg-emerald-900/40 p-4 rounded-2xl border border-emerald-800/50">
            <h5 className="font-bold text-white text-sm flex items-center gap-1 text-emerald-300">❤️ Edukasi Hipertensi (Pemberantasan Garam)</h5>
            <p>Batasi natrium/garam dapur maksimal 1/2-1 sendok teh per hari. Hindari makanan berpengawet (mie instan, daging olahan sosis/kornet, kecap berlebih).</p>
            <p className="text-[10.5px] italic text-emerald-200">Tips: Konsumsi buah pisang, alpukat, sayur bayam, yang kaya kalium untuk menyeimbangkan tekanan kationik dinding pembuluh darah.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

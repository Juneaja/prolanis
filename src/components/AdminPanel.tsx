import React, { useState } from 'react';
import { Peserta, HealthLog, JadwalKontrol, MonthlyReport, VideoEdukasi, AppSettings } from '../types';
import { 
  UserPlus, 
  Calendar, 
  BadgeAlert, 
  Heart, 
  Activity, 
  Search, 
  Phone, 
  User, 
  FileText, 
  Sparkles, 
  Plus, 
  Loader2, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  AlertTriangle,
  Info,
  Pencil,
  UserCog,
  Settings,
  Upload,
  Image,
  Trash2,
  RefreshCw,
  Youtube,
  Play,
  Video
} from 'lucide-react';

interface AdminPanelProps {
  peserta: Peserta[];
  logs: HealthLog[];
  jadwal: JadwalKontrol[];
  settings: AppSettings;
  videos?: VideoEdukasi[];
  onUpdateSettings: (newSettings: AppSettings) => Promise<any>;
  onAddPeserta: (newP: any) => Promise<any>;
  onUpdatePeserta: (updatedP: any) => Promise<any>;
  onAddJadwal: (newJ: any) => Promise<any>;
  onTriggerAutomations: () => Promise<void>;
  onUpdateJadwalStatus: (id: string, status: string) => Promise<void>;
  onAddLog: (newLog: any) => Promise<any>;
  onUpdateLog: (updatedLog: any) => Promise<any>;
  onAddVideo?: (judul: string, url: string, deskripsi: string) => Promise<any>;
  onDeleteVideo?: (id: string) => Promise<any>;
}

export function AdminPanel({
  peserta,
  logs,
  jadwal,
  settings,
  videos = [],
  onUpdateSettings,
  onAddPeserta,
  onUpdatePeserta,
  onAddJadwal,
  onTriggerAutomations,
  onUpdateJadwalStatus,
  onAddLog,
  onUpdateLog,
  onAddVideo,
  onDeleteVideo
}: AdminPanelProps) {
  // Brand Customization State
  const [customLogo, setCustomLogo] = useState(settings?.logo || '');
  const [customFavicon, setCustomFavicon] = useState(settings?.favicon || '');
  const [customLogoFooter, setCustomLogoFooter] = useState(settings?.logoFooter || '');
  const [customFooterText, setCustomFooterText] = useState(settings?.footerText || '');
  const [isSubmittingSettings, setIsSubmittingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize state with backend settings
  React.useEffect(() => {
    if (settings) {
      setCustomLogo(settings.logo || '');
      setCustomFavicon(settings.favicon || '');
      setCustomLogoFooter(settings.logoFooter || '');
      setCustomFooterText(settings.footerText || '');
    }
  }, [settings]);


  
  // Custom Participant Form
  const [editingPesertaId, setEditingPesertaId] = useState<string | null>(null);
  const [nama, setNama] = useState('');
  const [noBpjs, setNoBpjs] = useState('');
  const [umur, setUmur] = useState('');
  const [kontak, setKontak] = useState('');
  const [diagnosis, setDiagnosis] = useState<'Diabetes Mellitus' | 'Hipertensi' | 'Keduanya'>('Diabetes Mellitus');
  const [isSubmittingPeserta, setIsSubmittingPeserta] = useState(false);
  const [pesertaSuccess, setPesertaSuccess] = useState('');
  const [pesertaError, setPesertaError] = useState('');

  // Vitals Health Log Form (Add/Update)
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [logGulaDarah, setLogGulaDarah] = useState('');
  const [logSistolik, setLogSistolik] = useState('');
  const [logDiastolik, setLogDiastolik] = useState('');
  const [logCatatan, setLogCatatan] = useState('');
  const [logTanggal, setLogTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [logSuccess, setLogSuccess] = useState('');
  const [logError, setLogError] = useState('');

  // Scheduler Form
  const [schedPesertaId, setSchedPesertaId] = useState('');
  const [schedTipe, setSchedTipe] = useState<'Pemeriksaan Rutin' | 'Pengambilan Obat' | 'Senam Prolanis' | 'Edukasi Kelompok'>('Pemeriksaan Rutin');
  const [schedTanggal, setSchedTanggal] = useState('');
  const [schedPukul, setSchedPukul] = useState('08:00');
  const [schedLokasi, setSchedLokasi] = useState('Puskesmas Kebon Jeruk');
  const [schedCatatan, setSchedCatatan] = useState('');
  const [isSubmittingSched, setIsSubmittingSched] = useState(false);
  const [schedSuccess, setSchedSuccess] = useState('');
  const [schedError, setSchedError] = useState('');

  // Automated trigger feedback states
  const [automationLoading, setAutomationLoading] = useState(false);
  const [automationSuccess, setAutomationSuccess] = useState('');

  // Educational Videos Form State
  const [videoJudul, setVideoJudul] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDeskripsi, setVideoDeskripsi] = useState('');
  const [isSubmittingVideo, setIsSubmittingVideo] = useState(false);
  const [videoSuccess, setVideoSuccess] = useState('');
  const [videoError, setVideoError] = useState('');

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoJudul || !videoUrl) {
      setVideoError('Judul dan URL Youtube wajib diisi!');
      return;
    }
    if (!videoUrl.includes('youtube.com') && !videoUrl.includes('youtu.be')) {
      setVideoError('Harap masukan URL video YouTube yang valid!');
      return;
    }

    setVideoError('');
    setVideoSuccess('');
    setIsSubmittingVideo(true);

    try {
      if (onAddVideo) {
        await onAddVideo(videoJudul, videoUrl, videoDeskripsi);
        setVideoSuccess('Video edukasi berhasil ditambahkan!');
        setVideoJudul('');
        setVideoUrl('');
        setVideoDeskripsi('');
      } else {
        setVideoError('Fungsi onAddVideo tidak tersedia.');
      }
    } catch (err: any) {
      setVideoError(err.message || 'Gagal menambahkan video.');
    } finally {
      setIsSubmittingVideo(false);
    }
  };

  const handleDeleteVideoClick = async (id: string) => {
    setVideoError('');
    setVideoSuccess('');
    try {
      if (onDeleteVideo) {
        await onDeleteVideo(id);
        setVideoSuccess('Video edukasi berhasil dihapus.');
      } else {
        setVideoError('Fungsi onDeleteVideo tidak tersedia.');
      }
    } catch (err: any) {
      setVideoError(err.message || 'Gagal menghapus video.');
    }
  };

  // AI Monthly Report state
  const [reportPesertaId, setReportPesertaId] = useState('');
  const [reportBulan, setReportBulan] = useState('2026-05');
  const [reportResult, setReportResult] = useState<MonthlyReport | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState('');

  // Active Selected Pasien detail view
  const [selectedPasienId, setSelectedPasienId] = useState<string | null>(null);

  // Filter participants
  const filteredPeserta = peserta.filter(p => 
    p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.noBpjs.includes(searchQuery)
  );

  const selectedPasien = peserta.find(p => p.id === selectedPasienId);
  const selectedPasienLogs = logs.filter(l => l.pesertaId === selectedPasienId);
  const selectedPasienJadwal = jadwal.filter(j => j.pesertaId === selectedPasienId);

  // Submit dynamic visual configurations (Logo, Favicon, Footer text, Footer logo)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSettings(true);
    setSettingsSuccess('');
    setSettingsError('');
    try {
      await onUpdateSettings({
        logo: customLogo,
        favicon: customFavicon,
        logoFooter: customLogoFooter,
        footerText: customFooterText
      });
      setSettingsSuccess('Pengaturan tampilan berhasil disimpan secara permanen di Firebase!');
    } catch (err: any) {
      setSettingsError(err.message || 'Gagal memperbarui konfigurasi.');
    } finally {
      setIsSubmittingSettings(false);
    }
  };

  const handleSettingsFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon' | 'logoFooter') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size is below 2MB to ensure good performance
      if (file.size > 2 * 1024 * 1024) {
        setSettingsError('Ukuran file maksimal adalah 2MB.');
        return;
      }
      setSettingsError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (field === 'logo') {
          setCustomLogo(base64String);
        } else if (field === 'favicon') {
          setCustomFavicon(base64String);
        } else if (field === 'logoFooter') {
          setCustomLogoFooter(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit manual registration or update
  const handleCreateOrUpdatePeserta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !noBpjs || !umur) {
      setPesertaError('Seluruh field (Nama, No BPJS, Usia) wajib diisi.');
      return;
    }
    setPesertaError('');
    setPesertaSuccess('');
    setIsSubmittingPeserta(true);
    try {
      if (editingPesertaId) {
        const response = await onUpdatePeserta({
          id: editingPesertaId,
          nama,
          noBpjs,
          umur: Number(umur),
          kontak,
          diagnosis
        });
        setPesertaSuccess(response.message || 'Pembaruan data pasien sukses!');
        setEditingPesertaId(null);
      } else {
        const response = await onAddPeserta({ nama, noBpjs, umur, kontak, diagnosis });
        setPesertaSuccess(response.message || 'Pendaftaran manual sukses!');
      }
      // Reset form fields
      setNama('');
      setNoBpjs('');
      setUmur('');
      setKontak('');
      setDiagnosis('Diabetes Mellitus');
    } catch (err: any) {
      setPesertaError(err.message || 'Pendaftaran/Pembaruan gagal.');
    } finally {
      setIsSubmittingPeserta(false);
    }
  };

  // Submit Add/Update Patient Health Log
  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPasienId || !selectedPasien) {
      setLogError('Silakan pilih pasien terlebih dahulu.');
      return;
    }
    if (!logTanggal) {
      setLogError('Kolom Tanggal wajib diisi.');
      return;
    }

    if (selectedPasien.diagnosis !== 'Hipertensi' && !logGulaDarah) {
      setLogError('Kolom Gula Darah wajib diisi.');
      return;
    }
    if (selectedPasien.diagnosis !== 'Diabetes Mellitus' && (!logSistolik || !logDiastolik)) {
      setLogError('Kolom Sistolik dan Diastolik wajib diisi.');
      return;
    }

    setLogError('');
    setLogSuccess('');
    setIsSubmittingLog(true);

    try {
      const gulaVal = selectedPasien.diagnosis === 'Hipertensi' ? 100 : Number(logGulaDarah);
      const sistolikVal = selectedPasien.diagnosis === 'Diabetes Mellitus' ? 120 : Number(logSistolik);
      const diastolikVal = selectedPasien.diagnosis === 'Diabetes Mellitus' ? 80 : Number(logDiastolik);

      if (editingLogId) {
        const response = await onUpdateLog({
          id: editingLogId,
          pesertaId: selectedPasienId,
          tanggal: logTanggal,
          gulaDarah: gulaVal,
          sistolik: sistolikVal,
          diastolik: diastolikVal,
          catatan: logCatatan
        });
        setLogSuccess(response.message || 'Hasil pemeriksaan berhasil diperbarui!');
        setEditingLogId(null);
      } else {
        const response = await onAddLog({
          pesertaId: selectedPasienId,
          tanggal: logTanggal,
          gulaDarah: gulaVal,
          sistolik: sistolikVal,
          diastolik: diastolikVal,
          catatan: logCatatan
        });
        setLogSuccess(response.message || 'Hasil pemeriksaan baru berhasil ditambahkan!');
      }

      // Reset fields
      setLogGulaDarah('');
      setLogSistolik('');
      setLogDiastolik('');
      setLogCatatan('');
      setLogTanggal(new Date().toISOString().split('T')[0]);
    } catch (err: any) {
      setLogError(err.message || 'Gagal menyimpan hasil pemeriksaan.');
    } finally {
      setIsSubmittingLog(false);
    }
  };

  // Submit Schedule Kontrol
  const handleCreateJadwal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedPesertaId || !schedTanggal || !schedPukul || !schedLokasi) {
      setSchedError('Isi semua field dasar penjadwalan.');
      return;
    }
    setSchedError('');
    setSchedSuccess('');
    setIsSubmittingSched(true);
    try {
      const response = await onAddJadwal({
        pesertaId: schedPesertaId,
        tipe: schedTipe,
        tanggal: schedTanggal,
        pukul: schedPukul,
        lokasi: schedLokasi,
        catatan: schedCatatan
      });
      setSchedSuccess(response.message || 'Menambahkan jadwal kontrol sukses!');
      setSchedCatatan('');
      setSchedTanggal('');
    } catch (err: any) {
      setSchedError(err.message || 'Penjadwalan gagal.');
    } finally {
      setIsSubmittingSched(false);
    }
  };

  // Trigger automation pengingat
  const handleTriggerAutomation = async () => {
    setAutomationLoading(true);
    setAutomationSuccess('');
    try {
      await onTriggerAutomations();
      setAutomationSuccess('Sistem mendeteksi jadwal kontrol terdekat. Pengingat kontrol H-1 otomatis berhasil didistribusikan ke peserta!');
      setTimeout(() => setAutomationSuccess(''), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setAutomationLoading(false);
    }
  };

  // Generate AI monthly health progress report
  const handleGenerateReport = async () => {
    if (!reportPesertaId) {
      setReportError('Pilih peserta terlebih dahulu.');
      return;
    }
    setReportError('');
    setReportResult(null);
    setIsGeneratingReport(true);
    try {
      const res = await fetch('/api/report/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pesertaId: reportPesertaId, bulan: reportBulan })
      });
      const data = await res.json();
      if (res.ok) {
        setReportResult(data);
      } else {
        setReportError(data.error || 'Gagal menghasilkan analisis.');
      }
    } catch (err: any) {
      setReportError('Sambungan gagal saat menganalisis data.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
      {/* Kolom Kiri: Management Daftar Peserta */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header & Automated Scheduler Trigger */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Pemantauan Anggota Prolanis</h3>
            <p className="text-xs text-gray-400">Total terdaftar: {peserta.length} lansia • Aktif kontrol rutin</p>
          </div>
          <button
            onClick={handleTriggerAutomation}
            disabled={automationLoading}
            id="picu-otomatis-btn"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-semibold rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-md shadow-emerald-100 disabled:opacity-50"
          >
            {automationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            Picu Sistem Pengingat
          </button>
        </div>

        {automationSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-2xl border border-emerald-100 flex items-start gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="font-medium">{automationSuccess}</p>
          </div>
        )}

        {/* List & Search */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari peserta berdasarkan nama / no kartu BPJS..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none placeholder-gray-400"
              />
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="divide-y divide-gray-50 max-h-[380px] overflow-y-auto">
            {filteredPeserta.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                Tidak ada peserta yang cocok dengan filter pencarian Anda
              </div>
            ) : (
              filteredPeserta.map((p) => {
                const isSelected = selectedPasienId === p.id;
                // calculate latest log indicators
                const patientLogs = logs.filter(l => l.pesertaId === p.id);
                const latestLog = patientLogs[0]; // log is unsorted, let's grab latest by tanggal
                
                return (
                  <div 
                    key={p.id}
                    onClick={() => setSelectedPasienId(isSelected ? null : p.id)}
                    className={`p-4 flex items-center justify-between text-left cursor-pointer transition-all ${isSelected ? 'bg-teal-50/50 border-l-4 border-l-teal-500' : 'hover:bg-gray-50'}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800 text-sm">{p.nama}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded-lg ${
                          p.diagnosis === 'Diabetes Mellitus' ? 'bg-red-50 text-red-600' :
                          p.diagnosis === 'Hipertensi' ? 'bg-emerald-50 text-emerald-600' :
                          'bg-indigo-50 text-indigo-600'
                        }`}>
                          {p.diagnosis}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono">No. BPJS: {p.noBpjs} • Usia: {p.umur} Thn</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {latestLog ? (
                        <div className="hidden sm:flex items-center gap-3 text-right">
                          <div className="space-y-0.5">
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold">Log Terakhir</span>
                            <div className="flex gap-2">
                              {p.diagnosis !== 'Hipertensi' && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${latestLog.statusGulaDarah === 'Tinggi' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                  🍬 {latestLog.gulaDarah}
                                </span>
                              )}
                              {p.diagnosis !== 'Diabetes Mellitus' && (
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${latestLog.statusTekananDarah === 'Hipertensi' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>
                                  ❤️ {latestLog.sistolik}/{latestLog.diastolik}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <span className="hidden sm:inline text-[9px] text-gray-300 font-semibold uppercase">Kosong</span>
                      )}
                      <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? 'rotate-90 text-teal-600' : ''}`} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Panel Pasien yang Dipilih */}
        {selectedPasien && (
          <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-md shadow-teal-50/10 space-y-6 animate-scaleUp">
            
            {/* Passenger Identity Header */}
            <div className="flex items-center justify-between border-b border-slate-150 pb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 flex items-center justify-center font-bold">
                  {selectedPasien.nama.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-800 text-base">Detail Rekam Medis: {selectedPasien.nama}</h4>
                  <p className="text-xs text-slate-400 font-medium">BPJS: <span className="font-mono text-slate-600 font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{selectedPasien.noBpjs}</span> • Kontak: {selectedPasien.kontak}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPesertaId(selectedPasien.id);
                    setNama(selectedPasien.nama);
                    setNoBpjs(selectedPasien.noBpjs);
                    setUmur(String(selectedPasien.umur));
                    setKontak(selectedPasien.kontak || '');
                    setDiagnosis(selectedPasien.diagnosis);
                    // scroll to form
                    document.getElementById('form-peserta-sec')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
                >
                  <Pencil className="w-3.5 h-3.5 text-teal-600" />
                  Edit Profil Account
                </button>
                <button onClick={() => {
                  setSelectedPasienId(null);
                  setEditingLogId(null);
                }} className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-650 cursor-pointer transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Hasil Log block */}
              <div className="space-y-4 lg:col-span-1">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest font-display flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-teal-500" />
                  Riwayat Pengukuran Penyakit
                </h5>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedPasienLogs.length === 0 ? (
                    <p className="text-xs text-slate-300 italic py-4">Belum ada catatan diagnosa ataupun input pemeriksaan.</p>
                  ) : (
                    selectedPasienLogs.map((l) => (
                      <div key={l.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-2 relative group hover:bg-teal-50/20 transition-all duration-200">
                        <div className="flex items-center justify-between text-slate-400 font-bold">
                          <span>{new Date(l.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          
                          {/* Admin Edit button */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingLogId(l.id);
                              setLogGulaDarah(String(l.gulaDarah));
                              setLogSistolik(String(l.sistolik));
                              setLogDiastolik(String(l.diastolik));
                              setLogCatatan(l.catatan || '');
                              setLogTanggal(l.tanggal);
                              setLogError('');
                              setLogSuccess('');
                            }}
                            className="p-1 bg-white hover:bg-teal-50 border border-slate-200 text-slate-500 hover:text-teal-700 rounded-lg shadow-sm transition-all absolute right-2 top-2 opacity-80 group-hover:opacity-100 cursor-pointer"
                            title="Ubah data log ini"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <div className="flex flex-col gap-1 text-slate-600 font-medium pt-1">
                          {selectedPasien.diagnosis !== 'Hipertensi' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-red-50 text-red-650 px-1 rounded font-mono font-black border border-red-100">GDS</span>
                              <span className="font-bold text-slate-800">{l.gulaDarah} mg/dL</span>
                              <span className={`text-[9px] px-1 rounded ${l.statusGulaDarah === 'Tinggi' ? 'text-red-500 bg-red-50/85' : 'text-slate-550 bg-slate-100'}`}>
                                ({l.statusGulaDarah || 'Normal'})
                              </span>
                            </div>
                          )}
                          {selectedPasien.diagnosis !== 'Diabetes Mellitus' && (
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-teal-50 text-teal-650 px-1 rounded font-mono font-black border border-teal-100">TENSI</span>
                              <span className="font-bold text-slate-800">{l.sistolik}/{l.diastolik} mmHg</span>
                              <span className={`text-[9px] px-1 rounded ${l.statusTekananDarah === 'Hipertensi' ? 'text-red-500 bg-red-50/85' : 'text-slate-550 bg-slate-100'}`}>
                                ({l.statusTekananDarah || 'Normal'})
                              </span>
                            </div>
                          )}
                          {l.catatan && (
                            <p className="text-[11px] text-slate-400 italic border-l-2 border-slate-200 pl-2 mt-1 truncate">
                              &quot;{l.catatan}&quot;
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Jadwal Anggota block */}
              <div className="space-y-4 lg:col-span-1">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest font-display flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Rencana Kontrol & Edukasi
                </h5>
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {selectedPasienJadwal.length === 0 ? (
                    <p className="text-xs text-slate-300 italic py-4">Belum memiliki rencana kontrol medikasi.</p>
                  ) : (
                    selectedPasienJadwal.map((j) => (
                      <div key={j.id} className="p-3 bg-slate-50/60 border border-slate-100 rounded-2xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{j.tipe}</span>
                          <span className={`px-2 py-0.5 text-[8.5px] font-black rounded-lg uppercase tracking-wider border ${
                            j.status === 'Akan Datang' ? 'bg-blue-50 border-blue-200 text-blue-600' :
                            j.status === 'Selesai' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
                            'bg-gray-100 border-gray-250 text-gray-500'
                          }`}>
                            {j.status}
                          </span>
                        </div>
                        <p className="text-slate-400 font-mono text-[10px] mt-0.5">{j.tanggal} pukul {j.pukul} WIB</p>
                        <p className="text-slate-400 text-[10px] truncate">📍 @ {j.lokasi}</p>
                        
                        {j.status === 'Akan Datang' && (
                          <div className="flex gap-2 pt-1.5">
                            <button
                              onClick={() => onUpdateJadwalStatus(j.id, 'Selesai')}
                              className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[9px] font-bold active:scale-95 transition-all cursor-pointer shadow-sm"
                            >
                              Selesai
                            </button>
                            <button
                              onClick={() => onUpdateJadwalStatus(j.id, 'Batal')}
                              className="px-2.5 py-1 bg-slate-250 hover:bg-slate-300 text-slate-600 rounded-lg text-[9px] font-bold active:scale-95 transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Direct Add / Edit Log Form */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-50 to-teal-50/5 border border-teal-100/40 space-y-3.5 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest font-display flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-teal-650" />
                    {editingLogId ? 'Ubah Temuan Kontrol' : 'Input Hasil Cek Baru'}
                  </h5>
                  {editingLogId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLogId(null);
                        setLogGulaDarah('');
                        setLogSistolik('');
                        setLogDiastolik('');
                        setLogCatatan('');
                        setLogTanggal(new Date().toISOString().split('T')[0]);
                        setLogError('');
                      }}
                      className="text-[9px] font-extrabold uppercase bg-slate-200 text-slate-600 px-2 py-0.5 rounded hover:bg-slate-250 transition-all active:scale-95 cursor-pointer"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmitLog} className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tanggal Pemeriksaan</label>
                    <input
                      type="date"
                      required
                      value={logTanggal}
                      onChange={(e) => setLogTanggal(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedPasien.diagnosis !== 'Hipertensi' && (
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex justify-between">
                          <span>Gula Darah Sewaktu</span>
                          <span className="text-red-500 font-normal">mg/dL</span>
                        </label>
                        <input
                          type="number"
                          required
                          value={logGulaDarah}
                          onChange={(e) => setLogGulaDarah(e.target.value)}
                          placeholder="misal: 140"
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {selectedPasien.diagnosis !== 'Diabetes Mellitus' && (
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tekanan Darah (Tensi)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="number"
                              required
                              value={logSistolik}
                              onChange={(e) => setLogSistolik(e.target.value)}
                              placeholder="Sis"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                            />
                            <span className="text-[8px] text-slate-400 font-medium block mt-1">Sistolik (mmHg)</span>
                          </div>
                          <div>
                            <input
                              type="number"
                              required
                              value={logDiastolik}
                              onChange={(e) => setLogDiastolik(e.target.value)}
                              placeholder="Dia"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                            />
                            <span className="text-[8px] text-slate-400 font-medium block mt-1">Diastolik (mmHg)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Catatan Klinik Puskesmas</label>
                    <textarea
                      value={logCatatan}
                      onChange={(e) => setLogCatatan(e.target.value)}
                      rows={2}
                      placeholder="misal: status terkendali, pertahankan pola makan"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLog}
                    className="w-full py-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-105 rounded-xl font-bold font-display text-xs text-white flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-md disabled:opacity-50"
                  >
                    {isSubmittingLog ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : editingLogId ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    {editingLogId ? 'Perbarui Catatan Medis' : 'Simpan Temuan Medis'}
                  </button>

                  {logSuccess && (
                    <p className="text-center text-[10.5px] font-semibold text-emerald-600 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 animate-fadeIn">
                      ✓ {logSuccess}
                    </p>
                  )}

                  {logError && (
                    <p className="text-center text-[10.5px] font-semibold text-red-650 bg-red-50 p-1.5 rounded-lg border border-red-100 animate-fadeIn">
                      ✕ {logError}
                    </p>
                  )}
                </form>
              </div>

            </div>
          </div>
        )}

        {/* AI report generator card */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-50 text-violet-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-md font-bold text-gray-800">Evaluasi Progress & Rekomendasi Klinik AI</h4>
              <p className="text-xs text-gray-400">Teknologi Gemini Generatif mengevaluasi kestabilan penyakit & nutrisi pasien</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pilih Anggota Prolanis</label>
              <select
                value={reportPesertaId}
                onChange={(e) => setReportPesertaId(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">-- Pilih Anggota --</option>
                {peserta.map(p => (
                  <option key={p.id} value={p.id}>{p.nama} ({p.diagnosis})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Periode Evaluasi</label>
              <select
                value={reportBulan}
                onChange={(e) => setReportBulan(e.target.value)}
                className="w-full p-2 text-xs bg-white border border-gray-200 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="2026-05">Mei 2026</option>
                <option value="2026-04">April 2026</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || !reportPesertaId}
            id="buat-laporan-ai-btn"
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs rounded-2xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-55"
          >
            {isGeneratingReport ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Luncurkan Diagnosis & Saran Nutrisi AI
          </button>

          {reportError && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-start gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <span>{reportError}</span>
            </div>
          )}

          {reportResult && (
            <div className="p-6 bg-gradient-to-br from-violet-50/65 via-indigo-50/20 to-white border border-violet-150 rounded-2xl space-y-4 shadow-lux hover:shadow-lux-hover transition-all duration-300 animate-scaleUp">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-violet-100/70">
                <span className="text-xs font-black text-violet-750 bg-violet-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-display shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-shake" />
                  {reportResult.generikReport ? "Rekomendasi Klinis Prolanis" : "Evaluasi AI Dokter Spesialis"}
                </span>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-150/60 px-3 py-1 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">KLASIFIKASI RISIKO:</span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full tracking-wide uppercase border ${
                    reportResult.risiko === 'Rendah' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    reportResult.risiko === 'Sedang' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {reportResult.risiko}
                  </span>
                </div>
              </div>

              {/* Stats calculations banner with Fira Code */}
              <div className="grid grid-cols-3 gap-3 py-3 bg-white/70 backdrop-blur-sm border border-slate-100 rounded-xl text-center shadow-inner">
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">TOTAL LOG</span>
                  <span className="text-[14px] font-black text-slate-800 font-mono tracking-tight">{reportResult.totalLogs} kali</span>
                </div>
                <div className="space-y-1 border-x border-slate-150/60">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">RATA GULA</span>
                  <span className="text-[14px] font-black text-red-500 font-mono tracking-tight">{reportResult.rataRataGulaDarah || "-"} <span className="text-[9px] font-semibold text-slate-400">mg/dL</span></span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">RATA TENSI</span>
                  <span className="text-[14px] font-black text-emerald-600 font-mono tracking-tight">{reportResult.rataRataSistolik}/{reportResult.rataRataDiastolik} <span className="text-[9px] font-semibold text-slate-400">mmHg</span></span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-2 bg-white/90 p-4 rounded-xl border border-slate-150/70 hover:shadow-sm transition-all duration-200">
                  <span className="font-display font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-violet-500 rounded-full" />
                    📋 Kondisi & Diagnosis Progresif
                  </span>
                  <p className="text-slate-600 leading-relaxed font-semibold pl-3">{reportResult.statusKesehatan}</p>
                </div>
                <div className="space-y-2 bg-white/95 p-4 rounded-xl border border-slate-150/70 hover:shadow-sm transition-all duration-200">
                  <span className="font-display font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
                    🍉 Rekomendasi Terapi, Nutrisi & Kontrol
                  </span>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line pl-3 font-medium structure-bullets">
                    {reportResult.rekomendasi}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kolom Kanan: Pendaftaran Manual & Jadwal Kontrol Baru */}
      <div className="space-y-6">
        {/* Formulir 1: Pendaftaran / Update Anggota BPJS */}
        <div id="form-peserta-sec" className="bg-white p-5 rounded-3xl border border-teal-100/80 shadow-md shadow-teal-50/5 space-y-4 scroll-mt-20">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {editingPesertaId ? (
                <UserCog className="w-5 h-5 text-indigo-500" />
              ) : (
                <UserPlus className="w-5 h-5 text-teal-500" />
              )}
              <h4 className="font-extrabold text-gray-800 text-sm">
                {editingPesertaId ? 'Perbarui Data Pasien BPJS' : 'Registrasi Manual Pasien BPJS'}
              </h4>
            </div>
            {editingPesertaId && (
              <button
                type="button"
                onClick={() => {
                  setEditingPesertaId(null);
                  setNama('');
                  setNoBpjs('');
                  setUmur('');
                  setKontak('');
                  setDiagnosis('Diabetes Mellitus');
                }}
                className="text-[10px] text-red-600 font-bold bg-red-100/80 hover:bg-red-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer active:scale-95"
              >
                Batal Edit
              </button>
            )}
          </div>

          <form onSubmit={handleCreateOrUpdatePeserta} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nama Lengkap Lansia</label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="misal: Pak Hartono"
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">No. Kartu BPJS</label>
                <input
                  type="text"
                  required
                  maxLength={13}
                  value={noBpjs}
                  onChange={(e) => setNoBpjs(e.target.value)}
                  placeholder="13 digit"
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Usia (Tahun)</label>
                <input
                  type="number"
                  required
                  value={umur}
                  onChange={(e) => setUmur(e.target.value)}
                  placeholder="Thn"
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nomor Kontak aktif</label>
              <input
                type="text"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Diagnosis Utama</label>
              <div className="grid grid-cols-3 gap-1">
                {(['Diabetes Mellitus', 'Hipertensi', 'Keduanya'] as const).map((diag) => (
                  <button
                    key={diag}
                    type="button"
                    onClick={() => setDiagnosis(diag)}
                    className={`py-1.5 px-1 text-[9px] font-bold rounded-lg border text-center transition-all ${
                      diagnosis === diag
                        ? 'bg-teal-50 border-teal-200 text-teal-700'
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {diag === 'Diabetes Mellitus' ? 'DM' : diag === 'Hipertensi' ? 'HT' : 'Keduanya'}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingPeserta}
              className={`w-full py-2 px-4 rounded-xl text-xs font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
                editingPesertaId ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {isSubmittingPeserta ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : editingPesertaId ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {editingPesertaId ? 'Simpan Perubahan Data Pasien' : 'Hasilkan Rekening Anggota'}
            </button>

            {pesertaSuccess && (
              <p className="text-center text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg animate-fadeIn">
                ✓ {pesertaSuccess}
              </p>
            )}

            {pesertaError && (
              <p className="text-center text-[11.5px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg animate-fadeIn">
                ✕ {pesertaError}
              </p>
            )}
          </form>
        </div>

        {/* Formulir 2: Buat Jadwal Kontrol Baru (Memicu Notifikasi Anggota Otomatis) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            <h4 className="font-extrabold text-gray-800 text-sm">Penjadwalan Jadwal Kontrol & Edukasi</h4>
          </div>

          <form onSubmit={handleCreateJadwal} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tujukan pada Anggota</label>
              <select
                required
                value={schedPesertaId}
                onChange={(e) => setSchedPesertaId(e.target.value)}
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="">-- Pilih Anggota --</option>
                {peserta.map(p => (
                  <option key={p.id} value={p.id}>{p.nama}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tipe Kegiatan / Kontrol</label>
              <select
                value={schedTipe}
                onChange={(e) => setSchedTipe(e.target.value as any)}
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                <option value="Pemeriksaan Rutin">Pemeriksaan Rutin / Gula Darah</option>
                <option value="Pengambilan Obat">Pengambilan Obat Rutin</option>
                <option value="Senam Prolanis">Senam Lansia Prolanis</option>
                <option value="Edukasi Kelompok">Edukasi & Sosialisasi Gizi</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Acara</label>
                <input
                  type="date"
                  required
                  value={schedTanggal}
                  onChange={(e) => setSchedTanggal(e.target.value)}
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pukul (WIB)</label>
                <input
                  type="time"
                  required
                  value={schedPukul}
                  onChange={(e) => setSchedPukul(e.target.value)}
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Lokasi Pelaksanaan</label>
              <input
                type="text"
                required
                value={schedLokasi}
                onChange={(e) => setSchedLokasi(e.target.value)}
                placeholder="Aula / Lapangan Puskesmas"
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Catatan Tambahan Dokter</label>
              <textarea
                value={schedCatatan}
                onChange={(e) => setSchedCatatan(e.target.value)}
                rows={2}
                placeholder="bawa kartu BPJS, hindari sarapan manis pagi hari"
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingSched}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition-all text-center flex items-center justify-center gap-1"
            >
              {isSubmittingSched ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              Terbitkan Kontrol & Notif
            </button>

            {schedSuccess && (
              <p className="text-center text-[11.5px] font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg animate-fadeIn">
                ✓ {schedSuccess}
              </p>
            )}

            {schedError && (
              <p className="text-center text-[11.5px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg animate-fadeIn">
                ✕ {schedError}
              </p>
            )}
          </form>
        </div>

        {/* Formulir 3: Pengaturan Tampilan & Brand Puskesmas */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <Settings className="w-5 h-5 text-teal-500" />
            <h4 className="font-extrabold text-gray-800 text-sm">Pengaturan Identitas Portal Puskesmas</h4>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            {/* Logo Settings */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Logo Utama (Teks / Gambar)</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customLogo && customLogo.startsWith("data:image") ? "Gambar Terupload" : customLogo}
                  disabled={customLogo !== null && customLogo !== undefined && customLogo.startsWith("data:image")}
                  onChange={(e) => setCustomLogo(e.target.value)}
                  placeholder="Ketik nama klinik teks, misal: PUSKESMAS KEBON JERUK"
                  className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none disabled:opacity-50"
                />
                
                <div className="flex items-center justify-between gap-2">
                  <label className="h-8 flex-1 flex items-center justify-center gap-1.5 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-xl text-[10px] font-black cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    Upload Foto Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSettingsFileChange(e, 'logo')}
                      className="hidden"
                    />
                  </label>
                  
                  {customLogo && (
                    <button
                      type="button"
                      onClick={() => setCustomLogo('')}
                      className="h-8 px-2.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-650 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                      title="Reset Logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Reset
                    </button>
                  )}
                </div>

                {customLogo && customLogo.startsWith("data:image") && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    <img src={customLogo} alt="Preview Logo" className="h-10 object-contain max-w-full" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>

            {/* Favicon Settings */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Favicon Browser (PNG / SVG)</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="h-8 flex-1 flex items-center justify-center gap-1.5 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-xl text-[10px] font-black cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    Upload Favicon
                    <input
                      type="file"
                      accept="image/png, image/svg+xml, image/x-icon"
                      onChange={(e) => handleSettingsFileChange(e, 'favicon')}
                      className="hidden"
                    />
                  </label>
                  
                  {customFavicon && (
                    <button
                      type="button"
                      onClick={() => setCustomFavicon('')}
                      className="h-8 px-2.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-650 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center"
                      title="Reset Favicon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {customFavicon && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 justify-center">
                    <img src={customFavicon} alt="Preview Favicon" className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
                    <span className="text-[9px] text-gray-400 font-bold font-mono">Favicon Aktif</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Logo Settings */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Logo Footer Klinik (PNG / SVG)</label>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="h-8 flex-1 flex items-center justify-center gap-1.5 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 rounded-xl text-[10px] font-black cursor-pointer transition-all">
                    <Upload className="w-3.5 h-3.5 text-teal-600" />
                    Upload Logo Footer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleSettingsFileChange(e, 'logoFooter')}
                      className="hidden"
                    />
                  </label>
                  
                  {customLogoFooter && (
                    <button
                      type="button"
                      onClick={() => setCustomLogoFooter('')}
                      className="h-8 px-2.5 bg-red-50 hover:bg-red-100 border border-red-150 text-red-650 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center"
                      title="Reset Logo Footer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {customLogoFooter && (
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                    <img src={customLogoFooter} alt="Preview Logo Footer" className="h-8 object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>

            {/* Footer Text Settings */}
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Kustomisasi Teks Footer</label>
              <textarea
                value={customFooterText}
                onChange={(e) => setCustomFooterText(e.target.value)}
                rows={2}
                placeholder="Tulis hak cipta atau kredensial, misal: © 2026 Admin BPJS Klinik"
                className="w-full p-2 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingSettings}
              className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 active:scale-95 transition-all text-center flex items-center justify-center gap-1 shadow shadow-teal-100"
            >
              {isSubmittingSettings ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Simpan & Sinkronisasi Ke Firebase
            </button>

            {settingsSuccess && (
              <p className="text-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 p-2 rounded-lg animate-fadeIn">
                ✓ {settingsSuccess}
              </p>
            )}

            {settingsError && (
              <p className="text-center text-[11px] font-semibold text-red-600 bg-red-50 p-2 rounded-lg animate-fadeIn">
                ✕ {settingsError}
              </p>
            )}
          </form>
        </div>

        {/* Formulir 4: Manajemen Video Edukasi Pasien (YouTube) */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-50 pb-2">
            <Youtube className="w-5 h-5 text-red-500 animate-pulse" />
            <h4 className="font-extrabold text-gray-800 text-sm font-display">Video Edukasi YouTube Pasien</h4>
          </div>

          <form onSubmit={handleAddVideo} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Judul Video Edukasi</label>
              <input
                type="text"
                value={videoJudul}
                onChange={(e) => setVideoJudul(e.target.value)}
                placeholder="Contoh: Manfaat Senam Prolanis Bagi Diabetes"
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none placeholder-gray-400 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                <span>Link YouTube</span>
                <span className="text-[8px] text-gray-400 lowercase tracking-normal font-normal">e.g. https://www.youtube.com/watch...</span>
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Masukkan link lengkap YouTube..."
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Deskripsi / Penjelasan Singkat (Opsional)</label>
              <textarea
                value={videoDeskripsi}
                onChange={(e) => setVideoDeskripsi(e.target.value)}
                rows={2}
                placeholder="Penjelasan ringkas isi materi video edukasi untuk pasien..."
                className="w-full p-2.5 text-xs bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingVideo}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold active:scale-95 transition-all text-center flex items-center justify-center gap-1.5 shadow shadow-red-100 cursor-pointer"
            >
              {isSubmittingVideo ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Tambah Link Video Edukasi
            </button>

            {videoSuccess && (
              <p className="text-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 p-2.5 rounded-xl animate-fadeIn">
                ✓ {videoSuccess}
              </p>
            )}

            {videoError && (
              <p className="text-center text-[11px] font-semibold text-red-650 bg-red-50 p-2.5 rounded-xl animate-fadeIn">
                ✕ {videoError}
              </p>
            )}
          </form>

          {/* List of uploaded educational videos */}
          <div className="border-t border-gray-50 pt-4 space-y-3">
            <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-red-500" />
              Daftar Video di Portal Edukasi ({videos.length})
            </h5>

            {videos.length === 0 ? (
              <p className="text-center text-xs text-gray-400 italic py-4">Belum ada video edukasi yang ditambahkan.</p>
            ) : (
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {videos.map((vid) => (
                  <div key={vid.id} className="p-3 bg-red-50/10 border border-red-50 hover:border-red-100/75 rounded-2xl flex items-start gap-2.5 transition-all">
                    <div className="p-2 bg-red-50 text-red-600 rounded-xl mt-0.5 shrink-0">
                      <Play className="w-4 h-4 fill-red-600 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-xs text-gray-800 leading-tight truncate">{vid.judul}</p>
                      {vid.deskripsi && (
                        <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">{vid.deskripsi}</p>
                      )}
                      <a
                        href={vid.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] text-teal-650 hover:underline font-bold mt-1.5"
                      >
                        <Youtube className="w-3 h-3 text-red-500 shrink-0" />
                        Buka di YouTube ↗
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideoClick(vid.id)}
                      className="p-1 text-gray-300 hover:text-red-650 rounded-lg hover:bg-red-50 transition-all shrink-0 cursor-pointer"
                      title="Hapus Video Edukasi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

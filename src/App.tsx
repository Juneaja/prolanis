import React, { useState, useEffect } from 'react';
import { Peserta, HealthLog, JadwalKontrol, Notification, AppSettings, VideoEdukasi } from './types';
import { AdminPanel } from './components/AdminPanel';
import { ParticipantDashboard } from './components/ParticipantDashboard';
import { AdminLogin } from './components/AdminLogin';
import { ParticipantLogin } from './components/ParticipantLogin';
import { 
  Activity, 
  Heart, 
  ShieldAlert, 
  Loader2, 
  HeartHandshake,
  Check,
  UserCheck,
  Building,
  LogOut
} from 'lucide-react';

export default function App() {
  // Navigation Role Selection State
  // "admin" for Admin/Dokter panel, "peserta" for Patient client
  const [currentRole, setCurrentRole] = useState<'admin' | 'peserta'>('peserta');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isPesertaLoggedIn, setIsPesertaLoggedIn] = useState<boolean>(false);

  // Unified Database States loaded from Server
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [jadwal, setJadwal] = useState<JadwalKontrol[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [videos, setVideos] = useState<VideoEdukasi[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    logo: "",
    logoFooter: "",
    favicon: "",
    footerText: "© 2026 Admin BPJS Kesehatan • Keamanan Otentikasi Klinik Berlapis • Enkripsi Sesi Medis Aktif"
  });
  
  // Dynamic browser Favicon sync
  useEffect(() => {
    if (appSettings?.favicon) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = appSettings.favicon;
    }
  }, [appSettings?.favicon]);

  
  // LocalStorage Robust Handlers for Static Deployments (GitHub / Vercel SPA)
  const LOCAL_STORAGE_KEY = 'prolanis_fallback_db';
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const localSeedData = {
    peserta: [
      {
        id: "peserta-budi",
        nama: "Pak Budi Santoso",
        noBpjs: "0001249386291",
        umur: 64,
        kontak: "081234567890",
        diagnosis: "Keduanya",
        createdAt: "2026-03-01T08:00:00.000Z"
      },
      {
        id: "peserta-siti",
        nama: "Ibu Siti Rahma",
        noBpjs: "0002135489004",
        umur: 58,
        kontak: "082345678901",
        diagnosis: "Diabetes Mellitus",
        createdAt: "2026-03-15T09:30:00.000Z"
      },
      {
        id: "peserta-joko",
        nama: "Pak Joko Widodo",
        noBpjs: "0003429815038",
        umur: 69,
        kontak: "083456789012",
        diagnosis: "Hipertensi",
        createdAt: "2026-04-02T10:00:00.000Z"
      }
    ],
    logs: [
      { id: "log-b1", pesertaId: "peserta-budi", tanggal: "2026-04-05", gulaDarah: 145, sistolik: 135, diastolik: 85, catatan: "Setelah makan kolak", statusGulaDarah: "Normal", statusTekananDarah: "Prehipertensi", createdAt: "2026-04-05T08:00:00.000Z" },
      { id: "log-b2", pesertaId: "peserta-budi", tanggal: "2026-04-12", gulaDarah: 168, sistolik: 142, diastolik: 90, catatan: "Tubuh agak lemas setelah sahur", statusGulaDarah: "Tinggi", statusTekananDarah: "Hipertensi", createdAt: "2026-04-12T08:00:00.000Z" },
      { id: "log-b3", pesertaId: "peserta-budi", tanggal: "2026-04-19", gulaDarah: 130, sistolik: 130, diastolik: 80, catatan: "Rutin minum Metformin", statusGulaDarah: "Normal", statusTekananDarah: "Normal", createdAt: "2026-04-19T08:00:00.000Z" },
      { id: "log-s1", pesertaId: "peserta-siti", tanggal: "2026-05-01", gulaDarah: 210, sistolik: 120, diastolik: 80, catatan: "Kebanyakan makan karbohidrat", statusGulaDarah: "Tinggi", statusTekananDarah: "Normal", createdAt: "2026-05-01T09:00:00.000Z" }
    ],
    jadwal: [
      {
        id: "jadwal-1",
        pesertaId: "peserta-budi",
        pesertaNama: "Pak Budi Santoso",
        tipe: "Pemeriksaan Rutin",
        tanggal: "2026-06-03",
        pukul: "08:30",
        lokasi: "Puskesmas Kebon Jeruk",
        status: "Akan Datang",
        catatan: "Kontrol gula darah puasa & tekanan darah.",
        createdAt: "2026-05-28T09:00:00.000Z"
      }
    ],
    notifications: [
      {
        id: "notif-1",
        pesertaId: "peserta-budi",
        judul: "Jadwal Kontrol Mendatang",
        pesan: "Mengingatkan kontrol rutin Pemeriksaan Rutin yang akan dijadwalkan pada 2026-06-03 pukul 08:30 di Puskesmas Kebon Jeruk.",
        tanggal: "2026-05-29",
        dibaca: false,
        tipe: "info"
      }
    ],
    videos: [
      {
        id: "video-1",
        judul: "Mengenal Prolanis BPJS Kesehatan",
        url: "https://www.youtube.com/watch?v=RInYsc-G7zU",
        deskripsi: "Edukasi mengenai apa itu Program Pengelolaan Penyakit Kronis (PROLANIS) dan manfaatnya bagi kesehatan lansia.",
        createdAt: "2026-05-28T09:00:00.000Z"
      }
    ],
    settings: {
      logo: "",
      logoFooter: "",
      favicon: "",
      footerText: "© 2026 Admin BPJS Kesehatan • Keamanan Otentikasi Klinik Berlapis • Enkripsi Sesi Medis Aktif"
    }
  };

  const getLocalData = () => {
    const dataStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (dataStr) {
      try {
        return JSON.parse(dataStr);
      } catch (e) {
        // Ignore JSON error
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localSeedData));
    return localSeedData;
  };

  const saveLocalData = (data: any) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  };

  const syncToLocalStorage = (updateFn: (db: any) => any) => {
    const data = getLocalData();
    updateFn(data);
    saveLocalData(data);
  };

  // App Loading & Readiness states
  const [isLoading, setIsLoading] = useState(true);
  const [backendError, setBackendError] = useState('');

  // Active Participant ID (selected from simulated logins in Participant panel)
  const [activePesertaId, setActivePesertaId] = useState<string>('');

  // Fetch updated dataset
  const fetchAllData = async () => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error('Gagal menyambung ke server database Prolanis.');
      }
      const db = await response.json();
      
      // Update local React state
      setPeserta(db.peserta || []);
      setLogs(db.logs || []);
      setJadwal(db.jadwal || []);
      setNotifications(db.notifications || []);
      setVideos(db.videos || []);
      if (db.settings) {
        setAppSettings(db.settings);
      }
      
      // Set default active participant
      if (db.peserta && db.peserta.length > 0 && !activePesertaId) {
        setActivePesertaId(db.peserta[0].id);
      }
      setBackendError('');
      setIsOfflineMode(false);
    } catch (err: any) {
      console.warn("Koneksi API database utama terputus, beralih penuh ke instansi Mode Mandiri lokal. Detail:", err);
      // Seamlessly fallback
      const localDb = getLocalData();
      setPeserta(localDb.peserta || []);
      setLogs(localDb.logs || []);
      setJadwal(localDb.jadwal || []);
      setNotifications(localDb.notifications || []);
      setVideos(localDb.videos || []);
      if (localDb.settings) {
        setAppSettings(localDb.settings);
      }
      
      if (localDb.peserta && localDb.peserta.length > 0 && !activePesertaId) {
        setActivePesertaId(localDb.peserta[0].id);
      }
      setBackendError('');
      setIsOfflineMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Post updated settings to server configuration API (Admin)
  const updateSettings = async (newSettings: AppSettings) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSettings)
        });
        const result = await res.json();
        if (res.ok) {
          setAppSettings(result.settings || newSettings);
          syncToLocalStorage(db => { db.settings = result.settings || newSettings; });
          return result;
        }
      } catch (err) {
        console.warn("Replikasi setelan ke server gagal, menyimpan ke lokal saja:", err);
      }
    }

    syncToLocalStorage(db => { db.settings = newSettings; });
    setAppSettings(newSettings);
    return { settings: newSettings };
  };


  // Initial trigger
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      await fetchAllData();
      
      // Run auto H-1 schedules check reminder automatically on boot
      try {
        await fetch('/api/automations/reminders', { method: 'POST' });
        // Retrieve updated notifications resulting from the autocheck
        const response = await fetch('/api/data');
        const db = await response.json();
        setNotifications(db.notifications || []);
      } catch (err) {
        console.warn("Automation trigger warning:", err);
      }
    };
    
    initApp();
  }, []);

  // Post new manually added participant (Admin API)
  const addNewPeserta = async (newP: any) => {
    if (!newP.nama || !newP.noBpjs || !newP.umur || !newP.diagnosis) {
      throw new Error("Kolom nama, nomor BPJS, usia, dan diagnosis wajib diisi!");
    }

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/peserta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newP)
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Server error.');
      } catch (err: any) {
        if (err.message && (err.message.includes('BPJS') || err.message.includes('terdaftar') || err.message.includes('sudah'))) {
          throw err;
        }
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    // Offline registration
    const data = getLocalData();
    const duplicate = data.peserta.find((p: any) => p.noBpjs === newP.noBpjs);
    if (duplicate) {
      throw new Error("Peserta dengan nomor BPJS ini sudah terdaftar.");
    }

    const newParticipant = {
      id: `peserta-${Date.now()}`,
      nama: newP.nama,
      noBpjs: newP.noBpjs,
      umur: Number(newP.umur),
      kontak: newP.kontak || "-",
      diagnosis: newP.diagnosis,
      createdAt: new Date().toISOString()
    };

    const welcomeJadwal = {
      id: `jadwal-${Date.now()}`,
      pesertaId: newParticipant.id,
      pesertaNama: newParticipant.nama,
      tipe: "Pemeriksaan Rutin",
      tanggal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      pukul: "08:00",
      lokasi: "Poli Lansia / Prolanis Puskesmas",
      status: "Akan Datang",
      catatan: "Kontrol pemeriksaan perdana setelah pendaftaran manual oleh Admin.",
      createdAt: new Date().toISOString()
    };

    const welcomeNotification = {
      id: `notif-${Date.now()}`,
      pesertaId: newParticipant.id,
      judul: "Selamat Datang di Portal Prolanis",
      pesan: `Akun Prolanis BPJS Anda telah terbuat secara manual oleh Admin. Jadwal Pemeriksaan Rutin pertama Anda jatuh pada tanggal ${welcomeJadwal.tanggal} pukul 08:00 WIB.`,
      tanggal: new Date().toISOString().split('T')[0],
      dibaca: false,
      tipe: "success"
    };

    data.peserta.unshift(newParticipant);
    data.jadwal.unshift(welcomeJadwal);
    data.notifications.unshift(welcomeNotification);
    saveLocalData(data);

    // Refresh states
    setPeserta(data.peserta);
    setJadwal(data.jadwal);
    setNotifications(data.notifications);
    if (!activePesertaId) setActivePesertaId(newParticipant.id);

    return { message: "Peserta berhasil ditambahkan secara lokal!", peserta: newParticipant };
  };

  // Update existing participant details (Admin API)
  const updatePeserta = async (updatedP: any) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/peserta', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedP)
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Server error.');
      } catch (err: any) {
        if (err.message && (err.message.includes('BPJS') || err.message.includes('digunakan') || err.message.includes('lain'))) {
          throw err;
        }
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    const idx = data.peserta.findIndex((p: any) => p.id === updatedP.id);
    if (idx === -1) {
      throw new Error("Pasien tidak ditemukan!");
    }

    const duplicate = data.peserta.find((p: any) => p.noBpjs === updatedP.noBpjs && p.id !== updatedP.id);
    if (duplicate) {
      throw new Error("Nomor BPJS ini sudah digunakan oleh pasien lain.");
    }

    data.peserta[idx] = {
      ...data.peserta[idx],
      nama: updatedP.nama,
      noBpjs: updatedP.noBpjs,
      umur: Number(updatedP.umur),
      kontak: updatedP.kontak || "-",
      diagnosis: updatedP.diagnosis
    };

    // Sync name to schedules
    data.jadwal = data.jadwal.map((j: any) => {
      if (j.pesertaId === updatedP.id) {
        return { ...j, pesertaNama: updatedP.nama };
      }
      return j;
    });

    saveLocalData(data);

    setPeserta(data.peserta);
    setJadwal(data.jadwal);
    return { message: "Data pasien berhasil diperbarui!" };
  };

  // Post brand new scheduled control check (Admin API)
  const addNewJadwal = async (newJ: any) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/jadwal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newJ)
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Server error.');
      } catch (err: any) {
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    const p = data.peserta.find((item: any) => item.id === newJ.pesertaId);
    if (!p) {
      throw new Error("Peserta tidak ditemukan!");
    }

    const newJadwal = {
      id: `jadwal-${Date.now()}`,
      pesertaId: newJ.pesertaId,
      pesertaNama: p.nama,
      tipe: newJ.tipe,
      tanggal: newJ.tanggal,
      pukul: newJ.pukul,
      lokasi: newJ.lokasi,
      status: "Akan Datang",
      catatan: newJ.catatan || "",
      createdAt: new Date().toISOString()
    };

    const schedNotif = {
      id: `notif-${Date.now()}`,
      pesertaId: newJ.pesertaId,
      judul: `Jadwal Pengingat: Kontrol ${newJ.tipe}`,
      pesan: `Hai ${p.nama}, Anda memiliki jadwal kontrol (${newJ.tipe}) yang baru ditambahkan oleh Admin/Dokter untuk tanggal ${newJ.tanggal} pukul ${newJ.pukul} di ${newJ.lokasi}. Catatan dokter: ${newJ.catatan || "-"}`,
      tanggal: new Date().toISOString().split('T')[0],
      dibaca: false,
      tipe: "info"
    };

    data.jadwal.unshift(newJadwal);
    data.notifications.unshift(schedNotif);
    saveLocalData(data);

    // Sync to local component state arrays
    setJadwal(data.jadwal);
    setNotifications(data.notifications);

    return { message: "Jadwal kontrol dan pengingat otomatis sukses ditambahkan!", jadwal: newJadwal };
  };

  // Post user self check log (Participant API)
  const addNewLog = async (newLogData: any) => {
    const assessGulaDarah = (gula: number) => {
      if (gula < 80) return 'Rendah';
      if (gula > 140) return 'Tinggi';
      return 'Normal';
    };

    const assessTekananDarah = (sistolik: number, diastolik: number) => {
      if (sistolik >= 140 || diastolik >= 90) return 'Hipertensi';
      if ((sistolik >= 120 && sistolik < 140) || (diastolik >= 80 && diastolik < 90)) return 'Prehipertensi';
      return 'Normal';
    };

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLogData)
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Gagal menyimpan log.');
      } catch (err: any) {
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    const subGula = assessGulaDarah(Number(newLogData.gulaDarah));
    const subTekanan = assessTekananDarah(Number(newLogData.sistolik), Number(newLogData.diastolik));

    const newLog = {
      id: `log-${Date.now()}`,
      pesertaId: newLogData.pesertaId,
      tanggal: newLogData.tanggal,
      gulaDarah: Number(newLogData.gulaDarah),
      sistolik: Number(newLogData.sistolik),
      diastolik: Number(newLogData.diastolik),
      catatan: newLogData.catatan || "",
      statusGulaDarah: subGula,
      statusTekananDarah: subTekanan,
      isMandiri: !!newLogData.isMandiri,
      createdAt: new Date().toISOString()
    };

    data.logs.unshift(newLog);

    if (subGula === 'Tinggi' || subTekanan === 'Hipertensi') {
      const warningNotif = {
        id: `notif-${Date.now()}`,
        pesertaId: newLogData.pesertaId,
        judul: "Peringatan Hasil Pemeriksaan",
        pesan: `Hasil pencatatan Anda pada ${newLogData.tanggal} menunjukan angka ${subGula === 'Tinggi' ? 'Gula Darah Tinggi (' + newLogData.gulaDarah + ' mg/dL)' : ''}${subGula === 'Tinggi' && subTekanan === 'Hipertensi' ? ' dan ' : ''}${subTekanan === 'Hipertensi' ? 'Hipertensi (' + newLogData.sistolik + '/' + newLogData.diastolik + ' mmHg)' : ''}. Mohon kurangi konsumsi pemicu dan pastikan meminum obat rutin Anda.`,
        tanggal: new Date().toISOString().split('T')[0],
        dibaca: false,
        tipe: "alert"
      };
      data.notifications.unshift(warningNotif);
    }

    saveLocalData(data);
    setLogs(data.logs);
    setNotifications(data.notifications);

    return { message: "Catatan kesehatan harian berhasil diunggah!", log: newLog };
  };

  // Update existing health check log (Admin/Participant API)
  const updateLog = async (updatedLogData: any) => {
    const assessGulaDarah = (gula: number) => {
      if (gula < 80) return 'Rendah';
      if (gula > 140) return 'Tinggi';
      return 'Normal';
    };

    const assessTekananDarah = (sistolik: number, diastolik: number) => {
      if (sistolik >= 140 || diastolik >= 90) return 'Hipertensi';
      if ((sistolik >= 120 && sistolik < 140) || (diastolik >= 80 && diastolik < 90)) return 'Prehipertensi';
      return 'Normal';
    };

    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/logs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLogData)
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Gagal memperbarui log.');
      } catch (err: any) {
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    const idx = data.logs.findIndex((l: any) => l.id === updatedLogData.id);
    if (idx === -1) {
      throw new Error("Catatan kesehatan tidak ditemukan!");
    }

    const subGula = assessGulaDarah(Number(updatedLogData.gulaDarah));
    const subTekanan = assessTekananDarah(Number(updatedLogData.sistolik), Number(updatedLogData.diastolik));

    data.logs[idx] = {
      ...data.logs[idx],
      tanggal: updatedLogData.tanggal,
      gulaDarah: Number(updatedLogData.gulaDarah),
      sistolik: Number(updatedLogData.sistolik),
      diastolik: Number(updatedLogData.diastolik),
      catatan: updatedLogData.catatan || "",
      statusGulaDarah: subGula,
      statusTekananDarah: subTekanan
    };

    saveLocalData(data);
    setLogs(data.logs);

    return { message: "Catatan pemeriksaan berhasil diperbarui!", log: data.logs[idx] };
  };

  // Delete existing health check log (Admin/Participant API)
  const deleteLog = async (id: string) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch(`/api/logs/${id}`, {
          method: 'DELETE'
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Gagal menghapus log.');
      } catch (err: any) {
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    data.logs = data.logs.filter((l: any) => l.id !== id);
    saveLocalData(data);
    setLogs(data.logs);

    return { message: "Catatan kesehatan berhasil dihapus!" };
  };

  // Add educational video (Admin API)
  const addNewVideo = async (judul: string, url: string, deskripsi: string) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ judul, url, deskripsi })
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Gagal menambahkan video edukasi.');
      } catch (err: any) {
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    const newVideo = {
      id: `video-${Date.now()}`,
      judul,
      url,
      deskripsi: deskripsi || "",
      createdAt: new Date().toISOString()
    };
    data.videos.unshift(newVideo);
    saveLocalData(data);
    setVideos(data.videos);

    return { message: "Video edukasi berhasil ditambahkan!", video: newVideo };
  };

  // Delete educational video (Admin API)
  const deleteVideo = async (id: string) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch(`/api/videos/${id}`, {
          method: 'DELETE'
        });
        const result = await res.json();
        if (res.ok) {
          await fetchAllData();
          return result;
        }
        throw new Error(result.error || 'Gagal menghapus video edukasi.');
      } catch (err: any) {
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    data.videos = data.videos.filter((v: any) => v.id !== id);
    saveLocalData(data);
    setVideos(data.videos);

    return { message: "Video edukasi berhasil dihapus!" };
  };

  // Update schedule status (Admin/Doctor action)
  const updateJadwalStatus = async (id: string, status: string) => {
    if (!isOfflineMode) {
      try {
        const res = await fetch('/api/jadwal/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status })
        });
        if (res.ok) {
          await fetchAllData();
          return;
        }
      } catch (err) {
        console.warn("Gagal menghubungi server, menggunakan penyimpanan lokal:", err);
      }
    }

    const data = getLocalData();
    data.jadwal = data.jadwal.map((j: any) => j.id === id ? { ...j, status } : j);
    saveLocalData(data);
    setJadwal(data.jadwal);
  };

  // Mark specific notification as read (Participant action)
  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, dibaca: true } : n));
    
    if (!isOfflineMode) {
      try {
        await fetch('/api/notifications/dibaca', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        return;
      } catch (err) {
        console.warn("Gagal menghubungi server, menyinkronkan status notifikasi dibaca secara lokal saja:", err);
      }
    }

    const data = getLocalData();
    data.notifications = data.notifications.map((n: any) => n.id === id ? { ...n, dibaca: true } : n);
    saveLocalData(data);
  };

  // Explicitly run automations via admin action
  const triggerAutomations = async () => {
    if (!isOfflineMode) {
      try {
        await fetch('/api/automations/reminders', { method: 'POST' });
        await fetchAllData();
        return;
      } catch (err) {
        console.warn("Gagal menghubungkan automasi ke server:", err);
      }
    }

    const data = getLocalData();
    const todayStr = new Date().toISOString().split('T')[0];
    let createdCount = 0;

    for (const j of data.jadwal) {
      if (j.status === 'Akan Datang') {
        const eventDate = new Date(j.tanggal);
        const todayDate = new Date(todayStr);
        const differenceInTime = eventDate.getTime() - todayDate.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        if (differenceInDays === 1) {
          const duplicateCheck = data.notifications.find((n: any) => 
            n.pesertaId === j.pesertaId && 
            n.judul.includes("H-1") && 
            n.pesan.includes(j.tanggal)
          );

          if (!duplicateCheck) {
            const warningNotif = {
              id: `notif-${Date.now()}-${j.id}`,
              pesertaId: j.pesertaId,
              judul: `H-1 Pengingat Kontrol ${j.tipe}`,
              pesan: `Mengingatkan kembali bahwa besok Anda memiliki jadwal (${j.tipe}) di ${j.lokasi} pukul ${j.pukul}. Mohon hadir tepat waktu dengan membawa berkas kontrol BPJS.`,
              tanggal: todayStr,
              dibaca: false,
              tipe: "warning"
            };
            data.notifications.unshift(warningNotif);
            createdCount++;
          }
        }
      }
    }

    if (createdCount > 0) {
      saveLocalData(data);
      setNotifications(data.notifications);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md flex flex-col items-center max-w-sm space-y-4">
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-600 animate-pulse">
            <HeartHandshake className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-base">Portal Prolanis BPJS</h3>
            <p className="text-xs text-gray-400">Menyinkronkan data rekam medis gula & tekanan darah...</p>
          </div>
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (currentRole === 'admin' && !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-980 to-[#070b12] flex flex-col justify-between font-sans selection:bg-teal-500 selection:text-white antialiased relative overflow-hidden">
        
        {/* Ambient background decoration grid lines representing clinical telemetry */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#112240_1px,transparent_1px),linear-gradient(to_bottom,#112240_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        {/* Floating Glowing Neon Spheres */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[10s]" />
        <div className="absolute top-1/3 -right-60 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse duration-[14s]" />

        {/* Isolated Secure Gateway Header */}
        <header className="relative z-10 bg-slate-950/40 backdrop-blur-md border-b border-white/5 py-4 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {appSettings?.logo ? (
                appSettings.logo.startsWith("data:image") ? (
                  <img src={appSettings.logo} alt="Custom Logo" className="h-10 w-auto object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="p-1 px-2 bg-teal-500/10 border border-teal-500/20 rounded-md">
                      <span className="text-xs font-black text-teal-400">{appSettings.logo}</span>
                    </div>
                  </div>
                )
              ) : (
                <>
                  <div className="p-1.5 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                    <HeartHandshake className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-widest uppercase text-white block font-sans">PROLANIS BPJS</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase leading-none block font-sans">Admin Panel Otentikasi</span>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setCurrentRole('peserta')}
              className="text-[11px] text-slate-300 hover:text-white font-bold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-teal-500/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm font-sans"
            >
              ← Portal Pasien
            </button>
          </div>
        </header>

        {/* Secure Login Body */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4">
          <AdminLogin 
            onLoginSuccess={() => setIsAdminLoggedIn(true)} 
            onCancel={() => setCurrentRole('peserta')}
          />
        </main>

        {/* Dedicated Footer */}
        <footer className="relative z-10 py-5 text-center text-[10px] text-gray-400 border-t border-white/5 bg-slate-950/30 backdrop-blur-sm font-sans">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {appSettings?.logoFooter && (
              <img src={appSettings.logoFooter} alt="Logo Footer" className="h-6 w-auto object-contain shrink-0" referrerPolicy="no-referrer" />
            )}
            <span>{appSettings?.footerText || "© 2026 Admin BPJS Kesehatan • Keamanan Otentikasi Klinik Berlapis • Enkripsi Sesi Medis Aktif"}</span>
          </div>
        </footer>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] bg-[radial-gradient(ellipse_at_top,_rgba(20,184,166,0.03)_0%,_rgba(250,251,252,1)_80%)] antialiased text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white pb-6">
      
      {/* Top Professional Header */}
      <header className="bg-slate-950/95 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {appSettings?.logo ? (
              appSettings.logo.startsWith("data:image") ? (
                <img src={appSettings.logo} alt="Custom Logo" className="h-12 w-auto object-contain" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                    <HeartHandshake className="w-5 h-5 text-teal-400" />
                  </div>
                  <span className="text-xl font-black text-white tracking-widest">{appSettings.logo}</span>
                </div>
              )
            ) : (
              <>
                <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                  <HeartHandshake className="w-6 h-6 text-teal-400 animate-pulse-slow" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                    <span className="font-display font-black text-white tracking-widest text-lg">PROLANIS</span>
                    <span className="bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">BPJS</span>
                    {isOfflineMode && (
                      <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-sm">Mode Mandiri (Lokal)</span>
                    )}
                  </h1>
                  <p className="text-[10px] text-teal-300 font-bold leading-none tracking-wider mt-0.5">SISTEM INTEGRASI KESEHATAN PREVENTIF LANSIA</p>
                </div>
              </>
            )}
          </div>

          {/* Role Changer Navigation Tabs */}
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900/60 p-1 rounded-2xl border border-slate-800/80 flex-wrap">
              <button
                onClick={() => setCurrentRole('peserta')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                  currentRole === 'peserta'
                    ? 'bg-gradient-to-tr from-teal-605 to-teal-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                Pasien
              </button>
              <button
                onClick={() => setCurrentRole('admin')}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer ${
                  currentRole === 'admin'
                    ? 'bg-gradient-to-tr from-teal-605 to-teal-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-teal-400" />
                Panel(Admin)
              </button>
            </div>

            {currentRole === 'admin' && isAdminLoggedIn && (
              <button
                onClick={() => {
                  setIsAdminLoggedIn(false);
                  setCurrentRole('peserta');
                }}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}

            {currentRole === 'peserta' && isPesertaLoggedIn && (
              <button
                onClick={() => {
                  setIsPesertaLoggedIn(false);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-teal-300" />
                <span>Keluar Sesi</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {backendError && (
          <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-100 flex items-start gap-3 shadow-sm shadow-red-50/5 mb-2 animate-fadeIn">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-500" />
            <div>
              <h4 className="font-extrabold text-red-800">Gangguan Koneksi Backend</h4>
              <p className="mt-0.5">{backendError}</p>
            </div>
          </div>
        )}

        {/* Workspaces router depending on role selection */}
        {currentRole === 'admin' ? (
          <AdminPanel
            peserta={peserta}
            logs={logs}
            jadwal={jadwal}
            settings={appSettings}
            videos={videos}
            onUpdateSettings={updateSettings}
            onAddPeserta={addNewPeserta}
            onUpdatePeserta={updatePeserta}
            onAddJadwal={addNewJadwal}
            onTriggerAutomations={triggerAutomations}
            onUpdateJadwalStatus={updateJadwalStatus}
            onAddLog={addNewLog}
            onUpdateLog={updateLog}
            onAddVideo={addNewVideo}
            onDeleteVideo={deleteVideo}
          />

        ) : (
          !isPesertaLoggedIn ? (
            <ParticipantLogin
              pesertaList={peserta}
              onLoginSuccess={(pesertaId) => {
                setActivePesertaId(pesertaId);
                setIsPesertaLoggedIn(true);
              }}
            />
          ) : (
            <ParticipantDashboard
              peserta={peserta}
              logs={logs}
              jadwal={jadwal}
              notifications={notifications}
              videos={videos}
              activePesertaId={activePesertaId}
              onSetActivePesertaId={setActivePesertaId}
              onAddLog={addNewLog}
              onUpdateLog={updateLog}
              onDeleteLog={deleteLog}
              onMarkNotificationRead={markNotificationRead}
            />
          )
        )}
      </main>

      {/* Footer Design */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {appSettings?.logoFooter && (
              <img src={appSettings.logoFooter} alt="Logo Footer" className="h-7 w-auto object-contain shrink-0" referrerPolicy="no-referrer" />
            )}
            <p>{appSettings?.footerText || "© 2026 Prolanis BPJS. Dikembangkan untuk Monitoring Preventif Penyakit Kronis Indonesia."}</p>
          </div>
          <div className="flex gap-4 shrink-0">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Pusat Data BPJS Aktif
            </span>
            <span className="text-gray-300">|</span>
            <span>Kesehatan Lansia Optimal</span>
          </div>
        </div>
      </footer>


    </div>
  );
}

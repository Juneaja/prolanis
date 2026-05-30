import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, limit, orderBy } from 'firebase/firestore';
import { Peserta, HealthLog, JadwalKontrol, Notification, MonthlyReport, AppSettings } from './src/types.js';

// Configuration
const PORT = 3000;

// Initialize Firebase
const firebaseConfig = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf-8')
);
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// Initialize Gemini Client

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Initial Mock Seed Data
const initialPeserta: Peserta[] = [
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
];

const initialLogs: HealthLog[] = [
  // Pak Budi Logs (Diab + Hiper) - April
  { id: "log-b1", pesertaId: "peserta-budi", tanggal: "2026-04-05", gulaDarah: 145, sistolik: 135, diastolik: 85, catatan: "Setelah makan kolak", statusGulaDarah: "Normal", statusTekananDarah: "Prehipertensi", createdAt: "2026-04-05T08:00:00.000Z" },
  { id: "log-b2", pesertaId: "peserta-budi", tanggal: "2026-04-12", gulaDarah: 168, sistolik: 142, diastolik: 90, catatan: "Tubuh agak lemas setelah sahur", statusGulaDarah: "Tinggi", statusTekananDarah: "Hipertensi", createdAt: "2026-04-12T08:00:00.000Z" },
  { id: "log-b3", pesertaId: "peserta-budi", tanggal: "2026-04-19", gulaDarah: 130, sistolik: 130, diastolik: 80, catatan: "Rutin minum Metformin", statusGulaDarah: "Normal", statusTekananDarah: "Normal", createdAt: "2026-04-19T08:00:00.000Z" },
  { id: "log-b4", pesertaId: "peserta-budi", tanggal: "2026-04-26", gulaDarah: 155, sistolik: 145, diastolik: 92, catatan: "Berat kram kaki di malam hari", statusGulaDarah: "Tinggi", statusTekananDarah: "Hipertensi", createdAt: "2026-04-26T08:00:00.000Z" },
  // Pak Budi Logs - Mei
  { id: "log-b5", pesertaId: "peserta-budi", tanggal: "2026-05-03", gulaDarah: 140, sistolik: 135, diastolik: 85, catatan: "Mengikuti senam sehat", statusGulaDarah: "Normal", statusTekananDarah: "Prehipertensi", createdAt: "2026-05-03T08:00:00.000Z" },
  { id: "log-b6", pesertaId: "peserta-budi", tanggal: "2026-05-10", gulaDarah: 125, sistolik: 128, diastolik: 82, catatan: "Pola makan dijaga ketat", statusGulaDarah: "Normal", statusTekananDarah: "Normal", createdAt: "2026-05-10T08:00:00.000Z" },
  { id: "log-b7", pesertaId: "peserta-budi", tanggal: "2026-05-17", gulaDarah: 132, sistolik: 132, diastolik: 84, catatan: "Kontrol bulanan", statusGulaDarah: "Normal", statusTekananDarah: "Prehipertensi", createdAt: "2026-05-17T08:00:00.000Z" },
  { id: "log-b8", pesertaId: "peserta-budi", tanggal: "2026-05-24", gulaDarah: 150, sistolik: 140, diastolik: 88, catatan: "Sempat telat minum obat tensi", statusGulaDarah: "Normal", statusTekananDarah: "Hipertensi", createdAt: "2026-05-24T08:00:00.000Z" },

  // Ibu Siti Logs (Diabetes) - Mei
  { id: "log-s1", pesertaId: "peserta-siti", tanggal: "2026-05-01", gulaDarah: 210, sistolik: 120, diastolik: 80, catatan: "Kebanyakan makan karbohidrat", statusGulaDarah: "Tinggi", statusTekananDarah: "Normal", createdAt: "2026-05-01T09:00:00.000Z" },
  { id: "log-s2", pesertaId: "peserta-siti", tanggal: "2026-05-08", gulaDarah: 185, sistolik: 115, diastolik: 78, catatan: "Porsi nasi mulai dikurangi", statusGulaDarah: "Tinggi", statusTekananDarah: "Normal", createdAt: "2026-05-08T09:00:00.000Z" },
  { id: "log-s3", pesertaId: "peserta-siti", tanggal: "2026-05-15", gulaDarah: 140, sistolik: 118, diastolik: 79, catatan: "Gula darah sebelum makan terkontrol", statusGulaDarah: "Normal", statusTekananDarah: "Normal", createdAt: "2026-05-15T09:00:00.000Z" },
  { id: "log-s4", pesertaId: "peserta-siti", tanggal: "2026-05-22", gulaDarah: 135, sistolik: 122, diastolik: 81, catatan: "Rutin minum glibenklamid", statusGulaDarah: "Normal", statusTekananDarah: "Normal", createdAt: "2026-05-22T09:00:00.000Z" },
  { id: "log-s5", pesertaId: "peserta-siti", tanggal: "2026-05-29", gulaDarah: 128, sistolik: 118, diastolik: 80, catatan: "Rasa haus berlebihan berkurang", statusGulaDarah: "Normal", statusTekananDarah: "Normal", createdAt: "2026-05-29T09:00:00.000Z" },

  // Pak Joko Logs (Hipertensi) - Mei
  { id: "log-j1", pesertaId: "peserta-joko", tanggal: "2026-05-05", gulaDarah: 100, sistolik: 165, diastolik: 102, catatan: "Tengkuk terasa tegang dan pusing", statusGulaDarah: "Normal", statusTekananDarah: "Hipertensi", createdAt: "2026-05-05T10:00:00.000Z" },
  { id: "log-j2", pesertaId: "peserta-joko", tanggal: "2026-05-12", gulaDarah: 105, sistolik: 155, diastolik: 95, catatan: "Kurang tidur karena batuk", statusGulaDarah: "Normal", statusTekananDarah: "Hipertensi", createdAt: "2026-05-12T10:00:00.000Z" },
  { id: "log-j3", pesertaId: "peserta-joko", tanggal: "2026-05-19", gulaDarah: 98, sistolik: 145, diastolik: 90, catatan: "Rutin Amlodipin 10mg pagi", statusGulaDarah: "Normal", statusTekananDarah: "Hipertensi", createdAt: "2026-05-19T10:00:00.000Z" },
  { id: "log-j4", pesertaId: "peserta-joko", tanggal: "2026-05-26", gulaDarah: 102, sistolik: 138, diastolik: 86, catatan: "Mulai rutin jalan kaki 30 menit", statusGulaDarah: "Normal", statusTekananDarah: "Prehipertensi", createdAt: "2026-05-26T10:00:00.000Z" }
];

const initialJadwal: JadwalKontrol[] = [
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
  },
  {
    id: "jadwal-2",
    pesertaId: "peserta-siti",
    pesertaNama: "Ibu Siti Rahma",
    tipe: "Senam Prolanis",
    tanggal: "2026-06-05",
    pukul: "07:00",
    lokasi: "Halaman Puskesmas",
    status: "Akan Datang",
    catatan: "Gunakan pakaian olahraga lengkap, bawa botol minum.",
    createdAt: "2026-05-28T09:05:00.000Z"
  },
  {
    id: "jadwal-3",
    pesertaId: "peserta-joko",
    pesertaNama: "Pak Joko Widodo",
    tipe: "Pengambilan Obat",
    tanggal: "2026-06-01",
    pukul: "10:00",
    lokasi: "Apotek Kimia Farma Prolanis",
    status: "Akan Datang",
    catatan: "Bawa kartu BPJS asli untuk verifikasi obat rutin.",
    createdAt: "2026-05-28T09:10:00.000Z"
  },
  {
    id: "jadwal-h1",
    pesertaId: "peserta-budi",
    pesertaNama: "Pak Budi Santoso",
    tipe: "Edukasi Kelompok",
    tanggal: "2026-05-15",
    pukul: "09:00",
    lokasi: "Aula Puskesmas",
    status: "Selesai",
    catatan: "Materi edukasi mengenai gaya hidup sehat penderita DM dan HT.",
    createdAt: "2026-05-10T08:00:00.000Z"
  }
];

const initialNotifications: Notification[] = [
  {
    id: "notif-1",
    pesertaId: "peserta-budi",
    judul: "Jadwal Kontrol Mendatang",
    pesan: "Mengingatkan kontrol rutin Pemeriksaan Rutin yang akan dijadwalkan pada 2026-06-03 pukul 08:30 di Puskesmas Kebon Jeruk.",
    tanggal: "2026-05-29",
    dibaca: false,
    tipe: "info"
  },
  {
    id: "notif-2",
    pesertaId: "peserta-siti",
    judul: "Senam Prolanis Bersama",
    pesan: "Ayo ikut Senam Prolanis pada Jumat, 2026-06-05 jam 07:00 di Halaman Puskesmas. Sehat bersama anggota lainnya!",
    tanggal: "2026-05-29",
    dibaca: false,
    tipe: "success"
  },
  {
    id: "notif-3",
    pesertaId: "peserta-joko",
    judul: "Pengambilan Obat Rutin",
    pesan: "Jadwal pengambilan obat hipertensi Anda pada 2026-06-01 pukul 10:00 di Apotek Kimia Farma Prolanis.",
    tanggal: "2026-05-29",
    dibaca: false,
    tipe: "warning"
  }
];

// Helper to load/save database
async function loadDb() {
  try {
    // 1. Settings
    let settings = {
      logo: "",
      logoFooter: "",
      favicon: "",
      footerText: "© 2026 Admin BPJS Kesehatan • Keamanan Otentikasi Klinik Berlapis • Enkripsi Sesi Medis Aktif"
    };
    const settingsDoc = await getDoc(doc(db, "settings", "app-settings"));
    if (settingsDoc.exists()) {
      settings = { ...settings, ...settingsDoc.data() };
    } else {
      await setDoc(doc(db, "settings", "app-settings"), settings);
    }

    // 2. Peserta
    const pesertaSnap = await getDocs(collection(db, "peserta"));
    let pesertaList: any[] = [];
    pesertaSnap.forEach(d => pesertaList.push(d.data()));

    // 3. HealthLogs
    const logsSnap = await getDocs(collection(db, "logs"));
    let logsList: any[] = [];
    logsSnap.forEach(d => logsList.push(d.data()));

    // 4. Jadwal
    const jadwalSnap = await getDocs(collection(db, "jadwal"));
    let jadwalList: any[] = [];
    jadwalSnap.forEach(d => jadwalList.push(d.data()));

    // 5. Notifications
    const notificationSnap = await getDocs(collection(db, "notifications"));
    let notificationList: any[] = [];
    notificationSnap.forEach(d => notificationList.push(d.data()));

    // 6. Videos
    const videosSnap = await getDocs(collection(db, "videos"));
    let videosList: any[] = [];
    videosSnap.forEach(d => videosList.push(d.data()));

    // Seeding if collections empty
    if (pesertaList.length === 0) {
      console.log("Seeding Firestore database collections with initial mock data...");
      for (const p of initialPeserta) {
        await setDoc(doc(db, "peserta", p.id), p);
        pesertaList.push(p);
      }
      for (const l of initialLogs) {
        await setDoc(doc(db, "logs", l.id), l);
        logsList.push(l);
      }
      for (const j of initialJadwal) {
        await setDoc(doc(db, "jadwal", j.id), j);
        jadwalList.push(j);
      }
      for (const n of initialNotifications) {
        await setDoc(doc(db, "notifications", n.id), n);
        notificationList.push(n);
      }
    }

    if (videosList.length === 0) {
      const initialVideos = [
        {
          id: "video-1",
          judul: "Mengenal Prolanis BPJS Kesehatan",
          url: "https://www.youtube.com/watch?v=RInYsc-G7zU",
          deskripsi: "Edukasi mengenai apa itu Program Pengelolaan Penyakit Kronis (PROLANIS) dan manfaatnya bagi kesehatan lansia.",
          createdAt: new Date().toISOString()
        },
        {
          id: "video-2",
          judul: "Tips Pola Hidup Sehat untuk Penderita Diabetes & Hipertensi",
          url: "https://www.youtube.com/watch?v=gTHeS6uVl7I",
          deskripsi: "Panduan pola makan dan aktivitas fisik yang aman dan sehat bagi penderita penyakit kronis.",
          createdAt: new Date().toISOString()
        }
      ];
      for (const v of initialVideos) {
        await setDoc(doc(db, "videos", v.id), v);
        videosList.push(v);
      }
    }

    // Sort to match original UI order
    pesertaList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    logsList.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    jadwalList.sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
    notificationList.sort((a, b) => b.id.localeCompare(a.id));
    videosList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      peserta: pesertaList,
      logs: logsList,
      jadwal: jadwalList,
      notifications: notificationList,
      videos: videosList,
      settings
    };
  } catch (error) {
    console.error("Error loading Firestore database:", error);
    return {
      peserta: initialPeserta,
      logs: initialLogs,
      jadwal: initialJadwal,
      notifications: initialNotifications,
      videos: [],
      settings: {
        logo: "",
        logoFooter: "",
        favicon: "",
        footerText: "© 2026 Admin BPJS Kesehatan • Keamanan Otentikasi Klinik Berlapis • Enkripsi Sesi Medis Aktif"
      }
    };
  }
}

async function writeFirestoreDoc(collectionName: string, id: string, docData: any) {
  try {
    await setDoc(doc(db, collectionName, id), docData);
  } catch (err) {
    console.error(`Error writing to ${collectionName}/${id}:`, err);
  }
}


// Utility health assessment logic
function assessGulaDarah(gula: number): 'Normal' | 'Rendah' | 'Tinggi' {
  if (gula < 80) return 'Rendah';
  if (gula > 140) return 'Tinggi'; // simplified post-prandial threshold
  return 'Normal';
}

function assessTekananDarah(sistolik: number, diastolik: number): 'Normal' | 'Prehipertensi' | 'Hipertensi' {
  if (sistolik >= 140 || diastolik >= 90) return 'Hipertensi';
  if ((sistolik >= 120 && sistolik < 140) || (diastolik >= 80 && diastolik < 90)) return 'Prehipertensi';
  return 'Normal';
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Routes - Get all baseline data
  app.get('/api/data', async (req, res) => {
    const data = await loadDb();
    res.json(data);
  });

  // API Routes - Create Manual Participant (Admin)
  app.post('/api/peserta', async (req, res) => {
    const { nama, noBpjs, umur, kontak, diagnosis } = req.body;
    if (!nama || !noBpjs || !umur || !diagnosis) {
      return res.status(400).json({ error: "Kolom nama, BPJS, usia, dan diagnosis wajib diisi!" });
    }

    const data = await loadDb();
    
    // Check duplication
    const duplicate = data.peserta.find((p: Peserta) => p.noBpjs === noBpjs);
    if (duplicate) {
      return res.status(400).json({ error: "Peserta dengan nomor BPJS ini sudah terdaftar." });
    }

    const newParticipant: Peserta = {
      id: `peserta-${Date.now()}`,
      nama,
      noBpjs,
      umur: Number(umur),
      kontak: kontak || "-",
      diagnosis,
      createdAt: new Date().toISOString()
    };

    await writeFirestoreDoc("peserta", newParticipant.id, newParticipant);

    // Create automatic welcome schedule & notification
    const welcomeJadwal: JadwalKontrol = {
      id: `jadwal-${Date.now()}`,
      pesertaId: newParticipant.id,
      pesertaNama: newParticipant.nama,
      tipe: "Pemeriksaan Rutin",
      tanggal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days later
      pukul: "08:00",
      lokasi: "Poli Lansia / Prolanis Puskesmas",
      status: "Akan Datang",
      catatan: "Kontrol pemeriksaan perdana setelah pendaftaran manual oleh Admin.",
      createdAt: new Date().toISOString()
    };

    await writeFirestoreDoc("jadwal", welcomeJadwal.id, welcomeJadwal);

    // Create greeting notifications
    const welcomeNotification: Notification = {
      id: `notif-${Date.now()}`,
      pesertaId: newParticipant.id,
      judul: "Selamat Datang di Portal Prolanis",
      pesan: `Akun Prolanis BPJS Anda telah terbuat secara manual oleh Admin. Jadwal Pemeriksaan Rutin pertama Anda jatuh pada tanggal ${welcomeJadwal.tanggal} pukul 08:00 WIB.`,
      tanggal: new Date().toISOString().split('T')[0],
      dibaca: false,
      tipe: "success"
    };

    await writeFirestoreDoc("notifications", welcomeNotification.id, welcomeNotification);

    res.json({ message: "Peserta berhasil ditambahkan secara manual oleh admin!", peserta: newParticipant });
  });

  // API Routes - Update Participant (Admin)
  app.put('/api/peserta', async (req, res) => {
    const { id, nama, noBpjs, umur, kontak, diagnosis } = req.body;
    if (!id || !nama || !noBpjs || !umur || !diagnosis) {
      return res.status(400).json({ error: "Kolom ID, nama, BPJS, usia, dan diagnosis wajib diisi!" });
    }

    const data = await loadDb();
    
    // Find the participant
    const idx = data.peserta.findIndex((p: Peserta) => p.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Pasien tidak ditemukan!" });
    }

    // Check duplicate BPJS on other participants
    const duplicate = data.peserta.find((p: Peserta) => p.noBpjs === noBpjs && p.id !== id);
    if (duplicate) {
      return res.status(400).json({ error: "Nomor BPJS ini sudah digunakan oleh pasien lain." });
    }

    const updatedPeserta: Peserta = {
      ...data.peserta[idx],
      nama,
      noBpjs,
      umur: Number(umur),
      kontak: kontak || "-",
      diagnosis
    };

    await writeFirestoreDoc("peserta", updatedPeserta.id, updatedPeserta);

    // Update their name inside data.jadwal list for consistency
    for (const j of data.jadwal) {
      if (j.pesertaId === id) {
        j.pesertaNama = nama;
        await writeFirestoreDoc("jadwal", j.id, j);
      }
    }

    res.json({ message: "Data pasien berhasil diperbarui!", peserta: updatedPeserta });
  });

  // API Routes - Record Blood Sugar and Pressure (Participant / Admin)
  app.post('/api/logs', async (req, res) => {
    const { pesertaId, tanggal, gulaDarah, sistolik, diastolik, catatan, isMandiri } = req.body;
    if (!pesertaId || !tanggal || !gulaDarah || !sistolik || !diastolik) {
      return res.status(400).json({ error: "Kolom peserta, tanggal, gula darah, dan tekanan darah wajib diisi!" });
    }

    const data = await loadDb();
    const subGula = assessGulaDarah(Number(gulaDarah));
    const subTekanan = assessTekananDarah(Number(sistolik), Number(diastolik));

    const newLog: HealthLog = {
      id: `log-${Date.now()}`,
      pesertaId,
      tanggal,
      gulaDarah: Number(gulaDarah),
      sistolik: Number(sistolik),
      diastolik: Number(diastolik),
      catatan: catatan || "",
      statusGulaDarah: subGula,
      statusTekananDarah: subTekanan,
      isMandiri: !!isMandiri,
      createdAt: new Date().toISOString()
    };

    await writeFirestoreDoc("logs", newLog.id, newLog);

    // Automation: check if stats are abnormally high and trigger warning notification
    if (subGula === 'Tinggi' || subTekanan === 'Hipertensi') {
      const warningNotif: Notification = {
        id: `notif-${Date.now()}`,
        pesertaId,
        judul: "Peringatan Hasil Pemeriksaan",
        pesan: `Hasil pencatatan Anda pada ${tanggal} menunjukan angka ${subGula === 'Tinggi' ? 'Gula Darah Tinggi (' + gulaDarah + ' mg/dL)' : ''}${subGula === 'Tinggi' && subTekanan === 'Hipertensi' ? ' dan ' : ''}${subTekanan === 'Hipertensi' ? 'Hipertensi (' + sistolik + '/' + diastolik + ' mmHg)' : ''}. Mohon kurangi konsumsi pemicu dan pastikan meminum obat rutin Anda.`,
        tanggal: new Date().toISOString().split('T')[0],
        dibaca: false,
        tipe: "alert"
      };
      await writeFirestoreDoc("notifications", warningNotif.id, warningNotif);
    }

    res.json({ message: "Catatan kesehatan harian berhasil diunggah!", log: newLog });
  });


  // API Routes - Update Blood Sugar and Pressure (Admin/Participant)
  app.put('/api/logs', async (req, res) => {
    const { id, gulaDarah, sistolik, diastolik, catatan, tanggal } = req.body;
    if (!id || !tanggal || !gulaDarah || !sistolik || !diastolik) {
      return res.status(400).json({ error: "Kolom ID, tanggal, gula darah, dan tekanan darah wajib diisi!" });
    }

    const data = await loadDb();
    
    // Find log
    const idx = data.logs.findIndex((l: HealthLog) => l.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Catatan kesehatan tidak ditemukan!" });
    }

    const subGula = assessGulaDarah(Number(gulaDarah));
    const subTekanan = assessTekananDarah(Number(sistolik), Number(diastolik));

    const updatedLog: HealthLog = {
      ...data.logs[idx],
      tanggal,
      gulaDarah: Number(gulaDarah),
      sistolik: Number(sistolik),
      diastolik: Number(diastolik),
      catatan: catatan || "",
      statusGulaDarah: subGula,
      statusTekananDarah: subTekanan
    };

    await writeFirestoreDoc("logs", updatedLog.id, updatedLog);

    res.json({ message: "Catatan pemeriksaan berhasil diperbarui!", log: updatedLog });
  });

  // API Routes - Delete Health Log (Admin/Participant)
  app.delete('/api/logs/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID catatan diperlukan." });
    }

    try {
      await deleteDoc(doc(db, "logs", id));
      res.json({ message: "Catatan kesehatan berhasil dihapus!" });
    } catch (err: any) {
      console.error("Delete log error:", err);
      res.status(500).json({ error: "Gagal menghapus catatan kesehatan dari Firestore." });
    }
  });

  // API Routes - Add Educational Video (Admin)
  app.post('/api/videos', async (req, res) => {
    const { judul, url, deskripsi } = req.body;
    if (!judul || !url) {
      return res.status(400).json({ error: "Judul dan URL video YouTube wajib diisi!" });
    }

    const newVideo = {
      id: `video-${Date.now()}`,
      judul,
      url,
      deskripsi: deskripsi || "",
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "videos", newVideo.id), newVideo);
      res.json({ message: "Video edukasi berhasil ditambahkan!", video: newVideo });
    } catch (err: any) {
      console.error("Add video error:", err);
      res.status(500).json({ error: "Gagal menyimpan video edukasi ke Firestore." });
    }
  });

  // API Routes - Delete Educational Video (Admin)
  app.delete('/api/videos/:id', async (req, res) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID video diperlukan." });
    }

    try {
      await deleteDoc(doc(db, "videos", id));
      res.json({ message: "Video edukasi berhasil dihapus!" });
    } catch (err: any) {
      console.error("Delete video error:", err);
      res.status(500).json({ error: "Gagal menghapus video edukasi dari Firestore." });
    }
  });

  // API Routes - Create Schedule Reminder (Admin)
  app.post('/api/jadwal', async (req, res) => {
    const { pesertaId, tipe, tanggal, pukul, lokasi, catatan } = req.body;
    if (!pesertaId || !tipe || !tanggal || !pukul || !lokasi) {
      return res.status(400).json({ error: "Seluruh kolom jadwal wajib diisi!" });
    }

    const data = await loadDb();
    const p = data.peserta.find((item: Peserta) => item.id === pesertaId);
    if (!p) {
      return res.status(404).json({ error: "Peserta tidak ditemukan!" });
    }

    const newJadwal: JadwalKontrol = {
      id: `jadwal-${Date.now()}`,
      pesertaId,
      pesertaNama: p.nama,
      tipe,
      tanggal,
      pukul,
      lokasi,
      status: "Akan Datang",
      catatan: catatan || "",
      createdAt: new Date().toISOString()
    };

    await writeFirestoreDoc("jadwal", newJadwal.id, newJadwal);

    // Automatically create a control notification reminder for the participant
    const schedNotif: Notification = {
      id: `notif-${Date.now()}`,
      pesertaId,
      judul: `Jadwal Pengingat: Kontrol ${tipe}`,
      pesan: `Hai ${p.nama}, Anda memiliki jadwal kontrol (${tipe}) yang baru ditambahkan oleh Admin/Dokter untuk tanggal ${tanggal} pukul ${pukul} di ${lokasi}. Catatan dokter: ${catatan || "-"}`,
      tanggal: new Date().toISOString().split('T')[0],
      dibaca: false,
      tipe: "info"
    };
    await writeFirestoreDoc("notifications", schedNotif.id, schedNotif);

    res.json({ message: "Jadwal kontrol dan pengingat otomatis sukses ditambahkan!", jadwal: newJadwal });
  });

  // API Routes - Trigger automated controls update & check reminder logic
  app.post('/api/automations/reminders', async (req, res) => {
    const data = await loadDb();
    const todayStr = new Date().toISOString().split('T')[0];
    let createdCount = 0;

    // Automated Scheduler: scan for near events (scheduled tomorrow) that don't have notifications yet
    for (const j of data.jadwal) {
      if (j.status === 'Akan Datang') {
        const eventDate = new Date(j.tanggal);
        const todayDate = new Date(todayStr);
        const differenceInTime = eventDate.getTime() - todayDate.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        // If event is tomorrow, send a 1-day advance warning notification automatically
        if (differenceInDays === 1) {
          const duplicateCheck = data.notifications.find((n: Notification) => 
            n.pesertaId === j.pesertaId && 
            n.judul.includes("H-1") && 
            n.pesan.includes(j.tanggal)
          );

          if (!duplicateCheck) {
            const warningNotif: Notification = {
              id: `notif-${Date.now()}-${j.id}`,
              pesertaId: j.pesertaId,
              judul: `H-1 Pengingat Kontrol ${j.tipe}`,
              pesan: `Mengingatkan kembali bahwa besok Anda memiliki jadwal (${j.tipe}) di ${j.lokasi} pukul ${j.pukul}. Mohon hadir tepat waktu dengan membawa berkas kontrol BPJS.`,
              tanggal: todayStr,
              dibaca: false,
              tipe: "warning"
            };
            await writeFirestoreDoc("notifications", warningNotif.id, warningNotif);
            createdCount++;
          }
        }
      }
    }

    res.json({ status: "ok", message: `Sistem otomatisasi memindai jadwal. ${createdCount} pengingat kontrol otomatis H-1 telah diterbitkan!` });
  });


  // API Routes - Mark notification as read
  app.post('/api/notifications/dibaca', async (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID notifikasi diperlukan." });
    }
    const data = await loadDb();
    const notif = data.notifications.find((n: Notification) => n.id === id);
    if (notif) {
      notif.dibaca = true;
      await writeFirestoreDoc("notifications", notif.id, notif);
    }
    res.json({ message: "Status notifikasi berhasil diperbarui." });
  });

  // API Routes - Update Schedule Status
  app.post('/api/jadwal/status', async (req, res) => {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "ID dan status tujuan tidak boleh kosong!" });
    }
    const data = await loadDb();
    const j = data.jadwal.find((item: JadwalKontrol) => item.id === id);
    if (!j) {
      return res.status(404).json({ error: "Jadwal tidak ditemukan!" });
    }
    j.status = status;
    await writeFirestoreDoc("jadwal", j.id, j);
    res.json({ message: "Status jadwal berhasil diubah!", jadwal: j });
  });

  // API Routes - Update global settings (Logo, Favicon, Footer, logoFooter)
  app.post('/api/settings', async (req, res) => {
    const { logo, favicon, footerText, logoFooter } = req.body;
    try {
      const currentSettings = {
        logo: logo || "",
        favicon: favicon || "",
        footerText: footerText || "",
        logoFooter: logoFooter || ""
      };
      await writeFirestoreDoc("settings", "app-settings", currentSettings);
      res.json({ message: "Konfigurasi tampilan aplikasi Puskesmas berhasil disimpan di Firebase!", settings: currentSettings });
    } catch (err: any) {
      console.error("Save settings error:", err);
      res.status(500).json({ error: "Gagal menyimpan konfigurasi ke Firestore database." });
    }
  });

  // API Routes - Generate Monthly Report (Gemini AI with medical parameters integration)
  app.post('/api/report/generate', async (req, res) => {
    const { pesertaId, bulan } = req.body; // bulan shape "2026-05"
    if (!pesertaId || !bulan) {
      return res.status(400).json({ error: "ID Peserta dan target Bulan wajib disertakan!" });
    }

    const data = await loadDb();
    const p = data.peserta.find((item: Peserta) => item.id === pesertaId);
    if (!p) {
      return res.status(404).json({ error: 'Peserta tidak terdaftar di program Prolanis.' });
    }

    // Filter logs for selected participant in that specific month
    const patientLogs = data.logs.filter((log: HealthLog) => 
      log.pesertaId === pesertaId && log.tanggal.startsWith(bulan)
    );

    if (patientLogs.length === 0) {
      return res.json({
        pesertaId,
        bulan,
        totalLogs: 0,
        rataRataGulaDarah: 0,
        rataRataSistolik: 0,
        rataRataDiastolik: 0,
        statusKesehatan: "Belum Ada Catatan",
        rekomendasi: "Tidak dapat melakukan analisis medis karena peserta tidak menginput catatan gula darah dan tekanan darah di bulan ini. Harap latih peserta agar rajin mengisi log kesehatan harian.",
        risiko: "Sedang",
        generikReport: true
      });
    }

    // Calculate statistical averages for clinicians
    const totalLogs = patientLogs.length;
    const avgGula = Math.round(patientLogs.reduce((acc: number, cur: HealthLog) => acc + cur.gulaDarah, 0) / totalLogs);
    const avgSistolik = Math.round(patientLogs.reduce((acc: number, cur: HealthLog) => acc + cur.sistolik, 0) / totalLogs);
    const avgDiastolik = Math.round(patientLogs.reduce((acc: number, cur: HealthLog) => acc + cur.diastolik, 0) / totalLogs);

    // Call Gemini AI if SDK initialized, else do Rule-Based clinical assessment fallback (guarantees offline stability)
    if (ai) {
      try {
        const systemPrompt = `Anda adalah Dokter Spesialis Penyakit Dalam pendamping program kelompok Prolanis BPJS Kesehatan. Tugas Anda menganalisis rekapitulasi data penderita penyakit kronis (Diabetes Mellitus dan Hipertensi) dan menyajikan laporan ringkas perkembangan kesehatan bulanan.`;
        
        const mainPrompt = `Analisis rekap catatan pasien berikut untuk evaluasi perkembangan penyakit selama bulan ${bulan}:
Nama Pasien: ${p.nama}
Usia: ${p.umur} tahun
Diagnosa Prolanis: ${p.diagnosis}
No BPJS: ${p.noBpjs}

Kalkulasi Statistik Bulan Ini:
- Jumlah Pencatatan: ${totalLogs} kali
- Rata-rata Gula Darah: ${avgGula} mg/dL
- Rata-rata Tekanan Darah: ${avgSistolik}/${avgDiastolik} mmHg

Log detail harian pasien:
${JSON.stringify(patientLogs.map(l => ({ tanggal: l.tanggal, gula: l.gulaDarah, tensi: `${l.sistolik}/${l.diastolik}`, catatan: l.catatan })))}

Hasilkan respons dalam format JSON murni bahasa Indonesia tanpa tambahan teks penjelasan markdown, dengan struktur persis seperti berikut:
{
  "statusKesehatan": "Evaluasi klinis perkembangan penyakit bulan ini secara ringkas (1-2 kalimat). Bandingkan rata-rata di atas dengan batas normal (Gula Darah < 140 mg/dL post-prandial, Tensi < 130/80 mmHg).",
  "rekomendasi": "Langkah edukasi & nutrisi konkret untuk pasien, porsi sahur/buka mkanan, resep kontrol obat rutin harian, anjuran mengikuti senam/edukasi kelompok Prolanis berikutnya, dan rujukan lanjut jika diperlukan.",
  "risiko": "Rendah" atau "Sedang" atau "Tinggi"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: mainPrompt,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json"
          }
        });

        const rawText = response.text || "{}";
        const parsedReport = JSON.parse(rawText.trim());

        const fullReport: MonthlyReport = {
          pesertaId,
          bulan,
          totalLogs,
          rataRataGulaDarah: avgGula,
          rataRataSistolik: avgSistolik,
          rataRataDiastolik: avgDiastolik,
          statusKesehatan: parsedReport.statusKesehatan || "Kondisi stabil, pemeriksaan rutin berkala direkomendasikan.",
          rekomendasi: parsedReport.rekomendasi || "Jaga pola makan rendah garam & rendah gula, serta rutin mengonsumsi obat medis sesuai petunjuk dokter.",
          risiko: parsedReport.risiko || "Sedang",
          generikReport: false
        };

        return res.json(fullReport);


      } catch (geminiError) {
        console.error("Gemini failed, using clinical fallback rules:", geminiError);
      }
    }

    // Clinically Valid Local Rule-Based Fallback if Gemini isn't accessible
    let statusKesehatan = "";
    let rekomendasi = "";
    let risiko: 'Rendah' | 'Sedang' | 'Tinggi' = 'Sedang';

    // Assess Gula
    const gulaKondisi = avgGula > 140 ? "Tinggi" : avgGula < 70 ? "Rendah" : "Normal";
    // Assess Tensi
    const tensiKondisi = avgSistolik >= 140 || avgDiastolik >= 90 ? "Hipertensi" : (avgSistolik >= 120 ? "Prehipertensi" : "Normal");

    if (gulaKondisi === "Tinggi" && tensiKondisi === "Hipertensi") {
      statusKesehatan = `Evaluasi menunjukkan perkembangan ganda yang kurang terkendali dengan rata-rata Gula Darah Tinggi (${avgGula} mg/dL) disertai Hipertensi (${avgSistolik}/${avgDiastolik} mmHg).`;
      rekomendasi = `Pasien harus segera melakukan kontrol langsung ke puskesmas. Rekomendasi ketat kurangi porsi nasi putih dilarang mengonsumsi makanan manis/kolak, batasi bumbu garam, dan disiplin mengonsumsi terapi kombinasi obat diabetes dan antihipertensi setiap pagi. Harap didampingi keluarga saat senam prolanis.`;
      risiko = 'Tinggi';
    } else if (gulaKondisi === "Tinggi") {
      statusKesehatan = `Hasil kumulatif menunjukkan ketidakstabilan kadar glukosa pasien dengan rata-rata Gula Darah Tinggi (${avgGula} mg/dL) sedangkan tekanan darah relatif terkendali (${avgSistolik}/${avgDiastolik} mmHg).`;
      rekomendasi = `Rekomendasi medis: Kurangi asupan gula sederhana dan beralih ke karbohidrat kompleks berserat tinggi. Evaluasi kepatuhan konsumsi obat oral anti-diabetik (Metformin/Glibenklamid). Ikuti aktivitas jalan kaki santai 30 menit per hari dan kontrol gula darah puasa bulan depan.`;
      risiko = 'Sedang';
    } else if (tensiKondisi === "Hipertensi") {
      statusKesehatan = `Menunjukkan kondisi tekanan sirkulasi darah yang tinggi dengan rata-rata tekanan darah Hipertensi (${avgSistolik}/${avgDiastolik} mmHg) namun status kadar gula darah normal (${avgGula} mg/dL).`;
      rekomendasi = `Rekomendasi diet DASH rendah natrium (maksimal 1 sendok teh garam per hari). Hindari makanan olahan kaleng, daging berlemak, dan kopi berlebihan. Pastikan kepatuhan minum obat antihipertensi (Amlodipin/Candesartan) secara terencana serta kelola tingkat stress harian Anda.`;
      risiko = 'Sedang';
    } else {
      statusKesehatan = `Secara umum nilai profil kesehatan pasien menunjukan grafik yang sangat baik. Rata-rata kadar Gula Darah Normal (${avgGula} mg/dL) dan Tekanan Darah Terkontrol di tingkat optimal (${avgSistolik}/${avgDiastolik} mmHg).`;
      rekomendasi = `Pertahankan gaya hidup aktif yang menakjubkan ini. Teruskan konsumsi porsi nutrisi seimbang, konsumsi obat pencegahan dosis pemeliharaan, serta rutin hadir di kegiatan Senam Prolanis mingguan kelompok Puskesmas Kebon Jeruk untuk menjaga vitalitas tubuh.`;
      risiko = 'Rendah';
    }

    const fallReport: MonthlyReport = {
      pesertaId,
      bulan,
      totalLogs,
      rataRataGulaDarah: avgGula,
      rataRataSistolik: avgSistolik,
      rataRataDiastolik: avgDiastolik,
      statusKesehatan,
      rekomendasi,
      risiko,
      generikReport: true
    };

    res.json(fallReport);
  });

  // Vite development vs production handling
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Prolanis Server listening on http://localhost:${PORT}`);
  });
}

startServer();

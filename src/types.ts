export interface Peserta {
  id: string; // ID / NIK / Username
  nama: string;
  noBpjs: string;
  umur: number;
  kontak: string;
  diagnosis: 'Diabetes Mellitus' | 'Hipertensi' | 'Keduanya';
  createdAt: string;
}

export interface HealthLog {
  id: string;
  pesertaId: string;
  tanggal: string; // YYYY-MM-DD
  gulaDarah: number; // mg/dL
  sistolik: number; // mmHg
  diastolik: number; // mmHg
  catatan?: string;
  isMandiri?: boolean;
  statusGulaDarah?: 'Normal' | 'Rendah' | 'Tinggi';
  statusTekananDarah?: 'Normal' | 'Prehipertensi' | 'Hipertensi';
  createdAt: string;
}

export interface JadwalKontrol {
  id: string;
  pesertaId: string;
  pesertaNama: string;
  tipe: 'Pemeriksaan Rutin' | 'Pengambilan Obat' | 'Senam Prolanis' | 'Edukasi Kelompok';
  tanggal: string; // YYYY-MM-DD
  pukul: string; // HH:MM
  lokasi: string;
  status: 'Akan Datang' | 'Selesai' | 'Batal';
  catatan?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  pesertaId: string;
  judul: string;
  pesan: string;
  tanggal: string; // YYYY-MM-DD
  dibaca: boolean;
  tipe: 'info' | 'warning' | 'alert' | 'success';
}

export interface MonthlyReport {
  pesertaId: string;
  bulan: string; // YYYY-MM
  totalLogs: number;
  rataRataGulaDarah: number;
  rataRataSistolik: number;
  rataRataDiastolik: number;
  statusKesehatan: string; // generated or ai generated
  rekomendasi: string;
  risiko: 'Rendah' | 'Sedang' | 'Tinggi';
  generikReport?: boolean;
}

export interface AppSettings {
  logo?: string;      // Base64 or Text
  favicon?: string;   // Base64
  footerText?: string; // Text
  logoFooter?: string; // Base64
}

export interface VideoEdukasi {
  id: string;
  judul: string;
  url: string;
  deskripsi?: string;
  createdAt: string;
}



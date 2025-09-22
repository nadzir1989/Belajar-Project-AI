export type AppView = 'dashboard' | 'reports';

export enum SppdStatus {
  Dibuat = 'Dibuat',
  Disetujui = 'Disetujui',
  Ditolak = 'Ditolak',
}

export interface Employee {
  id: string; // Corresponds to NO_ID
  nama: string;
  nip: string;
  pangkat_gol: string;
  jabatan: string;
  sub_unit_kerja: string;
  nomor_hp?: string;
  rekening?: string;
}

export interface Pelaksana {
  pelaksana_id: string; // Will be generated on submission, can be a temporary client-side ID
  nama: string;
  nip: string;
  pangkat_gol: string;
  jabatan: string;
}

export interface SPPD {
  sppd_id: string; // Unique ID for the travel order
  nomor_st: string;
  nomor_sppd: string;
  dasar_surat?: string; // Optional
  maksud_tugas: string;
  tempat: string;
  tgl_mulai: string;
  tgl_selesai: string;
  lama_perjalanan: number; // in days
  transportasi: string;
  jenis_sppd: string;
  rek_anggaran: string;
  tgl_input: string; // ISO string date
  status: SppdStatus;
  pelaksana: Pelaksana[]; // Array of travelers
}


export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
}
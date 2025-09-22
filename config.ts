// PENTING: Ganti nilai di bawah ini dengan URL Web App dari Google Apps Script Anda.
// Contoh: 'https://script.google.com/macros/s/ABCDEFG.../exec'
export const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzhbo0T0FOCUx_asAqEKFieg-1i5v8hn5lMTPkwYT7QSO2LGPvdn-KAX904I8BtJs0TGQ/exec';

// Opsi dinamis untuk form SPPD.
// Nilai-nilai di bawah ini digunakan sebagai cadangan (fallback) jika
// aplikasi gagal mengambil opsi dinamis dari server.
export const transportOptions = [
    'Pesawat Udara',
    'Kereta Api',
    'Bus/Travel',
    'Kendaraan Dinas',
    'Kendaraan Pribadi',
] as const;

export const sppdTypeOptions = [
    'Dalam Negeri',
    'Luar Negeri',
] as const;

export const budgetAccountOptions = [
    '524111 - Belanja Perjalanan Dinas Biasa',
    '524113 - Belanja Perjalanan Dinas Dalam Kota',
    '524219 - Belanja Perjalanan Dinas Lainnya',
] as const;
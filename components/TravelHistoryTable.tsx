import React from 'react';
import type { SPPD, SppdStatus } from '../types';
import { SppdStatus as StatusEnum } from '../types';

interface SppdTableProps {
    requests: SPPD[];
}

const statusStyles: Record<SppdStatus, { badge: string; dot: string; }> = {
    [StatusEnum.Disetujui]: { badge: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300", dot: "text-green-400" },
    [StatusEnum.Dibuat]: { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300", dot: "text-yellow-400" },
    [StatusEnum.Ditolak]: { badge: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300", dot: "text-red-400" },
};

const StatusDisplay: React.FC<{ status: SppdStatus }> = ({ status }) => (
    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[status]?.badge || ''}`}>
        <svg className={`-ml-1 mr-1.5 h-2 w-2 ${statusStyles[status]?.dot || ''}`} fill="currentColor" viewBox="0 0 8 8">
            <circle cx={4} cy={4} r={3} />
        </svg>
        {status}
    </span>
);

const SppdTable: React.FC<SppdTableProps> = ({ requests }) => {
    if (requests.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg text-center">
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">Riwayat SPPD Kosong</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Belum ada data SPPD yang dibuat. Silakan buat pengajuan baru di dashboard.</p>
            </div>
        )
    }
    
    return (
        <div className="bg-white dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Detail Riwayat SPPD</h3>
             </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">No. SPPD</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Pelaksana Utama</th>
                             <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tujuan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Tanggal</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {requests.map((request) => (
                            <tr key={request.sppd_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{request.nomor_sppd || 'N/A'}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">{request.maksud_tugas}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{request.pelaksana?.[0]?.nama || 'N/A'}</div>
                                     <div className="text-xs text-slate-500 dark:text-slate-400">{request.pelaksana.length > 1 ? `+ ${request.pelaksana.length - 1} pengikut` : 'Tanpa pengikut'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{request.tempat}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{request.tgl_mulai} s/d {request.tgl_selesai}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <StatusDisplay status={request.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SppdTable;

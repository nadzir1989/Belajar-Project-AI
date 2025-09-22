import React, { useMemo } from 'react';
import { SPPD, SppdStatus } from '../types';
import SppdTable from './TravelHistoryTable'; // Renamed component, filename kept for simplicity

interface ReportsViewProps {
  requests: SPPD[];
}

const ChartBar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
  const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex flex-col items-center flex-grow" role="figure" aria-label={`${label}: ${value} of ${maxValue}`}>
      <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 rounded-t-lg flex items-end" aria-hidden="true">
        <div
          style={{ height: `${heightPercentage}%` }}
          className={`w-full rounded-t-md ${color} transition-all duration-500 ease-out`}
          title={`${label}: ${value}`}
        ></div>
      </div>
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`} aria-hidden="true">
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const ReportsView: React.FC<ReportsViewProps> = ({ requests }) => {
  const stats = useMemo(() => {
    const disetujui = requests.filter(r => r.status === SppdStatus.Disetujui).length;
    const dibuat = requests.filter(r => r.status === SppdStatus.Dibuat).length;
    const ditolak = requests.filter(r => r.status === SppdStatus.Ditolak).length;
    const total = requests.length;
    return { disetujui, dibuat, ditolak, total };
  }, [requests]);

  const maxStatValue = Math.max(stats.disetujui, stats.dibuat, stats.ditolak, 1); // Avoid division by zero

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <section aria-labelledby="report-summary-heading">
         <h2 id="report-summary-heading" className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Ringkasan Laporan SPPD</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total SPPD" 
              value={stats.total} 
              color="bg-blue-100 dark:bg-blue-900/50"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
             <StatCard 
              title="Disetujui" 
              value={stats.disetujui}
              color="bg-green-100 dark:bg-green-900/50"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
             <StatCard 
              title="Dibuat" 
              value={stats.dibuat}
              color="bg-yellow-100 dark:bg-yellow-900/50"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
             <StatCard 
              title="Ditolak" 
              value={stats.ditolak}
              color="bg-red-100 dark:bg-red-900/50"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
         </div>
      </section>

      {/* Charts */}
       <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg" aria-labelledby="status-chart-heading">
          <h2 id="status-chart-heading" className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Grafik Status SPPD</h2>
          <div className="flex items-end space-x-4 text-center">
              <ChartBar value={stats.disetujui} maxValue={maxStatValue} color="bg-green-500" label="Disetujui" />
              <ChartBar value={stats.dibuat} maxValue={maxStatValue} color="bg-yellow-500" label="Dibuat" />
              <ChartBar value={stats.ditolak} maxValue={maxStatValue} color="bg-red-500" label="Ditolak" />
          </div>
       </section>

      {/* Travel History Table */}
      <section aria-labelledby="travel-history-heading">
        <h2 id="travel-history-heading" className="text-2xl font-bold mb-4 text-slate-900 dark:text-white sr-only">Detail Riwayat SPPD</h2>
        <SppdTable requests={requests} />
      </section>
    </div>
  );
};

export default ReportsView;

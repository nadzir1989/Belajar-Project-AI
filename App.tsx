import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ReportsView from './components/ReportsView';
import type { AppView, SPPD, CalendarEvent, Employee, SppdStatus } from './types';
import { GAS_WEB_APP_URL, transportOptions as fallbackTransport, sppdTypeOptions as fallbackSppd, budgetAccountOptions as fallbackBudget } from './config';
import { SppdStatus as StatusEnum } from './types';
import { employees as mockEmployees } from './data/employees';


const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [sppdList, setSppdList] = useState<SPPD[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [initialFormData, setInitialFormData] = useState<Partial<Omit<SPPD, 'sppd_id' | 'status'>> | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for dynamic dropdown options with fallbacks
  const [transportOptions, setTransportOptions] = useState<string[]>(() => [...fallbackTransport]);
  const [sppdTypeOptions, setSppdTypeOptions] = useState<string[]>(() => [...fallbackSppd]);
  const [budgetAccountOptions, setBudgetAccountOptions] = useState<string[]>(() => [...fallbackBudget]);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (GAS_WEB_APP_URL.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
        throw new Error('Harap masukkan URL Google Apps Script Anda di file config.ts');
      }

      // Fetch all data in parallel, including dynamic options
      const [sppdResponse, employeesResponse, transportResponse, sppdTypeResponse, budgetResponse] = await Promise.all([
        fetch(`${GAS_WEB_APP_URL}?action=getRequests`),
        fetch(`${GAS_WEB_APP_URL}?action=getEmployees`),
        fetch(`${GAS_WEB_APP_URL}?action=getTransportOptions`),
        fetch(`${GAS_WEB_APP_URL}?action=getSppdTypeOptions`),
        fetch(`${GAS_WEB_APP_URL}?action=getBudgetAccountOptions`),
      ]);

      // Handle SPPD and Employee data
      if (!sppdResponse.ok || !employeesResponse.ok) {
        throw new Error(`Gagal mengambil data inti.`);
      }
      const sppdData: any = await sppdResponse.json();
      const employeesData: any = await employeesResponse.json();
      if (!Array.isArray(sppdData) && sppdData.error) throw new Error(sppdData.error);
      if (!Array.isArray(employeesData) && employeesData.error) throw new Error(employeesData.error);
      if (!Array.isArray(sppdData) || !Array.isArray(employeesData)) throw new Error('Format data dari server tidak benar.');
      
      const mappedSppdData = sppdData.map((item: any) => ({
        ...item, status: item.status === 'Approved' ? StatusEnum.Disetujui : item.status === 'Rejected' ? StatusEnum.Ditolak : StatusEnum.Dibuat,
        sppd_id: item.id, maksud_tugas: item.purpose, tempat: item.destination, tgl_mulai: item.startDate, tgl_selesai: item.endDate,
         pelaksana: item.pelaksana || [{ pelaksana_id: 'temp-1', nama: item.employeeName, nip: 'N/A', pangkat_gol: 'N/A', jabatan: 'N/A' }]
      }));
      
      // Directly map employee data using exact headers from the Google Sheet
      const mappedEmployees = employeesData.map((emp: any) => ({
        id: emp.NO_ID || '',
        nama: emp.NAMA || '',
        nip: emp.NIP || '',
        pangkat_gol: emp.PANGKAT_GOL || '',
        jabatan: emp.JABATAN || '',
        // Use bracket notation for headers with spaces
        sub_unit_kerja: emp['SUB UNIT KERJA'] || emp.SUB_UNIT_KERJA || '',
        nomor_hp: emp.NOMOR_HP || '',
        rekening: emp.REKENING || '',
      }));

      const validEmployees = mappedEmployees.filter(emp => emp.nama && emp.nama.trim() !== '');

      setSppdList(mappedSppdData as SPPD[]);
      if (validEmployees.length > 0) {
        setEmployees(validEmployees as Employee[]);
      } else {
        console.warn("Tidak ada data pegawai valid dari server. Menggunakan data contoh.");
        setEmployees(mockEmployees);
      }
      
      // Handle dynamic options with fallback
      if (transportResponse.ok) {
          const data = await transportResponse.json();
          if (Array.isArray(data) && data.length > 0) setTransportOptions(data);
      }
      if (sppdTypeResponse.ok) {
          const data = await sppdTypeResponse.json();
          if (Array.isArray(data) && data.length > 0) setSppdTypeOptions(data);
      }
      if (budgetResponse.ok) {
          const data = await budgetResponse.json();
          if (Array.isArray(data) && data.length > 0) setBudgetAccountOptions(data);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui. Menggunakan data contoh.');
      setEmployees(mockEmployees); // Also use mock data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleNavigate = (view: AppView) => {
    setInitialFormData(undefined);
    setActiveView(view);
  };

  const handleAddSppd = useCallback(async (newSppdData: Omit<SPPD, 'sppd_id' | 'status' | 'tgl_input'>) => {
    try {
      const payload = { ...newSppdData, tgl_input: new Date().toISOString(), status: StatusEnum.Dibuat };
      const response = await fetch(GAS_WEB_APP_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addSppd', data: payload }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Gagal menyimpan data: ${response.statusText}`);
      }
      await response.json();
      await fetchData(); // Re-fetch all data to ensure consistency
      setActiveView('reports'); 
      setInitialFormData(undefined);
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Gagal mengajukan SPPD.';
       alert(errorMessage);
       console.error("Error adding SPPD:", err);
    }
  }, [fetchData]);

  const handleCreateSppdFromEvent = (event: CalendarEvent) => {
    const formData: Partial<Omit<SPPD, 'sppd_id' | 'status'>> = {
      maksud_tugas: event.title,
      tempat: event.location === 'Online via Google Meet' ? '' : event.location,
      tgl_mulai: event.startTime.toISOString().split('T')[0],
      tgl_selesai: event.endTime.toISOString().split('T')[0],
    };
    setInitialFormData(formData);
    setActiveView('dashboard');
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center p-10">Memuat data aplikasi...</div>;
    }
    if (error && employees.length === 0) { // Only show fatal error if fallback also fails
      return <div className="text-center p-10 text-red-500 bg-red-100 dark:bg-red-900/50 rounded-lg">{error}</div>;
    }
    
    if (activeView === 'dashboard') {
        return (
            <DashboardView 
                employees={employees}
                handleAddSppd={handleAddSppd}
                handleCreateSppdFromEvent={handleCreateSppdFromEvent}
                initialFormData={initialFormData}
                // Pass dynamic options to the form
                transportOptions={transportOptions}
                sppdTypeOptions={sppdTypeOptions}
                budgetAccountOptions={budgetAccountOptions}
            />
        );
    }
    
    if (activeView === 'reports') {
        return <ReportsView requests={sppdList} />;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <Header activeView={activeView} onNavigate={handleNavigate} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
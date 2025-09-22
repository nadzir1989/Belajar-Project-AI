import React, { useState, useEffect, useId } from 'react';
import type { SPPD, Employee, Pelaksana } from '../types';

interface SppdFormProps {
  employees: Employee[];
  onAddSppd: (newSppdData: Omit<SPPD, 'sppd_id' | 'status' | 'tgl_input'>) => Promise<void>;
  initialData?: Partial<Omit<SPPD, 'sppd_id' | 'status'>>;
  // Props for dynamic options
  transportOptions: string[];
  sppdTypeOptions: string[];
  budgetAccountOptions: string[];
}

const PlusIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);


const SppdForm: React.FC<SppdFormProps> = ({ 
    employees, 
    onAddSppd, 
    initialData,
    transportOptions,
    sppdTypeOptions,
    budgetAccountOptions
}) => {
    const [formData, setFormData] = useState<Omit<SPPD, 'sppd_id' | 'status' | 'tgl_input'>>({
        nomor_st: '',
        nomor_sppd: '',
        dasar_surat: '',
        maksud_tugas: '',
        tempat: '',
        tgl_mulai: '',
        tgl_selesai: '',
        lama_perjalanan: 0,
        transportasi: '',
        jenis_sppd: '',
        rek_anggaran: '',
        pelaksana: [],
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formId = useId();
    
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                ...initialData,
                pelaksana: initialData.pelaksana || [],
            }));
        }
    }, [initialData]);

    useEffect(() => {
        if (formData.tgl_mulai && formData.tgl_selesai) {
            const start = new Date(formData.tgl_mulai);
            const end = new Date(formData.tgl_selesai);
            if (end >= start) {
                const diffTime = Math.abs(end.getTime() - start.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                setFormData(prev => ({ ...prev, lama_perjalanan: diffDays }));
            } else {
                setFormData(prev => ({ ...prev, lama_perjalanan: 0 }));
            }
        }
    }, [formData.tgl_mulai, formData.tgl_selesai]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePelaksanaChange = (index: number, field: keyof Pelaksana, value: string) => {
        setFormData(prev => {
            const newPelaksana = [...prev.pelaksana];
            const updatedPelaksana = { ...newPelaksana[index], [field]: value };

            if (field === 'nama') {
                const selectedEmployee = employees.find(emp => emp.nama === value);
                if (selectedEmployee) {
                    updatedPelaksana.nip = selectedEmployee.nip;
                    updatedPelaksana.pangkat_gol = selectedEmployee.pangkat_gol;
                    updatedPelaksana.jabatan = selectedEmployee.jabatan;
                } else {
                    updatedPelaksana.nip = '';
                    updatedPelaksana.pangkat_gol = '';
                    updatedPelaksana.jabatan = '';
                }
            }
            
            newPelaksana[index] = updatedPelaksana;
            return { ...prev, pelaksana: newPelaksana };
        });
    };

    const addPelaksana = () => {
        setFormData(prev => ({
            ...prev,
            pelaksana: [...prev.pelaksana, { pelaksana_id: `temp-${Date.now()}`, nama: '', nip: '', pangkat_gol: '', jabatan: '' }]
        }));
    };

    const removePelaksana = (index: number) => {
        setFormData(prev => ({ ...prev, pelaksana: prev.pelaksana.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { pelaksana, dasar_surat, ...requiredFields } = formData;
        if (Object.values(requiredFields).some(val => !val || (Array.isArray(val) && val.length === 0))) {
            alert('Harap isi semua kolom wajib.');
            return;
        }
        if (pelaksana.length === 0 || pelaksana.some(p => !p.nama || !p.nip || !p.jabatan)) {
            alert('Harap isi semua data pelaksana.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await onAddSppd(formData);
            setFormData({
                nomor_st: '', nomor_sppd: '', dasar_surat: '', maksud_tugas: '', tempat: '',
                tgl_mulai: '', tgl_selesai: '', lama_perjalanan: 0, transportasi: '',
                jenis_sppd: '', rek_anggaran: '', pelaksana: [],
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderInput = (label: string, name: keyof SPPD, type = 'text', required = true) => (
         <div>
            <label htmlFor={`${formId}-${name}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <input type={type} id={`${formId}-${name}`} name={name} value={String(formData[name] || '')} onChange={handleChange} required={required} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
        </div>
    );
    
    const renderSelect = (label: string, name: keyof SPPD, options: readonly string[], required = true) => (
         <div>
            <label htmlFor={`${formId}-${name}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <select
              id={`${formId}-${name}`}
              name={name} value={String(formData[name] || '')}
              onChange={handleChange}
              required={required}
              style={{ colorScheme: 'light' }}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-200 dark:text-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
                 <option value="" disabled>Pilih Opsi</option>
                 {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} aria-labelledby={`${formId}-heading`} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg space-y-6">
            <h2 id={`${formId}-heading`} className="text-xl font-bold text-slate-900 dark:text-white">Formulir Pengajuan SPPD</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInput('Nomor Surat Tugas', 'nomor_st')}
                {renderInput('Nomor SPPD', 'nomor_sppd')}
            </div>
            
            {renderInput('Dasar Surat (Opsional)', 'dasar_surat', 'text', false)}
            
            <div>
                <label htmlFor={`${formId}-maksud_tugas`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">Maksud Tugas</label>
                <textarea id={`${formId}-maksud_tugas`} name="maksud_tugas" rows={3} value={formData.maksud_tugas} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
            </div>

            {renderInput('Tempat Tujuan', 'tempat')}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 {renderInput('Tanggal Berangkat', 'tgl_mulai', 'date')}
                 {renderInput('Tanggal Kembali', 'tgl_selesai', 'date')}
                 <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Lama Perjalanan</label>
                    <div className="mt-1 block w-full px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm">
                        {formData.lama_perjalanan > 0 ? `${formData.lama_perjalanan} hari` : '-'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderSelect('Transportasi', 'transportasi', transportOptions)}
                {renderSelect('Jenis SPPD', 'jenis_sppd', sppdTypeOptions)}
                {renderSelect('Rekening Anggaran', 'rek_anggaran', budgetAccountOptions)}
            </div>

            {/* Pelaksana Section */}
            <fieldset className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <legend className="text-lg font-medium text-slate-900 dark:text-white mb-2">Pelaksana & Pengikut</legend>
                <div className="space-y-4">
                    {formData.pelaksana.map((p, index) => (
                        <div key={p.pelaksana_id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                             <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Nama</label>
                                 <select
                                   value={p.nama}
                                   onChange={e => handlePelaksanaChange(index, 'nama', e.target.value)}
                                   required
                                   style={{ colorScheme: 'light' }}
                                   className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-200 dark:text-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                  >
                                    <option value="" disabled>Pilih Pegawai</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.nama}>{emp.nama}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">NIP</label>
                                <input type="text" value={p.nip} onChange={e => handlePelaksanaChange(index, 'nip', e.target.value)} required className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm" />
                            </div>
                            <div className="md:col-span-2 grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Pangkat/Gol.</label>
                                    <input type="text" value={p.pangkat_gol} onChange={e => handlePelaksanaChange(index, 'pangkat_gol', e.target.value)} required className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm" />
                                </div>
                                <div className="self-end">
                                    <button type="button" onClick={() => removePelaksana(index)} className="mt-1 w-full flex justify-center py-1.5 px-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800" aria-label={`Hapus ${p.nama || 'pelaksana'}`}>
                                       <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-5">
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Jabatan</label>
                                <input type="text" value={p.jabatan} onChange={e => handlePelaksanaChange(index, 'jabatan', e.target.value)} required className="mt-1 block w-full px-2 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-sm" />
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addPelaksana} className="w-full flex items-center justify-center py-2 px-4 border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Tambah Pelaksana
                    </button>
                </div>
            </fieldset>

            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-wait">
                    {isSubmitting ? 'Mengajukan...' : 'Ajukan SPPD'}
                </button>
            </div>
        </form>
    );
};

export default SppdForm;
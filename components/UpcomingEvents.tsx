import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CalendarEvent } from '../types';
import { GAS_WEB_APP_URL } from '../config';

interface UpcomingEventsProps {
  onCreateSppd: (event: CalendarEvent) => void;
}

const EventIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const LocationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

type TimeBasedFilter = 'today' | 'this_week' | 'this_month';
type EventFilter = 'all' | TimeBasedFilter;

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ onCreateSppd }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<EventFilter>('all');

    const fetchEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${GAS_WEB_APP_URL}?action=getEvents`);
            if (!response.ok) {
                throw new Error('Gagal mengambil data acara dari kalender.');
            }
            const data: any = await response.json();
            
            if (!Array.isArray(data) && data.error) throw new Error(data.error);
            if (!Array.isArray(data)) throw new Error('Format data acara dari server tidak benar.');

            const formattedEvents: CalendarEvent[] = data.map(event => ({
                id: event.id,
                title: event.title,
                startTime: new Date(event.startTime),
                endTime: new Date(event.endTime),
                location: event.location,
            })).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

            setEvents(formattedEvents);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak diketahui.');
            console.error("Error fetching events:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);
    
    const filteredEvents = useMemo(() => {
        const now = new Date();

        const isToday = (date: Date) => {
            return date.getFullYear() === now.getFullYear() &&
                   date.getMonth() === now.getMonth() &&
                   date.getDate() === now.getDate();
        };

        const isThisWeek = (date: Date) => {
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            const dayOfWeek = today.getDay(); // Sun: 0, Mon: 1
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust when day is Sunday to start from Monday
            const startOfWeek = new Date(today.setDate(diff));

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            return date >= startOfWeek && date < endOfWeek;
        };

        const isThisMonth = (date: Date) => {
            return date.getFullYear() === now.getFullYear() &&
                   date.getMonth() === now.getMonth();
        };

        return events
            .filter(event => {
                switch (activeFilter) {
                    case 'today':
                        return isToday(event.startTime);
                    case 'this_week':
                        return isThisWeek(event.startTime);
                    case 'this_month':
                        return isThisMonth(event.startTime);
                    case 'all':
                    default:
                        return true;
                }
            })
            .filter(event => {
                const term = searchTerm.toLowerCase();
                return event.title.toLowerCase().includes(term) || event.location.toLowerCase().includes(term);
            });
    }, [events, searchTerm, activeFilter]);


    const formatDateTime = (date: Date) => {
        return new Intl.DateTimeFormat('id-ID', {
            dateStyle: 'full',
            timeStyle: 'short',
        }).format(date);
    };
    
    const handleLoadMore = () => {
        setVisibleCount(filteredEvents.length);
    };
    
    const handleFilterChange = (filter: TimeBasedFilter) => {
        setActiveFilter(prev => (prev === filter ? 'all' : filter));
        setVisibleCount(3); // Reset visible count on filter change
    };

    const renderContent = () => {
        if (isLoading) {
            return <p className="text-center text-slate-500 dark:text-slate-400">Memuat acara...</p>;
        }

        if (error) {
            return <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">{error}</p>;
        }

        if (events.length === 0) {
            return (
                <div className="text-center py-8">
                     <EventIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Tidak ada acara mendatang</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tidak ada jadwal yang ditemukan di kalender.</p>
                </div>
            );
        }
        
        if (filteredEvents.length === 0) {
            return (
                 <div className="text-center py-8">
                     <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">Tidak Ada Hasil</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tidak ada acara yang cocok dengan filter Anda.</p>
                </div>
            )
        }

        return (
            <>
                <ul role="list" className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredEvents.slice(0, visibleCount).map((event) => (
                        <li key={event.id} className="py-4 space-y-3">
                            <h3 className="text-md font-semibold text-slate-800 dark:text-slate-100">{event.title}</h3>
                            <div className="space-y-2">
                                 <p className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                    <EventIcon className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
                                    <span>{formatDateTime(event.startTime)}</span>
                                </p>
                                <p className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                                    <LocationIcon className="h-4 w-4 mr-2 text-slate-400 dark:text-slate-500" />
                                    <span>{event.location || 'Lokasi tidak ditentukan'}</span>
                                </p>
                            </div>
                            <div className="pt-2">
                                <button
                                    onClick={() => onCreateSppd(event)}
                                    className="w-full text-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                                >
                                    Buat SPPD dari Acara Ini
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
                {filteredEvents.length > visibleCount && (
                    <div className="mt-4">
                        <button
                            onClick={handleLoadMore}
                            className="w-full text-center px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800"
                        >
                            Tampilkan {filteredEvents.length - visibleCount} lagi
                        </button>
                    </div>
                )}
            </>
        );
    };
    
    const navLinkClasses = "px-3 py-1.5 rounded-md text-sm font-medium transition-colors text-center flex-1";
    const activeLinkClasses = "bg-slate-200 dark:bg-slate-700 text-blue-600 dark:text-blue-400";
    const inactiveLinkClasses = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50";


    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Acara Mendatang dari Kalender</h2>
            
            <div className="space-y-4 mb-4">
                {/* Search Input */}
                <div>
                     <input 
                        type="text" 
                        placeholder="Cari nama acara atau lokasi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        aria-label="Cari acara"
                    />
                </div>
                {/* Filter Buttons */}
                <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                    <button onClick={() => handleFilterChange('today')} className={`${navLinkClasses} ${activeFilter === 'today' ? activeLinkClasses : inactiveLinkClasses}`}>Hari Ini</button>
                    <button onClick={() => handleFilterChange('this_week')} className={`${navLinkClasses} ${activeFilter === 'this_week' ? activeLinkClasses : inactiveLinkClasses}`}>Minggu Ini</button>
                    <button onClick={() => handleFilterChange('this_month')} className={`${navLinkClasses} ${activeFilter === 'this_month' ? activeLinkClasses : inactiveLinkClasses}`}>Bulan Ini</button>
                </div>
            </div>

            {renderContent()}
        </div>
    );
};

export default UpcomingEvents;
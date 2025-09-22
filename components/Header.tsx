import React from 'react';
import type { AppView } from '../types';

const PlaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onNavigate }) => {
  const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeLinkClasses = "bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400";
  const inactiveLinkClasses = "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white";

  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
               <PlaneIcon className="h-8 w-8 text-blue-500" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Sistem Perjalanan Dinas
                </h1>
            </div>
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg">
                <button
                    onClick={() => onNavigate('dashboard')}
                    className={`${navLinkClasses} ${activeView === 'dashboard' ? activeLinkClasses : inactiveLinkClasses}`}
                    aria-current={activeView === 'dashboard' ? 'page' : undefined}
                >
                    Dashboard
                </button>
                <button
                    onClick={() => onNavigate('reports')}
                    className={`${navLinkClasses} ${activeView === 'reports' ? activeLinkClasses : inactiveLinkClasses}`}
                    aria-current={activeView === 'reports' ? 'page' : undefined}
                >
                    Laporan
                </button>
            </nav>
          </div>
          <div className="flex items-center space-x-2">
             <img src="https://picsum.photos/40/40" alt="User Avatar" className="h-10 w-10 rounded-full object-cover border-2 border-blue-500" />
             <span className="hidden sm:inline font-medium text-slate-700 dark:text-slate-300">Admin</span>
          </div>
        </div>
         {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg -mt-4 mb-4">
            <button
                onClick={() => onNavigate('dashboard')}
                className={`w-full ${navLinkClasses} ${activeView === 'dashboard' ? activeLinkClasses : inactiveLinkClasses}`}
                aria-current={activeView === 'dashboard' ? 'page' : undefined}
            >
                Dashboard
            </button>
            <button
                onClick={() => onNavigate('reports')}
                className={`w-full ${navLinkClasses} ${activeView === 'reports' ? activeLinkClasses : inactiveLinkClasses}`}
                aria-current={activeView === 'reports' ? 'page' : undefined}
            >
                Laporan
            </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;

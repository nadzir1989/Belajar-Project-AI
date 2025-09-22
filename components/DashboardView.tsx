import React from 'react';
import { SPPD, CalendarEvent, Employee } from '../types';
import SppdForm from './TravelRequestForm'; // Renamed component, filename kept for simplicity
import UpcomingEvents from './UpcomingEvents';

interface DashboardViewProps {
  employees: Employee[];
  handleAddSppd: (newSppdData: Omit<SPPD, 'sppd_id' | 'status' | 'tgl_input'>) => Promise<void>;
  handleCreateSppdFromEvent: (event: CalendarEvent) => void;
  initialFormData?: Partial<Omit<SPPD, 'sppd_id' | 'status'>>;
  // Props for dynamic options
  transportOptions: string[];
  sppdTypeOptions: string[];
  budgetAccountOptions: string[];
}

const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  handleAddSppd,
  handleCreateSppdFromEvent,
  initialFormData,
  transportOptions,
  sppdTypeOptions,
  budgetAccountOptions,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <SppdForm
          employees={employees}
          onAddSppd={handleAddSppd}
          initialData={initialFormData}
          key={JSON.stringify(initialFormData)} // Force re-render with new initial data
          // Pass dynamic options down to the form
          transportOptions={transportOptions}
          sppdTypeOptions={sppdTypeOptions}
          budgetAccountOptions={budgetAccountOptions}
        />
      </div>
      <div className="lg:col-span-2">
        <UpcomingEvents onCreateSppd={handleCreateSppdFromEvent} />
      </div>
    </div>
  );
};

export default DashboardView;
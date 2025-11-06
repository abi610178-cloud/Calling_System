import React from 'react';
import { PhoneCall, Play, Square, RotateCcw, Zap } from 'lucide-react';
import { ControlPanel } from './ControlPanel';
import CallStatus from './CallStatus';
import { EmployeeCard } from './EmployeeCard';
import { Employee } from '../types/Employee';

interface CallingViewProps {
  isAutoCallActive: boolean;
  currentCallingId: string | null;
  currentEmployeeIndex: number;
  employees: Employee[];
  onStartAutoCalling: () => void;
  onStopAutoCalling: () => void;
  onResetSystem: () => void;
  onCallEmployee: (id: string) => void;
  onCallEmployeeWithReason: (id: string, reason: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'follow-up' | 'not-interested') => void;
  onDeleteContact: (id: string) => void;
  onShowHistory: (employee: Employee) => void;
  onShowAppointment: (employee: Employee) => void;
  onShowCalendar: (employee: Employee) => void;
  onShowReview: (employee: Employee) => void;
}

export const CallingView: React.FC<CallingViewProps> = ({
  isAutoCallActive,
  currentCallingId,
  currentEmployeeIndex,
  employees,
  onStartAutoCalling,
  onStopAutoCalling,
  onResetSystem,
  onCallEmployee,
  onCallEmployeeWithReason,
  onUpdatePriority,
  onDeleteContact,
  onShowHistory,
  onShowAppointment,
  onShowCalendar,
  onShowReview,
}) => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Calling Center</h2>
            <p className="text-gray-600">Manage automated and manual calling sequences</p>
          </div>
          <div className="flex items-center space-x-2">
            {isAutoCallActive ? (
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 font-medium">Calling Active</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 font-medium">Idle</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Quick Controls</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onStartAutoCalling}
            disabled={isAutoCallActive || employees.length === 0}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
          >
            <Play className="w-5 h-5" />
            <span>Start Auto-Calling</span>
          </button>

          <button
            onClick={onStopAutoCalling}
            disabled={!isAutoCallActive}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all disabled:cursor-not-allowed"
          >
            <Square className="w-5 h-5" />
            <span>Stop Auto-Calling</span>
          </button>

          <button
            onClick={onResetSystem}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset All Statuses</span>
          </button>
        </div>
      </div>

      {/* Call Status */}
      {isAutoCallActive && (
        <CallStatus
          currentEmployee={employees.find(e => e.id === currentCallingId)}
          currentIndex={currentEmployeeIndex}
          totalEmployees={employees.length}
          isActive={isAutoCallActive}
        />
      )}

      {/* Contact List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <PhoneCall className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Contact List</h3>
            <p className="text-sm text-gray-600">{employees.length} contacts ready to call</p>
          </div>
        </div>

        {employees.length === 0 ? (
          <div className="text-center py-12">
            <PhoneCall className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No contacts available</p>
            <p className="text-sm text-gray-400">Add contacts from the Contacts section to start calling</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                isCalling={currentCallingId === employee.id}
                onCall={onCallEmployee}
                onCallWithReason={onCallEmployeeWithReason}
                onUpdatePriority={onUpdatePriority}
                onDelete={onDeleteContact}
                onShowHistory={onShowHistory}
                onShowAppointment={onShowAppointment}
                onShowCalendar={onShowCalendar}
                onShowReview={onShowReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

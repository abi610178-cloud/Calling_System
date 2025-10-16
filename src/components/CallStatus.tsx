import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, CheckCircle, XCircle, Clock, RotateCcw, Phone, Calendar, AlertTriangle, Play, Square } from 'lucide-react';
import { Employee, CallSystemStats } from '../types/Employee';

interface CallStatusProps {
  stats: CallSystemStats;
  isAutoCallActive: boolean;
  currentEmployeeIndex: number;
  totalEmployees: number;
  onFilterCompleted: () => void;
  onFilterAnswered: () => void;
  onFilterMissed: () => void;
  onFilterPending: () => void;
  onFilterUrgent: () => void;
  onShowMonthlyAppointments: () => void;
  onShowCurrentClient: () => void;
  onShowRoundInfo: () => void;
  onShowTotalDetails: () => void;
  employees: Employee[];
}

const CallStatus: React.FC<CallStatusProps> = ({
  stats,
  isAutoCallActive,
  currentEmployeeIndex,
  totalEmployees,
  onFilterCompleted,
  onFilterAnswered,
  onFilterMissed,
  onFilterPending,
  onFilterUrgent,
  onShowMonthlyAppointments,
  onShowCurrentClient,
  onShowRoundInfo,
  onShowTotalDetails,
  employees,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
        <Users className="w-7 h-7 text-indigo-600" />
        <span>Client Call Dashboard</span>
        {isAutoCallActive && (
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full animate-pulse">
            Auto Calling Active
          </span>
        )}
      </h2>
      
      {/* Real-time stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4 mb-6">
        <button 
          onClick={onShowTotalDetails}
          className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-center border-2 border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</div>
          <div className="text-sm text-gray-600">Total</div>
        </button>

        <button 
          onClick={onFilterAnswered}
          className="bg-green-50 hover:bg-green-100 rounded-lg p-4 text-center border-2 border-green-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-800">{stats.answered}</div>
          <div className="text-sm text-green-600">Answered</div>
        </button>

        <button 
          onClick={onFilterMissed}
          className="bg-red-50 hover:bg-red-100 rounded-lg p-4 text-center border-2 border-red-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-800">{stats.missed}</div>
          <div className="text-sm text-red-600">Missed</div>
        </button>

        <button 
          onClick={onFilterPending}
          className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center border-2 border-blue-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-800">{stats.pending}</div>
          <div className="text-sm text-blue-600">Pending</div>
        </button>

        <button 
          onClick={onShowRoundInfo}
          className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 text-center border-2 border-purple-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <RotateCcw className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-800">{stats.currentRound}</div>
          <div className="text-sm text-purple-600">Round</div>
        </button>

        <button 
          onClick={onShowCurrentClient}
          className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 text-center border-2 border-yellow-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <Phone className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-800">
            {isAutoCallActive && totalEmployees > 0 ? currentEmployeeIndex + 1 : '-'}
          </div>
          <div className="text-sm text-yellow-600">Current</div>
        </button>

        <button 
          onClick={onShowMonthlyAppointments}
          className="bg-orange-50 hover:bg-orange-100 rounded-lg p-4 text-center border-2 border-orange-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <Calendar className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-800">{stats.monthlyAppointments}</div>
          <div className="text-sm text-orange-600">This Month</div>
        </button>

        <button 
          onClick={onFilterCompleted}
          className="bg-teal-50 hover:bg-teal-100 rounded-lg p-4 text-center border-2 border-teal-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <CheckCircle className="w-6 h-6 text-teal-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-teal-800">{stats.completedWork}</div>
          <div className="text-sm text-teal-600">Completed</div>
        </button>

        <button 
          onClick={onFilterUrgent}
          className="bg-red-50 hover:bg-red-100 rounded-lg p-4 text-center border-2 border-red-200 transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-800">{stats.urgentClients}</div>
          <div className="text-sm text-red-600">Urgent</div>
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-700">
            {stats.totalEmployees > 0 ? Math.round((stats.answered / stats.totalEmployees) * 100) : 0}%
          </span>
        </div>
        <div className="bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
            style={{ 
              width: `${stats.totalEmployees > 0 ? (stats.answered / stats.totalEmployees) * 100 : 0}%` 
            }}
          />
        </div>
      </div>

      {/* System Status Information */}
      {isAutoCallActive && (
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-blue-900">
              🔄 Auto Calling Active - Round {stats.currentRound}
            </span>
          </div>
          <div className="text-sm text-blue-800">
            <div className="grid md:grid-cols-2 gap-2">
              <div>📞 Current Position: {currentEmployeeIndex + 1} of {totalEmployees}</div>
              <div>⏱️ 10-second timeout per call</div>
              <div>🎯 {stats.currentRound === 1 ? 'Calling ALL clients' : 'Calling UNANSWERED clients only'}</div>
              <div>🛑 Auto stops when all clients answer</div>
            </div>
          </div>
        </div>
      )}

      {/* Round Information */}
      {stats.currentRound > 1 && (
        <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <RotateCcw className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Round {stats.currentRound} Active</span>
          </div>
          <div className="text-sm text-purple-800">
            Only calling clients who didn't answer in previous rounds ({stats.pending + stats.missed} remaining)
          </div>
        </div>
      )}
    </div>
  );
};

export default CallStatus;
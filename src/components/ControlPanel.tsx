import React from 'react';
import { Play, Square, RotateCcw, Phone, Clock, Repeat, Target, Calendar, Building2, Settings } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  value: string;
  isDefault: boolean;
}

interface ControlPanelProps {
  isAutoCallActive: boolean;
  onStartAutoCalling: () => void;
  onStopAutoCalling: () => void;
  onResetSystem: () => void;
  hasEmployees: boolean;
  currentRound: number;
  currentEmployeeIndex: number;
  totalEmployees: number;
  onShowCalendar?: () => void;
  selectedBusiness: string;
  onBusinessChange: (business: string) => void;
  businesses: Business[];
  onManageBusinesses?: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  isAutoCallActive,
  onStartAutoCalling,
  onStopAutoCalling,
  onResetSystem,
  hasEmployees,
  currentRound,
  currentEmployeeIndex,
  totalEmployees,
  onShowCalendar,
  selectedBusiness,
  onBusinessChange,
  businesses,
  onManageBusinesses,
}) => {
  const selectedBusinessName = businesses.find(b => b.value === selectedBusiness)?.name || 'selected business';

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
        <Phone className="w-6 h-6 text-blue-600" />
        <span>Auto Call Controls</span>
      </h2>

      {/* Business Filter Dropdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Filter by Business</span>
          </label>
          {onManageBusinesses && (
            <button
              onClick={onManageBusinesses}
              disabled={isAutoCallActive}
              className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium flex items-center space-x-1 transition-colors"
              title="Manage businesses"
            >
              <Settings className="w-4 h-4" />
              <span>Manage</span>
            </button>
          )}
        </div>
        <select
          value={selectedBusiness}
          onChange={(e) => onBusinessChange(e.target.value)}
          disabled={isAutoCallActive}
          className="w-full md:w-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          {businesses.map((business) => (
            <option key={business.id} value={business.value}>
              {business.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-2">
          {selectedBusiness === 'all'
            ? 'Showing all contacts from all businesses'
            : `Showing contacts from ${selectedBusinessName}`}
        </p>
      </div>

      {/* Control buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        {!isAutoCallActive ? (
          <button
            onClick={onStartAutoCalling}
            disabled={!hasEmployees}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Play className="w-6 h-6" />
            <span>Start Auto Call</span>
          </button>
        ) : (
          <button
            onClick={onStopAutoCalling}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-md animate-pulse"
          >
            <Square className="w-6 h-6" />
            <span>Stop Auto Call</span>
          </button>
        )}
        
        <button
          onClick={onResetSystem}
          disabled={isAutoCallActive}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <RotateCcw className="w-6 h-6" />
          <span>Reset System</span>
        </button>
        
        {onShowCalendar && (
          <button
            onClick={onShowCalendar}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold flex items-center space-x-3 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Calendar className="w-6 h-6" />
            <span>View Calendar</span>
          </button>
        )}
      </div>

      {/* System status information */}
      <div className="space-y-4">
        {isAutoCallActive && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-900 font-bold text-lg">
                🔄 Auto Calling Active - Round {currentRound}
              </span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <Target className="w-5 h-5" />
                <span className="font-medium">
                  Current Client: {currentEmployeeIndex + 1} of {totalEmployees}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-blue-800">
                <Clock className="w-5 h-5" />
                <span className="font-medium">⏱️ 10 Seconds Between Each Call</span>
              </div>
            </div>
            
            <div className="bg-blue-100 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Repeat className="w-5 h-5 text-blue-700" />
                <span className="font-semibold text-blue-900">TWO-STACK AUTO-CALLING:</span>
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Round 1:</strong> Call ALL employees one by one</li>
                <li>• <strong>✅ Answered:</strong> Moved to ATTENDED stack (removed from queue)</li>
                <li>• <strong>❌ Missed:</strong> Kept in UNATTENDED stack (retry next round)</li>
                <li>• <strong>Wait time:</strong> 10 seconds between each call</li>
                <li>• <strong>Round 2+:</strong> Call ONLY UNATTENDED stack employees</li>
                <li>• <strong>Auto stops:</strong> When UNATTENDED stack becomes empty</li>
                <li>• <strong>Alert:</strong> Shows when all contacts attended</li>
              </ul>
            </div>
          </div>
        )}

        {!isAutoCallActive && hasEmployees && (
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Play className="w-6 h-6 text-green-600" />
              <span className="text-green-900 font-bold text-lg">Ready to Start Auto Calling</span>
            </div>
            
            <div className="bg-green-100 p-4 rounded-lg">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-green-800">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Two-stack system</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>10 sec between calls</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Attended stack separation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Repeat className="w-4 h-4" />
                    <span>Loop until all attended</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 p-2 bg-green-200 rounded text-center">
                <strong className="text-green-900">Ready to start calling</strong>
              </div>
            </div>
          </div>
        )}

        {!isAutoCallActive && hasEmployees && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Two-Stack System:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div className="space-y-1">
                <div>1. Round 1: Call all clients</div>
                <div>2. ✅ Answered → ATTENDED stack</div>
                <div>3. ❌ Missed → UNATTENDED stack</div>
                <div>4. Wait 10 seconds between calls</div>
              </div>
              <div className="space-y-1">
                <div>5. Round 2+: Call UNATTENDED only</div>
                <div>6. Attended removed from queue</div>
                <div>7. Stop when all attended</div>
                <div>8. Alert when complete</div>
              </div>
            </div>
          </div>
        )}

        {!hasEmployees && (
          <div className="p-4 bg-gray-50 border-l-4 border-gray-400 rounded-lg">
            <span className="text-gray-700">No clients available. Please add clients to start calling.</span>
          </div>
        )}
      </div>
    </div>
  );
};
import React from 'react';
import { Phone, Mail, User, Building, PhoneCall, Star, Clock, XCircle, MessageCircle, AlertTriangle, History, Calendar, Tag, X } from 'lucide-react';
import { Employee } from '../types/Employee';

interface EmployeeCardProps {
  employee: Employee;
  isCurrentlyCalling: boolean;
  isCurrentEmployee: boolean;
  onCallEmployee: (employeeId: string) => void;
  onUpdatePriority: (employeeId: string, priority: 'high' | 'follow-up' | 'not-interested') => void;
  onOpenWhatsApp?: (phoneNumber: string) => void;
  onViewHistory?: (employeeId: string) => void;
  onScheduleAppointment?: (employeeId: string) => void;
  isAutoCallActive: boolean;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  isCurrentlyCalling,
  isCurrentEmployee,
  onCallEmployee,
  onUpdatePriority,
  onOpenWhatsApp,
  onViewHistory,
  onScheduleAppointment,
  isAutoCallActive,
}) => {

  const getStatusColor = () => {
    switch (employee.status) {
      case 'answered':
        return 'bg-green-50 border-green-300 text-green-800';
      case 'missed':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'calling':
        return 'bg-blue-50 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-800';
    }
  };

  const getButtonColor = () => {
    switch (employee.status) {
      case 'answered':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'missed':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'calling':
        return 'bg-blue-500 text-white cursor-not-allowed animate-pulse';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  const getPriorityButtonColor = (priority: 'high' | 'follow-up' | 'not-interested') => {
    switch (priority) {
      case 'high':
        return 'bg-green-800 hover:bg-green-900 text-white';
      case 'follow-up':
        return 'bg-green-400 hover:bg-green-500 text-white';
      case 'not-interested':
        return 'bg-red-500 hover:bg-red-600 text-white';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'follow-up' | 'not-interested') => {
    switch (priority) {
      case 'high':
        return <Star className="w-4 h-4" />;
      case 'follow-up':
        return <Clock className="w-4 h-4" />;
      case 'not-interested':
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getPriorityText = (priority: 'high' | 'follow-up' | 'not-interested') => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'follow-up':
        return 'Follow Up';
      case 'not-interested':
        return 'Not Interested';
    }
  };
  const getStatusText = () => {
    switch (employee.status) {
      case 'answered':
        return '✅ Answered';
      case 'missed':
        return '❌ Missed';
      case 'calling':
        return '📞 Calling...';
      default:
        return '⏳ Pending';
    }
  };

  const handleQuickCall = () => {
    if (!isCurrentlyCalling && employee.status !== 'calling') {
      onCallEmployee(employee.id);
    }
  };

  const getWorkStatusColor = () => {
    switch (employee.workStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'repeat_client':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWorkStatusText = () => {
    switch (employee.workStatus) {
      case 'completed':
        return '✅ Work Done';
      case 'in_progress':
        return '🔄 In Progress';
      case 'repeat_client':
        return '🔁 Repeat Client';
      default:
        return '🆕 New Client';
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = employee.whatsappNumber || employee.phoneNumber;
    if (onOpenWhatsApp && phoneNumber) {
      onOpenWhatsApp(phoneNumber);
    }
  };

  return (
    <div className={`rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 transition-all duration-300 ${getStatusColor()} ${
      isCurrentlyCalling ? 'ring-2 sm:ring-4 ring-blue-400 scale-105 shadow-xl' : 'shadow-md'
    } ${isCurrentEmployee && isAutoCallActive ? 'ring-2 ring-yellow-400' : ''}`}>
      
      {/* Header with employee info and status */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <div className="bg-white p-1.5 sm:p-2 rounded-full shadow-sm flex-shrink-0">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg truncate">{employee.name}</h3>
            <p className="text-xs sm:text-sm opacity-75">Client</p>
              {employee.isUrgent && (
                <AlertTriangle className="w-5 h-5 text-red-500" title="Urgent Client" />
              )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          {employee.workStatus && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium shadow-sm ${getWorkStatusColor()}`}>
              {getWorkStatusText()}
            </span>
          )}
          {employee.callAttempts > 0 && (
            <span className="bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
              📞 {employee.callAttempts}
            </span>
          )}
          {employee.priority && (
            <span className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${
              employee.priority === 'high' ? 'bg-green-800 text-white' :
              employee.priority === 'follow-up' ? 'bg-green-400 text-white' :
              'bg-red-500 text-white'
            }`}>
              {employee.priority === 'high' ? '⭐ High' :
               employee.priority === 'follow-up' ? '🔄 Follow' :
               '❌ Not Interested'}
            </span>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
            employee.status === 'calling' ? 'bg-blue-500 text-white animate-pulse' : 
            employee.status === 'answered' ? 'bg-green-500 text-white' :
            employee.status === 'missed' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Contact details */}
      <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-medium">{employee.phoneNumber}</span>
        </div>
        {employee.whatsappNumber && (
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            <span className="font-medium text-green-600">{employee.whatsappNumber}</span>
          </div>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        {(employee.whatsappNumber || employee.phoneNumber) && (
          <button
            onClick={handleWhatsAppClick}
            className="mobile-button bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
            title="Open WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>WhatsApp</span>
          </button>
        )}
        
        {onViewHistory && (
          <button
            onClick={() => onViewHistory(employee.id)}
            className="mobile-button bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
            title="View Work History"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>History</span>
          </button>
        )}
        
        {onScheduleAppointment && (
          <button
            onClick={() => onScheduleAppointment(employee.id)}
            className="mobile-button bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
            title="Schedule Appointment"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Schedule</span>
          </button>
        )}
      </div>
      
      {/* Priority Buttons */}
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Set Priority:</p>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          <button
            onClick={() => onUpdatePriority(employee.id, 'high')}
            disabled={isAutoCallActive}
            className={`mobile-button py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 ${
              employee.priority === 'high' 
                ? 'bg-green-800 text-white ring-2 ring-green-600' 
                : 'bg-green-800 hover:bg-green-900 text-white opacity-70 hover:opacity-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getPriorityIcon('high')}
            <span>High</span>
          </button>
          
          <button
            onClick={() => onUpdatePriority(employee.id, 'follow-up')}
            disabled={isAutoCallActive}
            className={`mobile-button py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 ${
              employee.priority === 'follow-up' 
                ? 'bg-green-400 text-white ring-2 ring-green-300' 
                : 'bg-green-400 hover:bg-green-500 text-white opacity-70 hover:opacity-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getPriorityIcon('follow-up')}
            <span>Follow</span>
          </button>
          
          <button
            onClick={() => onUpdatePriority(employee.id, 'not-interested')}
            disabled={isAutoCallActive}
            className={`mobile-button py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 ${
              employee.priority === 'not-interested' 
                ? 'bg-red-500 text-white ring-2 ring-red-400' 
                : 'bg-red-500 hover:bg-red-600 text-white opacity-70 hover:opacity-100'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {getPriorityIcon('not-interested')}
            <span>Not Int.</span>
          </button>
        </div>
      </div>
      
      {/* Single Call Button */}
      <button
        onClick={handleQuickCall}
        disabled={isCurrentlyCalling || (isAutoCallActive && !isCurrentEmployee)}
        className={`w-full mobile-button py-3 sm:py-3.5 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 ${getButtonColor()} ${
          isCurrentlyCalling ? 'transform scale-105' : ''
        } disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
      >
        <PhoneCall className={`w-5 h-5 ${isCurrentlyCalling ? 'animate-pulse' : ''}`} />
        <span>Call</span>
      </button>
      
      {/* Timeout indicator */}
      {isCurrentlyCalling && (
        <div className="mt-3 text-center">
          <div className="text-xs text-blue-600 font-medium bg-blue-100 rounded-full py-1 px-3">
            ⏱️ 10-second timeout active
          </div>
        </div>
      )}

      {/* Next employee indicator */}
      {isCurrentEmployee && isAutoCallActive && !isCurrentlyCalling && (
        <div className="mt-3 text-center">
          <div className="text-xs text-yellow-600 font-medium bg-yellow-100 rounded-full py-1 px-3">
            🎯 Next in auto call sequence
          </div>
        </div>
      )}
    </div>
  );
};
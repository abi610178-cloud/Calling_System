import React from 'react';
import { PhoneCall, Users, Calendar, MessageSquare, Building2, LogOut, BarChart3, UserPlus, Phone } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  callRequestsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onNavigate,
  onLogout,
  callRequestsCount = 0
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, description: 'Overview & Stats' },
    { id: 'contacts', label: 'Contacts', icon: Users, description: 'Manage Contacts' },
    { id: 'calling', label: 'Calling', icon: PhoneCall, description: 'Auto & Manual Calling' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, description: 'Appointments & Schedule' },
    { id: 'requests', label: 'Call Requests', icon: Phone, description: 'Client Callback Requests', badge: callRequestsCount },
    { id: 'businesses', label: 'Businesses', icon: Building2, description: 'Manage Businesses' },
    { id: 'client-portal', label: 'Client Portal', icon: MessageSquare, description: 'Public Client View' },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <PhoneCall className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Client Calling System</h1>
              <p className="text-xs text-gray-500">Professional Contact Management</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center overflow-x-auto px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center px-6 py-3 min-w-[120px] transition-all ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1">{item.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

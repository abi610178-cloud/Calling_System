import React from 'react';
import { PhoneCall, CheckCircle, XCircle, Clock, TrendingUp, Calendar, Star } from 'lucide-react';

interface Stats {
  total: number;
  answered: number;
  missed: number;
  pending: number;
  currentRound: number;
  callsThisRound: number;
  monthlyAppointments: number;
  completedClients: number;
  urgentClients: number;
}

interface DashboardViewProps {
  stats: Stats;
  onStatClick: (type: string, title: string) => void;
  connectionStatus: React.ReactNode;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onStatClick,
  connectionStatus
}) => {
  const statCards = [
    {
      label: 'Total Contacts',
      value: stats.total,
      icon: PhoneCall,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      onClick: () => onStatClick('total', 'All Contacts'),
    },
    {
      label: 'Answered',
      value: stats.answered,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      onClick: () => onStatClick('answered', 'Answered Calls'),
    },
    {
      label: 'Missed',
      value: stats.missed,
      icon: XCircle,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      onClick: () => onStatClick('missed', 'Missed Calls'),
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600',
      onClick: () => onStatClick('pending', 'Pending Calls'),
    },
    {
      label: 'Current Round',
      value: stats.currentRound,
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      onClick: () => onStatClick('round', `Round ${stats.currentRound} Calls`),
    },
    {
      label: 'Calls This Round',
      value: stats.callsThisRound,
      icon: PhoneCall,
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      onClick: () => onStatClick('current', 'Current Round Progress'),
    },
    {
      label: 'Monthly Appointments',
      value: stats.monthlyAppointments,
      icon: Calendar,
      color: 'pink',
      gradient: 'from-pink-500 to-pink-600',
      onClick: () => onStatClick('monthly', 'This Month\'s Appointments'),
    },
    {
      label: 'Completed Clients',
      value: stats.completedClients,
      icon: Star,
      color: 'teal',
      gradient: 'from-teal-500 to-teal-600',
      onClick: () => onStatClick('completed', 'Completed Clients'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {connectionStatus}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Monitor your calling system performance and statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              onClick={stat.onClick}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group border-2 border-transparent hover:border-blue-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-3xl font-bold text-${stat.color}-600`}>
                  {stat.value}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                {stat.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-800">Success Rate</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Based on answered calls</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-800">Progress</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            Round {stats.currentRound}
          </div>
          <p className="text-sm text-gray-600 mt-1">{stats.callsThisRound} calls made</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-3 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-800">This Month</h3>
          </div>
          <div className="text-3xl font-bold text-purple-600">
            {stats.monthlyAppointments}
          </div>
          <p className="text-sm text-gray-600 mt-1">Appointments scheduled</p>
        </div>
      </div>
    </div>
  );
};

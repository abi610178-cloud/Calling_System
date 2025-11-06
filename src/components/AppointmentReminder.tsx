import React, { useState, useEffect } from 'react';
import { Bell, X, Calendar, Clock, User, AlertCircle } from 'lucide-react';
import { Appointment, Employee } from '../types/Employee';

interface AppointmentReminderProps {
  appointments: Appointment[];
  employees: Employee[];
}

interface ReminderNotification {
  id: string;
  appointment: Appointment;
  clientName: string;
  timeUntil: string;
  minutesUntil: number;
}

export const AppointmentReminder: React.FC<AppointmentReminderProps> = ({
  appointments,
  employees,
}) => {
  const [reminders, setReminders] = useState<ReminderNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [showReminders, setShowReminders] = useState(true);

  useEffect(() => {
    const checkAppointments = () => {
      const now = new Date();
      const upcomingReminders: ReminderNotification[] = [];

      appointments
        .filter(apt => apt.status === 'scheduled')
        .forEach(apt => {
          const aptDate = new Date(apt.appointmentDate);
          const diffMs = aptDate.getTime() - now.getTime();
          const diffMinutes = Math.floor(diffMs / (1000 * 60));

          if (diffMinutes > 0 && diffMinutes <= 60 && !dismissedIds.has(apt.id)) {
            const client = employees.find(emp => emp.id === apt.clientId);
            if (client) {
              upcomingReminders.push({
                id: apt.id,
                appointment: apt,
                clientName: client.name,
                timeUntil: formatTimeUntil(diffMinutes),
                minutesUntil: diffMinutes,
              });
            }
          }
        });

      upcomingReminders.sort((a, b) => a.minutesUntil - b.minutesUntil);
      setReminders(upcomingReminders);
    };

    checkAppointments();
    const interval = setInterval(checkAppointments, 60000);

    return () => clearInterval(interval);
  }, [appointments, employees, dismissedIds]);

  const formatTimeUntil = (minutes: number): string => {
    if (minutes < 1) return 'Starting now';
    if (minutes === 1) return 'In 1 minute';
    if (minutes < 60) return `In ${minutes} minutes`;
    return 'Within the hour';
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const formatTime = (date: Date): string => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (reminders.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      {showReminders && (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-white rounded-lg shadow-2xl border-2 overflow-hidden animate-slide-in ${
                reminder.minutesUntil <= 15
                  ? 'border-red-500'
                  : reminder.minutesUntil <= 30
                  ? 'border-orange-500'
                  : 'border-blue-500'
              }`}
            >
              <div
                className={`p-4 ${
                  reminder.minutesUntil <= 15
                    ? 'bg-gradient-to-r from-red-50 to-red-100'
                    : reminder.minutesUntil <= 30
                    ? 'bg-gradient-to-r from-orange-50 to-orange-100'
                    : 'bg-gradient-to-r from-blue-50 to-blue-100'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-2 rounded-full ${
                        reminder.minutesUntil <= 15
                          ? 'bg-red-500'
                          : reminder.minutesUntil <= 30
                          ? 'bg-orange-500'
                          : 'bg-blue-500'
                      }`}
                    >
                      <Bell className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        Upcoming Appointment
                      </h3>
                      <p
                        className={`text-sm font-semibold ${
                          reminder.minutesUntil <= 15
                            ? 'text-red-600'
                            : reminder.minutesUntil <= 30
                            ? 'text-orange-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {reminder.timeUntil}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(reminder.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 ml-9">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <User className="w-4 h-4" />
                    <span className="font-semibold">{reminder.clientName}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDate(reminder.appointment.appointmentDate)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {formatTime(reminder.appointment.appointmentDate)}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-gray-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm capitalize">
                      {reminder.appointment.appointmentType}
                    </span>
                  </div>

                  {reminder.appointment.notes && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm text-gray-700">
                      <strong>Notes:</strong> {reminder.appointment.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {reminders.length > 0 && (
        <button
          onClick={() => setShowReminders(!showReminders)}
          className={`mt-3 w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
            showReminders
              ? 'bg-gray-600 text-white hover:bg-gray-700'
              : 'bg-blue-600 text-white hover:bg-blue-700 animate-bounce'
          }`}
        >
          {showReminders ? 'Hide Reminders' : `Show ${reminders.length} Reminder${reminders.length > 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
};

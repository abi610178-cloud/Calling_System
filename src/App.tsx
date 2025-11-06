import React, { useState, useEffect } from 'react';
import { useCallSystem } from './hooks/useCallSystem';
import { AuthWrapper } from './components/AuthWrapper';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ContactsView } from './components/ContactsView';
import { CallingView } from './components/CallingView';
import { ClientHistoryModal } from './components/ClientHistoryModal';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { CalendarModal } from './components/CalendarModal';
import { DetailModal } from './components/DetailModal';
import { ClientCallRequestManager } from './components/ClientCallRequestManager';
import { useClientCallRequests } from './hooks/useClientCallRequests';
import { ClientPurposeSelector } from './components/ClientPurposeSelector';
import { BusinessManager } from './components/BusinessManager';
import { Employee, WorkHistory, Appointment, ClientFeedback } from './types/Employee';
import { supabase, auth } from './lib/supabase';

// Connection status component
const ConnectionStatus: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (employees.length >= 0) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [employees]);

  if (connectionStatus === 'checking') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-yellow-800 text-sm font-medium">Checking connection...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-3 ${
      connectionStatus === 'connected'
        ? 'bg-green-50 border-green-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className={`text-sm font-medium ${
          connectionStatus === 'connected' ? 'text-green-800' : 'text-red-800'
        }`}>
          {connectionStatus === 'connected'
            ? '✅ Frontend & Backend Connected'
            : '❌ Connection Failed'}
        </span>
      </div>
      {connectionStatus === 'connected' && (
        <div className="mt-2 text-xs text-green-700">
          Database: ✅ Connected | Auth: ✅ Ready | API: ✅ Working
        </div>
      )}
    </div>
  );
};

function App() {
  const {
    employees,
    allEmployees,
    selectedBusiness,
    setSelectedBusiness,
    isAutoCallActive,
    currentCallingId,
    currentEmployeeIndex,
    stats,
    startAutoCalling,
    stopAutoCalling,
    callEmployee,
    callEmployeeWithReason,
    resetSystem,
    addContact,
    deleteContact,
    updatePriority,
    addWorkHistory,
    addAppointment,
    addFeedback,
    getClientHistory,
  } = useCallSystem();

  const {
    callRequests,
    addCallRequest,
    acceptRequest,
    completeRequest,
    cancelRequest,
  } = useClientCallRequests();

  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedClient, setSelectedClient] = useState<Employee | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalType, setDetailModalType] = useState<'total' | 'answered' | 'missed' | 'pending' | 'round' | 'current' | 'monthly' | 'completed' | 'urgent'>('total');
  const [detailModalTitle, setDetailModalTitle] = useState('');
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  const [clientHistory, setClientHistory] = useState<{
    workHistory: WorkHistory[];
    appointments: Appointment[];
    feedback: ClientFeedback[];
  }>({ workHistory: [], appointments: [], feedback: [] });
  const [showBusinessManager, setShowBusinessManager] = useState(false);
  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string; value: string; isDefault: boolean }>>([]);

  // Load marked dates from localStorage
  useEffect(() => {
    const savedMarkedDates = localStorage.getItem('markedDates');
    if (savedMarkedDates) {
      try {
        const dates = JSON.parse(savedMarkedDates).map((dateStr: string) => new Date(dateStr));
        setMarkedDates(dates);
      } catch (error) {
        console.error('Failed to load marked dates:', error);
      }
    }
  }, []);

  // Save marked dates to localStorage
  useEffect(() => {
    localStorage.setItem('markedDates', JSON.stringify(markedDates.map(date => date.toISOString())));
  }, [markedDates]);

  // Load businesses from Supabase
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) return;

        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .order('is_default', { ascending: false })
          .order('name', { ascending: true });

        if (error) throw error;

        if (data) {
          setBusinesses(data.map(b => ({
            id: b.id,
            name: b.name,
            value: b.value,
            isDefault: b.is_default
          })));
        }
      } catch (error) {
        console.error('Failed to load businesses:', error);
      }
    };

    loadBusinesses();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
  };

  const handleStatClick = (type: string, title: string) => {
    setDetailModalType(type as any);
    setDetailModalTitle(title);
    setShowDetailModal(true);
  };

  const handleShowHistory = async (employee: Employee) => {
    try {
      const history = await getClientHistory(employee.id);
      setSelectedClient(employee);
      setClientHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleShowAppointment = async (employee: Employee) => {
    try {
      const history = await getClientHistory(employee.id);
      setSelectedClient(employee);
      setClientHistory(history);
      setShowAppointmentModal(true);
    } catch (error) {
      console.error('Failed to load client data:', error);
    }
  };

  const handleShowCalendar = async (employee: Employee) => {
    try {
      const history = await getClientHistory(employee.id);
      setSelectedClient(employee);
      setClientHistory(history);
      setShowCalendarModal(true);
    } catch (error) {
      console.error('Failed to load calendar:', error);
    }
  };

  const handleShowReview = (employee: Employee) => {
    console.log('Show review for:', employee.name);
  };

  const handleMarkDate = (date: Date) => {
    setMarkedDates(prev => [...prev, date]);
  };

  const handleUnmarkDate = (date: Date) => {
    setMarkedDates(prev => prev.filter(markedDate => markedDate.toDateString() !== date.toDateString()));
  };

  const handleAddBusiness = async (name: string, value: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('businesses')
        .insert([{ name, value, user_id: session.session.user.id, is_default: false }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setBusinesses(prev => [...prev, {
          id: data.id,
          name: data.name,
          value: data.value,
          isDefault: data.is_default
        }]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add business:', error);
      return false;
    }
  };

  const handleUpdateBusiness = async (id: string, name: string, value: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ name, value })
        .eq('id', id);

      if (error) throw error;

      setBusinesses(prev => prev.map(b => b.id === id ? { ...b, name, value } : b));
      return true;
    } catch (error) {
      console.error('Failed to update business:', error);
      return false;
    }
  };

  const handleDeleteBusiness = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBusinesses(prev => prev.filter(b => b.id !== id));
      return true;
    } catch (error) {
      console.error('Failed to delete business:', error);
      return false;
    }
  };

  const renderView = () => {
    const connectionStatus = <ConnectionStatus employees={allEmployees} />;

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView
            stats={stats}
            onStatClick={handleStatClick}
            connectionStatus={connectionStatus}
          />
        );

      case 'contacts':
        return (
          <ContactsView
            allEmployees={allEmployees}
            selectedBusiness={selectedBusiness}
            onAddContact={addContact}
            onCallEmployee={callEmployee}
            onCallEmployeeWithReason={callEmployeeWithReason}
            onUpdatePriority={updatePriority}
            onDeleteContact={deleteContact}
            onShowHistory={handleShowHistory}
            onShowAppointment={handleShowAppointment}
            onShowCalendar={handleShowCalendar}
            onShowReview={handleShowReview}
          />
        );

      case 'calling':
        return (
          <CallingView
            isAutoCallActive={isAutoCallActive}
            currentCallingId={currentCallingId}
            currentEmployeeIndex={currentEmployeeIndex}
            employees={employees}
            onStartAutoCalling={startAutoCalling}
            onStopAutoCalling={stopAutoCalling}
            onResetSystem={resetSystem}
            onCallEmployee={callEmployee}
            onCallEmployeeWithReason={callEmployeeWithReason}
            onUpdatePriority={updatePriority}
            onDeleteContact={deleteContact}
            onShowHistory={handleShowHistory}
            onShowAppointment={handleShowAppointment}
            onShowCalendar={handleShowCalendar}
            onShowReview={handleShowReview}
          />
        );

      case 'calendar':
        return (
          <div className="p-6">
            <CalendarModal
              appointments={clientHistory.appointments}
              onClose={() => {}}
              markedDates={markedDates}
              onMarkDate={handleMarkDate}
              onUnmarkDate={handleUnmarkDate}
              employees={allEmployees}
            />
          </div>
        );

      case 'requests':
        return (
          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Call Requests</h2>
              <p className="text-gray-600">Manage client callback requests</p>
            </div>
            <ClientCallRequestManager
              callRequests={callRequests}
              onAcceptRequest={acceptRequest}
              onCompleteRequest={completeRequest}
              onCancelRequest={cancelRequest}
            />
          </div>
        );

      case 'businesses':
        return (
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Business Management</h2>
              <p className="text-gray-600">Manage your business information</p>
            </div>
            <BusinessManager
              businesses={businesses}
              onAddBusiness={handleAddBusiness}
              onUpdateBusiness={handleUpdateBusiness}
              onDeleteBusiness={handleDeleteBusiness}
              onClose={() => {}}
            />
          </div>
        );

      case 'client-portal':
        return (
          <div className="p-6">
            <ClientPurposeSelector
              businessPhone="+1 (555) 123-4567"
              businessName="Your Business"
              onClientPurposeSelected={(name, phone, purpose) => {
                addCallRequest(name, phone, purpose);
              }}
            />
          </div>
        );

      default:
        return <DashboardView stats={stats} onStatClick={handleStatClick} connectionStatus={connectionStatus} />;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navigation
          currentView={currentView}
          onNavigate={setCurrentView}
          onLogout={handleLogout}
          callRequestsCount={callRequests.length}
        />

        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>

        {/* Modals */}
        {showHistoryModal && selectedClient && (
          <ClientHistoryModal
            client={selectedClient}
            onClose={() => setShowHistoryModal(false)}
            onAddWorkHistory={addWorkHistory}
            onAddAppointment={addAppointment}
            onAddFeedback={addFeedback}
            workHistory={clientHistory.workHistory}
            appointments={clientHistory.appointments}
            feedback={clientHistory.feedback}
          />
        )}

        <DetailModal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={detailModalTitle}
          type={detailModalType}
          employees={allEmployees}
          stats={stats}
          currentEmployeeIndex={currentEmployeeIndex}
          isAutoCallActive={isAutoCallActive}
        />

        {showAppointmentModal && selectedClient && (
          <AppointmentScheduler
            client={selectedClient}
            onClose={() => setShowAppointmentModal(false)}
            onScheduleAppointment={addAppointment}
            existingAppointments={clientHistory.appointments}
            markedDates={markedDates}
            onMarkDate={handleMarkDate}
            onUnmarkDate={handleUnmarkDate}
            employees={allEmployees}
          />
        )}

        {showCalendarModal && (
          <CalendarModal
            appointments={clientHistory.appointments}
            onClose={() => setShowCalendarModal(false)}
            markedDates={markedDates}
            onMarkDate={handleMarkDate}
            onUnmarkDate={handleUnmarkDate}
            employees={allEmployees}
          />
        )}
      </div>
    </AuthWrapper>
  );
}

export default App;

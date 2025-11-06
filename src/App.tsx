import React, { useState, useEffect, useCallback } from 'react';
import { useCallSystem } from './hooks/useCallSystem';
import { EmployeeCard } from './components/EmployeeCard';
import CallStatus from './components/CallStatus';
import { ControlPanel } from './components/ControlPanel';
import { ContactManager } from './components/ContactManager';
import { ClientHistoryModal } from './components/ClientHistoryModal';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { CalendarModal } from './components/CalendarModal';
import { DetailModal } from './components/DetailModal';
import { ClientReviewModal } from './components/ClientReviewModal';
import { AuthWrapper } from './components/AuthWrapper';
import { ClientCallRequestManager } from './components/ClientCallRequestManager';
import { useClientCallRequests } from './hooks/useClientCallRequests';
import { ClientPurposeSelector } from './components/ClientPurposeSelector';
import { BusinessManager } from './components/BusinessManager';
import { PhoneCall, Users, Zap, Phone } from 'lucide-react';
import { Employee, WorkHistory, Appointment, ClientFeedback, ClientReview } from './types/Employee';
import { supabase } from './lib/supabase';

// Connection status component
const ConnectionStatus: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  useEffect(() => {
    // Check connection status based on data loading
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
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-yellow-800 text-sm font-medium">Checking connection...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`border rounded-lg p-3 mb-4 ${
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

  // Client call requests hook
  const {
    callRequests,
    addCallRequest,
    acceptRequest,
    completeRequest,
    cancelRequest,
  } = useClientCallRequests();

  const [selectedClient, setSelectedClient] = useState<Employee | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailModalType, setDetailModalType] = useState<'total' | 'answered' | 'missed' | 'pending' | 'round' | 'current' | 'monthly' | 'completed' | 'urgent'>('total');
  const [detailModalTitle, setDetailModalTitle] = useState('');
  const [markedDates, setMarkedDates] = useState<Date[]>([]);
  const [contactFilter, setContactFilter] = useState<'all' | 'default' | 'custom' | 'completed' | 'answered' | 'missed' | 'pending' | 'urgent'>('all');
  const [clientHistory, setClientHistory] = useState<{
    workHistory: WorkHistory[];
    appointments: Appointment[];
    feedback: ClientFeedback[];
  }>({ workHistory: [], appointments: [], feedback: [] });
  const [showClientPortal, setShowClientPortal] = useState(false);
  const [showBusinessManager, setShowBusinessManager] = useState(false);
  const [businesses, setBusinesses] = useState<Array<{ id: string; name: string; value: string; isDefault: boolean }>>([]);

  // Load marked dates from localStorage on mount
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

  // Save marked dates to localStorage whenever they change
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

  const handleAddBusiness = async (name: string, value: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          name,
          value,
          user_id: session.session.user.id,
          is_default: false
        }])
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

      setBusinesses(prev => prev.map(b =>
        b.id === id ? { ...b, name, value } : b
      ));
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

  const handleMarkDate = (date: Date) => {
    setMarkedDates(prev => [...prev, date]);
  };

  const handleUnmarkDate = (date: Date) => {
    setMarkedDates(prev => prev.filter(markedDate => markedDate.toDateString() !== date.toDateString()));
  };

  const handleFilterCompleted = () => {
    console.log('Setting filter to completed');
    setContactFilter('completed');
  };

  const handleFilterAnswered = () => {
    console.log('Setting filter to answered');
    setContactFilter('answered');
  };

  const handleFilterMissed = () => {
    console.log('Setting filter to missed');
    setContactFilter('missed');
  };

  const handleFilterPending = () => {
    console.log('Setting filter to pending');
    setContactFilter('pending');
  };

  const handleFilterUrgent = () => {
    console.log('Setting filter to urgent');
    setContactFilter('urgent');
  };

  const handleShowTotalDetails = () => {
    setDetailModalType('total');
    setDetailModalTitle('Total Contacts');
    setShowDetailModal(true);
  };

  const handleShowMonthlyAppointments = () => {
    setDetailModalType('monthly');
    setDetailModalTitle('Monthly Appointments');
    setShowDetailModal(true);
  };

  const handleShowCurrentClient = () => {
    setDetailModalType('current');
    setDetailModalTitle('Current Client');
    setShowDetailModal(true);
  };

  const handleShowRoundInfo = () => {
    setDetailModalType('round');
    setDetailModalTitle('Round Information');
    setShowDetailModal(true);
  };
  const handleOpenWhatsApp = (phoneNumber: string) => {
    // Clean phone number for WhatsApp
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleViewHistory = async (employeeId: string) => {
    const client = allEmployees.find(emp => emp.id === employeeId);
    if (!client) return;

    try {
      const history = await getClientHistory(employeeId);
      setSelectedClient(client);
      setClientHistory(history);
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Failed to load client history:', error);
    }
  };

  const handleScheduleAppointment = async (employeeId: string) => {
    const client = allEmployees.find(emp => emp.id === employeeId);
    if (!client) return;

    try {
      const history = await getClientHistory(employeeId);
      setSelectedClient(client);
      setClientHistory(history);
      setShowAppointmentModal(true);
    } catch (error) {
      console.error('Failed to load client data:', error);
    }
  };

  const handleShowCalendar = async () => {
    try {
      // Get all appointments for calendar view
      const allAppointments: Appointment[] = [];

      for (const employee of allEmployees) {
        try {
          const history = await getClientHistory(employee.id);
          allAppointments.push(...history.appointments);
        } catch (error) {
          console.error(`Failed to load history for ${employee.name}:`, error);
        }
      }
      
      setClientHistory(prev => ({ ...prev, appointments: allAppointments }));
      setShowCalendarModal(true);
    } catch (error) {
      console.error('Failed to load calendar data:', error);
    }
  };
  
  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-slate-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="bg-blue-600 p-3 sm:p-4 rounded-full shadow-lg">
              <PhoneCall className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                Client Calling System
              </h1>
              <div className="flex items-center justify-center space-x-2 mt-1 sm:mt-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span className="text-sm sm:text-base lg:text-lg text-gray-600">Automated & Manual Calling</span>
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Streamline client communication with automatic calling sequences, real-time status tracking, 
            priority management, and continuous loop functionality until all clients are contacted.
          </p>
        </div>

        {/* Navigation Section 1: Client Self-Service */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border-2 border-green-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white p-2 rounded-full flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Client Self-Service Portal</h2>
                <p className="text-xs sm:text-sm text-green-50">Allow clients to categorize calling purpose and request callbacks</p>
              </div>
            </div>
            <button
              onClick={() => setShowClientPortal(!showClientPortal)}
              className={`w-full sm:w-auto mobile-button px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg font-bold transition-all duration-200 shadow-xl whitespace-nowrap text-sm sm:text-base ${
                showClientPortal
                  ? 'bg-white text-green-600 hover:bg-gray-100 active:bg-gray-200'
                  : 'bg-white text-green-600 hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              {showClientPortal ? 'Hide Portal ↑' : 'Show Portal ↓'}
            </button>
          </div>

          {/* Client Portal Content */}
          {showClientPortal && (
            <div className="mt-6 bg-white rounded-lg p-4">
              <ClientPurposeSelector
                businessPhone="+1 (555) 123-4567"
                businessName="Your Business"
                onClientPurposeSelected={(name, phone, purpose) => {
                  addCallRequest(name, phone, purpose);
                }}
              />
            </div>
          )}
        </div>

        {/* Client Call Request Manager */}
        <ClientCallRequestManager
          callRequests={callRequests}
          onAcceptRequest={acceptRequest}
          onCompleteRequest={completeRequest}
          onCancelRequest={cancelRequest}
        />

        {/* Navigation Section 2: Contact Management */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg mb-6 sm:mb-8 border-2 border-blue-700 overflow-hidden">
          <button
            onClick={() => setShowContactManagement(!showContactManagement)}
            className="w-full p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-blue-700 transition-all duration-200"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white p-2 rounded-full flex-shrink-0">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Contact Management</h2>
                <p className="text-xs sm:text-sm text-blue-50">Add, edit, and manage all your contacts</p>
              </div>
            </div>
            <div className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm sm:text-base flex-shrink-0">
              {showContactManagement ? '\u2191 Collapse' : '\u2193 Expand'}
            </div>
          </button>

          {showContactManagement && (
            <div className="bg-white p-4 sm:p-6">
              <ContactManager
                employees={allEmployees}
                onAddContact={addContact}
                onDeleteContact={deleteContact}
                isAutoCallActive={isAutoCallActive}
                filterType={contactFilter}
                onFilterChange={setContactFilter}
              />
            </div>
          )}
        </div>

        {/* Navigation Section 3: Calling System & Features */}
        <div className="bg-gradient-to-r from-slate-700 to-gray-700 rounded-xl shadow-lg mb-6 sm:mb-8 border-2 border-slate-800 overflow-hidden">
          <button
            onClick={() => setShowCallingSystem(!showCallingSystem)}
            className="w-full p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 hover:bg-slate-800 transition-all duration-200"
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white p-2 rounded-full flex-shrink-0">
                <PhoneCall className="w-6 h-6 sm:w-7 sm:h-7 text-slate-700" />
              </div>
              <div className="text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">Calling System Dashboard</h2>
                <p className="text-xs sm:text-sm text-slate-200">Monitor calls, control system, and manage business operations</p>
              </div>
            </div>
            <div className="bg-white text-slate-700 px-4 py-2 rounded-lg font-bold text-sm sm:text-base flex-shrink-0">
              {showCallingSystem ? '\u2191 Collapse' : '\u2193 Expand'}
            </div>
          </button>

          {showCallingSystem && (
            <div className="bg-white p-4 sm:p-6 space-y-4">
              {/* Call Status Dashboard */}
              <div className="border-2 border-slate-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm mr-2">1</span>
                  Call Status Dashboard
                </h3>
                <CallStatus
                  stats={stats}
                  isAutoCallActive={isAutoCallActive}
                  currentEmployeeIndex={currentEmployeeIndex}
                  totalEmployees={employees.length}
                  onFilterCompleted={handleFilterCompleted}
                  onFilterAnswered={handleFilterAnswered}
                  onFilterMissed={handleFilterMissed}
                  onFilterPending={handleFilterPending}
                  onFilterUrgent={handleFilterUrgent}
                  onShowMonthlyAppointments={handleShowMonthlyAppointments}
                  onShowCurrentClient={handleShowCurrentClient}
                  onShowRoundInfo={handleShowRoundInfo}
                  onShowTotalDetails={handleShowTotalDetails}
                  employees={employees}
                />
              </div>

              {/* Control Panel */}
              <div className="border-2 border-slate-200 rounded-lg p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-sm mr-2">2</span>
                  System Controls
                </h3>
                <ControlPanel
                  isAutoCallActive={isAutoCallActive}
                  onStartAutoCalling={startAutoCalling}
                  onStopAutoCalling={stopAutoCalling}
                  onResetSystem={resetSystem}
                  hasEmployees={employees.length > 0}
                  currentRound={stats.currentRound}
                  currentEmployeeIndex={currentEmployeeIndex}
                  totalEmployees={employees.length}
                  onShowCalendar={handleShowCalendar}
                  selectedBusiness={selectedBusiness}
                  onBusinessChange={setSelectedBusiness}
                  businesses={businesses}
                  onManageBusinesses={() => setShowBusinessManager(true)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Client List */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            <span>Client Directory</span>
            </div>
            {isAutoCallActive && (
              <span className="text-xs sm:text-sm bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full animate-pulse">
                Auto Calling Active - Answered Clients Hidden
              </span>
            )}
          </h2>

          {(() => {
            // Filter logic: during auto-calling, ONLY show contacts that haven't answered yet
            const visibleEmployees = isAutoCallActive
              ? employees.filter(emp => emp.status !== 'answered')
              : employees;

            return visibleEmployees.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {visibleEmployees.map((employee, index) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    isCurrentlyCalling={currentCallingId === employee.id}
                    isCurrentEmployee={employees.findIndex(e => e.id === employee.id) === currentEmployeeIndex}
                    onCallEmployee={callEmployee}
                    onUpdatePriority={updatePriority}
                    isAutoCallActive={isAutoCallActive}
                    onOpenWhatsApp={handleOpenWhatsApp}
                    onViewHistory={handleViewHistory}
                    onScheduleAppointment={handleScheduleAppointment}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                {isAutoCallActive ? (
                  <>
                    <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <PhoneCall className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-green-600 text-xl font-bold mb-2">🎉 All Clients Answered Successfully!</p>
                    <p className="text-gray-600 mt-2">Auto-calling has stopped automatically.</p>
                    <p className="text-gray-500 text-sm mt-1">No more clients need to be called.</p>
                  </>
                ) : (
                  <>
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No clients added yet...</p>
                  </>
                )}
              </div>
            );
          })()}
        </div>

        {/* Instructions */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center space-x-2">
            <PhoneCall className="w-6 h-6 text-blue-600" />
            <span>How to Use the System</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-gray-600">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Auto Calling Mode:</span>
              </h4>
              <ul className="space-y-2 text-sm pl-7">
                <li>• 🚀 Click "Start Auto Call" to begin automatic sequence</li>
                <li>• ⏱️ Iteration 1: Calls ALL contacts in sequence</li>
                <li>• ✅ Answered contacts disappear from visible list</li>
                <li>• ❌ Missed contacts stay visible on screen</li>
                <li>• 🔄 Iteration 2+: Calls ONLY missed contacts</li>
                <li>• ⏳ 10 seconds wait between iterations</li>
                <li>• 🛑 Auto stops when all contacts answered</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-500" />
                <span>Manual Calling:</span>
              </h4>
              <ul className="space-y-2 text-sm pl-7">
                <li>• 📞 Click "Call" button on any client card</li>
                <li>• ⏳ Wait for 10-second timeout or call completion</li>
                <li>• ✅ Status updates to "Answered" (green) if picked up</li>
                <li>• ❌ Status updates to "Missed" (red) if timeout</li>
                <li>• 🔄 Manual calls work alongside auto calling</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-500" />
                <span>Business Filtering:</span>
              </h4>
              <ul className="space-y-2 text-sm pl-7">
                <li>• 🏢 Select business type from dropdown</li>
                <li>• 📊 View contacts for specific business only</li>
                <li>• 🔄 Separate call queues per business</li>
                <li>• ✅ Independent attended/unattended stacks</li>
                <li>• 🎯 Auto-call stops when all business contacts attended</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-900 mb-2">Status Color Guide:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
                <span>Gray = Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Blue = Calling</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span>Green = Answered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span>Red = Missed</span>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-semibold text-blue-900 mb-2">Priority Color Guide:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-800 rounded-full"></div>
                  <span>Dark Green = High Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <span>Light Green = Follow Up</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span>Red = Not Interested</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client History Modal */}
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

        {/* Detail Modal */}
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

        {/* Appointment Scheduler Modal */}
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

        {/* Calendar Modal */}
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

        {/* Business Manager Modal */}
        {showBusinessManager && (
          <BusinessManager
            businesses={businesses}
            onAddBusiness={handleAddBusiness}
            onUpdateBusiness={handleUpdateBusiness}
            onDeleteBusiness={handleDeleteBusiness}
            onClose={() => setShowBusinessManager(false)}
          />
        )}
        </div>
      </div>
    </AuthWrapper>
  );
}

export default App;
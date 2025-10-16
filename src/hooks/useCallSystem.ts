import { useState, useCallback, useRef, useEffect } from 'react';
import { Employee, CallSystemStats, WorkHistory, Appointment, ClientFeedback } from '../types/Employee';
import { SupabaseService } from '../services/supabaseService';

export const useCallSystem = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('all');
  const [isAutoCallActive, setIsAutoCallActive] = useState(false);
  const [currentCallingId, setCurrentCallingId] = useState<string | null>(null);
  const [currentEmployeeIndex, setCurrentEmployeeIndex] = useState(0);
  const [stats, setStats] = useState<CallSystemStats>({
    totalEmployees: 0,
    answered: 0,
    missed: 0,
    pending: 0,
    currentRound: 1,
    monthlyAppointments: 0,
    completedWork: 0,
    urgentClients: 0,
  });

  const supabaseService = SupabaseService.getInstance();
  const autoCallTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoCallingRef = useRef(false);
  const calledIdsInRoundRef = useRef<Set<string>>(new Set());
  const employeesRef = useRef<Employee[]>([]);

  // Load employees on mount
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('🔄 Initializing calling system...');
        await loadEmployees();
        console.log('✅ Calling system initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize calling system:', error);
      }
    };
    
    initializeSystem();
  }, []);

  // Filter employees by selected business
  const filteredEmployees = selectedBusiness === 'all'
    ? employees
    : employees.filter(emp => emp.business === selectedBusiness);

  // Update stats and ref whenever employees change
  useEffect(() => {
    employeesRef.current = filteredEmployees;
    updateStats();
  }, [employees, selectedBusiness]);

  // Load monthly appointments count
  useEffect(() => {
    const loadMonthlyStats = async () => {
      try {
        const monthlyAppointments = await supabaseService.getMonthlyAppointments();
        setStats(prev => ({ ...prev, monthlyAppointments }));
      } catch (error) {
        console.error('Failed to load monthly stats:', error);
      }
    };
    loadMonthlyStats();
  }, []);

  const loadEmployees = async () => {
    try {
      console.log('🔄 Loading employees from database...');
      const employeeData = await supabaseService.getClients();
      console.log(`✅ Loaded ${employeeData.length} employees from database`);
      setEmployees(employeeData);
    } catch (error) {
      console.error('Failed to load employees:', error);
      // If Supabase is not connected or tables don't exist, show empty state
      if (error instanceof Error && (
        error.message.includes('connect to Supabase') ||
        error.message.includes('Database tables not found')
      )) {
        setEmployees([]);
        // Show user-friendly message for missing tables
        if (error.message.includes('Database tables not found')) {
          console.warn('⚠️ Database tables not found - please run migrations');
        }
      }
    }
  };

  const updateStats = () => {
    const totalEmployees = filteredEmployees.length;
    const answered = filteredEmployees.filter(emp => emp.status === 'answered').length;
    const missed = filteredEmployees.filter(emp => emp.status === 'missed').length;
    const pending = filteredEmployees.filter(emp => emp.status === 'pending').length;
    const urgentClients = filteredEmployees.filter(emp => emp.isUrgent).length;
    const completedWork = filteredEmployees.filter(emp => emp.workStatus === 'completed').length;

    setStats(prev => ({
      ...prev,
      totalEmployees,
      answered,
      missed,
      pending,
      urgentClients,
      completedWork,
    }));
  };

  const updateEmployeeStatus = async (employeeId: string, status: Employee['status']) => {
    // Update local state immediately
    setEmployees(prev =>
      prev.map(emp => {
        if (emp.id === employeeId) {
          return {
            ...emp,
            status,
            lastCallTime: new Date(),
            callAttempts: status === 'calling' ? emp.callAttempts : emp.callAttempts + 1
          };
        }
        return emp;
      })
    );

    // Persist to database
    try {
      await supabaseService.updateClientStatus(employeeId, status);
    } catch (error) {
      console.error('Failed to update status in database:', error);
    }
  };

  const callEmployee = useCallback(async (employeeId: string): Promise<boolean> => {
    return callEmployeeWithReason(employeeId, 'general_check_in');
  }, []);

  const callEmployeeWithReason = useCallback(async (employeeId: string, reason: string): Promise<boolean> => {
    try {
      console.log(`📞 Calling employee ${employeeId} - Reason: ${reason}`);
      
      // Set calling status
      await updateEmployeeStatus(employeeId, 'calling');
      setCurrentCallingId(employeeId);

      // Create promise with 10-second timeout
      const callResult = await new Promise<boolean>((resolve) => {
        let resolved = false;
        
        // 10-second timeout
        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log(`⏰ Timeout for employee ${employeeId}`);
            resolve(false);
          }
        }, 10000);
        
        // API call
        supabaseService.callClient(employeeId).then(result => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            console.log(`✅ Call result for ${employeeId}: ${result.answered}`);
            resolve(result.answered);
          }
        }).catch(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(false);
          }
        });
      });
      
      // Update final status
      const finalStatus = callResult ? 'answered' : 'missed';
      // Update employee with call reason
      setEmployees(prev =>
        prev.map(emp => {
          if (emp.id === employeeId) {
            return {
              ...emp,
              status: finalStatus,
              lastCallTime: new Date(),
              callAttempts: emp.callAttempts + 1,
              lastCallReason: reason
            };
          }
          return emp;
        })
      );
      setCurrentCallingId(null);
      
      return callResult;
    } catch (error) {
      console.error('Call failed:', error);
      await updateEmployeeStatus(employeeId, 'missed');
      setCurrentCallingId(null);
      return false;
    }
  }, []);

  const stopAutoCalling = useCallback(() => {
    console.log('🛑 Stopping auto calling');
    setIsAutoCallActive(false);
    isAutoCallingRef.current = false;
    
    if (autoCallTimeoutRef.current) {
      clearTimeout(autoCallTimeoutRef.current);
      autoCallTimeoutRef.current = null;
    }
    
    setCurrentCallingId(null);
  }, []);

  const processAutoCall = useCallback(async () => {
    if (!isAutoCallingRef.current) {
      console.log('🛑 Auto calling stopped');
      return;
    }

    // Get FRESH employee list from ref
    const currentEmployees = employeesRef.current;

    if (currentEmployees.length === 0) {
      console.log('🛑 No employees');
      return;
    }

    // Separate employees into two stacks:
    // 1. Attended stack (answered)
    // 2. Unattended stack (not answered yet)
    const attendedStack = currentEmployees.filter(emp => emp.status === 'answered');
    const unattendedStack = currentEmployees.filter(emp => emp.status !== 'answered');

    // Get employees that need to be called in this round (not yet called in this round)
    let employeesToCall = unattendedStack.filter(emp =>
      !calledIdsInRoundRef.current.has(emp.id)
    );

    console.log(`\n📋 Current status:`);
    console.log(`   Total clients: ${currentEmployees.length}`);
    console.log(`   ✅ Attended stack (answered): ${attendedStack.length}`);
    console.log(`   ⏳ Unattended stack (not answered): ${unattendedStack.length}`);
    console.log(`   Already called this round: ${calledIdsInRoundRef.current.size}`);
    console.log(`   Remaining to call this round: ${employeesToCall.length}`);

    // Check if we need to start a new round
    if (employeesToCall.length === 0) {
      // Check if all clients have been attended
      if (unattendedStack.length === 0) {
        // 🎉 SUCCESS: All clients attended!
        console.log(`\n✅ ALL CLIENTS ATTENDED!`);
        console.log(`\n📊 FINAL SUMMARY:`);
        console.log(`   Total clients: ${currentEmployees.length}`);
        console.log(`   Attended (answered): ${attendedStack.length}`);
        console.log(`   Unattended (not answered): ${unattendedStack.length}`);
        console.log(`   Total rounds completed: ${stats.currentRound}`);

        alert(
          `🎉 ALL CONTACTS ATTENDED!\n\n` +
          `✅ Every client has been successfully reached and answered.\n\n` +
          `📊 FINAL SUMMARY:\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Total clients: ${currentEmployees.length}\n` +
          `✅ Attended (answered): ${attendedStack.length}\n` +
          `❌ Unattended: ${unattendedStack.length}\n` +
          `Total rounds completed: ${stats.currentRound}\n\n` +
          `All contacts have been attended to!\n` +
          `The auto-calling system has stopped.`
        );

        stopAutoCalling();
        calledIdsInRoundRef.current.clear();
        return;
      } else {
        // Start new round - only call unattended employees
        const nextRound = stats.currentRound + 1;
        console.log(`\n✅ Round ${stats.currentRound} complete. Starting round ${nextRound}...`);
        console.log(`📋 Attended stack: ${attendedStack.length} clients (removed from calling queue)`);
        console.log(`📋 Unattended stack: ${unattendedStack.length} clients (will be called in next round)`);
        console.log(`📝 Clearing called IDs tracker for new round`);
        setStats(prev => ({ ...prev, currentRound: nextRound }));
        calledIdsInRoundRef.current.clear(); // Clear for new round

        autoCallTimeoutRef.current = setTimeout(() => {
          if (isAutoCallingRef.current) {
            processAutoCall();
          }
        }, 2000);
        return;
      }
    }

    // 📞 Call the next employee (always the first in the filtered list)
    const currentEmployee = employeesToCall[0];
    if (!currentEmployee) {
      console.log(`❌ No employee found to call`);
      return;
    }

    // 🛡️ SAFETY CHECK: Never call someone who already answered (shouldn't happen with filter)
    if (currentEmployee.status === 'answered') {
      console.log(`⚠️ SKIPPING ${currentEmployee.name} - Already answered!`);
      calledIdsInRoundRef.current.add(currentEmployee.id);
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall();
        }
      }, 100);
      return;
    }

    // Check if already called (shouldn't happen with filter)
    if (calledIdsInRoundRef.current.has(currentEmployee.id)) {
      console.log(`⚠️ SKIPPING ${currentEmployee.name} - Already called in this round!`);
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall();
        }
      }, 100);
      return;
    }

    // Find actual index in full employees array for UI updates
    const actualIndex = currentEmployees.findIndex(emp => emp.id === currentEmployee.id);
    if (actualIndex === -1) {
      console.log(`❌ Employee ${currentEmployee.name} not found in main list`);
      calledIdsInRoundRef.current.add(currentEmployee.id);
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall();
        }
      }, 1000);
      return;
    }

    // Mark this person as being called in this round
    calledIdsInRoundRef.current.add(currentEmployee.id);

    console.log(`\n📞 Calling: ${currentEmployee.name} (${currentEmployee.phoneNumber})`);
    console.log(`   Current status: ${currentEmployee.status}`);
    console.log(`   Remaining in unattended stack: ${unattendedStack.length}`);
    console.log(`   Round: ${stats.currentRound}`);

    setCurrentEmployeeIndex(actualIndex);

    try {
      // Set status to calling
      await updateEmployeeStatus(currentEmployee.id, 'calling');
      setCurrentCallingId(currentEmployee.id);

      // Simulate call with 10-second timeout
      const callResult = await new Promise<boolean>((resolve) => {
        let resolved = false;

        const timeoutId = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            console.log(`⏰ Timeout: ${currentEmployee.name} did not answer (10 seconds)`);
            resolve(false);
          }
        }, 10000);

        // Simulate realistic call duration (2-8 seconds)
        const callDuration = 2000 + Math.random() * 6000;
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timeoutId);
            // 70% chance of answering
            const answered = Math.random() > 0.3;
            resolve(answered);
          }
        }, callDuration);
      });

      // Update final status based on result
      const finalStatus = callResult ? 'answered' : 'missed';
      await updateEmployeeStatus(currentEmployee.id, finalStatus);
      setCurrentCallingId(null);

      if (callResult) {
        console.log(`✅ Result: ${currentEmployee.name} ANSWERED`);
        console.log(`📤 ${currentEmployee.name} moved to ATTENDED STACK`);
        console.log(`👋 ${currentEmployee.name} removed from unattended calling queue`);
      } else {
        console.log(`❌ Result: ${currentEmployee.name} MISSED`);
        console.log(`📌 ${currentEmployee.name} remains in UNATTENDED STACK for retry in next round`);
      }

    } catch (error) {
      console.error(`❌ Error calling ${currentEmployee.name}:`, error);
      await updateEmployeeStatus(currentEmployee.id, 'missed');
      setCurrentCallingId(null);
    }

    // After call completes, move to next person
    if (isAutoCallingRef.current) {
      console.log(`⏱️ Waiting 10 seconds before next call...`);
      autoCallTimeoutRef.current = setTimeout(() => {
        if (isAutoCallingRef.current) {
          processAutoCall();
        }
      }, 10000);
    }
  }, [stopAutoCalling, stats.currentRound, updateEmployeeStatus, setStats]);

  const startAutoCalling = useCallback(() => {
    if (isAutoCallActive) {
      console.log('⚠️ Auto calling already active');
      return;
    }

    if (filteredEmployees.length === 0) {
      const businessName = selectedBusiness === 'all' ? 'any business' : selectedBusiness.replace('_', ' ');
      alert(`❌ No contacts found for ${businessName}. Please add contacts or select a different business.`);
      return;
    }

    const businessName = selectedBusiness === 'all' ? 'all businesses' : selectedBusiness.replace('_', ' ');
    console.log('\n🤖 AUTO-CALLING MANAGER BOT ACTIVATED');
    console.log('═══════════════════════════════════════');
    console.log(`📋 Business: ${businessName}`);
    console.log(`📋 Total clients: ${filteredEmployees.length}`);
    console.log(`\n📖 TWO-STACK LOGIC:`);
    console.log(`   1. Round 1: Call all clients one by one`);
    console.log(`   2. Answered → moved to ATTENDED STACK (removed from queue)`);
    console.log(`   3. Missed → kept in UNATTENDED STACK (retry next round)`);
    console.log(`   4. Wait 10 seconds between each call`);
    console.log(`   5. Round 2+: call only UNATTENDED STACK clients`);
    console.log(`   6. Auto stop when UNATTENDED STACK becomes empty`);
    console.log(`   7. Alert shown when all contacts attended`);
    console.log('═══════════════════════════════════════\n');

    setIsAutoCallActive(true);
    isAutoCallingRef.current = true;
    calledIdsInRoundRef.current.clear();

    setStats(prev => ({ ...prev, currentRound: 1 }));
    setCurrentEmployeeIndex(0);

    autoCallTimeoutRef.current = setTimeout(() => {
      if (isAutoCallingRef.current) {
        processAutoCall();
      }
    }, 2000);
  }, [filteredEmployees, selectedBusiness, isAutoCallActive, processAutoCall]);

  const resetSystem = async () => {
    console.log('🔄 Resetting automatic calling system');
    stopAutoCalling();
    try {
      await supabaseService.resetAllStatuses();
      await loadEmployees();
      setCurrentEmployeeIndex(0);
      setStats(prev => ({ ...prev, currentRound: 1 }));
      console.log('✅ System reset complete - ready for new calling session');
    } catch (error) {
      console.error('❌ Failed to reset system:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCallTimeoutRef.current) {
        clearTimeout(autoCallTimeoutRef.current);
      }
    };
  }, []);

  const addContact = async (contactData: {
    name: string;
    phoneNumber: string;
    whatsappNumber?: string;
    workStatus?: 'new' | 'in_progress' | 'completed' | 'repeat_client';
    isUrgent?: boolean;
    business?: 'real_estate' | 'finance' | 'education' | 'healthcare' | 'technology' | 'retail' | 'other';
  }): Promise<boolean> => {
    try {
      const newContact = await supabaseService.addClient(contactData);
      // Use functional update to ensure we have the latest state
      setEmployees(prev => {
        // Double-check for duplicates before adding
        const phoneExists = prev.some(emp => emp.phoneNumber === newContact.phoneNumber);
        
        if (phoneExists) {
          throw new Error('Phone number already exists');
        }
        
        return [...prev, newContact];
      });
      return true;
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw error;
    }
  };

  const deleteContact = async (employeeId: string): Promise<boolean> => {
    try {
      await supabaseService.deleteClient(employeeId);
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
      return true;
    } catch (error) {
      console.error('Failed to delete contact:', error);
      throw error;
    }
  };

  const updatePriority = async (employeeId: string, priority: 'high' | 'follow-up' | 'not-interested'): Promise<void> => {
    try {
      await supabaseService.updateClientPriority(employeeId, priority);
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === employeeId ? { ...emp, priority } : emp
        )
      );
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  // New methods for advanced features
  const addWorkHistory = async (clientId: string, workData: Omit<WorkHistory, 'id' | 'clientId'>): Promise<void> => {
    try {
      await supabaseService.addWorkHistory(clientId, workData);
      // Update client work status if completed
      if (workData.status === 'completed') {
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === clientId ? { ...emp, workStatus: 'completed' } : emp
          )
        );
      }
    } catch (error) {
      console.error('Failed to add work history:', error);
      throw error;
    }
  };

  const addAppointment = async (clientId: string, appointmentData: Omit<Appointment, 'id' | 'clientId'>): Promise<void> => {
    try {
      await supabaseService.addAppointment(clientId, appointmentData);
      // Refresh monthly appointments count
      const monthlyAppointments = await supabaseService.getMonthlyAppointments();
      setStats(prev => ({ ...prev, monthlyAppointments }));
    } catch (error) {
      console.error('Failed to add appointment:', error);
      throw error;
    }
  };

  const addFeedback = async (clientId: string, feedbackData: Omit<ClientFeedback, 'id' | 'clientId'>): Promise<void> => {
    try {
      await supabaseService.addFeedback(clientId, feedbackData);
    } catch (error) {
      console.error('Failed to add feedback:', error);
      throw error;
    }
  };

  const getClientHistory = async (clientId: string) => {
    try {
      const [workHistory, appointments, feedback] = await Promise.all([
        supabaseService.getWorkHistory(clientId),
        supabaseService.getAppointments(clientId),
        supabaseService.getFeedback(clientId),
      ]);
      return { workHistory, appointments, feedback };
    } catch (error) {
      console.error('Failed to get client history:', error);
      throw error;
    }
  };

  return {
    employees: filteredEmployees,
    allEmployees: employees,
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
    loadEmployees,
    addContact,
    deleteContact,
    updatePriority,
    addWorkHistory,
    addAppointment,
    addFeedback,
    getClientHistory,
  };
};
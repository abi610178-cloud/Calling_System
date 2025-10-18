import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { supabase } from './lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Business {
  id: string;
  name: string;
  value: string;
  isDefault: boolean;
}

interface Employee {
  id: string;
  name: string;
  phoneNumber: string;
  whatsappNumber?: string;
  status: 'pending' | 'calling' | 'answered' | 'missed';
  priority?: 'high' | 'follow-up' | 'not-interested';
  callAttempts: number;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    setIsLoading(false);

    if (session) {
      loadBusinesses();
      loadEmployees();
    }
  };

  const loadBusinesses = async () => {
    try {
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

  const loadEmployees = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setEmployees(data.map(emp => ({
          id: emp.id,
          name: emp.name,
          phoneNumber: emp.phone_number,
          whatsappNumber: emp.whatsapp_number,
          status: emp.status || 'pending',
          priority: emp.priority,
          callAttempts: emp.call_attempts || 0
        })));
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setIsAuthenticated(true);
      loadBusinesses();
      loadEmployees();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleSignup = async () => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      Alert.alert('Success', 'Account created! Please log in.');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmployees([]);
    setBusinesses([]);
  };

  const handleAddContact = async () => {
    if (!newContactName || !newContactPhone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('employees')
        .insert([{
          name: newContactName,
          phone_number: newContactPhone,
          user_id: session.user.id,
          status: 'pending',
          call_attempts: 0
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setEmployees([...employees, {
          id: data.id,
          name: data.name,
          phoneNumber: data.phone_number,
          status: 'pending',
          callAttempts: 0
        }]);

        setNewContactName('');
        setNewContactPhone('');
        setShowAddContact(false);
        Alert.alert('Success', 'Contact added!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanNumber}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.authContainer}>
          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Client Calling System</Text>
            <Text style={styles.authSubtitle}>Sign in to continue</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Client Calling</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacts ({employees.length})</Text>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddContact(!showAddContact)}
          >
            <Text style={styles.addButtonText}>
              {showAddContact ? 'Cancel' : '+ Add Contact'}
            </Text>
          </TouchableOpacity>

          {showAddContact && (
            <View style={styles.addContactForm}>
              <TextInput
                style={styles.input}
                placeholder="Contact Name"
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleAddContact}>
                <Text style={styles.primaryButtonText}>Save Contact</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.contactList}>
          {employees.map((employee) => (
            <View key={employee.id} style={styles.contactCard}>
              <View style={styles.contactHeader}>
                <Text style={styles.contactName}>{employee.name}</Text>
                <View style={[styles.statusBadge, styles[`status${employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}`]]}>
                  <Text style={styles.statusText}>{employee.status}</Text>
                </View>
              </View>

              <Text style={styles.contactPhone}>{employee.phoneNumber}</Text>

              <View style={styles.contactActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleCall(employee.phoneNumber)}
                >
                  <Text style={styles.actionButtonText}>📞 Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.whatsappButton]}
                  onPress={() => handleWhatsApp(employee.phoneNumber)}
                >
                  <Text style={styles.actionButtonText}>💬 WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {employees.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No contacts yet</Text>
              <Text style={styles.emptyStateSubtext}>Add your first contact to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  authCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  authSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#2563eb',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addContactForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactList: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusCalling: {
    backgroundColor: '#dbeafe',
  },
  statusAnswered: {
    backgroundColor: '#d1fae5',
  },
  statusMissed: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  contactPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#2563eb',
  },
  whatsappButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

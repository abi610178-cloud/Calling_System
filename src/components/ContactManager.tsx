import React, { useState } from 'react';
import { UserPlus, Users, Search, Filter, Trash2, Edit } from 'lucide-react';
import { Employee } from '../types/Employee';
import { ContactForm } from './ContactForm';

interface ContactManagerProps {
  employees: Employee[];
  onAddContact: (contact: {
    name: string;
    phoneNumber: string;
  }) => Promise<boolean>;
  onDeleteContact: (employeeId: string) => Promise<boolean>;
  isAutoCallActive: boolean;
  filterType?: 'all' | 'default' | 'custom' | 'completed' | 'answered' | 'missed' | 'pending' | 'urgent';
  onFilterChange?: (filterType: 'all' | 'default' | 'custom' | 'completed' | 'answered' | 'missed' | 'pending' | 'urgent') => void;
}

export const ContactManager: React.FC<ContactManagerProps> = ({
  employees,
  onAddContact,
  onDeleteContact,
  isAutoCallActive,
  filterType = 'all',
  onFilterChange,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use external filter type or default to 'all'
  const currentFilterType = filterType;
  const handleFilterChange = onFilterChange || (() => {});

  const userAddedEmployees = employees.filter(emp => !emp.isDefault);

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.phoneNumber.includes(searchTerm) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesFilter = false;
    switch (currentFilterType) {
      case 'all':
        matchesFilter = true;
        break;
      case 'custom':
        matchesFilter = !emp.isDefault;
        break;
      case 'completed':
        matchesFilter = emp.workStatus === 'completed';
        break;
      case 'answered':
        matchesFilter = emp.status === 'answered';
        break;
      case 'missed':
        matchesFilter = emp.status === 'missed';
        break;
      case 'pending':
        matchesFilter = emp.status === 'pending';
        break;
      case 'urgent':
        matchesFilter = emp.isUrgent === true;
        break;
      default:
        matchesFilter = true;
    }

    return matchesSearch && matchesFilter;
  });

  const handleDeleteContact = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await onDeleteContact(employeeId);
      } catch (error) {
        console.error('Failed to delete contact:', error);
        alert('Failed to delete contact. Please try again.');
      }
    }
  };

  const handleAddContact = async (contactData: {
    name: string;
    phoneNumber: string;
  }) => {
    try {
      const success = await onAddContact(contactData);
      if (success) {
        // Force a small delay to ensure state updates
        setTimeout(() => {
          setShowForm(false);
        }, 100);
      }
      return success;
    } catch (error) {
      throw error; // Re-throw to let form handle the error
    }
  };
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="bg-blue-100 p-2 rounded-full flex-shrink-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Contact Management</h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {userAddedEmployees.length} contacts added
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          disabled={isAutoCallActive}
          className="w-full sm:w-auto mobile-button-primary disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-md hover:shadow-lg text-sm sm:text-base"
        >
          <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts by name, phone, email, position, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mobile-input text-sm sm:text-base pl-10 pr-4"
          />
        </div>
        
        <div className="relative">
          <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <select
            value={currentFilterType}
            onChange={(e) => handleFilterChange(e.target.value as 'all' | 'default' | 'custom' | 'completed' | 'answered' | 'missed' | 'pending' | 'urgent')}
            className="w-full mobile-input text-sm sm:text-base pl-10 pr-8 bg-white"
          >
            <option value="all">All Contacts</option>
            <option value="custom">Custom Contacts</option>
            <option value="completed">Completed Work</option>
            <option value="answered">Answered Calls</option>
            <option value="missed">Missed Calls</option>
            <option value="pending">Pending Calls</option>
            <option value="urgent">Urgent Contacts</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center border border-blue-200">
          <div className="text-xl sm:text-2xl font-bold text-blue-800">{employees.length}</div>
          <div className="text-xs sm:text-sm text-blue-600">Total Contacts</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center border border-blue-200">
          <div className="text-xl sm:text-2xl font-bold text-blue-800">{userAddedEmployees.length}</div>
          <div className="text-xs sm:text-sm text-blue-600">Added</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 text-center border border-yellow-200">
          <div className="text-xl sm:text-2xl font-bold text-yellow-800">{filteredEmployees.length}</div>
          <div className="text-xs sm:text-sm text-yellow-600">Filtered</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center border border-green-200">
          <div className="text-xl sm:text-2xl font-bold text-green-800">
            {employees.filter(emp => emp.status === 'answered').length}
          </div>
          <div className="text-xs sm:text-sm text-green-600">Answered</div>
        </div>
      </div>

      {/* Contact List */}
      {filteredEmployees.length > 0 ? (
        <div className="space-y-3">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="p-3 sm:p-4 border rounded-lg transition-all duration-200 bg-blue-50 border-blue-200 hover:bg-blue-100 active:bg-blue-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{employee.name}</h3>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Contact
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'answered' ? 'bg-green-100 text-green-800' :
                      employee.status === 'missed' ? 'bg-red-100 text-red-800' :
                      employee.status === 'calling' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.status}
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>📞 {employee.phoneNumber}</div>
                    <div>👤 {employee.name}</div>
                  </div>
                  
                  {employee.callAttempts > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Call attempts: {employee.callAttempts}
                      {employee.lastCallTime && (
                        <span className="ml-2">
                          Last call: {employee.lastCallTime.toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleDeleteContact(employee.id)}
                    disabled={isAutoCallActive}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm || filterType !== 'all' 
              ? 'No contacts match your search criteria' 
              : 'No contacts added yet. Click "Add Contact" to get started.'}
          </p>
        </div>
      )}

      {/* Contact Form Modal */}
      {showForm && (
        <ContactForm
          employees={employees}
          onAddContact={handleAddContact}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
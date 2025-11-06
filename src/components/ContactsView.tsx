import React, { useState } from 'react';
import { Users, UserPlus, Filter } from 'lucide-react';
import { ContactManager } from './ContactManager';
import { EmployeeCard } from './EmployeeCard';
import { Employee } from '../types/Employee';

interface ContactsViewProps {
  allEmployees: Employee[];
  selectedBusiness: string;
  onAddContact: (data: any) => Promise<void>;
  onCallEmployee: (id: string) => void;
  onCallEmployeeWithReason: (id: string, reason: string) => void;
  onUpdatePriority: (id: string, priority: 'high' | 'follow-up' | 'not-interested') => void;
  onDeleteContact: (id: string) => void;
  onShowHistory: (employee: Employee) => void;
  onShowAppointment: (employee: Employee) => void;
  onShowCalendar: (employee: Employee) => void;
  onShowReview: (employee: Employee) => void;
}

export const ContactsView: React.FC<ContactsViewProps> = ({
  allEmployees,
  selectedBusiness,
  onAddContact,
  onCallEmployee,
  onCallEmployeeWithReason,
  onUpdatePriority,
  onDeleteContact,
  onShowHistory,
  onShowAppointment,
  onShowCalendar,
  onShowReview,
}) => {
  const [contactFilter, setContactFilter] = useState<'all' | 'default' | 'custom' | 'completed' | 'answered' | 'missed' | 'pending' | 'urgent'>('all');

  const getFilteredContacts = () => {
    switch (contactFilter) {
      case 'default':
        return allEmployees.filter(e => e.isDefault);
      case 'custom':
        return allEmployees.filter(e => !e.isDefault);
      case 'completed':
        return allEmployees.filter(e => e.workStatus === 'completed');
      case 'answered':
        return allEmployees.filter(e => e.status === 'answered');
      case 'missed':
        return allEmployees.filter(e => e.status === 'missed');
      case 'pending':
        return allEmployees.filter(e => e.status === 'pending');
      case 'urgent':
        return allEmployees.filter(e => e.isUrgent);
      default:
        return allEmployees;
    }
  };

  const filteredContacts = getFilteredContacts();

  const filterOptions = [
    { value: 'all', label: 'All Contacts' },
    { value: 'default', label: 'Default Contacts' },
    { value: 'custom', label: 'Custom Contacts' },
    { value: 'completed', label: 'Completed' },
    { value: 'answered', label: 'Answered' },
    { value: 'missed', label: 'Missed' },
    { value: 'pending', label: 'Pending' },
    { value: 'urgent', label: 'Urgent' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Contact Management</h2>
            <p className="text-gray-600">Add, edit, and organize your contacts</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{allEmployees.length}</div>
            <div className="text-sm text-gray-600">Total Contacts</div>
          </div>
        </div>
      </div>

      {/* Add Contact Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-green-100 p-2 rounded-lg">
            <UserPlus className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Add New Contact</h3>
        </div>
        <ContactManager
          onAddContact={onAddContact}
          selectedBusiness={selectedBusiness}
        />
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Filter Contacts</h3>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredContacts.length} of {allEmployees.length} contacts
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setContactFilter(option.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                contactFilter === option.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Contact List</h3>
            <p className="text-sm text-gray-600">{filteredContacts.length} contacts displayed</p>
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No contacts found</p>
            <p className="text-sm text-gray-400">
              {contactFilter === 'all'
                ? 'Add your first contact using the form above'
                : 'Try changing the filter or add new contacts'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContacts.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                isCalling={false}
                onCall={onCallEmployee}
                onCallWithReason={onCallEmployeeWithReason}
                onUpdatePriority={onUpdatePriority}
                onDelete={onDeleteContact}
                onShowHistory={onShowHistory}
                onShowAppointment={onShowAppointment}
                onShowCalendar={onShowCalendar}
                onShowReview={onShowReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

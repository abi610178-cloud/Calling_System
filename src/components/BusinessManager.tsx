import React, { useState } from 'react';
import { Building2, Plus, Trash2, X, Edit2, Check } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  value: string;
  isDefault: boolean;
}

interface BusinessManagerProps {
  businesses: Business[];
  onAddBusiness: (name: string, value: string) => Promise<boolean>;
  onUpdateBusiness: (id: string, name: string, value: string) => Promise<boolean>;
  onDeleteBusiness: (id: string) => Promise<boolean>;
  onClose: () => void;
}

export const BusinessManager: React.FC<BusinessManagerProps> = ({
  businesses,
  onAddBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
  onClose,
}) => {
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editValue, setEditValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const generateValue = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  };

  const handleNameChange = (name: string) => {
    setNewName(name);
    setNewValue(generateValue(name));
  };

  const handleAddBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newName.trim() || !newValue.trim()) {
      setError('Business name is required');
      return;
    }

    if (businesses.some(b => b.value === newValue)) {
      setError('A business with this name already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddBusiness(newName.trim(), newValue);
      if (success) {
        setNewName('');
        setNewValue('');
      } else {
        setError('Failed to add business. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (business: Business) => {
    setEditingId(business.id);
    setEditName(business.name);
    setEditValue(business.value);
    setError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditValue('');
    setError('');
  };

  const handleUpdateBusiness = async (id: string) => {
    setError('');

    if (!editName.trim() || !editValue.trim()) {
      setError('Business name is required');
      return;
    }

    if (businesses.some(b => b.id !== id && b.value === editValue)) {
      setError('A business with this name already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdateBusiness(id, editName.trim(), editValue);
      if (success) {
        setEditingId(null);
        setEditName('');
        setEditValue('');
      } else {
        setError('Failed to update business. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBusiness = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setIsSubmitting(true);
      setError('');
      try {
        const success = await onDeleteBusiness(id);
        if (!success) {
          setError('Failed to delete business. Please try again.');
        }
      } catch (err) {
        setError('An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const customBusinesses = businesses.filter(b => !b.isDefault);
  const defaultBusinesses = businesses.filter(b => b.isDefault && b.value !== 'all');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Manage Businesses</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleAddBusiness} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-600" />
              <span>Add New Business</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Construction, Consulting, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newName.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>{isSubmitting ? 'Adding...' : 'Add Business'}</span>
              </button>
            </div>
          </form>

          {customBusinesses.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Your Custom Businesses</h3>
              <div className="space-y-2">
                {customBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                  >
                    {editingId === business.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => {
                            setEditName(e.target.value);
                            setEditValue(generateValue(e.target.value));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isSubmitting}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleUpdateBusiness(business.id)}
                            disabled={isSubmitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2"
                          >
                            <Check className="w-4 h-4" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isSubmitting}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-3 py-2 rounded-lg font-semibold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-800">{business.name}</div>
                          <div className="text-sm text-gray-500">{business.value}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEdit(business)}
                            disabled={isSubmitting}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Edit business"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBusiness(business.id, business.name)}
                            disabled={isSubmitting}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete business"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Default Businesses</h3>
            <div className="space-y-2">
              {defaultBusinesses.map((business) => (
                <div
                  key={business.id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-800">{business.name}</div>
                      <div className="text-sm text-gray-500">{business.value}</div>
                    </div>
                    <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-medium rounded-full">
                      Default
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

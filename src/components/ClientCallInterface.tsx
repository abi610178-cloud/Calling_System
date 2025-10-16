import React, { useState } from 'react';
import { Phone, User, Clock, CheckCircle, X } from 'lucide-react';

interface ClientCallInterfaceProps {
  clientName: string;
  onSubmitCallRequest: (purpose: string, description?: string) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ClientCallInterface: React.FC<ClientCallInterfaceProps> = ({
  clientName,
  onSubmitCallRequest,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [description, setDescription] = useState('');

  const callPurposes = [
    { value: 'wants_quote', label: '💰 I Want a Quote', description: 'Request price estimate for services' },
    { value: 'wants_meeting', label: '🤝 I Want to Schedule Meeting', description: 'Schedule a meeting or consultation' },
    { value: 'has_complaint', label: '😠 I Have a Complaint', description: 'Report an issue or complaint' },
    { value: 'needs_support', label: '🆘 I Need Support', description: 'Technical or service support needed' },
    { value: 'wants_information', label: '❓ I Need Information', description: 'Ask questions about services' },
    { value: 'ready_to_start', label: '🚀 I\'m Ready to Start', description: 'Ready to begin project or service' },
    { value: 'wants_changes', label: '🔄 I Want Changes', description: 'Request modifications to current work' },
    { value: 'payment_inquiry', label: '💳 Payment Question', description: 'Billing or payment inquiry' },
    { value: 'referral_interest', label: '👥 I Want to Refer Someone', description: 'Interested in referring others' },
    { value: 'feedback_to_give', label: '⭐ I Have Feedback', description: 'Provide feedback or review' },
    { value: 'emergency_request', label: '🚨 Emergency Request', description: 'Urgent assistance needed' },
    { value: 'contract_discussion', label: '📋 Contract Discussion', description: 'Discuss contract terms' },
    { value: 'general_inquiry', label: '📞 General Inquiry', description: 'General question or check-in' },
  ];

  const handleSubmit = () => {
    if (selectedPurpose) {
      onSubmitCallRequest(selectedPurpose, description.trim() || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Request a Call</h2>
                <p className="text-gray-600">Hello {clientName}, what can we help you with?</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Purpose Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              What is the purpose of your call?
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {callPurposes.map((purpose) => (
                <label
                  key={purpose.value}
                  className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPurpose === purpose.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="callPurpose"
                    value={purpose.value}
                    checked={selectedPurpose === purpose.value}
                    onChange={(e) => setSelectedPurpose(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{purpose.label}</div>
                    <div className="text-sm text-gray-600">{purpose.description}</div>
                  </div>
                  {selectedPurpose === purpose.value && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Additional Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Please provide any additional details about your request..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedPurpose || isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Requesting Call...</span>
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  <span>Request Call</span>
                </>
              )}
            </button>
          </div>

          {/* Information */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">What happens next?</span>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your call request will be sent to our team</li>
              <li>• We'll call you back within 10 minutes</li>
              <li>• Our representative will address your specific needs</li>
              <li>• You'll receive a confirmation of your request</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
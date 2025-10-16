import React, { useState } from 'react';
import { Phone, User, Clock, CheckCircle } from 'lucide-react';
import { ClientCallInterface } from './ClientCallInterface';

interface ClientPortalProps {
  onSubmitCallRequest: (clientName: string, clientPhone: string, purpose: string, description?: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ onSubmitCallRequest }) => {
  const [showCallInterface, setShowCallInterface] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStartCallRequest = () => {
    if (clientInfo.name.trim() && clientInfo.phone.trim()) {
      setShowCallInterface(true);
    }
  };

  const handleSubmitCallRequest = async (purpose: string, description?: string) => {
    setIsSubmitting(true);
    try {
      onSubmitCallRequest(clientInfo.name, clientInfo.phone, purpose, description);
      setSubmitted(true);
      setShowCallInterface(false);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setClientInfo({ name: '', phone: '' });
      }, 5000);
    } catch (error) {
      console.error('Failed to submit call request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Call Request Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you {clientInfo.name}! We've received your call request and will contact you within 10 minutes.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <strong>What's next:</strong><br/>
              • Our team has been notified<br/>
              • You'll receive a call shortly<br/>
              • We'll address your specific needs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Request a Call Back
          </h1>
          <p className="text-gray-600">
            Tell us what you need and we'll call you back within 10 minutes
          </p>
        </div>

        {/* Client Information Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Your Name
            </label>
            <input
              type="text"
              value={clientInfo.name}
              onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Your Phone Number
            </label>
            <input
              type="tel"
              value={clientInfo.phone}
              onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your phone number"
              required
            />
          </div>
        </div>

        {/* Request Call Button */}
        <button
          onClick={handleStartCallRequest}
          disabled={!clientInfo.name.trim() || !clientInfo.phone.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <Phone className="w-4 h-4" />
          <span>Continue to Call Request</span>
        </button>

        {/* Information */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Quick Response Time</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Average response time: 5-10 minutes</li>
            <li>• Available during business hours</li>
            <li>• Professional consultation</li>
            <li>• No obligation to purchase</li>
          </ul>
        </div>
      </div>

      {/* Call Interface Modal */}
      {showCallInterface && (
        <ClientCallInterface
          clientName={clientInfo.name}
          onSubmitCallRequest={handleSubmitCallRequest}
          onCancel={() => setShowCallInterface(false)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
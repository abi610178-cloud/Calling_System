import React, { useState } from 'react';
import { Phone, Copy, CheckCircle, User } from 'lucide-react';

interface ClientPurposeSelectorProps {
  businessPhone: string;
  businessName: string;
  onClientPurposeSelected?: (clientName: string, clientPhone: string, purpose: string) => void;
}

export const ClientPurposeSelector: React.FC<ClientPurposeSelectorProps> = ({
  businessPhone,
  businessName,
  onClientPurposeSelected,
}) => {
  const [selectedPurpose, setSelectedPurpose] = useState('');
  const [copied, setCopied] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
  });
  const [showClientForm, setShowClientForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(businessPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = businessPhone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectedPurposeData = callPurposes.find(p => p.value === selectedPurpose);

  const handleSubmitClientInfo = () => {
    if (clientInfo.name.trim() && clientInfo.phone.trim() && selectedPurpose && onClientPurposeSelected) {
      onClientPurposeSelected(clientInfo.name, clientInfo.phone, selectedPurpose);
      setSubmitted(true);
      
      // Reset after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
        setClientInfo({ name: '', phone: '' });
        setSelectedPurpose('');
        setShowClientForm(false);
      }, 5000);
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
            Request Submitted!
          </h1>
          <p className="text-gray-600 mb-6">
            Thank you {clientInfo.name}! Your request has been sent to our calling system. 
            We'll call you back shortly regarding: <strong>"{selectedPurposeData?.label}"</strong>
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              <strong>What's next:</strong><br/>
              • Your request is now in our calling queue<br/>
              • We'll call you within 10 minutes<br/>
              • We already know your purpose: {selectedPurposeData?.label}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-4 rounded-full w-16 h-16 mx-auto mb-4">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Contact {businessName}
          </h1>
          <p className="text-gray-600">
            Select your purpose for calling, then copy our phone number
          </p>
        </div>

        {/* Purpose Selection */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            What is your purpose for calling?
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

        {/* Selected Purpose Display */}
        {selectedPurpose && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Your Selected Purpose:</span>
            </div>
            <div className="text-blue-700 font-medium">
              {selectedPurposeData?.label}
            </div>
            <div className="text-sm text-blue-600 mt-1">
              {selectedPurposeData?.description}
            </div>
          </div>
        )}

        {/* Phone Number Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg p-6 mb-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Option 1: Call Us Directly
            </h3>
            <div className="bg-white rounded-lg p-4 mb-4 border-2 border-gray-200">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {businessPhone}
              </div>
              <button
                onClick={handleCopyPhone}
                className={`flex items-center justify-center space-x-2 mx-auto px-6 py-3 rounded-lg font-medium transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    <span>Copy Phone Number</span>
                  </>
                )}
              </button>
            </div>
            
            {selectedPurpose && (
              <div className="text-sm text-gray-600">
                When you call, mention: <strong>"{selectedPurposeData?.label}"</strong>
              </div>
            )}
          </div>
        </div>

        {/* Request Callback Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Option 2: Request a Callback
            </h3>
            <p className="text-gray-600 mb-4">
              We'll call you back and already know your purpose
            </p>
            
            {!showClientForm ? (
              <button
                onClick={() => setShowClientForm(true)}
                disabled={!selectedPurpose}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Request Callback
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Your Phone Number"
                    value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowClientForm(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitClientInfo}
                    disabled={!clientInfo.name.trim() || !clientInfo.phone.trim()}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 py-3 rounded-lg font-medium"
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}
            
            {!selectedPurpose && (
              <p className="text-red-500 text-sm mt-2">
                Please select your purpose first
              </p>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Two Options Available:</h4>
          <ol className="text-sm text-gray-600 space-y-1">
            <li><strong>Option 1 (Direct Call):</strong> Copy number → Call us → Mention your purpose</li>
            <li><strong>Option 2 (Callback):</strong> Submit request → We call you → We already know your purpose</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Phone, Clock, CheckCircle, XCircle, User, AlertCircle } from 'lucide-react';

interface CallRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  purpose: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  requestTime: Date;
  completedTime?: Date;
}

interface ClientCallRequestManagerProps {
  callRequests: CallRequest[];
  onAcceptRequest: (requestId: string) => void;
  onCompleteRequest: (requestId: string) => void;
  onCancelRequest: (requestId: string) => void;
}

export const ClientCallRequestManager: React.FC<ClientCallRequestManagerProps> = ({
  callRequests,
  onAcceptRequest,
  onCompleteRequest,
  onCancelRequest,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  const purposeLabels: Record<string, string> = {
    'wants_quote': '💰 Wants Quote',
    'wants_meeting': '🤝 Wants Meeting',
    'has_complaint': '😠 Has Complaint',
    'needs_support': '🆘 Needs Support',
    'wants_information': '❓ Wants Information',
    'ready_to_start': '🚀 Ready to Start',
    'wants_changes': '🔄 Wants Changes',
    'payment_inquiry': '💳 Payment Inquiry',
    'referral_interest': '👥 Referral Interest',
    'feedback_to_give': '⭐ Has Feedback',
    'emergency_request': '🚨 Emergency Request',
    'contract_discussion': '📋 Contract Discussion',
    'general_inquiry': '📞 General Inquiry',
  };

  const filteredRequests = callRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'in_progress':
        return <Phone className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const pendingCount = callRequests.filter(r => r.status === 'pending').length;
  const inProgressCount = callRequests.filter(r => r.status === 'in_progress').length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Client Call Requests</h2>
            <p className="text-gray-600">
              {pendingCount} pending, {inProgressCount} in progress
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2">
          {['all', 'pending', 'in_progress', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType as any)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === filterType
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-800">{pendingCount}</div>
          <div className="text-sm text-yellow-600">Pending</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
          <div className="text-2xl font-bold text-blue-800">{inProgressCount}</div>
          <div className="text-sm text-blue-600">In Progress</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
          <div className="text-2xl font-bold text-green-800">
            {callRequests.filter(r => r.status === 'completed').length}
          </div>
          <div className="text-sm text-green-600">Completed</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
          <div className="text-2xl font-bold text-gray-800">{callRequests.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Call Requests List */}
      <div className="space-y-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="p-4 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{request.clientName}</h3>
                    <p className="text-sm text-gray-600">{request.clientPhone}</p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span>{request.status.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">Purpose:</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {purposeLabels[request.purpose] || request.purpose}
                  </span>
                </div>
                {request.description && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {request.description}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Requested: {request.requestTime.toLocaleString()}
                  {request.completedTime && (
                    <span className="ml-2">
                      Completed: {request.completedTime.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => onAcceptRequest(request.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Accept & Call
                      </button>
                      <button
                        onClick={() => onCancelRequest(request.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => onCompleteRequest(request.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Phone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No call requests found</p>
          </div>
        )}
      </div>
    </div>
  );
};
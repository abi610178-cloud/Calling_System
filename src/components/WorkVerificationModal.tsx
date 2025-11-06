import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X, MessageSquare } from 'lucide-react';
import { WorkHistory, Employee } from '../types/Employee';

interface WorkVerificationModalProps {
  work: WorkHistory;
  client: Employee;
  onVerify: (workId: string, status: 'verified' | 'has_complaint', notes?: string) => Promise<void>;
  onClose: () => void;
}

export const WorkVerificationModal: React.FC<WorkVerificationModalProps> = ({
  work,
  client,
  onVerify,
  onClose,
}) => {
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'has_complaint' | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!verificationStatus) return;

    setIsSubmitting(true);
    try {
      await onVerify(work.id, verificationStatus, notes || undefined);
      onClose();
    } catch (error) {
      console.error('Failed to verify work:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Verify Completed Work</h2>
                <p className="text-gray-600">Client: {client.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Work Details</h3>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Type:</span> {work.workType}</p>
              {work.workDescription && (
                <p><span className="font-medium">Description:</span> {work.workDescription}</p>
              )}
              {work.completionDate && (
                <p>
                  <span className="font-medium">Completed:</span>{' '}
                  {new Date(work.completionDate).toLocaleDateString()}
                </p>
              )}
              {work.amount && (
                <p><span className="font-medium">Amount:</span> ${work.amount.toLocaleString()}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">After calling the client, what is the status?</h3>
            <div className="space-y-3">
              <button
                onClick={() => setVerificationStatus('verified')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  verificationStatus === 'verified'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className={`w-6 h-6 ${
                    verificationStatus === 'verified' ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Work Completed Successfully</p>
                    <p className="text-sm text-gray-600">Client confirmed work is complete and satisfactory</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setVerificationStatus('has_complaint')}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  verificationStatus === 'has_complaint'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <AlertTriangle className={`w-6 h-6 ${
                    verificationStatus === 'has_complaint' ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Client Has Complaint/Issues</p>
                    <p className="text-sm text-gray-600">Work needs fixes or client has concerns</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {verificationStatus && (
            <div className="mb-6 animate-slide-in">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {verificationStatus === 'verified' ? 'Additional Notes (Optional)' : 'Complaint Details (Required)'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  verificationStatus === 'verified'
                    ? 'Any additional feedback from the client...'
                    : 'Describe the complaint or issues that need to be fixed...'
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                required={verificationStatus === 'has_complaint'}
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!verificationStatus || isSubmitting || (verificationStatus === 'has_complaint' && !notes.trim())}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

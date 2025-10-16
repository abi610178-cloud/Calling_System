import { useState, useCallback } from 'react';

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

export const useClientCallRequests = () => {
  const [callRequests, setCallRequests] = useState<CallRequest[]>([]);

  const addCallRequest = useCallback((
    clientName: string,
    clientPhone: string,
    purpose: string,
    description?: string
  ) => {
    const newRequest: CallRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientName,
      clientPhone,
      purpose,
      description,
      status: 'pending',
      requestTime: new Date(),
    };

    setCallRequests(prev => [newRequest, ...prev]);
    return newRequest.id;
  }, []);

  const acceptRequest = useCallback((requestId: string) => {
    setCallRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'in_progress' as const }
          : request
      )
    );
  }, []);

  const completeRequest = useCallback((requestId: string) => {
    setCallRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'completed' as const, completedTime: new Date() }
          : request
      )
    );
  }, []);

  const cancelRequest = useCallback((requestId: string) => {
    setCallRequests(prev =>
      prev.map(request =>
        request.id === requestId
          ? { ...request, status: 'cancelled' as const }
          : request
      )
    );
  }, []);

  const getRequestsByStatus = useCallback((status: CallRequest['status']) => {
    return callRequests.filter(request => request.status === status);
  }, [callRequests]);

  const getRequestStats = useCallback(() => {
    return {
      total: callRequests.length,
      pending: callRequests.filter(r => r.status === 'pending').length,
      inProgress: callRequests.filter(r => r.status === 'in_progress').length,
      completed: callRequests.filter(r => r.status === 'completed').length,
      cancelled: callRequests.filter(r => r.status === 'cancelled').length,
    };
  }, [callRequests]);

  return {
    callRequests,
    addCallRequest,
    acceptRequest,
    completeRequest,
    cancelRequest,
    getRequestsByStatus,
    getRequestStats,
  };
};
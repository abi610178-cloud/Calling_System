export interface Employee {
  id: string;
  name: string;
  phoneNumber: string;
  whatsappNumber?: string;
  position: string;
  department: string;
  email: string;
  status: 'pending' | 'calling' | 'answered' | 'missed';
  callAttempts: number;
  lastCallTime?: Date;
  isDefault?: boolean;
  priority?: 'high' | 'follow-up' | 'not-interested';
  workStatus?: 'new' | 'in_progress' | 'completed' | 'repeat_client';
  isUrgent?: boolean;
  business?: 'real_estate' | 'finance' | 'education' | 'healthcare' | 'technology' | 'retail' | 'other';
  callReason?: 'follow_up' | 'new_inquiry' | 'project_update' | 'payment_reminder' | 'appointment_confirmation' | 'general_check_in' | 'complaint_resolution' | 'service_offer' | 'feedback_request' | 'other';
  lastCallReason?: string;
}

export interface CallSystemStats {
  totalEmployees: number;
  answered: number;
  missed: number;
  pending: number;
  currentRound: number;
  monthlyAppointments: number;
  completedWork: number;
  urgentClients: number;
}

export interface ClientFeedback {
  id: string;
  clientId: string;
  rating: number;
  feedbackText?: string;
  feedbackDate: Date;
}

export interface Appointment {
  id: string;
  clientId: string;
  appointmentDate: Date;
  appointmentType: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
}

export interface WorkHistory {
  id: string;
  clientId: string;
  workType: string;
  workDescription?: string;
  startDate?: Date;
  completionDate?: Date;
  status: 'completed' | 'in_progress' | 'cancelled';
  amount?: number;
}

export interface ClientNote {
  id: string;
  clientId: string;
  noteText: string;
  isUrgent: boolean;
  createdAt: Date;
}

export interface ClientReview {
  id: string;
  clientId: string;
  rating: number;
  reviewText?: string;
  reviewDate: Date;
  serviceType?: string;
}
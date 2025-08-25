// src/types/db.ts

// Patient related types
export interface DBPatient {
    id: number;
    name: string;
    age?: number;
    sex?: string;
    address?: string;
    phone: string;
    email?: string;
    last_visit: string;
    assigned_doctor_id: number | null;
    special_notes: string;
    created_at?: string;
    updated_at?: string;
  }
  
  // Appointment related types
  export interface DBAppointment {
    id: number;
    patient_id: number;
    doctor_id: number;
    date: string;
    time: string;
    type: string;
    status: AppointmentStatus;
    notes?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  
  // Treatment related types
  export interface DBTreatment {
    id: number;
    name: string;
    description?: string;
    duration: string;
    price: string;
    category?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  // Invoice related types
  export interface DBInvoice {
    id: number;
    patient_id: number;
    appointment_id?: number;
    date: string;
    due_date: string;
    amount: string;
    status: InvoiceStatus;
    payment_method?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue' | 'Cancelled';
  
  // Medical History related types
  export interface DBHistoryEntry {
    id: number;
    patient_id: number;
    date: string;
    description: string;
    diagnosis?: string;
    treatment_notes?: string;
    attachments: string[];
    doctor_id: number;
    created_at?: string;
    updated_at?: string;
  }
  
  // Prescription related types
  export interface DBPrescription {
    id: number;
    patient_id: number;
    doctor_id: number;
    date: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    renewal_date: string;
    status: PrescriptionStatus;
    notes?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

// Lab Report related types
export interface DBLabReport {
  id: number;
  patient_id: number;
  date: string;
  title: string;
  file_type: string;
  file_url: string;
  created_at?: string;
  updated_at?: string;
}

  // Treatment Plan related types
  export interface DBTreatmentPlan {
    id: number;
    patient_id: number;
    nodes: any[];
    edges: any[];
    created_at?: string;
    updated_at?: string;
  }
  
  // Notification related types
  export interface DBNotification {
    id: number;
    patient_id: number;
    type: NotificationType;
    message: string;
    date: string;
    is_read: boolean;
    priority: NotificationPriority;
    created_at?: string;
    updated_at?: string;
  }
  
  export type NotificationType = 'appointment' | 'prescription' | 'invoice' | 'general';
  export type NotificationPriority = 'low' | 'medium' | 'high';
  
  // Doctor related types
  export interface DBDoctor {
    id: number;
    name: string;
    email: string;
    phone: string;
    specialization?: string;
    schedule?: DoctorSchedule;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface DoctorSchedule {
    monday?: WorkingHours;
    tuesday?: WorkingHours;
    wednesday?: WorkingHours;
    thursday?: WorkingHours;
    friday?: WorkingHours;
    saturday?: WorkingHours;
    sunday?: WorkingHours;
  }
  
  export interface WorkingHours {
    start: string;
    end: string;
    break_start?: string;
    break_end?: string;
  }
  
  // Common types
  export interface Pagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }
  
  export interface QueryFilters {
    search?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    doctor_id?: number;
    patient_id?: number;
  }
  
  export interface APIResponse<T> {
    data: T;
    pagination?: Pagination;
    message?: string;
    error?: string;
  }
  
  // Audit related types
  export interface AuditLog {
    id: number;
    user_id: number;
    action: string;
    entity_type: string;
    entity_id: number;
    changes: object;
    ip_address?: string;
    created_at: string;
  }
  
  // Settings related types
  export interface ClinicSettings {
    id: number;
    clinic_name: string;
    address: string;
    phone: string;
    email: string;
    working_hours: {
      [key: string]: WorkingHours;
    };
    appointment_duration: number;
    currency: string;
    tax_rate?: number;
    logo_url?: string;
    updated_at: string;
  }
  
  // User related types
  export interface DBUser {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    is_active: boolean;
    last_login?: string;
    created_at: string;
    updated_at: string;
  }
  
  export type UserRole = 'admin' | 'doctor' | 'staff' | 'receptionist';
  
  // Permission related types
  export interface Permission {
    id: number;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface RolePermission {
    role: UserRole;
    permissions: string[];
  }
  
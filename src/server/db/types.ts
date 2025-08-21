// // src/server/db/types.ts
// export interface DBPatient {
//     id: number;
//     name: string;
//     age?: number;
//     sex?: string;
//     address?: string;
//     phone: string;
//     email?: string;
//     last_visit: string;
//     assigned_doctor_id: number | null;
//     special_notes: string;
//   }
  
//   export interface DBAppointment {
//     id: number;
//     patient_id: number;
//     date: string;
//     time: string;
//     type: string;
//   }
  
//   export interface DBTreatment {
//     id: number;
//     name: string;
//     duration: string;
//     price: string;
//   }
  
//   export interface DBInvoice {
//     id: number;
//     patient_id: number;
//     date: string;
//     amount: string;
//     status: 'Paid' | 'Pending' | 'Overdue';
//   }
  
//   export interface DBHistoryEntry {
//     id: number;
//     patient_id: number;
//     date: string;
//     description: string;
//     attachments: string[];
//   }
  
//   export interface DBPrescription {
//     id: number;
//     patient_id: number;
//     date: string;
//     medication: string;
//     dosage: string;
//     instructions: string;
//     renewal_date: string;
//   }
  
//   export interface DBNotification {
//     id: number;
//     patient_id: number;
//     type: 'appointment' | 'prescription';
//     message: string;
//     date: string;
//   }
  
export interface DBUser {
    id: number;
    username: string;
    role: 'Admin' | 'Doctor' | 'Reception';
    fullName: string;
    email: string;
}
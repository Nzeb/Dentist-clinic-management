// src/contexts/AppContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  DBPatient, 
  DBAppointment, 
  DBTreatment, 
  DBInvoice, 
  DBHistoryEntry, 
  DBPrescription, 
  DBNotification, 
  DBDoctor 
} from '@/types/db';

interface AppContextType {
  patients: DBPatient[];
  appointments: DBAppointment[];
  treatments: DBTreatment[];
  invoices: DBInvoice[];
  history: DBHistoryEntry[];
  prescriptions: DBPrescription[];
  notifications: DBNotification[];
  doctors: DBDoctor[];
  isLoading: boolean;
  error: string | null;

  // Patient functions
  addPatient: (patient: Omit<DBPatient, 'id'>) => Promise<DBPatient>;
  updatePatient: (id: number, patient: Partial<DBPatient>) => Promise<DBPatient>;
  getPatientsForDoctor: (doctorId: number) => Promise<DBPatient[]>;
  assignPatientToDoctor: (patientId: number, doctorId: number) => Promise<DBPatient | null>;

  // Appointment functions
  addAppointment: (appointment: Omit<DBAppointment, 'id'>) => Promise<DBAppointment>;
  updateAppointment: (id: number, appointment: Partial<DBAppointment>) => Promise<DBAppointment | null>;
  deleteAppointment: (id: number) => Promise<boolean>;

  // Treatment functions
  addTreatment: (treatment: Omit<DBTreatment, 'id'>) => Promise<DBTreatment>;

  // Invoice functions
  addInvoice: (invoice: Omit<DBInvoice, 'id'>) => Promise<DBInvoice>;
  updateInvoiceStatus: (id: number, status: DBInvoice['status']) => Promise<DBInvoice | null>;

  // History functions
  addHistoryEntry: (entry: Omit<DBHistoryEntry, 'id'>) => Promise<DBHistoryEntry>;
  updateHistoryEntry: (id: number, entry: Partial<DBHistoryEntry>) => Promise<DBHistoryEntry | null>;
  deleteHistoryEntry: (id: number) => Promise<boolean>;

  // Prescription functions
  addPrescription: (prescription: Omit<DBPrescription, 'id'>) => Promise<DBPrescription>;
  updatePrescription: (id: number, prescription: Partial<DBPrescription>) => Promise<DBPrescription | null>;
  deletePrescription: (id: number) => Promise<boolean>;

  // Notification functions
  addNotification: (notification: Omit<DBNotification, 'id'>) => Promise<DBNotification>;
  deleteNotification: (id: number) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<DBPatient[]>([]);
  const [appointments, setAppointments] = useState<DBAppointment[]>([]);
  const [treatments, setTreatments] = useState<DBTreatment[]>([]);
  const [invoices, setInvoices] = useState<DBInvoice[]>([]);
  const [history, setHistory] = useState<DBHistoryEntry[]>([]);
  const [prescriptions, setPrescriptions] = useState<DBPrescription[]>([]);
  const [notifications, setNotifications] = useState<DBNotification[]>([]);
  const [doctors, setDoctors] = useState<DBDoctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [
          patientsRes,
          appointmentsRes,
          treatmentsRes,
          invoicesRes,
          historyRes,
          prescriptionsRes,
          notificationsRes,
          doctorsRes
        ] = await Promise.all([
          fetch('/api/patients'),
          fetch('/api/appointments'),
          fetch('/api/treatments'),
          fetch('/api/invoices'),
          fetch('/api/history'),
          fetch('/api/prescriptions'),
          fetch('/api/notifications'),
          fetch('/api/doctors')
        ]);

        const [
          patientsData,
          appointmentsData,
          treatmentsData,
          invoicesData,
          historyData,
          prescriptionsData,
          notificationsData,
          doctorsData
        ] = await Promise.all([
          patientsRes.json(),
          appointmentsRes.json(),
          treatmentsRes.json(),
          invoicesRes.json(),
          historyRes.json(),
          prescriptionsRes.json(),
          notificationsRes.json(),
          doctorsRes.json()
        ]);

        setPatients(patientsData);
        setAppointments(appointmentsData);
        setTreatments(treatmentsData);
        setInvoices(invoicesData);
        setHistory(historyData);
        setPrescriptions(prescriptionsData);
        setNotifications(notificationsData);
        setDoctors(doctorsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while loading data');
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Patient functions
  const addPatient = async (patient: Omit<DBPatient, 'id'>) => {
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });

      if (!response.ok) throw new Error('Failed to create patient');

      const newPatient = await response.json();
      setPatients(prev => [...prev, newPatient]);
      return newPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create patient');
      throw err;
    }
  };

  const updatePatient = async (id: number, patient: Partial<DBPatient>) => {
    try {
      const response = await fetch(`/api/patients/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      });

      if (!response.ok) throw new Error('Failed to update patient');

      const updatedPatient = await response.json();
      setPatients(prev => prev.map(p => p.id === id ? updatedPatient : p));
      return updatedPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
      throw err;
    }
  };

// Continuing inside the AppProvider component...

  // Appointment functions
  const addAppointment = async (appointment: Omit<DBAppointment, 'id'>) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) throw new Error('Failed to create appointment');

      const newAppointment = await response.json();
      setAppointments(prev => [...prev, newAppointment]);
      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      throw err;
    }
  };

  const updateAppointment = async (id: number, appointment: Partial<DBAppointment>) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });

      if (!response.ok) throw new Error('Failed to update appointment');

      const updatedAppointment = await response.json();
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
      return updatedAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      throw err;
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete appointment');

      setAppointments(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment');
      throw err;
    }
  };

  // Treatment functions
  const addTreatment = async (treatment: Omit<DBTreatment, 'id'>) => {
    try {
      const response = await fetch('/api/treatments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatment),
      });

      if (!response.ok) throw new Error('Failed to create treatment');

      const newTreatment = await response.json();
      setTreatments(prev => [...prev, newTreatment]);
      return newTreatment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create treatment');
      throw err;
    }
  };

  // Invoice functions
  const addInvoice = async (invoice: Omit<DBInvoice, 'id'>) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });

      if (!response.ok) throw new Error('Failed to create invoice');

      const newInvoice = await response.json();
      setInvoices(prev => [...prev, newInvoice]);
      return newInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
      throw err;
    }
  };

  const updateInvoiceStatus = async (id: number, status: DBInvoice['status']) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update invoice status');

      const updatedInvoice = await response.json();
      setInvoices(prev => prev.map(i => i.id === id ? updatedInvoice : i));
      return updatedInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice status');
      throw err;
    }
  };

  // History functions
  const addHistoryEntry = async (entry: Omit<DBHistoryEntry, 'id'>) => {
    try {
      const response = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!response.ok) throw new Error('Failed to create history entry');

      const newEntry = await response.json();
      setHistory(prev => [...prev, newEntry]);
      return newEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create history entry');
      throw err;
    }
  };

  const updateHistoryEntry = async (id: number, entry: Partial<DBHistoryEntry>) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });

      if (!response.ok) throw new Error('Failed to update history entry');

      const updatedEntry = await response.json();
      setHistory(prev => prev.map(h => h.id === id ? updatedEntry : h));
      return updatedEntry;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update history entry');
      throw err;
    }
  };

  const deleteHistoryEntry = async (id: number) => {
    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete history entry');

      setHistory(prev => prev.filter(h => h.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete history entry');
      throw err;
    }
  };

  // Prescription functions
  const addPrescription = async (prescription: Omit<DBPrescription, 'id'>) => {
    try {
      const response = await fetch('/api/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescription),
      });

      if (!response.ok) throw new Error('Failed to create prescription');

      const newPrescription = await response.json();
      setPrescriptions(prev => [...prev, newPrescription]);
      return newPrescription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prescription');
      throw err;
    }
  };

  const updatePrescription = async (id: number, prescription: Partial<DBPrescription>) => {
    try {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prescription),
      });

      if (!response.ok) throw new Error('Failed to update prescription');

      const updatedPrescription = await response.json();
      setPrescriptions(prev => prev.map(p => p.id === id ? updatedPrescription : p));
      return updatedPrescription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prescription');
      throw err;
    }
  };

  const deletePrescription = async (id: number) => {
    try {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prescription');

      setPrescriptions(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prescription');
      throw err;
    }
  };

  // Notification functions
  const addNotification = async (notification: Omit<DBNotification, 'id'>) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification),
      });

      if (!response.ok) throw new Error('Failed to create notification');

      const newNotification = await response.json();
      setNotifications(prev => [...prev, newNotification]);
      return newNotification;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create notification');
      throw err;
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      setNotifications(prev => prev.filter(n => n.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      throw err;
    }
  };

  // Doctor-related functions
  const getPatientsForDoctor = async (doctorId: number) => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}/patients`);
      if (!response.ok) throw new Error('Failed to fetch doctor\'s patients');

      const doctorPatients = await response.json();
      return doctorPatients;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctor\'s patients');
      throw err;
    }
  };

  const assignPatientToDoctor = async (patientId: number, doctorId: number) => {
    try {
      const response = await fetch(`/api/patients/${patientId}/assign-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId }),
      });

      if (!response.ok) throw new Error('Failed to assign patient to doctor');

      const updatedPatient = await response.json();
      setPatients(prev => prev.map(p => p.id === patientId ? updatedPatient : p));
      return updatedPatient;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign patient to doctor');
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
      patients,
      appointments,
      treatments,
      invoices,
      history,
      prescriptions,
      notifications,
      doctors,
      isLoading,
      error,
      addPatient,
      updatePatient,
      getPatientsForDoctor,
      assignPatientToDoctor,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      addTreatment,
      addInvoice,
      updateInvoiceStatus,
      addHistoryEntry,
      updateHistoryEntry,
      deleteHistoryEntry,
      addPrescription,
      updatePrescription,
      deletePrescription,
      addNotification,
      deleteNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

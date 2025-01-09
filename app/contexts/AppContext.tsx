'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Patient {
  id: number
  name: string
  age?: number
  sex?: string
  address?: string
  phone: string
  email?: string
  lastVisit: string
  assignedDoctorId: number | null
  specialNotes: string
}

interface Appointment {
  id: number
  patientId: number
  date: string
  time: string
  type: string
}

interface Treatment {
  id: number
  name: string
  duration: string
  price: string
}

interface Invoice {
  id: number
  patientId: number
  date: string
  amount: string
  status: 'Paid' | 'Pending' | 'Overdue'
}

interface HistoryEntry {
  id: number
  patientId: number
  date: string
  description: string
  attachments: string[]
}

interface Prescription {
  id: number
  patientId: number
  date: string
  medication: string
  dosage: string
  instructions: string
  renewalDate: string
}

interface Notification {
  id: number
  patientId: number
  type: 'appointment' | 'prescription'
  message: string
  date: string
}

interface Doctor {
  id: number
  name: string
}

interface AppContextType {
  patients: Patient[]
  appointments: Appointment[]
  treatments: Treatment[]
  invoices: Invoice[]
  history: HistoryEntry[]
  prescriptions: Prescription[]
  notifications: Notification[]
  addPatient: (patient: Omit<Patient, 'id'>) => void
  updatePatient: (id: number, patient: Partial<Patient>) => void
  addAppointment: (appointment: Omit<Appointment, 'id'>) => void
  addTreatment: (treatment: Omit<Treatment, 'id'>) => void
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void
  addHistoryEntry: (entry: Omit<HistoryEntry, 'id'>) => void
  updateHistoryEntry: (id: number, entry: Partial<HistoryEntry>) => void
  deleteHistoryEntry: (id: number) => void
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void
  updatePrescription: (id: number, prescription: Partial<Prescription>) => void
  deletePrescription: (id: number) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  deleteNotification: (id: number) => void
  doctors: Doctor[]
  assignPatientToDoctor: (patientId: number, doctorId: number) => void
  getPatientsForDoctor: (doctorId: number) => Patient[]
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([
    {
      id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890", lastVisit: "2023-05-15", assignedDoctorId: 1,
      specialNotes: ''
    },
    {
      id: 2, name: "Jane Smith", email: "jane@example.com", phone: "098-765-4321", lastVisit: "2023-05-10", assignedDoctorId: 1,
      specialNotes: ''
    },
    {
      id: 3, name: "Alice Johnson", email: "alice@example.com", phone: "555-555-5555", lastVisit: "2023-05-05", assignedDoctorId: null,
      specialNotes: ''
    },
  ])

  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: 1, patientId: 1, date: "2023-05-20", time: "09:00 AM", type: "Check-up" },
    { id: 2, patientId: 2, date: "2023-05-20", time: "11:30 AM", type: "Cleaning" },
    { id: 3, patientId: 3, date: "2023-05-20", time: "02:00 PM", type: "Filling" },
  ])

  const [treatments, setTreatments] = useState<Treatment[]>([
    { id: 1, name: "Dental Cleaning", duration: "30 mins", price: "$100" },
    { id: 2, name: "Tooth Filling", duration: "45 mins", price: "$150" },
    { id: 3, name: "Root Canal", duration: "90 mins", price: "$500" },
    { id: 4, name: "Tooth Extraction", duration: "60 mins", price: "$200" },
  ])

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 1, patientId: 1, date: "2023-05-15", amount: "$250", status: "Paid" },
    { id: 2, patientId: 2, date: "2023-05-14", amount: "$150", status: "Pending" },
    { id: 3, patientId: 3, date: "2023-05-13", amount: "$500", status: "Overdue" },
  ])

  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 1, patientId: 1, date: "2023-05-15", description: "Regular check-up, no issues found", attachments: [] },
    { id: 2, patientId: 2, date: "2023-05-10", description: "Cavity found in upper right molar, scheduled filling", attachments: [] },
    { id: 3, patientId: 3, date: "2023-05-05", description: "Completed root canal on lower left premolar", attachments: [] },
  ])

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([
    { id: 1, patientId: 1, date: "2023-05-15", medication: "Fluoride rinse", dosage: "10ml", instructions: "Rinse once daily before bed", renewalDate: "2023-11-15" },
    { id: 2, patientId: 2, date: "2023-05-10", medication: "Amoxicillin", dosage: "500mg", instructions: "Take 3 times daily for 7 days", renewalDate: "2023-05-17" },
    { id: 3, patientId: 3, date: "2023-05-05", medication: "Ibuprofen", dosage: "400mg", instructions: "Take as needed for pain, not exceeding 4 doses per day", renewalDate: "2023-05-12" },
  ])

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, patientId: 1, type: 'appointment', message: "Upcoming appointment on 2023-05-20", date: "2023-05-18" },
    { id: 2, patientId: 2, type: 'prescription', message: "Prescription renewal due on 2023-05-17", date: "2023-05-15" },
  ])

  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 1, name: "Dr. Smith" },
    { id: 2, name: "Dr. Johnson" },
  ])

  const addPatient = (patient: Omit<Patient, 'id'>) => {
    setPatients([...patients, { ...patient, id: patients.length + 1 }])
  }

  const updatePatient = (id: number, patient: Partial<Patient>) => {
    setPatients(patients.map(p => p.id === id ? { ...p, ...patient } : p))
  }

  const addAppointment = (appointment: Omit<Appointment, 'id'>) => {
    setAppointments([...appointments, { ...appointment, id: appointments.length + 1 }])
  }

  const addTreatment = (treatment: Omit<Treatment, 'id'>) => {
    setTreatments([...treatments, { ...treatment, id: treatments.length + 1 }])
  }

  const addInvoice = (invoice: Omit<Invoice, 'id'>) => {
    setInvoices([...invoices, { ...invoice, id: invoices.length + 1 }])
  }

  const addHistoryEntry = (entry: Omit<HistoryEntry, 'id'>) => {
    setHistory([...history, { ...entry, id: history.length + 1 }])
  }

  const updateHistoryEntry = (id: number, entry: Partial<HistoryEntry>) => {
    setHistory(history.map(h => h.id === id ? { ...h, ...entry } : h))
  }

  const deleteHistoryEntry = (id: number) => {
    setHistory(history.filter(h => h.id !== id))
  }

  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    setPrescriptions([...prescriptions, { ...prescription, id: prescriptions.length + 1 }])
  }

  const updatePrescription = (id: number, prescription: Partial<Prescription>) => {
    setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, ...prescription } : p))
  }

  const deletePrescription = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id))
  }

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    setNotifications([...notifications, { ...notification, id: notifications.length + 1 }])
  }

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const assignPatientToDoctor = (patientId: number, doctorId: number) => {
    setPatients(patients.map(p => p.id === patientId ? { ...p, assignedDoctorId: doctorId } : p))
  }

  const getPatientsForDoctor = (doctorId: number) => {
    return patients.filter(p => p.assignedDoctorId === doctorId)
  }

  return (
    <AppContext.Provider value={{ 
      patients, appointments, treatments, invoices, history, prescriptions, notifications,
      addPatient, updatePatient, addAppointment, addTreatment, addInvoice, 
      addHistoryEntry, updateHistoryEntry, deleteHistoryEntry,
      addPrescription, updatePrescription, deletePrescription,
      addNotification, deleteNotification,
      doctors,
      assignPatientToDoctor,
      getPatientsForDoctor,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}


'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'
import { DBPatient } from '@/types/db'
import { usePatientData } from '@/hooks/usePatientData'
import { AddPatientDialog } from '../components/patients/AddPatientDialog'
import { PatientsTable } from '../components/patients/PatientsTable'
import { PatientDetailsDialog } from '../components/patients/PatientDetailsDialog'

export default function MyPatientsPage() {
  const { 
    patients, doctors, addPatient, updatePatient,
    addHistoryEntry, updateHistoryEntry,
    addPrescription, getPatientsForDoctor
  } = useAppContext()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<DBPatient | null>(null)
  const [myPatients, setMyPatients] = useState<DBPatient[]>([])
  const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false)
  const { patientData, isLoading, fetchPatientData, refreshPatientHistory } = usePatientData()

  useEffect(() => {
    const loadPatients = async () => {
      if (user?.role.toLowerCase() === 'doctor') {
        const patients = await getPatientsForDoctor(user.id)
        setMyPatients(patients)
      }
    }
    if (user) {
        loadPatients()
    }
  }, [user, getPatientsForDoctor, patients])

  const filteredPatients = myPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.phone.includes(searchTerm)
  )

  const handleSelectPatient = async (patient: DBPatient) => {
    setSelectedPatient(patient)
    await fetchPatientData(patient.id)
  }

  const handleAddHistoryEntry = async (entry: { date: string; description: string; attachments: File[] }) => {
    if (selectedPatient) {
      const formData = new FormData();
      formData.append('patient_id', selectedPatient.id.toString());
      formData.append('date', entry.date);
      formData.append('description', entry.description);
      formData.append('doctor_id', user?.id?.toString() ?? '0');
      entry.attachments.forEach(file => {
        formData.append('attachments', file);
      });

      try {
        const response = await fetch('/api/history', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to add history entry');
        }

        await refreshPatientHistory(selectedPatient.id);
      } catch (error) {
        console.error('Error adding history entry:', error);
      }
    }
  }

  const handleUpdateHistoryEntry = async (entry: { date: string; description: string }) => {
    if (selectedPatient && patientData?.history) {
        const historyEntry = patientData.history.find(e => e.patient_id === selectedPatient.id);
        if(historyEntry) {
            await updateHistoryEntry(historyEntry.id, entry);
            await refreshPatientHistory(selectedPatient.id);
        }
    }
  };

  const handleAddAttachments = async (historyId: number, files: File[]) => {
    if (files.length === 0 || !selectedPatient) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('attachments', file);
    });

    try {
      const response = await fetch(`/api/history/${historyId}/attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add attachments');
      }

      await refreshPatientHistory(selectedPatient.id);
    } catch (error) {
      console.error('Error adding attachments:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentUrl: string) => {
    if (selectedPatient && patientData?.history) {
        const historyEntry = patientData.history.find(e => e.attachments.includes(attachmentUrl));
        if (historyEntry) {
            try {
                const response = await fetch(`/api/history/${historyEntry.id}/attachments`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ attachmentUrl }),
                });

                if (!response.ok) {
                throw new Error('Failed to delete attachment');
                }

                await refreshPatientHistory(selectedPatient.id);
            } catch (error) {
                console.error('Error deleting attachment:', error);
            }
        }
    }
  };

  const handleAddPrescription = async (prescription: { date: string; medication: string; dosage: string; instructions: string; renewalDate: string }) => {
    if (selectedPatient) {
      await addPrescription({
        patient_id: selectedPatient.id,
        doctor_id: user?.id ?? 0,
        frequency: '',
        duration: '',
        status: 'active',
        renewal_date: prescription.renewalDate,
        date: prescription.date,
        medication: prescription.medication,
        dosage: prescription.dosage,
        instructions: prescription.instructions
      })
    }
  }

  const handleUpdateSpecialNotes = async (notes: string) => {
    if (selectedPatient) {
      await updatePatient(selectedPatient.id, { special_notes: notes })
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Patients</h1>
            <AddPatientDialog
                isOpen={addPatientDialogOpen}
                onOpenChange={setAddPatientDialogOpen}
                onAddPatient={addPatient}
                user={user}
            />
        </div>
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search patients..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <PatientsTable
        patients={filteredPatients}
        onSelectPatient={handleSelectPatient}
        user={user}
      />
      {selectedPatient && (
        <PatientDetailsDialog
            patient={selectedPatient}
            isOpen={!!selectedPatient}
            onClose={() => setSelectedPatient(null)}
            patientData={patientData}
            doctors={doctors}
            user={user}
            onUpdateSpecialNotes={handleUpdateSpecialNotes}
            onAddHistoryEntry={handleAddHistoryEntry}
            onUpdateHistoryEntry={handleUpdateHistoryEntry}
            onDeleteAttachment={handleDeleteAttachment}
            onAddAttachments={handleAddAttachments}
            onAddPrescription={handleAddPrescription}
        />
      )}
    </div>
  )
}

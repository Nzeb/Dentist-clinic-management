'use client'

import { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MindMap from './MindMap'
import { DBPatient, DBTreatmentPlan } from '@/types/db'

export default function TreatmentsPage() {
  const { patients } = useAppContext()
  const [selectedPatient, setSelectedPatient] = useState<DBPatient | null>(null)
  const [treatmentPlan, setTreatmentPlan] = useState<DBTreatmentPlan | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)

  useEffect(() => {
    if (selectedPatient) {
      const fetchPlan = async () => {
        setIsLoadingPlan(true)
        const response = await fetch(`/api/treatments/plan?patientId=${selectedPatient.id}`)
        if (response.ok) {
          const plan = await response.json()
          setTreatmentPlan(plan)
        }
        setIsLoadingPlan(false)
      }
      fetchPlan()
    } else {
      setTreatmentPlan(null)
    }
  }, [selectedPatient])

  const handleAddPlan = async () => {
    if (selectedPatient) {
      const response = await fetch('/api/treatments/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: selectedPatient.id, nodes: [], edges: [] }),
      });
      if (response.ok) {
        const plan = await response.json();
        setTreatmentPlan(plan);
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Treatment Plans</h1>
      <div className="flex items-center space-x-4">
        <label htmlFor="patient-select">Select Patient:</label>
        <Select onValueChange={(patientId) => setSelectedPatient(patients.find(p => p.id === parseInt(patientId)) || null)}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select a patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.map((patient) => (
              <SelectItem key={patient.id} value={String(patient.id)}>
                {patient.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPatient && (
        <div className="mt-8">
          {isLoadingPlan ? (
            <p>Loading plan...</p>
          ) : treatmentPlan ? (
            <div className="w-full h-[70vh] border rounded-lg">
              <MindMap patientId={selectedPatient.id} initialNodes={treatmentPlan.nodes} initialEdges={treatmentPlan.edges} />
            </div>
          ) : (
            <div className="text-center">
              <p>No treatment plan found for this patient.</p>
              <Button onClick={handleAddPlan} className="mt-4">Add a Plan</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


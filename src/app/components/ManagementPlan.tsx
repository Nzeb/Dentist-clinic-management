'use client'

import { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { Button } from "@/components/ui/button"
import MindMap from './MindMap'
import { DBPatient, DBTreatmentPlan } from '@/types/db'

interface ManagementPlanProps {
  patient: DBPatient;
}

export default function ManagementPlan({ patient }: ManagementPlanProps) {
  const { treatments, addTreatment, updateTreatment } = useAppContext()
  const [treatmentPlan, setTreatmentPlan] = useState<DBTreatmentPlan | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)

  useEffect(() => {
    if (patient) {
      const fetchPlan = async () => {
        setIsLoadingPlan(true)
        const response = await fetch(`/api/treatments/plan?patientId=${patient.id}`)
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
  }, [patient])

  const handleAddPlan = async () => {
    if (patient) {
      const response = await fetch('/api/treatments/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patient.id, nodes: [], edges: [] }),
      });
      if (response.ok) {
        const plan = await response.json();
        setTreatmentPlan(plan);
      }
    }
  }

  return (
    <div className="space-y-6">
      {isLoadingPlan ? (
        <p>Loading plan...</p>
      ) : treatmentPlan ? (
        <div className="w-full h-[70vh] border rounded-lg">
          <MindMap patientId={patient.id} initialNodes={treatmentPlan.nodes} initialEdges={treatmentPlan.edges} />
        </div>
      ) : (
        <div className="text-center">
          <p>No treatment plan found for this patient.</p>
          <Button onClick={handleAddPlan} className="mt-4">Add a Plan</Button>
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface AddPrescriptionProps {
  patientId: number
  onAdd: (prescription: { date: string; medication: string; dosage: string; instructions: string; renewalDate: string }) => void
}

export function AddPrescription({ patientId, onAdd }: AddPrescriptionProps) {
  const [date, setDate] = useState('')
  const [medication, setMedication] = useState('')
  const [dosage, setDosage] = useState('')
  const [instructions, setInstructions] = useState('')
  const [renewalDate, setRenewalDate] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({ date, medication, dosage, instructions, renewalDate })
    setDate('')
    setMedication('')
    setDosage('')
    setInstructions('')
    setRenewalDate('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="medication">Medication</Label>
        <Input
          id="medication"
          value={medication}
          onChange={(e) => setMedication(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="dosage">Dosage</Label>
        <Input
          id="dosage"
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="renewalDate">Renewal Date</Label>
        <Input
          id="renewalDate"
          type="date"
          value={renewalDate}
          onChange={(e) => setRenewalDate(e.target.value)}
          required
        />
      </div>
      <Button type="submit">Add Prescription</Button>
    </form>
  )
}


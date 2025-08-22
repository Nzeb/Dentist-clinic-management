'use client'

import { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import MindMap from './MindMap'
import { DBPatient } from '@/types/db'

export default function TreatmentsPage() {
  const { patients } = useAppContext()
  const [selectedPatient, setSelectedPatient] = useState<DBPatient | null>(null)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Treatment Plans</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>
                <Button onClick={() => setSelectedPatient(patient)}>View/Edit Plan</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl h-5/6">
            <DialogHeader>
              <DialogTitle>Treatment Plan for {selectedPatient.name}</DialogTitle>
            </DialogHeader>
            <div className="h-full">
              <MindMap patientId={selectedPatient.id} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


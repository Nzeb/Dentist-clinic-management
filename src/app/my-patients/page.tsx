'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Trash, Edit } from 'lucide-react'

export default function MyPatientsPage() {
  const { 
    patients, history, prescriptions, notifications,
    addHistoryEntry, updateHistoryEntry, deleteHistoryEntry,
    addPrescription, updatePrescription, deletePrescription,
    addNotification, deleteNotification, getPatientsForDoctor
  } = useAppContext()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null)
  const [myPatients, setMyPatients] = useState<typeof patients>([])

  useEffect(() => {
    const loadPatients = async () => {
      if (user?.role === 'doctor') {
        const patients = await getPatientsForDoctor(user.id)
        setMyPatients(patients)
      } else {
        setMyPatients(patients)
      }
    }
    loadPatients()
  }, [user, getPatientsForDoctor, patients])

  const filteredPatients = myPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  console.log(user?.id);
  console.log(myPatients);

  const patientNotifications = notifications.filter(n => n.patient_id === selectedPatient?.id)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Patients</h1>
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Last Visit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow key={patient.id} onClick={() => setSelectedPatient(patient)} className="cursor-pointer">
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.last_visit}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {selectedPatient && (
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedPatient.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                    <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                    <p><strong>Last Visit:</strong> {selectedPatient.last_visit}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Other TabsContent components remain the same as in the patients page */}
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


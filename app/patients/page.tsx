'use client'

import { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Search, Plus, Trash, Edit, Paperclip } from 'lucide-react'

export default function PatientsPage() {
  const { 
    patients, doctors, history, prescriptions, notifications,
    addPatient, updatePatient, addHistoryEntry, updateHistoryEntry, deleteHistoryEntry,
    addPrescription, updatePrescription, deletePrescription,
    addNotification, deleteNotification, assignPatientToDoctor
  } = useAppContext()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null)
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'recent' | 'overdue'>('all')

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)

    if (filterCriteria === 'all') return matchesSearch
    if (filterCriteria === 'recent') {
      const lastVisitDate = new Date(patient.lastVisit)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      return matchesSearch && lastVisitDate >= oneMonthAgo
    }
    if (filterCriteria === 'overdue') {
      const lastVisitDate = new Date(patient.lastVisit)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return matchesSearch && lastVisitDate < sixMonthsAgo
    }
    return false
  })

  const patientNotifications = notifications.filter(n => n.patientId === selectedPatient?.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patients</h1>
        {user?.role === 'admin' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Add Patient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Patient</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                addPatient({
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  lastVisit: new Date().toISOString().split('T')[0],
                  assignedDoctorId: null
                })
              }}>
                <div className="grid gap-4 py-4">
                  <Input id="name" name="name" placeholder="Name" required />
                  <Input id="email" name="email" type="email" placeholder="Email" required />
                  <Input id="phone" name="phone" placeholder="Phone" required />
                </div>
                <Button type="submit">Add Patient</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search patients..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select value={filterCriteria} onValueChange={(value: 'all' | 'recent' | 'overdue') => setFilterCriteria(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter patients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Patients</SelectItem>
            <SelectItem value="recent">Recent Visits</SelectItem>
            <SelectItem value="overdue">Overdue Checkups</SelectItem>
          </SelectContent>
        </Select>
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
            {user?.role === 'admin' && <TableHead>Assigned Doctor</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow key={patient.id} onClick={() => setSelectedPatient(patient)} className="cursor-pointer">
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.lastVisit}</TableCell>
              {user?.role === 'admin' && (
                <TableCell>
                  <Select
                    value={patient.assignedDoctorId?.toString() || ''}
                    onValueChange={(value) => assignPatientToDoctor(patient.id, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              )}
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
                    <p><strong>Last Visit:</strong> {selectedPatient.lastVisit}</p>
                    <p><strong>Assigned Doctor:</strong> {doctors.find(d => d.id === selectedPatient.assignedDoctorId)?.name || 'Not assigned'}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Other TabsContent components remain the same */}
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


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
import { UserPlus, Search, Plus, Trash, Edit, Paperclip, Calendar, FileText, Bell, Printer } from 'lucide-react'
import { AddHistoryEntry } from '../components/AddHistoryEntry'
import { AddPrescription } from '../components/AddPrescription'

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

  const handleAddHistoryEntry = (entry: { date: string; description: string; attachments: File[] }) => {
    if (selectedPatient) {
      addHistoryEntry({
        patientId: selectedPatient.id,
        date: entry.date,
        description: entry.description,
        attachments: entry.attachments.map(file => URL.createObjectURL(file))
      })
    }
  }

  const handleAddPrescription = (prescription: { date: string; medication: string; dosage: string; instructions: string; renewalDate: string }) => {
    if (selectedPatient) {
      addPrescription({
        patientId: selectedPatient.id,
        ...prescription
      })
    }
  }

  const printPrescription = (prescription: typeof prescriptions[0]) => {
    const patient = patients.find(p => p.id === prescription.patientId)
    const doctor = doctors.find(d => d.id === patient?.assignedDoctorId)
    
    const prescriptionContent = `
      <h1>Prescription</h1>
      <p><strong>Patient:</strong> ${patient?.name}</p>
      <p><strong>Doctor:</strong> ${doctor?.name}</p>
      <p><strong>Date:</strong> ${prescription.date}</p>
      <p><strong>Medication:</strong> ${prescription.medication}</p>
      <p><strong>Dosage:</strong> ${prescription.dosage}</p>
      <p><strong>Instructions:</strong> ${prescription.instructions}</p>
      <p><strong>Renewal Date:</strong> ${prescription.renewalDate}</p>
    `

    const printWindow = window.open('', '_blank')
    printWindow?.document.write('<html><head><title>Prescription</title></head><body>')
    printWindow?.document.write(prescriptionContent)
    printWindow?.document.write('</body></html>')
    printWindow?.document.close()
    printWindow?.print()
  }

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
          <DialogContent className="max-w-4xl w-3/4 h-3/4 flex flex-col overflow-hidden">
            <Tabs defaultValue="details" className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
              </TabsList>
              <DialogHeader>
                <DialogTitle>Patient Details</DialogTitle>
              </DialogHeader>
              <TabsContent value="details" className="flex-grow overflow-auto h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>{selectedPatient.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    <p><strong>Email:</strong> {selectedPatient.email}</p>
                    <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                    <p><strong>Last Visit:</strong> {selectedPatient.lastVisit}</p>
                    <p><strong>Assigned Doctor:</strong> {doctors.find(d => d.id === selectedPatient.assignedDoctorId)?.name || 'Not assigned'}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="flex-grow overflow-auto h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Medical History</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    <AddHistoryEntry patientId={selectedPatient.id} onAdd={handleAddHistoryEntry} />
                    <ul className="space-y-4 mt-4">
                      {history
                        .filter(entry => entry.patientId === selectedPatient.id)
                        .map(entry => (
                          <li key={entry.id} className="border-b pb-2">
                            <p><strong>Date:</strong> {entry.date}</p>
                            <p>{entry.description}</p>
                            {entry.attachments.length > 0 && (
                              <div className="flex items-center mt-2">
                                <Paperclip className="h-4 w-4 mr-2" />
                                <span>{entry.attachments.length} attachment(s)</span>
                              </div>
                            )}
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="prescriptions" className="flex-grow overflow-auto h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Prescriptions</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    <AddPrescription patientId={selectedPatient.id} onAdd={handleAddPrescription} />
                    <ul className="space-y-4 mt-4">
                      {prescriptions
                        .filter(prescription => prescription.patientId === selectedPatient.id)
                        .map(prescription => (
                          <li key={prescription.id} className="border-b pb-2">
                            <p><strong>Date:</strong> {prescription.date}</p>
                            <p><strong>Medication:</strong> {prescription.medication}</p>
                            <p><strong>Dosage:</strong> {prescription.dosage}</p>
                            <p><strong>Instructions:</strong> {prescription.instructions}</p>
                            <p><strong>Renewal Date:</strong> {prescription.renewalDate}</p>
                            <Button onClick={() => printPrescription(prescription)} className="mt-2">
                              <Printer className="h-4 w-4 mr-2" /> Print Prescription
                            </Button>
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="timeline" className="flex-grow overflow-auto h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Patient Timeline</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    <ul className="space-y-4">
                      {[...history, ...prescriptions]
                        .filter(item => 'patientId' in item && item.patientId === selectedPatient.id)
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((item, index) => (
                          <li key={index} className="flex items-start space-x-4">
                            {'description' in item ? (
                              <>
                                <FileText className="h-5 w-5 mt-1" />
                                <div>
                                  <p><strong>{item.date}</strong></p>
                                  <p>{item.description}</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Calendar className="h-5 w-5 mt-1" />
                                <div>
                                  <p><strong>{item.date}</strong></p>
                                  <p>Prescription: {item.medication}</p>
                                </div>
                              </>
                            )}
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="notifications" className="flex-grow overflow-auto h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    <ul className="space-y-4">
                      {notifications
                        .filter(notification => notification.patientId === selectedPatient.id)
                        .map(notification => (
                          <li key={notification.id} className="flex items-start space-x-4">
                            <Bell className="h-5 w-5 mt-1" />
                            <div>
                              <p><strong>{notification.date}</strong></p>
                              <p>{notification.message}</p>
                              <p className="text-sm text-muted-foreground">Type: {notification.type}</p>
                            </div>
                          </li>
                        ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}


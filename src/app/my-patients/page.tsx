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
import { Search, Plus, Trash, Edit, UserPlus } from 'lucide-react'
import { Label } from "@/components/ui/label"
import { DialogFooter } from '@/components/ui/dialog'

export default function MyPatientsPage() {
  const { 
    patients, history, prescriptions, notifications, addPatient,
    addHistoryEntry, updateHistoryEntry, deleteHistoryEntry,
    addPrescription, updatePrescription, deletePrescription,
    addNotification, deleteNotification, getPatientsForDoctor
  } = useAppContext()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null)
  const [myPatients, setMyPatients] = useState<typeof patients>([])
  const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false)

  useEffect(() => {
    const loadPatients = async () => {
      if (user?.role === 'doctor') {
        const patients = await getPatientsForDoctor(user.id)
        setMyPatients(patients)
      }
    }
    loadPatients()
  }, [user, getPatientsForDoctor, patients])

  const filteredPatients = myPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    patient.phone.includes(searchTerm)
  )

  const patientNotifications = notifications.filter(n => n.patient_id === selectedPatient?.id)

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">My Patients</h1>
            <Dialog open={addPatientDialogOpen} onOpenChange={setAddPatientDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" /> Add Patient
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Patient</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                        e.preventDefault()
                        const formData = new FormData(e.currentTarget)
                        const patientData = {
                            name: formData.get('name') as string,
                            age: formData.get('age') ? parseInt(formData.get('age') as string) : undefined,
                            sex: formData.get('sex') as string || undefined,
                            address: formData.get('address') as string || undefined,
                            phone: formData.get('phone') as string,
                            email: formData.get('email') as string || undefined,
                            last_visit: new Date().toISOString().split('T')[0],
                            assigned_doctor_id: user?.id,
                            special_notes: ''
                        }
                        await addPatient(patientData)
                        setAddPatientDialogOpen(false)
                    }}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input id="name" name="name" placeholder="Full Name" required className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="age" className="text-right">
                                    Age
                                </Label>
                                <Input id="age" name="age" type="number" placeholder="Age" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="sex" className="text-right">
                                    Sex
                                </Label>
                                <Select name="sex">
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select sex" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="address" className="text-right">
                                    Address
                                </Label>
                                <Input id="address" name="address" placeholder="Address" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">
                                    Phone
                                </Label>
                                <Input id="phone" name="phone" placeholder="Phone Number" required className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">
                                    Email
                                </Label>
                                <Input id="email" name="email" type="email" placeholder="Email" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Add Patient</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
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


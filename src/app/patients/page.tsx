'use client'

import { useState, useEffect } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { UserPlus, Search, Plus, Trash, Edit, Paperclip, Calendar, FileText, Bell, Printer, ChevronDown } from 'lucide-react'
import { AddHistoryEntry } from '../components/AddHistoryEntry'
import { AddPrescription } from '../components/AddPrescription'
import { SpecialNotes } from '../components/SpecialNotes'
import { Label } from "@/components/ui/label"
import { DBHistoryEntry, DBPatient, DBPrescription } from '@/types/db'

export default function PatientsPage() {
  const { 
    patients, 
    doctors, 
    history, 
    prescriptions, 
    notifications,
    addPatient, 
    updatePatient, // Ensure this is available in your context
    addHistoryEntry, 
    updateHistoryEntry, 
    deleteHistoryEntry, 
    getPatientHistory,
    addPrescription, 
    updatePrescription, 
    deletePrescription, 
    getPatientPrescription,
    addNotification, 
    deleteNotification, 
    assignPatientToDoctor
  } = useAppContext()

  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<DBPatient | null>(null)
  const [patientData, setPatientData] = useState<{
    history: DBHistoryEntry[];
    prescriptions: DBPrescription[];
  } | null>(null)
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'recent' | 'overdue'>('all')
  const [addPatientDialogOpen, setAddPatientDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 1. New States for Editing
  const [isEditing, setIsEditing] = useState(false)
  // We'll store each patient field as a string, converting numbers to strings, etc.
  const [editData, setEditData] = useState({
    name: '',
    age: '',
    sex: '',
    address: '',
    phone: '',
    email: '',
    last_visit: '',
  })

  // Filter patients
  const filteredPatients = (patients || []).filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)

    if (filterCriteria === 'all') return matchesSearch

    if (filterCriteria === 'recent') {
      const lastVisitDate = new Date(patient.last_visit)
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      return matchesSearch && lastVisitDate >= oneMonthAgo
    }

    if (filterCriteria === 'overdue') {
      const lastVisitDate = new Date(patient.last_visit)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      return matchesSearch && lastVisitDate < sixMonthsAgo
    }

    return false
  })

  // 2. When a patient is selected, fetch data and also populate editData
  const handleSelectPatient = async (patient: DBPatient) => {
    setIsLoading(true)
    setSelectedPatient(patient)
    setIsEditing(false) // reset editing mode if any
    try {
      const [patientHistory, patientPrescriptions] = await Promise.all([
        getPatientHistory(patient.id),
        getPatientPrescription(patient.id),
      ])

      setPatientData({
        history: patientHistory,
        prescriptions: patientPrescriptions,
      })

      // Populate editData from the selected patient
      setEditData({
        name: patient.name,
        age: patient.age?.toString() || '', // convert number -> string for input
        sex: patient.sex || '',            // if null or undefined, store empty string
        address: patient.address || '',
        phone: patient.phone,
        email: patient.email || '',
        last_visit: patient.last_visit,
      })
    } catch (error) {
      console.error("Failed to fetch patient data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Handler for saving the edits
  const handleSaveEdits = async () => {
    if (!selectedPatient) return

    try {
      // Convert editData fields to the correct types if needed
      const updatedData: Partial<DBPatient> = {
        name: editData.name,
        age: editData.age ? parseInt(editData.age) : undefined,
        // If user picks 'not_provided', treat it as undefined (optional)
        sex: editData.sex || undefined,
        address: editData.address || undefined,
        phone: editData.phone,
        email: editData.email || undefined,
        last_visit: editData.last_visit, 
      }

      await updatePatient(selectedPatient.id, updatedData)

      // Update the local selectedPatient so it reflects changes in the UI
      setSelectedPatient({ ...selectedPatient, ...updatedData })
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating patient:", error)
    }
  }

  // Handle new history entry
  const handleAddHistoryEntry = async (entry: { date: string; description: string; attachments: File[] }) => {
    if (selectedPatient) {
      await addHistoryEntry({
        patient_id: selectedPatient.id,
        date: entry.date,
        description: entry.description,
        doctor_id: user?.id ?? 0,
        attachments: entry.attachments.map(file => URL.createObjectURL(file))
      })
    }
  }

  // Handle new prescription
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

  // Handle updating special notes
  const handleUpdateSpecialNotes = async (notes: string) => {
    if (selectedPatient) {
      await updatePatient(selectedPatient.id, { special_notes: notes })
      // Optionally update local state
      setSelectedPatient({ ...selectedPatient, special_notes: notes })
    }
  }

  // Print Prescription
  const printPrescription = (prescription: DBPrescription) => {
    const patient = patients.find(p => p.id === prescription.patient_id)
    const doctor = doctors.find(d => d.id === patient?.assigned_doctor_id)
    
    const prescriptionContent = `
      <h1>Prescription</h1>
      <p><strong>Patient:</strong> ${patient?.name}</p>
      <p><strong>Doctor:</strong> ${doctor?.name}</p>
      <p><strong>Date:</strong> ${prescription.date}</p>
      <p><strong>Medication:</strong> ${prescription.medication}</p>
      <p><strong>Dosage:</strong> ${prescription.dosage}</p>
      <p><strong>Instructions:</strong> ${prescription.instructions}</p>
      <p><strong>Renewal Date:</strong> ${prescription.renewal_date}</p>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write('<html><head><title>Prescription</title></head><body>')
      printWindow.document.write(prescriptionContent)
      printWindow.document.write('</body></html>')
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Heading + Add button */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Patients</h1>
        {user?.role === 'admin' && (
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
                await addPatient({
                  name: formData.get('name') as string,
                  age: formData.get('age') ? parseInt(formData.get('age') as string) : undefined,
                  sex: formData.get('sex') as string || undefined,
                  address: formData.get('address') as string || undefined,
                  phone: formData.get('phone') as string,
                  email: formData.get('email') as string || undefined,
                  last_visit: new Date().toISOString().split('T')[0],
                  assigned_doctor_id: null,
                  special_notes: ''
                })
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
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search patients..." 
          className="max-w-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select 
          value={filterCriteria} 
          onValueChange={(value: 'all' | 'recent' | 'overdue') => setFilterCriteria(value)}
        >
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

      {/* Patients Table */}
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
            <TableRow 
              key={patient.id} 
              onClick={() => handleSelectPatient(patient)} 
              className="cursor-pointer"
            >
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>{patient.last_visit}</TableCell>
              {user?.role === 'admin' && (
                <TableCell>
                  <Select
                    // If assigned_doctor_id is null, fallback to 'none' or some valid string
                    value={patient.assigned_doctor_id ? patient.assigned_doctor_id.toString() : 'none'}
                    onValueChange={(value) => {
                      if (value === 'none') {
                        // Optionally implement an 'unassign' logic, e.g. pass null
                        assignPatientToDoctor(patient, 0)

                      } else {
                        assignPatientToDoctor(patient, parseInt(value))
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Provide an item for 'none' if doctor is not assigned */}
                      <SelectItem value="none">Unassigned</SelectItem>
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

      {/* Patient Details Dialog */}
      {selectedPatient && (
        <Dialog 
          open={!!selectedPatient} 
          onOpenChange={(open) => !open && setSelectedPatient(null)}
        >
          <DialogContent className="max-w-4xl w-5/6 h-5/6 flex flex-col overflow-hidden">
            <DialogHeader>
              <DialogTitle>Patient Details</DialogTitle>
            </DialogHeader>
            
            <div className="flex-grow flex overflow-hidden">
              <Tabs defaultValue="details" className="flex-grow flex flex-col overflow-hidden">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  {/* <TabsTrigger value="notifications">Notifications</TabsTrigger> */}
                </TabsList>
                
                <div className="flex-grow flex overflow-hidden">
                  <div className="flex-grow overflow-auto pr-4">
                    
                    {/* DETAILS TAB */}
                    <TabsContent value="details" className="h-full">
                      <Card className="h-full">
                        {/* Header with Edit/Cancel Button */}
                        <CardHeader className="flex justify-between items-center">
                          <CardTitle>
                            {isEditing ? 'Edit Patient Details' : selectedPatient.name}
                          </CardTitle>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setIsEditing(!isEditing)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            {isEditing ? 'Cancel' : 'Edit'}
                          </Button>
                        </CardHeader>
                        
                        <CardContent>
                          {isEditing ? (
                            <div className="space-y-4">
                              {/* Name */}
                              <div>
                                <Label className="block font-semibold" htmlFor="editName">
                                  Name
                                </Label>
                                <Input
                                  id="editName"
                                  value={editData.name}
                                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                />
                              </div>

                              {/* Age */}
                              <div>
                                <Label className="block font-semibold" htmlFor="editAge">
                                  Age
                                </Label>
                                <Input
                                  id="editAge"
                                  type="number"
                                  value={editData.age}
                                  onChange={(e) => setEditData({ ...editData, age: e.target.value })}
                                />
                              </div>

                              {/* Sex */}
                              <div>
                                <Label className="block font-semibold">Sex</Label>
                                <Select
                                  value={editData.sex}
                                  onValueChange={(val) => setEditData({ ...editData, sex: val })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Sex" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {/* No empty-string value to avoid errors */}
                                    {/* If you want a 'Not Provided' option, do this instead:
                                        <SelectItem value="not_provided">Not Provided</SelectItem>
                                    */}
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Address */}
                              <div>
                                <Label className="block font-semibold" htmlFor="editAddress">
                                  Address
                                </Label>
                                <Input
                                  id="editAddress"
                                  value={editData.address}
                                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                />
                              </div>

                              {/* Phone */}
                              <div>
                                <Label className="block font-semibold" htmlFor="editPhone">
                                  Phone
                                </Label>
                                <Input
                                  id="editPhone"
                                  value={editData.phone}
                                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                              </div>

                              {/* Email */}
                              <div>
                                <Label className="block font-semibold" htmlFor="editEmail">
                                  Email
                                </Label>
                                <Input
                                  id="editEmail"
                                  type="email"
                                  value={editData.email}
                                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                />
                              </div>

                              {/* Last Visit */}
                              <div>
                                <Label className="block font-semibold" htmlFor="editLastVisit">
                                  Last Visit
                                </Label>
                                <Input
                                  id="editLastVisit"
                                  type="date"
                                  value={editData.last_visit}
                                  onChange={(e) => setEditData({ ...editData, last_visit: e.target.value })}
                                />
                              </div>

                              <Button onClick={handleSaveEdits}>Save</Button>
                            </div>
                          ) : (
                            // Read-only fields
                            <div className="space-y-2">
                              <p><strong>Age:</strong> {selectedPatient.age ?? 'Not provided'}</p>
                              <p><strong>Sex:</strong> {selectedPatient.sex ?? 'Not provided'}</p>
                              <p><strong>Address:</strong> {selectedPatient.address ?? 'Not provided'}</p>
                              <p><strong>Phone:</strong> {selectedPatient.phone}</p>
                              <p><strong>Email:</strong> {selectedPatient.email ?? 'Not provided'}</p>
                              <p><strong>Last Visit:</strong> {selectedPatient.last_visit}</p>
                              <p>
                                <strong>Assigned Doctor:</strong>{' '}
                                {doctors.find(d => d.id === selectedPatient.assigned_doctor_id)?.name || 'Not assigned'}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* HISTORY TAB */}
                    <TabsContent value="history" className="h-full">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle>Medical History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 overflow-auto">
                          <SpecialNotes
                            patientId={selectedPatient.id}
                            initialNotes={selectedPatient.special_notes || ''}
                            onSave={handleUpdateSpecialNotes}
                          />
                          <Collapsible className="border rounded-lg shadow-sm">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <h3 className="text-lg font-semibold">Add New History Entry</h3>
                              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 bg-white">
                              <AddHistoryEntry patientId={selectedPatient.id} onAdd={handleAddHistoryEntry} />
                            </CollapsibleContent>
                          </Collapsible>
                          <ul className="space-y-4 mt-4">
                            {patientData?.history && patientData.history.length > 0 ? (
                              patientData.history
                                .filter(entry => entry.patient_id === selectedPatient.id)
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
                                ))
                            ) : (
                              <p>No history entries available</p>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* PRESCRIPTIONS TAB */}
                    <TabsContent value="prescriptions" className="h-full">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle>Prescriptions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 overflow-auto">
                          <Collapsible className="border rounded-lg shadow-sm">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <h3 className="text-lg font-semibold">Add New Prescription</h3>
                              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 bg-white">
                              <AddPrescription patientId={selectedPatient.id} onAdd={handleAddPrescription} />
                            </CollapsibleContent>
                          </Collapsible>
                          <ul className="space-y-4 mt-4">
                            {patientData?.prescriptions && patientData.prescriptions.length > 0 ? (
                              patientData.prescriptions
                                .filter(prescription => prescription.patient_id === selectedPatient.id)
                                .map(prescription => (
                                  <li key={prescription.id} className="border-b pb-2">
                                    <p><strong>Date:</strong> {prescription.date}</p>
                                    <p><strong>Medication:</strong> {prescription.medication}</p>
                                    <p><strong>Dosage:</strong> {prescription.dosage}</p>
                                    <p><strong>Instructions:</strong> {prescription.instructions}</p>
                                    <p><strong>Renewal Date:</strong> {prescription.renewal_date}</p>
                                    <Button onClick={() => printPrescription(prescription)} className="mt-2">
                                      <Printer className="h-4 w-4 mr-2" /> Print Prescription
                                    </Button>
                                  </li>
                                ))
                            ) : (
                              <p>No prescriptions available</p>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* TIMELINE TAB */}
                    <TabsContent value="timeline" className="h-full">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle>Patient Timeline</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto">
                          <ul className="space-y-4">
                            {patientData ? (
                              [...(patientData.history || []), ...(patientData.prescriptions || [])]
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
                                ))
                            ) : (
                              <li>Loading patient data...</li>
                            )}
                          </ul>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    {/* Uncomment if you want to re-enable Notifications
                    <TabsContent value="notifications" className="h-full">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle>Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-auto">
                          <ul className="space-y-4">
                            {notifications
                              .filter(notification => notification.patient_id === selectedPatient.id)
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
                    */}
                  </div>
                </div>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

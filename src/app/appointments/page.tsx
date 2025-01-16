'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, Edit, Trash } from 'lucide-react'
import { DBPatient } from '@/types/db'
import { Input } from '@/components/ui/input'

export default function AppointmentsPage() {
  const { appointments, patients, addAppointment, updateAppointment, deleteAppointment, getPatientsForDoctor } = useAppContext()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [addAppointmentDialogOpen, setAddAppointmentDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<typeof appointments[0] | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [myPatients, setMyPatients] = useState<DBPatient[]>([])

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

  const filteredAppointments = appointments.filter(
    appointment => {
      // Convert both dates to Date objects for reliable comparison
      const appointmentDate = new Date(appointment.date);
      const selectedDateTime = selectedDate ? new Date(selectedDate.setHours(0, 0, 0, 0)) : null;

      // Compare the dates after normalizing them to start of day
      const isCorrectDate = selectedDateTime &&
        appointmentDate.toISOString().split('T')[0] === selectedDateTime.toISOString().split('T')[0];

      const isAssignedPatient = user?.role === 'admin' || myPatients.some(p => p.id === appointment.patient_id)
      return isCorrectDate && isAssignedPatient
    }
  )

  const handleUpdateAppointment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedAppointment) return
    const formData = new FormData(e.currentTarget)
    await updateAppointment(selectedAppointment.id, {
      patient_id: Number(formData.get('patientId')),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      type: formData.get('type') as string
    })
    setIsEditDialogOpen(false)
    setSelectedAppointment(null)
  }

  const handleDeleteAppointment = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      await deleteAppointment(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <Dialog open={addAppointmentDialogOpen} onOpenChange={setAddAppointmentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              await addAppointment({
                patient_id: Number(formData.get('patientId')),
                date: (formData.get('date') as string).split('T')[0],
                time: formData.get('time') as string,
                type: formData.get('type') as string,
                doctor_id: 0,
                status: 'scheduled'
              })
              setAddAppointmentDialogOpen(false)
            }}>
              <div className="grid gap-4 py-4">
                <Select name="patientId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {myPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>{patient.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="date" name="date" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                <input type="time" name="time" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                <input type="text" name="type" placeholder="Appointment Type" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
              </div>
              <Button type="submit">Add Appointment</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar 
              mode="single" 
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border" 
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Appointments for {selectedDate?.toDateString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {filteredAppointments.map((appointment) => {
                const patient = myPatients.find(p => p.id === appointment.patient_id)
                return (
                  <li key={appointment.id} className="flex items-center justify-between space-x-4">
                    <div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{patient?.name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.time} - {appointment.type}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => {
                        setSelectedAppointment(appointment)
                        setIsEditDialogOpen(true)
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteAppointment(appointment.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateAppointment}>
            <div className="grid gap-4 py-4">
              <Select name="patientId" defaultValue={selectedAppointment?.patient_id.toString()} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {myPatients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>{patient.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" name="date" defaultValue={selectedAppointment?.date} required />
              <Input type="time" name="time" defaultValue={selectedAppointment?.time} required />
              <Input type="text" name="type" placeholder="Appointment Type" defaultValue={selectedAppointment?.type} required />
            </div>
            <DialogFooter>
              <Button type="submit">Update Appointment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}


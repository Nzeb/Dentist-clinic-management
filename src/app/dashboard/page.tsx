'use client'

import { useAuth } from '../contexts/AuthContext'
import { useAppContext } from '../contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, UserIcon, ActivityIcon, DollarSignIcon } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const { patients, appointments, treatments, invoices, getPatientsForDoctor } = useAppContext()

  const myPatients = user?.role === 'doctor' ? getPatientsForDoctor(user.id) : []

  // const todayAppointments = appointments.filter(appointment => {
  //   const today = new Date().toISOString().split('T')[0];
  //   return appointment.date === today && (user?.role === 'admin' || (user?.role === 'doctor' && myPatients.some(p => p.id === appointment.patient_id)))
  // })

  
  const todayAppointments = appointments.filter(appointment => {
    const today = new Date();
    const appointmentDate = new Date(appointment.date);
    // Compare the year, month, and day components
    return today.getFullYear() === appointmentDate.getFullYear() &&
      today.getMonth() === appointmentDate.getMonth() &&
      today.getDate() === appointmentDate.getDate();
  });
  

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{user?.role === 'admin' ? patients.length : myPatients.length}</div> */}
            <div className="text-2xl font-bold">{ patients.length }</div>
            {/* <p className="text-xs text-muted-foreground">+20% from last month</p> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            {/* <p className="text-xs text-muted-foreground">2 more than yesterday</p> */}
          </CardContent>
        </Card>
        {user?.role === 'admin' && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Treatments</CardTitle>
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{treatments.length}</div>
                {/* <p className="text-xs text-muted-foreground">+5% from last week</p> */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${invoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount.replace('$', '')), 0).toFixed(2)}
                </div>
                {/* <p className="text-xs text-muted-foreground">+12% from last month</p> */}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}


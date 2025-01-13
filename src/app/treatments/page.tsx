'use client'

import { useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FilePlus, SmileIcon as Tooth } from 'lucide-react'

export default function TreatmentsPage() {
  const { treatments, addTreatment, patients, getPatientsForDoctor } = useAppContext()
  const { user } = useAuth()
  const [selectedTreatment, setSelectedTreatment] = useState<typeof treatments[0] | null>(null)
  const [addTreatmentDialogOpen, setAddTreatmentDialogOpen] = useState(false)

  const myPatients = user?.role === 'doctor' ? getPatientsForDoctor(user.id) : patients

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Treatments</h1>
        {user?.role === 'admin' && (
          <Dialog open={addTreatmentDialogOpen} onOpenChange={setAddTreatmentDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePlus className="mr-2 h-4 w-4" /> Add Treatment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Treatment</DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                await addTreatment({
                  name: formData.get('name') as string,
                  duration: formData.get('duration') as string,
                  price: formData.get('price') as string
                })
                setAddTreatmentDialogOpen(false)
              }}>
                <div className="grid gap-4 py-4">
                  <Input id="name" name="name" placeholder="Treatment Name" required />
                  <Input id="duration" name="duration" placeholder="Duration (e.g., 30 mins)" required />
                  <Input id="price" name="price" placeholder="Price" required />
                </div>
                <Button type="submit">Add Treatment</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {treatments.map((treatment) => (
          <Card key={treatment.id} onClick={() => setSelectedTreatment(treatment)} className="cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{treatment.name}</CardTitle>
              <Tooth className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{treatment.price}</div>
              <p className="text-xs text-muted-foreground">Duration: {treatment.duration}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {selectedTreatment && (
        <Dialog open={!!selectedTreatment} onOpenChange={() => setSelectedTreatment(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Treatment Details</DialogTitle>
            </DialogHeader>
            <Card>
              <CardHeader>
                <CardTitle>{selectedTreatment.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Duration:</strong> {selectedTreatment.duration}</p>
                <p><strong>Price:</strong> {selectedTreatment.price}</p>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Recent Treatments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myPatients.slice(0, 3).map((patient, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{treatments[index % treatments.length].name}</TableCell>
                  <TableCell>{new Date().toISOString().split('T')[0]}</TableCell>
                  <TableCell>{treatments[index % treatments.length].price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useAppContext } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DollarSign, FileText, CreditCard, Edit, Trash } from 'lucide-react'

export default function BillingPage() {
  const { invoices, patients, addInvoice, getPatientsForDoctor } = useAppContext()
  const { user } = useAuth()
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoices[0] | null>(null)
  const [createInvoiceDialogOpen, setCreateInvoiceDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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

  const myInvoices = invoices.filter(invoice => myPatients.some(p => p.id === invoice.patient_id))

  const totalRevenue = myInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount.replace('$', '')), 0)
  const pendingPayments = myInvoices.filter(invoice => invoice.status === 'Pending')
  const overduePayments = myInvoices.filter(invoice => invoice.status === 'Overdue')

  const handleUpdateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!selectedInvoice) return
    const formData = new FormData(e.currentTarget)
    await updateInvoice(selectedInvoice.id, {
      patientId: Number(formData.get('patientId')),
      date: formData.get('date') as string,
      amount: formData.get('amount') as string,
      status: formData.get('status') as 'Paid' | 'Pending' | 'Overdue'
    })
    setIsEditDialogOpen(false)
    setSelectedInvoice(null)
  }

  // TODO think if we should add delete invoice option
  // const handleDeleteInvoice = async (id: number) => {
  //   if (window.confirm('Are you sure you want to delete this invoice?')) {
  //     await deleteInvoice(id)
  //   }
  // }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Billing</h1>
        {user?.role === 'admin' && (
          <Dialog open={createInvoiceDialogOpen} onOpenChange={setCreateInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FileText className="mr-2 h-4 w-4" /> Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                await addInvoice({
                  patient_id: Number(formData.get('patientId')),
                  date: new Date().toISOString().split('T')[0],
                  amount: `$${formData.get('amount')}`,
                  status: formData.get('status') as 'Paid' | 'Pending' | 'Overdue',
                  due_date: ''
                })
                setCreateInvoiceDialogOpen(false)
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
                  <Input id="amount" name="amount" placeholder="Amount" required />
                  <Select name="status" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Create Invoice</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingPayments.reduce((sum, invoice) => sum + parseFloat(invoice.amount.replace('$', '')), 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {pendingPayments.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overduePayments.reduce((sum, invoice) => sum + parseFloat(invoice.amount.replace('$', '')), 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {overduePayments.length} invoices</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>A list of recent invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myInvoices.map((invoice) => {
                const patient = myPatients.find(p => p.id === invoice.patient_id)
                return (
                  <TableRow key={invoice.id} onClick={() => setSelectedInvoice(invoice)} className="cursor-pointer">
                    <TableCell className="font-medium">{patient?.name}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>{invoice.status}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon" onClick={() => {
                          setSelectedInvoice(invoice)
                          setIsEditDialogOpen(true)
                        }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* <Button variant="outline" size="icon" onClick={() => handleDeleteInvoice(invoice.id)}>
                          <Trash className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">View All Invoices</Button>
        </CardFooter>
      </Card>
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
            </DialogHeader>
            <Card>
              <CardHeader>
                <CardTitle>Invoice #{selectedInvoice.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Patient:</strong> {myPatients.find(p => p.id === selectedInvoice.patient_id)?.name}</p>
                <p><strong>Date:</strong> {selectedInvoice.date}</p>
                <p><strong>Amount:</strong> {selectedInvoice.amount}</p>
                <p><strong>Status:</strong> {selectedInvoice.status}</p>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      )}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateInvoice}>
            <div className="grid gap-4 py-4">
              <Select name="patientId" defaultValue={selectedInvoice?.patient_id.toString()} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {myPatients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>{patient.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input type="date" name="date" defaultValue={selectedInvoice?.date} required />
              <Input type="text" name="amount" defaultValue={selectedInvoice?.amount} required />
              <Select name="status" defaultValue={selectedInvoice?.status} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit">Update Invoice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function updateInvoice(id: number, arg1: { patientId: number; date: string; amount: string; status: "Paid" | "Pending" | "Overdue" }) {
  throw new Error('Function not implemented.')
}


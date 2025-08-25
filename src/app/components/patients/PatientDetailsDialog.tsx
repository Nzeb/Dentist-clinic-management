'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Paperclip, Plus, Edit, Calendar, FileText, Printer, ChevronDown } from 'lucide-react'
import { AddHistoryEntry } from '../AddHistoryEntry'
import { EditHistoryEntry } from '../EditHistoryEntry'
import { AddPrescription } from '../AddPrescription'
import { SpecialNotes } from '../SpecialNotes'
import ManagementPlan from '../ManagementPlan'
import { AttachmentViewer } from '../AttachmentViewer'
import { DBHistoryEntry, DBPatient, DBPrescription, DBUser } from '@/types/db'

interface PatientDetailsDialogProps {
  patient: DBPatient | null;
  isOpen: boolean;
  onClose: () => void;
  patientData: {
    history: DBHistoryEntry[];
    prescriptions: DBPrescription[];
  } | null;
  doctors: DBUser[];
  user: DBUser | null;
  onUpdateSpecialNotes: (notes: string) => Promise<void>;
  onAddHistoryEntry: (entry: { date: string; description: string; attachments: File[] }) => Promise<void>;
  onUpdateHistoryEntry: (entry: { date: string; description: string }) => Promise<void>;
  onDeleteAttachment: (attachmentUrl: string) => Promise<void>;
  onAddAttachments: (historyId: number, files: File[]) => Promise<void>;
  onAddPrescription: (prescription: { date: string; medication: string; dosage: string; instructions: string; renewalDate: string }) => Promise<void>;
}

export function PatientDetailsDialog({
  patient,
  isOpen,
  onClose,
  patientData,
  doctors,
  user,
  onUpdateSpecialNotes,
  onAddHistoryEntry,
  onUpdateHistoryEntry,
  onDeleteAttachment,
  onAddAttachments,
  onAddPrescription,
}: PatientDetailsDialogProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [selectedAttachments, setSelectedAttachments] = useState<{ fileName: string; description?: string }[]>([])
  const [viewerDescription, setViewerDescription] = useState('')
  const [editingHistoryEntry, setEditingHistoryEntry] = useState<DBHistoryEntry | null>(null)

  if (!patient) return null

  const handleViewAttachments = (attachments: string[], description: string) => {
    setSelectedAttachments(attachments.map(fileName => ({ fileName })));
    setViewerDescription(description);
    setIsViewerOpen(true);
  };

  const printPrescription = (prescription: DBPrescription) => {
    const doctor = doctors.find(d => d.id === patient?.assigned_doctor_id)

    const prescriptionContent = `
      <h1>Prescription</h1>
      <p><strong>Patient:</strong> ${patient?.name}</p>
      <p><strong>Doctor:</strong> ${doctor?.fullName}</p>
      <p><strong>Date:</strong> ${prescription.date}</p>
      <p><strong>Medication:</strong> ${prescription.medication}</p>
      <p><strong>Dosage:</strong> ${prescription.dosage}</p>
      <p><strong>Instructions:</strong> ${prescription.instructions}</p>
      <p><strong>Renewal Date:</strong> ${prescription.renewal_date}</p>
    `

    const printWindow = window.open('', '_blank')
    printWindow?.document.write('<html><head><title>Prescription</title></head><body>')
    printWindow?.document.write(prescriptionContent)
    printWindow?.document.write('</body></html>')
    printWindow?.document.close()
    printWindow?.print()
  }

  const handleUpdateHistoryEntry = async (entry: { date: string; description: string }) => {
    await onUpdateHistoryEntry(entry);
    setEditingHistoryEntry(null);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
                <TabsTrigger value="management-plan">Management Plan</TabsTrigger>
              </TabsList>
              <div className="flex-grow flex overflow-hidden">
                <div className="flex-grow overflow-auto pr-4">
                  <TabsContent value="details" className="h-full">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>{patient.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p><strong>Age:</strong> {patient.age || 'Not provided'}</p>
                        <p><strong>Sex:</strong> {patient.sex || 'Not provided'}</p>
                        <p><strong>Address:</strong> {patient.address || 'Not provided'}</p>
                        <p><strong>Phone:</strong> {patient.phone}</p>
                        <p><strong>Email:</strong> {patient.email || 'Not provided'}</p>
                        <p><strong>Last Visit:</strong> {patient.last_visit}</p>
                        <p><strong>Assigned Doctor:</strong> {doctors.find(d => d.id === patient.assigned_doctor_id)?.fullName || 'Not assigned'}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="management-plan" className="h-full">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Management Plan</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ManagementPlan patient={patient} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="history" className="h-full">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Medical History</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 overflow-auto">
                        <SpecialNotes
                          patientId={patient.id}
                          initialNotes={patient.special_notes || ''}
                          onSave={onUpdateSpecialNotes}
                        />
                        {(user?.role.toLowerCase() === 'admin' || user?.role.toLowerCase() === 'doctor' || user?.role.toLowerCase() === 'reception') && (
                          <Collapsible className="border rounded-lg shadow-sm">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <h3 className="text-lg font-semibold">Add New History Entry</h3>
                              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 bg-white">
                              <AddHistoryEntry patientId={patient.id} onAdd={onAddHistoryEntry} />
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        <div className="space-y-4 mt-4">
                          {patientData?.history && patientData.history.length > 0 ? (
                            patientData.history.filter(entry => entry.patient_id === patient.id)
                              .map(entry => (
                                <Card key={entry.id}>
                                  <CardContent className="p-4">
                                    <p><strong>Date:</strong> {entry.date}</p>
                                    <p>{entry.description}</p>
                                    <div className="flex space-x-2 mt-2">
                                      {entry.attachments && entry.attachments.length > 0 && (
                                        <Button onClick={() => handleViewAttachments(entry.attachments, entry.description)} className="mt-2">
                                          <Paperclip className="h-4 w-4 mr-2" />
                                          View Attachments ({entry.attachments.length})
                                        </Button>
                                      )}
                                      <Button onClick={() => document.getElementById(`add-attachment-${entry.id}`)?.click()} className="mt-2">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Attachment
                                      </Button>
                                      <input
                                        type="file"
                                        id={`add-attachment-${entry.id}`}
                                        style={{ display: 'none' }}
                                        multiple
                                        onChange={(e) => onAddAttachments(entry.id, Array.from(e.target.files || []))}
                                      />
                                      <Button onClick={() => setEditingHistoryEntry(entry)} className="mt-2">
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))) : (
                                <p>No history available</p>
                              )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="prescriptions" className="h-full">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Prescriptions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 overflow-auto">
                        {(user?.role.toLowerCase() === 'admin' || user?.role.toLowerCase() === 'doctor') && (
                          <Collapsible className="border rounded-lg shadow-sm">
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <h3 className="text-lg font-semibold">Add New Prescription</h3>
                              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="p-4 bg-white">
                              <AddPrescription patientId={patient.id} onAdd={onAddPrescription} />
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                        <ul className="space-y-4 mt-4">
                          {patientData?.prescriptions && patientData.prescriptions.length > 0 ? (
                            patientData.prescriptions
                              .filter(prescription => prescription.patient_id === patient.id)
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
                              ))) : (
                            <p>No prescriptions available</p>
                          )}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
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
                                        <p>{(item as DBHistoryEntry).description}</p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <Calendar className="h-5 w-5 mt-1" />
                                      <div>
                                        <p><strong>{item.date}</strong></p>
                                        <p>Prescription: {(item as DBPrescription).medication}</p>
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
                </div>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
      <AttachmentViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        attachments={selectedAttachments}
        description={viewerDescription}
      />
      {editingHistoryEntry && (
        <Dialog open={!!editingHistoryEntry} onOpenChange={(open) => !open && setEditingHistoryEntry(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit History Entry</DialogTitle>
                </DialogHeader>
                <EditHistoryEntry
                    entry={editingHistoryEntry}
                    onUpdate={(entryUpdate) => {
                      if(editingHistoryEntry) {
                        handleUpdateHistoryEntry(entryUpdate)
                      }
                    }}
                    onDeleteAttachment={onDeleteAttachment}
                />
            </DialogContent>
        </Dialog>
      )}
    </>
  )
}

'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DBPatient, DBUser } from "@/types/db"

interface PatientsTableProps {
  patients: DBPatient[];
  onSelectPatient: (patient: DBPatient) => void;
  onAssignDoctor?: (patient: DBPatient, doctorId: number) => void;
  user: DBUser | null;
  doctors?: DBUser[];
  showAssignDoctor?: boolean;
}

export function PatientsTable({ patients, onSelectPatient, onAssignDoctor, user, doctors, showAssignDoctor }: PatientsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>Last Visit</TableHead>
          {showAssignDoctor && (user?.role.toLowerCase() === 'admin' || user?.role.toLowerCase() === 'reception') && <TableHead>Assigned Doctor</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id} onClick={() => onSelectPatient(patient)} className="cursor-pointer">
            <TableCell className="font-medium">{patient.name}</TableCell>
            <TableCell>{patient.email}</TableCell>
            <TableCell>{patient.phone}</TableCell>
            <TableCell>{patient.last_visit}</TableCell>
            {showAssignDoctor && (user?.role.toLowerCase() === 'admin' || user?.role.toLowerCase() === 'reception') && (
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Select
                  value={patient.assigned_doctor_id?.toString() || ''}
                  onValueChange={(value) => onAssignDoctor?.(patient, parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors?.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.fullName}
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
  )
}

'use client'

import ManagementPlan from '../components/ManagementPlan'
import { DBPatient } from '@/types/db'

export default function VerificationPage() {
  const mockPatient: DBPatient = {
    id: 1,
    name: 'Test Patient',
    age: 42,
    sex: 'Male',
    address: '123 Fake St',
    phone: '555-555-5555',
    email: 'test@example.com',
    last_visit: '2023-01-01',
    assigned_doctor_id: 1,
    special_notes: 'This is a test patient.'
  }

  return (
    <div className="p-8">
      <ManagementPlan patient={mockPatient} />
    </div>
  )
}

// src/app/api/patients/[id]/route.ts
import { NextResponse } from 'next/server';
import { PatientService } from '@/server/services/patientService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const patientService = new PatientService();
    const patient = await patientService.updatePatient(parseInt(params.id), data);
    
    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error in PATCH /api/patients/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
}
// src/app/api/patients/route.ts
import { NextResponse } from 'next/server';
import { PatientService } from '@/server/services/patientService';

export async function GET() {
  console.log('Received GET request to /api/patients');

  try {
    const patientService = new PatientService();
    const patients = await patientService.getAllPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('Received POST request to /api/patients');
  try {
    console.log('Received POST request to /api/patients');
    const data = await request.json();
    const patientService = new PatientService();
    const patient = await patientService.createPatient(data);
    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error in POST /api/patients:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
}








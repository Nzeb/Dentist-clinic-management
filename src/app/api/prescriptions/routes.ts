// src/app/api/prescriptions/route.ts
import { NextResponse } from 'next/server';
import { PrescriptionService } from '@/server/services/prescriptionService';

export async function GET() {
  try {
    const prescriptionService = new PrescriptionService();
    const prescriptions = await prescriptionService.getAllPrescriptions();
    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Error in GET /api/prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const prescriptionService = new PrescriptionService();
    const prescription = await prescriptionService.createPrescription(data);
    return NextResponse.json(prescription);
  } catch (error) {
    console.error('Error in POST /api/prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
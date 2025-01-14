// src/app/api/treatments/route.ts
import { NextResponse } from 'next/server';
import { TreatmentService } from '@/server/services/treatmentService';

export async function GET() {
  try {
    const treatmentService = new TreatmentService();
    const treatments = await treatmentService.getAllTreatments();
    return NextResponse.json(treatments);
  } catch (error) {
    console.error('Error in GET /api/treatments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch treatments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const treatmentService = new TreatmentService();
    const treatment = await treatmentService.createTreatment(data);
    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Error in POST /api/treatments:', error);
    return NextResponse.json(
      { error: 'Failed to create treatment' },
      { status: 500 }
    );
  }
}

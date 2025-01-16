import { NextResponse } from 'next/server';
import { PrescriptionService } from '@/server/services/prescriptionService';

// Change the function signature to use Request as first parameter
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Add defensive check for params
  if (!params?.id) {
    return NextResponse.json(
      { error: 'Patient ID is required' },
      { status: 400 }
    );
  }

  console.log("PatientId for Prescription", params.id);
  
  // Validate the ID parameter
  if (isNaN(parseInt(params.id))) {
    return NextResponse.json(
      { error: 'Invalid patient ID format' },
      { status: 400 }
    );
  }

  try {
    const prescriptionService = new PrescriptionService();
    const patientId = parseInt(params.id);
    
    console.log("Fetching Prescription for patient ID:", patientId);
    
    const Prescription = await prescriptionService.getPatientPrescriptions(patientId);
    
    if (!Prescription) {
      return NextResponse.json(
        { error: 'No Prescription found for this patient' },
        { status: 404 }
      );
    }

    return NextResponse.json(Prescription);
    
  } catch (error) {
    console.error('Error in GET /api/prescription:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch Prescription',
          message: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch Prescription' },
      { status: 500 }
    );
  }
}

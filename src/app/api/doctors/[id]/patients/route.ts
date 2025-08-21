import { NextResponse } from 'next/server';
import { PatientService } from '@/server/services/patientService';

// Change the function signature to use Request as first parameter
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Add defensive check for params
  if (!params?.id) {
    return NextResponse.json(
      { error: 'Doctor ID is required' },
      { status: 400 }
    );
  }
  
  // Validate the ID parameter
  if (isNaN(parseInt(params.id))) {
    return NextResponse.json(
      { error: 'Invalid doctor ID format' },
      { status: 400 }
    );
  }

  try {
    const patientService = new PatientService();
    const doctorId = parseInt(params.id);
    
    const patients = await patientService.getPatientsForDoctor(doctorId);
    
    if (!patients) {
      return NextResponse.json(
        { error: 'No patient found for this doctor' },
        { status: 404 }
      );
    }

    return NextResponse.json(patients);
    
  } catch (error) {
    console.error('Error in GET /api/doctors/[id]/patients:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch patient',
          message: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
}

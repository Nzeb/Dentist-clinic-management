import { NextResponse } from 'next/server';
import { HistoryService } from '@/server/services/historyService';

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

  console.log("PatientId for History", params.id);
  
  // Validate the ID parameter
  if (isNaN(parseInt(params.id))) {
    return NextResponse.json(
      { error: 'Invalid patient ID format' },
      { status: 400 }
    );
  }

  try {
    const historyService = new HistoryService();
    const patientId = parseInt(params.id);
    
    console.log("Fetching history for patient ID:", patientId);
    
    const history = await historyService.getPatientHistory(patientId);
    
    if (!history) {
      return NextResponse.json(
        { error: 'No history found for this patient' },
        { status: 404 }
      );
    }

    return NextResponse.json(history);
    
  } catch (error) {
    console.error('Error in GET /api/history:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch history',
          message: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

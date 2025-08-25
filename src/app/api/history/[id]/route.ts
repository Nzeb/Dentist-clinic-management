// src/app/api/history/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { HistoryService } from '@/server/services/historyService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!params?.id) {
    return NextResponse.json(
      { error: 'Patient ID is required' },
      { status: 400 }
    );
  }

  if (isNaN(parseInt(params.id))) {
    return NextResponse.json(
      { error: 'Invalid patient ID format' },
      { status: 400 }
    );
  }

  try {
    const historyService = new HistoryService();
    const patientId = parseInt(params.id);
    const history = await historyService.getPatientHistory(patientId);

    if (!history) {
      return NextResponse.json(
        { error: 'No history found for this patient' },
        { status: 404 }
      );
    }

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error in GET /api/history/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const historyService = new HistoryService();
    const historyEntryId = parseInt(params.id, 10);
    const body = await request.json();

    if (isNaN(historyEntryId)) {
      return NextResponse.json(
        { error: 'Invalid historyEntryId' },
        { status: 400 }
      );
    }

    const updatedHistoryEntry = await historyService.updateHistoryEntry(
      historyEntryId,
      body
    );

    if (!updatedHistoryEntry) {
      return NextResponse.json(
        { error: 'History entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedHistoryEntry);
  } catch (error) {
    console.error('Error in PUT /api/history/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update history entry' },
      { status: 500 }
    );
  }
}

// src/app/api/history/route.ts
import { NextResponse } from 'next/server';
import { HistoryService } from '@/server/services/historyService';

export async function GET({ params }: { params: { id: string } }) {
  try {
    const historyService = new HistoryService();
    const history = await historyService.getPatientHistory(parseInt(params.id));
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error in GET /api/history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

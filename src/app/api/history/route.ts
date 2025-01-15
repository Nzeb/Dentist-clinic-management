// src/app/api/history/route.ts
import { NextResponse } from 'next/server';
import { HistoryService } from '@/server/services/historyService';

export async function GET() {
  try {
    const historyService = new HistoryService();
    const history = await historyService.getAllHistory();
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error in GET /api/history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const historyService = new HistoryService();
    const history = await historyService.createHistoryEntry(data);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error in POST /api/history:', error);
    return NextResponse.json(
      { error: 'Failed to create history' },
      { status: 500 }
    );
  }
}

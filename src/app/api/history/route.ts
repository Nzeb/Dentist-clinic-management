// src/app/api/history/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { HistoryService } from '@/server/services/historyService';
import { getStorageService } from '@/server/services/storage';
import { DBHistoryEntry } from '@/types/db';

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

export async function POST(request: NextRequest) {
  try {
    const storageService = getStorageService();
    const historyService = new HistoryService();

    const formData = await request.formData();
    const files = formData.getAll('attachments') as File[];
    const uploadedFileUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      // Make sure to use a unique file name or handle potential overwrites
      const fileName = `${Date.now()}-${file.name}`;
      const url = await storageService.upload(buffer, fileName);
      uploadedFileUrls.push(url);
    }

    const patientIdStr = formData.get('patient_id') as string;
    const doctorIdStr = formData.get('doctor_id') as string;
    const date = formData.get('date') as string;
    const description = formData.get('description') as string;

    if (!patientIdStr || !doctorIdStr || !date || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const patient_id = parseInt(patientIdStr, 10);
    const doctor_id = parseInt(doctorIdStr, 10);

    if (isNaN(patient_id) || isNaN(doctor_id)) {
      return NextResponse.json(
        { error: 'Invalid patient_id or doctor_id' },
        { status: 400 }
      );
    }

    const historyData = {
      patient_id,
      date,
      description,
      doctor_id,
      attachments: uploadedFileUrls,
    };

    const history = await historyService.createHistoryEntry(historyData);
    return NextResponse.json(history);
  } catch (error) {
    console.error('Error in POST /api/history:', error);
    return NextResponse.json(
      { error: 'Failed to create history entry' },
      { status: 500 }
    );
  }
}

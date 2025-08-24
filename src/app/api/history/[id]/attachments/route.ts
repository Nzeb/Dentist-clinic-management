import { NextRequest, NextResponse } from 'next/server';
import { HistoryService } from '../../../../../server/services/historyService';
import { getStorageService } from '../../../../../server/services/storage';
import { Pool } from 'pg';
import { config } from 'dotenv';

config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const historyService = new HistoryService();
const storageService = getStorageService();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const historyId = parseInt(params.id, 10);
    if (isNaN(historyId)) {
      return NextResponse.json({ error: 'Invalid history entry ID' }, { status: 400 });
    }

    const formData = await req.formData();
    const files = formData.getAll('attachments') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const attachmentUrls: string[] = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await storageService.upload(buffer, file.name);
      attachmentUrls.push(url);
    }

    const updatedEntry = await historyService.addAttachmentsToHistoryEntry(historyId, attachmentUrls);

    if (!updatedEntry) {
      return NextResponse.json({ error: 'History entry not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error adding attachments:', error);
    return NextResponse.json({ error: 'Failed to add attachments' }, { status: 500 });
  }
}

// src/app/api/history/[id]/attachments/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { HistoryService } from '@/server/services/historyService';
import { getStorageService } from '@/server/services/storage';

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

        const storageService = getStorageService();
        const attachmentUrls: string[] = [];
        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const url = await storageService.upload(buffer, file.name);
            attachmentUrls.push(url);
        }

        const historyService = new HistoryService();
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const historyService = new HistoryService();
    const historyEntryId = parseInt(params.id, 10);
    const { attachmentUrl } = await request.json();

    if (isNaN(historyEntryId) || !attachmentUrl) {
      return NextResponse.json(
        { error: 'Invalid historyEntryId or missing attachmentUrl' },
        { status: 400 }
      );
    }

    const updatedHistoryEntry = await historyService.deleteAttachment(
      historyEntryId,
      attachmentUrl
    );

    if (!updatedHistoryEntry) {
      return NextResponse.json(
        { error: 'History entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedHistoryEntry);
  } catch (error) {
    console.error('Error in DELETE /api/history/[id]/attachments:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}

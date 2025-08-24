import { NextRequest, NextResponse } from 'next/server';
import { getStorageService } from '../../../../server/services/storage';
import { Readable } from 'stream';
import path from 'path';
import mime from 'mime-types';

const storageService = getStorageService();

export async function GET(req: NextRequest, { params }: { params: { filepath: string[] } }) {
  try {
    const filePath = params.filepath.join('/');
    const fileStream = await storageService.read(filePath);

    const contentType = mime.lookup(filePath) || 'application/octet-stream';

    const headers = new Headers();
    headers.set('Content-Type', contentType);

    // Here, we're assuming the stream from the storage service is a Node.js Readable.
    // We need to convert it to a Web Stream (ReadableStream) for the NextResponse.
    const webStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => {
          controller.enqueue(chunk);
        });
        fileStream.on('end', () => {
          controller.close();
        });
        fileStream.on('error', (err) => {
          controller.error(err);
        });
      },
    });

    return new NextResponse(webStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error serving file:', error);
    if ((error as Error).message === 'File not found') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}

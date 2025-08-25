import { NextRequest, NextResponse } from 'next/server';
import { getLabReportsByPatientId, addLabReport, deleteLabReport } from '@/server/services/labReportService';
import { AzureBlobStorageService } from '@/server/services/storage/azure';

const storageService = new AzureBlobStorageService();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const patientId = parseInt(params.id, 10);
        const reports = await getLabReportsByPatientId(patientId);
        return NextResponse.json(reports);
    } catch (error) {
        console.error('Error fetching lab reports:', error);
        return NextResponse.json({ error: 'Failed to fetch lab reports' }, { status: 500 });
    }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const patientId = parseInt(params.id, 10);
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const date = formData.get('date') as string;
        const file = formData.get('file') as File;

        if (!title || !date || !file) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const fileType = file.type;
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = `${patientId}-${Date.now()}-${file.name}`;
        await storageService.upload(fileBuffer, fileName);
        const fileUrl = `${process.env.AZURE_STORAGE_URL}/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${fileName}`;

        const newReport = await addLabReport(patientId, title, date, fileType, fileUrl);
        return NextResponse.json(newReport, { status: 201 });
    } catch (error) {
        console.error('Error adding lab report:', error);
        return NextResponse.json({ error: 'Failed to add lab report' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        await deleteLabReport(id);
        return NextResponse.json({ message: 'Lab report deleted successfully' });
    } catch (error) {
        console.error('Error deleting lab report:', error);
        return NextResponse.json({ error: 'Failed to delete lab report' }, { status: 500 });
    }
}

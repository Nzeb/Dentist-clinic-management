import { NextRequest, NextResponse } from 'next/server';
import { TreatmentService } from '@/server/services/treatmentService';

const treatmentService = new TreatmentService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  try {
    const plan = await treatmentService.getTreatmentPlan(parseInt(patientId, 10));
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch treatment plan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { patientId, nodes, edges } = await req.json();

  if (!patientId || !nodes || !edges) {
    return NextResponse.json({ error: 'patientId, nodes, and edges are required' }, { status: 400 });
  }

  try {
    const plan = await treatmentService.createOrUpdateTreatmentPlan(patientId, nodes, edges);
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save treatment plan' }, { status: 500 });
  }
}

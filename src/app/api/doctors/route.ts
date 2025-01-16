// app/api/doctors/route.ts
import { NextResponse } from 'next/server';
import { DoctorService } from '@/server/services/doctorService';

export async function GET() {
  console.log('Received GET request to /api/doctors');

  try {
    const doctorService = new DoctorService();
    const doctors = await doctorService.getAllDoctors();
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error in GET /api/doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('Received POST request to /api/doctors');
  try {
    console.log('Received POST request to /api/doctors');
    const data = await request.json();
    const doctorService = new DoctorService();
    const doctor = await doctorService.createDoctor(data);
    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Error in POST /api/doctors:', error);
    return NextResponse.json(
      { error: 'Failed to create doctors' },
      { status: 500 }
    );
  }
}
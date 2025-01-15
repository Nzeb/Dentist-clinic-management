// src/app/api/doctors/[id]/route.ts
import { NextResponse } from 'next/server';
import { DoctorService } from '@/server/services/doctorService';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const doctorService = new DoctorService();
    const doctor = await doctorService.updateDoctor(parseInt(params.id), data);
    
    if (!doctor) {
      return NextResponse.json(
        { error: 'doctor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(doctor);
  } catch (error) {
    console.error('Error in PATCH /api/doctors/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update doctor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
        const data = await request.json();
        const doctorService = new DoctorService();
        const doctor = await doctorService.deleteDoctor(parseInt(params.id));
        
        if (!doctor) {
          return NextResponse.json(
            { error: 'doctor not found' },
            { status: 404 }
          );
        }
    
        return NextResponse.json(doctor);
      } catch (error) {
        console.error('Error in Delete /api/doctors/[id]:', error);
        return NextResponse.json(
          { error: 'Failed to update doctor' },
          { status: 500 }
        );
      }
  }
// src/app/api/appointments/route.ts
import { NextResponse } from 'next/server';
import { AppointmentService } from '@/server/services/appointmentService';

export async function GET() {
  try {
    const appointmentService = new AppointmentService();
    const appointments = await appointmentService.getAllAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('POST /api/appointments called');
  try {
    const data = await request.json();
    const appointmentService = new AppointmentService();
    const appointment = await appointmentService.createAppointment(data);
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error in POST /api/appointments:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
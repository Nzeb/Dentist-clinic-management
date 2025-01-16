import { NextResponse } from 'next/server';
import { AppointmentService } from '@/server/services/appointmentService';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const appointmentService = new AppointmentService();
    const appointment = await appointmentService.updateAppointment(parseInt(params.id), data);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error in PATCH /api/appointments/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {

      const appointmentService = new AppointmentService();
      const appointment = await appointmentService.deleteAppointment(parseInt(params.id));
      
      if (!appointment) {
        return NextResponse.json(
          { error: 'appointment not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json("True");
  } catch (error) {
      console.error('Error in Delete /api/appointments/[id]:', error);
      return NextResponse.json(
        { error: 'Failed to delete appointment' },
        { status: 500 }
      );
  }
}
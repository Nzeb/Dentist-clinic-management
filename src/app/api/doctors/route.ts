// app/api/doctors/route.ts
import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/userService';

const userService = new UserService();

export async function GET() {
  try {
    const doctors = await userService.getUsersWithRole('Doctor');
    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error in GET /api/doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}
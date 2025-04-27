// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/server/services/userService';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    const userService = new UserService();

    const user = await userService.login(username, password);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    //TODO Add session logic to server
    // Create session token
    // const token = await userService.createSession(user);

    // Set HTTP-only cookie with the session token
    const response = NextResponse.json({ success: true, user });
    // response.cookies.set('auth-token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 60 * 60 * 24 * 7 // 1 week
    // });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

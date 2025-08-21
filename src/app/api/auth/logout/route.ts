import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    cookies().set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    })

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 })
  }
}

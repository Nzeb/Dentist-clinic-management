import { NextRequest, NextResponse } from 'next/server';
import {
    jwtVerify
} from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value

  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, secret)
    const userRole = (payload.role as string).toLowerCase()

    const { pathname } = req.nextUrl

    if (pathname.startsWith('/users') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/patients', req.url))
    }

    if (pathname.startsWith('/api/users') && userRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (pathname.startsWith('/my-patients') && userRole !== 'doctor') {
      return NextResponse.redirect(new URL('/patients', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    '/patients/:path*',
    '/my-patients/:path*',
    '/appointments/:path*',
    '/billing/:path*',
    '/employees/:path*',
    '/staff/:path*',
    '/users/:path*',
    '/profile/:path*',
    '/api/users/:path*',
    '/api/patients/:path*',
    '/api/appointments/:path*',
    '/api/history/:path*',
    '/api/prescriptions/:path*',
    '/api/treatments/:path*',
    '/api/invoices/:path*',
    '/api/notifications/:path*',
    '/api/doctors/:path*',
  ],
}

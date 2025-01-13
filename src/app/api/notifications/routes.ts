// src/app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/notificationService';

export async function GET() {
  try {
    const notificationService = new NotificationService();
    const notifications = await notificationService.getAllNotifications();
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const notificationService = new NotificationService();
    const notification = await notificationService.createNotification(data);
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error in POST /api/notifications:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/server/services/userService';

const userService = new UserService();

export async function GET() {
    try {
        const users = await userService.getAllUsers();
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const userData = await req.json();
        const newUser = await userService.createUser(userData);
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

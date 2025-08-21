import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/server/services/userService';

const userService = new UserService();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await userService.getUserById(Number(params.id));
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const userData = await req.json();
        const updatedUser = await userService.updateUser(Number(params.id), userData);
        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const deleted = await userService.deleteUser(Number(params.id));
        if (!deleted) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

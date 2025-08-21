import { pool } from '@/server/db/config';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET() {
    try {
        const { rows } = await pool.query('SELECT id, username, role, "fullName", email FROM users');
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { username, password, role, fullName, email } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 10);
        const { rows } = await pool.query(
            'INSERT INTO users (username, password, role, "fullName", email) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, "fullName", email',
            [username, hashedPassword, role, fullName, email]
        );
        return NextResponse.json(rows[0], { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

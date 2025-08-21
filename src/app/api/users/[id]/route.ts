import { pool } from '@/server/db/config';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { rows } = await pool.query('SELECT id, username, role, "fullName", email FROM users WHERE id = $1', [id]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { username, password, role, fullName, email } = await req.json();
        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const { rows } = await pool.query(
            `UPDATE users SET
                username = COALESCE($1, username),
                password = COALESCE($2, password),
                role = COALESCE($3, role),
                "fullName" = COALESCE($4, "fullName"),
                email = COALESCE($5, email)
            WHERE id = $6 RETURNING id, username, role, "fullName", email`,
            [username, hashedPassword, role, fullName, email, id]
        );

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username, role', [id]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}

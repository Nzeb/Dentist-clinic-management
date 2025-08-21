// src/server/services/userService.ts
import { pool } from '../db/config';
import { DBUser } from '@/types/db';
import bcrypt from 'bcrypt';

export class UserService {
    async getAllUsers(): Promise<DBUser[]> {
        const result = await pool.query('SELECT id, username, role, "fullName", email FROM users ORDER BY username');
        return result.rows;
    }

    async getUsersWithRole(role: string): Promise<DBUser[]> {
        const result = await pool.query('SELECT id, username, role, "fullName", email FROM users WHERE role = $1 ORDER BY username', [role]);
        return result.rows;
    }

    async getUserById(id: number): Promise<DBUser | null> {
        const result = await pool.query(
            'SELECT id, username, role, "fullName", email FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async createUser(user: Omit<DBUser, 'id'> & { password?: string }): Promise<DBUser> {
        const hashedPassword = await bcrypt.hash(user.password || 'password', 10);
        const result = await pool.query(
            'INSERT INTO users (username, password, role, "fullName", email) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, role, "fullName", email',
            [user.username, hashedPassword, user.role, user.fullName, user.email]
        );
        return result.rows[0];
    }

    async updateUser(id: number, user: Partial<Omit<DBUser, 'id'>>): Promise<DBUser | null> {
        const currentUser = await this.getUserById(id);
        if (!currentUser) return null;

        const updates = [];
        const values = [];
        let valueCount = 1;

        for (const [key, value] of Object.entries(user)) {
            if (value !== undefined) {
                updates.push(`"${key}" = $${valueCount}`);
                values.push(value);
                valueCount++;
            }
        }

        if (updates.length === 0) return currentUser;

        values.push(id);
        const query = `
            UPDATE users
            SET ${updates.join(', ')}
            WHERE id = $${valueCount}
            RETURNING id, username, role, "fullName", email
        `;

        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async deleteUser(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING id',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }
}

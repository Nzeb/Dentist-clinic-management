// userService.ts
import { Pool } from 'pg';
import { DBUser, UserRole } from '@/types/db';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { pool } from '../db/config';

// Add a custom error type
class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

class UserService {
  private readonly SALT_ROUNDS = 12;
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async createUser(userData: CreateUserDto): Promise<Omit<DBUser, 'password'>> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const hashedPassword = await bcrypt.hash(userData.password, this.SALT_ROUNDS);

      const query = `
        INSERT INTO users (
          email, 
          password, 
          name, 
          role, 
          is_active, 
          created_at, 
          updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id, email, name, role, is_active, created_at, updated_at
      `;

      const values = [
        userData.email,
        hashedPassword,
        userData.name,
        userData.role,
        true,
        new Date().toISOString(),
        new Date().toISOString()
      ];

      const result = await client.query(query, values);
      await client.query('COMMIT');
      return result.rows[0];
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to create user: ${error.message}`);
      }
      throw new DatabaseError('Failed to create user: Unknown error');
    } finally {
      client.release();
    }
  }

  async getUserById(id: number): Promise<Omit<DBUser, 'password'> | null> {
    try {
      const query = `
        SELECT id, email, name, role, is_active, created_at, updated_at 
        FROM users 
        WHERE id = $1 AND is_active = true
      `;
      const result = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to get user: ${error.message}`);
      }
      throw new DatabaseError('Failed to get user: Unknown error');
    }
  }

  async updateUser(id: number, updateData: UpdateUserDto): Promise<Omit<DBUser, 'password'>> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updateData.email) {
        updates.push(`email = $${paramCount}`);
        values.push(updateData.email);
        paramCount++;
      }

      if (updateData.password) {
        const hashedPassword = await bcrypt.hash(updateData.password, this.SALT_ROUNDS);
        updates.push(`password = $${paramCount}`);
        values.push(hashedPassword);
        paramCount++;
      }

      if (updateData.name) {
        updates.push(`name = $${paramCount}`);
        values.push(updateData.name);
        paramCount++;
      }

      if (updateData.role) {
        updates.push(`role = $${paramCount}`);
        values.push(updateData.role);
        paramCount++;
      }

      if (updateData.is_active !== undefined) {
        updates.push(`is_active = $${paramCount}`);
        values.push(updateData.is_active);
        paramCount++;
      }

      updates.push(`updated_at = $${paramCount}`);
      values.push(new Date().toISOString());

      values.push(id);

      const query = `
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = $${values.length} 
        RETURNING id, email, name, role, is_active, created_at, updated_at
      `;

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new DatabaseError('User not found');
      }

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to update user: ${error.message}`);
      }
      throw new DatabaseError('Failed to update user: Unknown error');
    } finally {
      client.release();
    }
  }

  async deleteUser(id: number): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        UPDATE users 
        SET is_active = false, 
            updated_at = $1 
        WHERE id = $2 AND is_active = true
      `;

      const result = await client.query(query, [new Date().toISOString(), id]);

      if (result.rowCount === 0) {
        throw new DatabaseError('User not found or already deleted');
      }

      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to delete user: ${error.message}`);
      }
      throw new DatabaseError('Failed to delete user: Unknown error');
    } finally {
      client.release();
    }
  }

  async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const query = `
        SELECT password 
        FROM users 
        WHERE email = $1 AND is_active = true
      `;
      const result = await this.pool.query(query, [email]);
      
      if (result.rows.length === 0) return false;
      
      return await bcrypt.compare(password, result.rows[0].password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to verify password: ${error.message}`);
      }
      throw new DatabaseError('Failed to verify password: Unknown error');
    }
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const userQuery = `
        SELECT id 
        FROM users 
        WHERE email = $1 AND is_active = true
      `;
      const userResult = await client.query(userQuery, [email]);
      
      if (userResult.rows.length === 0) {
        throw new DatabaseError('User not found');
      }

      const userId = userResult.rows[0].id;
      const resetToken = randomBytes(32).toString('hex');
      const hashedResetToken = await bcrypt.hash(resetToken, this.SALT_ROUNDS);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const tokenQuery = `
        INSERT INTO password_reset_tokens (
          user_id, 
          token, 
          expires_at, 
          created_at
        ) 
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          token = EXCLUDED.token,
          expires_at = EXCLUDED.expires_at,
          created_at = EXCLUDED.created_at
      `;

      await client.query(tokenQuery, [
        userId,
        hashedResetToken,
        expiresAt,
        new Date().toISOString()
      ]);

      await client.query('COMMIT');
      return resetToken;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to generate reset token: ${error.message}`);
      }
      throw new DatabaseError('Failed to generate reset token: Unknown error');
    } finally {
      client.release();
    }
  }
}

export default UserService;

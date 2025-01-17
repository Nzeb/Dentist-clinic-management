// userService.ts
import { Pool } from 'pg';
import { DBUser, UserRole } from '@/types/db';
import bcryptjs from 'bcryptjs';
import { randomBytes } from 'crypto';
import { pool } from '../db/config';

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}

interface GetUsersOptions {
    role?: UserRole;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'username' | 'email' | 'name' | 'role' | 'created_at';
    sortOrder?: 'ASC' | 'DESC';
  }
  
  interface PaginatedUsers {
    users: Omit<DBUser, 'password'>[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }

class UserService {
  private readonly SALT_ROUNDS = 12;
  private readonly DEFAULT_ADMIN = {
    username: 'admin',
    password: 'admin',
    email: 'admin@system.local',
    name: 'System Administrator',
    role: UserRole.ADMIN
  };
  private pool: Pool;

  constructor() {
    this.pool = pool;
    this.ensureAdminExists().catch(error => {
      console.error('Failed to create admin user:', error);
    });
  }

  private async ensureAdminExists(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Check if admin user exists
      const adminQuery = `
        SELECT id FROM users 
        WHERE username = $1 AND role = $2
      `;
      const adminResult = await client.query(adminQuery, [
        this.DEFAULT_ADMIN.username,
        UserRole.ADMIN
      ]);

      if (adminResult.rows.length === 0) {
        // Create admin user if it doesn't exist
        await this.createUser(this.DEFAULT_ADMIN);
        console.log('Default admin user created successfully');
      }

      await client.query('COMMIT');
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to ensure admin exists: ${error.message}`);
      }
      throw new DatabaseError('Failed to ensure admin exists: Unknown error');
    } finally {
      client.release();
    }
  }

  async createUser(userData: CreateUserDto): Promise<Omit<DBUser, 'password'>> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Check if username or email already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE username = $1 OR email = $2',
        [userData.username, userData.email]
      );

      if (existingUser.rows.length > 0) {
        throw new DatabaseError('Username or email already exists');
      }

      const hashedPassword = await bcryptjs.hash(userData.password, this.SALT_ROUNDS);

      const query = `
        INSERT INTO users (
          username,
          email, 
          password, 
          name, 
          role, 
          is_active, 
          created_at, 
          updated_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id, username, email, name, role, is_active, created_at, updated_at
      `;

      const values = [
        userData.username,
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

  async login(username: string, password: string): Promise<Omit<DBUser, 'password'> | null> {
    try {
      const query = `
        SELECT id, username, email, password, name, role, is_active, created_at, updated_at
        FROM users 
        WHERE username = $1 AND is_active = true
      `;
      const result = await this.pool.query(query, [username]);
      
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      const isValidPassword = await bcryptjs.compare(password, user.password);
      
      if (!isValidPassword) return null;
      
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to login: ${error.message}`);
      }
      throw new DatabaseError('Failed to login: Unknown error');
    }
  }

  async getUserById(id: number): Promise<Omit<DBUser, 'password'> | null> {
    try {
      const query = `
        SELECT id, username, email, name, role, is_active, created_at, updated_at 
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

      // Check if username or email already exists if they're being updated
      if (updateData.username || updateData.email) {
        const existingUser = await client.query(
          'SELECT id FROM users WHERE (username = $1 OR email = $2) AND id != $3',
          [updateData.username, updateData.email, id]
        );

        if (existingUser.rows.length > 0) {
          throw new DatabaseError('Username or email already exists');
        }
      }

      const updates: string[] = [];
      const values: any[] = [];
      let paramCount = 1;

      if (updateData.username) {
        updates.push(`username = $${paramCount}`);
        values.push(updateData.username);
        paramCount++;
      }

      if (updateData.email) {
        updates.push(`email = $${paramCount}`);
        values.push(updateData.email);
        paramCount++;
      }

      if (updateData.password) {
        const hashedPassword = await bcryptjs.hash(updateData.password, this.SALT_ROUNDS);
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
        RETURNING id, username, email, name, role, is_active, created_at, updated_at
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

      // Check if user is the last admin
      const user = await this.getUserById(id);
      if (user?.role === UserRole.ADMIN) {
        const adminCount = await client.query(
          'SELECT COUNT(*) FROM users WHERE role = $1 AND is_active = true',
          [UserRole.ADMIN]
        );
        if (adminCount.rows[0].count <= 1) {
          throw new DatabaseError('Cannot delete the last admin user');
        }
      }

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

  async generatePasswordResetToken(username: string): Promise<string> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const userQuery = `
        SELECT id 
        FROM users 
        WHERE username = $1 AND is_active = true
      `;
      const userResult = await client.query(userQuery, [username]);
      
      if (userResult.rows.length === 0) {
        throw new DatabaseError('User not found');
      }

      const userId = userResult.rows[0].id;
      const resetToken = randomBytes(32).toString('hex');
      const hashedResetToken = await bcryptjs.hash(resetToken, this.SALT_ROUNDS);
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

  async resetPassword(username: string, token: string, newPassword: string): Promise<boolean> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const tokenQuery = `
        SELECT prt.* 
        FROM password_reset_tokens prt
        JOIN users u ON u.id = prt.user_id
        WHERE u.username = $1 AND u.is_active = true
          AND prt.expires_at > NOW()
      `;
      const tokenResult = await client.query(tokenQuery, [username]);

      if (tokenResult.rows.length === 0) {
        return false;
      }

      const isValidToken = await bcryptjs.compare(token, tokenResult.rows[0].token);
      if (!isValidToken) {
        return false;
      }

      const hashedPassword = await bcryptjs.hash(newPassword, this.SALT_ROUNDS);
      
      const updateQuery = `
        UPDATE users 
        SET password = $1, 
            updated_at = $2
        WHERE username = $3
      `;
      await client.query(updateQuery, [
        hashedPassword,
        new Date().toISOString(),
        username
      ]);

      // Delete the used token
      await client.query(
        'DELETE FROM password_reset_tokens WHERE user_id = $1',
        [tokenResult.rows[0].user_id]
      );

      await client.query('COMMIT');
      return true;
    } catch (error: unknown) {
      await client.query('ROLLBACK');
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to reset password: ${error.message}`);
      }
      throw new DatabaseError('Failed to reset password: Unknown error');
    } finally {
      client.release();
    }
  }

  async getUsers(options: GetUsersOptions = {}): Promise<PaginatedUsers> {
    const client = await this.pool.connect();
    try {
      const {
        role,
        isActive = true,
        search = '',
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = options;

      // Build the WHERE clause
      const whereConditions: string[] = ['1 = 1']; // Always true condition to start
      const values: any[] = [];
      let paramCount = 1;

      // Add is_active condition
      whereConditions.push(`is_active = $${paramCount}`);
      values.push(isActive);
      paramCount++;

      // Add role condition if specified
      if (role) {
        whereConditions.push(`role = $${paramCount}`);
        values.push(role);
        paramCount++;
      }

      // Add search condition if specified
      if (search) {
        whereConditions.push(`(
          username ILIKE $${paramCount} OR 
          email ILIKE $${paramCount} OR 
          name ILIKE $${paramCount}
        )`);
        values.push(`%${search}%`);
        paramCount++;
      }

      // Calculate pagination
      const offset = (page - 1) * limit;
      values.push(limit);
      values.push(offset);

      // Build the final queries
      const countQuery = `
        SELECT COUNT(*) 
        FROM users 
        WHERE ${whereConditions.join(' AND ')}
      `;

      const selectQuery = `
        SELECT 
          id, 
          username, 
          email, 
          name, 
          role, 
          is_active, 
          created_at, 
          updated_at
        FROM users 
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY ${sortBy} ${sortOrder}
        LIMIT $${paramCount} 
        OFFSET $${paramCount + 1}
      `;

      // Execute queries
      const totalResult = await client.query(countQuery, values.slice(0, -2));
      const total = parseInt(totalResult.rows[0].count);
      const result = await client.query(selectQuery, values);

      return {
        users: result.rows,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to get users: ${error.message}`);
      }
      throw new DatabaseError('Failed to get users: Unknown error');
    } finally {
      client.release();
    }
  }

  async getAllActiveUsers(): Promise<Omit<DBUser, 'password'>[]> {
    try {
      const query = `
        SELECT 
          id, 
          username, 
          email, 
          name, 
          role, 
          is_active, 
          created_at, 
          updated_at
        FROM users 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query);
      return result.rows;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to get all users: ${error.message}`);
      }
      throw new DatabaseError('Failed to get all users: Unknown error');
    }
  }

  async getUsersByRole(role: UserRole): Promise<Omit<DBUser, 'password'>[]> {
    try {
      const query = `
        SELECT 
          id, 
          username, 
          email, 
          name, 
          role, 
          is_active, 
          created_at, 
          updated_at
        FROM users 
        WHERE role = $1 AND is_active = true
        ORDER BY created_at DESC
      `;
      const result = await this.pool.query(query, [role]);
      return result.rows;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new DatabaseError(`Failed to get users by role: ${error.message}`);
      }
      throw new DatabaseError('Failed to get users by role: Unknown error');
    }
  }
}

export default UserService;

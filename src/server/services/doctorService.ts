// src/server/services/doctorService.ts
import { pool } from '../db/config';
import { DBDoctor } from '@/types/db';

export class DoctorService {
  async getAllDoctors(): Promise<DBDoctor[]> {
    const result = await pool.query('SELECT * FROM doctors ORDER BY name');
    return result.rows;
  }

  async createDoctor(doctor: Omit<DBDoctor, 'id'>): Promise<DBDoctor> {
    const result = await pool.query(
      'INSERT INTO doctors (name) VALUES ($1) RETURNING *',
      [doctor.name]
    );
    return result.rows[0];
  }

    async updateDoctor(id: number, doctor: Partial<DBDoctor>): Promise<DBDoctor | null> {
      const updates = [];
      const values = [];
      let valueCount = 1;
  
      for (const [key, value] of Object.entries(doctor)) {
        if (value !== undefined) {
          updates.push(`${key} = $${valueCount}`);
          values.push(value);
          valueCount++;
        }
      }
  
      if (updates.length === 0) return null;
  
      values.push(id);
      const query = `
        UPDATE doctors
        SET ${updates.join(', ')}
        WHERE id = $${valueCount}
        RETURNING *
      `;
  
      const result = await pool.query(query, values);
      return result.rows[0] || null;
    }
  
    async deleteDoctor(id: number): Promise<boolean> {
      const result = await pool.query(
        'DELETE FROM doctors WHERE id = $1 RETURNING id',
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    }
}

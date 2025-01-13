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
}

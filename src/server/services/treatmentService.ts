// src/server/services/treatmentService.ts
import { pool } from '../db/config';
import { DBTreatment } from '@/types/db';

export class TreatmentService {
  async getAllTreatments(): Promise<DBTreatment[]> {
    const result = await pool.query('SELECT * FROM treatments ORDER BY name');
    return result.rows;
  }

  async createTreatment(treatment: Omit<DBTreatment, 'id'>): Promise<DBTreatment> {
    const result = await pool.query(
      `INSERT INTO treatments (name, duration, price)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [treatment.name, treatment.duration, treatment.price]
    );
    return result.rows[0];
  }
}
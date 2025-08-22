// src/server/services/treatmentService.ts
import { pool } from '../db/config';
import { DBTreatment, DBTreatmentPlan } from '@/types/db';

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

  async getTreatmentPlan(patientId: number): Promise<DBTreatmentPlan | null> {
    const result = await pool.query(
      'SELECT * FROM treatment_plans WHERE patient_id = $1',
      [patientId]
    );
    return result.rows[0] || null;
  }

  async createOrUpdateTreatmentPlan(
    patientId: number,
    nodes: any[],
    edges: any[]
  ): Promise<DBTreatmentPlan> {
    const existingPlan = await this.getTreatmentPlan(patientId);

    if (existingPlan) {
      const result = await pool.query(
        `UPDATE treatment_plans
         SET nodes = $1, edges = $2
         WHERE patient_id = $3
         RETURNING *`,
        [JSON.stringify(nodes), JSON.stringify(edges), patientId]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        `INSERT INTO treatment_plans (patient_id, nodes, edges)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [patientId, JSON.stringify(nodes), JSON.stringify(edges)]
      );
      return result.rows[0];
    }
  }
}
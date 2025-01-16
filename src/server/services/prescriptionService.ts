// src/server/services/prescriptionService.ts
import { pool } from '../db/config';
import { DBPrescription } from '@/types/db';

export class PrescriptionService {
  async getAllPrescriptions(): Promise<DBPrescription[]> {
    const result = await pool.query('SELECT * FROM prescriptions ORDER BY date DESC');
    return result.rows;
  }

  async getPatientPrescriptions(patientId: number): Promise<DBPrescription[]> {
    const result = await pool.query(
      'SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY date DESC',
      [patientId]
    );
    return result.rows;
  }

  async createPrescription(prescription: Omit<DBPrescription, 'id'>): Promise<DBPrescription> {
    const result = await pool.query(
      `INSERT INTO prescriptions (
        patient_id, date, medication, dosage, instructions, renewal_date
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        prescription.patient_id,
        prescription.date,
        prescription.medication,
        prescription.dosage,
        prescription.instructions,
        prescription.renewal_date
      ]
    );
    return result.rows[0];
  }

  async updatePrescription(id: number, prescription: Partial<DBPrescription>): Promise<DBPrescription | null> {
    const updates = [];
    const values = [];
    let valueCount = 1;

    for (const [key, value] of Object.entries(prescription)) {
      if (value !== undefined) {
        updates.push(`${key} = $${valueCount}`);
        values.push(value);
        valueCount++;
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE prescriptions 
      SET ${updates.join(', ')}
      WHERE id = $${valueCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deletePrescription(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM prescriptions WHERE id = $1 RETURNING id',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

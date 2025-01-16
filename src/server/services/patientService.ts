// src/server/services/patientService.ts
import { pool } from '../db/config';
import { DBPatient } from '@/types/db';

export class PatientService {
  async getAllPatients(): Promise<DBPatient[]> {
    const result = await pool.query('SELECT * FROM patients ORDER BY name');
    return result.rows;
  }

  async getPatientById(id: number): Promise<DBPatient | null> {
    const result = await pool.query(
      'SELECT * FROM patients WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async createPatient(patient: Omit<DBPatient, 'id'>): Promise<DBPatient> {
    console.log('Creating patient:', patient);
    const result = await pool.query(
      `INSERT INTO patients (
        name, age, sex, address, phone, email, 
        last_visit, assigned_doctor_id, special_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *`,
      [
        patient.name,
        patient.age,
        patient.sex,
        patient.address,
        patient.phone,
        patient.email,
        patient.last_visit,
        patient.assigned_doctor_id,
        patient.special_notes
      ]
    );
    return result.rows[0];
  }

  async updatePatient(id: number, patient: Partial<DBPatient>): Promise<DBPatient | null> {
    const currentPatient = await this.getPatientById(id);
    if (!currentPatient) return null;

    const updates = [];
    const values = [];
    let valueCount = 1;

    for (const [key, value] of Object.entries(patient)) {
      if (value !== undefined) {
        updates.push(`${key} = $${valueCount}`);
        values.push(value);
        valueCount++;
      }
    }

    if (updates.length === 0) return currentPatient;

    values.push(id);
    const query = `
      UPDATE patients 
      SET ${updates.join(', ')}
      WHERE id = $${valueCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async getPatientsForDoctor(doctorId: number): Promise<DBPatient[]> {
    const result = await pool.query(
      'SELECT * FROM patients WHERE assigned_doctor_id = $1 ORDER BY name',
      [doctorId]
    );
    return result.rows;
  }

  async assignPatientToDoctor(patientId: number, doctorId: number): Promise<DBPatient | null> {
    const result = await pool.query(
      `UPDATE patients 
       SET assigned_doctor_id = $1 
       WHERE id = $2 
       RETURNING *`,
      [doctorId, patientId]
    );
    return result.rows[0] || null;
  }
}







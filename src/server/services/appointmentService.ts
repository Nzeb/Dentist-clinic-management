// src/server/services/appointmentService.ts
import { pool } from '../db/config';
import { DBAppointment } from '@/types/db';
import { QueryResult } from 'pg';

export class AppointmentService {
  async getAllAppointments(): Promise<DBAppointment[]> {
    const result = await pool.query(
      'SELECT * FROM appointments ORDER BY date, time'
    );
    return result.rows;
  }

  async createAppointment(appointment: Omit<DBAppointment, 'id'>): Promise<DBAppointment> {
    const result = await pool.query(
      `INSERT INTO appointments (patient_id, date, time, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [appointment.patient_id, appointment.date, appointment.time, appointment.type]
    );
    return result.rows[0];
  }

  async updateAppointment(id: number, appointment: Partial<DBAppointment>): Promise<DBAppointment | null> {
    const updates = [];
    const values = [];
    let valueCount = 1;

    for (const [key, value] of Object.entries(appointment)) {
      if (value !== undefined) {
        updates.push(`${key} = $${valueCount}`);
        values.push(value);
        valueCount++;
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE appointments 
      SET ${updates.join(', ')}
      WHERE id = $${valueCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING id',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
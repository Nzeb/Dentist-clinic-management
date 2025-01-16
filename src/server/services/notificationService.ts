// src/server/services/notificationService.ts
import { pool } from '../db/config';
import { DBNotification } from '@/types/db';

export class NotificationService {
  async getAllNotifications(): Promise<DBNotification[]> {
    const result = await pool.query('SELECT * FROM notifications ORDER BY date DESC');
    return result.rows;
  }

  async getPatientNotifications(patientId: number): Promise<DBNotification[]> {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE patient_id = $1 ORDER BY date DESC',
      [patientId]
    );
    return result.rows;
  }

  async createNotification(notification: Omit<DBNotification, 'id'>): Promise<DBNotification> {
    const result = await pool.query(
      `INSERT INTO notifications (patient_id, type, message, date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [notification.patient_id, notification.type, notification.message, notification.date]
    );
    return result.rows[0];
  }

  async deleteNotification(id: number): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 RETURNING id',
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  }
}

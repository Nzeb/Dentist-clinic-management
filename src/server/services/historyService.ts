// src/server/services/historyService.ts
import { pool } from '../db/config';
import { DBHistoryEntry } from '@/types/db';

export class HistoryService {
    async getAllHistory(): Promise<DBHistoryEntry[]> {
        const result = await pool.query('SELECT * FROM history_entries ORDER BY date DESC');
        return result.rows;
    }

    async getPatientHistory(patientId: number): Promise<DBHistoryEntry[]> {
        const result = await pool.query(
            'SELECT * FROM history_entries WHERE patient_id = $1 ORDER BY date DESC',
            [patientId]
        );
        return result.rows;
    }

    async createHistoryEntry(entry: Omit<DBHistoryEntry, 'id'>): Promise<DBHistoryEntry> {
        const result = await pool.query(
            `INSERT INTO history_entries (patient_id, date, description, attachments, doctor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [entry.patient_id, entry.date, entry.description, entry.attachments, entry.doctor_id]
        );
        return result.rows[0];
    }

    async updateHistoryEntry(id: number, entry: Partial<DBHistoryEntry>): Promise<DBHistoryEntry | null> {
        const updates = [];
        const values = [];
        let valueCount = 1;

        for (const [key, value] of Object.entries(entry)) {
            if (value !== undefined) {
                updates.push(`${key} = $${valueCount}`);
                values.push(value);
                valueCount++;
            }
        }

        if (updates.length === 0) return null;

        values.push(id);
        const query = `
      UPDATE history_entries 
      SET ${updates.join(', ')}
      WHERE id = $${valueCount}
      RETURNING *
    `;

        const result = await pool.query(query, values);
        return result.rows[0] || null;
    }

    async deleteHistoryEntry(id: number): Promise<boolean> {
        const result = await pool.query(
            'DELETE FROM history_entries WHERE id = $1 RETURNING id',
            [id]
        );
        return (result.rowCount ?? 0) > 0;
    }

    async addAttachmentsToHistoryEntry(id: number, newAttachments: string[]): Promise<DBHistoryEntry | null> {
        const currentEntryResult = await pool.query('SELECT attachments FROM history_entries WHERE id = $1', [id]);
        if (currentEntryResult.rows.length === 0) {
            return null;
        }

        const currentAttachments = currentEntryResult.rows[0].attachments || [];
        const updatedAttachments = [...currentAttachments, ...newAttachments];

        const result = await pool.query(
            'UPDATE history_entries SET attachments = $1 WHERE id = $2 RETURNING *',
            [updatedAttachments, id]
        );

        return result.rows[0] || null;
    }
}




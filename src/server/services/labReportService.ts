import { pool } from '../db/config';
import { DBLabReport } from '@/types/db';

export const getLabReportsByPatientId = async (patientId: number): Promise<DBLabReport[]> => {
    const query = 'SELECT * FROM lab_reports WHERE patient_id = $1 ORDER BY date DESC';
    const { rows } = await pool.query(query, [patientId]);
    return rows;
};

export const addLabReport = async (patientId: number, title: string, date: string, fileType: string, fileUrl: string): Promise<DBLabReport> => {
    const query = 'INSERT INTO lab_reports (patient_id, title, date, file_type, file_url) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    const { rows } = await pool.query(query, [patientId, title, date, fileType, fileUrl]);
    return rows[0];
};

export const deleteLabReport = async (id: number): Promise<void> => {
    const query = 'DELETE FROM lab_reports WHERE id = $1';
    await pool.query(query, [id]);
};

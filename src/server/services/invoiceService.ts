// src/server/services/invoiceService.ts
import { pool } from '../db/config';
import { DBInvoice } from '@/types/db';

export class InvoiceService {
  async getAllInvoices(): Promise<DBInvoice[]> {
    const result = await pool.query('SELECT * FROM invoices ORDER BY date DESC');
    return result.rows;
  }

  async createInvoice(invoice: Omit<DBInvoice, 'id'>): Promise<DBInvoice> {
    const result = await pool.query(
      `INSERT INTO invoices (patient_id, date, amount, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [invoice.patient_id, invoice.date, invoice.amount, invoice.status]
    );
    return result.rows[0];
  }

  async updateInvoiceStatus(id: number, status: DBInvoice['status']): Promise<DBInvoice | null> {
    const result = await pool.query(
      `UPDATE invoices 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );
    return result.rows[0] || null;
  }
}
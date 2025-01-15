// src/app/api/Invoices/route.ts
import { NextResponse } from 'next/server';
import { InvoiceService } from '@/server/services/invoiceService';

export async function GET() {
  try {
    const invoiceService = new InvoiceService();
    const invoices = await invoiceService.getAllInvoices();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error in GET /api/Invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const invoiceService = new InvoiceService();
    const Invoice = await invoiceService.createInvoice(data);
    return NextResponse.json(Invoice);
  } catch (error) {
    console.error('Error in POST /api/Invoices:', error);
    return NextResponse.json(
      { error: 'Failed to create Invoice' },
      { status: 500 }
    );
  }
}

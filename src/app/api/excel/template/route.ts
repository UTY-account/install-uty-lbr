import { NextResponse } from 'next/server';
import { generateExcelTemplate } from '@/lib/excel-helper';

export async function GET() {
  try {
    const buffer = generateExcelTemplate();

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="Installation_MultiItem_Import_Template.xlsx"',
      },
    });
  } catch (error: any) {
    console.error('Error generating Excel template:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate template' }, { status: 500 });
  }
}

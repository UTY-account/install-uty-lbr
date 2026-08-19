import { NextRequest, NextResponse } from 'next/server';
import { formatDate } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName = 'บริษัท ลัมเบอเรอร์ จำกัด',
      soNumber,
      customerName,
      customerPhone,
      siteLocation,
      googleMapsUrl,
      targetInstallDate,
      targetFinishDate,
      taggedStaff,
      contractorName,
      contractorPhone,
      itemsSummary,
      lineToken,
    } = body;

    const startDateStr = targetInstallDate ? formatDate(targetInstallDate) : '-';
    const endDateStr = targetFinishDate ? formatDate(targetFinishDate) : startDateStr;
    const dateRange = startDateStr === endDateStr ? startDateStr : `${startDateStr} ถึง ${endDateStr}`;

    // Format Tagged Staff
    let staffText = '-';
    if (Array.isArray(taggedStaff) && taggedStaff.length > 0) {
      staffText = taggedStaff.map((s: any) => `${s.name} (${s.role || 'ทีมงาน'})`).join(', ');
    } else if (typeof taggedStaff === 'string' && taggedStaff.trim()) {
      try {
        const parsed = JSON.parse(taggedStaff);
        if (Array.isArray(parsed)) {
          staffText = parsed.map((s: any) => `${s.name} (${s.role || 'ทีมงาน'})`).join(', ');
        } else {
          staffText = taggedStaff;
        }
      } catch (_) {
        staffText = taggedStaff;
      }
    }

    // Build plain text message
    let message = `\n📢 [แจ้งเตือนคิวงานติดตั้ง] - ${companyName}\n`;
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `📋 เลขที่ SO: ${soNumber || '-'}\n`;
    message += `👤 ลูกค้า/โครงการ: ${customerName || '-'}\n`;
    if (customerPhone) message += `📞 โทรลูกค้า: ${customerPhone}\n`;
    message += `📍 สถานที่: ${siteLocation || '-'}\n`;
    if (googleMapsUrl) message += `🗺️ แผนที่นำทาง: ${googleMapsUrl}\n`;
    message += `📅 วันที่นัดเข้างาน: ${dateRange}\n`;
    message += `👷 ผู้รับผิดชอบ/คุมงาน: ${staffText}\n`;
    if (contractorName) {
      message += `🛠️ ช่างผู้รับเหมา: ${contractorName} ${contractorPhone ? `(${contractorPhone})` : ''}\n`;
    }
    if (itemsSummary) {
      message += `📦 รายการงาน: ${itemsSummary}\n`;
    }
    message += `━━━━━━━━━━━━━━━━━━━\n`;
    message += `ระบบ PRO-INSTALL จัดการงานติดตั้ง`;

    // 1-Click LINE Share URL (works instantly in browsers on Mobile & Desktop)
    const encodedMessage = encodeURIComponent(message);
    const lineShareUrl = `https://line.me/R/msg/text/?${encodedMessage}`;

    // If Line Token is provided, optionally send to LINE Notify API
    let notifySent = false;
    if (lineToken && lineToken.trim()) {
      try {
        const lineRes = await fetch('https://notify-api.line.me/api/notify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${lineToken.trim()}`,
          },
          body: new URLSearchParams({ message }),
        });
        notifySent = lineRes.ok;
      } catch (err) {
        console.error('LINE Notify API error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message,
      lineShareUrl,
      notifySent,
    });
  } catch (error: any) {
    console.error('Error generating LINE notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate notification' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
      selectedGroupIds = [], // Array of LineGroup IDs or groupIds
      selectedStaffIds = [], // Array of StaffMember IDs
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

    // Build standard text message
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

    // 1-Click LINE Share URL (works in browser on Mobile & Desktop)
    const encodedMessage = encodeURIComponent(message);
    const lineShareUrl = `https://line.me/R/msg/text/?${encodedMessage}`;

    // Check for LINE_CHANNEL_ACCESS_TOKEN in SystemSetting or process.env
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'LINE_CHANNEL_ACCESS_TOKEN' },
    });
    const channelAccessToken = setting?.value || process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

    const pushResults: any[] = [];
    let autoPushSuccessCount = 0;

    if (channelAccessToken && (selectedGroupIds.length > 0 || selectedStaffIds.length > 0)) {
      // 1. Resolve Targets
      const targetIds: { id: string; name: string; type: 'group' | 'user' }[] = [];

      // Groups
      if (selectedGroupIds.length > 0) {
        const groups = await prisma.lineGroup.findMany({
          where: {
            OR: [
              { id: { in: selectedGroupIds } },
              { groupId: { in: selectedGroupIds } },
            ],
            status: 'ACTIVE',
          },
        });

        for (const g of groups) {
          targetIds.push({ id: g.groupId, name: g.name, type: 'group' });
        }
      }

      // Staff
      if (selectedStaffIds.length > 0) {
        const staffList = await prisma.staffMember.findMany({
          where: {
            id: { in: selectedStaffIds },
            status: 'ACTIVE',
          },
        });

        for (const st of staffList) {
          if (st.lineUserId) {
            targetIds.push({ id: st.lineUserId, name: st.name, type: 'user' });
          }
        }
      }

      // 2. Send Push Messages in Parallel
      for (const target of targetIds) {
        try {
          const pushRes = await fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${channelAccessToken.trim()}`,
            },
            body: JSON.stringify({
              to: target.id,
              messages: [
                {
                  type: 'text',
                  text: message.trim(),
                },
              ],
            }),
          });

          if (pushRes.ok) {
            autoPushSuccessCount++;
            pushResults.push({ target: target.name, type: target.type, success: true });
          } else {
            const errData = await pushRes.json().catch(() => ({}));
            pushResults.push({
              target: target.name,
              type: target.type,
              success: false,
              error: errData.message || 'Push failed',
            });
          }
        } catch (err: any) {
          pushResults.push({ target: target.name, type: target.type, success: false, error: err.message });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message,
      lineShareUrl,
      hasBotToken: !!channelAccessToken,
      autoPushSuccessCount,
      pushResults,
    });
  } catch (error: any) {
    console.error('Error generating LINE notification:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate notification' }, { status: 500 });
  }
}

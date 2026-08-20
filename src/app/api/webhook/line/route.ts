import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'PRO-INSTALL LINE Webhook Service',
    time: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const events = body.events || [];

    // Check for Channel Access Token
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'LINE_CHANNEL_ACCESS_TOKEN' },
    });
    const channelAccessToken = setting?.value || process.env.LINE_CHANNEL_ACCESS_TOKEN || '';

    for (const event of events) {
      const source = event.source || {};
      const replyToken = event.replyToken;
      const groupId = source.groupId;
      const userId = source.userId;

      // 1. Bot Joined Group Event OR Bot received message in Group
      if (groupId) {
        // Auto-register / Upsert Group into DB
        try {
          const existing = await prisma.lineGroup.findUnique({
            where: { groupId },
          });

          if (!existing) {
            await prisma.lineGroup.create({
              data: {
                name: `กลุ่มไลน์ (${groupId.slice(-6)})`,
                groupId,
                companyCode: 'ALL',
                isDefault: true,
                description: 'เพิ่มอัตโนมัติผ่านการเชิญบอทเข้ากลุ่ม',
              },
            });
          }
        } catch (dbErr) {
          console.error('Failed to auto-save LINE group into DB:', dbErr);
        }

        // Check if event is 'join' or text asking for 'id' / 'รหัสกลุ่ม'
        const isJoinEvent = event.type === 'join';
        const isTextMessage = event.type === 'message' && event.message?.type === 'text';
        const textContent = (event.message?.text || '').trim().toLowerCase();
        const isAskingForId =
          isTextMessage &&
          (textContent === 'id' ||
            textContent === 'groupid' ||
            textContent === 'group id' ||
            textContent === 'รหัสกลุ่ม' ||
            textContent === 'ขอรหัสกลุ่ม' ||
            textContent.includes('group id') ||
            textContent.includes('รหัสกลุ่ม'));

        if ((isJoinEvent || isAskingForId) && replyToken && channelAccessToken) {
          const replyText =
            `🤖 บอท PRO-INSTALL พร้อมทำงานแล้วครับ!\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `🆔 LINE Group ID ของกลุ่มนี้คือ:\n` +
            `${groupId}\n` +
            `━━━━━━━━━━━━━━━━━━━\n` +
            `✅ ระบบได้บันทึกกลุ่มนี้เข้าโปรแกรมติดตั้งให้อัตโนมัติแล้ว\n` +
            `คุณสามารถเข้าไปเปลี่ยนชื่อกลุ่มหรือจัดการสิทธิ์ได้ที่เมนู "กลุ่ม LINE" ในระบบครับ`;

          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${channelAccessToken.trim()}`,
            },
            body: JSON.stringify({
              replyToken,
              messages: [
                {
                  type: 'text',
                  text: replyText,
                },
              ],
            }),
          }).catch((err) => console.error('Reply error:', err));
        }
      }
    }

    return NextResponse.json({ success: true, processed: events.length });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message || 'Webhook failed' }, { status: 500 });
  }
}

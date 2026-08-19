import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'LINE_CHANNEL_ACCESS_TOKEN' },
    });

    const envToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
    const activeToken = setting?.value || envToken;

    const isConnected = !!activeToken && activeToken.length > 20;
    const maskedToken = isConnected
      ? `${activeToken.slice(0, 8)}...${activeToken.slice(-6)}`
      : '';

    return NextResponse.json({
      isConnected,
      maskedToken,
      hasCustomToken: !!setting?.value,
    });
  } catch (error: any) {
    console.error('Error fetching LINE settings:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'กรุณาระบุ Channel Access Token' }, { status: 400 });
    }

    const cleanToken = token.trim();

    // Verify token with LINE API by calling /v2/bot/info
    try {
      const lineRes = await fetch('https://api.line.me/v2/bot/info', {
        headers: {
          Authorization: `Bearer ${cleanToken}`,
        },
      });

      if (!lineRes.ok) {
        const lineErr = await lineRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            error: `LINE API ตรวจสอบ Token ไม่ผ่าน: ${lineErr.message || 'Invalid Token'}`,
          },
          { status: 400 }
        );
      }

      const botInfo = await lineRes.json();

      // Save to SystemSetting table
      await prisma.systemSetting.upsert({
        where: { key: 'LINE_CHANNEL_ACCESS_TOKEN' },
        create: {
          key: 'LINE_CHANNEL_ACCESS_TOKEN',
          value: cleanToken,
          description: `LINE Official Account: ${botInfo.displayName || 'Bot'} (@${botInfo.basicId || ''})`,
        },
        update: {
          value: cleanToken,
          description: `LINE Official Account: ${botInfo.displayName || 'Bot'} (@${botInfo.basicId || ''})`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `เชื่อมต่อกับ LINE OA "${botInfo.displayName}" สำเร็จแล้ว`,
        bot: botInfo,
      });
    } catch (testErr: any) {
      // If network issue, save anyway with warning
      await prisma.systemSetting.upsert({
        where: { key: 'LINE_CHANNEL_ACCESS_TOKEN' },
        create: {
          key: 'LINE_CHANNEL_ACCESS_TOKEN',
          value: cleanToken,
          description: 'LINE Channel Access Token',
        },
        update: {
          value: cleanToken,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'บันทึก Token สำเร็จ (ไม่ได้ทดสอบ Bot Info)',
      });
    }
  } catch (error: any) {
    console.error('Error saving LINE token:', error);
    return NextResponse.json({ error: error.message || 'Failed to save token' }, { status: 500 });
  }
}

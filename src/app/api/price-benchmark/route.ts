import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemCode = searchParams.get('itemCode');

    if (!itemCode) {
      // Return list of all items with rate counts for quick selection
      const items = await prisma.item.findMany({
        orderBy: { code: 'asc' },
        include: {
          rateHistory: true,
        },
      });

      const summary = items.map(item => {
        const rates = item.rateHistory.map(r => r.unitRate);
        const minRate = rates.length > 0 ? Math.min(...rates) : item.standardRate;
        const maxRate = rates.length > 0 ? Math.max(...rates) : item.standardRate;
        const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : item.standardRate;

        return {
          id: item.id,
          code: item.code,
          name: item.name,
          category: item.category,
          unit: item.unit,
          standardRate: item.standardRate,
          ratesCount: rates.length,
          minRate,
          maxRate,
          avgRate: Math.round(avgRate * 100) / 100,
        };
      });

      return NextResponse.json({ items: summary });
    }

    // Specific Item Detailed Benchmark
    const item = await prisma.item.findUnique({
      where: { code: itemCode.trim().toUpperCase() },
      include: {
        rateHistory: {
          include: {
            subcontractor: true,
          },
          orderBy: { recordedAt: 'desc' },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: `ไม่พบรหัสรายการ ${itemCode}` }, { status: 404 });
    }

    // Extract unique latest rate per subcontractor
    const subLatestRateMap = new Map<string, any>();
    for (const r of item.rateHistory) {
      if (!subLatestRateMap.has(r.subcontractorId)) {
        subLatestRateMap.set(r.subcontractorId, {
          subcontractorId: r.subcontractorId,
          subcontractor: r.subcontractor,
          latestRate: r.unitRate,
          latestJobCode: r.jobCode,
          latestJobTitle: r.jobTitle,
          latestRecordedAt: r.recordedAt,
          allHistory: [],
        });
      }
      subLatestRateMap.get(r.subcontractorId)!.allHistory.push(r);
    }

    const contractorComparisons = Array.from(subLatestRateMap.values());
    const rates = contractorComparisons.map(c => c.latestRate);
    const minRate = rates.length > 0 ? Math.min(...rates) : item.standardRate;
    const maxRate = rates.length > 0 ? Math.max(...rates) : item.standardRate;
    const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : item.standardRate;

    // Mark lowest price & difference from average
    const enrichedComparisons = contractorComparisons.map(c => {
      const diffFromAvg = c.latestRate - avgRate;
      const diffPercent = avgRate > 0 ? ((c.latestRate - avgRate) / avgRate) * 100 : 0;
      return {
        ...c,
        isLowest: c.latestRate === minRate,
        isHighest: c.latestRate === maxRate,
        diffFromAvg: Math.round(diffFromAvg * 100) / 100,
        diffPercent: Math.round(diffPercent * 10) / 10,
      };
    }).sort((a, b) => a.latestRate - b.latestRate); // Sort ascending (cheapest first)

    return NextResponse.json({
      item: {
        id: item.id,
        code: item.code,
        name: item.name,
        category: item.category,
        unit: item.unit,
        standardRate: item.standardRate,
        description: item.description,
      },
      stats: {
        minRate,
        maxRate,
        avgRate: Math.round(avgRate * 100) / 100,
        totalSubcontractors: contractorComparisons.length,
        totalHistoricalEntries: item.rateHistory.length,
      },
      contractors: enrichedComparisons,
      rateHistoryTimeline: item.rateHistory,
    });
  } catch (error: any) {
    console.error('Error in price benchmark API:', error);
    return NextResponse.json({ error: error.message || 'Price benchmark query failed' }, { status: 500 });
  }
}

'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PriceCompareChartProps {
  contractors: Array<{
    subcontractorId: string;
    subcontractor: {
      name: string;
    };
    latestRate: number;
    isLowest: boolean;
    isHighest: boolean;
  }>;
  avgRate: number;
  standardRate: number;
  unit: string;
}

export function PriceCompareChart({
  contractors,
  avgRate,
  standardRate,
  unit,
}: PriceCompareChartProps) {
  if (!contractors || contractors.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
        ไม่มีข้อมูลช่างสำหรับแสดงแผนภูมิเปรียบเทียบ
      </div>
    );
  }

  const chartData = contractors.map((c) => ({
    name: c.subcontractor.name.length > 18 ? c.subcontractor.name.substring(0, 16) + '...' : c.subcontractor.name,
    fullName: c.subcontractor.name,
    rate: c.latestRate,
    isLowest: c.isLowest,
    isHighest: c.isHighest,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-lg text-xs text-slate-900 space-y-1">
          <div className="font-bold text-slate-900">{data.fullName}</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">ราคาต่อหน่วย:</span>
            <span className="font-bold text-blue-600">
              {formatCurrency(data.rate)} / {unit}
            </span>
          </div>
          {data.isLowest && (
            <div className="text-[11px] font-bold text-emerald-700">★ ราคาต่ำที่สุด</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
          />
          <YAxis
            stroke="#64748b"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val) => `฿${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={avgRate}
            stroke="#d97706"
            strokeDasharray="4 4"
            label={{
              value: `เฉลี่ย ฿${avgRate.toFixed(1)}`,
              fill: '#b45309',
              fontSize: 10,
              position: 'right',
            }}
          />
          <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isLowest ? '#10b981' : entry.isHighest ? '#f43f5e' : '#3b82f6'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

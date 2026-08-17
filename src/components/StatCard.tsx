'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'purple';
  trend?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  trend,
}: StatCardProps) {
  const colorMap = {
    blue: {
      border: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      valueColor: 'text-slate-900',
    },
    emerald: {
      border: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      valueColor: 'text-emerald-700',
    },
    amber: {
      border: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-100',
      valueColor: 'text-amber-700',
    },
    indigo: {
      border: 'border-indigo-100 hover:border-indigo-300',
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
      valueColor: 'text-indigo-700',
    },
    rose: {
      border: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-600 border border-rose-100',
      valueColor: 'text-rose-700',
    },
    purple: {
      border: 'border-purple-100 hover:border-purple-300',
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      valueColor: 'text-purple-700',
    },
  };

  const scheme = colorMap[color];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-5 border ${scheme.border} shadow-sm hover:shadow-md transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${scheme.valueColor}`}>
          {value}
        </div>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}

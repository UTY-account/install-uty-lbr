'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  HardHat,
  Briefcase,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Building2,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatThaiDate } from '@/lib/utils';

interface WorkScheduleCalendarProps {
  schedules: any[];
  onSelectSchedule: (schedule: any) => void;
  onAddScheduleForDate: (dateStr: string) => void;
}

export function WorkScheduleCalendar({
  schedules,
  onSelectSchedule,
  onAddScheduleForDate,
}: WorkScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const thaiMonthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const thaiDayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays: Array<{ date: Date; isCurrentMonth: boolean; dateStr: string }> = [];

  // Prev month padding days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const d = new Date(year, month - 1, day);
    const dateStr = d.toISOString().split('T')[0];
    calendarDays.push({ date: d, isCurrentMonth: false, dateStr });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarDays.push({ date: d, isCurrentMonth: true, dateStr });
  }

  // Next month padding days to fill 35 or 42 grid cells
  const remainingCells = 42 - calendarDays.length;
  for (let day = 1; day <= remainingCells; day++) {
    const d = new Date(year, month + 1, day);
    const dateStr = d.toISOString().split('T')[0];
    calendarDays.push({ date: d, isCurrentMonth: false, dateStr });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to check if a schedule falls on a given date
  const getSchedulesForDate = (dateStr: string) => {
    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    return schedules.filter((s) => {
      const start = new Date(s.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(s.endDate);
      end.setHours(23, 59, 59, 999);
      return targetDate >= start && targetDate <= end;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: '✓ เสร็จสิ้น', dot: 'bg-emerald-500' };
      case 'IN_PROGRESS':
        return { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: '● กำลังทำงาน', dot: 'bg-blue-500' };
      case 'DELAYED':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', text: '⚠️ ติดปัญหา', dot: 'bg-rose-500' };
      case 'CANCELLED':
        return { bg: 'bg-slate-100 text-slate-500 border-slate-200', text: '✕ ยกเลิก', dot: 'bg-slate-400' };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: '○ วางแผนแล้ว', dot: 'bg-slate-500' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Calendar Top Navigation Header */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Month Title & Nav */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-xs font-bold text-slate-700 hover:bg-white rounded-xl transition-colors shadow-2xs"
            >
              วันนี้
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-xl hover:bg-white text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            {thaiMonthNames[month]} {year + 543}
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              ปฏิทินรายเดือน
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              รายการ & ไทม์ไลน์
            </button>
          </div>
        </div>
      </div>

      {/* View 1: Calendar Grid View */}
      {viewMode === 'calendar' ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden space-y-2">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 pb-2 border-b border-slate-100">
            {thaiDayNames.map((dName, idx) => (
              <div
                key={idx}
                className={`py-1.5 rounded-lg ${
                  idx === 0 ? 'text-rose-600' : idx === 6 ? 'text-blue-600' : 'text-slate-700'
                }`}
              >
                {dName}
              </div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((cell, idx) => {
              const daySchedules = getSchedulesForDate(cell.dateStr);
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  onClick={() => onAddScheduleForDate(cell.dateStr)}
                  className={`min-h-[110px] p-2 rounded-2xl border transition-all flex flex-col justify-between group cursor-pointer ${
                    cell.isCurrentMonth
                      ? isToday
                        ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
                      : 'bg-slate-50/40 border-slate-100 text-slate-300 opacity-60'
                  }`}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded-lg ${
                        isToday
                          ? 'bg-blue-600 text-white font-extrabold'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.date.getDate()}
                    </span>

                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-blue-600 font-bold">
                      + เพิ่ม
                    </span>
                  </div>

                  {/* Schedules Pill Cards in this Date */}
                  <div className="space-y-1 my-1 overflow-y-auto max-h-24 pr-0.5">
                    {daySchedules.map((sc: any) => {
                      const badge = getStatusBadge(sc.status);

                      return (
                        <div
                          key={sc.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSchedule(sc);
                          }}
                          className={`p-1.5 rounded-xl border text-[10px] font-medium space-y-0.5 shadow-2xs hover:scale-[1.01] transition-all cursor-pointer ${badge.bg}`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold truncate text-slate-900">
                              {sc.subcontractor.name}
                            </span>
                            <span className="font-mono text-[9px] font-bold text-blue-700">
                              {sc.progressPercent}%
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-700 font-semibold truncate">
                            {sc.title}
                          </div>
                          <div className="text-[9px] text-slate-500 truncate">
                            {sc.job.company?.code} &bull; {sc.job.jobCode}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-1"></div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View 2: Timeline & List View */
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-3 px-4 w-32 whitespace-nowrap">วันที่เข้างาน</th>
                  <th className="py-3 px-4 w-44 whitespace-nowrap">ช่างผู้รับเหมา</th>
                  <th className="py-3 px-4">ชื่องาน / กิจกรรม</th>
                  <th className="py-3 px-4 w-48 whitespace-nowrap">โครงการ / บริษัท</th>
                  <th className="py-3 px-4 text-center w-36 whitespace-nowrap">ความคืบหน้า</th>
                  <th className="py-3 px-4 text-center w-32 whitespace-nowrap">สถานะ</th>
                  <th className="py-3 px-4 text-center w-28 whitespace-nowrap">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      ไม่พบรายการแผนงานในเดือนนี้ คลิกปุ่ม "+ เพิ่มแผนงาน" เพื่อเริ่มวางแผน
                    </td>
                  </tr>
                ) : (
                  schedules.map((sc) => {
                    const badge = getStatusBadge(sc.status);

                    return (
                      <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                          {formatThaiDate(sc.startDate)}
                          {sc.startDate !== sc.endDate && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              ถึง {formatThaiDate(sc.endDate)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <HardHat className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                            {sc.subcontractor.name}
                          </div>
                          <span className="text-[10px] text-slate-400">{sc.subcontractor.phone}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 leading-snug">{sc.title}</div>
                          {sc.linkedInstallmentNo && (
                            <span className="text-[10px] text-blue-700 font-semibold inline-flex items-center gap-1 mt-0.5">
                              <CreditCard className="w-3 h-3" /> ผูกงวดที่ {sc.linkedInstallmentNo}
                              {sc.targetAmount ? ` (${formatCurrency(sc.targetAmount)})` : ''}
                            </span>
                          )}
                          {sc.delayReason && (
                            <span className="text-[10px] text-rose-700 font-bold block mt-0.5">
                              สาเหตุล่าช้า: {sc.delayReason}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 truncate max-w-[180px]">
                            {sc.job.title}
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {sc.job.company?.code} &bull; {sc.job.jobCode}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  sc.progressPercent >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                                }`}
                                style={{ width: `${sc.progressPercent}%` }}
                              />
                            </div>
                            <span className="font-mono font-bold text-[11px] text-slate-700 w-8">
                              {sc.progressPercent}%
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                          >
                            {badge.text}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => onSelectSchedule(sc)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition-colors shadow-2xs"
                          >
                            อัปเดตสถานะ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

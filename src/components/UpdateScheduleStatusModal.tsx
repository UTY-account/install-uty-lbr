'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  HardHat,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  CreditCard,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatThaiDate, formatISODate } from '@/lib/utils';
import DatePicker from '@/components/DatePicker';

interface UpdateScheduleStatusModalProps {
  schedule: {
    id: string;
    title: string;
    description?: string | null;
    taskCategory?: string | null;
    startDate: string | Date;
    endDate: string | Date;
    status: string;
    progressPercent: number;
    linkedInstallmentNo?: number | null;
    targetAmount?: number | null;
    delayReason?: string | null;
    notes?: string | null;
    job: {
      id: string;
      jobCode: string;
      title: string;
      company?: { code: string; nameTh: string };
    };
    subcontractor: {
      id: string;
      name: string;
      phone: string;
    };
    subContract?: any | null;
  };
  onClose: () => void;
  onSuccess: () => void;
  onPayInstallment?: (contract: any) => void;
}

export function UpdateScheduleStatusModal({
  schedule,
  onClose,
  onSuccess,
  onPayInstallment,
}: UpdateScheduleStatusModalProps) {
  const [status, setStatus] = useState<string>(schedule.status);
  const [progressPercent, setProgressPercent] = useState<number>(schedule.progressPercent || 0);
  const [startDate, setStartDate] = useState<string>(formatISODate(schedule.startDate));
  const [endDate, setEndDate] = useState<string>(formatISODate(schedule.endDate));
  const [delayReason, setDelayReason] = useState<string>(schedule.delayReason || '');
  const [notes, setNotes] = useState<string>(schedule.notes || '');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStatusSelect = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus === 'COMPLETED') {
      setProgressPercent(100);
    } else if (newStatus === 'PLANNED') {
      setProgressPercent(0);
    } else if (newStatus === 'IN_PROGRESS' && progressPercent === 0) {
      setProgressPercent(25);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          progressPercent,
          startDate,
          endDate,
          delayReason: status === 'DELAYED' ? delayReason.trim() : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปเดตสถานะไม่สำเร็จ');

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`คุณต้องการลบแผนงาน "${schedule.title}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/schedules/${schedule.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      onSuccess();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบแผนงาน');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                อัปเดตสถานะและความคืบหน้าหน้างาน
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {schedule.job.jobCode} &bull; {schedule.subcontractor.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Task Info Summary */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {schedule.taskCategory || 'งานติดตั้ง'}
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-500">
                {formatThaiDate(schedule.startDate)} - {formatThaiDate(schedule.endDate)}
              </span>
            </div>
            <h4 className="text-sm font-extrabold text-slate-900">{schedule.title}</h4>
            <div className="text-slate-600">
              <strong>โครงการ:</strong> {schedule.job.title} ({schedule.job.company?.code})
            </div>
            <div className="text-slate-600">
              <strong>ช่างผู้รับผิดชอบ:</strong> {schedule.subcontractor.name} ({schedule.subcontractor.phone})
            </div>
            {schedule.linkedInstallmentNo && (
              <div className="text-blue-700 font-bold pt-1 border-t border-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                ผูกกับงวดเงินที่ {schedule.linkedInstallmentNo}
                {schedule.targetAmount ? ` (เป้าหมาย ${formatCurrency(schedule.targetAmount)})` : ''}
              </div>
            )}
          </div>

          {/* Status Quick Selection Buttons */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              เลือกสถานะปัจจุบันของงาน *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStatusSelect('PLANNED')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  status === 'PLANNED'
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                ⚪ วางแผนแล้ว
              </button>

              <button
                type="button"
                onClick={() => handleStatusSelect('IN_PROGRESS')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  status === 'IN_PROGRESS'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50'
                }`}
              >
                🔵 กำลังทำงาน
              </button>

              <button
                type="button"
                onClick={() => handleStatusSelect('COMPLETED')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  status === 'COMPLETED'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                🟢 เสร็จสิ้นแล้ว
              </button>

              <button
                type="button"
                onClick={() => handleStatusSelect('DELAYED')}
                className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                  status === 'DELAYED'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-white text-rose-700 border-rose-200 hover:bg-rose-50'
                }`}
              >
                🔴 ติดปัญหา/ล่าช้า
              </button>
            </div>
          </div>

          {/* Progress Percent Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">เปอร์เซ็นต์ความคืบหน้า</label>
              <span className="font-mono font-extrabold text-blue-700 text-sm">{progressPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progressPercent}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setProgressPercent(val);
                if (val >= 100) setStatus('COMPLETED');
                else if (val > 0 && status === 'PLANNED') setStatus('IN_PROGRESS');
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Delay Reason Input */}
          {status === 'DELAYED' && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 space-y-1.5">
              <label className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                สาเหตุที่งานล่าช้า / ปัญหาหน้างาน *
              </label>
              <input
                type="text"
                value={delayReason}
                onChange={(e) => setDelayReason(e.target.value)}
                placeholder="เช่น รอหน้างานเคลียร์พื้นที่, ช่างติดงานโครงการอื่น, วัสดุส่งช้า 2 วัน"
                className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs text-slate-900 focus:ring-2 focus:ring-rose-500 shadow-2xs"
                required
              />
            </div>
          )}

          {/* Start & End Dates Adjustment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">วันที่เริ่มเข้างาน (DD/MM/YYYY)</label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">วันที่สิ้นสุด/ส่งมอบ (DD/MM/YYYY)</label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">หมายเหตุเพิ่มเติม</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="บันทึกรายละเอียดงาน ผลการตรวจรับ หรือสิ่งที่ต้องตามต่อ"
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 shadow-2xs"
            />
          </div>

          {/* Completed Milestone Ready to Pay Notification */}
          {(status === 'COMPLETED' || progressPercent >= 100) && schedule.subContract && onPayInstallment && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="text-xs text-emerald-950">
                <strong className="block font-bold">✓ งานเสร็จสิ้นแล้ว พร้อมเบิกจ่ายเงินงวด!</strong>
                {schedule.linkedInstallmentNo ? `ผูกกับงวดเงินที่ ${schedule.linkedInstallmentNo}` : 'สัญญาจ้างพร้อมบันทึกจ่ายเงิน'}
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPayInstallment(schedule.subContract);
                }}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm whitespace-nowrap flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                จ่ายเงินงวดนี้ทันที
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              ลบแผนงาน
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึกการอัปเดต'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

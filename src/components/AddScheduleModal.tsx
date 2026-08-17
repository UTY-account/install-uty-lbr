'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  HardHat,
  Briefcase,
  Layers,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building2,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatISODate } from '@/lib/utils';
import DatePicker from '@/components/DatePicker';

interface AddScheduleModalProps {
  initialJobId?: string;
  initialSubId?: string;
  initialDate?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddScheduleModal({
  initialJobId,
  initialSubId,
  initialDate,
  onClose,
  onSuccess,
}: AddScheduleModalProps) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedJobId, setSelectedJobId] = useState(initialJobId || '');
  const [selectedSubId, setSelectedSubId] = useState(initialSubId || '');
  const [selectedContractId, setSelectedContractId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('งานติดตั้งหลัก');
  const [startDate, setStartDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('PLANNED');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [linkedInstallmentNo, setLinkedInstallmentNo] = useState<string>('');
  const [targetAmount, setTargetAmount] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [jobsRes, subsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/subcontractors'),
        ]);

        if (jobsRes.ok && subsRes.ok) {
          const jobsData = await jobsRes.json();
          const subsData = await subsRes.json();
          setJobs(jobsData);
          setSubcontractors(subsData);

          if (!selectedJobId && jobsData.length > 0) {
            setSelectedJobId(jobsData[0].id);
          }
          if (!selectedSubId && subsData.length > 0) {
            setSelectedSubId(subsData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Update selected contract when job or sub changes
  useEffect(() => {
    if (selectedJobId && selectedSubId && jobs.length > 0) {
      const activeJob = jobs.find((j) => j.id === selectedJobId);
      if (activeJob && activeJob.subContracts) {
        const matchedContract = activeJob.subContracts.find(
          (sc: any) => sc.subcontractorId === selectedSubId
        );
        if (matchedContract) {
          setSelectedContractId(matchedContract.id);
        } else {
          setSelectedContractId('');
        }
      }
    }
  }, [selectedJobId, selectedSubId, jobs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId || !selectedSubId || !title.trim() || !startDate) {
      setErrorMsg('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: selectedJobId,
          subContractId: selectedContractId || undefined,
          subcontractorId: selectedSubId,
          title: title.trim(),
          description: description.trim() || undefined,
          taskCategory,
          startDate,
          endDate: endDate || startDate,
          status,
          progressPercent,
          linkedInstallmentNo: linkedInstallmentNo ? parseInt(linkedInstallmentNo) : undefined,
          targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกแผนงานไม่สำเร็จ');

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกแผนงาน');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                เพิ่มแผนงานและตารางเข้าหน้างาน
              </h3>
              <p className="text-xs text-slate-500">
                วางแผนวันเข้าหน้างานของช่าง และผูกเงื่อนไขงวดเงิน
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Job Selector */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                โครงการ / งานติดตั้ง *
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                required
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.jobCode}: {j.title} ({j.company?.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Subcontractor Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ช่างผู้รับผิดชอบ *
              </label>
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                required
              >
                {subcontractors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Task Category */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                หมวดหมู่กิจกรรม
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="เตรียมหน้างาน">1. เตรียมหน้างาน / ขนย้ายวัสดุ</option>
                <option value="งานติดตั้งหลัก">2. งานติดตั้งหลัก (โครงสร้าง/ปูพื้น/ฝ้า)</option>
                <option value="เก็บงาน/แก้ไข">3. งานเก็บรายละเอียด / ซ่อมแซม</option>
                <option value="ตรวจรับส่งมอบ">4. ตรวจรับงานและส่งมอบ</option>
              </select>
            </div>

            {/* Title */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ชื่องาน / กิจกรรมที่เข้าทำ *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น เข้าติดตั้งพื้น SPC ชั้น 1, ติดตั้งโครงคร่าวฝ้าเพดาน"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                required
              />
            </div>

            {/* Start & End Date */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่เริ่มเข้าทำงาน (DD/MM/YYYY) *
              </label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่คาดว่าจะเสร็จสิ้น (DD/MM/YYYY) *
              </label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                required
              />
            </div>

            {/* Initial Status & Progress */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                สถานะเริ่มต้น
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (e.target.value === 'COMPLETED') setProgressPercent(100);
                  if (e.target.value === 'PLANNED') setProgressPercent(0);
                }}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value="PLANNED">⚪ วางแผนแล้ว (Planned)</option>
                <option value="IN_PROGRESS">🔵 กำลังเข้าทำงาน (In Progress)</option>
                <option value="COMPLETED">🟢 เสร็จสิ้น/ส่งมอบแล้ว (Completed)</option>
                <option value="DELAYED">🔴 ล่าช้า/ติดปัญหา (Delayed)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex justify-between">
                <span>ความคืบหน้า</span>
                <span className="font-mono font-bold text-blue-700">{progressPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressPercent}
                onChange={(e) => setProgressPercent(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-2"
              />
            </div>

            {/* Linked Payment Installment Milestone Box */}
            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-950">
                <CreditCard className="w-4 h-4 text-blue-700" />
                เงื่อนไขการเบิกจ่ายเงิน (Payment Milestone Link)
              </div>
              <p className="text-[11px] text-slate-600">
                ผูกแผนงานนี้เข้ากับงวดเงิน เมื่อตรวจรับงานผ่านระบบจะแจ้งเตือนพร้อมจ่ายงวดนั้นทันที
              </p>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ผูกกับงวดเงินที่
                  </label>
                  <select
                    value={linkedInstallmentNo}
                    onChange={(e) => setLinkedInstallmentNo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-900"
                  >
                    <option value="">-- ไม่ผูกกับงวดเงิน --</option>
                    <option value="1">งวดที่ 1 (มัดจำ/เริ่มงาน)</option>
                    <option value="2">งวดที่ 2 (งานคืบหน้า 50%)</option>
                    <option value="3">งวดที่ 3 (ส่งมอบงาน/เก็บเงินงวดสุดท้าย)</option>
                    <option value="4">งวดที่ 4</option>
                    <option value="5">งวดที่ 5</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    ยอดเงินเป้าหมายที่เบิกจ่าย (บาท)
                  </label>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="เช่น 15000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                หมายเหตุ / ข้อตกลงหน้างาน
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น ช่างจะนำเครื่องมือเข้า 09:00 น., ต้องประสานงานนิติบุคคลก่อนเข้าตึก"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'กำลังบันทึก...' : 'บันทึกแผนงานเข้าหน้างาน'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

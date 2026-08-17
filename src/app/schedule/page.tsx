'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  PlusCircle,
  HardHat,
  Briefcase,
  Filter,
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import { WorkScheduleCalendar } from '@/components/WorkScheduleCalendar';
import { AddScheduleModal } from '@/components/AddScheduleModal';
import { UpdateScheduleStatusModal } from '@/components/UpdateScheduleStatusModal';
import { PaymentModal } from '@/components/PaymentModal';

export default function WorkSchedulePage() {
  const { selectedCompanyCode } = useCompany();

  const [schedules, setSchedules] = useState<any[]>([]);
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [subcontractorFilter, setSubcontractorFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [paymentModalContract, setPaymentModalContract] = useState<any | null>(null);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCompanyCode !== 'all') {
        params.set('companyCode', selectedCompanyCode);
      }
      if (subcontractorFilter !== 'all') {
        params.set('subcontractorId', subcontractorFilter);
      }
      if (jobFilter !== 'all') {
        params.set('jobId', jobFilter);
      }
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(`/api/schedules?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [subsRes, jobsRes] = await Promise.all([
        fetch('/api/subcontractors'),
        fetch('/api/jobs'),
      ]);
      if (subsRes.ok && jobsRes.ok) {
        setSubcontractors(await subsRes.json());
        setJobs(await jobsRes.json());
      }
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [selectedCompanyCode, subcontractorFilter, jobFilter, statusFilter]);

  // Statistics calculation
  const totalCount = schedules.length;
  const inProgressCount = schedules.filter((s) => s.status === 'IN_PROGRESS').length;
  const completedCount = schedules.filter((s) => s.status === 'COMPLETED').length;
  const delayedCount = schedules.filter((s) => s.status === 'DELAYED').length;
  const plannedCount = schedules.filter((s) => s.status === 'PLANNED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-blue-600" />
            ตารางงานและแผนเข้าหน้างานของช่าง (Work Schedule & Milestones)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            วางแผนวันเข้าหน้างานของช่างล่วงหน้า &bull; ติดตามความคืบหน้ารายวัน &bull; ผูกเงื่อนไขงวดเงินเบิกจ่าย
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setPrefilledDate(undefined);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            + เพิ่มแผนงานเข้าหน้างาน
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">วางแผนแล้ว</div>
            <div className="text-xl font-extrabold text-slate-900 font-mono">{plannedCount} งาน</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-blue-600 uppercase">กำลังเข้าทำ</div>
            <div className="text-xl font-extrabold text-blue-700 font-mono">{inProgressCount} งาน</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-emerald-600 uppercase">เสร็จสิ้นแล้ว</div>
            <div className="text-xl font-extrabold text-emerald-700 font-mono">{completedCount} งาน</div>
          </div>
        </div>

        <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-rose-600 uppercase">ติดปัญหา/ล่าช้า</div>
            <div className="text-xl font-extrabold text-rose-700 font-mono">{delayedCount} งาน</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" />
            ตัวกรอง:
          </div>

          {/* Subcontractor Filter */}
          <select
            value={subcontractorFilter}
            onChange={(e) => setSubcontractorFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
          >
            <option value="all">ช่างทุกคน (All Subcontractors)</option>
            {subcontractors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Job Filter */}
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs max-w-xs truncate"
          >
            <option value="all">ทุกโครงการ (All Jobs)</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.jobCode}: {j.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs"
          >
            <option value="all">ทุกสถานะ (All Status)</option>
            <option value="PLANNED">⚪ วางแผนแล้ว</option>
            <option value="IN_PROGRESS">🔵 กำลังทำงาน</option>
            <option value="COMPLETED">🟢 เสร็จสิ้น</option>
            <option value="DELAYED">🔴 ติดปัญหา</option>
          </select>
        </div>

        <button
          onClick={fetchSchedules}
          className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-2xs"
          title="รีเฟรชตารางงาน"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Calendar & Timeline Component */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-sm font-medium">
          กำลังโหลดตารางงานเข้าหน้างาน...
        </div>
      ) : (
        <WorkScheduleCalendar
          schedules={schedules}
          onSelectSchedule={(sc) => setSelectedSchedule(sc)}
          onAddScheduleForDate={(dateStr) => {
            setPrefilledDate(dateStr);
            setShowAddModal(true);
          }}
        />
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <AddScheduleModal
          initialDate={prefilledDate}
          onClose={() => {
            setShowAddModal(false);
            setPrefilledDate(undefined);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setPrefilledDate(undefined);
            fetchSchedules();
          }}
        />
      )}

      {/* Update Schedule Status Modal */}
      {selectedSchedule && (
        <UpdateScheduleStatusModal
          schedule={selectedSchedule}
          onClose={() => setSelectedSchedule(null)}
          onSuccess={() => {
            setSelectedSchedule(null);
            fetchSchedules();
          }}
          onPayInstallment={(contract) => {
            setPaymentModalContract(contract);
          }}
        />
      )}

      {/* Payment Modal triggered from completed milestone */}
      {paymentModalContract && (
        <PaymentModal
          contract={paymentModalContract}
          jobTitle={paymentModalContract.job?.title || 'งานติดตั้ง'}
          onClose={() => setPaymentModalContract(null)}
          onSuccess={() => {
            setPaymentModalContract(null);
            fetchSchedules();
          }}
        />
      )}
    </div>
  );
}

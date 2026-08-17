'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  HardHat,
  CreditCard,
  PlusCircle,
  FileCheck,
  Receipt,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Edit2,
  Trash2,
  History,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { PaymentModal } from '@/components/PaymentModal';
import { EditPaymentModal } from '@/components/EditPaymentModal';
import { PaymentVoucherA4View } from '@/components/PaymentVoucherA4View';
import { IDCardUploadModal } from '@/components/IDCardUploadModal';
import { AddScheduleModal } from '@/components/AddScheduleModal';
import { UpdateScheduleStatusModal } from '@/components/UpdateScheduleStatusModal';
import { formatCurrency, formatMoney, formatThaiDate, formatThaiIDCard } from '@/lib/utils';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals state
  const [paymentModalContract, setPaymentModalContract] = useState<any | null>(null);
  const [editingPayment, setEditingPayment] = useState<{ payment: any; contract: any } | null>(null);
  const [activeVoucher, setActiveVoucher] = useState<{ payment: any; contract: any } | null>(null);
  const [verifyCardSub, setVerifyCardSub] = useState<any | null>(null);

  // Schedule Modals state
  const [showScheduleAdd, setShowScheduleAdd] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) {
        throw new Error('ไม่พบข้อมูลงานติดตั้ง');
      }
      const data = await res.json();
      setJob(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) fetchJobDetail();
  }, [jobId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchJobDetail();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm font-medium">
        กำลังโหลดรายละเอียดงานติดตั้ง...
      </div>
    );
  }

  if (errorMsg || !job) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">ไม่พบงานติดตั้งที่ระบุ</h2>
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> กลับหน้ารายการงาน
        </Link>
      </div>
    );
  }

  const { financials } = job;

  const getScheduleStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: '✓ เสร็จสิ้น' };
      case 'IN_PROGRESS':
        return { bg: 'bg-blue-50 text-blue-800 border-blue-200', text: '● กำลังทำงาน' };
      case 'DELAYED':
        return { bg: 'bg-rose-50 text-rose-800 border-rose-200', text: '⚠️ ติดปัญหา' };
      case 'CANCELLED':
        return { bg: 'bg-slate-100 text-slate-500 border-slate-200', text: '✕ ยกเลิก' };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', text: '○ วางแผนแล้ว' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 shadow-2xs">
                {job.jobCode}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company.code} - {job.company.nameTh}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{job.title}</h1>
          </div>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={`px-4 py-2 rounded-xl font-bold text-xs border shadow-2xs transition-all ${
              job.status === 'COMPLETED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-blue-50 text-blue-800 border-blue-300'
            }`}
          >
            <option value="IN_PROGRESS">● กำลังดำเนินงาน (In Progress)</option>
            <option value="COMPLETED">✓ เสร็จสิ้น (Completed)</option>
            <option value="DRAFT">○ ร่าง (Draft)</option>
            <option value="CANCELLED">✕ ยกเลิก (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Financial Overview KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Net Job Contract Amount */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">ยอดสัญญารวมทั้งสิ้น</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatCurrency(financials.netJobAmount)}
          </div>
          <p className="text-[11px] text-slate-400">{job.subContracts.length} สัญญาจ้างช่าง</p>
        </div>

        {/* KPI 2: Paid Total */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">ยอดจ่ายแล้วสะสม</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {formatCurrency(financials.totalPaidAmount)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>จ่ายแล้ว {financials.progress}% ของยอดรวม</span>
          </div>
        </div>

        {/* KPI 3: Remaining Balance */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">ยอดคงเหลือค้างจ่ายจริง</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            {formatCurrency(financials.remainingBalance)}
          </div>
          <p className="text-[11px] text-slate-400">ยอดที่ยังต้องจ่ายในงวดถัดไป</p>
        </div>
      </div>

      {/* Project Metadata Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-slate-400 font-semibold block">สถานที่ติดตั้ง:</span>
          <span className="font-bold text-slate-800 text-sm">{job.siteLocation || '-'}</span>
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">ลูกค้า / ผู้ติดต่อ:</span>
          <span className="font-bold text-slate-800 text-sm">{job.customerName || '-'}</span>
          {job.customerPhone && <span className="text-slate-500 block">{job.customerPhone}</span>}
        </div>
        <div>
          <span className="text-slate-400 font-semibold block">ระยะเวลาดำเนินงาน:</span>
          <span className="font-bold text-slate-800 text-sm">
            {job.startDate ? formatThaiDate(job.startDate) : '-'} ถึง{' '}
            {job.endDate ? formatThaiDate(job.endDate) : '-'}
          </span>
        </div>
      </div>

      {/* Work Schedule & Milestones Planning Section */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              แผนงานและตารางเข้าหน้างาน ({job.schedules?.length || 0} รายการ)
            </h3>
            <p className="text-xs text-slate-500">
              กำหนดวันเข้าทำงานของช่าง ติดตามความคืบหน้า และผูกเงื่อนไขงวดเงินเบิกจ่าย
            </p>
          </div>

          <button
            onClick={() => setShowScheduleAdd(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            + เพิ่มแผนงานเข้าหน้างาน
          </button>
        </div>

        {(!job.schedules || job.schedules.length === 0) ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs space-y-2">
            <div>ยังไม่มีการวางแผนวันเข้าหน้างานสำหรับโครงการนี้</div>
            <button
              onClick={() => setShowScheduleAdd(true)}
              className="text-blue-600 font-bold hover:underline"
            >
              คลิกที่นี่เพื่อเริ่มวางแผนงานของช่าง
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-bold">
                  <th className="py-3 px-3.5 w-32 whitespace-nowrap">วันที่เข้างาน</th>
                  <th className="py-3 px-3.5 w-44 whitespace-nowrap">ช่างผู้รับเหมา</th>
                  <th className="py-3 px-3.5">ชื่องาน / กิจกรรม</th>
                  <th className="py-3 px-3.5 w-32 whitespace-nowrap">หมวดงาน</th>
                  <th className="py-3 px-3.5 text-center w-36 whitespace-nowrap">ความคืบหน้า</th>
                  <th className="py-3 px-3.5 text-center w-32 whitespace-nowrap">สถานะ</th>
                  <th className="py-3 px-3.5 text-center w-28 whitespace-nowrap">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {job.schedules.map((sc: any) => {
                  const badge = getScheduleStatusBadge(sc.status);

                  return (
                    <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {formatThaiDate(sc.startDate)}
                        {sc.startDate !== sc.endDate && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ถึง {formatThaiDate(sc.endDate)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <HardHat className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          {sc.subcontractor?.name}
                        </div>
                        <span className="text-[10px] text-slate-400">{sc.subcontractor?.phone}</span>
                      </td>

                      <td className="py-3 px-3.5">
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

                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px]">
                          {sc.taskCategory || 'งานติดตั้ง'}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
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

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          {badge.text}
                        </span>
                      </td>

                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <button
                          onClick={() => setSelectedSchedule(sc)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition-colors shadow-2xs"
                        >
                          อัปเดตสถานะ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subcontractor Contracts & Multi-Installment Payment System */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <HardHat className="w-5 h-5 text-amber-600" />
              สัญญาจ้างช่างและรายการเบิกจ่าย (Subcontractor Contracts)
            </h3>
            <p className="text-xs text-slate-500">
              รายละเอียดรายการย่อยที่ช่างแต่ละคนรับผิดชอบ และประวัติการจ่ายเงินแต่ละงวด
            </p>
          </div>
        </div>

        {/* Contract Cards */}
        <div className="space-y-6">
          {job.subContracts.map((contract: any) => {
            const isPendingCard = contract.subcontractor.idCardStatus === 'PENDING_ATTACHMENT';

            return (
              <div
                key={contract.id}
                className="rounded-3xl bg-white border border-slate-200/90 shadow-sm overflow-hidden"
              >
                {/* Contract Card Header */}
                <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-200 shadow-2xs">
                        {contract.contractCode}
                      </span>

                      {/* ID Verification Badge */}
                      {isPendingCard ? (
                        <button
                          onClick={() => setVerifyCardSub(contract.subcontractor)}
                          className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 hover:bg-amber-100 transition-colors"
                          title="คลิกเพื่อแนบรูปบัตรประชาชนช่าง"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          รอแนบรูปบัตร ปชช.
                        </button>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          ยืนยันตัวตนแล้ว
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                      {contract.subcontractor.name}
                      <Link
                        href={`/subcontractors/${contract.subcontractor.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-normal inline-flex items-center gap-0.5 ml-1"
                        title="ดูโปรไฟล์ 360° ของช่างคนนี้"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </h4>

                    <div className="text-xs text-slate-500 space-x-3">
                      <span>เลขประจำตัว 13 หลัก: <strong className="font-mono text-slate-700">{formatThaiIDCard(contract.subcontractor.idCard)}</strong></span>
                      <span>โทร: <strong className="text-slate-700">{contract.subcontractor.phone}</strong></span>
                      {contract.subcontractor.bankAccountNo && (
                        <span>
                          <strong className="text-blue-700">
                            {contract.subcontractor.bankName} {contract.subcontractor.bankAccountNo}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Snapshot for this Contract */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="text-right text-xs">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">ยอดรวมสัญญาช่างนี้</div>
                      <div className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(contract.netContractAmount)}
                      </div>
                    </div>

                    <div className="text-right text-xs border-l border-slate-200 pl-4">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">จ่ายแล้วสะสม</div>
                      <div className="font-mono font-extrabold text-emerald-700 text-sm">
                        {formatCurrency(contract.totalPaid)}
                      </div>
                    </div>

                    <div className="text-right text-xs border-l border-slate-200 pl-4">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">ยอดคงเหลือจ่ายได้</div>
                      <div className="font-mono font-extrabold text-amber-700 text-sm">
                        {formatCurrency(contract.remainingBalance)}
                      </div>
                    </div>

                    <button
                      onClick={() => setPaymentModalContract(contract)}
                      disabled={contract.remainingBalance <= 0}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                        contract.remainingBalance <= 0
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98]'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      จ่ายเงินงวดที่ {contract.payments.length + 1}
                    </button>
                  </div>
                </div>

                {/* Contract Items Breakdown Table - Nicely Proportioned */}
                <div className="p-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    รายการงานย่อยตามสัญญา ({contract.items.length} รายการ):
                  </h4>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-bold">
                          <th className="py-3 px-3 w-12 text-center whitespace-nowrap">#</th>
                          <th className="py-3 px-3.5 w-36 whitespace-nowrap">รหัสรายการ</th>
                          <th className="py-3 px-3.5">ชื่องานย่อย / รายละเอียด</th>
                          <th className="py-3 px-3.5 text-right w-24 whitespace-nowrap">ปริมาณ</th>
                          <th className="py-3 px-3.5 text-center w-20 whitespace-nowrap">หน่วย</th>
                          <th className="py-3 px-3.5 text-right w-28 whitespace-nowrap">ราคาต่อหน่วย</th>
                          <th className="py-3 px-3.5 text-right w-32 whitespace-nowrap">จำนวนเงิน (บาท)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {contract.items.map((item: any, iIdx: number) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 text-center text-slate-400 font-medium whitespace-nowrap">{iIdx + 1}</td>
                            <td className="py-3 px-3.5 font-mono font-bold text-purple-900 whitespace-nowrap">
                              {item.itemCode}
                            </td>
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-slate-900">{item.itemName}</div>
                              {item.notes && (
                                <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>
                              )}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                              {Number(item.quantity).toLocaleString()}
                            </td>
                            <td className="py-3 px-3.5 text-center text-slate-600 whitespace-nowrap">{item.unit}</td>
                            <td className="py-3 px-3.5 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                              {formatMoney(item.unitRate)}
                            </td>
                            <td className="py-3 px-3.5 text-right font-mono font-extrabold text-slate-900 whitespace-nowrap">
                              {formatMoney(item.totalAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Payments History Table */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                        ประวัติการจ่ายเงินค่างวด ({contract.payments.length} ครั้ง):
                      </h4>
                    </div>

                    {contract.payments.length === 0 ? (
                      <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center text-slate-500 text-xs">
                        ยังไม่มีการบันทึกจ่ายเงินงวดในสัญญานี้
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/90 text-slate-700 font-bold">
                              <th className="py-3 px-3 text-center w-20 whitespace-nowrap">งวดที่</th>
                              <th className="py-3 px-3.5 w-28 whitespace-nowrap">วันที่จ่าย</th>
                              <th className="py-3 px-3.5 text-right w-32 whitespace-nowrap">ยอดเงินก่อนหัก</th>
                              <th className="py-3 px-3.5 text-right w-32 whitespace-nowrap">หัก ณ ที่จ่าย (3%)</th>
                              <th className="py-3 px-3.5 text-right w-32 whitespace-nowrap">ยอดโอนสุทธิ</th>
                              <th className="py-3 px-3.5 w-36 whitespace-nowrap">เลขอ้างอิง / สลิป</th>
                              <th className="py-3 px-3.5 min-w-[140px]">หมายเหตุ</th>
                              <th className="py-3 px-3.5 text-center w-36 whitespace-nowrap">จัดการ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {contract.payments.map((p: any) => {
                              const hasEdits = Boolean(p.editHistory && p.editHistory !== '[]');

                              return (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="py-3 px-3 text-center whitespace-nowrap">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[11px] border border-blue-200">
                                        งวดที่ {p.installmentNo}
                                      </span>
                                      {hasEdits && (
                                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                                          <History className="w-2.5 h-2.5" /> แก้ไขแล้ว
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3 px-3.5 font-semibold text-slate-700 whitespace-nowrap">
                                    {formatThaiDate(p.paymentDate)}
                                  </td>
                                  <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                    {formatCurrency(p.amount)}
                                  </td>
                                  <td className="py-3 px-3.5 text-right font-mono font-semibold text-amber-700 whitespace-nowrap">
                                    - {formatCurrency(p.whtAmount)}
                                  </td>
                                  <td className="py-3 px-3.5 text-right font-mono font-extrabold text-emerald-700 whitespace-nowrap">
                                    {formatCurrency(p.netAmount)}
                                  </td>
                                  <td className="py-3 px-3.5 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                                    {p.refNo || '-'}
                                    {p.slipUrl && (
                                      <a
                                        href={p.slipUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 hover:underline block text-[10px] font-bold mt-0.5"
                                      >
                                        ดูสลิปโอนเงิน ↗
                                      </a>
                                    )}
                                  </td>
                                  <td className="py-3 px-3.5 text-slate-600 text-[11px]">
                                    {p.notes || '-'}
                                  </td>
                                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                      <button
                                        onClick={() => setEditingPayment({ payment: p, contract })}
                                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors shadow-2xs"
                                        title="แก้ไขประวัติการจ่ายเงินค่างวด (พร้อมบันทึก Audit History)"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>

                                      <button
                                        onClick={() => setActiveVoucher({ payment: p, contract })}
                                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold border border-slate-300 transition-colors flex items-center gap-1 shadow-2xs"
                                        title="พิมพ์ใบสำคัญจ่ายค่าแรง A4"
                                      >
                                        <Printer className="w-3 h-3" />
                                        ใบสำคัญจ่าย
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Schedule Modal */}
      {showScheduleAdd && (
        <AddScheduleModal
          initialJobId={job.id}
          onClose={() => setShowScheduleAdd(false)}
          onSuccess={() => {
            setShowScheduleAdd(false);
            fetchJobDetail();
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
            fetchJobDetail();
          }}
          onPayInstallment={(contract) => {
            setPaymentModalContract(contract);
          }}
        />
      )}

      {/* New Payment Modal */}
      {paymentModalContract && (
        <PaymentModal
          contract={paymentModalContract}
          jobTitle={job.title}
          onClose={() => setPaymentModalContract(null)}
          onSuccess={() => {
            setPaymentModalContract(null);
            fetchJobDetail();
          }}
        />
      )}

      {/* Edit Payment Modal with Audit Trail */}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment.payment}
          contract={editingPayment.contract}
          onClose={() => setEditingPayment(null)}
          onSuccess={() => {
            setEditingPayment(null);
            fetchJobDetail();
          }}
        />
      )}

      {/* ID Card Verification Modal */}
      {verifyCardSub && (
        <IDCardUploadModal
          subcontractor={verifyCardSub}
          onClose={() => setVerifyCardSub(null)}
          onSuccess={() => {
            setVerifyCardSub(null);
            fetchJobDetail();
          }}
        />
      )}

      {/* Printable Payment Voucher A4 Modal */}
      {activeVoucher && (
        <PaymentVoucherA4View
          payment={activeVoucher.payment}
          contract={activeVoucher.contract}
          job={job}
          onClose={() => setActiveVoucher(null)}
        />
      )}
    </div>
  );
}

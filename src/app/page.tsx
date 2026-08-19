'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  HardHat,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  FileText,
  BarChart3,
  Building2,
  ArrowRight,
  ShieldAlert,
  Layers,
  Sparkles,
  ChevronRight,
  DollarSign,
  Clock,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import { StatCard } from '@/components/StatCard';
import { PaymentModal } from '@/components/PaymentModal';
import { formatCurrency, formatThaiDate } from '@/lib/utils';

export default function DashboardPage() {
  const { selectedCompanyCode, isConsolidated, selectedCompany } = useCompany();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedContractForPayment, setSelectedContractForPayment] = useState<any | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const url =
        selectedCompanyCode === 'all'
          ? '/api/dashboard'
          : `/api/dashboard?companyCode=${selectedCompanyCode}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCompanyCode]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">กำลังโหลดข้อมูลระบบ...</p>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {
    totalJobs: 0,
    activeJobsCount: 0,
    completedJobsCount: 0,
    totalSubcontractors: 0,
    pendingIdVerificationCount: 0,
    totalQuotations: 0,
    draftQuotations: 0,
    netTotalContractValue: 0,
    totalPaidValue: 0,
    totalOutstandingBalance: 0,
    overallPaymentProgress: 0,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Greeting & Company Mode Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
              {isConsolidated ? '🏢 ดูภาพรวมทุกบริษัท (Consolidated)' : `🏢 ${selectedCompany?.nameTh || selectedCompanyCode}`}
            </span>
            {metrics.pendingIdVerificationCount > 0 && (
              <Link
                href="/subcontractors?idCardStatus=PENDING_ATTACHMENT"
                className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5 hover:bg-amber-100 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                มีช่างรอแนบรูปบัตร ปชช. ({metrics.pendingIdVerificationCount})
              </Link>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ภาพรวมงานติดตั้งและการจ่ายเงินช่าง
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal">
            ระบบคุมเบิกจ่ายช่างตามสัญญา &bull; รองรับ 1 ช่างหลายรายการย่อย &bull; นำเข้าข้อมูล Excel จัดกลุ่มอัตโนมัติ
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/sales-orders/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            + เปิด SO จองคิวงาน
          </Link>
          <Link
            href="/sales-orders"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            กระดาน SO & คิวงาน
          </Link>
          <Link
            href="/import-excel"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <FileSpreadsheet className="w-4 h-4" />
            นำเข้า Excel
          </Link>
          <Link
            href="/quotations/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-300 shadow-2xs transition-colors"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            ออกใบเสนอราคา
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="ยอดสัญญารวมสุทธิ"
          value={formatCurrency(metrics.netTotalContractValue)}
          subtitle={`ทั้งหมด ${metrics.totalJobs} งานติดตั้ง (${metrics.activeJobsCount} กำลังดำเนินงาน)`}
          icon={Briefcase}
          color="blue"
        />
        <StatCard
          title="ยอดจ่ายช่างสะสม"
          value={formatCurrency(metrics.totalPaidValue)}
          subtitle={`จ่ายแล้ว ${metrics.overallPaymentProgress}% ของยอดสัญญารวม`}
          icon={CreditCard}
          color="emerald"
        />
        <StatCard
          title="ยอดคงเหลือค้างจ่ายช่าง"
          value={formatCurrency(metrics.totalOutstandingBalance)}
          subtitle="ยอดที่ยังต้องเบิกจ่ายในงวดถัดไป"
          icon={DollarSign}
          color="amber"
        />
        <StatCard
          title="จำนวนช่างผู้รับเหมา"
          value={`${metrics.totalSubcontractors} คน`}
          subtitle={
            metrics.pendingIdVerificationCount > 0
              ? `รอแนบรูปบัตร ปชช. ${metrics.pendingIdVerificationCount} คน`
              : 'ยืนยันตัวตนครบถ้วน'
          }
          icon={HardHat}
          color={metrics.pendingIdVerificationCount > 0 ? 'rose' : 'indigo'}
        />
      </div>

      {/* Main Content Split: Pending Subcontractor Payments & Quick Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Outstanding Payables List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    สัญญาที่มียอดค้างจ่ายช่าง (Outstanding Payables)
                  </h2>
                  <p className="text-xs text-slate-500 font-normal">
                    คลิกบันทึกจ่ายเงินงวดถัดไปได้ทันที ระบบจะคุมยอดไม่ให้เกินยอดคงเหลือ
                  </p>
                </div>
              </div>
              <Link
                href="/jobs"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                ดูงานทั้งหมด <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Pending Payments Table / Cards */}
            {!data?.pendingPayments || data.pendingPayments.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto mb-2" />
                ไม่มียอดค้างจ่ายช่าง หรือจ่ายครบตามสัญญาทุกงานแล้ว
              </div>
            ) : (
              <div className="space-y-3">
                {data.pendingPayments.map((p: any) => (
                  <div
                    key={p.contractId}
                    className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-blue-700 shadow-2xs">
                          {p.contractCode}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {p.companyCode} &bull; {p.jobCode}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.jobTitle}</h4>
                      <div className="text-xs text-slate-600 flex items-center gap-2">
                        <span className="font-semibold text-slate-800">ช่าง: {p.subcontractor.name}</span>
                        {p.subcontractor.bankAccountNo && (
                          <span className="text-slate-500 text-[11px]">
                            ({p.subcontractor.bankName} {p.subcontractor.bankAccountNo})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                      <div className="text-left sm:text-right">
                        <div className="text-[11px] text-slate-500 font-medium">ยอดค้างจ่ายจริง</div>
                        <div className="text-sm font-extrabold text-amber-700 font-mono">
                          {formatCurrency(p.remainingBalance)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          จ่ายแล้ว {formatCurrency(p.totalPaid)} ({p.paidInstallmentsCount} งวด)
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setSelectedContractForPayment({
                            id: p.contractId,
                            contractCode: p.contractCode,
                            totalContractAmount: p.netContractAmount,
                            extraAmount: 0,
                            deductAmount: 0,
                            subcontractor: p.subcontractor,
                            payments: Array(p.paidInstallmentsCount).fill({
                              id: 'dummy',
                              installmentNo: p.paidInstallmentsCount,
                              amount: p.totalPaid,
                              status: 'PAID',
                            }),
                          })
                        }
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        จ่ายงวด {p.paidInstallmentsCount + 1}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Company Breakdown Table (If Consolidated) */}
          {isConsolidated && data?.companySummaries && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  สรุปยอดสัญญาและการเบิกจ่ายรายบริษัท
                </h3>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
                      <th className="py-2.5 px-3.5">รหัส</th>
                      <th className="py-2.5 px-3.5">ชื่อบริษัท</th>
                      <th className="py-2.5 px-3.5 text-center">งานทั้งหมด</th>
                      <th className="py-2.5 px-3.5 text-right">ยอดสัญญารวม</th>
                      <th className="py-2.5 px-3.5 text-right">จ่ายสะสม</th>
                      <th className="py-2.5 px-3.5 text-right">ยอดค้างจ่าย</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.companySummaries.map((c: any) => (
                      <tr key={c.companyId} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3.5 font-mono font-bold text-blue-700">{c.code}</td>
                        <td className="py-3 px-3.5 font-semibold text-slate-900">{c.nameTh}</td>
                        <td className="py-3 px-3.5 text-center text-slate-600">{c.jobsCount} งาน</td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(c.totalContractValue)}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(c.totalPaidValue)}
                        </td>
                        <td className="py-3 px-3.5 text-right font-mono font-extrabold text-amber-700">
                          {formatCurrency(c.outstandingBalance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 col): Price Benchmarking Snippet & Quick Links */}
        <div className="space-y-6">
          {/* Price Benchmark Snippet */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">เปรียบเทียบราคาค่าแรง</h3>
                  <p className="text-[11px] text-slate-500">ราคากลาง vs ช่างที่ราคาถูกที่สุด</p>
                </div>
              </div>
              <Link
                href="/price-benchmark"
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900"
              >
                ดูทั้งหมด →
              </Link>
            </div>

            <div className="space-y-2.5">
              {data?.itemBenchmarks?.map((it: any) => (
                <Link
                  key={it.id}
                  href={`/price-benchmark?itemCode=${it.code}`}
                  className="block p-3.5 rounded-2xl bg-slate-50/70 hover:bg-purple-50/40 border border-slate-200 hover:border-purple-300 transition-all space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-purple-700">{it.code}</span>
                    <span className="text-[11px] text-slate-500">หน่วย: {it.unit}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1">{it.name}</div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-[11px]">
                    <span className="text-slate-500">
                      เฉลี่ย: <strong className="text-slate-800 font-mono">{formatCurrency(it.avgRate)}</strong>
                    </span>
                    <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                      ต่ำสุด: {formatCurrency(it.minRate)}
                    </span>
                  </div>
                  {it.lowestSubcontractorName && (
                    <div className="text-[10px] text-slate-500 truncate">
                      ★ ช่างที่ถูกสุด: <span className="font-semibold text-slate-700">{it.lowestSubcontractorName}</span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Excel Template Card */}
          <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/60 border border-emerald-200/90 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Smart Excel Importer</h4>
                <p className="text-xs text-slate-500">นำเข้างาน + รวมสัญญาช่างอัตโนมัติ</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              รองรับ 1 ช่างหลายรายการในไฟล์เดียว ระบบจะจัดกลุ่มเป็น 1 งาน และ 1 สัญญาจ้างช่าง พร้อมออกรหัสงานให้อัตโนมัติ
            </p>
            <div className="pt-2 flex gap-2">
              <a
                href="/api/excel/template"
                download
                className="flex-1 text-center py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-300 shadow-2xs transition-colors"
              >
                ดาวน์โหลด Template
              </a>
              <Link
                href="/import-excel"
                className="flex-1 text-center py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-sm transition-colors"
              >
                เริ่มนำเข้าไฟล์
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedContractForPayment && (
        <PaymentModal
          contract={selectedContractForPayment}
          onClose={() => setSelectedContractForPayment(null)}
          onSuccess={() => {
            setSelectedContractForPayment(null);
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Building2,
  HardHat,
  ChevronRight,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  Trash2,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import { formatCurrency, formatThaiDate } from '@/lib/utils';

export default function JobsListPage() {
  const { selectedCompanyCode } = useCompany();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCompanyCode !== 'all') params.set('companyCode', selectedCompanyCode);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCompanyCode, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleDeleteJob = async (id: string, code: string) => {
    if (!confirm(`คุณต้องการลบงานติดตั้งรหัส "${code}" และสัญญาช่างทั้งหมดในงานนี้ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      fetchJobs();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบงาน');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-blue-600" />
            รายการงานติดตั้งทั้งหมด (Installation Jobs)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามความคืบหน้ารายงาน สัญญาจ้างช่างหลายคนต่อ 1 งาน และยอดเบิกจ่ายค้างชำระ
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] self-start"
        >
          <PlusCircle className="w-4 h-4" />
          เปิดงานติดตั้งใหม่
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัสงาน, ชื่องาน, สถานที่, ลูกค้า..."
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-bold"
          >
            ค้นหา
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="all">ทุกสถานะงาน</option>
            <option value="IN_PROGRESS">● กำลังดำเนินงาน (In Progress)</option>
            <option value="COMPLETED">✓ เสร็จสิ้น (Completed)</option>
            <option value="DRAFT">ร่าง (Draft)</option>
          </select>
        </div>
      </div>

      {/* Jobs List Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">กำลังโหลดรายการงาน...</div>
      ) : jobs.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">ไม่พบรายการงานติดตั้ง</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            คุณสามารถเปิดงานติดตั้งใหม่ หรือนำเข้าข้อมูลผ่านไฟล์ Excel ได้ทันที
          </p>
          <div className="pt-2">
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              เปิดงานใหม่
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-sm space-y-4"
            >
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                      {job.jobCode}
                    </span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {job.company.code} - {job.company.nameTh}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        job.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {job.status === 'COMPLETED' ? '✓ เสร็จสิ้น' : '● กำลังดำเนินงาน'}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                    <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeleteJob(job.id, job.jobCode)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    title="ลบงานติดตั้ง"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link
                    href={`/jobs/${job.id}`}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-300 shadow-2xs transition-colors"
                  >
                    ดูรายละเอียดงาน <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Subcontractor Contracts Cards under this Job */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                  <span>ช่างผู้รับเหมาในงานนี้ ({job.subContracts.length} สัญญา):</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {job.subContracts.map((sc: any) => (
                    <div
                      key={sc.id}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                            <HardHat className="w-4 h-4 text-amber-600" />
                            {sc.subcontractor.name}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            {sc.contractCode}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {sc.items.length} รายการย่อย &bull; {sc.subcontractor.phone}
                        </div>
                      </div>

                      {/* Financial progress for this contract */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-200">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-600">
                            ยอดสัญญา: <strong className="text-slate-900 font-mono font-bold">{formatCurrency(sc.netContractAmount)}</strong>
                          </span>
                          <span className="text-slate-600">
                            ค้างจ่าย: <strong className="text-amber-700 font-mono font-extrabold">{formatCurrency(sc.remainingBalance)}</strong>
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              sc.paymentProgress >= 100 ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${sc.paymentProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Financial Summary Footer */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-slate-600 flex-wrap">
                  {job.siteLocation && (
                    <span><strong>สถานที่:</strong> {job.siteLocation}</span>
                  )}
                  {job.customerName && (
                    <span><strong>ลูกค้า:</strong> {job.customerName}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">ยอดรวมทั้งโครงการ</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(job.financials?.netJobAmount || 0)}
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-4">
                    <span className="text-[10px] text-slate-400 block font-semibold">ยอดค้างจ่ายรวม</span>
                    <span className="font-mono font-extrabold text-amber-700 text-sm">
                      {formatCurrency(job.financials?.remainingBalance || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

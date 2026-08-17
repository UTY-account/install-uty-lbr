'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  HardHat,
  Building2,
  CheckCircle2,
  Printer,
  ChevronRight,
  Sparkles,
  Layers,
  CreditCard,
  User,
  Trash2,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import { formatCurrency, formatThaiDate, formatThaiIDCard } from '@/lib/utils';

export default function QuotationsListPage() {
  const { selectedCompanyCode } = useCompany();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCompanyCode !== 'all') params.set('companyCode', selectedCompanyCode);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/quotations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQuotations(data);
      }
    } catch (err) {
      console.error('Failed to load quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, [selectedCompanyCode, statusFilter]);

  const handleDeleteQuotation = async (id: string, no: string) => {
    if (!confirm(`คุณต้องการลบใบเสนอราคาเลขที่ "${no}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      fetchQuotations();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบใบเสนอราคา');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-blue-600" />
            ใบเสนอราคาแทนช่าง (Subcontractor Quotations)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ระบบออกเอกสารเสนอราคาในนามช่าง (ผู้เสนอราคา) ส่งให้บริษัท (ผู้ว่าจ้าง) พร้อมพิมพ์ A4 และแปลงเป็นงานติดตั้ง
          </p>
        </div>

        <Link
          href="/quotations/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] self-start"
        >
          <PlusCircle className="w-4 h-4" />
          ออกใบเสนอราคาใหม่
        </Link>
      </div>

      {/* Info Notice Box */}
      <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <HardHat className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>รูปแบบเอกสารแบบสลับด้าน (Inverted Layout):</strong> หัวเอกสารด้านบนคือ <strong>ช่าง/ผู้รับเหมา (พร้อมเลขบัตร ปชช. 13 หลัก)</strong> และผู้รับเอกสารคือ <strong>บริษัทของเรา</strong> เพื่อใช้ประกอบการเบิกจ่ายและเอกสารภาษี
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">รายการใบเสนอราคาทั้งหมด ({quotations.length} รายการ)</span>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="DRAFT">ร่าง (Draft)</option>
            <option value="ACCEPTED">อนุมัติแล้ว (Accepted)</option>
            <option value="CONVERTED">แปลงเป็นงานแล้ว (Converted to Job)</option>
          </select>
        </div>
      </div>

      {/* Quotations List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-medium">กำลังโหลดใบเสนอราคา...</div>
      ) : quotations.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">ไม่พบใบเสนอราคา</h3>
          <p className="text-xs text-slate-500">คลิกปุ่มด้านล่างเพื่อออกใบเสนอราคาแทนช่าง</p>
          <div className="pt-2">
            <Link
              href="/quotations/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              ออกใบเสนอราคา
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotations.map((qt) => (
            <div
              key={qt.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Top Row: No, Status & Delete */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                    {qt.quotationNo}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        qt.status === 'CONVERTED'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : qt.status === 'ACCEPTED'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {qt.status === 'CONVERTED'
                        ? '✓ แปลงเป็นงานแล้ว'
                        : qt.status === 'ACCEPTED'
                        ? '✓ อนุมัติแล้ว'
                        : '● ร่าง (Draft)'}
                    </span>

                    <button
                      onClick={() => handleDeleteQuotation(qt.id, qt.quotationNo)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="ลบใบเสนอราคา"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Project Title & Parties */}
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-900 hover:text-blue-600 transition-colors">
                    <Link href={`/quotations/${qt.id}`}>{qt.projectName}</Link>
                  </h3>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-500 font-medium">ช่างผู้เสนอราคา:</span>
                      <strong className="text-slate-900">{qt.subcontractor.name}</strong>
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 text-slate-700 font-semibold">
                        เลข ปชช: {formatThaiIDCard(qt.subcontractor.idCard)}
                      </span>
                    </div>
                    {qt.subcontractor.address && (
                      <div className="text-[11px] text-slate-500 truncate">
                        ที่อยู่: {qt.subcontractor.address}
                      </div>
                    )}
                    <div>
                      <span className="text-slate-500 font-medium">เสนอให้:</span>{' '}
                      <span className="text-blue-700 font-semibold">{qt.company.code} - {qt.company.nameTh}</span>
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    รายการงาน ({qt.items.length} รายการ):
                  </div>
                  {qt.items.slice(0, 2).map((it: any) => (
                    <div key={it.id} className="flex justify-between text-slate-700">
                      <span className="truncate max-w-[200px]">{it.itemName}</span>
                      <span className="font-mono text-slate-800 font-medium">
                        {it.quantity} {it.unit} @ {formatCurrency(it.unitRate)}
                      </span>
                    </div>
                  ))}
                  {qt.items.length > 2 && (
                    <span className="text-[10px] text-slate-400 block">+ อีก {qt.items.length - 2} รายการ</span>
                  )}
                </div>
              </div>

              {/* Financial Breakdown & Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block font-semibold">ยอดสุทธิ (หัก ณ ที่จ่าย 3%)</span>
                  <div className="text-base font-extrabold text-emerald-700 font-mono">
                    {formatCurrency(qt.grandTotal)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/quotations/${qt.id}`}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    ดูตัวอย่าง A4 / แปลงเป็นงาน
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

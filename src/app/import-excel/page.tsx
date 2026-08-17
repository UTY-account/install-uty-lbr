'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  HardHat,
  Briefcase,
  Building2,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatThaiIDCard } from '@/lib/utils';

export default function ImportExcelPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Preview Data returned from backend dry-run / parse
  const [previewData, setPreviewData] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewData(null);
      setErrorMsg(null);
      setSuccessResult(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setErrorMsg('กรุณาเลือกไฟล์ Excel (.xlsx หรือ .xls)');
      return;
    }

    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dryRun', 'true');

      const res = await fetch('/api/excel/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ประมวลผลไฟล์ Excel ไม่สำเร็จ');

      setPreviewData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประมวลผลไฟล์');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCommit = async () => {
    if (!file) return;

    setCommitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('dryRun', 'false');

      const res = await fetch('/api/excel/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'บันทึกข้อมูลไม่สำเร็จ');

      setSuccessResult(data);
      setPreviewData(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูลเข้าฐานข้อมูล');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            ระบบนำเข้าข้อมูลผ่าน Excel แบบจัดกลุ่มอัตโนมัติ (Smart Multi-Item Importer)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            รองรับช่างคนเดียวทำหลายรายการย่อยในไฟล์เดียว &bull; ระบบจะจัดกลุ่มเป็น 1 งาน และ 1 สัญญาจ้างช่างให้อัตโนมัติ
          </p>
        </div>

        <a
          href="/api/excel/template"
          download
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors self-start"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          ดาวน์โหลด Template Excel (.xlsx)
        </a>
      </div>

      {/* Concept Info Card */}
      <div className="p-5 rounded-3xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-2 shadow-2xs">
        <h4 className="font-extrabold text-sm flex items-center gap-2 text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          หลักการทำงานของระบบจัดกลุ่มอัตโนมัติ (Smart Auto-Grouping Engine)
        </h4>
        <ul className="list-disc list-inside space-y-1 text-emerald-900/80 leading-relaxed font-medium">
          <li>
            <strong>1 งานติดตั้ง (Job)</strong>: แถวที่มี <code>Company Code</code> และ <code>ชื่องาน/สถานที่ติดตั้ง</code> ตรงกัน จะถูกรวมเป็น 1 งานเดียว
          </li>
          <li>
            <strong>1 สัญญาจ้างช่าง (Sub Contract)</strong>: แถวที่มี <code>เลขบัตรประชาชนช่าง (13 หลัก)</code> เดียวกันในงานนั้น จะถูกรวมเป็น 1 สัญญาจ้าง
          </li>
          <li>
            <strong>รายการย่อย (Contract Items)</strong>: แต่ละแถวใน Excel จะกลายเป็นรายการย่อยในสัญญา รวมยอดเงินและบันทึกราคาต่อหน่วย
          </li>
          <li>
            <strong>Find-or-Create ช่าง</strong>: หากเป็นช่างใหม่ ระบบจะสร้างข้อมูลให้อัตโนมัติ และตั้งสถานะเป็น <code>รอแนบรูปบัตร ปชช.</code>
          </li>
        </ul>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Success Notification */}
      {successResult && (
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-emerald-900">นำเข้าข้อมูลสำเร็จเรียบร้อย!</h3>
              <p className="text-xs text-emerald-800">
                นำเข้าข้อมูลทั้งหมด {successResult.totalRows} แถว &bull; รวมเป็น {successResult.jobsCreated} งานติดตั้ง &bull; {successResult.contractsCreated} สัญญาจ้าง
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/jobs"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
            >
              ดูงานติดตั้งทั้งหมด
            </Link>
            <button
              onClick={() => {
                setSuccessResult(null);
                setFile(null);
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300"
            >
              นำเข้าไฟล์ใหม่
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Upload File */}
      {!successResult && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Upload className="w-4 h-4 text-blue-600" />
            ขั้นตอนที่ 1: เลือกไฟล์ Excel เพื่อวิเคราะห์และจัดกลุ่ม
          </h3>

          <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 space-y-3">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              id="excel-file-input"
              className="hidden"
            />
            <label
              htmlFor="excel-file-input"
              className="cursor-pointer flex flex-col items-center gap-2 text-slate-600 hover:text-slate-900"
            >
              <FileSpreadsheet className="w-12 h-12 text-emerald-600" />
              <span className="font-extrabold text-sm text-slate-800">
                {file ? file.name : 'คลิกเพื่อเลือกไฟล์ Excel หรือลากไฟล์มาวางที่นี่'}
              </span>
              <span className="text-xs text-slate-400">รองรับไฟล์ .xlsx และ .xls ตามรูปแบบ Template</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={handlePreview}
              disabled={!file || analyzing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
                !file || analyzing
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
              }`}
            >
              <Layers className="w-4 h-4" />
              {analyzing ? 'กำลังวิเคราะห์และจัดกลุ่ม...' : 'วิเคราะห์และแสดงตัวอย่าง (Preview Grouping)'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Auto-Grouping Preview */}
      {previewData && (
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ขั้นตอนที่ 2: ตรวจสอบผลการจัดกลุ่ม ({previewData.groupedJobs.length} งานติดตั้ง &bull; {previewData.totalRows} รายการ)
              </h3>
              <p className="text-xs text-slate-500">
                ตรวจสอบความถูกต้องก่อนกดบันทึกเข้าสู่ฐานข้อมูลจริง
              </p>
            </div>

            <button
              onClick={handleCommit}
              disabled={committing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              {committing ? 'กำลังบันทึกลงฐานข้อมูล...' : 'ยืนยันและนำเข้าสู่ฐานข้อมูล (Import Now)'}
            </button>
          </div>

          {/* Grouped Jobs List */}
          <div className="space-y-4">
            {previewData.groupedJobs.map((job: any, jIdx: number) => (
              <div
                key={jIdx}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 shadow-2xs"
              >
                {/* Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700 bg-white px-2.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                        {job.companyCode}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {job.contracts.length} สัญญาช่าง &bull; {job.totalItemsCount} รายการย่อย
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">{job.jobTitle}</h4>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 block font-semibold">ยอดรวมงานนี้</span>
                    <span className="font-mono font-extrabold text-base text-emerald-700">
                      {formatCurrency(job.totalJobAmount)}
                    </span>
                  </div>
                </div>

                {/* Subcontractor Contracts under this Job */}
                <div className="space-y-3">
                  {job.contracts.map((sc: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <HardHat className="w-4 h-4 text-amber-600" />
                          <span className="font-bold text-xs text-slate-900">
                            {sc.subcontractorName}
                          </span>
                          <span className="font-mono text-xs text-slate-500 font-semibold">
                            ({formatThaiIDCard(sc.subcontractorIdCard)})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                            รอแนบรูปบัตร ปชช.
                          </span>
                        </div>

                        <span className="font-mono font-bold text-xs text-slate-900">
                          รวมสัญญาช่างคนนี้: {formatCurrency(sc.totalAmount)}
                        </span>
                      </div>

                      {/* Items Table */}
                      <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                              <th className="py-1.5 px-2.5 w-10 text-center">#</th>
                              <th className="py-1.5 px-2.5 w-36">รหัสรายการ</th>
                              <th className="py-1.5 px-2.5">ชื่องาน</th>
                              <th className="py-1.5 px-2.5 text-right w-20">ปริมาณ</th>
                              <th className="py-1.5 px-2.5 text-center w-16">หน่วย</th>
                              <th className="py-1.5 px-2.5 text-right w-24">ราคา/หน่วย</th>
                              <th className="py-1.5 px-2.5 text-right w-28">รวม (บาท)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {sc.items.map((it: any, iIdx: number) => (
                              <tr key={iIdx} className="hover:bg-slate-50">
                                <td className="py-1.5 px-2.5 text-center text-slate-400 font-medium">{iIdx + 1}</td>
                                <td className="py-1.5 px-2.5 font-mono font-bold text-purple-700">{it.itemCode}</td>
                                <td className="py-1.5 px-2.5 font-medium text-slate-900">{it.itemName}</td>
                                <td className="py-1.5 px-2.5 text-right font-mono font-semibold text-slate-800">{it.quantity}</td>
                                <td className="py-1.5 px-2.5 text-center text-slate-600">{it.unit}</td>
                                <td className="py-1.5 px-2.5 text-right font-mono font-semibold text-slate-800">
                                  {formatCurrency(it.unitRate).replace('฿', '')}
                                </td>
                                <td className="py-1.5 px-2.5 text-right font-mono font-extrabold text-slate-900">
                                  {formatCurrency(it.totalAmount).replace('฿', '')}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Commit Action */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setPreviewData(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              onClick={handleCommit}
              disabled={committing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              {committing ? 'กำลังบันทึกลงฐานข้อมูล...' : 'ยืนยันและนำเข้าสู่ฐานข้อมูล'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

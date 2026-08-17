'use client';

import React, { useState } from 'react';
import {
  Printer,
  CheckCircle,
  FileText,
  Building2,
  UserCheck,
  Upload,
  Camera,
  ShieldCheck,
  ShieldAlert,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { formatCurrency, formatMoney, formatThaiDate, formatThaiIDCard, thaiBahtText } from '@/lib/utils';
import { IDCardUploadModal } from '@/components/IDCardUploadModal';

interface QuotationA4ViewProps {
  quotation: {
    id: string;
    quotationNo: string;
    quotationDate: string | Date;
    validUntil?: string | Date | null;
    projectName: string;
    subtotal: number;
    whtRate: number;
    whtAmount: number;
    grandTotal: number;
    status: string;
    notes?: string | null;
    company: {
      id: string;
      code: string;
      nameTh: string;
      taxId: string;
      phone?: string | null;
      email?: string | null;
      address: string;
    };
    subcontractor: {
      id: string;
      name: string;
      idCard: string;
      phone: string;
      idCardPhotoUrl?: string | null;
      idCardStatus?: string;
      bankName?: string | null;
      bankAccountNo?: string | null;
      bankAccountName?: string | null;
      address?: string | null;
    };
    items: Array<{
      id: string;
      itemCode: string;
      itemName: string;
      quantity: number;
      unit: string;
      unitRate: number;
      totalAmount: number;
      notes?: string | null;
    }>;
  };
  onConvert?: () => void;
  converting?: boolean;
  onRefresh?: () => void;
}

export function QuotationA4View({
  quotation,
  onConvert,
  converting,
  onRefresh,
}: QuotationA4ViewProps) {
  const [showIdCardOnPrint, setShowIdCardOnPrint] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const hasPhoto = Boolean(quotation.subcontractor.idCardPhotoUrl);

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-sm text-slate-900">ใบเสนอราคาแทนช่าง (Subcontractor Quotation)</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                {quotation.quotationNo}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ผู้เสนอราคา: <strong>{quotation.subcontractor.name}</strong> ({formatThaiIDCard(quotation.subcontractor.idCard)})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle ID card photo in document */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={showIdCardOnPrint}
              onChange={(e) => setShowIdCardOnPrint(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
            />
            <span>แสดงรูปบัตร ปชช. ในใบเสนอราคา</span>
          </label>

          {/* Upload / Change ID Card Photo */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors"
          >
            <Camera className="w-4 h-4 text-blue-600" />
            {hasPhoto ? 'เปลี่ยนรูปบัตร ปชช.' : 'แนบรูปบัตร ปชช.'}
          </button>

          {quotation.status !== 'CONVERTED' && onConvert && (
            <button
              onClick={onConvert}
              disabled={converting}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
            >
              <CheckCircle className="w-4 h-4" />
              {converting ? 'กำลังแปลงเป็นงาน...' : 'แปลงเป็นงานติดตั้ง & สัญญาจ้าง'}
            </button>
          )}

          {quotation.status === 'CONVERTED' && (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              แปลงเป็นงานติดตั้งแล้ว
            </span>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Printer className="w-4 h-4" />
            พิมพ์เอกสาร / บันทึก PDF (A4)
          </button>
        </div>
      </div>

      {/* A4 Paper Container - Expanded Width, Multi-Page Ready, Prominent Title */}
      <div className="a4-print-sheet mx-auto max-w-[210mm] bg-white text-slate-900 shadow-md rounded-2xl p-6 sm:p-10 print:shadow-none print:rounded-none print:p-0 print:m-0 print:max-w-none text-[12px] leading-normal border border-slate-200 print:border-none w-full">
        {/* Document Title Header with Top Spacing & 50% Enlarged Title */}
        <div className="text-center pt-2 sm:pt-4 pb-4 mb-4 border-b-2 border-slate-900">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-normal leading-tight">
            ใบเสนอราคา / ค่าจ้างแรงงาน
          </h1>
          <p className="text-xs font-bold text-slate-600 tracking-widest uppercase mt-1">
            SUB-CONTRACTOR QUOTATION / LABOUR WORK
          </p>
        </div>

        {/* INVERTED HEADER:
            Header Left: Subcontractor details with cleanly aligned labels
            Header Right: Quotation Metadata with cleanly aligned labels
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-b-2 border-slate-900 print-avoid-break">
          {/* Vendor: Subcontractor (Left Box) */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-300 text-[11.5px] space-y-2">
            <div className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-700" />
              ผู้เสนอราคา (Subcontractor / ผู้รับจ้าง)
            </div>
            <div className="space-y-1.5 text-slate-800">
              <div className="grid grid-cols-[105px_1fr] gap-1.5">
                <span className="text-slate-500 font-medium">ชื่อ-นามสกุล:</span>
                <span className="font-extrabold text-slate-900 text-sm">{quotation.subcontractor.name}</span>
              </div>
              <div className="grid grid-cols-[105px_1fr] gap-1.5 items-center">
                <span className="text-slate-500 font-medium">เลขประจำตัว ปชช.:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 text-xs w-fit">
                  {formatThaiIDCard(quotation.subcontractor.idCard)}
                </span>
              </div>
              <div className="grid grid-cols-[105px_1fr] gap-1.5">
                <span className="text-slate-500 font-medium">เบอร์โทรศัพท์:</span>
                <span className="font-semibold text-slate-900">{quotation.subcontractor.phone}</span>
              </div>
              {quotation.subcontractor.bankAccountNo && (
                <div className="grid grid-cols-[105px_1fr] gap-1.5">
                  <span className="text-slate-500 font-medium">บัญชีรับเงิน:</span>
                  <span className="font-semibold text-blue-950">
                    {quotation.subcontractor.bankName} {quotation.subcontractor.bankAccountNo} ({quotation.subcontractor.bankAccountName || quotation.subcontractor.name})
                  </span>
                </div>
              )}
              {quotation.subcontractor.address && (
                <div className="grid grid-cols-[105px_1fr] gap-1.5">
                  <span className="text-slate-500 font-medium">ที่อยู่:</span>
                  <span className="text-slate-700">{quotation.subcontractor.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quotation Metadata Box (Right Box) */}
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-300 text-[11.5px] space-y-2">
            <div className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider pb-1.5 border-b border-slate-200 flex items-center justify-between">
              <span>ข้อมูลเอกสาร (Quotation Details)</span>
              <span className="font-mono font-bold text-blue-700 text-xs">{quotation.quotationNo}</span>
            </div>
            <div className="space-y-1.5 text-slate-800 pt-0.5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">เลขที่เอกสาร:</span>
                <span className="font-mono font-bold text-slate-900">{quotation.quotationNo}</span>
              </div>
              {quotation.quotationNo.includes('-QT-SO') && (
                <div className="flex justify-between text-blue-900 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200 text-[11px] font-bold">
                  <span>เลขอ้างอิง SO:</span>
                  <span className="font-mono">{quotation.quotationNo.split('-QT-')[1]}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">วันที่ออกเอกสาร:</span>
                <span className="font-semibold text-slate-900">{formatThaiDate(quotation.quotationDate)}</span>
              </div>
              {quotation.validUntil && (
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">กำหนดยืนราคาถึง:</span>
                  <span className="font-semibold text-slate-900">{formatThaiDate(quotation.validUntil)}</span>
                </div>
              )}
              <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center">
                <span className="text-slate-500 font-medium">สถานะเอกสาร:</span>
                <span className="font-bold text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {quotation.status === 'CONVERTED' ? 'แปลงเป็นงานติดตั้งแล้ว' : quotation.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Receiver Block: Our Company (Client Box) */}
        <div className="my-3 p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 text-[11.5px] print-avoid-break space-y-1.5">
          <div className="text-[11px] font-extrabold text-blue-900 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-blue-200">
            <Building2 className="w-4 h-4 text-blue-700" />
            ผู้รับใบเสนอราคา (Client / ผู้ว่าจ้าง)
          </div>
          <div className="grid grid-cols-[130px_1fr] gap-1.5 text-slate-800 pt-0.5">
            <span className="text-slate-500 font-medium">ชื่อบริษัทผู้ว่าจ้าง:</span>
            <span className="font-bold text-slate-900 text-sm">{quotation.company.nameTh}</span>

            <span className="text-slate-500 font-medium">เลขประจำตัวผู้เสียภาษี:</span>
            <span className="font-mono font-bold text-slate-900">{formatThaiIDCard(quotation.company.taxId)}</span>

            <span className="text-slate-500 font-medium">ที่อยู่สำนักงาน:</span>
            <span className="text-slate-700">{quotation.company.address}</span>

            <span className="text-slate-500 font-medium">โครงการ / สถานที่:</span>
            <span className="font-bold text-blue-950">{quotation.projectName}</span>
          </div>
        </div>

        {/* Itemized Table - With Guaranteed Commas on All Monetary Figures */}
        <div className="mb-4">
          <table className="w-full text-left border-collapse text-[11.5px]">
            <thead>
              <tr className="border-y-2 border-slate-900 bg-slate-100 text-slate-900 font-bold">
                <th className="py-2 px-2.5 text-center w-10 whitespace-nowrap">ลำดับ</th>
                <th className="py-2 px-2.5 w-36 whitespace-nowrap">รหัสรายการ</th>
                <th className="py-2 px-2.5">รายละเอียดงานติดตั้ง</th>
                <th className="py-2 px-2.5 text-right w-16 whitespace-nowrap">จำนวน</th>
                <th className="py-2 px-2.5 text-center w-14 whitespace-nowrap">หน่วย</th>
                <th className="py-2 px-2.5 text-right w-24 whitespace-nowrap">ราคา/หน่วย</th>
                <th className="py-2 px-2.5 text-right w-28 whitespace-nowrap">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {quotation.items.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50">
                  <td className="py-2 px-2.5 text-center text-slate-500 font-medium whitespace-nowrap">{idx + 1}</td>
                  <td className="py-2 px-2.5 font-mono font-bold text-purple-900 text-[10px] sm:text-[10.5px] whitespace-nowrap tracking-tight">
                    {item.itemCode}
                  </td>
                  <td className="py-2 px-2.5">
                    <div className="font-semibold text-slate-900 leading-snug">{item.itemName}</div>
                    {item.notes && <div className="text-[10px] text-slate-500 italic mt-0.5">{item.notes}</div>}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {Number(item.quantity).toLocaleString('en-US')}
                  </td>
                  <td className="py-2 px-2.5 text-center text-slate-600 whitespace-nowrap">{item.unit}</td>
                  <td className="py-2 px-2.5 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {formatMoney(item.unitRate)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                    {formatMoney(item.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BOTTOM SECTION: Calculations, ID Card Photo, & Signatures
            Wrapped in print-avoid-break so it never slices across multi-page breaks */}
        <div className="print-avoid-break break-inside-avoid space-y-4">
          {/* Summary & Calculations with Guaranteed Comma Formatting */}
          <div className="grid grid-cols-2 gap-4 py-2 border-t-2 border-slate-900 text-[11.5px]">
            {/* Thai Baht Text & Remarks */}
            <div className="space-y-1.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 block">จำนวนเงินสุทธิเป็นตัวอักษร:</span>
                <span className="text-xs font-bold text-slate-900">{thaiBahtText(quotation.grandTotal)}</span>
              </div>
              {quotation.notes && (
                <div className="text-[10.5px] text-slate-600 p-1">
                  <strong>หมายเหตุ:</strong> {quotation.notes}
                </div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5">
              <div className="flex justify-between py-0.5 border-b border-slate-200">
                <span className="text-slate-600 font-medium">รวมยอดเงินค่าจ้าง (Subtotal):</span>
                <span className="font-mono font-bold text-slate-900">{formatMoney(quotation.subtotal)} บาท</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-200 text-slate-700">
                <span>หัก ภาษี ณ ที่จ่าย ({quotation.whtRate}%):</span>
                <span className="font-mono font-semibold text-amber-700">- {formatMoney(quotation.whtAmount)} บาท</span>
              </div>
              <div className="flex justify-between py-1.5 border-b-2 border-slate-900 font-extrabold text-slate-900 text-xs">
                <span>ยอดเงินสุทธิที่ต้องจ่าย (Net):</span>
                <span className="font-mono text-base text-blue-700">{formatMoney(quotation.grandTotal)} บาท</span>
              </div>
            </div>
          </div>

          {/* ATTACHED ID CARD PHOTO SECTION (PROMINENTLY DISPLAYED IN PRINT & DOCUMENT) */}
          {showIdCardOnPrint && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 print-avoid-break">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-[11.5px] font-bold text-slate-900">
                    สำเนาภาพถ่ายบัตรประจำตัวประชาชนผู้รับจ้าง (Copy of ID Card)
                  </span>
                </div>
                <span className="text-[10.5px] font-mono text-slate-600 font-bold">
                  {formatThaiIDCard(quotation.subcontractor.idCard)}
                </span>
              </div>

              {hasPhoto ? (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* ID Card Image Preview */}
                  <div className="relative border-2 border-slate-300 rounded-lg overflow-hidden bg-white p-1 shadow-2xs">
                    <img
                      src={quotation.subcontractor.idCardPhotoUrl!}
                      alt="สำเนาบัตรประชาชน"
                      className="max-h-36 max-w-[240px] sm:max-w-[280px] object-cover rounded"
                    />
                    {/* Certified True Copy Watermark Stamp */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[11px] font-extrabold text-blue-800/60 uppercase border-2 border-blue-800/50 px-2 py-0.5 rotate-[-12deg] bg-white/40 backdrop-blur-2xs">
                        สำเนาถูกต้อง สำหรับเสนอราคางาน
                      </span>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-slate-600 space-y-1 text-left">
                    <div className="font-bold text-slate-800 text-xs">
                      ชื่อผู้ถือบัตร: {quotation.subcontractor.name}
                    </div>
                    <div>
                      เลขประจำตัว 13 หลัก: <strong className="font-mono">{formatThaiIDCard(quotation.subcontractor.idCard)}</strong>
                    </div>
                    <div className="text-slate-500">
                      เอกสารประกอบการเสนอราคาค่าจ้างแรงงานและหักภาษี ณ ที่จ่าย 3%
                    </div>
                    <div className="pt-1.5">
                      <button
                        type="button"
                        onClick={() => setShowUploadModal(true)}
                        className="no-print text-blue-600 hover:underline font-bold text-[10.5px]"
                      >
                        [ คลิกเพื่อเปลี่ยนรูปบัตร ]
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setShowUploadModal(true)}
                  className="no-print p-4 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-lg text-center cursor-pointer transition-colors bg-white"
                >
                  <Camera className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-blue-600 block">
                    คลิกเพื่อแนบรูปถ่ายบัตรประชาชนของช่างคนนี้
                  </span>
                  <span className="text-[10px] text-slate-400">
                    เพื่อให้แสดงรูปถ่ายบัตร ปชช. ในใบเสนอราคาตอนพิมพ์
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Signature Blocks */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 text-center text-[11.5px] print-avoid-break">
            <div className="space-y-6">
              <p className="font-bold text-slate-800">
                ลงชื่อ ..............................................................<br />
                ({quotation.subcontractor.name})<br />
                <span className="text-slate-500 font-normal">ช่างผู้เสนอราคา / ผู้รับจ้าง</span>
              </p>
              <p className="text-[10px] text-slate-400">วันที่ .......... / .......... / ................</p>
            </div>
            <div className="space-y-6">
              <p className="font-bold text-slate-800">
                ลงชื่อ ..............................................................<br />
                (..............................................................)<br />
                <span className="text-slate-500 font-normal">ผู้ว่าจ้าง / {quotation.company.nameTh}</span>
              </p>
              <p className="text-[10px] text-slate-400">วันที่ .......... / .......... / ................</p>
            </div>
          </div>
        </div>
      </div>

      {/* ID Card Upload / Attachment Modal */}
      {showUploadModal && (
        <IDCardUploadModal
          subcontractor={{
            id: quotation.subcontractor.id,
            name: quotation.subcontractor.name,
            idCard: quotation.subcontractor.idCard,
            idCardPhotoUrl: quotation.subcontractor.idCardPhotoUrl,
            idCardStatus: quotation.subcontractor.idCardStatus || 'PENDING_ATTACHMENT',
          }}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}

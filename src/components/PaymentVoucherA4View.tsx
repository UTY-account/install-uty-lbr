'use client';

import React from 'react';
import { Printer, X, Receipt, CheckCircle, Building2, UserCheck } from 'lucide-react';
import { formatCurrency, formatMoney, formatThaiDate, formatThaiIDCard, thaiBahtText } from '@/lib/utils';

interface PaymentVoucherA4ViewProps {
  payment: {
    id: string;
    installmentNo: number;
    paymentDate: string | Date;
    amount: number;
    whtRate: number;
    whtAmount: number;
    netAmount: number;
    refNo?: string | null;
    slipUrl?: string | null;
    notes?: string | null;
  };
  contract: {
    contractCode: string;
    totalContractAmount: number;
    extraAmount: number;
    deductAmount: number;
    subcontractor: {
      id: string;
      name: string;
      idCard: string;
      phone: string;
      bankName?: string | null;
      bankAccountNo?: string | null;
      bankAccountName?: string | null;
      address?: string | null;
    };
  };
  job: {
    jobCode: string;
    title: string;
    company: {
      code: string;
      nameTh: string;
      taxId: string;
      address: string;
      phone?: string | null;
    };
  };
  onClose: () => void;
}

export function PaymentVoucherA4View({ payment, contract, job, onClose }: PaymentVoucherA4ViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const netContract = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:my-0 print:max-w-none print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">ใบสำคัญจ่ายค่าแรงช่าง (Payment Voucher)</h3>
              <p className="text-xs text-slate-500 font-mono">
                งวดที่ {payment.installmentNo} &bull; สัญญา {contract.contractCode}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              พิมพ์ใบสำคัญจ่าย (A4)
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable A4 Voucher Content */}
        <div className="a4-print-sheet p-6 sm:p-8 bg-white text-slate-900 leading-normal text-[11px]">
          {/* Header Company */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
            <div className="space-y-0.5">
              <h1 className="text-lg font-extrabold text-slate-900">{job.company.nameTh}</h1>
              <p className="text-slate-600 text-[10px]">{job.company.address}</p>
              <p className="text-slate-600 text-[10px]">
                <strong>เลขประจำตัวผู้เสียภาษี:</strong> {job.company.taxId} | <strong>โทรศัพท์:</strong> {job.company.phone || '-'}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 bg-slate-900 text-white font-extrabold text-xs rounded tracking-wide">
                ใบสำคัญจ่ายค่าแรง (PAYMENT VOUCHER)
              </span>
              <div className="mt-1.5 text-[10px] text-slate-600">
                <strong>งวดที่:</strong> {payment.installmentNo} | <strong>วันที่จ่าย:</strong> {formatThaiDate(payment.paymentDate)}
              </div>
              <div className="text-[10px] text-slate-600 font-mono">
                <strong>อ้างอิงสัญญา:</strong> {contract.contractCode}
              </div>
            </div>
          </div>

          {/* Payee Info & Job Site */}
          <div className="grid grid-cols-2 gap-3 my-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                ผู้รับเงิน (Payee / Subcontractor):
              </span>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{contract.subcontractor.name}</div>
              <div className="text-[10px] text-slate-700 mt-0.5">
                <strong>เลขประจำตัวประชาชน 13 หลัก:</strong> {formatThaiIDCard(contract.subcontractor.idCard)}
              </div>
              <div className="text-[10px] text-slate-700">
                <strong>โทร:</strong> {contract.subcontractor.phone}
              </div>
              {contract.subcontractor.bankAccountNo && (
                <div className="text-[10px] text-blue-900 font-semibold mt-0.5">
                  <strong>โอนเข้าบัญชี:</strong> {contract.subcontractor.bankName} {contract.subcontractor.bankAccountNo} ({contract.subcontractor.bankAccountName || contract.subcontractor.name})
                </div>
              )}
            </div>

            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                ข้อมูลงานติดตั้ง (Installation Project):
              </span>
              <div className="text-xs font-bold text-slate-900 mt-0.5">{job.title}</div>
              <div className="text-[10px] text-slate-700 mt-0.5">
                <strong>รหัสงาน:</strong> {job.jobCode}
              </div>
              <div className="text-[10px] text-slate-700">
                <strong>ยอดรวมตามสัญญา:</strong> {formatMoney(netContract)} บาท
              </div>
              {payment.refNo && (
                <div className="text-[10px] text-slate-700 mt-0.5 font-mono">
                  <strong>เลขอ้างอิงโอน:</strong> {payment.refNo}
                </div>
              )}
            </div>
          </div>

          {/* Payment Breakdown Table with Guaranteed Comma Formatting */}
          <table className="w-full border-collapse my-3 text-[11px]">
            <thead>
              <tr className="border-y-2 border-slate-900 bg-slate-100 text-slate-900 font-bold">
                <th className="py-2 px-2.5 text-left">รายการเบิกจ่าย</th>
                <th className="py-2 px-2.5 text-right w-36">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="py-2.5 px-2.5">
                  <div className="font-bold text-slate-900">
                    ค่าจ้างติดตั้ง งวดที่ {payment.installmentNo}
                  </div>
                  {payment.notes && (
                    <div className="text-[10px] text-slate-500 mt-0.5 italic">{payment.notes}</div>
                  )}
                </td>
                <td className="py-2.5 px-2.5 text-right font-mono font-bold text-slate-900">
                  {formatMoney(payment.amount)}
                </td>
              </tr>
              <tr className="bg-slate-50">
                <td className="py-2 px-2.5 text-slate-600">
                  หัก ภาษีเงินได้ ณ ที่จ่าย ({payment.whtRate}%) ตามมาตรา 3 เตรส
                </td>
                <td className="py-2 px-2.5 text-right font-mono font-semibold text-amber-700">
                  - {formatMoney(payment.whtAmount)}
                </td>
              </tr>
              <tr className="border-t-2 border-slate-900 bg-slate-100 font-extrabold text-xs">
                <td className="py-2 px-2.5 text-slate-900">ยอดเงินจ่ายสุทธิ (Net Paid Amount):</td>
                <td className="py-2 px-2.5 text-right font-mono text-sm text-emerald-700">
                  {formatMoney(payment.netAmount)} บาท
                </td>
              </tr>
            </tbody>
          </table>

          {/* Thai Baht text */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 my-3 text-[11px]">
            <span className="text-[10px] font-semibold text-slate-500 block">จำนวนเงินจ่ายสุทธิเป็นตัวอักษร:</span>
            <span className="text-xs font-bold text-slate-900">{thaiBahtText(payment.netAmount)}</span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-6 mt-4 border-t border-slate-200 text-center text-[10px]">
            <div className="space-y-6">
              <p className="font-bold text-slate-800">
                ลงชื่อ ..............................................................<br />
                (..............................................................)<br />
                <span className="text-slate-500 font-normal">ผู้จัดทำเอกสาร</span>
              </p>
            </div>
            <div className="space-y-6">
              <p className="font-bold text-slate-800">
                ลงชื่อ ..............................................................<br />
                (..............................................................)<br />
                <span className="text-slate-500 font-normal">ผู้อนุมัติจ่าย / กรรมการ</span>
              </p>
            </div>
            <div className="space-y-6">
              <p className="font-bold text-slate-800">
                ลงชื่อ ..............................................................<br />
                ({contract.subcontractor.name})<br />
                <span className="text-slate-500 font-normal">ผู้รับเงิน / ช่างผู้รับเหมา</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

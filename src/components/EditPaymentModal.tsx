'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  FileCheck,
  Calendar,
  History,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { formatCurrency, formatMoney, formatThaiDate, formatISODate } from '@/lib/utils';

interface EditPaymentModalProps {
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
    editHistory?: string | null;
  };
  contract: {
    id: string;
    contractCode: string;
    totalContractAmount: number;
    extraAmount: number;
    deductAmount: number;
    subcontractor: {
      id: string;
      name: string;
      idCard: string;
      bankName?: string | null;
      bankAccountNo?: string | null;
      bankAccountName?: string | null;
    };
    payments: Array<{
      id: string;
      installmentNo: number;
      amount: number;
      status: string;
    }>;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function EditPaymentModal({ payment, contract, onClose, onSuccess }: EditPaymentModalProps) {
  const netContractAmount = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
  const otherPaidTotal = contract.payments
    .filter((p) => p.id !== payment.id && p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const maxAllowedForThisPayment = Math.max(0, netContractAmount - otherPaidTotal);

  // Helper to format string with commas dynamically while preserving decimals
  const formatInputWithCommas = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, '');
    if (!clean) return '';
    const parts = clean.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      return `${integerPart}.${parts.slice(1).join('')}`;
    }
    return integerPart;
  };

  const [displayAmount, setDisplayAmount] = useState<string>(formatMoney(payment.amount));
  const [whtRate, setWhtRate] = useState<number>(payment.whtRate || 3.0);
  const [paymentDate, setPaymentDate] = useState<string>(formatISODate(payment.paymentDate));
  const [refNo, setRefNo] = useState<string>(payment.refNo || '');
  const [slipUrl, setSlipUrl] = useState<string>(payment.slipUrl || '');
  const [notes, setNotes] = useState<string>(payment.notes || '');
  const [editReason, setEditReason] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse numeric amount
  const amount = parseFloat(displayAmount.replace(/,/g, '')) || 0;
  const isOverpayment = amount > maxAllowedForThisPayment + 0.001;
  const isZeroOrNegative = amount <= 0;
  const isInvalid = isOverpayment || isZeroOrNegative;

  const whtAmount = Math.round((amount * (whtRate / 100)) * 100) / 100;
  const netTransferAmount = Math.round((amount - whtAmount) * 100) / 100;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputWithCommas(e.target.value);
    setDisplayAmount(formatted);
  };

  let auditHistory: any[] = [];
  if (payment.editHistory) {
    try {
      auditHistory = JSON.parse(payment.editHistory);
    } catch (e) {
      auditHistory = [];
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;

    if (!editReason.trim()) {
      setErrorMsg('กรุณาระบุเหตุผลในการแก้ไขข้อมูล');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          whtRate,
          paymentDate,
          refNo: refNo.trim() || undefined,
          slipUrl: slipUrl.trim() || undefined,
          notes: notes.trim() || undefined,
          editReason: editReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'แก้ไขการจ่ายเงินไม่สำเร็จ');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกการแก้ไข');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`คุณต้องการลบรายการจ่ายเงิน "งวดที่ ${payment.installmentNo}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/payments/${payment.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      onSuccess();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบรายการจ่ายเงิน');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                แก้ไขประวัติการจ่ายเงินค่างวด
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  งวดที่ {payment.installmentNo}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">สัญญา: {contract.contractCode}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subcontractor Header info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">ช่างผู้รับเงิน:</span>
              <strong className="text-slate-900 font-bold">{contract.subcontractor.name}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">ยอดสัญญาคงเหลือที่จ่ายได้สูงสุดสำหรับงวดนี้:</span>
              <span className="font-mono font-bold text-blue-700">{formatCurrency(maxAllowedForThisPayment)}</span>
            </div>
          </div>

          {/* Overpayment Warning */}
          {isOverpayment && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">ยอดเงินเกินกำหนด</strong>
                ยอดเงินที่แก้ไขเกินยอดคงเหลือสัญญา คุณสามารถจ่ายได้สูงสุด {formatCurrency(maxAllowedForThisPayment)}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            {/* Amount Field with Realtime Commas */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ยอดเงินที่จ่ายงวดนี้ (บาท) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="decimal"
                  value={displayAmount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className={`w-full px-4 py-2.5 rounded-xl border text-lg font-bold font-mono transition-all focus:outline-none focus:ring-2 ${
                    isOverpayment
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-400'
                      : 'border-slate-300 bg-white text-slate-900 focus:ring-blue-500'
                  }`}
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  บาท
                </span>
              </div>
            </div>

            {/* WHT Rate & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  หัก ณ ที่จ่าย (%)
                </label>
                <select
                  value={whtRate}
                  onChange={(e) => setWhtRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value={3.0}>3.0% (ค่าจ้างแรงงาน/บริการ)</option>
                  <option value={1.0}>1.0% (ค่าขนส่ง)</option>
                  <option value={0.0}>0.0% (ไม่หักภาษี)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  วันที่จ่ายเงิน
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Calculated Breakdown Card */}
            {amount > 0 && !isOverpayment && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>ยอดเงินก่อนหักภาษี:</span>
                  <span className="font-bold text-slate-900 font-mono">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>หัก ณ ที่จ่าย ({whtRate}%):</span>
                  <span className="font-bold text-amber-700 font-mono">- {formatCurrency(whtAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span className="text-emerald-700">ยอดโอนสุทธิให้ช่าง:</span>
                  <span className="text-emerald-700 font-mono text-base">{formatCurrency(netTransferAmount)}</span>
                </div>
              </div>
            )}

            {/* Ref No & Slip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  เลขที่อ้างอิงโอน / สลิป
                </label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  placeholder="เช่น KBANK-091823"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  URL / แนบรูปสลิป
                </label>
                <input
                  type="text"
                  value={slipUrl}
                  onChange={(e) => setSlipUrl(e.target.value)}
                  placeholder="https://... หรือแนบลิงก์"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                หมายเหตุการจ่ายเงินงวดนี้
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="เช่น เบิกค่างวดติดตั้งพื้นชั้น 2 เสร็จ 100%"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Required Edit Reason */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <label className="text-xs font-extrabold text-amber-900 block">
                เหตุผลในการแก้ไขข้อมูล (บันทึกประวัติ Audit Trail) *
              </label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="เช่น แก้ไขยอดเงินตามสลิปโอนเงินจริง, ปรับแก้วันที่โอน"
                className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs text-slate-900 focus:ring-2 focus:ring-amber-500 shadow-2xs font-medium"
                required
              />
              <p className="text-[10px] text-amber-700">
                ระบบจะบันทึกประวัติว่าใคร แก้ไขอะไร เมื่อใด เพื่อความโปร่งใสทางบัญชี
              </p>
            </div>

            {/* Past Edit History Audit Trail */}
            {auditHistory.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-purple-600" />
                    ประวัติการแก้ไขที่ผ่านมา ({auditHistory.length} ครั้ง)
                  </span>
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showHistory && (
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {auditHistory.map((item: any, hIdx: number) => (
                      <div
                        key={hIdx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1 text-slate-700"
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-purple-700 font-bold">
                            ครั้งที่ {auditHistory.length - hIdx}: {item.reason || 'แก้ไขข้อมูล'}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">
                            {formatThaiDate(item.editedAt, true)}
                          </span>
                        </div>
                        {item.changes && (
                          <div className="text-[10.5px] text-slate-600 grid grid-cols-2 gap-1 pt-1 border-t border-slate-200">
                            <div>
                              ยอดเดิม: <strong className="font-mono text-slate-800">{formatCurrency(item.changes.oldAmount)}</strong>
                            </div>
                            <div>
                              ยอดใหม่: <strong className="font-mono text-emerald-700">{formatCurrency(item.changes.newAmount)}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              ลบงวดนี้
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
                disabled={isInvalid || submitting}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                  isInvalid || submitting
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-600 hover:bg-amber-700 active:scale-[0.98]'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {submitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

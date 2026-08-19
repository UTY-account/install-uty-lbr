'use client';

import React, { useState } from 'react';
import {
  X,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  FileCheck,
  Percent,
  Upload,
  Calendar,
  Building,
} from 'lucide-react';
import { formatCurrency, formatMoney, formatThaiDate, formatThaiIDCard } from '@/lib/utils';
import DatePicker from '@/components/DatePicker';

interface PaymentModalProps {
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
  jobTitle?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ contract, jobTitle, onClose, onSuccess }: PaymentModalProps) {
  const netContractAmount = contract.totalContractAmount + contract.extraAmount - contract.deductAmount;
  const currentPaidTotal = contract.payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);
  const remainingBalance = Math.max(0, netContractAmount - currentPaidTotal);
  const nextInstallmentNo = contract.payments.length + 1;

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

  const [displayAmount, setDisplayAmount] = useState<string>(
    remainingBalance > 0 ? formatMoney(remainingBalance) : ''
  );
  const [whtRate, setWhtRate] = useState<number>(3.0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState<string>('');
  const [slipUrl, setSlipUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Parse numeric amount from display with commas
  const amount = parseFloat(displayAmount.replace(/,/g, '')) || 0;
  const isOverpayment = amount > remainingBalance + 0.001;
  const isZeroOrNegative = amount <= 0;
  const isInvalid = isOverpayment || isZeroOrNegative;

  const whtAmount = Math.round((amount * (whtRate / 100)) * 100) / 100;
  const netTransferAmount = Math.round((amount - whtAmount) * 100) / 100;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputWithCommas(e.target.value);
    setDisplayAmount(formatted);
  };

  const handleSetMaxAmount = () => {
    setDisplayAmount(formatMoney(remainingBalance));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/contracts/${contract.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          whtRate,
          paymentDate,
          refNo: refNo.trim() || undefined,
          slipUrl: slipUrl.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'บันทึกการจ่ายเงินไม่สำเร็จ');
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกการจ่ายเงิน');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                บันทึกการจ่ายเงินช่าง
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">
                  งวดที่ {nextInstallmentNo}
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

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Subcontractor & Contract Financial Summary Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-2">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">ช่างผู้รับเงิน:</span>
                <span className="text-sm font-bold text-slate-900">{contract.subcontractor.name}</span>
                {contract.subcontractor.bankAccountNo && (
                  <span className="text-xs text-slate-600 block">
                    {contract.subcontractor.bankName} {contract.subcontractor.bankAccountNo} ({contract.subcontractor.bankAccountName || contract.subcontractor.name})
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono bg-white px-2 py-1 rounded-md border border-slate-200 text-slate-700 font-semibold">
                {formatThaiIDCard(contract.subcontractor.idCard)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-semibold">ยอดรวมสัญญา</div>
                <div className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(netContractAmount)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-semibold">จ่ายแล้ว ({contract.payments.length} งวด)</div>
                <div className="text-xs font-bold text-emerald-700 font-mono">{formatCurrency(currentPaidTotal)}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 shadow-xs">
                <div className="text-[10px] text-blue-800 font-bold">ยอดคงเหลือจ่ายได้</div>
                <div className="text-xs font-extrabold text-blue-700 font-mono">{formatCurrency(remainingBalance)}</div>
              </div>
            </div>
          </div>

          {/* Overpayment Warning Banner */}
          {isOverpayment && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">ระบบป้องกันการจ่ายเงินเกินยอดคงเหลือ (Overpayment Guard)</strong>
                ยอดเงินที่ระบุเกินยอดคงเหลือตามสัญญา คุณสามารถจ่ายได้สูงสุด {formatCurrency(remainingBalance)}
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* 3-Tier Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 block">
                ⚡ ใส่ยอดตามงวดมาตรฐาน 3 งวด (40% - 40% - 20%):
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const target = Math.min(netContractAmount * 0.4, remainingBalance);
                    setDisplayAmount(formatMoney(target));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 text-center transition-colors"
                >
                  <div>งวด 1 (40%)</div>
                  <div className="text-[10px] opacity-80">{formatCurrency(netContractAmount * 0.4)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = Math.min(netContractAmount * 0.4, remainingBalance);
                    setDisplayAmount(formatMoney(target));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 text-center transition-colors"
                >
                  <div>งวด 2 (40%)</div>
                  <div className="text-[10px] opacity-80">{formatCurrency(netContractAmount * 0.4)}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = Math.min(netContractAmount * 0.2, remainingBalance);
                    setDisplayAmount(formatMoney(target));
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 text-center transition-colors"
                >
                  <div>งวด 3 (20%)</div>
                  <div className="text-[10px] opacity-80">{formatCurrency(netContractAmount * 0.2)}</div>
                </button>
              </div>
            </div>

            {/* Amount Field with Guaranteed Real-time Commas */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  ยอดเงินที่จ่ายงวดนี้ (บาท) *
                </label>
                <button
                  type="button"
                  onClick={handleSetMaxAmount}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-bold underline"
                >
                  ใส่ยอดคงเหลือทั้งหมด ({formatCurrency(remainingBalance)})
                </button>
              </div>
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  วันที่จ่ายเงิน (DD/MM/YYYY) *
                </label>
                <DatePicker
                  value={paymentDate}
                  onChange={setPaymentDate}
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
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
              disabled={isInvalid || submitting}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                isInvalid || submitting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'กำลังบันทึก...' : `ยืนยันจ่ายเงินงวดที่ ${nextInstallmentNo}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

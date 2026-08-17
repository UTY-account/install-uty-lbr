'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Trash2,
  HardHat,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import { formatCurrency } from '@/lib/utils';

interface ContractItemDraft {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalAmount: number;
  notes: string;
}

interface ContractDraft {
  subcontractorId: string;
  notes: string;
  extraAmount: number;
  deductAmount: number;
  items: ContractItemDraft[];
}

export default function NewJobPage() {
  const router = useRouter();
  const { companies, selectedCompanyCode } = useCompany();

  const [companyId, setCompanyId] = useState<string>('');
  const [soNumber, setSoNumber] = useState('');
  const [title, setTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const [subcontractorsList, setSubcontractorsList] = useState<any[]>([]);
  const [itemsCatalog, setItemsCatalog] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Subcontractor Contracts draft state
  const [contracts, setContracts] = useState<ContractDraft[]>([
    {
      subcontractorId: '',
      notes: '',
      extraAmount: 0,
      deductAmount: 0,
      items: [
        {
          itemId: '',
          itemCode: '',
          itemName: '',
          quantity: 1,
          unit: 'ตร.ม.',
          unitRate: 0,
          totalAmount: 0,
          notes: '',
        },
      ],
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [subRes, itemRes] = await Promise.all([
          fetch('/api/subcontractors'),
          fetch('/api/items'),
        ]);

        if (subRes.ok && itemRes.ok) {
          const subs = await subRes.json();
          const items = await itemRes.json();
          setSubcontractorsList(subs);
          setItemsCatalog(items);

          if (subs.length > 0) {
            setContracts((prev) => [
              {
                ...prev[0],
                subcontractorId: subs[0].id,
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load sub/item data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Set default company
  useEffect(() => {
    if (companies.length > 0 && !companyId) {
      const active = companies.find((c) => c.code === selectedCompanyCode);
      setCompanyId(active ? active.id : companies[0].id);
    }
  }, [companies, selectedCompanyCode]);

  const addContract = () => {
    setContracts([
      ...contracts,
      {
        subcontractorId: subcontractorsList[0]?.id || '',
        notes: '',
        extraAmount: 0,
        deductAmount: 0,
        items: [
          {
            itemId: '',
            itemCode: '',
            itemName: '',
            quantity: 1,
            unit: 'ตร.ม.',
            unitRate: 0,
            totalAmount: 0,
            notes: '',
          },
        ],
      },
    ]);
  };

  const removeContract = (cIndex: number) => {
    if (contracts.length <= 1) return;
    setContracts(contracts.filter((_, idx) => idx !== cIndex));
  };

  const addItemToContract = (cIndex: number) => {
    const updated = [...contracts];
    updated[cIndex].items.push({
      itemId: '',
      itemCode: '',
      itemName: '',
      quantity: 1,
      unit: 'ตร.ม.',
      unitRate: 0,
      totalAmount: 0,
      notes: '',
    });
    setContracts(updated);
  };

  const removeItemFromContract = (cIndex: number, iIndex: number) => {
    const updated = [...contracts];
    if (updated[cIndex].items.length <= 1) return;
    updated[cIndex].items = updated[cIndex].items.filter((_, idx) => idx !== iIndex);
    setContracts(updated);
  };

  const handleItemSelect = (cIndex: number, iIndex: number, itemId: string) => {
    const item = itemsCatalog.find((it) => it.id === itemId);
    if (!item) return;

    const subId = contracts[cIndex].subcontractorId;
    const subHistory = item.rateHistory?.find((r: any) => r.subcontractorId === subId);
    const suggestedRate = subHistory ? subHistory.unitRate : item.standardRate;

    const updated = [...contracts];
    const currentItem = updated[cIndex].items[iIndex];
    currentItem.itemId = item.id;
    currentItem.itemCode = item.code;
    currentItem.itemName = item.name;
    currentItem.unit = item.unit;
    currentItem.unitRate = suggestedRate;
    currentItem.totalAmount = currentItem.quantity * suggestedRate;
    setContracts(updated);
  };

  const handleItemFieldChange = (
    cIndex: number,
    iIndex: number,
    field: keyof ContractItemDraft,
    value: any
  ) => {
    const updated = [...contracts];
    const item = updated[cIndex].items[iIndex];
    (item as any)[field] = value;

    if (field === 'quantity' || field === 'unitRate') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
      const r = field === 'unitRate' ? parseFloat(value) || 0 : item.unitRate;
      item.totalAmount = q * r;
    }
    setContracts(updated);
  };

  const totalJobAmount = contracts.reduce((jobSum, c) => {
    const cSum = c.items.reduce((itemSum, it) => itemSum + it.totalAmount, 0);
    return jobSum + cSum + (parseFloat(String(c.extraAmount)) || 0) - (parseFloat(String(c.deductAmount)) || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyId) {
      setErrorMsg('กรุณาระบุบริษัทและชื่องานติดตั้ง');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          soNumber: soNumber.trim() || undefined,
          title: title.trim(),
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          siteLocation: siteLocation.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          notes: notes.trim() || undefined,
          contracts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'สร้างงานติดตั้งไม่สำเร็จ');
      }

      router.push(`/jobs/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              เปิดงานติดตั้งใหม่ (New Installation Job)
            </h1>
            <p className="text-xs text-slate-500">
              สร้างงานติดตั้ง และกำหนดสัญญาจ้างช่างแบบรองรับ 1 ช่างหลายรายการย่อย
            </p>
          </div>
        </div>

        <Link
          href="/import-excel"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          หรือนำเข้าจาก Excel
        </Link>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Job Information */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            1. ข้อมูลงานติดตั้งและบริษัทผู้ว่าจ้าง
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                บริษัทผู้ว่าจ้าง *
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-bold shadow-2xs"
                required
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.nameTh}
                  </option>
                ))}
              </select>
            </div>

            {/* SO Number Input */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>เลขที่ SO (Sales Order) จากระบบเดิม</span>
                <span className="text-[10px] text-blue-600 font-mono font-normal">ตัวอย่าง: SO260817-0001</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={soNumber}
                  onChange={(e) => setSoNumber(e.target.value)}
                  placeholder="เช่น SO260817-0001"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs uppercase"
                />
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const yy = now.getFullYear().toString().slice(-2);
                    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
                    const dd = now.getDate().toString().padStart(2, '0');
                    setSoNumber(`SO${yy}${mm}${dd}-0001`);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200 shadow-2xs whitespace-nowrap"
                  title="สร้างตัวอย่างเลข SO วันนี้"
                >
                  ตัวอย่าง SO
                </button>
              </div>
              {soNumber.trim() && (
                <div className="text-[10px] text-blue-700 font-mono mt-1 font-semibold">
                  ✓ รหัสงาน: {companies.find((c) => c.id === companyId)?.code || 'CP1'}-{soNumber.trim()} &bull; สัญญาช่าง: {companies.find((c) => c.id === companyId)?.code || 'CP1'}-{soNumber.trim()}-01, -02...
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ชื่องาน / สถานที่ติดตั้ง *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น คอนโด ไนท์บริดจ์ ไพร์ม สาทร ยูนิต 1204"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ชื่อลูกค้า / เจ้าของห้อง
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="เช่น คุณสมพงษ์ เจริญกิจ"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                เบอร์โทรลูกค้า
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                สถานที่ตั้ง / ที่อยู่หน้างาน
              </label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="เช่น ชั้น 12 ห้อง 1204 อาคาร ไนท์บริดจ์ สาทร กรุงเทพฯ"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่เริ่มงาน
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่คาดว่าจะแล้วเสร็จ
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Subcontractors & Multi-Items */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <HardHat className="w-4 h-4 text-amber-600" />
                2. สัญญาจ้างช่างและรายการงานย่อย (Multi-Items per Subcontractor)
              </h3>
              <p className="text-[11px] text-slate-500">
                1 ช่างสามารถรับงานได้หลายรายการย่อย ระบบจะรวมยอดเป็นสัญญาเดียว และบันทึกราคาต่อหน่วยเข้าฐานข้อมูล
              </p>
            </div>

            <button
              type="button"
              onClick={addContract}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold border border-blue-200 transition-all self-start shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              + เพิ่มช่างในงานนี้
            </button>
          </div>

          {/* Contracts List */}
          <div className="space-y-6">
            {contracts.map((c, cIndex) => {
              const contractSubtotal = c.items.reduce((sum, it) => sum + it.totalAmount, 0);
              const contractNet = contractSubtotal + (parseFloat(String(c.extraAmount)) || 0) - (parseFloat(String(c.deductAmount)) || 0);

              return (
                <div
                  key={cIndex}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 shadow-2xs"
                >
                  {/* Contract Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs flex items-center justify-center">
                        {cIndex + 1}
                      </span>
                      <div className="flex-1 max-w-sm">
                        <label className="text-[10px] text-slate-500 block font-bold">
                          เลือกช่างผู้รับเหมา *
                        </label>
                        <select
                          value={c.subcontractorId}
                          onChange={(e) => {
                            const updated = [...contracts];
                            updated[cIndex].subcontractorId = e.target.value;
                            setContracts(updated);
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {subcontractorsList.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name} ({sub.phone})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-semibold">ยอดรวมสัญญาช่างคนนี้</span>
                        <span className="font-mono font-extrabold text-sm text-emerald-700">
                          {formatCurrency(contractNet)}
                        </span>
                      </div>

                      {contracts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeContract(cIndex)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบสัญญานี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Multi-Items Table for this Contractor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        รายการงานย่อยที่ช่างคนนี้รับผิดชอบ ({c.items.length} รายการ):
                      </span>
                      <button
                        type="button"
                        onClick={() => addItemToContract(cIndex)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> เพิ่มรายการย่อย
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold">
                            <th className="py-2 px-2.5 w-10 text-center">#</th>
                            <th className="py-2 px-2.5 w-48">เลือกรหัสรายการ</th>
                            <th className="py-2 px-2.5">ชื่องาน/รายละเอียด</th>
                            <th className="py-2 px-2.5 w-24 text-right">ปริมาณ</th>
                            <th className="py-2 px-2.5 w-20 text-center">หน่วย</th>
                            <th className="py-2 px-2.5 w-28 text-right">ราคา/หน่วย</th>
                            <th className="py-2 px-2.5 w-28 text-right">รวม (บาท)</th>
                            <th className="py-2 px-2.5 w-10 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {c.items.map((item, iIndex) => (
                            <tr key={iIndex} className="hover:bg-slate-50">
                              <td className="py-2 px-2.5 text-center text-slate-400 font-medium">
                                {iIndex + 1}
                              </td>

                              {/* Master Item Selection */}
                              <td className="py-2 px-2.5">
                                <select
                                  value={item.itemId}
                                  onChange={(e) => handleItemSelect(cIndex, iIndex, e.target.value)}
                                  className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-300 text-xs font-mono text-slate-800 font-bold"
                                >
                                  <option value="">-- เลือกจากคลัง --</option>
                                  {itemsCatalog.map((it) => (
                                    <option key={it.id} value={it.id}>
                                      {it.code}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* Item Name */}
                              <td className="py-2 px-2.5">
                                <input
                                  type="text"
                                  value={item.itemName}
                                  onChange={(e) =>
                                    handleItemFieldChange(cIndex, iIndex, 'itemName', e.target.value)
                                  }
                                  placeholder="ชื่องานติดตั้ง"
                                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-slate-900"
                                  required
                                />
                              </td>

                              {/* Quantity */}
                              <td className="py-2 px-2.5">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.1"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleItemFieldChange(cIndex, iIndex, 'quantity', e.target.value)
                                  }
                                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-right font-mono text-slate-900"
                                  required
                                />
                              </td>

                              {/* Unit */}
                              <td className="py-2 px-2.5">
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={(e) =>
                                    handleItemFieldChange(cIndex, iIndex, 'unit', e.target.value)
                                  }
                                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-center text-slate-900"
                                  required
                                />
                              </td>

                              {/* Unit Rate */}
                              <td className="py-2 px-2.5">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={item.unitRate}
                                  onChange={(e) =>
                                    handleItemFieldChange(cIndex, iIndex, 'unitRate', e.target.value)
                                  }
                                  className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-right font-mono font-bold text-emerald-700"
                                  required
                                />
                              </td>

                              {/* Total */}
                              <td className="py-2 px-2.5 text-right font-mono font-extrabold text-slate-900">
                                {formatCurrency(item.totalAmount).replace('฿', '')}
                              </td>

                              {/* Delete button */}
                              <td className="py-2 px-2.5 text-center">
                                {c.items.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeItemFromContract(cIndex, iIndex)}
                                    className="text-slate-400 hover:text-rose-600 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Summary & Submit */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-bold block">ยอดรวมทั้งสิ้นทุกสัญญางานนี้</span>
            <div className="text-2xl font-extrabold text-slate-900 font-mono flex items-center gap-2">
              <span className="text-emerald-700">{formatCurrency(totalJobAmount)}</span>
              <span className="text-xs font-normal text-slate-500">
                ({contracts.length} ช่าง &bull;{' '}
                {contracts.reduce((sum, c) => sum + c.items.length, 0)} รายการย่อย)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/jobs"
              className="flex-1 sm:flex-none text-center px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'กำลังบันทึก...' : 'สร้างงานติดตั้งและบันทึกสัญญา'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

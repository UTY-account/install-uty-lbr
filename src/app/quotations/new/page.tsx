'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DatePicker from '@/components/DatePicker';
import {
  FileText,
  ArrowLeft,
  HardHat,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Calendar,
  Layers,
  CreditCard,
  Phone,
  ShieldCheck,
  ShieldAlert,
  User,
  PlusCircle,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import { formatCurrency, formatMoney, formatThaiIDCard } from '@/lib/utils';

interface QuotationItemDraft {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitRate: number;
  totalAmount: number;
  notes: string;
}

function NewQuotationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSubId = searchParams.get('subcontractorId') || '';
  const preselectedItemCode = searchParams.get('itemCode') || '';

  const { companies, selectedCompanyCode } = useCompany();

  const [companyId, setCompanyId] = useState<string>('');
  const [soNumber, setSoNumber] = useState<string>('');
  const [contractorSeq, setContractorSeq] = useState<string>('1');
  const [subcontractorId, setSubcontractorId] = useState<string>(preselectedSubId);
  const [subIdCard, setSubIdCard] = useState<string>('');
  const [subPhone, setSubPhone] = useState<string>('');
  const [subAddress, setSubAddress] = useState<string>('');
  const [projectName, setProjectName] = useState('');
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState('');
  const [whtRate, setWhtRate] = useState<number>(3.0);
  const [notes, setNotes] = useState('');

  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [itemsCatalog, setItemsCatalog] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Quick Add Subcontractor inline toggle
  const [isQuickAddingSub, setIsQuickAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIdCard, setNewSubIdCard] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');
  const [newSubAddress, setNewSubAddress] = useState('');
  const [newSubBankName, setNewSubBankName] = useState('กสิกรไทย');
  const [newSubBankAccountNo, setNewSubBankAccountNo] = useState('');
  const [quickAddLoading, setQuickAddLoading] = useState(false);

  const [items, setItems] = useState<QuotationItemDraft[]>([
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
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch subcontractors and items
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
          const its = await itemRes.json();
          setSubcontractors(subs);
          setItemsCatalog(its);

          if (subs.length > 0) {
            const initialSub = preselectedSubId
              ? subs.find((s: any) => s.id === preselectedSubId) || subs[0]
              : subs[0];
            setSubcontractorId(initialSub.id);
            setSubIdCard(initialSub.idCard || '');
            setSubPhone(initialSub.phone || '');
            setSubAddress(initialSub.address || '');
          }

          if (preselectedItemCode) {
            const matchedItem = its.find((it: any) => it.code === preselectedItemCode);
            if (matchedItem) {
              setItems([
                {
                  itemId: matchedItem.id,
                  itemCode: matchedItem.code,
                  itemName: matchedItem.name,
                  quantity: 1,
                  unit: matchedItem.unit,
                  unitRate: matchedItem.standardRate,
                  totalAmount: matchedItem.standardRate,
                  notes: '',
                },
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load sub/item list:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Update selected sub info
  const handleSubChange = (newSubId: string) => {
    setSubcontractorId(newSubId);
    const sub = subcontractors.find((s) => s.id === newSubId);
    if (sub) {
      setSubIdCard(sub.idCard || '');
      setSubPhone(sub.phone || '');
      setSubAddress(sub.address || '');
    }
  };

  // Quick create subcontractor directly in quotation page
  const handleQuickAddSub = async () => {
    const cleanId = newSubIdCard.replace(/\D/g, '').trim();
    if (!newSubName.trim() || cleanId.length !== 13 || !newSubPhone.trim()) {
      setErrorMsg('กรุณากรอกชื่อช่าง, เบอร์โทรศัพท์ และเลขบัตรประชาชนให้ครบ 13 หลัก');
      return;
    }

    setQuickAddLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/subcontractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSubName.trim(),
          idCard: cleanId,
          phone: newSubPhone.trim(),
          address: newSubAddress.trim() || undefined,
          bankName: newSubBankName.trim() || undefined,
          bankAccountNo: newSubBankAccountNo.trim() || undefined,
          bankAccountName: newSubName.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เพิ่มข้อมูลช่างไม่สำเร็จ');

      const updatedSubs = [data, ...subcontractors];
      setSubcontractors(updatedSubs);
      setSubcontractorId(data.id);
      setSubIdCard(data.idCard);
      setSubPhone(data.phone);
      setSubAddress(data.address || '');
      setIsQuickAddingSub(false);
      setNewSubName('');
      setNewSubIdCard('');
      setNewSubPhone('');
      setNewSubAddress('');
      setNewSubBankAccountNo('');
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสร้างข้อมูลช่าง');
    } finally {
      setQuickAddLoading(false);
    }
  };

  // Default company
  useEffect(() => {
    if (companies.length > 0 && !companyId) {
      const active = companies.find((c) => c.code === selectedCompanyCode);
      setCompanyId(active ? active.id : companies[0].id);
    }
  }, [companies, selectedCompanyCode]);

  const addItem = () => {
    setItems([
      ...items,
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
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const item = itemsCatalog.find((it) => it.id === itemId);
    if (!item) return;

    const subHistory = item.rateHistory?.find((r: any) => r.subcontractorId === subcontractorId);
    const suggestedRate = subHistory ? subHistory.unitRate : item.standardRate;

    const updated = [...items];
    const cur = updated[index];
    cur.itemId = item.id;
    cur.itemCode = item.code;
    cur.itemName = item.name;
    cur.unit = item.unit;
    cur.unitRate = suggestedRate;
    cur.totalAmount = cur.quantity * suggestedRate;
    setItems(updated);
  };

  const handleFieldChange = (index: number, field: keyof QuotationItemDraft, value: any) => {
    const updated = [...items];
    const it = updated[index];
    (it as any)[field] = value;

    if (field === 'quantity' || field === 'unitRate') {
      const q = field === 'quantity' ? parseFloat(value) || 0 : it.quantity;
      const r = field === 'unitRate' ? parseFloat(value) || 0 : it.unitRate;
      it.totalAmount = q * r;
    }
    setItems(updated);
  };

  const subtotal = items.reduce((sum, it) => sum + it.totalAmount, 0);
  const whtAmount = Math.round((subtotal * (whtRate / 100)) * 100) / 100;
  const grandTotal = Math.round((subtotal - whtAmount) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !subcontractorId || !projectName.trim()) {
      setErrorMsg('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          subcontractorId,
          soNumber: soNumber.trim() || undefined,
          contractorSeq: parseInt(contractorSeq) || 1,
          projectName: projectName.trim(),
          quotationDate,
          validUntil: validUntil || undefined,
          whtRate,
          notes: notes.trim() || undefined,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'สร้างใบเสนอราคาไม่สำเร็จ');

      router.push(`/quotations/${data.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSub = subcontractors.find((s) => s.id === subcontractorId);
  const selectedComp = companies.find((c) => c.id === companyId);

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/quotations"
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              ออกใบเสนอราคาแทนช่าง (Subcontractor Quotation)
            </h1>
            <p className="text-xs text-slate-500">
              หัวเอกสารเป็นชื่อช่าง (ผู้เสนอราคา) และผู้รับใบเสนอราคาคือบริษัทของเรา (ผู้ว่าจ้าง)
            </p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Inverted Header Flow Concept Box */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <HardHat className="w-5 h-5 text-amber-600" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">ผู้เสนอราคา (Vendor / Issuer):</span>
            <span className="font-bold text-slate-900 text-sm">{selectedSub?.name || 'เลือกช่างด้านล่าง'}</span>
            {selectedSub?.idCard && (
              <span className="font-mono text-slate-600 text-xs block">
                บัตร ปชช: {formatThaiIDCard(selectedSub.idCard)}
              </span>
            )}
          </div>
        </div>
        <span className="text-blue-500 font-bold hidden sm:inline">➔ เสนอให้ ➔</span>
        <div className="flex items-center gap-2 text-left sm:text-right">
          <Building2 className="w-5 h-5 text-blue-600" />
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">ผู้ว่าจ้าง (Client / Recipient):</span>
            <span className="font-bold text-slate-900 text-sm">{selectedComp?.nameTh || 'เลือกบริษัทด้านล่าง'}</span>
            {selectedComp?.taxId && (
              <span className="font-mono text-slate-600 text-xs block">
                เลขผู้เสียภาษี: {formatThaiIDCard(selectedComp.taxId)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Parties, ID Card, Address & Project Name */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-600" />
              1. ข้อมูลผู้เสนอราคา (ช่าง), บัตรประชาชน, ที่อยู่ และผู้รับเอกสาร (บริษัท)
            </h3>

            {!isQuickAddingSub && (
              <button
                type="button"
                onClick={() => setIsQuickAddingSub(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" /> + เพิ่มช่างใหม่
              </button>
            )}
          </div>

          {/* Quick Add Subcontractor Panel */}
          {isQuickAddingSub && (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-700" /> เพิ่มข้อมูลช่างใหม่ด่วน (พร้อมบันทึกลงระบบ)
                </span>
                <button
                  type="button"
                  onClick={() => setIsQuickAddingSub(false)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  ยกเลิก
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">ชื่อช่าง *</label>
                  <input
                    type="text"
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="เช่น นายมานะ ทำงานดี"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>เลขบัตร ปชช. (13 หลัก) *</span>
                    <span className="font-mono text-[9px] text-slate-400">({newSubIdCard.length}/13)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={newSubIdCard}
                    onChange={(e) => setNewSubIdCard(e.target.value.replace(/\D/g, '').slice(0, 13))}
                    placeholder="1100400123456 (ล็อก 13 ตัว)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="text"
                    value={newSubPhone}
                    onChange={(e) => setNewSubPhone(e.target.value)}
                    placeholder="081-234-5678"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">ที่อยู่ตามบัตรประชาชนช่าง</label>
                  <input
                    type="text"
                    value={newSubAddress}
                    onChange={(e) => setNewSubAddress(e.target.value)}
                    placeholder="เลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleQuickAddSub}
                  disabled={quickAddLoading}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  {quickAddLoading ? 'กำลังบันทึก...' : 'บันทึกช่างและเลือกใช้งาน'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subcontractor Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ช่างผู้เสนอราคา (Subcontractor) *
              </label>
              <select
                value={subcontractorId}
                onChange={(e) => handleSubChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 font-bold shadow-2xs"
                required
              >
                {subcontractors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Subcontractor ID Card Field */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>เลขประจำตัวประชาชนช่าง (13 หลัก) *</span>
                {selectedSub?.idCardStatus === 'VERIFIED' ? (
                  <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> ตรวจสอบแล้ว
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-600" /> รอแนบรูปบัตร
                  </span>
                )}
              </label>
              <input
                type="text"
                readOnly
                value={subIdCard ? formatThaiIDCard(subIdCard) : '-'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-800 shadow-2xs cursor-default"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                เบอร์โทรศัพท์ช่าง
              </label>
              <input
                type="text"
                readOnly
                value={subPhone || '-'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 shadow-2xs cursor-default"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ที่อยู่ช่าง (สำหรับระบุในใบเสนอราคา)
              </label>
              <input
                type="text"
                readOnly
                value={subAddress || 'ไม่ได้ระบุที่อยู่'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 shadow-2xs cursor-default truncate"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                บริษัทผู้ว่าจ้าง (ผู้รับใบเสนอราคา) *
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

            {/* SO Number and Contractor Sequence */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  เลขที่ SO (Sales Order) จากระบบเดิม (ถ้ามี)
                </label>
                <div className="text-[11px] text-slate-500 font-mono">
                  {soNumber.trim() ? (
                    <span className="text-blue-700 font-bold">
                      เลขที่เอกสารที่จะออก: {companies.find((c) => c.id === companyId)?.code || 'CP1'}-QT-{soNumber.trim()}-{String(contractorSeq).padStart(2, '0')}
                    </span>
                  ) : (
                    <span>หากไม่ระบุ ระบบจะรันรหัส QT ตามรอบเดือนให้อัตโนมัติ</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 flex gap-2">
                  <input
                    type="text"
                    value={soNumber}
                    onChange={(e) => setSoNumber(e.target.value)}
                    placeholder="เช่น SO260817-0001"
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs uppercase"
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

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap">ช่างคนที่:</span>
                  <select
                    value={contractorSeq}
                    onChange={(e) => setContractorSeq(e.target.value)}
                    className="flex-1 px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 shadow-2xs"
                  >
                    <option value="1">01 (ช่างคนที่ 1)</option>
                    <option value="2">02 (ช่างคนที่ 2)</option>
                    <option value="3">03 (ช่างคนที่ 3)</option>
                    <option value="4">04 (ช่างคนที่ 4)</option>
                    <option value="5">05 (ช่างคนที่ 5)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ชื่อโครงการ / สถานที่ติดตั้ง *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="เช่น โครงการ ปูพื้น SPC และบัวผนัง โฮมออฟฟิศ ทาวน์อินทาวน์"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs font-bold"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่ออกเอกสาร (DD/MM/YYYY) *
              </label>
              <DatePicker
                value={quotationDate}
                onChange={setQuotationDate}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                กำหนดยืนราคาถึงวันที่ (DD/MM/YYYY)
              </label>
              <DatePicker
                value={validUntil}
                onChange={setValidUntil}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Items Table */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              2. รายการงานติดตั้งและราคาค่าแรง ({items.length} รายการ)
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> เพิ่มรายการ
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-2.5 w-10 text-center">#</th>
                  <th className="py-2.5 px-2.5 w-44">รหัสรายการ</th>
                  <th className="py-2.5 px-2.5">ชื่องาน/รายละเอียด</th>
                  <th className="py-2.5 px-2.5 w-24 text-right">ปริมาณ</th>
                  <th className="py-2.5 px-2.5 w-20 text-center">หน่วย</th>
                  <th className="py-2.5 px-2.5 w-28 text-right">ราคาต่อหน่วย</th>
                  <th className="py-2.5 px-2.5 w-28 text-right">รวมเงิน (บาท)</th>
                  <th className="py-2.5 px-2.5 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-2.5 text-center text-slate-400 font-medium">{idx + 1}</td>

                    <td className="py-2 px-2.5">
                      <select
                        value={item.itemId}
                        onChange={(e) => handleItemSelect(idx, e.target.value)}
                        className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-purple-700"
                      >
                        <option value="">-- เลือกจากคลัง --</option>
                        {itemsCatalog.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.code}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2 px-2.5">
                      <input
                        type="text"
                        value={item.itemName}
                        onChange={(e) => handleFieldChange(idx, 'itemName', e.target.value)}
                        placeholder="รายละเอียดงาน"
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-slate-900"
                        required
                      />
                    </td>

                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={item.quantity}
                        onChange={(e) => handleFieldChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-right font-mono text-slate-900"
                        required
                      />
                    </td>

                    <td className="py-2 px-2.5">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-center text-slate-900"
                        required
                      />
                    </td>

                    <td className="py-2 px-2.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitRate}
                        onChange={(e) => handleFieldChange(idx, 'unitRate', e.target.value)}
                        className="w-full px-2 py-1 rounded bg-white border border-slate-300 text-xs text-right font-mono font-bold text-emerald-700"
                        required
                      />
                    </td>

                    <td className="py-2 px-2.5 text-right font-mono font-extrabold text-slate-900">
                      {formatMoney(item.totalAmount)}
                    </td>

                    <td className="py-2 px-2.5 text-center">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
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

          {/* Tax Calculation & Subtotal Box */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                หักภาษี ณ ที่จ่าย (%)
              </label>
              <select
                value={whtRate}
                onChange={(e) => setWhtRate(parseFloat(e.target.value))}
                className="w-full max-w-xs px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                <option value={3.0}>3.0% (ค่าจ้างแรงงาน/บริการ)</option>
                <option value={1.0}>1.0% (ค่าขนส่ง)</option>
                <option value={0.0}>0.0% (ไม่หักภาษี)</option>
              </select>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>ยอดรวมค่าจ้าง (Subtotal):</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>หัก ณ ที่จ่าย ({whtRate}%):</span>
                <span className="font-mono font-semibold text-amber-700">
                  - {formatCurrency(whtAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span className="text-emerald-700">ยอดเงินสุทธิ (Grand Total):</span>
                <span className="text-emerald-700 font-mono text-base">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/quotations"
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <CheckCircle2 className="w-4 h-4" />
            {submitting ? 'กำลังสร้างใบเสนอราคา...' : 'ออกใบเสนอราคาและดูตัวอย่าง A4'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-sm">กำลังโหลดฟอร์มใบเสนอราคา...</div>}>
      <NewQuotationContent />
    </Suspense>
  );
}

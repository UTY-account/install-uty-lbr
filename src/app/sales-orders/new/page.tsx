'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FileText,
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Phone,
  User,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import DatePicker from '@/components/DatePicker';
import { formatCurrency, formatNumber, formatISODate } from '@/lib/utils';

export default function NewSalesOrderPage() {
  const router = useRouter();
  const { selectedCompanyCode, companies, selectedCompany } = useCompany();

  const [companyId, setCompanyId] = useState('');
  const [soNumber, setSoNumber] = useState('');
  const [salesPerson, setSalesPerson] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [targetInstallDate, setTargetInstallDate] = useState(formatISODate(new Date()));
  const [targetFinishDate, setTargetFinishDate] = useState(formatISODate(new Date()));
  const [notes, setNotes] = useState('');

  // Auto-suggest default SO number based on today's date: YYMMDD-0001
  useEffect(() => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setSoNumber(`${yy}${mm}${dd}-0001`);
  }, []);

  // Staff Tagging
  const [availableStaff, setAvailableStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('FOREMAN');

  // Items Draft
  const [items, setItems] = useState<any[]>([
    {
      itemCode: 'ITEM-WOOD-001',
      itemName: 'งานติดตั้งไม้พื้น SPC พร้อมปรับระดับ',
      category: 'งานพื้น',
      quantity: 50,
      unit: 'ตร.ม.',
      unitRate: 350,
      totalAmount: 17500,
      notes: '',
    },
  ]);

  // Pre-fill company
  useEffect(() => {
    if (companies.length > 0) {
      if (selectedCompany?.id) {
        setCompanyId(selectedCompany.id);
      } else {
        setCompanyId(companies[0].id);
      }
    }
  }, [companies, selectedCompany]);

  // Fetch Staff List
  useEffect(() => {
    fetch('/api/staff')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableStaff(data);
      })
      .catch((err) => console.error('Failed to load staff:', err));
  }, []);

  const handleToggleStaff = (st: any) => {
    const exists = selectedStaff.find((s) => s.id === st.id);
    if (exists) {
      setSelectedStaff(selectedStaff.filter((s) => s.id !== st.id));
    } else {
      setSelectedStaff([...selectedStaff, { id: st.id, name: st.name, role: st.role }]);
    }
  };

  const handleDeleteStaff = async (st: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`คุณต้องการลบรายชื่อ "${st.name}" ออกจากระบบถาวรหรือไม่?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/staff?id=${st.id}`, { method: 'DELETE' });
      if (res.ok) {
        setAvailableStaff((prev) => prev.filter((s) => s.id !== st.id));
        setSelectedStaff((prev) => prev.filter((s) => s.id !== st.id));
      } else {
        const err = await res.json();
        alert(err.error || 'เกิดข้อผิดพลาดในการลบทีมงาน');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  const handleCreateNewStaff = async () => {
    if (!newStaffName.trim()) return;
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newStaffName.trim(), role: newStaffRole }),
      });
      if (res.ok) {
        const created = await res.json();
        setAvailableStaff([...availableStaff, created]);
        setSelectedStaff([...selectedStaff, { id: created.id, name: created.name, role: created.role }]);
        setNewStaffName('');
      }
    } catch (err) {
      console.error('Error creating staff:', err);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemCode: `ITEM-GEN-${items.length + 1}`,
        itemName: '',
        category: 'งานทั่วไป',
        quantity: 1,
        unit: 'ตร.ม.',
        unitRate: 0,
        totalAmount: 0,
        notes: '',
      },
    ]);
  };

  const handleUpdateItem = (index: number, field: string, val: any) => {
    const updated = [...items];
    updated[index][field] = val;
    if (field === 'quantity' || field === 'unitRate') {
      const q = parseFloat(updated[index].quantity) || 0;
      const r = parseFloat(updated[index].unitRate) || 0;
      updated[index].totalAmount = q * r;
    }
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, it) => sum + (parseFloat(it.totalAmount) || 0), 0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!soNumber.trim()) {
      setErrorMsg('กรุณากรอกเลขที่ SO เช่น 260815-0001 (YYMMDD-XXXX)');
      return;
    }
    if (!companyId) {
      setErrorMsg('กรุณาเลือกบริษัทผู้ขาย');
      return;
    }
    if (!customerName.trim() || !siteLocation.trim()) {
      setErrorMsg('กรุณากรอกชื่อลูกค้าและสถานที่ติดตั้ง');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          soNumber: soNumber.trim(),
          companyId,
          salesPerson,
          customerName,
          customerPhone,
          siteLocation,
          googleMapsUrl,
          targetInstallDate,
          targetFinishDate,
          notes,
          taggedStaff: selectedStaff,
          items,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create sales order');
      }

      const created = await res.json();
      router.push(`/sales-orders/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการสร้าง SO');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/sales-orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายการ SO</span>
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
          <FileText className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">
            เปิดคำสั่งขาย & จองคิวงานติดตั้ง (New Sales Order)
          </h1>
          <p className="text-xs text-slate-500">
            เซลกรอกข้อมูลลูกค้า วันนัดหมายหน้างาน ปักหมุด Google Maps และแท็กทีมงานคุมงาน
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: SO Number, Company & Sales Person */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>1. เลขที่ SO, บริษัทผู้ขาย และเซลผู้รับผิดชอบ</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  เลขที่ SO (Sales Order No.) *
                </label>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  YYMMDD-XXXX
                </span>
              </div>
              <input
                type="text"
                value={soNumber}
                onChange={(e) => setSoNumber(e.target.value)}
                placeholder="เช่น 260815-0001"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-mono font-extrabold text-indigo-800 text-xs focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                ตัวอย่าง: 26 (ปี) 08 (เดือน) 15 (วัน) - 0001 (ลำดับ)
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                บริษัทผู้ขาย (Issuer) *
              </label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500"
                required
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}: {c.nameTh}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ชื่อเซล / ผู้ดูแลงาน (Sales Person)
              </label>
              <input
                type="text"
                value={salesPerson}
                onChange={(e) => setSalesPerson(e.target.value)}
                placeholder="เช่น ศิริพร (เซล), ธนากร"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Customer & Site Location & Google Maps */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-4 h-4 text-rose-600" />
            <span>2. ข้อมูลลูกค้า, สถานที่ติดตั้ง และ Google Maps</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ชื่อลูกค้า / ชื่อโครงการ *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="เช่น คุณวิภาวี / โครงการ บ้านเดี่ยว พุทธมณฑลสาย 2"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                เบอร์โทรศัพท์ลูกค้า
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                สถานที่ / ที่อยู่ติดตั้ง / รายละเอียดหน้างาน *
              </label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="เช่น 123/45 ซอยสุขุมวิท 55 แขวงคลองตันเหนือ เขตวัฒนา กทม. (ห้องนอนชั้น 2)"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>🗺️ ลิงก์ Google Maps / พิกัด GPS (สำหรับให้ช่างและโฟร์แมนกดนำทาง)</span>
                {googleMapsUrl && (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>ทดสอบเปิดแผนที่</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="เช่น https://maps.app.goo.gl/xxx หรือ https://google.com/maps?q=13.7563,100.5018"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Target Booking Dates & Tagged Staff */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>3. วันที่นัดหมายติดตั้ง & แท็กทีมงานผู้เกี่ยวข้อง</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่เริ่มเข้าติดตั้ง (DD/MM/YYYY) *
              </label>
              <DatePicker
                value={targetInstallDate}
                onChange={setTargetInstallDate}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                วันที่คาดว่าจะแล้วเสร็จ (DD/MM/YYYY)
              </label>
              <DatePicker
                value={targetFinishDate}
                onChange={setTargetFinishDate}
              />
            </div>
          </div>

          {/* Staff Tagging Selector */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-slate-700 block">
              🏷️ แท็กทีมงานผู้รับผิดชอบงานนี้ (เซล, PM, โฟร์แมน):
            </label>
            <div className="flex flex-wrap gap-2">
              {availableStaff.map((st) => {
                const isSelected = !!selectedStaff.find((s) => s.id === st.id);
                return (
                  <div
                    key={st.id}
                    onClick={() => handleToggleStaff(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>
                      {st.name} ({st.role === 'FOREMAN' ? 'โฟร์แมน' : st.role === 'SALES' ? 'เซล' : st.role === 'PM' ? 'PM' : st.role})
                    </span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}

                    <button
                      type="button"
                      onClick={(e) => handleDeleteStaff(st, e)}
                      className={`ml-1 p-0.5 rounded-md transition-colors ${
                        isSelected
                          ? 'text-indigo-200 hover:text-white hover:bg-white/20'
                          : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={`ลบ "${st.name}" ออกจากระบบถาวร`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Staff */}
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="+ พิมพ์ชื่อทีมงานใหม่เพื่อแท็ก..."
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                className="w-56 px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white"
              />
              <select
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
                className="px-2 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200"
              >
                <option value="FOREMAN">โฟร์แมน (Foreman)</option>
                <option value="PM">ผู้จัดการงาน (PM)</option>
                <option value="SALES">เซล (Sales)</option>
                <option value="COORDINATOR">ประสานงาน</option>
              </select>
              <button
                type="button"
                onClick={handleCreateNewStaff}
                className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
              >
                + เพิ่ม
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Items Table */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>4. รายการสินค้า & งานติดตั้งที่ขาย</span>
            </h2>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold border border-purple-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ เพิ่มรายการ</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">รายละเอียดงาน / สินค้า</th>
                  <th className="py-2.5 px-3 w-32">หมวดหมู่งาน</th>
                  <th className="py-2.5 px-3 w-24 text-right">จำนวน</th>
                  <th className="py-2.5 px-3 w-20">หน่วย</th>
                  <th className="py-2.5 px-3 w-28 text-right">ราคา/หน่วย</th>
                  <th className="py-2.5 px-3 w-32 text-right">ยอดรวม</th>
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={it.itemName}
                        onChange={(e) => handleUpdateItem(idx, 'itemName', e.target.value)}
                        placeholder="เช่น ติดตั้งพื้นไม้ SPC หรือ บัวเชิงผนัง"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={it.category}
                        onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                        placeholder="งานพื้น / งานบัว"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        step="any"
                        value={it.quantity}
                        onChange={(e) => handleUpdateItem(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono font-bold text-right focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={it.unit}
                        onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                        placeholder="ตร.ม."
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs text-center focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        step="any"
                        value={it.unitRate}
                        onChange={(e) => handleUpdateItem(idx, 'unitRate', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono text-right focus:ring-1 focus:ring-purple-500"
                      />
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(it.totalAmount)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        className="text-slate-300 hover:text-rose-600 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-bold text-slate-600">ยอดรวมทั้งสิ้น:</span>
              <span className="text-lg font-extrabold font-mono text-purple-700">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Section 5: Notes */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-700 block">
            หมายเหตุ / เงื่อนไขพิเศษหน้างาน
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="เช่น ต้องนำเครื่องดูดฝุ่นเข้าด้วย, หน้างานมีลิฟต์ขนของ, ติดต่อรปภ.หน้าหมู่บ้าน..."
            className="w-full p-3 rounded-2xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/sales-orders"
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            ยกเลิก
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>กำลังบันทึก...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกและเปิดคำสั่งขาย (SO)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

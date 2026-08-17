'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  PlusCircle,
  Edit2,
  CheckCircle,
  Building,
  Phone,
  CreditCard,
  AlertCircle,
  X,
  Trash2,
} from 'lucide-react';
import { formatThaiIDCard } from '@/lib/utils';
import { useCompany } from '@/components/CompanyContext';

export default function CompaniesSettingsPage() {
  const { refreshCompanies: refreshGlobalCompanies } = useCompany();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Company Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [code, setCode] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [taxId, setTaxId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [bankInfo, setBankInfo] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Company Modal
  const [editingCompany, setEditingCompany] = useState<any | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editNameTh, setEditNameTh] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editTaxId, setEditTaxId] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBankInfo, setEditBankInfo] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleTaxIdChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    setTaxId(digits);
  };

  const handleEditTaxIdChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    setEditTaxId(digits);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTaxId = taxId.replace(/\D/g, '').trim();
    if (cleanTaxId.length !== 13) {
      setAddError('กรุณากรอกเลขประจำตัวผู้เสียภาษีให้ครบ 13 หลัก');
      return;
    }

    setAddLoading(true);
    setAddError(null);

    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          nameTh: nameTh.trim(),
          nameEn: nameEn.trim() || undefined,
          taxId: cleanTaxId,
          address: address.trim(),
          phone: phone.trim() || undefined,
          bankInfo: bankInfo.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เพิ่มบริษัทไม่สำเร็จ');

      setShowAddModal(false);
      setCode('');
      setNameTh('');
      setNameEn('');
      setTaxId('');
      setAddress('');
      setPhone('');
      setBankInfo('');
      fetchCompanies();
      refreshGlobalCompanies();
    } catch (err: any) {
      setAddError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setAddLoading(false);
    }
  };

  const openEditModal = (comp: any) => {
    setEditingCompany(comp);
    setEditCode(comp.code);
    setEditNameTh(comp.nameTh);
    setEditNameEn(comp.nameEn || '');
    setEditTaxId(comp.taxId ? comp.taxId.replace(/\D/g, '').slice(0, 13) : '');
    setEditAddress(comp.address);
    setEditPhone(comp.phone || '');
    setEditBankInfo(comp.bankInfo || '');
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;

    const cleanTaxId = editTaxId.replace(/\D/g, '').trim();
    if (cleanTaxId.length !== 13) {
      setEditError('กรุณากรอกเลขประจำตัวผู้เสียภาษีให้ครบ 13 หลัก');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch('/api/companies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCompany.id,
          code: editCode.trim().toUpperCase(),
          nameTh: editNameTh.trim(),
          nameEn: editNameEn.trim() || null,
          taxId: cleanTaxId,
          address: editAddress.trim(),
          phone: editPhone.trim() || null,
          bankInfo: editBankInfo.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'แก้ไขข้อมูลบริษัทไม่สำเร็จ');

      setEditingCompany(null);
      fetchCompanies();
      refreshGlobalCompanies();
    } catch (err: any) {
      setEditError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteCompany = async (comp: any) => {
    if (!confirm(`คุณต้องการลบบริษัท "${comp.code}: ${comp.nameTh}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/companies?id=${comp.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      if (editingCompany?.id === comp.id) setEditingCompany(null);
      fetchCompanies();
      refreshGlobalCompanies();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบบริษัท');
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-blue-600" />
            ข้อมูลบริษัทผู้ว่าจ้าง (Multi-Company Setup)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการและแก้ไขข้อมูลนิติบุคคล เลขผู้เสียภาษี 13 หลัก และที่อยู่สำหรับใช้ออกเอกสารและสัญญา
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] self-start"
        >
          <PlusCircle className="w-4 h-4" />
          เพิ่มบริษัทใหม่
        </button>
      </div>

      {/* Companies List Cards */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-medium">กำลังโหลดข้อมูลบริษัท...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map((comp) => (
            <div
              key={comp.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200 shadow-2xs">
                      {comp.code}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {comp._count?.jobs || 0} งานติดตั้ง &bull; {comp._count?.quotations || 0} ใบเสนอราคา
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{comp.nameTh}</h3>
                  {comp.nameEn && <p className="text-xs text-slate-500">{comp.nameEn}</p>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(comp)}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-blue-600 border border-slate-200 transition-colors shadow-2xs"
                    title="แก้ไขข้อมูลบริษัท"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(comp)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-2xs"
                    title="ลบบริษัท"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">เลขประจำตัวผู้เสียภาษี:</span>
                  <span className="font-mono font-bold text-slate-900">{formatThaiIDCard(comp.taxId)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">เบอร์โทรศัพท์:</span>
                  <span className="text-slate-800 font-medium">{comp.phone || '-'}</span>
                </div>

                {comp.bankInfo && (
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>ข้อมูลธนาคาร:</span>
                    <span>{comp.bankInfo}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-[11px] leading-relaxed text-slate-500">
                  <strong className="text-slate-700">ที่อยู่สำนักงาน:</strong> {comp.address}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => openEditModal(comp)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> แก้ไขข้อมูลบริษัท
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                เพิ่มข้อมูลบริษัทผู้ว่าจ้างใหม่
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {addError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {addError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    รหัสบริษัท (Company Code) *
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="เช่น CP3"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>เลขประจำตัวผู้เสียภาษี (13 หลัก) *</span>
                    <span className="font-mono text-[10px] text-slate-400">({taxId.length}/13)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={taxId}
                    onChange={(e) => handleTaxIdChange(e.target.value)}
                    placeholder="0105556012345 (ล็อก 13 ตัว)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อบริษัทภาษาไทย *
                  </label>
                  <input
                    type="text"
                    value={nameTh}
                    onChange={(e) => setNameTh(e.target.value)}
                    placeholder="เช่น บริษัท สยามเดคคอเรชั่น จำกัด"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อบริษัทภาษาอังกฤษ
                  </label>
                  <input
                    type="text"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="เช่น Siam Decoration Co., Ltd."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="02-123-4567"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ข้อมูลบัญชีธนาคาร
                  </label>
                  <input
                    type="text"
                    value={bankInfo}
                    onChange={(e) => setBankInfo(e.target.value)}
                    placeholder="กสิกรไทย 098-1-23456-7"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ที่อยู่สำนักงานใหญ่ (สำหรับออกเอกสาร) *
                  </label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="เลขที่ อาคาร ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {addLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลบริษัท'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                แก้ไขข้อมูลบริษัท ({editingCompany.code})
              </h3>
              <button
                onClick={() => setEditingCompany(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  {editError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    รหัสบริษัท (Company Code) *
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>เลขประจำตัวผู้เสียภาษี (13 หลัก) *</span>
                    <span className="font-mono text-[10px] text-slate-400">({editTaxId.length}/13)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={editTaxId}
                    onChange={(e) => handleEditTaxIdChange(e.target.value)}
                    placeholder="0105556012345 (ล็อก 13 ตัว)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อบริษัทภาษาไทย *
                  </label>
                  <input
                    type="text"
                    value={editNameTh}
                    onChange={(e) => setEditNameTh(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อบริษัทภาษาอังกฤษ
                  </label>
                  <input
                    type="text"
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ข้อมูลบัญชีธนาคาร
                  </label>
                  <input
                    type="text"
                    value={editBankInfo}
                    onChange={(e) => setEditBankInfo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ที่อยู่สำนักงานใหญ่ (สำหรับออกเอกสาร) *
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteCompany(editingCompany)}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบบริษัท
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCompany(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    {editLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

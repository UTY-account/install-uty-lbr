'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  HardHat,
  PlusCircle,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Phone,
  CreditCard,
  Briefcase,
  ChevronRight,
  Upload,
  UserCheck,
  CheckCircle,
  AlertCircle,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';
import { IDCardUploadModal } from '@/components/IDCardUploadModal';
import { formatCurrency, formatThaiIDCard } from '@/lib/utils';

export default function SubcontractorsDirectoryPage() {
  const [subcontractors, setSubcontractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [idCardFilter, setIdCardFilter] = useState('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [selectedSubForVerify, setSelectedSubForVerify] = useState<any | null>(null);

  // New Contractor Form
  const [newName, setNewName] = useState('');
  const [newIdCard, setNewIdCard] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newBankName, setNewBankName] = useState('กสิกรไทย');
  const [newBankAccountNo, setNewBankAccountNo] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Form state
  const [editName, setEditName] = useState('');
  const [editIdCard, setEditIdCard] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBankName, setEditBankName] = useState('');
  const [editBankAccountNo, setEditBankAccountNo] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchSubcontractors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (idCardFilter !== 'all') params.set('idCardStatus', idCardFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/subcontractors?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSubcontractors(data);
      }
    } catch (err) {
      console.error('Failed to load subcontractors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcontractors();
  }, [idCardFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSubcontractors();
  };

  const handleIdCardChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    setNewIdCard(digits);
  };

  const handleEditIdCardChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    setEditIdCard(digits);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newIdCard.replace(/\D/g, '').trim();
    if (cleanId.length !== 13) {
      setAddError('กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก');
      return;
    }

    setAddLoading(true);
    setAddError(null);

    try {
      const res = await fetch('/api/subcontractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCard: cleanId,
          name: newName.trim(),
          phone: newPhone.trim(),
          bankName: newBankName.trim() || undefined,
          bankAccountNo: newBankAccountNo.trim() || undefined,
          bankAccountName: newName.trim(),
          skills: newSkills.trim() || undefined,
          address: newAddress.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เพิ่มช่างไม่สำเร็จ');

      setShowAddModal(false);
      setNewName('');
      setNewIdCard('');
      setNewPhone('');
      setNewBankAccountNo('');
      setNewSkills('');
      setNewAddress('');
      fetchSubcontractors();
    } catch (err: any) {
      setAddError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setAddLoading(false);
    }
  };

  const openEditModal = (sub: any) => {
    setEditingSub(sub);
    setEditName(sub.name);
    setEditIdCard(sub.idCard ? sub.idCard.replace(/\D/g, '').slice(0, 13) : '');
    setEditPhone(sub.phone);
    setEditBankName(sub.bankName || 'กสิกรไทย');
    setEditBankAccountNo(sub.bankAccountNo || '');
    setEditSkills(sub.skills || '');
    setEditAddress(sub.address || '');
    setEditStatus(sub.status || 'ACTIVE');
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;

    const cleanId = editIdCard.replace(/\D/g, '').trim();
    if (cleanId.length !== 13) {
      setEditError('กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/subcontractors/${editingSub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          idCard: cleanId,
          phone: editPhone.trim(),
          bankName: editBankName.trim() || null,
          bankAccountNo: editBankAccountNo.trim() || null,
          bankAccountName: editName.trim(),
          skills: editSkills.trim() || null,
          address: editAddress.trim() || null,
          status: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'แก้ไขข้อมูลช่างไม่สำเร็จ');

      setEditingSub(null);
      fetchSubcontractors();
    } catch (err: any) {
      setEditError(err.message || 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSub = async (sub: any) => {
    if (!confirm(`คุณต้องการลบข้อมูลช่าง "${sub.name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/subcontractors/${sub.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      if (editingSub?.id === sub.id) setEditingSub(null);
      fetchSubcontractors();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบช่าง');
    }
  };

  const totalCount = subcontractors.length;
  const pendingCount = subcontractors.filter((s) => s.idCardStatus === 'PENDING_ATTACHMENT').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <HardHat className="w-7 h-7 text-amber-600" />
            ข้อมูลช่างและผู้รับเหมาช่วง (Subcontractors)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ฐานข้อมูลช่าง แก้ไขข้อมูลส่วนตัว ประวัติการรับงาน บันทึกราคาต่อหน่วย และแนบรูปบัตร ปชช.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] self-start"
        >
          <PlusCircle className="w-4 h-4" />
          เพิ่มช่างใหม่
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อช่าง, เลขบัตร ปชช. 13 หลัก, เบอร์โทร, ความถนัด..."
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg font-bold"
          >
            ค้นหา
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={idCardFilter}
            onChange={(e) => setIdCardFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="all">สถานะบัตร ปชช. ทั้งหมด ({totalCount})</option>
            <option value="PENDING_ATTACHMENT">⚠️ รอแนบรูปบัตร ปชช. ({pendingCount})</option>
            <option value="VERIFIED">✓ ยืนยันตัวตนแล้ว ({totalCount - pendingCount})</option>
          </select>
        </div>
      </div>

      {/* Subcontractor Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-medium">กำลังโหลดข้อมูลช่าง...</div>
      ) : subcontractors.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <HardHat className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">ไม่พบข้อมูลช่าง</h3>
          <p className="text-xs text-slate-500">คุณสามารถเพิ่มช่างใหม่ หรือนำเข้าผ่านไฟล์ Excel ได้</p>
          <div className="pt-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              เพิ่มช่างใหม่
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subcontractors.map((sub) => {
            const isPendingCard = sub.idCardStatus === 'PENDING_ATTACHMENT';

            return (
              <div
                key={sub.id}
                className="rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 p-5 shadow-sm transition-all space-y-4 flex flex-col justify-between"
              >
                {/* Header Profile */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {sub.idCardPhotoUrl ? (
                        <img
                          src={sub.idCardPhotoUrl}
                          alt={sub.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center font-extrabold text-base shadow-2xs">
                          {sub.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 hover:text-blue-600 transition-colors">
                          <Link href={`/subcontractors/${sub.id}`}>{sub.name}</Link>
                        </h3>
                        <p className="font-mono text-xs text-slate-500 font-semibold">
                          {formatThaiIDCard(sub.idCard)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="แก้ไขข้อมูลช่าง"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSub(sub)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบข้อมูลช่าง"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* ID Verification Badge */}
                      {isPendingCard ? (
                        <button
                          onClick={() => setSelectedSubForVerify(sub)}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 hover:bg-amber-100 transition-colors whitespace-nowrap"
                          title="คลิกเพื่อแนบรูปบัตร ปชช."
                        >
                          <ShieldAlert className="w-3 h-3 text-amber-600" />
                          รอแนบรูป
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 whitespace-nowrap">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          ยืนยันแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills / Notes */}
                  {sub.skills && (
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase block font-bold">ความถนัด / ประเภทงาน:</span>
                      {sub.skills}
                    </div>
                  )}

                  {/* Contact & Bank */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{sub.phone}</span>
                    </div>
                    {sub.bankAccountNo && (
                      <div className="flex items-center gap-2 text-blue-700 font-medium">
                        <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                        <span>{sub.bankName} {sub.bankAccountNo}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Summary for this Subcontractor */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold block">สัญญารวม ({sub._count?.contracts || 0} งาน)</span>
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(sub.totalContractValue || 0)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-semibold block">ค้างจ่ายสะสม</span>
                      <span className="font-mono font-extrabold text-amber-700">
                        {formatCurrency(sub.totalPending || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/subcontractors/${sub.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                    >
                      ดูประวัติ 360° &bull; ราคาต่อหน่วย <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => openEditModal(sub)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-bold underline"
                    >
                      แก้ไขข้อมูล
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Subcontractor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                เพิ่มข้อมูลช่างผู้รับเหมาใหม่
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
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อ-นามสกุล ช่าง / ทีมช่าง *
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="เช่น นายสมชาย มีฝีมือ"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>เลขประจำตัวประชาชน (13 หลัก) *</span>
                    <span className="font-mono text-[10px] text-slate-400">({newIdCard.length}/13)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={newIdCard}
                    onChange={(e) => handleIdCardChange(e.target.value)}
                    placeholder="1100400123456 (ล็อก 13 ตัว)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="081-234-5678"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ธนาคารรับเงิน
                  </label>
                  <input
                    type="text"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เลขที่บัญชีธนาคาร
                  </label>
                  <input
                    type="text"
                    value={newBankAccountNo}
                    onChange={(e) => setNewBankAccountNo(e.target.value)}
                    placeholder="123-4-56789-0"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ความถนัด / ประเภทงาน
                  </label>
                  <input
                    type="text"
                    value={newSkills}
                    onChange={(e) => setNewSkills(e.target.value)}
                    placeholder="เช่น งานปูพื้น SPC, ลามิเนต, บัวเชิงผนัง"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ที่อยู่ตามบัตรประชาชน
                  </label>
                  <textarea
                    rows={2}
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="ที่อยู่สำหรับออกเอกสารหัก ณ ที่จ่าย 50 ทวิ"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
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
                  {addLoading ? 'กำลังบันทึก...' : 'บันทึกข้อมูลช่าง'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Subcontractor Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                แก้ไขข้อมูลช่าง ({formatThaiIDCard(editingSub.idCard)})
              </h3>
              <button
                onClick={() => setEditingSub(null)}
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
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ชื่อ-นามสกุล ช่าง / ทีมช่าง *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>เลขประจำตัวประชาชน (13 หลัก) *</span>
                    <span className="font-mono text-[10px] text-slate-400">({editIdCard.length}/13)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={13}
                    value={editIdCard}
                    onChange={(e) => handleEditIdCardChange(e.target.value)}
                    placeholder="1100400123456 (ล็อก 13 ตัว)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เบอร์โทรศัพท์ *
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    สถานะการรับงาน
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value="ACTIVE">● พร้อมรับงาน (Active)</option>
                    <option value="INACTIVE">○ พักงาน / ไม่พร้อมรับงาน (Inactive)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ธนาคารรับเงิน
                  </label>
                  <input
                    type="text"
                    value={editBankName}
                    onChange={(e) => setEditBankName(e.target.value)}
                    placeholder="เช่น กสิกรไทย"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    เลขที่บัญชีธนาคาร
                  </label>
                  <input
                    type="text"
                    value={editBankAccountNo}
                    onChange={(e) => setEditBankAccountNo(e.target.value)}
                    placeholder="123-4-56789-0"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ความถนัด / ประเภทงาน
                  </label>
                  <input
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    ที่อยู่ตามบัตรประชาชน
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteSub(editingSub)}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบช่าง
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingSub(null)}
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

      {/* ID Card Upload Modal */}
      {selectedSubForVerify && (
        <IDCardUploadModal
          subcontractor={selectedSubForVerify}
          onClose={() => setSelectedSubForVerify(null)}
          onSuccess={() => {
            setSelectedSubForVerify(null);
            fetchSubcontractors();
          }}
        />
      )}
    </div>
  );
}

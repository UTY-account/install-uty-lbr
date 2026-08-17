'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  HardHat,
  ShieldCheck,
  ShieldAlert,
  Phone,
  CreditCard,
  Building2,
  Calendar,
  Briefcase,
  TrendingUp,
  FileText,
  Clock,
  PlusCircle,
  Upload,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { IDCardUploadModal } from '@/components/IDCardUploadModal';
import { formatCurrency, formatThaiDate, formatThaiIDCard } from '@/lib/utils';

export default function SubcontractorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const subId = params.id as string;

  const [sub, setSub] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
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

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/subcontractors/${subId}`);
      if (!res.ok) throw new Error('ไม่พบข้อมูลช่าง');
      const data = await res.json();
      setSub(data);

      setEditName(data.name || '');
      setEditIdCard(data.idCard ? data.idCard.replace(/\D/g, '').slice(0, 13) : '');
      setEditPhone(data.phone || '');
      setEditBankName(data.bankName || 'กสิกรไทย');
      setEditBankAccountNo(data.bankAccountNo || '');
      setEditSkills(data.skills || '');
      setEditAddress(data.address || '');
      setEditStatus(data.status || 'ACTIVE');
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subId) fetchProfile();
  }, [subId]);

  const handleEditIdCardChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    setEditIdCard(digits);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = editIdCard.replace(/\D/g, '').trim();
    if (cleanId.length !== 13) {
      setEditError('กรุณากรอกเลขประจำตัวประชาชนให้ครบ 13 หลัก');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/subcontractors/${subId}`, {
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

      setShowEditModal(false);
      fetchProfile();
    } catch (err: any) {
      setEditError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSub = async () => {
    if (!confirm(`คุณต้องการลบข้อมูลช่าง "${sub.name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/subcontractors/${subId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      router.push('/subcontractors');
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบช่าง');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm font-medium">กำลังโหลดโปรไฟล์ช่าง...</div>;
  }

  if (errorMsg || !sub) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">ไม่พบข้อมูลช่าง</h2>
        <Link
          href="/subcontractors"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> กลับหน้ารวมช่าง
        </Link>
      </div>
    );
  }

  const isPendingCard = sub.idCardStatus === 'PENDING_ATTACHMENT';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Back & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/subcontractors"
            className="p-2 rounded-xl bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">โปรไฟล์ผู้รับเหมาช่วง 360°</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {formatThaiIDCard(sub.idCard)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{sub.name}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors"
          >
            <Edit2 className="w-4 h-4 text-blue-600" />
            แก้ไขข้อมูลช่าง
          </button>
          <button
            onClick={handleDeleteSub}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold border border-rose-200 shadow-2xs transition-colors"
            title="ลบข้อมูลช่าง"
          >
            <Trash2 className="w-4 h-4" />
            ลบช่าง
          </button>
          <Link
            href={`/quotations/new?subcontractorId=${sub.id}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            ออกใบเสนอราคาแทนช่าง
          </Link>
        </div>
      </div>

      {/* Profile Card & ID Card Verification */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Avatar & Basic Info */}
        <div className="space-y-4 lg:border-r border-slate-100 lg:pr-6">
          <div className="flex items-start gap-4">
            {sub.idCardPhotoUrl ? (
              <img
                src={sub.idCardPhotoUrl}
                alt={sub.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm cursor-pointer hover:opacity-90"
                onClick={() => setShowVerifyModal(true)}
              />
            ) : (
              <div
                onClick={() => setShowVerifyModal(true)}
                className="w-20 h-20 rounded-2xl bg-amber-100 text-amber-800 border border-amber-200 flex flex-col items-center justify-center cursor-pointer hover:bg-amber-200 transition-colors shadow-2xs"
              >
                <HardHat className="w-8 h-8" />
                <span className="text-[9px] font-bold mt-0.5">แนบรูปบัตร</span>
              </div>
            )}

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                {isPendingCard ? (
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 hover:bg-amber-100 transition-colors"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    รอแนบรูปบัตร ปชช.
                  </button>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    ยืนยันตัวตนแล้ว
                  </span>
                )}
              </div>
              <h2 className="text-base font-extrabold text-slate-900">{sub.name}</h2>
              <div className="font-mono text-xs text-slate-600 font-bold">
                {formatThaiIDCard(sub.idCard)}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{sub.phone}</span>
            </div>
            {sub.bankAccountNo && (
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>
                  {sub.bankName} {sub.bankAccountNo} ({sub.bankAccountName || sub.name})
                </span>
              </div>
            )}
            {sub.address && (
              <div className="text-slate-500 text-[11px] leading-relaxed">
                <strong>ที่อยู่:</strong> {sub.address}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              {sub.idCardPhotoUrl ? 'เปลี่ยนรูปบัตร' : 'แนบรูปบัตร ปชช.'}
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 border border-slate-300 transition-colors shadow-2xs"
              title="แก้ไขข้อมูล"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Center & Right: Financial KPI Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-bold uppercase">สัญญารวมทั้งหมด</span>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {formatCurrency(sub.totalContractValue || 0)}
              </div>
              <span className="text-[10px] text-slate-400">{sub.contracts?.length || 0} สัญญาจ้าง</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-bold uppercase">เบิกจ่ายสะสมแล้ว</span>
              <div className="text-xl font-extrabold text-emerald-700 font-mono">
                {formatCurrency(sub.totalPaid || 0)}
              </div>
              <span className="text-[10px] text-slate-400">โอนสุทธิครบถ้วน</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-[11px] text-slate-500 font-bold uppercase">ยอดคงเหลือค้างจ่าย</span>
              <div className="text-xl font-extrabold text-amber-700 font-mono">
                {formatCurrency(sub.totalPending || 0)}
              </div>
              <span className="text-[10px] text-slate-400">ยังไม่ถึงงวด/รอส่งมอบ</span>
            </div>
          </div>

          {/* Skills & Notes */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              ความถนัด / บันทึกการทำงาน
            </span>
            <p className="text-slate-800 leading-relaxed font-medium">
              {sub.skills || 'ไม่ได้ระบุความถนัด'}
            </p>
            {sub.notes && (
              <p className="text-slate-500 text-[11px] italic pt-1 border-t border-slate-200">
                หมายเหตุ: {sub.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Unit Rate History Timeline */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              ประวัติราคาค่าแรงต่อหน่วยของช่างคนนี้ (Unit Rate History)
            </h3>
            <p className="text-xs text-slate-500">
              บันทึกราคาต่อหน่วยจากแต่ละงานที่ผ่านมา เพื่อใช้อ้างอิงและคำนวณราคาอัตโนมัติ
            </p>
          </div>
          <Link
            href="/price-benchmark"
            className="text-xs font-bold text-purple-700 hover:text-purple-900"
          >
            เปรียบเทียบกับช่างคนอื่น →
          </Link>
        </div>

        {sub.rateHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ยังไม่มีประวัติการบันทึกราคาต่อหน่วย
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3.5 w-36">รหัสรายการ</th>
                  <th className="py-2.5 px-3.5">ชื่องาน</th>
                  <th className="py-2.5 px-3.5 text-right w-28">ราคาต่อหน่วย</th>
                  <th className="py-2.5 px-3.5 text-center w-20">หน่วย</th>
                  <th className="py-2.5 px-3.5 w-44">งานที่บันทึก</th>
                  <th className="py-2.5 px-3.5 w-32">วันที่บันทึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sub.rateHistory.map((rh: any) => (
                  <tr key={rh.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3.5 font-mono font-bold text-purple-700">
                      {rh.item.code}
                    </td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-900">{rh.item.name}</td>
                    <td className="py-2.5 px-3.5 text-right font-mono font-bold text-emerald-700">
                      {formatCurrency(rh.unitRate)}
                    </td>
                    <td className="py-2.5 px-3.5 text-center text-slate-500 font-medium">{rh.item.unit}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 truncate max-w-xs font-medium">
                      {rh.jobTitle || rh.jobCode || '-'}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500">{formatThaiDate(rh.recordedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: All Contracts History */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          ประวัติสัญญาจ้างงานทั้งหมด ({sub.contracts.length} สัญญา)
        </h3>

        {sub.contracts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ยังไม่มีประวัติสัญญาจ้าง
          </div>
        ) : (
          <div className="space-y-3">
            {sub.contracts.map((c: any) => {
              const netContract = c.totalContractAmount + c.extraAmount - c.deductAmount;
              const paid = c.payments
                .filter((p: any) => p.status === 'PAID')
                .reduce((sum: number, p: any) => sum + p.amount, 0);
              const remaining = Math.max(0, netContract - paid);

              return (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200 shadow-2xs">
                        {c.contractCode}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {c.job.company.code} &bull; {c.job.jobCode}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      <Link href={`/jobs/${c.job.id}`} className="hover:text-blue-600">
                        {c.job.title}
                      </Link>
                    </h4>
                    <div className="text-xs text-slate-500 font-medium">
                      {c.items.length} รายการย่อย &bull; วันที่ {formatThaiDate(c.contractDate)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-left sm:text-right text-xs">
                      <div className="text-slate-500">ยอดสัญญา: <strong className="text-slate-900 font-mono font-bold">{formatCurrency(netContract)}</strong></div>
                      <div className="text-slate-500">จ่ายแล้ว: <strong className="text-emerald-700 font-mono font-bold">{formatCurrency(paid)}</strong></div>
                      <div className="text-slate-500">ค้างจ่าย: <strong className="text-amber-700 font-mono font-extrabold">{formatCurrency(remaining)}</strong></div>
                    </div>

                    <Link
                      href={`/jobs/${c.job.id}`}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs"
                    >
                      ดูงาน →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: Work Schedule & Site Queue */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              ตารางคิวงานเข้าหน้างานของช่าง ({sub.schedules?.length || 0} รายการ)
            </h3>
            <p className="text-xs text-slate-500">
              วันนัดหมายเข้าหน้างาน ติดตามความคืบหน้า และป้องกันการนัดคิวงานซ้ำซ้อน
            </p>
          </div>
          <Link
            href={`/schedule?subcontractorId=${sub.id}`}
            className="text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            เปิดปฏิทินงานรวม →
          </Link>
        </div>

        {(!sub.schedules || sub.schedules.length === 0) ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ยังไม่มีรายการนัดหมายเข้าหน้างานสำหรับช่างคนนี้
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-2.5 px-3.5 w-32 whitespace-nowrap">วันที่เข้างาน</th>
                  <th className="py-2.5 px-3.5">ชื่องาน / กิจกรรม</th>
                  <th className="py-2.5 px-3.5 w-44 whitespace-nowrap">โครงการ</th>
                  <th className="py-2.5 px-3.5 text-center w-32 whitespace-nowrap">ความคืบหน้า</th>
                  <th className="py-2.5 px-3.5 text-center w-28 whitespace-nowrap">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sub.schedules.map((sc: any) => {
                  let statusBg = 'bg-slate-100 text-slate-700 border-slate-200';
                  let statusText = '⚪ วางแผนแล้ว';
                  if (sc.status === 'IN_PROGRESS') {
                    statusBg = 'bg-blue-50 text-blue-800 border-blue-200';
                    statusText = '● กำลังทำงาน';
                  } else if (sc.status === 'COMPLETED') {
                    statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    statusText = '✓ เสร็จสิ้น';
                  } else if (sc.status === 'DELAYED') {
                    statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
                    statusText = '⚠️ ติดปัญหา';
                  }

                  return (
                    <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3.5 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {formatThaiDate(sc.startDate)}
                        {sc.startDate !== sc.endDate && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ถึง {formatThaiDate(sc.endDate)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 leading-snug">{sc.title}</div>
                        {sc.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{sc.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <Link
                          href={`/jobs/${sc.job.id}`}
                          className="font-semibold text-blue-600 hover:underline block truncate max-w-[160px]"
                        >
                          {sc.job.title}
                        </Link>
                        <span className="text-[10px] font-mono text-slate-400">
                          {sc.job.company?.code} &bull; {sc.job.jobCode}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className="font-mono font-bold text-blue-700">{sc.progressPercent}%</span>
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBg}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Subcontractor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                แก้ไขข้อมูลช่าง ({formatThaiIDCard(sub.idCard)})
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
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
                  onClick={handleDeleteSub}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบช่าง
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
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
      {showVerifyModal && (
        <IDCardUploadModal
          subcontractor={sub}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={() => {
            setShowVerifyModal(false);
            fetchProfile();
          }}
        />
      )}
    </div>
  );
}

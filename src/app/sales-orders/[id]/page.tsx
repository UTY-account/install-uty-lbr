'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Wrench,
  PauseCircle,
  XCircle,
  Clock,
  Briefcase,
  HardHat,
  CreditCard,
  Layers,
  AlertTriangle,
  History,
} from 'lucide-react';
import DatePicker from '@/components/DatePicker';
import { formatCurrency, formatDate, formatISODate, getSOStatusInfo } from '@/lib/utils';

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [salesOrder, setSalesOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [onHoldModalOpen, setOnHoldModalOpen] = useState(false);
  const [onHoldReasonText, setOnHoldReasonText] = useState('');

  const [phaseModalOpen, setPhaseModalOpen] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState('');
  const [newPhaseStart, setNewPhaseStart] = useState('');
  const [newPhaseEnd, setNewPhaseEnd] = useState('');

  const [defectModalOpen, setDefectModalOpen] = useState(false);
  const [defectTitle, setDefectTitle] = useState('');
  const [defectDesc, setDefectDesc] = useState('');
  const [defectSeverity, setDefectSeverity] = useState('NORMAL');
  const [defectAction, setDefectAction] = useState('FIX_BY_ORIGINAL');
  const [defectDeductAmount, setDefectDeductAmount] = useState(0);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReasonText, setCancelReasonText] = useState('');
  const [cancelWorkDonePercent, setCancelWorkDonePercent] = useState(0);

  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [lineMessageText, setLineMessageText] = useState('');
  const [lineShareUrl, setLineShareUrl] = useState('');

  const fetchSODetail = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/sales-orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSalesOrder(data);
        setNewStartDate(formatISODate(data.targetInstallDate));
        setNewEndDate(formatISODate(data.targetFinishDate));
      } else {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || 'ไม่พบข้อมูลคำสั่งขายนี้');
      }
    } catch (err: any) {
      console.error('Error fetching SO detail:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchSODetail();
  }, [id]);

  // Handle Reschedule
  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/sales-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetInstallDate: newStartDate,
          targetFinishDate: newEndDate,
          rescheduleReason: rescheduleReason || 'ปรับตามคิวงาน/หน้างาน',
        }),
      });
      if (res.ok) {
        setRescheduleModalOpen(false);
        setRescheduleReason('');
        fetchSODetail();
      }
    } catch (err) {
      console.error('Reschedule error:', err);
    }
  };

  // Handle Set On-Hold
  const handleSaveOnHold = async () => {
    try {
      const res = await fetch(`/api/sales-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ON_HOLD',
          onHoldReason: onHoldReasonText || 'หน้างานไม่พร้อมเข้าทำงาน',
        }),
      });
      if (res.ok) {
        setOnHoldModalOpen(false);
        setOnHoldReasonText('');
        fetchSODetail();
      }
    } catch (err) {
      console.error('On-Hold error:', err);
    }
  };

  // Handle Add Next Phase
  const handleAddPhase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/sales-orders/${id}/phases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPhaseTitle,
          startDate: newPhaseStart,
          endDate: newPhaseEnd,
        }),
      });
      if (res.ok) {
        setPhaseModalOpen(false);
        setNewPhaseTitle('');
        setNewPhaseStart('');
        setNewPhaseEnd('');
        fetchSODetail();
      }
    } catch (err) {
      console.error('Add phase error:', err);
    }
  };

  // Handle Add Defect Ticket
  const handleAddDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/sales-orders/${id}/defects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: defectTitle,
          description: defectDesc,
          severity: defectSeverity,
          actionType: defectAction,
          deductAmount: defectDeductAmount,
        }),
      });
      if (res.ok) {
        setDefectModalOpen(false);
        setDefectTitle('');
        setDefectDesc('');
        setDefectDeductAmount(0);
        fetchSODetail();
      }
    } catch (err) {
      console.error('Add defect error:', err);
    }
  };

  // Handle Cancel SO
  const handleSaveCancel = async () => {
    try {
      const res = await fetch(`/api/sales-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CANCELLED',
          cancelReason: cancelReasonText || 'ลูกค้ายกเลิกงาน',
          cancelSettlement: {
            workDonePercent: cancelWorkDonePercent,
            settledAt: new Date().toISOString(),
          },
        }),
      });
      if (res.ok) {
        setCancelModalOpen(false);
        fetchSODetail();
      }
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  const [lineGroups, setLineGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [hasBotToken, setHasBotToken] = useState(false);
  const [isPushingLine, setIsPushingLine] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);

  // Generate LINE message and load groups
  const handleOpenLineModal = async () => {
    if (!salesOrder) return;
    setPushStatusMsg(null);
    try {
      const contractorName = salesOrder.quotations?.[0]?.subcontractor?.name || salesOrder.jobs?.[0]?.subContracts?.[0]?.subcontractor?.name || '';
      const contractorPhone = salesOrder.quotations?.[0]?.subcontractor?.phone || salesOrder.jobs?.[0]?.subContracts?.[0]?.subcontractor?.phone || '';
      const itemsSummary = salesOrder.items?.map((it: any) => `${it.itemName} (${it.quantity} ${it.unit})`).join(', ');

      const [notifyRes, groupsRes, settingsRes] = await Promise.all([
        fetch('/api/notify/line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: salesOrder.company?.nameTh || 'บริษัท ลัมเบอเรอร์ จำกัด',
            soNumber: salesOrder.soNumber,
            customerName: salesOrder.customerName,
            customerPhone: salesOrder.customerPhone,
            siteLocation: salesOrder.siteLocation,
            googleMapsUrl: salesOrder.googleMapsUrl,
            targetInstallDate: salesOrder.targetInstallDate,
            targetFinishDate: salesOrder.targetFinishDate,
            taggedStaff: salesOrder.taggedStaff,
            contractorName,
            contractorPhone,
            itemsSummary,
          }),
        }),
        fetch('/api/line-groups'),
        fetch('/api/settings/line'),
      ]);

      if (notifyRes.ok) {
        const data = await notifyRes.json();
        setLineShareUrl(data.lineShareUrl);
        setLineMessageText(data.message);
      }

      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setHasBotToken(sData.isConnected);
      }

      if (groupsRes.ok) {
        const gData = await groupsRes.json();
        setLineGroups(gData);
        // Pre-select default groups
        const defaultIds = gData.filter((g: any) => g.isDefault).map((g: any) => g.id);
        setSelectedGroupIds(defaultIds.length > 0 ? defaultIds : gData.map((g: any) => g.id));
      }

      setLineModalOpen(true);
    } catch (err) {
      console.error('LINE notification error:', err);
    }
  };

  // Auto Push to Selected Groups
  const handleAutoPushLine = async () => {
    if (selectedGroupIds.length === 0) {
      alert('กรุณาเลือกกลุ่มไลน์อย่างน้อย 1 กลุ่ม');
      return;
    }
    try {
      setIsPushingLine(true);
      setPushStatusMsg(null);

      const contractorName = salesOrder.quotations?.[0]?.subcontractor?.name || salesOrder.jobs?.[0]?.subContracts?.[0]?.subcontractor?.name || '';
      const contractorPhone = salesOrder.quotations?.[0]?.subcontractor?.phone || salesOrder.jobs?.[0]?.subContracts?.[0]?.subcontractor?.phone || '';
      const itemsSummary = salesOrder.items?.map((it: any) => `${it.itemName} (${it.quantity} ${it.unit})`).join(', ');

      const res = await fetch('/api/notify/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: salesOrder.company?.nameTh || 'บริษัท ลัมเบอเรอร์ จำกัด',
          soNumber: salesOrder.soNumber,
          customerName: salesOrder.customerName,
          customerPhone: salesOrder.customerPhone,
          siteLocation: salesOrder.siteLocation,
          googleMapsUrl: salesOrder.googleMapsUrl,
          targetInstallDate: salesOrder.targetInstallDate,
          targetFinishDate: salesOrder.targetFinishDate,
          taggedStaff: salesOrder.taggedStaff,
          contractorName,
          contractorPhone,
          itemsSummary,
          selectedGroupIds,
        }),
      });

      const data = await res.json();
      if (res.ok && data.autoPushSuccessCount > 0) {
        setPushStatusMsg(`✅ ส่งข้อความเข้า ${data.autoPushSuccessCount} กลุ่มเรียบร้อยแล้ว!`);
      } else {
        const errorDetail = data.pushResults?.find((r: any) => !r.success)?.error || data.error || 'กรุณาตรวจสอบ Channel Access Token และ Group ID';
        setPushStatusMsg(`⚠️ ส่งไม่สำเร็จ: ${errorDetail}`);
      }
    } catch (err: any) {
      setPushStatusMsg(`❌ เกิดข้อผิดพลาด: ${err.message}`);
    } finally {
      setIsPushingLine(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">กำลังโหลดข้อมูลคำสั่งขาย...</p>
      </div>
    );
  }

  if (!salesOrder) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-base font-bold text-slate-900">{errorMsg || 'ไม่พบข้อมูลคำสั่งขายนี้'}</h2>
        <Link href="/sales-orders" className="text-xs font-bold text-blue-600 hover:underline">
          กลับไปหน้ารายการ SO
        </Link>
      </div>
    );
  }

  const statusInfo = getSOStatusInfo(salesOrder.status);
  const rescheduleHistoryList = (() => {
    try {
      return JSON.parse(salesOrder.rescheduleHistory || '[]');
    } catch (_) {
      return [];
    }
  })();

  const taggedList = (() => {
    try {
      return JSON.parse(salesOrder.taggedStaff || '[]');
    } catch (_) {
      return [];
    }
  })();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/sales-orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปหน้ารายการ SO</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenLineModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 shadow-2xs transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>แชร์ LINE</span>
          </button>

          <Link
            href={`/quotations/new?soId=${salesOrder.id}&companyId=${salesOrder.companyId}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ ออกใบเสนอราคาช่าง (40-40-20)</span>
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {salesOrder.soNumber}
                </h1>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${
                    salesOrder.company?.code === 'LBR'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {salesOrder.company?.code || 'LBR'}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                เปิด SO เมื่อ: <strong>{formatDate(salesOrder.createdAt)}</strong> | เซล:{' '}
                <strong>{salesOrder.salesPerson || '-'}</strong>
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setRescheduleModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>เลื่อนวันนัดหมาย</span>
            </button>

            {salesOrder.status !== 'ON_HOLD' ? (
              <button
                onClick={() => setOnHoldModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 transition-colors flex items-center gap-1.5"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>พักงาน (On-Hold)</span>
              </button>
            ) : (
              <button
                onClick={() => setPhaseModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+ นัดหมายรอบถัดไป (ปลด On-Hold)</span>
              </button>
            )}

            {salesOrder.status !== 'CANCELLED' && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>ยกเลิกงาน</span>
              </button>
            )}
          </div>
        </div>

        {/* On-Hold Alert Box */}
        {salesOrder.status === 'ON_HOLD' && (
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-orange-600" />
              <span>งานนี้อยู่ในสถานะพักงาน (On-Hold):</span>
            </div>
            <p className="pl-6 text-orange-800">{salesOrder.onHoldReason || 'รอหน้างานพร้อม'}</p>
          </div>
        )}

        {/* Cancelled Alert Box */}
        {salesOrder.status === 'CANCELLED' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>งานนี้ถูกยกเลิก (Cancelled):</span>
            </div>
            <p className="pl-6 text-rose-800">สาเหตุ: {salesOrder.cancelReason || '-'}</p>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 text-xs">
          {/* Customer & Location */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>ข้อมูลลูกค้า & สถานที่</span>
            </h3>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong>ชื่อ:</strong> {salesOrder.customerName}
              </p>
              {salesOrder.customerPhone && (
                <p>
                  <strong>โทร:</strong> {salesOrder.customerPhone}
                </p>
              )}
              <p>
                <strong>สถานที่:</strong> {salesOrder.siteLocation}
              </p>
              {salesOrder.googleMapsUrl && (
                <div className="pt-1">
                  <a
                    href={salesOrder.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-colors"
                  >
                    <span>🧭 นำทาง Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Dates & Staff */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              <span>กำหนดการ & ทีมงานที่แท็ก</span>
            </h3>
            <div className="space-y-1 text-slate-700">
              <p>
                <strong>วันเริ่มติดตั้ง:</strong>{' '}
                {salesOrder.targetInstallDate ? formatDate(salesOrder.targetInstallDate) : '-'}
              </p>
              <p>
                <strong>วันคาดว่าจะเสร็จ:</strong>{' '}
                {salesOrder.targetFinishDate ? formatDate(salesOrder.targetFinishDate) : '-'}
              </p>
              <div className="pt-1.5">
                <span className="font-bold text-slate-700 block mb-1">ทีมงานที่แท็ก:</span>
                <div className="flex flex-wrap gap-1.5">
                  {taggedList.length === 0 ? (
                    <span className="text-slate-400 italic">ยังไม่ได้แท็ก</span>
                  ) : (
                    taggedList.map((st: any, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold border border-slate-200 text-[10px]"
                      >
                        {st.name} ({st.role})
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Financial summary */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>สรุปยอดขายงานติดตั้ง</span>
            </h3>
            <div className="space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>ยอดรวมงานขาย:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(salesOrder.totalAmount)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                จำนวนรายการ: <strong>{salesOrder.items?.length || 0} รายการ</strong>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reschedule History Timeline (If Any) */}
      {rescheduleHistoryList.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-3">
          <h3 className="text-xs font-extrabold text-amber-900 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-700" />
            <span>ประวัติการเลื่อนวันนัดหมาย ({rescheduleHistoryList.length} ครั้ง)</span>
          </h3>
          <div className="space-y-2">
            {rescheduleHistoryList.map((h: any, i: number) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
              >
                <div>
                  เลื่อนจาก <strong>{h.from}</strong> เป็น <strong>{h.to}</strong>
                  <span className="text-amber-800 ml-2">({h.reason})</span>
                </div>
                <div className="text-[10px] text-amber-700 font-medium">
                  {formatDate(h.rescheduledAt, true)} โดย {h.rescheduledBy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-Phase Site Visits Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>รอบการเข้าทำงานย่อย (Multi-Phase Site Visits)</span>
            </h2>
            <p className="text-xs text-slate-500">
              สำหรับงานที่เข้าทำหลายรอบ หรือต้องพักรอหน้างานพร้อม (On-Hold)
            </p>
          </div>
          <button
            onClick={() => setPhaseModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ นัดรอบเข้างานใหม่</span>
          </button>
        </div>

        {salesOrder.phases?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">ยังไม่มีการบันทึกรอบเข้างาน</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {salesOrder.phases.map((ph: any) => (
              <div
                key={ph.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-900">{ph.title}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-slate-200 text-slate-700">
                    {ph.status}
                  </span>
                </div>
                <p className="text-slate-600">
                  📅 <strong>{formatDate(ph.startDate)}</strong> ถึง{' '}
                  <strong>{formatDate(ph.endDate)}</strong>
                </p>
                {ph.notes && <p className="text-slate-500 text-[11px]">{ph.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subcontractor Quotations & Subcontracts Bound */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <HardHat className="w-4 h-4 text-amber-600" />
              <span>ช่าง & ใบเสนอราคาที่ผูกกับ SO นี้ (3 งวด: 40% - 40% - 20%)</span>
            </h2>
            <p className="text-xs text-slate-500">
              1 SO สามารถออกใบเสนอราคาให้ช่างได้หลายคนแยกตามหมวดงาน
            </p>
          </div>
          <Link
            href={`/quotations/new?soId=${salesOrder.id}&companyId=${salesOrder.companyId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ ออกใบเสนอราคาช่างเพิ่ม</span>
          </Link>
        </div>

        {salesOrder.quotations?.length === 0 && salesOrder.jobs?.length === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-amber-50/50 border border-amber-200 text-xs text-amber-800 space-y-2">
            <p className="font-bold">⚠️ ยังไม่มีการออกใบเสนอราคาช่างสำหรับ SO นี้</p>
            <p className="text-slate-500">
              กดปุ่ม <strong>"+ ออกใบเสนอราคาช่าง"</strong> เพื่อดึงข้อมูล SO ไปสร้างใบเสนอราคาพร้อมงวด 40-40-20 ให้อัตโนมัติ
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {salesOrder.quotations?.map((q: any) => (
              <div
                key={q.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">{q.quotationNo}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      ใบเสนอราคาช่าง ({q.status})
                    </span>
                  </div>
                  <p className="text-slate-600">
                    👷 ช่าง: <strong>{q.subcontractor?.name}</strong> | ยอดสุทธิ:{' '}
                    <strong className="text-slate-900 font-mono">
                      {formatCurrency(q.grandTotal)}
                    </strong>
                  </p>
                </div>
                <Link
                  href={`/quotations/${q.id}`}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-center"
                >
                  ดูใบเสนอราคา
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Defect Tickets Section */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-rose-600" />
              <span>ระบบงานแก้ไข & เก็บงานหลังส่งมอบ (Defect Tickets)</span>
            </h2>
            <p className="text-xs text-slate-500">
              ล็อกเงินงวด 3 (20%) ไว้จนกว่าจะตรวจรับงานแก้ไขเรียบร้อย
            </p>
          </div>
          <button
            onClick={() => setDefectModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ แจ้งงานแก้ไข (Defect)</span>
          </button>
        </div>

        {salesOrder.defects?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">ไม่มีรายการงานแก้ไข</p>
        ) : (
          <div className="space-y-2">
            {salesOrder.defects.map((df: any) => (
              <div
                key={df.id}
                className="p-4 rounded-2xl border border-rose-100 bg-rose-50/40 text-xs space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-rose-950">🛠️ {df.title}</span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-rose-200 text-rose-700">
                    {df.status}
                  </span>
                </div>
                {df.description && <p className="text-slate-600">{df.description}</p>}
                <div className="text-[11px] text-slate-500 flex flex-wrap gap-4 pt-1">
                  <span>รูปแบบ: <strong>{df.actionType}</strong></span>
                  {df.deductAmount > 0 && (
                    <span className="text-rose-700 font-bold">
                      หักเงินช่างเดิม: {formatCurrency(df.deductAmount)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span>เลื่อนวันนัดหมายติดตั้ง</span>
            </h3>

            <form onSubmit={handleSaveReschedule} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  วันที่เริ่มใหม่ (DD/MM/YYYY) *
                </label>
                <DatePicker value={newStartDate} onChange={setNewStartDate} required />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  วันที่คาดว่าจะแล้วเสร็จ (DD/MM/YYYY)
                </label>
                <DatePicker value={newEndDate} onChange={setNewEndDate} />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  สาเหตุการเลื่อนวัน *
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder="เช่น ลูกค้าขอเลื่อน, หน้างานยังไม่แห้ง, ช่างติดคิวงานอื่น"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  บันทึกการเลื่อนวัน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* On-Hold Modal */}
      {onHoldModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PauseCircle className="w-5 h-5 text-orange-600" />
              <span>พักงานชั่วคราว (On-Hold)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ระบุสาเหตุที่ต้องพักงาน:
                </label>
                <textarea
                  value={onHoldReasonText}
                  onChange={(e) => setOnHoldReasonText(e.target.value)}
                  rows={3}
                  placeholder="เช่น รอผู้รับเหมาเจ้าอื่นทาสีเสร็จ, หน้างานมีปัญหาน้ำรั่ว..."
                  className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setOnHoldModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveOnHold}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
                >
                  ยืนยันพักงาน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Next Phase Modal */}
      {phaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              <span>นัดหมายรอบเข้างานถัดไป</span>
            </h3>

            <form onSubmit={handleAddPhase} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ชื่องานในรอบนี้:
                </label>
                <input
                  type="text"
                  value={newPhaseTitle}
                  onChange={(e) => setNewPhaseTitle(e.target.value)}
                  placeholder="เช่น รอบที่ 2: ติดตั้งบัวและเก็บสีรอบห้อง"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  วันที่เริ่มรอบนี้ (DD/MM/YYYY) *
                </label>
                <DatePicker value={newPhaseStart} onChange={setNewPhaseStart} required />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  วันที่คาดว่าจะเสร็จ (DD/MM/YYYY)
                </label>
                <DatePicker value={newPhaseEnd} onChange={setNewPhaseEnd} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPhaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  บันทึกรอบเข้างาน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Defect Modal */}
      {defectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-rose-600" />
              <span>เปิดใบแจ้งซ่อม / เก็บงาน (Defect)</span>
            </h3>

            <form onSubmit={handleAddDefect} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  หัวข้อจุดที่ต้องแก้ไข *
                </label>
                <input
                  type="text"
                  value={defectTitle}
                  onChange={(e) => setDefectTitle(e.target.value)}
                  placeholder="เช่น ไม้โก่งตัวบริเวณหน้าห้องน้ำ, บัวหลุด"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  value={defectDesc}
                  onChange={(e) => setDefectDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">แนวทางดำเนินการ</label>
                  <select
                    value={defectAction}
                    onChange={(e) => setDefectAction(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300"
                  >
                    <option value="FIX_BY_ORIGINAL">ช่างเดิมแก้ฟรีในประกัน</option>
                    <option value="HIRE_NEW_DEDUCT">จ้างช่างใหม่ (หักเงินช่างเดิม)</option>
                    <option value="EXTRA_CHARGE">ลูกค้าสั่งเพิ่ม (คิดเงินเพิ่ม)</option>
                  </select>
                </div>

                {defectAction === 'HIRE_NEW_DEDUCT' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      ยอดหักเงินช่างเดิม (฿)
                    </label>
                    <input
                      type="number"
                      value={defectDeductAmount}
                      onChange={(e) => setDefectDeductAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-mono font-bold text-rose-700"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDefectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  บันทึกแจ้งซ่อม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Job Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <span>ขอยกเลิกงานติดตั้งนี้</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">สาเหตุการยกเลิกงาน *</label>
                <textarea
                  value={cancelReasonText}
                  onChange={(e) => setCancelReasonText(e.target.value)}
                  rows={3}
                  placeholder="เช่น ลูกค้าเปลี่ยนใจยกเลิกโครงการ..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCancelModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  ปิด
                </button>
                <button
                  onClick={handleSaveCancel}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  ยืนยันยกเลิกงาน
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LINE Broadcast Modal */}
      {lineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  ส่งแจ้งเตือนเข้า LINE กลุ่ม
                </h3>
              </div>
              <button onClick={() => setLineModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            {/* Target Groups Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>เลือกกลุ่มไลน์ที่ต้องการส่ง ({selectedGroupIds.length}/{lineGroups.length} กลุ่ม):</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedGroupIds.length === lineGroups.length) setSelectedGroupIds([]);
                      else setSelectedGroupIds(lineGroups.map((g) => g.id));
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    {selectedGroupIds.length === lineGroups.length ? 'ยกเลิกทั้งหมด' : 'เลือกทุกกลุ่ม'}
                  </button>
                  <span className="text-slate-300">|</span>
                  <Link href="/settings/line" className="text-[11px] font-bold text-emerald-600 hover:underline">
                    ⚙️ จัดการกลุ่ม
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                {lineGroups.map((g) => {
                  const isChecked = selectedGroupIds.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedGroupIds([...selectedGroupIds, g.id]);
                          else setSelectedGroupIds(selectedGroupIds.filter((id) => id !== g.id));
                        }}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="truncate">{g.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Message Preview */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                ตัวอย่างข้อความที่จะส่ง:
              </label>
              <textarea
                value={lineMessageText}
                readOnly
                rows={6}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
              />
            </div>

            {/* Push Status Feedback */}
            {pushStatusMsg && (
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-900">
                {pushStatusMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {hasBotToken ? (
                <button
                  onClick={handleAutoPushLine}
                  disabled={isPushingLine || selectedGroupIds.length === 0}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isPushingLine
                      ? 'กำลังยิงข้อความเข้า LINE...'
                      : `⚡ ส่งข้อความเข้า ${selectedGroupIds.length} กลุ่มที่เลือกอัตโนมัติ`}
                  </span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                    <span>💡 ยังไม่ได้เชื่อมต่อ LINE Bot Token (สามารถส่งผ่านแอป LINE ด้านล่างนี้)</span>
                    <Link href="/settings/line" className="font-bold text-amber-900 underline">
                      ตั้งค่า Bot
                    </Link>
                  </div>
                  <a
                    href={lineShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>🟢 เปิดแชร์ใน LINE (เลือกหลายกลุ่มได้)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="flex justify-between items-center text-[11px] pt-1 text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(lineMessageText);
                    alert('คัดลอกข้อความแล้ว!');
                  }}
                  className="font-bold hover:text-slate-800 underline"
                >
                  📋 คัดลอกข้อความ
                </button>
                {hasBotToken && (
                  <a
                    href={lineShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-500 hover:text-emerald-700 underline"
                  >
                    เปิดแชร์ผ่านแอป LINE แทน
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

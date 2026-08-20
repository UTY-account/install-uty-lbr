'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Building2,
  Calendar,
  MapPin,
  Phone,
  User,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
  Wrench,
  PauseCircle,
  XCircle,
  Sparkles,
  ArrowUpRight,
  Filter,
  Trash2,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';
import { formatCurrency, formatDate, getSOStatusInfo } from '@/lib/utils';

export default function SalesOrdersPage() {
  const { selectedCompanyCode, selectedCompany, isConsolidated, companies } = useCompany();
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [lineModalOpen, setLineModalOpen] = useState(false);
  const [selectedSOForLine, setSelectedSOForLine] = useState<any>(null);
  const [lineShareUrl, setLineShareUrl] = useState('');
  const [lineMessageText, setLineMessageText] = useState('');

  const fetchSalesOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (!isConsolidated && selectedCompany?.id) {
        params.set('companyId', selectedCompany.id);
      }
      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }
      if (search.trim()) {
        params.set('search', search.trim());
      }

      const res = await fetch(`/api/sales-orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSalesOrders(data);
      }
    } catch (error) {
      console.error('Failed to load sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesOrders();
  }, [selectedCompanyCode, statusFilter, search]);

  // Counts for pipeline tabs
  const stats = useMemo(() => {
    return {
      all: salesOrders.length,
      pending: salesOrders.filter((s) => s.status === 'PENDING_CONTRACTOR').length,
      sourcing: salesOrders.filter((s) => s.status === 'SOURCING').length,
      confirmed: salesOrders.filter((s) => s.status === 'CONFIRMED').length,
      inProgress: salesOrders.filter((s) => s.status === 'IN_PROGRESS').length,
      onHold: salesOrders.filter((s) => s.status === 'ON_HOLD').length,
      defect: salesOrders.filter((s) => s.status === 'DEFECT_FIXING').length,
      completed: salesOrders.filter((s) => s.status === 'COMPLETED').length,
    };
  }, [salesOrders]);

  const [lineGroups, setLineGroups] = useState<any[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [hasBotToken, setHasBotToken] = useState(false);
  const [isPushingLine, setIsPushingLine] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState<string | null>(null);

  const handleOpenLineShare = async (so: any) => {
    setSelectedSOForLine(so);
    setPushStatusMsg(null);
    try {
      const contractorName = so.quotations?.[0]?.subcontractor?.name || so.jobs?.[0]?.subContracts?.[0]?.subcontractor?.name || '';
      const contractorPhone = so.quotations?.[0]?.subcontractor?.phone || so.jobs?.[0]?.subContracts?.[0]?.subcontractor?.phone || '';
      const itemsSummary = so.items?.map((it: any) => `${it.itemName} (${it.quantity} ${it.unit})`).join(', ');

      const [notifyRes, groupsRes, settingsRes] = await Promise.all([
        fetch('/api/notify/line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: so.company?.nameTh || 'บริษัท ลัมเบอเรอร์ จำกัด',
            soNumber: so.soNumber,
            customerName: so.customerName,
            customerPhone: so.customerPhone,
            siteLocation: so.siteLocation,
            googleMapsUrl: so.googleMapsUrl,
            targetInstallDate: so.targetInstallDate,
            targetFinishDate: so.targetFinishDate,
            taggedStaff: so.taggedStaff,
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
        const defaultIds = gData.filter((g: any) => g.isDefault).map((g: any) => g.id);
        setSelectedGroupIds(defaultIds.length > 0 ? defaultIds : gData.map((g: any) => g.id));
      }

      setLineModalOpen(true);
    } catch (err) {
      console.error('Error generating LINE share:', err);
    }
  };

  const handleAutoPushLine = async () => {
    if (!selectedSOForLine || selectedGroupIds.length === 0) {
      alert('กรุณาเลือกกลุ่มไลน์อย่างน้อย 1 กลุ่ม');
      return;
    }
    try {
      setIsPushingLine(true);
      setPushStatusMsg(null);

      const so = selectedSOForLine;
      const contractorName = so.quotations?.[0]?.subcontractor?.name || so.jobs?.[0]?.subContracts?.[0]?.subcontractor?.name || '';
      const contractorPhone = so.quotations?.[0]?.subcontractor?.phone || so.jobs?.[0]?.subContracts?.[0]?.subcontractor?.phone || '';
      const itemsSummary = so.items?.map((it: any) => `${it.itemName} (${it.quantity} ${it.unit})`).join(', ');

      const res = await fetch('/api/notify/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: so.company?.nameTh || 'บริษัท ลัมเบอเรอร์ จำกัด',
          soNumber: so.soNumber,
          customerName: so.customerName,
          customerPhone: so.customerPhone,
          siteLocation: so.siteLocation,
          googleMapsUrl: so.googleMapsUrl,
          targetInstallDate: so.targetInstallDate,
          targetFinishDate: so.targetFinishDate,
          taggedStaff: so.taggedStaff,
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

  const handleDeleteSO = async (so: any) => {
    if (
      !confirm(
        `คุณต้องการลบคำสั่งขาย SO เลขที่ "${so.soNumber}" (${so.customerName}) หรือไม่?\n\n⚠️ การดำเนินการนี้จะลบรายการสินค้าและข้อมูลนัดหมายทั้งหมดของ SO นี้อย่างถาวร`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/sales-orders/${so.id}`, { method: 'DELETE' });
      if (res.ok) {
        alert(`ลบคำสั่งขาย ${so.soNumber} เรียบร้อยแล้ว`);
        fetchSalesOrders();
      } else {
        const err = await res.json();
        alert(err.error || 'เกิดข้อผิดพลาดในการลบคำสั่งขาย');
      }
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบ');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SO-Centric Installation Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            คำสั่งขาย & จองคิวงานติดตั้ง (Sales Orders)
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            จุดเริ่มต้นของงานติดตั้ง: เซลเปิด SO นัดวันลูกค้า $\to$ จัดซื้อหาช่าง $\to$ แท็กโฟร์แมน $\to$ คุมงาน $\to$ จ่ายเงิน 40-40-20
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 backdrop-blur shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>ปฏิทินคิวงาน</span>
          </Link>
          <Link
            href="/sales-orders/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>+ เปิด SO ใหม่ (ลงนัดลูกค้า)</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-medium opacity-80">ทั้งหมด</div>
          <div className="text-xl font-extrabold mt-1">{stats.all}</div>
        </button>

        <button
          onClick={() => setStatusFilter('PENDING_CONTRACTOR')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'PENDING_CONTRACTOR'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-amber-50/60 text-amber-900 border-amber-200/70 hover:bg-amber-100/50'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700">รอจัดหาช่าง</div>
          <div className="text-xl font-extrabold text-amber-900 mt-1">{stats.pending}</div>
        </button>

        <button
          onClick={() => setStatusFilter('SOURCING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'SOURCING'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-blue-50/60 text-blue-900 border-blue-200/70 hover:bg-blue-100/50'
          }`}
        >
          <div className="text-[11px] font-bold text-blue-700">กำลังดิวช่าง</div>
          <div className="text-xl font-extrabold text-blue-900 mt-1">{stats.sourcing}</div>
        </button>

        <button
          onClick={() => setStatusFilter('CONFIRMED')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'CONFIRMED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-emerald-50/60 text-emerald-900 border-emerald-200/70 hover:bg-emerald-100/50'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-700">ยืนยันช่างแล้ว</div>
          <div className="text-xl font-extrabold text-emerald-900 mt-1">{stats.confirmed}</div>
        </button>

        <button
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'IN_PROGRESS'
              ? 'bg-purple-600 text-white border-purple-600 shadow-md'
              : 'bg-purple-50/60 text-purple-900 border-purple-200/70 hover:bg-purple-100/50'
          }`}
        >
          <div className="text-[11px] font-bold text-purple-700">กำลังติดตั้ง</div>
          <div className="text-xl font-extrabold text-purple-900 mt-1">{stats.inProgress}</div>
        </button>

        <button
          onClick={() => setStatusFilter('ON_HOLD')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'ON_HOLD'
              ? 'bg-orange-600 text-white border-orange-600 shadow-md'
              : 'bg-orange-50/60 text-orange-900 border-orange-200/70 hover:bg-orange-100/50'
          }`}
        >
          <div className="text-[11px] font-bold text-orange-700">พักงาน (On-Hold)</div>
          <div className="text-xl font-extrabold text-orange-900 mt-1">{stats.onHold}</div>
        </button>

        <button
          onClick={() => setStatusFilter('DEFECT_FIXING')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            statusFilter === 'DEFECT_FIXING'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-rose-50/60 text-rose-900 border-rose-200/70 hover:bg-rose-100/50'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-700">งานแก้ไข</div>
          <div className="text-xl font-extrabold text-rose-900 mt-1">{stats.defect}</div>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ SO, ชื่อลูกค้า, สถานที่ติดตั้ง, เซล..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500">
            พบ <strong>{salesOrders.length}</strong> รายการ
          </span>
        </div>
      </div>

      {/* Sales Orders List */}
      {loading ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">กำลังโหลดข้อมูลคำสั่งขาย...</p>
        </div>
      ) : salesOrders.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">ยังไม่มีคำสั่งขายในหมวดนี้</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              เซลสามารถเริ่มต้นเปิดคำสั่งขาย (SO) และลงนัดหมายวันติดตั้งกับลูกค้าได้ทันที
            </p>
          </div>
          <Link
            href="/sales-orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>เปิด SO ใหม่</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {salesOrders.map((so) => {
            const statusInfo = getSOStatusInfo(so.status);
            const tagged = Array.isArray(so.taggedStaff)
              ? so.taggedStaff
              : (() => {
                  try {
                    return JSON.parse(so.taggedStaff || '[]');
                  } catch (_) {
                    return [];
                  }
                })();

            const activeContractors = [
              ...(so.quotations || []).map((q: any) => ({
                id: q.subcontractor?.id,
                name: q.subcontractor?.name,
                code: q.quotationNo,
                status: q.status,
                type: 'ใบเสนอราคา',
              })),
              ...(so.jobs || []).flatMap((j: any) =>
                (j.subContracts || []).map((sc: any) => ({
                  id: sc.subcontractor?.id,
                  name: sc.subcontractor?.name,
                  code: sc.contractCode,
                  status: sc.status,
                  type: 'สัญญาช่าง',
                }))
              ),
            ];

            return (
              <div
                key={so.id}
                className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900 tracking-tight">
                          {so.soNumber}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${
                            so.company?.code === 'LBR'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {so.company?.code || 'LBR'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </span>
                        {so.rescheduleReason && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            เลื่อนวัน: {so.rescheduleReason}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span>
                          เปิด SO: <strong>{formatDate(so.createdAt)}</strong>
                        </span>
                        {so.salesPerson && (
                          <span>
                            เซล: <strong>{so.salesPerson}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenLineShare(so)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-colors"
                      title="สร้างข้อความส่งแจ้งเตือนเข้ากลุ่ม LINE"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>แชร์ LINE</span>
                    </button>

                    <Link
                      href={`/quotations/new?soId=${so.id}&companyId=${so.companyId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors"
                      title="สร้างใบเสนอราคาช่างจาก SO นี้ (งวด 40-40-20)"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ ออกใบเสนอราคาช่าง</span>
                    </Link>

                    <Link
                      href={`/sales-orders/${so.id}`}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>จัดการ SO</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDeleteSO(so)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-800 border border-rose-200 transition-colors"
                      title="ลบคำสั่งขายนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Content Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Col 1: Customer & Site Location */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>ลูกค้า: {so.customerName}</span>
                    </div>
                    {so.customerPhone && (
                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{so.customerPhone}</span>
                      </div>
                    )}
                    <div className="text-slate-600 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span>{so.siteLocation}</span>
                        {so.googleMapsUrl && (
                          <div>
                            <a
                              href={so.googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <span>🗺️ นำทาง Google Maps</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Dates & Tagged Staff */}
                  <div className="space-y-1.5">
                    <div className="font-bold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      <span>
                        วันนัดหมายติดตั้ง:{' '}
                        <strong className="text-slate-900">
                          {so.targetInstallDate ? formatDate(so.targetInstallDate) : 'ยังไม่ระบุ'}
                        </strong>
                      </span>
                    </div>
                    {so.onHoldReason && (
                      <div className="p-2 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-[11px] font-medium">
                        ⏸️ <strong>พักงาน:</strong> {so.onHoldReason}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-slate-500 font-medium">ทีมงานที่แท็ก:</span>
                      {tagged.length === 0 ? (
                        <span className="text-slate-400 italic">ยังไม่ระบุ</span>
                      ) : (
                        tagged.map((t: any, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200"
                          >
                            {t.name} ({t.role || 'ทีมงาน'})
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Col 3: Contractors & Total Amount */}
                  <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>ยอดขายงานติดตั้ง:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {formatCurrency(so.totalAmount)}
                      </span>
                    </div>
                    <div className="text-slate-600 space-y-1">
                      <span className="font-medium text-[11px]">ช่างที่ผูกกับงานนี้:</span>
                      {activeContractors.length === 0 ? (
                        <div className="text-[11px] text-amber-700 font-bold">
                          ⚠️ ยังไม่ได้จัดหาช่าง (กดปุ่มออกใบเสนอราคาเพื่อดิวช่าง)
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {activeContractors.map((c, i) => (
                            <div key={i} className="flex justify-between text-[11px]">
                              <span className="font-semibold text-slate-800">
                                👷 {c.name || 'ช่างผู้รับเหมา'}
                              </span>
                              <span className="text-slate-500 font-mono">({c.code})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LINE Notification Modal Popup */}
      {lineModalOpen && selectedSOForLine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  ส่งแจ้งเตือนเข้า LINE กลุ่ม ({selectedSOForLine.soNumber})
                </h3>
              </div>
              <button
                onClick={() => setLineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
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
                rows={5}
                className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none"
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
                    <span>💡 ยังไม่ได้เชื่อมต่อ LINE Bot Token</span>
                    <Link href="/settings/line" className="font-bold text-amber-900 underline">
                      ตั้งค่า Bot
                    </Link>
                  </div>
                  <a
                    href={lineShareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md text-center flex items-center justify-center gap-1.5"
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
                    alert('คัดลอกข้อความเรียบร้อยแล้ว!');
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

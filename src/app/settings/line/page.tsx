'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  Users,
  Key,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useCompany } from '@/components/CompanyContext';

export default function LineSettingsPage() {
  const { selectedCompanyCode } = useCompany();

  // Settings State
  const [tokenInput, setTokenInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [maskedToken, setMaskedToken] = useState('');
  const [testingToken, setTestingToken] = useState(false);
  const [tokenStatusMsg, setTokenStatusMsg] = useState<string | null>(null);

  // Groups State
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Add/Edit Group Modal
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [lineGroupId, setLineGroupId] = useState('');
  const [companyCode, setCompanyCode] = useState('ALL');
  const [isDefault, setIsDefault] = useState(true);
  const [description, setDescription] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);
  const [groupError, setGroupError] = useState<string | null>(null);

  // Fetch Token Status
  const fetchTokenStatus = async () => {
    try {
      const res = await fetch('/api/settings/line');
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.isConnected);
        setMaskedToken(data.maskedToken);
      }
    } catch (err) {
      console.error('Error fetching token status:', err);
    }
  };

  // Fetch Groups
  const fetchGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await fetch('/api/line-groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus();
    fetchGroups();
  }, []);

  // Save / Test Token
  const handleSaveToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setTestingToken(true);
    setTokenStatusMsg(null);

    try {
      const res = await fetch('/api/settings/line', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });

      const data = await res.json();
      if (res.ok) {
        setTokenStatusMsg('✅ ' + (data.message || 'บันทึกและเชื่อมต่อ LINE สำเร็จ'));
        setTokenInput('');
        fetchTokenStatus();
      } else {
        setTokenStatusMsg('❌ ' + (data.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'));
      }
    } catch (err: any) {
      setTokenStatusMsg('❌ ' + (err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'));
    } finally {
      setTestingToken(false);
    }
  };

  // Open Create/Edit Modal
  const openCreateModal = () => {
    setEditingGroupId(null);
    setGroupName('');
    setLineGroupId('');
    setCompanyCode('ALL');
    setIsDefault(true);
    setDescription('');
    setGroupError(null);
    setGroupModalOpen(true);
  };

  const openEditModal = (g: any) => {
    setEditingGroupId(g.id);
    setGroupName(g.name);
    setLineGroupId(g.groupId);
    setCompanyCode(g.companyCode || 'ALL');
    setIsDefault(g.isDefault);
    setDescription(g.description || '');
    setGroupError(null);
    setGroupModalOpen(true);
  };

  // Save Group
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !lineGroupId.trim()) {
      setGroupError('กรุณากรอกชื่อกลุ่ม และ LINE Group ID');
      return;
    }

    setSavingGroup(true);
    setGroupError(null);

    try {
      const url = editingGroupId ? `/api/line-groups/${editingGroupId}` : '/api/line-groups';
      const method = editingGroupId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName.trim(),
          groupId: lineGroupId.trim(),
          companyCode,
          isDefault,
          description: description.trim() || null,
        }),
      });

      if (res.ok) {
        setGroupModalOpen(false);
        fetchGroups();
      } else {
        const err = await res.json();
        setGroupError(err.error || 'บันทึกไม่สำเร็จ');
      }
    } catch (err: any) {
      setGroupError(err.message || 'เกิดข้อผิดพลาด');
    } finally {
      setSavingGroup(false);
    }
  };

  // Delete Group
  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`คุณต้องการลบกลุ่ม "${name}" หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/line-groups/${id}`, { method: 'DELETE' });
      if (res.ok) fetchGroups();
    } catch (err) {
      console.error('Error deleting group:', err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/sales-orders"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>กลับไปหน้า SO</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <Send className="w-6 h-6 text-emerald-600" />
            <span>ตั้งค่าการส่งแจ้งเตือน LINE อัตโนมัติ (Multi-Group)</span>
          </h1>
          <p className="text-xs text-slate-500">
            จัดการกลุ่มไลน์และเชื่อมต่อ LINE Official Account เพื่อส่งการ์ดงานเข้าหลายกลุ่มพร้อมกันใน 1 คลิก
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มกลุ่มไลน์ใหม่</span>
        </button>
      </div>

      {/* LINE OA Bot Token Connection Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                LINE Channel Access Token (เชื่อมต่อ LINE Bot)
              </h2>
              <p className="text-xs text-slate-500">
                สำหรับส่งข้อความอัตโนมัติ (Push Notification) เข้ากลุ่มไลน์โดยตรง
              </p>
            </div>
          </div>

          <div>
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                เชื่อมต่อแล้ว ({maskedToken})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                ยังไม่เชื่อมต่อ Bot (ใช้โหมดแชร์ปกติ)
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveToken} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              วาง Channel Access Token (จาก LINE Developers Console):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={testingToken || !tokenInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold transition-colors whitespace-nowrap shadow-sm"
              >
                {testingToken ? 'กำลังทดสอบ...' : 'บันทึก & ทดสอบ'}
              </button>
            </div>
          </div>

          {tokenStatusMsg && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800">
              {tokenStatusMsg}
            </div>
          )}
        </form>
      </div>

      {/* Configured LINE Groups List */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-extrabold text-slate-900">
              รายชื่อกลุ่มไลน์ในระบบ ({groups.length} กลุ่ม)
            </h2>
          </div>
        </div>

        {loadingGroups ? (
          <div className="py-8 text-center text-xs text-slate-400">กำลังโหลดกลุ่มไลน์...</div>
        ) : groups.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 space-y-2">
            <p>ยังไม่มีกลุ่มไลน์ที่ตั้งค่าไว้</p>
            <button onClick={openCreateModal} className="text-emerald-600 font-bold hover:underline">
              + เพิ่มกลุ่มแรก
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div
                key={g.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all space-y-2 text-xs flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-extrabold text-slate-900 text-sm">{g.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        g.companyCode === 'LBR'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : g.companyCode === 'UTY'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                    >
                      {g.companyCode}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] text-slate-500 truncate" title={g.groupId}>
                    ID: <strong>{g.groupId}</strong>
                  </div>

                  {g.description && <p className="text-slate-600 text-[11px]">{g.description}</p>}

                  {g.isDefault && (
                    <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ ติ๊กเลือกเริ่มต้น
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(g)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(g.id, g.name)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Guide Box on How to get Group ID */}
      <div className="p-6 rounded-3xl bg-indigo-50/70 border border-indigo-200/90 text-xs text-indigo-950 space-y-3">
        <h3 className="font-extrabold text-sm flex items-center gap-2 text-indigo-900">
          <HelpCircle className="w-4 h-4 text-indigo-700" />
          <span>วิธีหา Group ID ของกลุ่มไลน์ (LINE Group ID)</span>
        </h3>
        <div className="space-y-1.5 text-indigo-900/90 leading-relaxed">
          <p>
            1. <strong>เชิญ LINE OA (บอท)</strong> ของบริษัทเข้าไปในกลุ่มไลน์ที่ต้องการ
          </p>
          <p>
            2. <strong>Group ID</strong> เป็นรหัสเฉพาะของกลุ่มไลน์ที่ขึ้นต้นด้วยตัวอักษร{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono font-bold text-indigo-800">
              C...
            </code>{' '}
            (ความยาว 33 ตัวอักษร)
          </p>
          <p>
            3. นำ Group ID นั้นมากรอกลงในช่อง <strong>"LINE Group ID"</strong> ด้านบนนี้
            แล้วเมื่อกดยิงแจ้งเตือนจากหน้า SO ระบบจะยิงตรงเข้ากลุ่มนั้นทันทีครับ
          </p>
        </div>
      </div>

      {/* Add / Edit Group Modal */}
      {groupModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>{editingGroupId ? 'แก้ไขกลุ่มไลน์' : 'เพิ่มกลุ่มไลน์ใหม่'}</span>
            </h3>

            {groupError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {groupError}
              </div>
            )}

            <form onSubmit={handleSaveGroup} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  ชื่อกลุ่ม (สำหรับแสดงในระบบ) *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="เช่น กลุ่มโฟร์แมนหน้างาน UTY"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  LINE Group ID (ขึ้นต้นด้วย C...) *
                </label>
                <input
                  type="text"
                  value={lineGroupId}
                  onChange={(e) => setLineGroupId(e.target.value)}
                  placeholder="C1234567890abcdef1234567890abcdef"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">บริษัท</label>
                  <select
                    value={companyCode}
                    onChange={(e) => setCompanyCode(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 font-bold"
                  >
                    <option value="ALL">ทุกบริษัท (ALL)</option>
                    <option value="LBR">ลัมเบอเรอร์ (LBR)</option>
                    <option value="UTY">อุดทะยาน (UTY)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isDefaultCheck"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isDefaultCheck" className="font-bold text-slate-700 cursor-pointer">
                    ติ๊กเลือกเป็นค่าเริ่มต้น
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">คำอธิบายเพิ่มเติม</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="เช่น กลุ่มประสานงานช่างไม้และโฟร์แมน"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={savingGroup}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
                >
                  {savingGroup ? 'กำลังบันทึก...' : 'บันทึกกลุ่ม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

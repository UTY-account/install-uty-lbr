'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  PlusCircle,
  Search,
  Filter,
  BarChart3,
  Edit2,
  CheckCircle,
  Award,
  HardHat,
  AlertCircle,
  X,
  Trash2,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function ItemsMasterPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // New Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('งานพื้น');
  const [newUnit, setNewUnit] = useState('ตร.ม.');
  const [newStandardRate, setNewStandardRate] = useState<number | string>(80);
  const [newDescription, setNewDescription] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('งานพื้น');
  const [editUnit, setEditUnit] = useState('ตร.ม.');
  const [editStandardRate, setEditStandardRate] = useState<number | string>(80);
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/items?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          name: newName,
          category: newCategory,
          unit: newUnit,
          standardRate: parseFloat(String(newStandardRate)) || 0,
          description: newDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เพิ่มรหัสรายการไม่สำเร็จ');

      setShowAddModal(false);
      setNewCode('');
      setNewName('');
      setNewDescription('');
      fetchItems();
    } catch (err: any) {
      setAddError(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setAddLoading(false);
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditCode(item.code);
    setEditName(item.name);
    setEditCategory(item.category || 'งานพื้น');
    setEditUnit(item.unit);
    setEditStandardRate(item.standardRate);
    setEditDescription(item.description || '');
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch('/api/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          code: editCode.trim().toUpperCase(),
          name: editName.trim(),
          category: editCategory,
          unit: editUnit.trim(),
          standardRate: parseFloat(String(editStandardRate)) || 0,
          description: editDescription.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'แก้ไขรหัสรายการไม่สำเร็จ');

      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      setEditError(err.message || 'เกิดข้อผิดพลาดในการแก้ไขรหัสรายการ');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteItem = async (item: any) => {
    if (!confirm(`คุณต้องการลบรหัสรายการ "${item.code}: ${item.name}" ใช่หรือไม่?`)) return;

    try {
      const res = await fetch(`/api/items?id=${item.id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ลบไม่สำเร็จ');

      if (editingItem?.id === item.id) setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการลบรหัสรายการ');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-purple-600" />
            คลังรหัสรายการมาตรฐาน (Item Master Catalog)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดรหัสรายการงานติดตั้ง แก้ไขราคาตั้งต้นมาตรฐาน และติดตามราคากลางเปรียบเทียบช่าง
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/price-benchmark"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 shadow-2xs transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            หน้าเปรียบเทียบราคาช่าง
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            เพิ่มรหัสรายการใหม่
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารหัสรายการ (เช่น ITEM-WOOD-001) หรือชื่องาน..."
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
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            <option value="all">ทุกหมวดหมู่งาน</option>
            <option value="งานพื้น">งานพื้น</option>
            <option value="งานอุปกรณ์ตกแต่ง">งานอุปกรณ์ตกแต่ง</option>
            <option value="งานผนัง">งานผนัง</option>
            <option value="งานฝ้าและเพดาน">งานฝ้าและเพดาน</option>
            <option value="งานบริการ/สำรวจ">งานบริการ/สำรวจ</option>
          </select>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm font-medium">กำลังโหลดคลังรหัสรายการ...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                  <th className="py-3 px-4 w-44 whitespace-nowrap">รหัสรายการ</th>
                  <th className="py-3 px-4">ชื่องานติดตั้งและรายละเอียด</th>
                  <th className="py-3 px-4 w-36 text-center whitespace-nowrap">หมวดหมู่</th>
                  <th className="py-3 px-4 text-right w-32 whitespace-nowrap">ราคากลาง</th>
                  <th className="py-3 px-4 text-right w-32 whitespace-nowrap">ราคาต่ำสุด</th>
                  <th className="py-3 px-4 text-right w-32 whitespace-nowrap">ราคาเฉลี่ย</th>
                  <th className="py-3 px-4 w-48 whitespace-nowrap">ช่างที่เสนอราคาต่ำสุด</th>
                  <th className="py-3 px-4 text-center w-36 whitespace-nowrap">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-purple-900 whitespace-nowrap">
                      {it.code}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm leading-snug">{it.name}</div>
                      {it.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{it.description}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold text-slate-700">
                        {it.category || 'ทั่วไป'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-700 whitespace-nowrap">
                      {formatCurrency(it.standardRate)}
                      <span className="text-[10px] text-slate-400 block font-normal">/{it.unit}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {formatCurrency(it.stats?.minRate || it.standardRate)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700 whitespace-nowrap">
                      {formatCurrency(it.stats?.avgRate || it.standardRate)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {it.stats?.lowestSubcontractor ? (
                        <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                          <Award className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{it.stats.lowestSubcontractor.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(it)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                          title="แก้ไขรหัสรายการ"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(it)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors shadow-2xs"
                          title="ลบรหัสรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/price-benchmark?itemCode=${it.code}`}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                        >
                          <BarChart3 className="w-3 h-3" />
                          เทียบราคา
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                เพิ่มรหัสรายการงานใหม่
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

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  รหัสรายการ (Item Code) *
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="เช่น ITEM-WOOD-005"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ชื่องานติดตั้ง *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น ติดตั้งพื้นไม้ไวนิล LVT แบบคลิกล็อก"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  >
                    <option value="งานพื้น">งานพื้น</option>
                    <option value="งานอุปกรณ์ตกแต่ง">งานอุปกรณ์ตกแต่ง</option>
                    <option value="งานผนัง">งานผนัง</option>
                    <option value="งานฝ้าและเพดาน">งานฝ้าและเพดาน</option>
                    <option value="งานบริการ/สำรวจ">งานบริการ/สำรวจ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    หน่วยนับ *
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="ตร.ม., ม., เส้น, จุด"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ราคากลางมาตรฐาน (บาท/{newUnit}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newStandardRate}
                  onChange={(e) => setNewStandardRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="สเปกงาน ข้อกำหนด หรืออุปกรณ์ที่รวมอยู่ในราคานี้"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  {addLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสรายการ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-600" />
                แก้ไขรหัสรายการ ({editingItem.code})
              </h3>
              <button
                onClick={() => setEditingItem(null)}
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

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  รหัสรายการ (Item Code) *
                </label>
                <input
                  type="text"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-purple-700 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ชื่องานติดตั้ง *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    หมวดหมู่
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  >
                    <option value="งานพื้น">งานพื้น</option>
                    <option value="งานอุปกรณ์ตกแต่ง">งานอุปกรณ์ตกแต่ง</option>
                    <option value="งานผนัง">งานผนัง</option>
                    <option value="งานฝ้าและเพดาน">งานฝ้าและเพดาน</option>
                    <option value="งานบริการ/สำรวจ">งานบริการ/สำรวจ</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    หน่วยนับ *
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  ราคากลางมาตรฐาน (บาท/{editUnit}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editStandardRate}
                  onChange={(e) => setEditStandardRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  รายละเอียดเพิ่มเติม
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-purple-500 shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => handleDeleteItem(editingItem)}
                  className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  ลบรายการ
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
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

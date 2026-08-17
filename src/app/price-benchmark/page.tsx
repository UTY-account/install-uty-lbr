'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Award,
  HardHat,
  PlusCircle,
  FileText,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PriceCompareChart } from '@/components/PriceCompareChart';
import { formatCurrency, formatThaiDate } from '@/lib/utils';

function PriceBenchmarkContent() {
  const searchParams = useSearchParams();
  const initialItemCode = searchParams.get('itemCode') || 'ITEM-WOOD-001';

  const [itemsList, setItemsList] = useState<any[]>([]);
  const [selectedItemCode, setSelectedItemCode] = useState<string>(initialItemCode);
  const [benchmarkData, setBenchmarkData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all items list for sidebar/dropdown
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await fetch('/api/price-benchmark');
        if (res.ok) {
          const data = await res.json();
          setItemsList(data.items || []);
        }
      } catch (err) {
        console.error('Failed to load items catalog:', err);
      }
    };
    fetchItems();
  }, []);

  // Fetch benchmark data for selected item
  useEffect(() => {
    const fetchBenchmark = async () => {
      if (!selectedItemCode) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/price-benchmark?itemCode=${selectedItemCode}`);
        if (res.ok) {
          const data = await res.json();
          setBenchmarkData(data);
        }
      } catch (err) {
        console.error('Failed to load benchmark:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBenchmark();
  }, [selectedItemCode]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-purple-600" />
            ระบบเปรียบเทียบราคาค่าแรงช่าง (Price Benchmarking)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            วิเคราะห์ราคาค่าแรงต่อหน่วยตามรหัสรายการ &bull; ไฮไลต์ช่างที่ราคาต่ำที่สุด &bull; คำนวณราคาเฉลี่ย
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/items"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors"
          >
            จัดการคลังรหัสรายการ (Item Master)
          </Link>
          <Link
            href={`/quotations/new?itemCode=${selectedItemCode}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <FileText className="w-4 h-4" />
            ออกใบเสนอราคาตามรหัสนี้
          </Link>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Item Master Selector */}
        <div className="lg:col-span-1 space-y-3">
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              เลือกรหัสรายการงาน
            </h3>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {itemsList.map((it) => {
                const isSelected = it.code === selectedItemCode;

                return (
                  <button
                    key={it.id}
                    onClick={() => setSelectedItemCode(it.code)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all space-y-1 ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 text-purple-950 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-purple-700">{it.code}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{it.ratesCount} ช่าง</span>
                    </div>
                    <div className="text-xs font-bold line-clamp-1">{it.name}</div>
                    <div className="text-[11px] text-slate-500 flex justify-between pt-0.5 font-medium">
                      <span>ต่ำสุด: <strong className="text-emerald-700">{formatCurrency(it.minRate)}</strong></span>
                      <span>/{it.unit}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {loading || !benchmarkData ? (
            <div className="py-20 text-center text-slate-400 text-sm bg-white rounded-3xl border border-slate-200">
              กำลังคำนวณสถิติและเปรียบเทียบราคา...
            </div>
          ) : (
            <>
              {/* Selected Item Overview Header */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-md border border-purple-200 shadow-2xs">
                        {benchmarkData.item.code}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">
                        หมวด: {benchmarkData.item.category || 'ทั่วไป'} &bull; หน่วย: {benchmarkData.item.unit}
                      </span>
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">{benchmarkData.item.name}</h2>
                    {benchmarkData.item.description && (
                      <p className="text-xs text-slate-500">{benchmarkData.item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/jobs/new`}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <PlusCircle className="w-4 h-4" />
                      เปิดงานติดตั้งรหัสนี้
                    </Link>
                  </div>
                </div>

                {/* Benchmark KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-emerald-800 font-bold uppercase">ราคาต่ำที่สุด</span>
                      <Award className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-800 font-mono">
                      {formatCurrency(benchmarkData.stats.minRate)}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">ต่อ {benchmarkData.item.unit}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">ราคาเฉลี่ยรวม</span>
                    <div className="text-2xl font-extrabold text-amber-700 font-mono">
                      {formatCurrency(benchmarkData.stats.avgRate)}
                    </div>
                    <span className="text-[10px] text-slate-500 block">จาก {benchmarkData.stats.totalSubcontractors} ช่าง</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">ราคาสูงสุด</span>
                    <div className="text-2xl font-extrabold text-rose-700 font-mono">
                      {formatCurrency(benchmarkData.stats.maxRate)}
                    </div>
                    <span className="text-[10px] text-slate-500 block">ต่อ {benchmarkData.item.unit}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">ราคากลางมาตรฐาน</span>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono">
                      {formatCurrency(benchmarkData.item.standardRate)}
                    </div>
                    <span className="text-[10px] text-slate-500 block">ราคาตั้งต้นในระบบ</span>
                  </div>
                </div>
              </div>

              {/* Price Distribution Comparison Chart */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    แผนภูมิเปรียบเทียบราคาต่อหน่วยของช่างทุกคน
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ต่ำสุด
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> เส้นค่าเฉลี่ย
                    </span>
                  </div>
                </div>

                <PriceCompareChart
                  contractors={benchmarkData.contractors}
                  avgRate={benchmarkData.stats.avgRate}
                  standardRate={benchmarkData.item.standardRate}
                  unit={benchmarkData.item.unit}
                />
              </div>

              {/* Comprehensive Contractor Comparison Table */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <HardHat className="w-4 h-4 text-amber-600" />
                  ตารางเปรียบเทียบราคาค่าแรงช่างแบบจัดอันดับ (Ranked by Price)
                </h3>

                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                        <th className="py-2.5 px-3 w-14 text-center">อันดับ</th>
                        <th className="py-2.5 px-3">ชื่อช่าง / ผู้รับเหมา</th>
                        <th className="py-2.5 px-3 text-right w-32">ราคาต่อหน่วย</th>
                        <th className="py-2.5 px-3 text-right w-32">เทียบค่าเฉลี่ย</th>
                        <th className="py-2.5 px-3 w-48">งานล่าสุดที่บันทึก</th>
                        <th className="py-2.5 px-3 w-28">วันที่บันทึก</th>
                        <th className="py-2.5 px-3 text-center w-28">การดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {benchmarkData.contractors.map((c: any, index: number) => (
                        <tr
                          key={c.subcontractorId}
                          className={`hover:bg-slate-50 transition-colors ${
                            c.isLowest ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-center">
                            {index === 0 ? (
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs inline-flex items-center justify-center border border-emerald-300">
                                1
                              </span>
                            ) : (
                              <span className="text-slate-400 font-medium">{index + 1}</span>
                            )}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/subcontractors/${c.subcontractor.id}`}
                                className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors"
                              >
                                {c.subcontractor.name}
                              </Link>
                              {c.isLowest && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 flex items-center gap-1">
                                  <Award className="w-3 h-3 text-emerald-600" /> ต่ำที่สุด
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {c.subcontractor.phone} &bull; {c.allHistory.length} ครั้งที่เคยเสนอ
                            </div>
                          </td>

                          <td className="py-3 px-3 text-right">
                            <span className="font-mono font-extrabold text-sm text-slate-900">
                              {formatCurrency(c.latestRate)}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-semibold">/{benchmarkData.item.unit}</span>
                          </td>

                          <td className="py-3 px-3 text-right">
                            {c.diffFromAvg <= 0 ? (
                              <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1 font-mono">
                                <TrendingDown className="w-3 h-3 text-emerald-600" />
                                {formatCurrency(Math.abs(c.diffFromAvg))} ({Math.abs(c.diffPercent)}%)
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold text-[11px] flex items-center justify-end gap-1 font-mono">
                                <TrendingUp className="w-3 h-3 text-rose-600" />
                                +{formatCurrency(c.diffFromAvg)} (+{c.diffPercent}%)
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3 text-slate-700 truncate max-w-xs text-[11px] font-medium">
                            {c.latestJobTitle || c.latestJobCode || '-'}
                          </td>

                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {formatThaiDate(c.latestRecordedAt)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <Link
                              href={`/quotations/new?subcontractorId=${c.subcontractor.id}&itemCode=${benchmarkData.item.code}`}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-2xs"
                            >
                              <FileText className="w-3 h-3" />
                              ออกใบเสนอราคา
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PriceBenchmarkPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400 text-sm">กำลังโหลดหน้าเปรียบเทียบราคา...</div>}>
      <PriceBenchmarkContent />
    </Suspense>
  );
}

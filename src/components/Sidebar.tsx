'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  HardHat,
  Briefcase,
  FileSpreadsheet,
  FileText,
  BarChart3,
  Layers,
  Menu,
  X,
  PlusCircle,
  Sparkles,
  Settings,
  ChevronRight,
  ShieldAlert,
  Home,
  Receipt,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { useCompany } from './CompanyContext';

export function Sidebar() {
  const pathname = usePathname();
  const { selectedCompanyCode, setSelectedCompanyCode, companies, isConsolidated, selectedCompany } = useCompany();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navSections = [
    {
      title: 'งาน & การเบิกจ่าย',
      items: [
        { href: '/', label: 'หน้าหลัก (Dashboard)', icon: Home },
        { href: '/schedule', label: 'ตารางงานช่าง (Schedule)', icon: Calendar, highlight: true },
        { href: '/jobs', label: 'งานติดตั้ง & สัญญาช่าง', icon: Briefcase },
        { href: '/quotations', label: 'ใบเสนอราคาแทนช่าง', icon: FileText },
      ],
    },
    {
      title: 'ฐานข้อมูล & สถิติราคา',
      items: [
        { href: '/subcontractors', label: 'จัดการช่าง (Subcontractors)', icon: HardHat },
        { href: '/price-benchmark', label: 'เปรียบเทียบราคาค่าแรง', icon: BarChart3 },
        { href: '/items', label: 'คลังรหัสรายการ (Master)', icon: Layers },
        { href: '/import-excel', label: 'นำเข้า Excel จัดกลุ่ม', icon: FileSpreadsheet, highlight: true },
      ],
    },
    {
      title: 'ตั้งค่า & ช่วยเหลือ',
      items: [
        { href: '/companies', label: 'ข้อมูลบริษัทผู้ว่าจ้าง', icon: Building2 },
        { href: '/manual', label: 'คู่มือการใช้งาน (Manual)', icon: BookOpen },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Bar (Strictly hidden during print) */}
      <div className="no-print lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
              PI
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 block leading-tight">PRO-INSTALL</span>
              <span className="text-[10px] text-slate-500">ระบบบริหารงานติดตั้ง</span>
            </div>
          </div>
        </div>

        <Link
          href="/jobs/new"
          className="p-2 rounded-lg bg-blue-600 text-white text-xs font-semibold shadow-sm flex items-center gap-1"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">เปิดงาน</span>
        </Link>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="no-print lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container (Strictly hidden during print) */}
      <aside
        className={`no-print fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out shadow-sm lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">PRO-INSTALL</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">ระบบบริหารงานติดตั้ง & ช่าง</p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Company Switcher Box */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            เลือกบริษัทผู้ว่าจ้าง:
          </label>
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedCompanyCode}
              onChange={(e) => setSelectedCompanyCode(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 text-xs font-semibold rounded-xl appearance-none cursor-pointer border transition-all shadow-sm focus:outline-none focus:ring-2 ${
                isConsolidated
                  ? 'bg-blue-50/80 border-blue-200 text-blue-900 focus:ring-blue-500 font-bold'
                  : 'bg-white border-slate-300 text-slate-800 focus:ring-blue-500'
              }`}
            >
              <option value="all">🏢 ดูภาพรวมทุกบริษัท (Consolidated)</option>
              {companies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}: {c.nameTh}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">
              ▼
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="px-4 pt-4">
          <Link
            href="/jobs/new"
            onClick={() => setMobileOpen(false)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <PlusCircle className="w-4 h-4" />
            เปิดงานติดตั้งใหม่
          </Link>
        </div>

        {/* Navigation Links by Sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block">
                {section.title}
              </span>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                          : item.highlight
                          ? 'bg-emerald-50/70 text-emerald-800 hover:bg-emerald-100/70 border border-emerald-200/60 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${
                            active
                              ? 'text-blue-600'
                              : item.highlight
                              ? 'text-emerald-600'
                              : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.highlight && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded shadow-xs">
                          Auto
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom System Status */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ระบบพร้อมใช้งาน
            </span>
            <span className="font-mono text-[10px] text-slate-400">Database: Online</span>
          </div>
          <div className="text-[10px] text-slate-400">
            ระบบคุมเบิกจ่ายช่าง &bull; WHT 3% &bull; Multi-Item
          </div>
        </div>
      </aside>
    </>
  );
}

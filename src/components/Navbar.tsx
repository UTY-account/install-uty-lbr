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
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useCompany } from './CompanyContext';

export function Navbar() {
  const pathname = usePathname();
  const { selectedCompanyCode, setSelectedCompanyCode, companies, isConsolidated, selectedCompany } = useCompany();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'หน้าหลัก', icon: Layers },
    { href: '/jobs', label: 'งานติดตั้ง & สัญญาช่าง', icon: Briefcase },
    { href: '/subcontractors', label: 'จัดการช่าง (Subcontractors)', icon: HardHat },
    { href: '/price-benchmark', label: 'เทียบราคาค่าแรง', icon: BarChart3 },
    { href: '/quotations', label: 'ใบเสนอราคาแทนช่าง', icon: FileText },
    { href: '/import-excel', label: 'นำเข้า Excel', icon: FileSpreadsheet, highlight: true },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <HardHat className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  PRO-INSTALL <span className="text-xs px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 font-semibold border border-brand-500/30">v2.0</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">ระบบบริหารงานติดตั้ง & จ่ายเงินช่าง</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 shadow-sm'
                      : link.highlight
                      ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                  {link.highlight && <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          {/* Company Switcher Dropdown & Action */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Multi-Company Selector */}
            <div className="relative flex items-center">
              <Building2 className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={selectedCompanyCode}
                onChange={(e) => setSelectedCompanyCode(e.target.value)}
                className={`pl-9 pr-8 py-1.5 text-xs font-semibold rounded-lg appearance-none cursor-pointer border transition-all focus:outline-none focus:ring-2 ${
                  isConsolidated
                    ? 'bg-indigo-950/80 border-indigo-500/50 text-indigo-200 focus:ring-indigo-500'
                    : 'bg-slate-800 border-slate-700 text-slate-200 focus:ring-brand-500'
                }`}
              >
                <option value="all">🏢 ดูภาพรวมทุกบริษัท (Consolidated)</option>
                {companies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}: {c.nameTh}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ▼
              </div>
            </div>

            {/* Quick Job Creation */}
            <Link
              href="/jobs/new"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-600 to-blue-600 hover:from-brand-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              เปิดงานใหม่
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-3">
          {/* Mobile Company Switcher */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              เลือกบริษัทผู้ว่าจ้าง
            </label>
            <select
              value={selectedCompanyCode}
              onChange={(e) => {
                setSelectedCompanyCode(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-white"
            >
              <option value="all">🏢 ดูภาพรวมทุกบริษัท (Consolidated)</option>
              {companies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}: {c.nameTh}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Nav Links */}
          <div className="space-y-1 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    active
                      ? 'bg-brand-600/30 text-brand-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5 text-slate-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/jobs/new"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              เปิดงานติดตั้งใหม่
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

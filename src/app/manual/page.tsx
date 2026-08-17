'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Printer,
  ChevronRight,
  Briefcase,
  Calendar,
  CreditCard,
  FileText,
  HardHat,
  Layers,
  BarChart3,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Sparkles,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';

export default function UserManualPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const sections = [
    {
      id: 'overview',
      title: '1. ภาพรวมระบบและแถบเมนูหลัก',
      icon: BookOpen,
      color: 'text-blue-600 bg-blue-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            ระบบ <strong>PRO-INSTALL</strong> ถูกออกแบบมาเพื่อธุรกิจรับเหมาติดตั้งตกแต่งภายใน-ภายนอก ที่ต้องว่าจ้างช่างรับเหมาช่วง (Subcontractors) หลายคนในโครงการเดียวกัน โดยมีจุดเด่นสำคัญ:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>แถบเมนูซ้ายมือ (Sidebar Navigation):</strong> เข้าถึงฟังก์ชันทั้งหมดได้สะดวกรวดเร็ว</li>
            <li><strong>หน้าจอเต็มขอบ (Full-Width Fluid Layout):</strong> แสดงผลเต็มหน้าจอ รหัสและตัวเลขไม่ตกบรรทัด</li>
            <li><strong>จัดรูปแบบตัวเลขการเงินอัตโนมัติ:</strong> ใส่เครื่องหมาย <code>,</code> (Comma) คั่นหลักพัน หลักล้านเสมอ</li>
            <li><strong>ล็อกเลขบัตร ปชช. / เลขผู้เสียภาษี 13 หลัก:</strong> ป้องกันการกรอกผิดพลาด</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'multi-company',
      title: '2. ระบบหลายบริษัท (Multi-Company Selector)',
      icon: Building2,
      color: 'text-indigo-600 bg-indigo-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            สามารถสลับการบริหารงานระหว่างหลายนิติบุคคลได้ทันทีจากเมนูด้านซ้ายบนใต้โลโก้:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-blue-700 block">CP1</strong>
              <span>บริษัท ติดตั้งโปร จำกัด</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-purple-700 block">CP2</strong>
              <span>บริษัท อาร์ต เดคคอร์ กรุ๊ป จำกัด</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <strong className="text-emerald-700 block">ALL</strong>
              <span>ทุกบริษัท (ภาพรวมการเงินทั้งหมด)</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'so-integration',
      title: '3. โครงสร้างรหัสเอกสารและการผูกเลข SO (Sales Order Integration)',
      icon: Briefcase,
      color: 'text-amber-600 bg-amber-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            ระบบรองรับการผูกกับเลข <strong><code>SO</code> (Sales Order)</strong> จากระบบเดิมของท่าน (เช่น <code>SO260817-0001</code>) เพื่อให้เชื่อมต่อข้อมูลกับฝ่ายขายและบัญชีได้อย่างสมบูรณ์แบบ:
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <th className="py-2.5 px-3">ประเภทเอกสาร / รายการ</th>
                  <th className="py-2.5 px-3 font-mono">โครงสร้างรูปแบบรหัส</th>
                  <th className="py-2.5 px-3 font-mono text-blue-700">ตัวอย่างจริง</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold">1. รหัสงานติดตั้ง (Job Code)</td>
                  <td className="py-2 px-3 text-slate-500">[รหัสบริษัท]-[เลข SO]</td>
                  <td className="py-2 px-3 font-bold text-blue-700">CP1-SO260817-0001</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold">2. สัญญาจ้างช่างคนที่ 1</td>
                  <td className="py-2 px-3 text-slate-500">[รหัสบริษัท]-[เลข SO]-01</td>
                  <td className="py-2 px-3 font-bold text-amber-700">CP1-SO260817-0001-01</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold">3. สัญญาจ้างช่างคนที่ 2</td>
                  <td className="py-2 px-3 text-slate-500">[รหัสบริษัท]-[เลข SO]-02</td>
                  <td className="py-2 px-3 font-bold text-amber-700">CP1-SO260817-0001-02</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold">4. ใบเสนอราคาแทนช่างคนที่ 1</td>
                  <td className="py-2 px-3 text-slate-500">[รหัสบริษัท]-QT-[เลข SO]-01</td>
                  <td className="py-2 px-3 font-bold text-purple-700">CP1-QT-SO260817-0001-01</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-sans font-semibold">5. ใบเสนอราคาแทนช่างคนที่ 2</td>
                  <td className="py-2 px-3 text-slate-500">[รหัสบริษัท]-QT-[เลข SO]-02</td>
                  <td className="py-2 px-3 font-bold text-purple-700">CP1-QT-SO260817-0001-02</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-slate-500 italic">
            * กรณีไม่มีเลข SO ระบบจะรันเลขอัตโนมัติตามรอบเดือนให้อย่างเป็นระเบียบ เช่น <code>CP1-QT-2608-0001</code>
          </p>
        </div>
      ),
    },
    {
      id: 'jobs-contracts',
      title: '4. ระบบงานติดตั้งและสัญญาจ้างช่าง (Jobs & Multi-Contracts)',
      icon: Briefcase,
      color: 'text-blue-600 bg-blue-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            รองรับโครงสร้าง <strong>1 งานติดตั้ง $\longrightarrow$ มีช่างรับผิดชอบได้หลายคน $\longrightarrow$ แต่ละช่างมีหลายรายการย่อย</strong>:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>ไปที่เมนู <strong>"งานติดตั้ง & สัญญาช่าง"</strong> (<code>/jobs</code>) แล้วคลิกปุ่ม <strong>"+ เปิดงานติดตั้งใหม่"</strong></li>
            <li>เลือกบริษัทผู้ว่าจ้าง, กรอกเลข <strong>SO</strong> (เช่น <code>SO260817-0001</code>), ชื่องาน, สถานที่ติดตั้ง และชื่อลูกค้า</li>
            <li>เพิ่มสัญญาช่างแต่ละคน โดยระบุช่างผู้รับผิดชอบ และเพิ่มรายการย่อยพร้อมระบุปริมาณและราคาต่อหน่วย</li>
            <li>กดบันทึก ระบบจะสร้างงาน <code>CP1-SO260817-0001</code> และสัญญาช่าง <code>-01</code>, <code>-02</code> ให้อัตโนมัติ</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'work-schedule',
      title: '5. ระบบตารางงานช่างและแผนเข้าหน้างาน (Work Schedule & Milestones)',
      icon: Calendar,
      color: 'text-emerald-600 bg-emerald-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            ใช้สำหรับวางแผนวันเข้าหน้างานของช่างล่วงหน้า ติดตามความคืบหน้ารายวัน และผูกเงื่อนไขงวดเงินเบิกจ่าย (<code>/schedule</code>):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <strong className="text-slate-900 block font-bold">5 สถานะงานเข้าหน้างาน:</strong>
              <div className="space-y-1 text-[11px]">
                <div>⚪ <strong>PLANNED:</strong> วางแผนนัดหมายล่วงหน้า (0%)</div>
                <div>🔵 <strong>IN_PROGRESS:</strong> กำลังทำงาน (ปรับสไลเดอร์ % ได้)</div>
                <div>🟢 <strong>COMPLETED:</strong> เสร็จสิ้น 100% (ปลดล็อกปุ่มจ่ายเงินงวด)</div>
                <div>🔴 <strong>DELAYED:</strong> ติดปัญหา/ล่าช้า (บันทึกสาเหตุได้)</div>
                <div>⚪ <strong>CANCELLED:</strong> ยกเลิก/เลื่อน</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
              <strong className="text-blue-950 block font-bold">การเชื่อมโยงงวดเงิน (Payment Milestones):</strong>
              <p className="text-[11px] text-slate-600">
                เมื่อผูกแผนงานกับงวดเงิน (เช่น งวดที่ 1 หรือ 2) และกดเปลี่ยนสถานะเป็น <strong>"🟢 เสร็จสิ้นแล้ว"</strong> ระบบจะมีปุ่มลัด <strong>"จ่ายเงินงวดนี้ทันที"</strong> เพื่อเปิดหน้าต่างบันทึกจ่ายเงินให้อัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'payments-audit',
      title: '6. ระบบบันทึกจ่ายเงินค่างวด & แก้ไขพร้อม Audit Trail (Payments & Audit Log)',
      icon: CreditCard,
      color: 'text-emerald-600 bg-emerald-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>บันทึกจ่ายเงินไม่จำกัดงวด:</strong> คลิกปุ่ม "จ่ายเงินงวดที่ X" บนการ์ดสัญญาช่างในหน้างานติดตั้ง (<code>/jobs/[id]</code>)</li>
            <li><strong>ใส่ <code>,</code> อัตโนมัติขณะพิมพ์:</strong> พิมพ์ตัวเลขยอดเงินแล้วระบบใส่เครื่องหมายจุลภาคคั่นหลักร้อยหลักพันให้อัตโนมัติ</li>
            <li><strong>Overpayment Guard:</strong> ป้องกันการกรอกตัวเลขเกินยอดเงินคงเหลือตามสัญญาจริง</li>
            <li><strong>หักภาษี ณ ที่จ่าย 3% อัตโนมัติ:</strong> คำนวณยอดภาษีหักและยอดโอนสุทธิให้ทันที</li>
            <li><strong>แก้ไขประวัติพร้อม Audit Trail:</strong> มีปุ่มรูปดินสอสำหรับแก้ไขยอดเงินหรือวันที่ โดยระบบจะบันทึกประวัติการแก้ไขและเหตุผลย้อนหลังทุกครั้ง</li>
            <li><strong>พิมพ์ใบสำคัญจ่ายค่าแรง (Payment Voucher A4):</strong> มีปุ่มพิมพ์เอกสารใบสำคัญจ่ายขนาด A4 สวยงาม พร้อมช่องลงชื่อผู้จัดทำ/ผู้อนุมัติ/ผู้รับเงิน</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'quotations',
      title: '7. ระบบออกใบเสนอราคาแทนช่าง & พิมพ์ A4 (Subcontractor Quotations)',
      icon: FileText,
      color: 'text-purple-600 bg-purple-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Inverted Quotation Layout:</strong> หัวเอกสารด้านซ้ายเป็นชื่อช่าง (ผู้เสนอราคา) และผู้รับคือบริษัทของเรา (ผู้ว่าจ้าง)</li>
            <li><strong>ผูกเลข SO:</strong> ระบุเลข SO และเลือกลำดับช่าง ระบบจะสร้างรหัส <code>CP1-QT-SO260817-0001-01</code> ทันที</li>
            <li><strong>แนบรูปสำเนาบัตรประชาชนช่าง:</strong> มีช่องแนบรูปถ่ายบัตร ปชช. พร้อมตราปั๊มลายน้ำ <em>"สำเนาถูกต้อง สำหรับเสนอราคางาน"</em></li>
            <li><strong>พิมพ์ A4 เต็มแผ่น รองรับงานหลายหน้า:</strong> หัวตารางแสดงซ้ำอัตโนมัติหากมีรายการงานหลายหน้าโดยไม่ขาดตอน</li>
            <li><strong>ปุ่มแปลงเป็นงานติดตั้ง (Convert to Job):</strong> แปลงใบเสนอราคาเป็น Job และ Contract ได้ใน 1 คลิกเดียว</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'subcontractors',
      title: '8. ฐานข้อมูลช่าง & โปรไฟล์ 360° (Subcontractors Directory)',
      icon: HardHat,
      color: 'text-amber-600 bg-amber-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>ล็อกเลขบัตร ปชช. 13 หลัก:</strong> ป้องกันการพิมพ์เกิน 13 หลัก</li>
            <li><strong>โปรไฟล์ 360° (<code>/subcontractors/[id]</code>):</strong> สรุปยอดเงินสัญญารวมทั้งหมด, เบิกจ่ายสะสมแล้ว, และยอดคงเหลือ</li>
            <li><strong>บันทึกประวัติราคาต่อหน่วยย้อนหลัง (Unit Rate History):</strong> บันทึกราคาที่ช่างคนนี้เคยเสนอในแต่ละรหัสรายการย้อนหลังทุกงาน</li>
            <li><strong>ตารางคิวงานเข้าหน้างาน:</strong> แสดงรายการงานทั้งหมดที่ช่างมีคิวเข้าทำเพื่อป้องกันการนัดคิวงานซ้ำซ้อน</li>
            <li><strong>ปุ่มลบข้อมูลช่าง (Trash):</strong> สามารถลบช่างที่ไม่ใช้งานได้โดยตรงพร้อมระบบยืนยันความปลอดภัย</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'items-benchmark',
      title: '9. คลังรหัสรายการ & เปรียบเทียบราคาค่าแรง (Item Master & Price Benchmark)',
      icon: Layers,
      color: 'text-purple-600 bg-purple-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>คลังรหัสรายการ (<code>/items</code>):</strong> จัดการรหัสงาน เช่น <code>ITEM-WOOD-001</code>, <code>ITEM-CEIL-001</code> แสดงราคากลาง ราคาต่ำสุด และราคาเฉลี่ย</li>
            <li><strong>ระบบเปรียบเทียบราคาช่าง (<code>/price-benchmark</code>):</strong> กราฟแท่งเปรียบเทียบราคาของช่างทุกคน พร้อมไฮไลต์เหรียญทอง 🥇 ช่างที่คิดราคาถูกที่สุด เพื่อช่วยเลือกช่างที่คุ้มค่าที่สุด</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'excel-import',
      title: '10. ระบบนำเข้าข้อมูลผ่าน Excel อัตโนมัติ (Auto Excel Importer)',
      icon: FileSpreadsheet,
      color: 'text-emerald-600 bg-emerald-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <ol className="list-decimal pl-5 space-y-1.5">
            <li>ไปที่เมนู <strong>"นำเข้า Excel จัดกลุ่ม"</strong> (<code>/import-excel</code>) แล้วคลิกดาวน์โหลดไฟล์แม่แบบ (.xlsx)</li>
            <li>กรอกข้อมูลรายการงาน ช่าง และราคาลงในไฟล์ Excel</li>
            <li>อัปโหลดไฟล์กลับเข้าสู่ระบบ ระบบจะ <strong>จัดกลุ่ม (Group By)</strong> ช่าง, บริษัท, และงานติดตั้งให้อัตโนมัติ</li>
          </ol>
        </div>
      ),
    },
    {
      id: 'companies',
      title: '11. การจัดการข้อมูลบริษัทผู้ว่าจ้าง (Companies Setup)',
      icon: Building2,
      color: 'text-blue-600 bg-blue-50',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <p>
            จัดการข้อมูลนิติบุคคล เลขผู้เสียภาษี 13 หลัก ที่อยู่สำนักงาน และบัญชีธนาคารของบริษัท สำหรับใช้เป็นข้อมูลผู้ว่าจ้างในเอกสารและสัญญา (<code>/companies</code>)
          </p>
        </div>
      ),
    },
    {
      id: 'faq',
      title: '12. คำถามที่พบบ่อย (FAQ & Best Practices)',
      icon: HelpCircle,
      color: 'text-slate-600 bg-slate-100',
      content: (
        <div className="space-y-3 text-xs leading-relaxed text-slate-700">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 block">Q: สามารถเซฟใบเสนอราคาหรือใบสำคัญจ่ายเป็นไฟล์ PDF ได้อย่างไร?</strong>
            <p className="text-slate-600">
              กดปุ่ม <strong>"พิมพ์เอกสาร / บันทึก PDF (A4)"</strong> ในหน้าเอกสาร จากนั้นในหน้าต่างสั่งพิมพ์ของเบราว์เซอร์ ให้เลือกเครื่องพิมพ์เป็น <strong>"Save as PDF"</strong> ขนาด <strong>A4</strong> แล้วกด Save
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <strong className="text-slate-900 block">Q: หากจ่ายเงินค่างวดให้ช่างผิด สามารถแก้ไขได้อย่างไร?</strong>
            <p className="text-slate-600">
              ไปที่หน้างานติดตั้ง (<code>/jobs/[id]</code>) ในตารางประวัติการจ่ายเงิน ให้คลิกปุ่ม <strong>รูปดินสอ (แก้ไข)</strong> ที่งวดนั้น ระบุยอดเงินที่ถูกต้องและกรอกเหตุผลในการแก้ไข จากนั้นกดยืนยัน ระบบจะบันทึกประวัติ Audit Trail ให้อัตโนมัติ
            </p>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return s.title.toLowerCase().includes(term) || s.id.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-blue-600" />
            คู่มือการใช้งานระบบ PRO-INSTALL Platform ฉบับสมบูรณ์
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            เอกสารแนะนำการใช้งานทุกฟังก์ชัน &bull; การผูกเลข SO &bull; ตารางงานช่าง &bull; การเงินและการพิมพ์ A4
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            พิมพ์คู่มือ / บันทึก PDF
          </button>
        </div>
      </div>

      {/* Quick Search in Manual */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ค้นหาหัวข้อในคู่มือ (เช่น SO, ตารางงาน, จ่ายเงินงวด, ใบเสนอราคา, หัก ณ ที่จ่าย, Excel)..."
          className="w-full text-xs text-slate-900 focus:outline-none bg-transparent placeholder:text-slate-400 font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-700 font-bold px-2"
          >
            ล้างคำค้น
          </button>
        )}
      </div>

      {/* Main Grid: Sticky Left TOC + Right Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sticky Table of Contents */}
        <div className="lg:col-span-1 space-y-3 no-print">
          <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm sticky top-6 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
              สารบัญคู่มือ (Table of Contents)
            </h3>
            <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/70 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{s.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content Cards */}
        <div className="lg:col-span-3 space-y-6">
          {filteredSections.map((s) => {
            const Icon = s.icon;

            return (
              <div
                key={s.id}
                id={s.id}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4 scroll-mt-6"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                  <div className={`p-2.5 rounded-2xl ${s.color} border border-slate-200 flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {s.title}
                  </h2>
                </div>

                <div>{s.content}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

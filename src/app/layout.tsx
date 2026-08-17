import type { Metadata } from 'next';
import './globals.css';
import { CompanyProvider } from '@/components/CompanyContext';
import { Sidebar } from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'PRO-INSTALL | ระบบบริหารงานติดตั้ง จ่ายเงินช่าง & ออกใบเสนอราคา',
  description:
    'ระบบบริหารจัดการงานติดตั้ง, บันทึกการจ่ายเงินช่างแบบไม่จำกัดงวด, เปรียบเทียบราคาค่าแรง, ออกใบเสนอราคาแทนช่าง และนำเข้าข้อมูล Excel แบบจัดกลุ่มอัตโนมัติ',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50/70 text-slate-900 antialiased flex font-sans selection:bg-blue-600 selection:text-white">
        <CompanyProvider>
          {/* Left Sidebar */}
          <Sidebar />

          {/* Main Area - Full Edge-to-Edge Fluid Width */}
          <div className="flex-1 flex flex-col lg:pl-72 min-h-screen w-full transition-all">
            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>

            {/* Footer */}
            <footer className="no-print border-t border-slate-200 bg-white/80 py-4 text-center text-xs text-slate-500">
              <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>PRO-INSTALL Platform &bull; ระบบบริหารงานติดตั้งและจัดการสัญญารับเหมาช่วง</div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Multi-Item Subcontractors &bull; Auto Excel Importer &bull; WHT 3%
                </div>
              </div>
            </footer>
          </div>
        </CompanyProvider>
      </body>
    </html>
  );
}

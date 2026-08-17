'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  FileText,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Building2,
  HardHat,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { QuotationA4View } from '@/components/QuotationA4View';
import { formatCurrency, formatThaiDate } from '@/lib/utils';

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quotationId = params.id as string;

  const [quotation, setQuotation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const fetchQuotation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quotations/${quotationId}`);
      if (!res.ok) throw new Error('ไม่พบใบเสนอราคาที่ระบุ');
      const data = await res.json();
      setQuotation(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quotationId) fetchQuotation();
  }, [quotationId]);

  const handleConvertToJob = async () => {
    if (!confirm('ต้องการแปลงใบเสนอราคานี้เป็น งานติดตั้ง และ สัญญาจ้างช่าง ทันทีใช่หรือไม่?')) {
      return;
    }

    setConverting(true);
    try {
      const res = await fetch(`/api/quotations/${quotationId}/convert`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'แปลงเป็นงานไม่สำเร็จ');

      router.push(`/jobs/${data.job.id}`);
    } catch (err: any) {
      alert(err.message || 'เกิดข้อผิดพลาดในการแปลงเป็นงานติดตั้ง');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-sm font-medium">กำลังโหลดใบเสนอราคา...</div>;
  }

  if (errorMsg || !quotation) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">ไม่พบใบเสนอราคา</h2>
        <Link
          href="/quotations"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> กลับหน้ารายการใบเสนอราคา
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* A4 Printable Document View with onRefresh */}
      <div className="max-w-4xl mx-auto">
        <QuotationA4View
          quotation={quotation}
          onConvert={handleConvertToJob}
          converting={converting}
          onRefresh={fetchQuotation}
        />
      </div>
    </div>
  );
}

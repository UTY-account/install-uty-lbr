'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { formatThaiIDCard } from '@/lib/utils';

interface IDCardUploadModalProps {
  subcontractor: {
    id: string;
    name: string;
    idCard: string;
    idCardPhotoUrl?: string | null;
    idCardStatus: string;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function IDCardUploadModal({ subcontractor, onClose, onSuccess }: IDCardUploadModalProps) {
  const [photoUrl, setPhotoUrl] = useState(subcontractor.idCardPhotoUrl || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sampleCardUrls = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) {
      setErrorMsg('กรุณาแนบรูปถ่ายหรือระบุลิงก์รูปบัตรประชาชน');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/subcontractors/${subcontractor.id}/verify-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCardPhotoUrl: photoUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'ยืนยันไม่สำเร็จ');

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">แนบรูปบัตรประชาชนช่าง</h3>
              <p className="text-xs text-slate-500">{subcontractor.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
            <div>
              <span className="text-slate-500 block">เลขประจำตัวประชาชน 13 หลัก:</span>
              <span className="font-mono font-bold text-sm text-slate-900">{formatThaiIDCard(subcontractor.idCard)}</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
              รอแนบรูปบัตร ปชช.
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Upload Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              อัปโหลดไฟล์รูปภาพ หรือระบุ URL รูปภาพ
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="idcard-file-input"
              />
              <label
                htmlFor="idcard-file-input"
                className="cursor-pointer flex flex-col items-center gap-2 text-xs text-slate-600 hover:text-slate-900"
              >
                <Upload className="w-8 h-8 text-blue-600" />
                <span className="font-bold text-blue-600">คลิกเพื่อเลือกไฟล์รูปถ่ายบัตร ปชช.</span>
                <span className="text-[11px] text-slate-400">PNG, JPG, WebP ขนาดไม่เกิน 5MB</span>
              </label>
            </div>

            <div className="pt-2">
              <label className="text-xs text-slate-500 block mb-1">หรือระบุ URL รูปภาพโดยตรง:</label>
              <input
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/idcard.jpg"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Sample Selector */}
          <div className="pt-1">
            <span className="text-[11px] text-slate-500 block mb-1.5">ตัวอย่างรูปจำลองสำหรับทดสอบ:</span>
            <div className="flex gap-2">
              {sampleCardUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPhotoUrl(url)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 border border-slate-200 font-medium"
                >
                  รูปตัวอย่าง {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Image Preview */}
          {photoUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 p-2 text-center">
              <img
                src={photoUrl}
                alt="ID Card Preview"
                className="max-h-40 mx-auto rounded-lg object-cover shadow-sm"
              />
              <span className="text-[11px] text-emerald-700 font-bold mt-1 block">✓ ตัวอย่างรูปพร้อมบันทึก</span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading || !photoUrl.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all ${
                loading || !photoUrl.trim()
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              {loading ? 'กำลังบันทึก...' : 'ยืนยันและเปลี่ยนเป็นสถานะตรวจสอบแล้ว'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

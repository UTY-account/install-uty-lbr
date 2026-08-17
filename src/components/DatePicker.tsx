'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DatePickerProps {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = 'วว/ดด/ปปปป (DD/MM/YYYY)',
  className = '',
  required = false,
  disabled = false,
}: DatePickerProps) {
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Convert YYYY-MM-DD -> DD/MM/YYYY for display
  const formatDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  const [displayValue, setDisplayValue] = useState(formatDisplay(value));

  useEffect(() => {
    setDisplayValue(formatDisplay(value));
  }, [value]);

  // When user manually types DD/MM/YYYY
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    const clean = input.trim();
    const match = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];
      const iso = `${year}-${month}-${day}`;
      const d = new Date(iso);
      if (!isNaN(d.getTime())) {
        onChange(iso);
      }
    } else if (clean === '') {
      onChange('');
    }
  };

  const handleCalendarClick = () => {
    const el = hiddenInputRef.current;
    if (el && !disabled) {
      try {
        if (typeof (el as any).showPicker === 'function') {
          (el as any).showPicker();
        } else {
          el.focus();
        }
      } catch (_) {
        el.focus();
      }
    }
  };

  const handleHiddenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // YYYY-MM-DD
    onChange(val);
    setDisplayValue(formatDisplay(val));
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        type="text"
        value={displayValue}
        onChange={handleTextChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="w-full px-3 py-2 pr-10 rounded-xl bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition-all placeholder:text-slate-400 placeholder:font-normal"
      />
      <button
        type="button"
        onClick={handleCalendarClick}
        disabled={disabled}
        className="absolute right-2 text-slate-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100"
        title="เลือกวันที่จากปฏิทิน"
      >
        <CalendarIcon className="w-4 h-4" />
      </button>

      {/* Hidden native input for browser calendar picker popup */}
      <input
        ref={hiddenInputRef}
        type="date"
        value={value || ''}
        onChange={handleHiddenDateChange}
        tabIndex={-1}
        className="sr-only"
      />
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Plain money formatter with guaranteed thousand separator comma (e.g. 1,500.00, 25,000.00)
export function formatMoney(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '0.00';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Thai Baht Currency Formatter (e.g. ฿1,500.00, ฿25,000.00)
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '฿0.00';
  return `฿${formatMoney(amount)}`;
}

export function formatNumber(amount: number | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '0.00';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Thai Date Formatter
export function formatThaiDate(date: Date | string | null | undefined, includeTime = false): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  
  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const year = d.getFullYear() + 543;
  
  if (includeTime) {
    const hours = d.getHours().toString().padStart(2, '0');
    const mins = d.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${mins} น.`;
  }
  
  return `${day} ${month} ${year}`;
}

export function formatISODate(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

// 13-digit Thai National ID Formatter (e.g., 1-1004-00123-45-6)
export function formatThaiIDCard(idCard: string | null | undefined): string {
  if (!idCard) return '-';
  const clean = idCard.replace(/\D/g, '');
  if (clean.length !== 13) return idCard;
  return `${clean.substring(0, 1)}-${clean.substring(1, 5)}-${clean.substring(5, 10)}-${clean.substring(10, 12)}-${clean.substring(12, 13)}`;
}

// Thai Baht Text Converter (เช่น 12,500.50 -> "หนึ่งหมื่นสองพันห้าร้อยบาทห้าสิบสตางค์")
export function thaiBahtText(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return 'ศูนย์บาทถ้วน';
  if (num === 0) return 'ศูนย์บาทถ้วน';
  
  const isNegative = num < 0;
  num = Math.abs(num);
  
  const numbers = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  
  const split = num.toFixed(2).split('.');
  const baht = split[0];
  const satang = split[1];
  
  let result = '';
  
  function convertGroup(nStr: string): string {
    let text = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr[i], 10);
      const pos = len - i - 1;
      
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1 && parseInt(nStr[len - 2], 10) !== 0) {
          text += 'เอ็ด';
        } else if (pos === 1 && digit === 1) {
          text += '';
        } else if (pos === 1 && digit === 2) {
          text += 'ยี่';
        } else {
          text += numbers[digit];
        }
        text += positions[pos];
      }
    }
    return text;
  }
  
  // Convert Baht
  if (parseInt(baht, 10) > 0) {
    if (baht.length > 6) {
      const millionPart = baht.substring(0, baht.length - 6);
      const subMillionPart = baht.substring(baht.length - 6);
      result += convertGroup(millionPart) + 'ล้าน' + convertGroup(subMillionPart);
    } else {
      result += convertGroup(baht);
    }
    result += 'บาท';
  }
  
  // Convert Satang
  const satangNum = parseInt(satang, 10);
  if (satangNum === 0) {
    result += 'ถ้วน';
  } else {
    result += convertGroup(satang) + 'สตางค์';
  }
  
  return (isNegative ? 'ลบ' : '') + result;
}

// Generate code with format [COMP_CODE]-JOB-YYYYMM-XXXX
export function formatCode(prefix: string, compCode: string, seq: number, date = new Date()): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seqStr = seq.toString().padStart(4, '0');
  return `${compCode}-${prefix}-${year}${month}-${seqStr}`;
}

// Generate quotation code with requested format [COMP_CODE]-QT-YYMM-XXXX or [COMP_CODE]-QT-[SO_NO]-[SEQ]
export function formatQuotationCode(
  compCode: string,
  seq: number,
  date = new Date(),
  soNumber?: string | null,
  contractorSeq = 1
): string {
  if (soNumber && soNumber.trim()) {
    const cleanSO = soNumber.trim();
    const cSeqStr = String(contractorSeq).padStart(2, '0');
    return `${compCode}-QT-${cleanSO}-${cSeqStr}`;
  }
  const year2Digits = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seqStr = seq.toString().padStart(4, '0');
  return `${compCode}-QT-${year2Digits}${month}-${seqStr}`;
}

// Generate Job Code with SO [COMP_CODE]-[SO_NO] (e.g. CP1-SO260817-0001) or default [COMP_CODE]-JOB-YYYYMM-XXXX
export function formatJobCodeWithSO(
  compCode: string,
  seq: number,
  soNumber?: string | null,
  date = new Date()
): string {
  if (soNumber && soNumber.trim()) {
    return `${compCode}-${soNumber.trim()}`;
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seqStr = seq.toString().padStart(4, '0');
  return `${compCode}-JOB-${year}${month}-${seqStr}`;
}

// Generate SubContract Code with SO [COMP_CODE]-[SO_NO]-[SEQ] (e.g. CP1-SO260817-0001-01) or default [COMP_CODE]-SC-YYYYMM-XXXX
export function formatSubContractCodeWithSO(
  compCode: string,
  seq: number,
  soNumber?: string | null,
  contractorSeq = 1,
  date = new Date()
): string {
  if (soNumber && soNumber.trim()) {
    const cSeqStr = String(contractorSeq).padStart(2, '0');
    return `${compCode}-${soNumber.trim()}-${cSeqStr}`;
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const seqStr = seq.toString().padStart(4, '0');
  return `${compCode}-SC-${year}${month}-${seqStr}`;
}

import { ProposedResult, ConfirmedResult, MemberStatus, ProgramStatus } from '../types';

/**
 * Quy tắc đánh giá tự động:
 * N = Số chương trình tham gia
 * - N < 2: CHƯA ĐẠT
 * - N >= 2 && N < 3 (N == 2): ĐẠT
 * - N >= 3: ĐỀ XUẤT KHEN THƯỞNG
 */
export function calculateProposedResult(participationCount: number): ProposedResult {
  if (participationCount < 2) {
    return 'CHƯA ĐẠT';
  }
  if (participationCount < 3) {
    return 'ĐẠT';
  }
  return 'ĐỀ XUẤT KHEN THƯỞNG';
}

export function getProposedBadgeStyle(result: ProposedResult): {
  bg: string;
  text: string;
  border: string;
  badgeClass: string;
} {
  switch (result) {
    case 'ĐỀ XUẤT KHEN THƯỞNG':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    case 'ĐẠT':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'CHƯA ĐẠT':
    default:
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      };
  }
}

export function getConfirmedBadgeStyle(result: ConfirmedResult): {
  bg: string;
  text: string;
  border: string;
  badgeClass: string;
} {
  switch (result) {
    case 'Khen thưởng cấp Trường':
    case 'Khen thưởng cấp Khoa':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-300',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 font-semibold',
      };
    case 'Đề xuất khen thưởng':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      };
    case 'Đạt':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      };
    case 'Chưa đạt':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      };
    case 'Chưa xác nhận':
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-600',
        border: 'border-slate-300',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-300 italic',
      };
  }
}

export function getMemberStatusBadge(status: MemberStatus): string {
  switch (status) {
    case 'Đang sinh hoạt':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Tạm nghỉ':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Đã chuyển sinh hoạt':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

export function getProgramStatusBadge(status: ProgramStatus): string {
  switch (status) {
    case 'Sắp diễn ra':
      return 'bg-sky-100 text-sky-800 border-sky-300';
    case 'Đang diễn ra':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse';
    case 'Đã hoàn thành':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'Đã hủy':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

export function formatDateVN(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export function formatOfficialDateVN(date: Date = new Date()): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `ngày ${day} tháng ${month} năm ${year}`;
}

import * as XLSX from 'xlsx';
import { Member, Unit, Program, ProgramParticipant, Evaluation } from '../types';
import { formatDateVN, calculateProposedResult } from './evaluation';

export interface ExcelExportOptions {
  fileName?: string;
  unitId?: string;
  programId?: string;
  statusFilter?: string;
  evaluationFilter?: string;
}

/**
 * 1. Xuất danh sách đoàn viên
 */
export function exportMembersToExcel(
  members: Member[],
  units: Unit[],
  participants: ProgramParticipant[],
  evaluations: Record<string, Evaluation>,
  options: ExcelExportOptions = {}
) {
  // Apply filters
  let filtered = [...members];
  if (options.unitId && options.unitId !== 'all') {
    filtered = filtered.filter(m => m.unit_id === options.unitId);
  }
  if (options.statusFilter && options.statusFilter !== 'all') {
    filtered = filtered.filter(m => m.status === options.statusFilter);
  }

  const dataRows = filtered.map((m, index) => {
    const unit = units.find(u => u.id === m.unit_id);
    const count = participants.filter(p => p.member_id === m.id).length;
    const proposed = calculateProposedResult(count);
    const evalItem = evaluations[m.id];
    const confirmed = evalItem?.confirmed_result || 'Chưa xác nhận';

    return {
      'STT': index + 1,
      'Mã đoàn viên': m.member_code,
      'Họ và tên': m.full_name,
      'Ngày sinh': formatDateVN(m.date_of_birth),
      'Giới tính': m.gender,
      'Mã sinh viên': m.student_code,
      'Lớp': m.class,
      'Khoa': m.faculty,
      'Đơn vị / Chi đoàn': unit?.unit_name || 'N/A',
      'Chức vụ': m.position,
      'Số chương trình tham gia': count,
      'Kết quả đề xuất': proposed,
      'Kết quả xác nhận': confirmed,
      'Số điện thoại': m.phone,
      'Email': m.email,
      'Trạng thái': m.status,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  // Auto-fit column widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 15 }, // Mã ĐV
    { wch: 24 }, // Họ tên
    { wch: 13 }, // Ngày sinh
    { wch: 10 }, // Giới tính
    { wch: 14 }, // MSSV
    { wch: 12 }, // Lớp
    { wch: 25 }, // Khoa
    { wch: 32 }, // Đơn vị
    { wch: 18 }, // Chức vụ
    { wch: 14 }, // Số CT
    { wch: 24 }, // Đề xuất
    { wch: 24 }, // Xác nhận
    { wch: 14 }, // Phone
    { wch: 28 }, // Email
    { wch: 16 }, // Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách đoàn viên');

  const filename = options.fileName || `BaoCao_DanhSachDoanVien_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * 2. Xuất báo cáo tham gia chương trình
 */
export function exportParticipationsToExcel(
  participants: ProgramParticipant[],
  programs: Program[],
  members: Member[],
  units: Unit[],
  options: ExcelExportOptions = {}
) {
  let filtered = [...participants];
  if (options.programId && options.programId !== 'all') {
    filtered = filtered.filter(p => p.program_id === options.programId);
  }
  if (options.unitId && options.unitId !== 'all') {
    filtered = filtered.filter(p => {
      const member = members.find(m => m.id === p.member_id);
      return member?.unit_id === options.unitId;
    });
  }

  const dataRows = filtered.map((p, index) => {
    const prog = programs.find(pr => pr.id === p.program_id);
    const member = members.find(m => m.id === p.member_id);
    const unit = units.find(u => u.id === member?.unit_id);

    return {
      'STT': index + 1,
      'Mã chương trình': prog?.program_code || p.program_id,
      'Tên chương trình': prog?.program_name || 'N/A',
      'Mã đoàn viên': member?.member_code || 'N/A',
      'Họ và tên': member?.full_name || 'N/A',
      'Mã sinh viên': member?.student_code || 'N/A',
      'Lớp': member?.class || 'N/A',
      'Đơn vị': unit?.unit_name || 'N/A',
      'Ngày tham gia': formatDateVN(p.participation_date),
      'Trạng thái tham gia': p.status,
      'Ghi chú': p.note || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 16 }, // Mã CT
    { wch: 38 }, // Tên CT
    { wch: 15 }, // Mã ĐV
    { wch: 24 }, // Họ tên
    { wch: 14 }, // MSSV
    { wch: 12 }, // Lớp
    { wch: 30 }, // Đơn vị
    { wch: 14 }, // Ngày TG
    { wch: 20 }, // Trạng thái
    { wch: 25 }, // Ghi chú
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tham gia hoạt động');

  const filename = options.fileName || `BaoCao_ThamGiaChuongTrinh_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

/**
 * 3. Xuất báo cáo đánh giá phân loại đoàn viên
 */
export function exportEvaluationsToExcel(
  members: Member[],
  units: Unit[],
  participants: ProgramParticipant[],
  evaluations: Record<string, Evaluation>,
  options: ExcelExportOptions = {}
) {
  let filtered = [...members];
  if (options.unitId && options.unitId !== 'all') {
    filtered = filtered.filter(m => m.unit_id === options.unitId);
  }
  if (options.evaluationFilter && options.evaluationFilter !== 'all') {
    filtered = filtered.filter(m => {
      const count = participants.filter(p => p.member_id === m.id).length;
      const proposed = calculateProposedResult(count);
      return proposed === options.evaluationFilter;
    });
  }

  const dataRows = filtered.map((m, index) => {
    const unit = units.find(u => u.id === m.unit_id);
    const count = participants.filter(p => p.member_id === m.id).length;
    const proposed = calculateProposedResult(count);
    const evalItem = evaluations[m.id];
    const confirmed = evalItem?.confirmed_result || 'Chưa xác nhận';

    return {
      'STT': index + 1,
      'Mã đoàn viên': m.member_code,
      'Họ và tên': m.full_name,
      'Mã sinh viên': m.student_code,
      'Lớp': m.class,
      'Đơn vị': unit?.unit_name || 'N/A',
      'Số chương trình tham gia': count,
      'Đề xuất hệ thống': proposed,
      'Kết quả xác nhận': confirmed,
      'Người đánh giá': evalItem?.evaluator || '',
      'Ngày đánh giá': formatDateVN(evalItem?.evaluation_date || ''),
      'Nhận xét': evalItem?.comment || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataRows);

  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 15 }, // Mã ĐV
    { wch: 24 }, // Họ tên
    { wch: 14 }, // MSSV
    { wch: 12 }, // Lớp
    { wch: 32 }, // Đơn vị
    { wch: 14 }, // Số CT
    { wch: 24 }, // Đề xuất
    { wch: 24 }, // Xác nhận
    { wch: 22 }, // Người đánh giá
    { wch: 14 }, // Ngày đánh giá
    { wch: 35 }, // Nhận xét
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Đánh giá xếp loại');

  const filename = options.fileName || `BaoCao_DanhGiaDoanVien_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

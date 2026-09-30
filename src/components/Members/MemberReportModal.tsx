import React, { useRef, useState } from 'react';
import { 
  X, 
  Printer, 
  FileText, 
  Download, 
  Award, 
  Calendar, 
  Building2, 
  User, 
  CheckCircle, 
  Clock, 
  MapPin,
  Sparkles,
  QrCode,
  FileDown
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Member, Unit } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  formatDateVN, 
  formatOfficialDateVN, 
  getProposedBadgeStyle, 
  getConfirmedBadgeStyle,
  getProgramStatusBadge 
} from '../../utils/evaluation';
import { exportElementToPdf } from '../../utils/pdfExport';
import { exportPersonalReportDocx } from '../../utils/docxExport';

interface MemberReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberReportModal: React.FC<MemberReportModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const { units, getMemberPrograms, getMemberEvaluation, showToast } = useApp();
  const reportContentRef = useRef<HTMLDivElement>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  if (!isOpen || !member) return null;

  const unit = units.find(u => u.id === member.unit_id);
  const participationHistory = getMemberPrograms(member.id);
  const evaluation = getMemberEvaluation(member.id);
  const proposedBadge = getProposedBadgeStyle(evaluation.proposed_result);
  const confirmedBadge = getConfirmedBadgeStyle(evaluation.confirmed_result);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    showToast('Đang khởi tạo tệp Word (.docx) cá nhân chuẩn Nghị định 30...', 'info');
    try {
      await exportPersonalReportDocx(
        member,
        unit,
        participationHistory,
        evaluation,
        `BaoCao_HoatDong_${member.student_code}_${member.full_name.replace(/\s+/g, '_')}.docx`
      );
      showToast('Đã tải xuống thành công tệp Word (.docx)!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Có lỗi xảy ra khi tạo tệp Word', 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportContentRef.current) return;
    setIsExportingPdf(true);
    showToast('Đang khởi tạo tệp báo cáo PDF cá nhân chuẩn Nghị định 30...', 'info');
    try {
      await exportElementToPdf(
        reportContentRef.current,
        `BaoCao_HoatDong_${member.student_code}_${member.full_name.replace(/\s+/g, '_')}.pdf`
      );
      showToast('Đã tải xuống thành công tệp PDF!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Chuyển sang giao diện in / lưu PDF...', 'info');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportPersonalExcel = () => {
    const dataRows = participationHistory.map(({ participant, program }, index) => ({
      'STT': index + 1,
      'Mã chương trình': program.program_code,
      'Tên chương trình': program.program_name,
      'Thời gian tổ chức': formatDateVN(program.start_date) + (program.end_date && program.end_date !== program.start_date ? ` - ${formatDateVN(program.end_date)}` : ''),
      'Địa điểm': program.location,
      'Đơn vị tổ chức': program.organizer,
      'Vai trò / Trạng thái': participant.status,
      'Ghi chú': participant.note || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 38 },
      { wch: 22 },
      { wch: 28 },
      { wch: 28 },
      { wch: 22 },
      { wch: 25 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hoạt động tham gia');
    XLSX.writeFile(workbook, `BaoCao_HoatDong_${member.student_code}_${member.full_name.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <FileText className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                Báo Cáo Tham Gia Hoạt Động Của Đoàn Viên
              </h2>
              <p className="text-xs text-blue-200">
                Phiếu xác nhận quá trình sinh hoạt & thành tích phong trào thanh niên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-60 cursor-pointer"
              title="Tải tệp Word (.docx) về máy tính"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-200" />
              <span>{isExportingDocx ? 'Đang tạo Word...' : 'Tải File Word (.docx)'}</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs disabled:opacity-60 cursor-pointer"
              title="Tải tệp PDF về máy tính"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải File PDF (.pdf)'}</span>
            </button>

            <button
              onClick={handleExportPersonalExcel}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Xuất file Excel cho đoàn viên"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="In hoặc lưu file PDF (khổ A4)"
            >
              <Printer className="w-3.5 h-3.5 text-slate-950" />
              <span>In Văn Bản (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body: Administrative Document Layout according to Decree 30/2020 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-10 bg-slate-100/60 flex justify-center">
          <div ref={reportContentRef} className="admin-document bg-white w-full max-w-[210mm] p-6 sm:p-12 shadow-md border border-slate-300 font-admin text-black leading-normal">
            
            {/* Header: Organization & National Emblem */}
            <div className="grid grid-cols-12 gap-2 text-center items-start mb-6">
              <div className="col-span-5 text-center">
                <div className="font-bold text-[12pt] uppercase tracking-tight">
                  ĐOÀN TNCS HỒ CHÍ MINH
                </div>
                <div className="font-bold text-[11pt] uppercase text-blue-900">
                  {unit?.unit_name || 'ĐOÀN TRƯỜNG ĐẠI HỌC'}
                </div>
                <div className="w-24 mx-auto border-b border-black my-1"></div>
                <div className="text-[10pt] font-mono mt-0.5">
                  Mã ĐV: {member.member_code}
                </div>
              </div>

              <div className="col-span-7 text-center">
                <div className="font-bold text-[11pt] uppercase tracking-wide">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </div>
                <div className="font-bold text-[12pt]">
                  Độc lập - Tự do - Hạnh phúc
                </div>
                <div className="w-36 mx-auto border-b border-black my-1"></div>
                <div className="text-[11pt] italic mt-0.5">
                  Đà Nẵng, {formatOfficialDateVN()}
                </div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center my-5">
              <h1 className="text-[15pt] font-bold uppercase tracking-wide">
                PHIẾU BÁO CÁO KẾT QUẢ THAM GIA HOẠT ĐỘNG ĐOÀN
              </h1>
              <p className="text-[12pt] font-semibold italic mt-0.5">
                Năm học: 2025 - 2026
              </p>
            </div>

            {/* Personal Information Section */}
            <div className="border border-slate-300 rounded-lg p-4 mb-5 bg-slate-50/50 text-[12pt]">
              <div className="font-bold uppercase text-[11pt] text-blue-950 mb-2 border-b border-slate-200 pb-1">
                I. THÔNG TIN ĐOÀN VIÊN:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
                <div>Họ và tên: <strong className="text-[13pt]">{member.full_name}</strong></div>
                <div>Giới tính: <strong>{member.gender}</strong> • Ngày sinh: <strong>{formatDateVN(member.date_of_birth)}</strong></div>
                <div>Mã số sinh viên (MSSV): <strong className="font-mono">{member.student_code}</strong></div>
                <div>Lớp: <strong>{member.class}</strong></div>
                <div>Khoa / Viện: <strong>{member.faculty}</strong></div>
                <div>Chi đoàn sinh hoạt: <strong>{unit?.unit_name || 'N/A'}</strong></div>
                <div>Chức vụ Đoàn: <strong className="text-blue-900">{member.position}</strong></div>
                <div>Ngày vào Đoàn: <strong>{formatDateVN(member.union_join_date)}</strong></div>
                <div>Số điện thoại: <strong>{member.phone || 'Chưa cập nhật'}</strong></div>
                <div>Email: <strong>{member.email || 'Chưa cập nhật'}</strong></div>
              </div>
            </div>

            {/* Evaluation Summary Box */}
            <div className="border border-slate-300 rounded-lg p-4 mb-5 bg-blue-50/40 text-[12pt]">
              <div className="font-bold uppercase text-[11pt] text-blue-950 mb-2 border-b border-blue-200 pb-1">
                II. TỔNG KẾT ĐÁNH GIÁ RÈN LUYỆN:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[11pt] text-slate-600">Tổng số chương trình đã tham gia:</div>
                  <strong className="text-[16pt] text-blue-700 font-black">{participationHistory.length}</strong>
                  <span className="text-[11pt] text-slate-500 block">hoạt động phong trào</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[11pt] text-slate-600">Đề xuất rèn luyện (Tự động):</div>
                  <strong className="text-[13pt] text-amber-800 block mt-1">{evaluation.proposed_result}</strong>
                  <span className="text-[10pt] text-slate-400 block italic">Căn cứ quy chế phân loại Đoàn</span>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[11pt] text-slate-600">Kết quả xác nhận chính thức:</div>
                  <strong className="text-[13pt] text-emerald-800 block mt-1">{evaluation.confirmed_result}</strong>
                  <span className="text-[10pt] text-slate-500 block">Người duyệt: {evaluation.evaluator || 'BCH Đoàn trường'}</span>
                </div>
              </div>

              {evaluation.comment && (
                <div className="mt-3 pt-2 border-t border-blue-200 text-[11pt] text-slate-700 italic">
                  <strong>Nhận xét của Ban Chấp hành:</strong> &quot;{evaluation.comment}&quot;
                </div>
              )}
            </div>

            {/* Participation List Section */}
            <div className="mb-6">
              <div className="font-bold uppercase text-[11pt] text-blue-950 mb-2">
                III. DANH SÁCH CHI TIẾT CÁC CHƯƠNG TRÌNH, HOẠT ĐỘNG ĐÃ THAM GIA:
              </div>

              {participationHistory.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-300 rounded text-slate-500 italic text-[11pt]">
                  Đoàn viên chưa tham gia chương trình hoạt động nào trong học kỳ này.
                </div>
              ) : (
                <table className="w-full border-collapse border border-black text-[11pt]">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-center">
                      <th className="border border-black p-1.5 w-10">STT</th>
                      <th className="border border-black p-1.5 w-24">Mã CT</th>
                      <th className="border border-black p-1.5">Tên chương trình / Hoạt động</th>
                      <th className="border border-black p-1.5 w-24">Thời gian</th>
                      <th className="border border-black p-1.5">Đơn vị tổ chức</th>
                      <th className="border border-black p-1.5 w-32">Trạng thái tham gia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participationHistory.map(({ participant, program }, idx) => (
                      <tr key={participant.id} className="text-center">
                        <td className="border border-black p-1.5">{idx + 1}</td>
                        <td className="border border-black p-1.5 font-mono">{program.program_code}</td>
                        <td className="border border-black p-1.5 text-left font-semibold">
                          {program.program_name}
                          {participant.note && (
                            <span className="block text-[10pt] text-slate-600 font-normal italic">
                              Ghi chú: {participant.note}
                            </span>
                          )}
                        </td>
                        <td className="border border-black p-1.5 font-mono">{formatDateVN(participant.participation_date)}</td>
                        <td className="border border-black p-1.5 text-left">{program.organizer}</td>
                        <td className="border border-black p-1.5 font-medium">{participant.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-12 gap-4 mt-8 pt-4 text-[12pt] page-break-inside-avoid">
              <div className="col-span-6 text-center">
                <div className="font-bold uppercase text-[11pt]">
                  NGƯỜI LẬP PHIẾU BÁO CÁO
                </div>
                <div className="text-[11pt] italic mt-0.5">(Ký và ghi rõ họ tên)</div>
                <div className="h-20"></div>
                <div className="font-bold text-[12pt]">
                  {member.full_name}
                </div>
              </div>

              <div className="col-span-6 text-center">
                <div className="font-bold uppercase text-[11pt]">
                  TM. BAN CHẤP HÀNH CHI ĐOÀN
                </div>
                <div className="font-bold uppercase text-[11pt] text-blue-900">
                  BÍ THƯ
                </div>
                <div className="h-20 flex items-center justify-center">
                  <div className="text-[11pt] text-slate-400 italic">(Đã ký xác nhận)</div>
                </div>
                <div className="font-bold text-[12pt]">
                  {unit?.secretary || 'Ban Chấp hành Chi đoàn'}
                </div>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[10pt] text-slate-400 italic">
              Phiếu báo cáo hoạt động chính thức dùng để cộng điểm rèn luyện và xét thi đua khen thưởng cấp Trường.
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Tổng số chương trình đã tham gia: <strong className="text-blue-700">{participationHistory.length} hoạt động</strong></span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In phiếu báo cáo</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

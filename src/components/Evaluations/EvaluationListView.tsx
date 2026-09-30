import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Search, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  Eye, 
  Edit3, 
  FileSpreadsheet,
  AlertCircle,
  FileCheck2,
  Trophy
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, Evaluation } from '../../types';
import { EvaluationModal } from './EvaluationModal';
import { MemberDetailModal } from '../Members/MemberDetailModal';
import { 
  getProposedBadgeStyle, 
  getConfirmedBadgeStyle, 
  formatDateVN 
} from '../../utils/evaluation';
import { exportEvaluationsToExcel } from '../../utils/excelExport';
import { exportMembersReportPdf } from '../../utils/pdfExport';
import { exportMembersReportDocx } from '../../utils/docxExport';
import { FileText, FileDown } from 'lucide-react';

export const EvaluationListView: React.FC = () => {
  const { 
    members, 
    units, 
    evaluations, 
    getMemberParticipationCount, 
    getMemberEvaluation, 
    batchConfirmAllProposed, 
    participants, 
    currentUser,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedProposed, setSelectedProposed] = useState<string>('all');
  const [selectedConfirmed, setSelectedConfirmed] = useState<string>('all');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const [evaluatingMember, setEvaluatingMember] = useState<Member | null>(null);
  const [memberToView, setMemberToView] = useState<Member | null>(null);

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'CAN_BO_DOAN';

  const rows = useMemo(() => {
    return members.map(m => {
      const unit = units.find(u => u.id === m.unit_id);
      const evalItem = getMemberEvaluation(m.id);
      return {
        member: m,
        unit,
        evaluation: evalItem,
      };
    });
  }, [members, units, getMemberEvaluation]);

  const filteredRows = useMemo(() => {
    return rows.filter(({ member, unit, evaluation }) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        member.full_name.toLowerCase().includes(q) ||
        member.member_code.toLowerCase().includes(q) ||
        member.student_code.toLowerCase().includes(q) ||
        member.class.toLowerCase().includes(q);

      const matchesUnit = selectedUnit === 'all' || member.unit_id === selectedUnit;
      const matchesProposed = selectedProposed === 'all' || evaluation.proposed_result === selectedProposed;
      const matchesConfirmed = selectedConfirmed === 'all' || evaluation.confirmed_result === selectedConfirmed;

      return matchesSearch && matchesUnit && matchesProposed && matchesConfirmed;
    });
  }, [rows, searchTerm, selectedUnit, selectedProposed, selectedConfirmed]);

  const handleExportExcel = () => {
    exportEvaluationsToExcel(members, units, participants, evaluations, {
      unitId: selectedUnit,
      evaluationFilter: selectedProposed,
    });
  };

  const handleExportPdf = async () => {
    if (filteredRows.length === 0) {
      showToast('Danh sách đánh giá trống, không thể xuất PDF', 'error');
      return;
    }
    setIsExportingPdf(true);
    showToast('Đang kết xuất báo cáo đánh giá xếp loại ra file PDF...', 'info');
    try {
      const selectedUnitObj = units.find(u => u.id === selectedUnit);
      await exportMembersReportPdf(
        filteredRows.map(r => r.member),
        units,
        participants,
        evaluations,
        {
          title: 'BÁO CÁO KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI ĐOÀN VIÊN',
          unitName: selectedUnitObj ? selectedUnitObj.unit_name : 'ĐOÀN TRƯỜNG ĐẠI HỌC',
          fileName: `BaoCao_DanhGia_DoanVien_${selectedUnit !== 'all' ? selectedUnit : 'ToanTruong'}.pdf`,
        }
      );
      showToast('Đã tải xuống thành công file PDF!', 'success');
    } catch (e) {
      console.error(e);
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    if (filteredRows.length === 0) {
      showToast('Danh sách đánh giá trống, không thể xuất Word', 'error');
      return;
    }
    setIsExportingDocx(true);
    showToast('Đang kết xuất báo cáo đánh giá xếp loại ra file Word (.docx)...', 'info');
    try {
      const selectedUnitObj = units.find(u => u.id === selectedUnit);
      await exportMembersReportDocx(
        filteredRows.map(r => r.member),
        units,
        participants,
        evaluations,
        {
          title: 'BÁO CÁO KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI ĐOÀN VIÊN',
          unitName: selectedUnitObj ? selectedUnitObj.unit_name : 'ĐOÀN TRƯỜNG ĐẠI HỌC',
          fileName: `BaoCao_DanhGia_DoanVien_${selectedUnit !== 'all' ? selectedUnit : 'ToanTruong'}.docx`,
        }
      );
      showToast('Đã tải xuống thành công file Word (.docx)!', 'success');
    } catch (e) {
      console.error(e);
      showToast('Có lỗi xảy ra khi tạo tệp Word', 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            Đánh Giá & Xếp Loại Đoàn Viên
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hệ thống tự động đề xuất dựa trên số lượng chương trình tham gia: <span className="font-semibold text-slate-700">N &lt; 2: Chưa đạt | N = 2: Đạt | N ≥ 3: Khen thưởng</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            title="Xuất bảng đánh giá ra file PDF chuẩn Nghị định 30"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>{isExportingPdf ? 'Đang xuất PDF...' : 'Xuất Báo Cáo PDF'}</span>
          </button>

          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            title="Xuất bảng đánh giá ra file Word (.docx) chuẩn thể thức"
          >
            <FileDown className="w-4 h-4 text-blue-700" />
            <span>{isExportingDocx ? 'Đang xuất Word...' : 'Xuất File Word (.docx)'}</span>
          </button>

          {canManage && (
            <button
              onClick={batchConfirmAllProposed}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md shadow-amber-400/20 transition flex items-center gap-1.5"
              title="Đồng bộ xác nhận kết quả cho toàn bộ đoàn viên theo đề xuất"
            >
              <Sparkles className="w-4 h-4" />
              <span>Duyệt Theo Đề Xuất Tự Động</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên đoàn viên, mã ĐV, MSSV, lớp..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Chi đoàn / Đơn vị:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Tất cả chi đoàn</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.unit_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Đề xuất hệ thống (N):</label>
            <select
              value={selectedProposed}
              onChange={(e) => setSelectedProposed(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Tất cả đề xuất</option>
              <option value="ĐỀ XUẤT KHEN THƯỞNG">Đề xuất khen thưởng (≥ 3 CT)</option>
              <option value="ĐẠT">Đạt (2 CT)</option>
              <option value="CHƯA ĐẠT">Chưa đạt (&lt; 2 CT)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kết quả xác nhận:</label>
            <select
              value={selectedConfirmed}
              onChange={(e) => setSelectedConfirmed(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">Tất cả trạng thái xác nhận</option>
              <option value="Chưa xác nhận">Chưa xác nhận</option>
              <option value="Đề xuất khen thưởng">Đề xuất khen thưởng</option>
              <option value="Khen thưởng cấp Trường">Khen thưởng cấp Trường</option>
              <option value="Khen thưởng cấp Khoa">Khen thưởng cấp Khoa</option>
              <option value="Đạt">Đạt</option>
              <option value="Chưa đạt">Chưa đạt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evaluations Table (Requirement 9: STT | Mã ĐV | Họ và tên | Đơn vị | Số CT tham gia | Đề xuất | Kết quả xác nhận) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Mã ĐV</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Đơn vị / Chi đoàn</th>
                <th className="py-3.5 px-4 text-center">Số CT tham gia</th>
                <th className="py-3.5 px-4">Đề xuất tự động</th>
                <th className="py-3.5 px-4">Kết quả xác nhận</th>
                <th className="py-3.5 px-4">Nhận xét & Người duyệt</th>
                <th className="py-3.5 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Không có dữ liệu đánh giá phù hợp</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ member, unit, evaluation }, idx) => {
                  const proposedBadge = getProposedBadgeStyle(evaluation.proposed_result);
                  const confirmedBadge = getConfirmedBadgeStyle(evaluation.confirmed_result);

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {member.member_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                          <div>
                            <button
                              onClick={() => setMemberToView(member)}
                              className="font-bold text-slate-900 hover:text-blue-600 text-left transition"
                            >
                              {member.full_name}
                            </button>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {member.student_code} • {member.class}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]">
                        {unit?.unit_name || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                          {evaluation.participation_count} CT
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${proposedBadge.badgeClass}`}>
                          {evaluation.proposed_result}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${confirmedBadge.badgeClass}`}>
                          {evaluation.confirmed_result}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="text-slate-800 font-medium truncate" title={evaluation.comment}>
                          {evaluation.comment || '—'}
                        </div>
                        {evaluation.evaluator && (
                          <div className="text-[11px] text-slate-400 truncate">
                            Duyệt: {evaluation.evaluator} ({formatDateVN(evaluation.evaluation_date)})
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setMemberToView(member)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem lịch sử tham gia"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <button
                              onClick={() => setEvaluatingMember(member)}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition flex items-center gap-1"
                              title="Xác nhận / Điều chỉnh kết quả"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Tổng số đoàn viên đánh giá: <strong>{filteredRows.length}</strong></span>
          <span className="italic">Lưu ý: Kết quả đề xuất được tự động tính toán tức thì theo số lượng tham gia</span>
        </div>
      </div>

      {/* Evaluation Modal */}
      {evaluatingMember && (
        <EvaluationModal
          isOpen={true}
          onClose={() => setEvaluatingMember(null)}
          member={evaluatingMember}
          evaluation={getMemberEvaluation(evaluatingMember.id)}
        />
      )}

      {/* Member Details */}
      <MemberDetailModal
        isOpen={!!memberToView}
        onClose={() => setMemberToView(null)}
        member={memberToView}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  CheckCircle2, 
  FileText, 
  Users, 
  CalendarDays, 
  Award,
  Sparkles,
  FileDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  exportMembersToExcel, 
  exportParticipationsToExcel, 
  exportEvaluationsToExcel 
} from '../../utils/excelExport';
import { exportMembersReportDocx } from '../../utils/docxExport';

export const ExcelReportsView: React.FC = () => {
  const { members, units, programs, participants, evaluations, showToast } = useApp();

  const [activeReport, setActiveReport] = useState<'members' | 'participations' | 'evaluations'>('members');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('all');
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  const handleExport = () => {
    if (activeReport === 'members') {
      exportMembersToExcel(members, units, participants, evaluations, {
        unitId: selectedUnit,
        statusFilter: selectedStatus,
      });
    } else if (activeReport === 'participations') {
      exportParticipationsToExcel(participants, programs, members, units, {
        programId: selectedProgram,
        unitId: selectedUnit,
      });
    } else if (activeReport === 'evaluations') {
      exportEvaluationsToExcel(members, units, participants, evaluations, {
        unitId: selectedUnit,
        evaluationFilter: selectedEvaluation,
      });
    }
  };

  const handleExportDocx = async () => {
    setIsExportingDocx(true);
    showToast('Đang kết xuất tệp Word (.docx) chuẩn thể thức...', 'info');
    try {
      let filtered = [...members];
      if (selectedUnit !== 'all') {
        filtered = filtered.filter(m => m.unit_id === selectedUnit);
      }
      if (selectedStatus !== 'all') {
        filtered = filtered.filter(m => m.status === selectedStatus);
      }
      if (selectedEvaluation !== 'all') {
        filtered = filtered.filter(m => evaluations[m.id]?.proposed_result === selectedEvaluation);
      }

      const unitObj = units.find(u => u.id === selectedUnit);
      const title = activeReport === 'evaluations' 
        ? 'BÁO CÁO KẾT QUẢ ĐÁNH GIÁ, XẾP LOẠI ĐOÀN VIÊN'
        : activeReport === 'participations'
        ? 'BÁO CÁO THAM GIA HOẠT ĐỘNG PHONG TRÀO THANH NIÊN'
        : 'BÁO CÁO DANH SÁCH ĐOÀN VIÊN';

      await exportMembersReportDocx(
        filtered,
        units,
        participants,
        evaluations,
        {
          title,
          unitName: unitObj ? unitObj.unit_name : 'ĐOÀN TRƯỜNG ĐẠI HỌC',
          fileName: `BaoCao_${activeReport}_${selectedUnit !== 'all' ? selectedUnit : 'ToanTruong'}.docx`,
        }
      );
      showToast('Đã tải xuống thành công tệp Word (.docx)!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Có lỗi xảy ra khi tạo tệp Word', 'error');
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          Xuất Báo Cáo Thống Kê Định Dạng Excel (.xlsx)
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Xuất báo cáo định dạng bảng tính tương thích Microsoft Excel, Google Sheets, LibreOffice Calc với độ rộng cột chuẩn hóa
        </p>
      </div>

      {/* Report Selection Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type 1: Members */}
        <div
          onClick={() => setActiveReport('members')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
            activeReport === 'members'
              ? 'bg-emerald-50/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              {activeReport === 'members' && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Đang chọn
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">Báo Cáo Danh Sách Đoàn Viên</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Xuất toàn bộ hồ sơ đoàn viên, thông tin sinh viên, chức vụ, số lượng CT tham gia và kết quả xếp loại.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            16 cột dữ liệu tiêu chuẩn
          </div>
        </div>

        {/* Type 2: Participations */}
        <div
          onClick={() => setActiveReport('participations')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
            activeReport === 'participations'
              ? 'bg-emerald-50/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl">
                <CalendarDays className="w-5 h-5" />
              </div>
              {activeReport === 'participations' && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Đang chọn
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">Báo Cáo Tham Gia Chương Trình</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Chi tiết từng lượt tham gia hoạt động phong trào, tình nguyện, hiến máu của các đoàn viên.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Theo dõi chi tiết điểm danh & trạng thái
          </div>
        </div>

        {/* Type 3: Evaluations */}
        <div
          onClick={() => setActiveReport('evaluations')}
          className={`p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
            activeReport === 'evaluations'
              ? 'bg-emerald-50/60 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
              {activeReport === 'evaluations' && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Đang chọn
                </span>
              )}
            </div>
            <h3 className="font-bold text-slate-900 text-base">Báo Cáo Đánh Giá & Xếp Loại</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Báo cáo tổng kết phân loại rèn luyện đoàn viên, danh sách đề xuất khen thưởng và nhận xét của cán bộ.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] font-mono text-slate-500">
            Đề xuất N &lt; 2, N = 2, N ≥ 3
          </div>
        </div>
      </div>

      {/* Filter and Download Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            Tùy Chọn Lọc Dữ Liệu Trước Khi Xuất Excel
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lựa chọn phạm vi dữ liệu bạn muốn trích xuất ra tệp .xlsx
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Unit filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phạm vi Chi đoàn / Đơn vị:
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              <option value="all">Toàn bộ tất cả chi đoàn</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.unit_name}</option>
              ))}
            </select>
          </div>

          {/* Conditional filters */}
          {activeReport === 'members' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái sinh hoạt:
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Đang sinh hoạt">Đang sinh hoạt</option>
                <option value="Tạm nghỉ">Tạm nghỉ</option>
                <option value="Đã chuyển sinh hoạt">Đã chuyển sinh hoạt</option>
              </select>
            </div>
          )}

          {activeReport === 'participations' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chương trình cụ thể:
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">Tất cả chương trình ({programs.length})</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.program_code} - {p.program_name}</option>
                ))}
              </select>
            </div>
          )}

          {activeReport === 'evaluations' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mức đề xuất hệ thống:
              </label>
              <select
                value={selectedEvaluation}
                onChange={(e) => setSelectedEvaluation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="all">Tất cả mức đề xuất</option>
                <option value="ĐỀ XUẤT KHEN THƯỞNG">Đề xuất khen thưởng (≥ 3 CT)</option>
                <option value="ĐẠT">Đạt (2 CT)</option>
                <option value="CHƯA ĐẠT">Chưa đạt (&lt; 2 CT)</option>
              </select>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Hỗ trợ 2 định dạng: <strong className="text-slate-800 font-mono">.xlsx (Excel)</strong> & <strong className="text-blue-800 font-mono">.docx (Word)</strong>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-lg shadow-blue-700/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
              title="Tải xuống tệp văn bản Microsoft Word (.docx)"
            >
              <FileDown className="w-4 h-4 text-blue-200" />
              <span>{isExportingDocx ? 'Đang tạo Word...' : 'Tải Xuống Tệp Word (.docx)'}</span>
            </button>

            <button
              onClick={handleExport}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Xuống Tệp Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

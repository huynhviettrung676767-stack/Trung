import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  FileSpreadsheet, 
  RotateCcw, 
  CheckSquare, 
  Square, 
  Sparkles,
  BarChart3,
  FileText,
  FileDown
} from 'lucide-react';
import { Member } from '../../types';
import { useApp } from '../../context/AppContext';
import { MemberModal } from './MemberModal';
import { MemberDetailModal } from './MemberDetailModal';
import { MemberStatsModal } from './MemberStatsModal';
import { MemberReportModal } from './MemberReportModal';
import { 
  getProposedBadgeStyle, 
  getMemberStatusBadge, 
  formatDateVN 
} from '../../utils/evaluation';
import { exportMembersToExcel } from '../../utils/excelExport';
import { exportMembersReportPdf } from '../../utils/pdfExport';
import { exportMembersReportDocx } from '../../utils/docxExport';

export const MemberListView: React.FC = () => {
  const { 
    members, 
    units, 
    deleteMember, 
    batchDeleteMembers,
    getMemberParticipationCount, 
    getMemberEvaluation, 
    currentUser,
    switchRole,
    participants, 
    evaluations,
    showToast
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<string>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [memberToView, setMemberToView] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // New: Statistics Modal & Member Report Modal
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [memberForReport, setMemberForReport] = useState<Member | null>(null);

  // Multi-select state for batch deletion
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  // Ensure user can manage or automatically grant access
  const ensureManageAccess = () => {
    if (currentUser.role === 'NGUOI_XEM') {
      switchRole('CAN_BO_DOAN');
      showToast('Đã tự động chuyển sang vai trò Cán bộ Đoàn để bạn thực hiện thêm/xóa/sửa!', 'info');
    }
    return true;
  };

  // Unique Faculties for filter
  const faculties = useMemo(() => {
    const list = Array.from(new Set(members.map(m => m.faculty))).filter(Boolean);
    return list;
  }, [members]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !query ||
        member.full_name.toLowerCase().includes(query) ||
        member.member_code.toLowerCase().includes(query) ||
        member.student_code.toLowerCase().includes(query) ||
        member.class.toLowerCase().includes(query) ||
        member.faculty.toLowerCase().includes(query);

      const matchesUnit = selectedUnit === 'all' || member.unit_id === selectedUnit;
      const matchesFaculty = selectedFaculty === 'all' || member.faculty === selectedFaculty;
      const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;

      const evalItem = getMemberEvaluation(member.id);
      const matchesEvaluation = selectedEvaluation === 'all' || evalItem.proposed_result === selectedEvaluation;

      return matchesSearch && matchesUnit && matchesFaculty && matchesStatus && matchesEvaluation;
    });
  }, [members, searchTerm, selectedUnit, selectedFaculty, selectedStatus, selectedEvaluation, getMemberEvaluation]);

  const handleExportExcel = () => {
    exportMembersToExcel(members, units, participants, evaluations, {
      unitId: selectedUnit,
      statusFilter: selectedStatus,
    });
  };

  const handleExportPdf = async () => {
    if (filteredMembers.length === 0) {
      showToast('Danh sách đoàn viên trống, không thể xuất PDF', 'error');
      return;
    }
    setIsExportingPdf(true);
    showToast('Đang khởi tạo tệp báo cáo PDF chuẩn Nghị định 30...', 'info');
    try {
      const selectedUnitObj = units.find(u => u.id === selectedUnit);
      await exportMembersReportPdf(
        filteredMembers,
        units,
        participants,
        evaluations,
        {
          title: 'BÁO CÁO DANH SÁCH ĐOÀN VIÊN & KẾT QUẢ ĐÁNH GIÁ',
          unitName: selectedUnitObj ? selectedUnitObj.unit_name : 'ĐOÀN TRƯỜNG ĐẠI HỌC',
          fileName: `BaoCao_DoanVien_${selectedUnit !== 'all' ? selectedUnit : 'ToanTruong'}.pdf`,
        }
      );
      showToast('Đã tải xuống thành công tệp báo cáo PDF!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Đang chuyển sang giao diện in ấn / lưu PDF...', 'info');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    if (filteredMembers.length === 0) {
      showToast('Danh sách đoàn viên trống, không thể xuất Word', 'error');
      return;
    }
    setIsExportingDocx(true);
    showToast('Đang khởi tạo tệp Word (.docx) chuẩn thể thức Nghị định 30...', 'info');
    try {
      const selectedUnitObj = units.find(u => u.id === selectedUnit);
      await exportMembersReportDocx(
        filteredMembers,
        units,
        participants,
        evaluations,
        {
          title: 'BÁO CÁO DANH SÁCH ĐOÀN VIÊN & KẾT QUẢ ĐÁNH GIÁ',
          unitName: selectedUnitObj ? selectedUnitObj.unit_name : 'ĐOÀN TRƯỜNG ĐẠI HỌC',
          fileName: `BaoCao_DoanVien_${selectedUnit !== 'all' ? selectedUnit : 'ToanTruong'}.docx`,
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

  // Single delete
  const handleConfirmDelete = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
      setSelectedMemberIds(prev => prev.filter(id => id !== memberToDelete.id));
      setMemberToDelete(null);
    }
  };

  // Batch delete
  const handleConfirmBatchDelete = () => {
    batchDeleteMembers(selectedMemberIds);
    setSelectedMemberIds([]);
    setShowBatchDeleteModal(false);
  };

  // Select all toggle
  const isAllFilteredSelected = 
    filteredMembers.length > 0 && 
    filteredMembers.every(m => selectedMemberIds.includes(m.id));

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(filteredMembers.map(m => m.id));
    }
  };

  const handleToggleMember = (id: string) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenAdd = () => {
    ensureManageAccess();
    setMemberToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    ensureManageAccess();
    setMemberToEdit(member);
    setIsAddModalOpen(true);
  };

  const handleOpenDelete = (member: Member) => {
    ensureManageAccess();
    setMemberToDelete(member);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            Quản Lý Hồ Sơ Đoàn Viên
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-800">{members.length}</strong> đoàn viên ({filteredMembers.length} kết quả phù hợp)
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Nút Thống Kê Đoàn Viên */}
          <button
            onClick={() => setIsStatsModalOpen(true)}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Xem báo cáo thống kê cơ cấu, giới tính, xếp loại và tỷ lệ tham gia của đoàn viên"
          >
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Thống Kê Đoàn Viên</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            title="Xuất danh sách đoàn viên ra tệp PDF chuẩn Nghị định 30"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>{isExportingPdf ? 'Đang xuất PDF...' : 'Xuất Báo Cáo PDF'}</span>
          </button>

          {/* Export Word Button */}
          <button
            onClick={handleExportDocx}
            disabled={isExportingDocx}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
            title="Xuất danh sách đoàn viên ra tệp Word (.docx) chuẩn thể thức"
          >
            <FileDown className="w-4 h-4 text-blue-700" />
            <span>{isExportingDocx ? 'Đang xuất Word...' : 'Xuất File Word (.docx)'}</span>
          </button>

          {/* Primary Add Member Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Đoàn Viên</span>
          </button>
        </div>
      </div>

      {/* Batch Action Banner when items are selected */}
      {selectedMemberIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-blue-900">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedMemberIds.length}
            </span>
            <span>Đã chọn {selectedMemberIds.length} đoàn viên</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMemberIds([])}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-blue-100 rounded-lg transition"
            >
              Bỏ chọn
            </button>
            <button
              onClick={() => setShowBatchDeleteModal(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa {selectedMemberIds.length} đoàn viên đã chọn</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, mã đoàn viên (ĐV2026-...), mã sinh viên (MSSV), lớp, khoa..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Xóa
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Chi đoàn / Đơn vị:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả chi đoàn ({units.length})</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.unit_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Khoa / Bộ môn:</label>
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả khoa ({faculties.length})</option>
              {faculties.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Đề xuất rèn luyện:</label>
            <select
              value={selectedEvaluation}
              onChange={(e) => setSelectedEvaluation(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả xếp loại</option>
              <option value="ĐỀ XUẤT KHEN THƯỞNG">Khen thưởng (≥ 3 CT)</option>
              <option value="ĐẠT">Đạt (2 CT)</option>
              <option value="CHƯA ĐẠT">Chưa đạt (&lt; 2 CT)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trạng thái sinh hoạt:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đang sinh hoạt">Đang sinh hoạt</option>
              <option value="Tạm nghỉ">Tạm nghỉ</option>
              <option value="Đã chuyển sinh hoạt">Đã chuyển sinh hoạt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Toolbar with Quick Stats & Nút Thống Kê */}
        <div className="p-3.5 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Bảng Quản Lý Đoàn Viên</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-600">
              Tổng số: <strong className="text-slate-900">{filteredMembers.length}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-amber-700 font-medium">
              Đề xuất khen (≥3 CT): <strong>{filteredMembers.filter(m => getMemberParticipationCount(m.id) >= 3).length}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-emerald-700 font-medium">
              Đạt (2 CT): <strong>{filteredMembers.filter(m => getMemberParticipationCount(m.id) === 2).length}</strong>
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-rose-700 font-medium">
              Chưa đạt (&lt;2 CT): <strong>{filteredMembers.filter(m => getMemberParticipationCount(m.id) < 2).length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStatsModalOpen(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
              title="Mở biểu đồ thống kê cơ cấu đoàn viên"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Xem Thống Kê Chi Tiết</span>
            </button>

            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-60"
              title="Xuất bảng danh sách đoàn viên hiện tại ra tệp PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Xuất Báo Cáo PDF'}</span>
            </button>

            <button
              onClick={handleExportDocx}
              disabled={isExportingDocx}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-60"
              title="Xuất bảng danh sách đoàn viên hiện tại ra tệp Word (.docx)"
            >
              <FileDown className="w-3.5 h-3.5 text-blue-200" />
              <span>{isExportingDocx ? 'Đang tạo Word...' : 'Xuất File Word (.docx)'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-slate-500 hover:text-blue-600"
                    title="Chọn tất cả đoàn viên hiển thị"
                  >
                    {isAllFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3.5 px-2 w-10 text-center">STT</th>
                <th className="py-3.5 px-4">Đoàn viên</th>
                <th className="py-3.5 px-4">MSSV / Lớp</th>
                <th className="py-3.5 px-4">Đơn vị / Chi đoàn</th>
                <th className="py-3.5 px-4">Chức vụ</th>
                <th className="py-3.5 px-4 text-center">
                  Số CT tham gia
                  <span className="block text-[9px] text-blue-600 font-medium normal-case tracking-normal">(Báo cáo CT)</span>
                </th>
                <th className="py-3.5 px-4">Đề xuất đánh giá</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center w-44">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600 text-sm">Không tìm thấy đoàn viên nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút bên dưới để thêm hồ sơ đoàn viên mới</p>
                    <button
                      onClick={handleOpenAdd}
                      className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm đoàn viên ngay</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, idx) => {
                  const unit = units.find(u => u.id === member.unit_id);
                  const count = getMemberParticipationCount(member.id);
                  const evaluation = getMemberEvaluation(member.id);
                  const proposedBadge = getProposedBadgeStyle(evaluation.proposed_result);
                  const isChecked = selectedMemberIds.includes(member.id);

                  return (
                    <tr 
                      key={member.id} 
                      className={`hover:bg-slate-50/90 transition ${isChecked ? 'bg-blue-50/40' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => handleToggleMember(member.id)}
                          className="text-slate-400 hover:text-blue-600"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

                      <td className="py-3.5 px-2 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar_url}
                            alt={member.full_name}
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div>
                            <div 
                              onClick={() => setMemberToView(member)}
                              className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition"
                            >
                              {member.full_name}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                              <span>{member.member_code}</span>
                              <span>•</span>
                              <span>{member.gender}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono text-slate-800 font-semibold">{member.student_code}</div>
                        <div className="text-[11px] text-slate-500">{member.class}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium max-w-[190px] truncate" title={unit?.unit_name}>
                          {unit?.unit_name || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[190px]">{member.faculty}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-700 font-medium">{member.position}</span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setMemberForReport(member)}
                          className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 hover:bg-blue-100 hover:scale-105 border border-blue-200 transition cursor-pointer group shadow-2xs"
                          title={`Xem báo cáo các chương trình đang tham gia của ${member.full_name}`}
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-700" />
                          <span>{count} CT</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${proposedBadge.badgeClass}`}>
                          {evaluation.proposed_result}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${getMemberStatusBadge(member.status)}`}>
                          {member.status}
                        </span>
                      </td>

                      {/* Explicit Action Buttons: Báo cáo, Xem hồ sơ, Sửa, Xóa */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setMemberForReport(member)}
                            className="p-1.5 text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-lg transition"
                            title="Xem báo cáo các chương trình đang tham gia (Chuẩn NĐ30 / In / Excel)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setMemberToView(member)}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Xem chi tiết hồ sơ & lịch sử tham gia"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                            title="Chỉnh sửa thông tin đoàn viên"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenDelete(member)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa đoàn viên khỏi hệ thống"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info & Add shortcut */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Hiển thị <strong>{filteredMembers.length}</strong> / <strong>{members.length}</strong> đoàn viên
            {selectedMemberIds.length > 0 && ` • Đã chọn ${selectedMemberIds.length} đoàn viên`}
          </div>
          <button
            onClick={handleOpenAdd}
            className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm hồ sơ đoàn viên mới</span>
          </button>
        </div>
      </div>

      {/* Member Add/Edit Modal */}
      <MemberModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setMemberToEdit(null);
        }}
        memberToEdit={memberToEdit}
      />

      {/* Member Detail Modal */}
      <MemberDetailModal
        isOpen={!!memberToView}
        onClose={() => setMemberToView(null)}
        member={memberToView}
        onEdit={(m) => {
          handleOpenEdit(m);
        }}
        onOpenReport={(m) => {
          setMemberToView(null);
          setMemberForReport(m);
        }}
      />

      {/* Member Stats Modal */}
      <MemberStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        members={members}
        units={units}
        participants={participants}
        onSelectUnitFilter={(unitId) => {
          setSelectedUnit(unitId);
          setIsStatsModalOpen(false);
        }}
        onSelectEvaluationFilter={(evalResult) => {
          setSelectedEvaluation(evalResult);
          setIsStatsModalOpen(false);
        }}
      />

      {/* Member Activity Participation Report Modal */}
      <MemberReportModal
        isOpen={!!memberForReport}
        onClose={() => setMemberForReport(null)}
        member={memberForReport}
      />

      {/* Single Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận xóa đoàn viên</h3>
                <p className="text-xs text-slate-500">Hành động này sẽ xóa toàn bộ lịch sử tham gia liên quan</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa đoàn viên <strong className="text-slate-900">{memberToDelete.full_name}</strong> ({memberToDelete.member_code}) không?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận xóa hàng loạt</h3>
                <p className="text-xs text-slate-500">Xóa đồng thời nhiều hồ sơ đã chọn</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa vĩnh viễn <strong className="text-rose-600 font-bold">{selectedMemberIds.length}</strong> đoàn viên đã chọn khỏi hệ thống không?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition"
              >
                Xác nhận xóa {selectedMemberIds.length} đoàn viên
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

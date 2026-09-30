import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Award, 
  CheckCircle, 
  Clock, 
  User, 
  QrCode, 
  Sparkles,
  FileText,
  Printer,
  Edit3,
  Trash2
} from 'lucide-react';
import { Member } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  getProposedBadgeStyle, 
  getConfirmedBadgeStyle, 
  getMemberStatusBadge, 
  formatDateVN 
} from '../../utils/evaluation';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onEdit?: (member: Member) => void;
  onOpenReport?: (member: Member) => void;
  initialTab?: 'profile' | 'history' | 'evaluation' | 'card' | 'report';
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  member,
  onEdit,
  onOpenReport,
  initialTab = 'profile'
}) => {
  const { units, getMemberPrograms, getMemberEvaluation, currentUser, deleteMember, switchRole, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'evaluation' | 'card' | 'report'>(initialTab);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync initial tab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setConfirmDelete(false);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !member) return null;

  const unit = units.find(u => u.id === member.unit_id);
  const participationHistory = getMemberPrograms(member.id);
  const evaluation = getMemberEvaluation(member.id);

  const proposedBadge = getProposedBadgeStyle(evaluation.proposed_result);
  const confirmedBadge = getConfirmedBadgeStyle(evaluation.confirmed_result);
  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'CAN_BO_DOAN';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Profile Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <img
              src={member.avatar_url}
              alt={member.full_name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
            />
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-mono bg-blue-500/30 text-blue-200 border border-blue-400/30 px-2.5 py-0.5 rounded-full font-bold">
                  {member.member_code}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getMemberStatusBadge(member.status)}`}>
                  {member.status}
                </span>
                <span className="text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full font-semibold">
                  {member.position}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold">{member.full_name}</h2>
              <p className="text-sm text-blue-200">
                MSSV: <strong className="font-mono text-white">{member.student_code}</strong> • Lớp: <strong className="text-white">{member.class}</strong> • {member.faculty}
              </p>
              <p className="text-xs text-blue-300">
                Đơn vị: <span className="font-semibold text-white">{unit?.unit_name || 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeTab === 'profile' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              Hồ sơ lý lịch
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'history' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <span>Lịch sử tham gia CT</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px]">
                {participationHistory.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('evaluation')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'evaluation' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Kết quả đánh giá</span>
            </button>
            <button
              onClick={() => setActiveTab('card')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'card' ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-200 hover:bg-white/10'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Thẻ Đoàn điện tử</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'report' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-amber-300 hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Báo Cáo Tham Gia</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* 1. Hồ Sơ Lý Lịch */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1.5 text-blue-700">
                  Thông Tin Sinh Viên & Liên Hệ
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Mã sinh viên (MSSV):</span>
                    <strong className="text-slate-900 font-mono">{member.student_code}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Lớp sinh hoạt:</span>
                    <strong className="text-slate-900">{member.class}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Khoa chuyên môn:</span>
                    <strong className="text-slate-900 text-right max-w-[200px]">{member.faculty}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày sinh:</span>
                    <strong className="text-slate-900">{formatDateVN(member.date_of_birth)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Giới tính:</span>
                    <strong className="text-slate-900">{member.gender}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Số điện thoại:</span>
                    <strong className="text-slate-900">{member.phone || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <strong className="text-slate-900">{member.email || 'Chưa cập nhật'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Địa chỉ:</span>
                    <strong className="text-slate-900 text-right max-w-[200px]">{member.address || 'Chưa cập nhật'}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs border-b pb-1.5 text-blue-700">
                  Thông Tin Tổ Chức Đoàn
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Mã sổ đoàn viên:</span>
                    <strong className="text-slate-900 font-mono">{member.member_code}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Chi đoàn:</span>
                    <strong className="text-slate-900 text-right max-w-[200px]">{unit?.unit_name || 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Chức vụ:</span>
                    <span className="font-bold text-blue-700">{member.position}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày kết nạp Đoàn:</span>
                    <strong className="text-slate-900">{formatDateVN(member.union_join_date)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái:</span>
                    <span className="font-semibold text-emerald-700">{member.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ngày tạo hồ sơ:</span>
                    <span className="text-slate-500">{formatDateVN(member.created_at)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500">Bí thư chi đoàn quản lý:</div>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {unit?.secretary || 'Chưa chỉ định'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. Lịch Sử Tham Gia Chương Trình (Requirement 7) */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-blue-950 text-sm">
                    LỊCH SỬ THAM GIA CHƯƠNG TRÌNH
                  </h4>
                  <p className="text-xs text-blue-700 mt-0.5">
                    Ghi nhận tất cả các hoạt động, chiến dịch tình nguyện và phong trào
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Tổng số chương trình:</span>
                  <span className="text-2xl font-black text-blue-700">
                    {participationHistory.length}
                  </span>
                </div>
              </div>

              {participationHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">Chưa tham gia chương trình nào</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Đoàn viên cần tham gia tối thiểu 2 chương trình để đạt xếp loại rèn luyện
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {participationHistory.map(({ participant, program }, index) => (
                    <div key={participant.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <h5 className="font-bold text-slate-900 text-sm">
                            {program.program_name}
                          </h5>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-mono">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatDateVN(participant.participation_date)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {program.organizer}
                            </span>
                            {participant.note && (
                              <span className="italic text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                Ghi chú: {participant.note}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3" />
                          {participant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Kết Quả Đánh Giá Tự Động & Xác Nhận */}
          {activeTab === 'evaluation' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Đề Xuất Hệ Thống (Tự động)
                  </span>
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-base border font-bold ${proposedBadge.badgeClass}`}>
                      {evaluation.proposed_result}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Căn cứ vào số lượng tham gia: <strong>{evaluation.participation_count} chương trình</strong>
                  </p>
                  <div className="text-[11px] text-slate-400 italic">
                    (N &lt; 2: Chưa đạt | N = 2: Đạt | N ≥ 3: Đề xuất khen thưởng)
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Kết Quả Xác Nhận Cán Bộ
                  </span>
                  <div className="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-xl text-base border font-bold ${confirmedBadge.badgeClass}`}>
                      {evaluation.confirmed_result}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Người duyệt: <strong>{evaluation.evaluator || 'Chưa duyệt'}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    Ngày duyệt: {formatDateVN(evaluation.evaluation_date) || 'Chưa có'}
                  </p>
                </div>
              </div>

              {/* Comment */}
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-1.5">
                <h5 className="font-bold text-xs text-blue-900 uppercase tracking-wider">
                  Nhận xét & Đánh giá của Ban Chấp hành:
                </h5>
                <p className="text-xs sm:text-sm text-slate-700 italic">
                  &quot;{evaluation.comment || 'Chưa có nhận xét chi tiết. Đạt chỉ tiêu rèn luyện đoàn viên theo quy chế.'}&quot;
                </p>
              </div>
            </div>
          )}

          {/* 4. Thẻ Đoàn Điện Tử */}
          {activeTab === 'card' && (
            <div className="flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-md bg-gradient-to-br from-blue-800 via-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-900 font-bold">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                        Đoàn TNCS Hồ Chí Minh
                      </h4>
                      <p className="text-[10px] text-white/80">Thẻ Đoàn Viên Điện Tử</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded">
                    {member.member_code}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex gap-4 items-center">
                  <img
                    src={member.avatar_url}
                    alt={member.full_name}
                    className="w-20 h-24 rounded-xl object-cover ring-2 ring-white/50 shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <h3 className="text-base font-extrabold text-white leading-tight">
                      {member.full_name}
                    </h3>
                    <p className="text-white/80">MSSV: <strong className="text-white font-mono">{member.student_code}</strong></p>
                    <p className="text-white/80">Lớp: {member.class}</p>
                    <p className="text-white/80">Chức vụ: <span className="text-amber-300 font-semibold">{member.position}</span></p>
                    <p className="text-white/80 truncate max-w-[200px]">{unit?.unit_name}</p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/70">
                  <div>
                    Ngày vào Đoàn: <span className="text-white">{formatDateVN(member.union_join_date)}</span>
                  </div>
                  <div className="font-mono text-amber-300 text-xs font-bold">
                    ★ Khen thưởng: {participationHistory.length} CT
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Mã QR và thông tin xác thực điện tử theo quy chuẩn số hóa công tác Đoàn viên
              </p>
            </div>
          )}

          {/* 5. Báo Cáo Chi Tiết Các Chương Trình Đang Tham Gia */}
          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-300" />
                    Báo Cáo Quá Trình Tham Gia Hoạt Động Của Đoàn Viên
                  </h4>
                  <p className="text-xs text-blue-200 mt-0.5">
                    Hồ sơ thành tích phục vụ cộng điểm rèn luyện và xét khen thưởng
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {onOpenReport && (
                    <button
                      onClick={() => onOpenReport(member)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
                      title="Mở biểu mẫu báo cáo hành chính chuẩn Nghị định 30 & Xuất Excel"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Báo cáo chuẩn NĐ30 / Excel</span>
                    </button>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In phiếu báo cáo</span>
                  </button>
                </div>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-slate-500 block">Số chương trình tham gia:</span>
                  <strong className="text-base text-blue-950 font-bold">
                    {participationHistory.length} hoạt động
                  </strong>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-slate-500 block">Đề xuất rèn luyện:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${proposedBadge.badgeClass}`}>
                    {evaluation.proposed_result}
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-slate-500 block">Xác nhận của BCH Đoàn:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${confirmedBadge.badgeClass}`}>
                    {evaluation.confirmed_result}
                  </span>
                </div>
              </div>

              {/* Table of participating programs */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800 uppercase tracking-wide">
                  Chi tiết từng chương trình đã ghi nhận:
                </div>
                {participationHistory.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Đoàn viên chưa tham gia chương trình hoạt động nào.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3 w-10 text-center">STT</th>
                        <th className="py-2.5 px-3">Chương trình</th>
                        <th className="py-2.5 px-3">Thời gian</th>
                        <th className="py-2.5 px-3">Đơn vị tổ chức</th>
                        <th className="py-2.5 px-3">Trạng thái tham gia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {participationHistory.map(({ participant, program }, idx) => (
                        <tr key={participant.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {program.program_name}
                            <div className="text-[11px] text-slate-500 font-mono">{program.program_code}</div>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{formatDateVN(participant.participation_date)}</td>
                          <td className="py-2.5 px-3 text-slate-700">{program.organizer}</td>
                          <td className="py-2.5 px-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {participant.status}
                            </span>
                            {participant.note && (
                              <div className="text-[10px] text-slate-500 italic mt-0.5">
                                {participant.note}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            Hồ sơ cập nhật: {formatDateVN(member.updated_at)}
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Delete Member inside detail view */}
            {confirmDelete ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs text-rose-700 font-semibold">Xác nhận xóa?</span>
                <button
                  onClick={() => {
                    deleteMember(member.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs transition"
                >
                  Xóa ngay
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl transition flex items-center gap-1.5"
                title="Xóa hồ sơ đoàn viên này"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Xóa đoàn viên</span>
              </button>
            )}

            {/* Edit Member inside detail view */}
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(member);
                }}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-blue-700 hover:bg-blue-50 border border-blue-300 rounded-xl transition flex items-center gap-1.5"
              >
                <Edit3 className="w-4 h-4 text-blue-600" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

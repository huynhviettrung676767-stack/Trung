import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Building, 
  User, 
  Plus, 
  Trash2, 
  Search, 
  Eye, 
  UserCheck, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { Program, Member } from '../../types';
import { useApp } from '../../context/AppContext';
import { AddParticipantsModal } from './AddParticipantsModal';
import { MemberDetailModal } from '../Members/MemberDetailModal';
import { formatDateVN, getProgramStatusBadge } from '../../utils/evaluation';

interface ProgramDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  isOpen,
  onClose,
  program,
}) => {
  const { getProgramParticipantsList, removeParticipantFromProgram, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMemberToView, setSelectedMemberToView] = useState<Member | null>(null);

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'CAN_BO_DOAN';

  if (!isOpen || !program) return null;

  const participantsList = getProgramParticipantsList(program.id);

  // Search within program participants
  const filteredParticipants = participantsList.filter(({ member, unit }) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      !q ||
      member.full_name.toLowerCase().includes(q) ||
      member.member_code.toLowerCase().includes(q) ||
      member.student_code.toLowerCase().includes(q) ||
      member.class.toLowerCase().includes(q) ||
      (unit && unit.unit_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Banner Header */}
        <div className="relative bg-slate-900 text-white p-6 shrink-0 overflow-hidden">
          {program.image_url && (
            <img
              src={program.image_url}
              alt={program.program_name}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs bg-blue-600 px-2.5 py-0.5 rounded font-bold text-white">
                  {program.program_code}
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getProgramStatusBadge(program.status)}`}>
                  {program.status}
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight">
              {program.program_name}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  {formatDateVN(program.start_date)}
                  {program.end_date && program.end_date !== program.start_date && ` - ${formatDateVN(program.end_date)}`}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate">{program.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate">{program.organizer}</span>
              </div>
            </div>

            {program.description && (
              <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                {program.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Bar & Participant count */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Danh Sách Đoàn Viên Tham Gia
              </h3>
              <p className="text-xs text-slate-500">
                Đã ghi nhận: <strong className="text-blue-700 font-bold">{participantsList.length}</strong> đoàn viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search participant */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm đoàn viên trong CT..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl outline-hidden focus:ring-1 focus:ring-blue-500 w-44 sm:w-56"
              />
            </div>

            {/* Crucial Requirement 6: Button + THÊM ĐOÀN VIÊN THAM GIA */}
            {canManage && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ THÊM ĐOÀN VIÊN THAM GIA</span>
              </button>
            )}
          </div>
        </div>

        {/* Participants Table (Requirement 6: STT, Mã đoàn viên, Họ và tên, Đơn vị, Lớp, Thời gian tham gia, Trạng thái) */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 w-12 text-center">STT</th>
                <th className="py-3 px-4">Mã ĐV</th>
                <th className="py-3 px-4">Họ và tên</th>
                <th className="py-3 px-4">Đơn vị</th>
                <th className="py-3 px-4">Lớp</th>
                <th className="py-3 px-4">Thời gian tham gia</th>
                <th className="py-3 px-4">Trạng thái</th>
                {canManage && <th className="py-3 px-4 text-center w-20">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 8 : 7} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Chưa có đoàn viên nào trong danh sách</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Nhấn nút &quot;+ THÊM ĐOÀN VIÊN THAM GIA&quot; ở trên để ghi nhận
                    </p>
                  </td>
                </tr>
              ) : (
                filteredParticipants.map(({ participant, member, unit }, idx) => (
                  <tr key={participant.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {member.member_code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <button
                          onClick={() => setSelectedMemberToView(member)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-left transition"
                          title="Xem hồ sơ"
                        >
                          {member.full_name}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">
                      {unit?.unit_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {member.class}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatDateVN(participant.participation_date)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {participant.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => removeParticipantFromProgram(program.id, member.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          title="Xóa khỏi chương trình"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Người phụ trách: <strong>{program.manager || 'Ban Tổ chức'}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Add Participants Modal (Requirement 6) */}
      <AddParticipantsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        program={program}
      />

      {/* Member Profile Modal Preview */}
      <MemberDetailModal
        isOpen={!!selectedMemberToView}
        onClose={() => setSelectedMemberToView(null)}
        member={selectedMemberToView}
      />
    </div>
  );
};

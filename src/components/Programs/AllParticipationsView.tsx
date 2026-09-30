import React, { useState, useMemo } from 'react';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Plus, 
  Calendar, 
  Building2, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, Program } from '../../types';
import { MemberDetailModal } from '../Members/MemberDetailModal';
import { AddParticipantsModal } from './AddParticipantsModal';
import { formatDateVN } from '../../utils/evaluation';
import { exportParticipationsToExcel } from '../../utils/excelExport';

export const AllParticipationsView: React.FC = () => {
  const { 
    participants, 
    programs, 
    members, 
    units, 
    removeParticipantFromProgram, 
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
  const [selectedMemberToView, setSelectedMemberToView] = useState<Member | null>(null);
  const [programToQuickAdd, setProgramToQuickAdd] = useState<Program | null>(null);

  const canManage = currentUser.role === 'ADMIN' || currentUser.role === 'CAN_BO_DOAN';

  const rows = useMemo(() => {
    return participants.map(part => {
      const prog = programs.find(p => p.id === part.program_id);
      const member = members.find(m => m.id === part.member_id);
      const unit = units.find(u => u.id === member?.unit_id);
      return {
        participant: part,
        program: prog,
        member,
        unit,
      };
    });
  }, [participants, programs, members, units]);

  const filteredRows = useMemo(() => {
    return rows.filter(({ participant, program, member, unit }) => {
      if (!program || !member) return false;
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        member.full_name.toLowerCase().includes(q) ||
        member.member_code.toLowerCase().includes(q) ||
        member.student_code.toLowerCase().includes(q) ||
        program.program_name.toLowerCase().includes(q) ||
        program.program_code.toLowerCase().includes(q);

      const matchesProg = selectedProgramId === 'all' || participant.program_id === selectedProgramId;
      const matchesUnit = selectedUnitId === 'all' || member.unit_id === selectedUnitId;

      return matchesSearch && matchesProg && matchesUnit;
    });
  }, [rows, searchTerm, selectedProgramId, selectedUnitId]);

  const handleExportExcel = () => {
    exportParticipationsToExcel(participants, programs, members, units, {
      programId: selectedProgramId,
      unitId: selectedUnitId,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-purple-600" />
            Nhật Ký Tham Gia Hoạt Động Đoàn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-800">{participants.length}</strong> lượt đoàn viên tham gia ({filteredRows.length} lượt phù hợp)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Excel</span>
          </button>

          {canManage && programs.length > 0 && (
            <button
              onClick={() => setProgramToQuickAdd(programs[0])}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Ghi nhận tham gia</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên đoàn viên, MSSV, tên chương trình..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden transition"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Lọc theo chương trình:</label>
            <select
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">Tất cả chương trình ({programs.length})</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  {p.program_code} - {p.program_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Lọc theo Chi đoàn:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-hidden focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">Tất cả chi đoàn ({units.length})</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.unit_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Participations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Chương trình Đoàn</th>
                <th className="py-3.5 px-4">Đoàn viên</th>
                <th className="py-3.5 px-4">MSSV / Lớp</th>
                <th className="py-3.5 px-4">Chi đoàn</th>
                <th className="py-3.5 px-4">Thời gian tham gia</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ghi chú</th>
                {canManage && <th className="py-3.5 px-4 text-center w-16">Xóa</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 9 : 8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Không có lượt tham gia nào phù hợp</p>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ participant, program, member, unit }, idx) => (
                  <tr key={participant.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 max-w-[220px] truncate" title={program?.program_name}>
                        {program?.program_name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {program?.program_code}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member?.avatar_url}
                          alt={member?.full_name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                        <div>
                          <button
                            onClick={() => member && setSelectedMemberToView(member)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left transition"
                          >
                            {member?.full_name}
                          </button>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {member?.member_code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-slate-800">{member?.student_code}</div>
                      <div className="text-[11px] text-slate-500">{member?.class}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-[180px]">
                      {unit?.unit_name || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatDateVN(participant.participation_date)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {participant.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 italic max-w-[160px] truncate">
                      {participant.note || '—'}
                    </td>
                    {canManage && (
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => program && member && removeParticipantFromProgram(program.id, member.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hủy ghi nhận tham gia"
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
      </div>

      {/* Member Details */}
      <MemberDetailModal
        isOpen={!!selectedMemberToView}
        onClose={() => setSelectedMemberToView(null)}
        member={selectedMemberToView}
      />

      {/* Quick Add modal */}
      {programToQuickAdd && (
        <AddParticipantsModal
          isOpen={true}
          onClose={() => setProgramToQuickAdd(null)}
          program={programToQuickAdd}
        />
      )}
    </div>
  );
};

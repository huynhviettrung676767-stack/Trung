import React, { useState, useMemo } from 'react';
import { X, Search, Filter, UserCheck, CheckSquare, Square, AlertCircle, Plus } from 'lucide-react';
import { Program, Member } from '../../types';
import { useApp } from '../../context/AppContext';

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program;
}

export const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({
  isOpen,
  onClose,
  program,
}) => {
  const { members, units, participants, addMultipleParticipantsToProgram } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Find IDs already in this program
  const existingMemberIds = useMemo(() => {
    return new Set(
      participants.filter(p => p.program_id === program.id).map(p => p.member_id)
    );
  }, [participants, program.id]);

  // Filter members
  const availableMembers = useMemo(() => {
    return members.filter(member => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q || 
        member.full_name.toLowerCase().includes(q) ||
        member.member_code.toLowerCase().includes(q) ||
        member.student_code.toLowerCase().includes(q) ||
        member.class.toLowerCase().includes(q);

      const matchesUnit = selectedUnit === 'all' || member.unit_id === selectedUnit;

      return matchesSearch && matchesUnit;
    });
  }, [members, searchTerm, selectedUnit]);

  if (!isOpen) return null;

  // Toggle selection
  const handleToggleMember = (memberId: string) => {
    if (existingMemberIds.has(memberId)) return; // already added

    setSelectedMemberIds(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };

  // Select all non-existing in current filtered list
  const handleSelectAllFiltered = () => {
    const selectable = availableMembers
      .filter(m => !existingMemberIds.has(m.id))
      .map(m => m.id);

    const allSelected = selectable.every(id => selectedMemberIds.includes(id));

    if (allSelected) {
      // Unselect selectable
      setSelectedMemberIds(prev => prev.filter(id => !selectable.includes(id)));
    } else {
      // Select all selectable
      setSelectedMemberIds(prev => Array.from(new Set([...prev, ...selectable])));
    }
  };

  const handleAddSubmit = () => {
    if (selectedMemberIds.length === 0) return;
    addMultipleParticipantsToProgram(program.id, selectedMemberIds);
    setSelectedMemberIds([]);
    onClose();
  };

  const selectableCount = availableMembers.filter(m => !existingMemberIds.has(m.id)).length;
  const isAllSelectableChecked = 
    selectableCount > 0 && 
    availableMembers.filter(m => !existingMemberIds.has(m.id)).every(m => selectedMemberIds.includes(m.id));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
                {program.program_code}
              </span>
              <span className="text-xs text-blue-200">Ghi nhận tham gia</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold mt-1">
              Thêm Đoàn Viên Vào Chương Trình
            </h3>
            <p className="text-xs text-blue-200 truncate max-w-lg">
              {program.program_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo họ tên, mã ĐV, MSSV..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
              >
                <option value="all">Tất cả chi đoàn</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.unit_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <button
              onClick={handleSelectAllFiltered}
              className="flex items-center gap-1.5 font-semibold text-blue-700 hover:text-blue-900"
              disabled={selectableCount === 0}
            >
              {isAllSelectableChecked ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>Chọn tất cả ({selectableCount} đoàn viên khả dụng)</span>
            </button>
            <span className="font-semibold text-blue-900 bg-blue-100/70 px-2 py-0.5 rounded-full">
              Đã chọn: {selectedMemberIds.length} đoàn viên
            </span>
          </div>
        </div>

        {/* Member selection list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {availableMembers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Không tìm thấy đoàn viên nào phù hợp
            </div>
          ) : (
            availableMembers.map((member) => {
              const unit = units.find(u => u.id === member.unit_id);
              const isAlreadyAdded = existingMemberIds.has(member.id);
              const isSelected = selectedMemberIds.includes(member.id);

              return (
                <div
                  key={member.id}
                  onClick={() => !isAlreadyAdded && handleToggleMember(member.id)}
                  className={`p-3 rounded-xl flex items-center justify-between gap-3 transition ${
                    isAlreadyAdded
                      ? 'bg-slate-50 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-50 border border-blue-200 cursor-pointer'
                      : 'hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isAlreadyAdded ? (
                        <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                          Đã có
                        </span>
                      ) : isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                        {member.full_name}
                        <span className="font-mono text-[11px] font-normal text-slate-500">
                          ({member.member_code})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        MSSV: <strong className="font-mono text-slate-700">{member.student_code}</strong> • Lớp: {member.class} • {unit?.unit_name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {member.position}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Hệ thống ngăn chặn trùng lặp <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">program_id + member_id</code>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleAddSubmit}
              disabled={selectedMemberIds.length === 0}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào chương trình ({selectedMemberIds.length})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

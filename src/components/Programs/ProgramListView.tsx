import React, { useState, useMemo } from 'react';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Building, 
  Users, 
  Eye, 
  Edit3, 
  Trash2, 
  UserPlus,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { Program } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProgramModal } from './ProgramModal';
import { ProgramDetailModal } from './ProgramDetailModal';
import { AddParticipantsModal } from './AddParticipantsModal';
import { formatDateVN, getProgramStatusBadge } from '../../utils/evaluation';

export const ProgramListView: React.FC = () => {
  const { 
    programs, 
    participants, 
    deleteProgram, 
    currentUser, 
    switchRole,
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<Program | null>(null);
  const [programToView, setProgramToView] = useState<Program | null>(null);
  const [programToAddMembers, setProgramToAddMembers] = useState<Program | null>(null);
  const [programToDelete, setProgramToDelete] = useState<Program | null>(null);

  const ensureManageAccess = () => {
    if (currentUser.role === 'NGUOI_XEM') {
      switchRole('CAN_BO_DOAN');
      showToast('Đã chuyển sang vai trò Cán bộ Đoàn để bạn thực hiện quản lý chương trình!', 'info');
    }
    return true;
  };

  const filteredPrograms = useMemo(() => {
    return programs.filter(prog => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch = 
        !q ||
        prog.program_name.toLowerCase().includes(q) ||
        prog.program_code.toLowerCase().includes(q) ||
        prog.organizer.toLowerCase().includes(q) ||
        prog.location.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || prog.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [programs, searchTerm, statusFilter]);

  const handleOpenAdd = () => {
    ensureManageAccess();
    setProgramToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (prog: Program) => {
    ensureManageAccess();
    setProgramToEdit(prog);
    setIsAddModalOpen(true);
  };

  const handleOpenDelete = (prog: Program) => {
    ensureManageAccess();
    setProgramToDelete(prog);
  };

  const handleConfirmDelete = () => {
    if (programToDelete) {
      deleteProgram(programToDelete.id);
      setProgramToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-blue-600" />
            Quản Lý Chương Trình & Hoạt Động Đoàn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-800">{programs.length}</strong> chương trình hoạt động phong trào
          </p>
        </div>

        {/* Prominent Add Program Button */}
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Thêm Chương Trình</span>
        </button>
      </div>

      {/* Filter and Search Box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên chương trình, mã hoạt động, đơn vị tổ chức, địa điểm..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Sắp diễn ra">Sắp diễn ra</option>
            <option value="Đang diễn ra">Đang diễn ra</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600 text-sm">Không tìm thấy chương trình nào</p>
            <p className="text-xs text-slate-400 mt-1">Bấm nút bên dưới để tạo chương trình mới</p>
            <button
              onClick={handleOpenAdd}
              className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo chương trình ngay</span>
            </button>
          </div>
        ) : (
          filteredPrograms.map((prog) => {
            const participantCount = participants.filter(p => p.program_id === prog.id).length;

            return (
              <div
                key={prog.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image banner or fallback gradient */}
                  <div className="h-36 relative bg-gradient-to-tr from-blue-900 to-indigo-800 overflow-hidden">
                    {prog.image_url && (
                      <img
                        src={prog.image_url}
                        alt={prog.program_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-70"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold bg-white/90 text-blue-900 px-2.5 py-0.5 rounded-full shadow-xs">
                        {prog.program_code}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-semibold ${getProgramStatusBadge(prog.status)}`}>
                        {prog.status}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-medium flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{prog.location}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 
                      onClick={() => setProgramToView(prog)}
                      className="font-bold text-slate-900 text-base leading-snug line-clamp-2 hover:text-blue-600 cursor-pointer transition"
                    >
                      {prog.program_name}
                    </h3>

                    {prog.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {prog.description}
                      </p>
                    )}

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Thời gian:
                        </span>
                        <strong className="text-slate-800 font-mono">
                          {formatDateVN(prog.start_date)}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" /> Đơn vị:
                        </span>
                        <span className="text-slate-800 font-medium truncate max-w-[170px]" title={prog.organizer}>
                          {prog.organizer}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Người phụ trách:</span>
                        <span className="text-slate-700">{prog.manager || 'Ban Tổ chức'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer and Participants Badge */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setProgramToView(prog)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 transition"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{participantCount} Đoàn viên</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        ensureManageAccess();
                        setProgramToAddMembers(prog);
                      }}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      title="+ Thêm đoàn viên tham gia"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setProgramToView(prog)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-200 rounded-lg transition"
                      title="Xem chi tiết chương trình"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(prog)}
                      className="p-1.5 text-amber-700 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition"
                      title="Chỉnh sửa chương trình"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleOpenDelete(prog)}
                      className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa chương trình"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Program Create/Edit Modal */}
      <ProgramModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProgramToEdit(null);
        }}
        programToEdit={programToEdit}
        onCreatedSuccess={(newProg) => {
          // Open participant addition for immediate workflow!
          setProgramToAddMembers(newProg);
        }}
      />

      {/* Program Detail Modal */}
      <ProgramDetailModal
        isOpen={!!programToView}
        onClose={() => setProgramToView(null)}
        program={programToView}
      />

      {/* Add Participants Directly Modal */}
      {programToAddMembers && (
        <AddParticipantsModal
          isOpen={true}
          onClose={() => setProgramToAddMembers(null)}
          program={programToAddMembers}
        />
      )}

      {/* Delete Program Confirmation */}
      {programToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác nhận xóa chương trình</h3>
                <p className="text-xs text-slate-500">Xóa dữ liệu tham gia liên quan và tự động tính lại đánh giá</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa chương trình <strong className="text-slate-900">{programToDelete.program_name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProgramToDelete(null)}
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
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  Eye, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Unit, Member } from '../../types';
import { useApp } from '../../context/AppContext';
import { UnitModal } from './UnitModal';
import { MemberDetailModal } from '../Members/MemberDetailModal';

export const UnitListView: React.FC = () => {
  const { units, members, deleteUnit, getUnitMemberCount, currentUser } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [unitToEdit, setUnitToEdit] = useState<Unit | null>(null);
  const [unitToDelete, setUnitToDelete] = useState<Unit | null>(null);

  // Unit members drawer/modal
  const [selectedUnitForMembers, setSelectedUnitForMembers] = useState<Unit | null>(null);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<Member | null>(null);

  const canManage = currentUser.role === 'ADMIN';

  const filteredUnits = units.filter(u => {
    const q = searchTerm.toLowerCase().trim();
    return (
      !q ||
      u.unit_name.toLowerCase().includes(q) ||
      u.unit_code.toLowerCase().includes(q) ||
      u.faculty.toLowerCase().includes(q) ||
      u.secretary.toLowerCase().includes(q)
    );
  });

  const unitMembers = selectedUnitForMembers
    ? members.filter(m => m.unit_id === selectedUnitForMembers.id)
    : [];

  const handleConfirmDelete = () => {
    if (unitToDelete) {
      deleteUnit(unitToDelete.id);
      setUnitToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Quản Lý Đơn Vị / Chi Đoàn Cơ Sở
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-800">{units.length}</strong> chi đoàn trực thuộc các Khoa
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setUnitToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Đơn Vị</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên chi đoàn, mã chi đoàn, khoa, bí thư..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden transition"
          />
        </div>
      </div>

      {/* Units Cards / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4">Mã đơn vị</th>
                <th className="py-3.5 px-4">Tên Chi đoàn</th>
                <th className="py-3.5 px-4">Khoa / Ban</th>
                <th className="py-3.5 px-4">Ban Chấp hành (Bí thư / P. Bí thư)</th>
                <th className="py-3.5 px-4 text-center">Số lượng đoàn viên</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center w-28">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Không tìm thấy đơn vị nào</p>
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit, idx) => {
                  const memberCount = getUnitMemberCount(unit.id);
                  return (
                    <tr key={unit.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {unit.unit_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div 
                          onClick={() => setSelectedUnitForMembers(unit)}
                          className="font-bold text-slate-900 hover:text-indigo-600 cursor-pointer transition"
                        >
                          {unit.unit_name}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {unit.faculty}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-900 font-medium">BT: {unit.secretary}</div>
                        {unit.vice_secretary && (
                          <div className="text-[11px] text-slate-500">PBT: {unit.vice_secretary}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedUnitForMembers(unit)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition"
                          title="Bấm để xem danh sách đoàn viên"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{memberCount} đoàn viên</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          unit.status === 'Hoạt động'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {unit.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedUnitForMembers(unit)}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Xem danh sách đoàn viên thuộc chi đoàn"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canManage && (
                            <>
                              <button
                                onClick={() => {
                                  setUnitToEdit(unit);
                                  setIsAddModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                title="Chỉnh sửa đơn vị"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setUnitToDelete(unit)}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Xóa đơn vị"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
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
      </div>

      {/* Unit Modal */}
      <UnitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setUnitToEdit(null);
        }}
        unitToEdit={unitToEdit}
      />

      {/* Unit Members List Modal */}
      {selectedUnitForMembers && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-indigo-800 to-blue-800 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs bg-white/20 text-white font-mono px-2 py-0.5 rounded">
                  {selectedUnitForMembers.unit_code}
                </span>
                <h3 className="text-lg font-bold mt-1">{selectedUnitForMembers.unit_name}</h3>
                <p className="text-xs text-indigo-200">
                  {selectedUnitForMembers.faculty} • Bí thư: {selectedUnitForMembers.secretary}
                </p>
              </div>
              <button
                onClick={() => setSelectedUnitForMembers(null)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 text-xs text-slate-600 shrink-0">
              <span>Danh sách đoàn viên trực thuộc: <strong>{unitMembers.length} người</strong></span>
              <span>Bấm vào tên để xem hồ sơ chi tiết</span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {unitMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  Chưa có đoàn viên nào trong chi đoàn này
                </div>
              ) : (
                unitMembers.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMemberDetail(m)}
                    className="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-400 w-6 text-center">{idx + 1}</span>
                      <img src={m.avatar_url} alt={m.full_name} className="w-9 h-9 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm hover:text-blue-600">
                          {m.full_name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          {m.student_code} • Lớp: {m.class} • {m.position}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                        {m.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedUnitForMembers(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Preview when clicked from unit list */}
      <MemberDetailModal
        isOpen={!!selectedMemberDetail}
        onClose={() => setSelectedMemberDetail(null)}
        member={selectedMemberDetail}
      />

      {/* Delete Unit Confirmation */}
      {unitToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xóa chi đoàn cơ sở</h3>
                <p className="text-xs text-slate-500">Chỉ có thể xóa nếu không còn đoàn viên trực thuộc</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600">
              Bạn có chắc chắn muốn xóa đơn vị <strong className="text-slate-900">{unitToDelete.unit_name}</strong> không?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUnitToDelete(null)}
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

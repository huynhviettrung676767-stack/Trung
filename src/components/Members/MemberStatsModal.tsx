import React from 'react';
import { 
  X, 
  BarChart3, 
  Users, 
  Award, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Trophy,
  PieChart,
  School,
  ArrowRight
} from 'lucide-react';
import { Member, Unit, ProgramParticipant } from '../../types';
import { calculateProposedResult } from '../../utils/evaluation';

interface MemberStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  units: Unit[];
  participants: ProgramParticipant[];
  onSelectUnitFilter?: (unitId: string) => void;
  onSelectEvaluationFilter?: (evaluation: string) => void;
}

export const MemberStatsModal: React.FC<MemberStatsModalProps> = ({
  isOpen,
  onClose,
  members,
  units,
  participants,
  onSelectUnitFilter,
  onSelectEvaluationFilter,
}) => {
  if (!isOpen) return null;

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'Đang sinh hoạt').length;
  const pausedMembers = members.filter(m => m.status === 'Tạm nghỉ').length;
  const movedMembers = members.filter(m => m.status === 'Đã chuyển sinh hoạt').length;

  const maleMembers = members.filter(m => m.gender === 'Nam').length;
  const femaleMembers = members.filter(m => m.gender === 'Nữ').length;
  const malePercent = totalMembers ? Math.round((maleMembers / totalMembers) * 100) : 0;
  const femalePercent = totalMembers ? 100 - malePercent : 0;

  // Evaluation breakdown
  let countChuaDat = 0;
  let countDat = 0;
  let countKhenThuong = 0;

  // Participation brackets
  let p0 = 0;
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  let p4Plus = 0;

  members.forEach(m => {
    const pCount = participants.filter(p => p.member_id === m.id).length;
    const proposed = calculateProposedResult(pCount);
    if (proposed === 'CHƯA ĐẠT') countChuaDat++;
    else if (proposed === 'ĐẠT') countDat++;
    else if (proposed === 'ĐỀ XUẤT KHEN THƯỞNG') countKhenThuong++;

    if (pCount === 0) p0++;
    else if (pCount === 1) p1++;
    else if (pCount === 2) p2++;
    else if (pCount === 3) p3++;
    else p4Plus++;
  });

  const datPercent = totalMembers ? Math.round((countDat / totalMembers) * 100) : 0;
  const chuaDatPercent = totalMembers ? Math.round((countChuaDat / totalMembers) * 100) : 0;
  const khenThuongPercent = totalMembers ? Math.round((countKhenThuong / totalMembers) * 100) : 0;

  // Distribution by Unit
  const unitStats = units.map(unit => {
    const unitMems = members.filter(m => m.unit_id === unit.id);
    const count = unitMems.length;
    const unitPercent = totalMembers ? Math.round((count / totalMembers) * 100) : 0;
    
    // Average participations in this unit
    const unitPartCount = unitMems.reduce((sum, m) => {
      return sum + participants.filter(p => p.member_id === m.id).length;
    }, 0);
    const avgPart = count > 0 ? (unitPartCount / count).toFixed(1) : '0';

    return { unit, count, percent: unitPercent, avgPart };
  }).sort((a, b) => b.count - a.count);

  // Distribution by Faculty
  const facultyMap: Record<string, number> = {};
  members.forEach(m => {
    facultyMap[m.faculty] = (facultyMap[m.faculty] || 0) + 1;
  });
  const facultyStats = Object.entries(facultyMap).map(([faculty, count]) => ({
    faculty,
    count,
    percent: totalMembers ? Math.round((count / totalMembers) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <BarChart3 className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Thống Kê Toàn Diện Hồ Sơ Đoàn Viên
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                Báo cáo tổng hợp cơ cấu nhân lực, giới tính, xếp loại rèn luyện và mức độ sinh hoạt
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 4 Core Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-xs font-semibold uppercase">Tổng đoàn viên</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-blue-950">{totalMembers}</div>
              <p className="text-[11px] text-blue-700 mt-0.5">100% hồ sơ quản lý</p>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-xs font-semibold uppercase">Đang sinh hoạt</span>
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-emerald-950">{activeMembers}</div>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                {totalMembers ? Math.round((activeMembers / totalMembers) * 100) : 0}% duy trì sinh hoạt
              </p>
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-xs font-semibold uppercase">Đủ điều kiện khen</span>
                <Trophy className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-amber-950">{countKhenThuong}</div>
              <p className="text-[11px] text-amber-700 mt-0.5">
                {khenThuongPercent}% tham gia ≥ 3 CT
              </p>
            </div>

            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl">
              <div className="flex items-center justify-between text-purple-700 mb-1">
                <span className="text-xs font-semibold uppercase">Tỷ lệ giới tính</span>
                <PieChart className="w-4 h-4" />
              </div>
              <div className="text-lg font-black text-purple-950 flex items-center gap-1.5">
                <span>{maleMembers} Nam</span>
                <span className="text-slate-400 font-normal">/</span>
                <span>{femaleMembers} Nữ</span>
              </div>
              <p className="text-[11px] text-purple-700 mt-0.5">
                {malePercent}% Nam • {femalePercent}% Nữ
              </p>
            </div>
          </div>

          {/* Section 1: Thống kê Xếp loại Rèn luyện Đoàn viên */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Cơ Cấu Xếp Loại Đánh Giá Rèn Luyện (Quy tắc số chương trình N)
                </h3>
                <p className="text-xs text-slate-500">
                  Tự động phân loại theo số chương trình đã tham gia trong năm học
                </p>
              </div>

              {onSelectEvaluationFilter && (
                <span className="text-xs text-blue-600 font-medium italic">
                  (Bấm vào từng nhóm bên dưới để lọc nhanh danh sách)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Khen thưởng */}
              <div 
                onClick={() => {
                  if (onSelectEvaluationFilter) {
                    onSelectEvaluationFilter('ĐỀ XUẤT KHEN THƯỞNG');
                    onClose();
                  }
                }}
                className={`p-3.5 bg-amber-50 rounded-xl border border-amber-300 transition ${
                  onSelectEvaluationFilter ? 'hover:shadow-md cursor-pointer' : ''
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-amber-900">
                  <span>ĐỀ XUẤT KHEN THƯỞNG</span>
                  <span className="text-base font-black">{countKhenThuong} ĐV</span>
                </div>
                <div className="text-xs text-amber-700 mt-1">
                  Đoàn viên tham gia từ 3 hoạt động trở lên ({khenThuongPercent}%)
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${khenThuongPercent}%` }}></div>
                </div>
              </div>

              {/* Đạt */}
              <div 
                onClick={() => {
                  if (onSelectEvaluationFilter) {
                    onSelectEvaluationFilter('ĐẠT');
                    onClose();
                  }
                }}
                className={`p-3.5 bg-emerald-50 rounded-xl border border-emerald-300 transition ${
                  onSelectEvaluationFilter ? 'hover:shadow-md cursor-pointer' : ''
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
                  <span>ĐẠT YÊU CẦU</span>
                  <span className="text-base font-black">{countDat} ĐV</span>
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  Đoàn viên hoàn thành 2 hoạt động ({datPercent}%)
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${datPercent}%` }}></div>
                </div>
              </div>

              {/* Chưa đạt */}
              <div 
                onClick={() => {
                  if (onSelectEvaluationFilter) {
                    onSelectEvaluationFilter('CHƯA ĐẠT');
                    onClose();
                  }
                }}
                className={`p-3.5 bg-rose-50 rounded-xl border border-rose-300 transition ${
                  onSelectEvaluationFilter ? 'hover:shadow-md cursor-pointer' : ''
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-rose-900">
                  <span>CHƯA ĐẠT</span>
                  <span className="text-base font-black">{countChuaDat} ĐV</span>
                </div>
                <div className="text-xs text-rose-700 mt-1">
                  Tham gia dưới 2 hoạt động ({chuaDatPercent}%)
                </div>
                <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden mt-2.5">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${chuaDatPercent}%` }}></div>
                </div>
              </div>
            </div>

            {/* Participation Brackets Bar */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <div className="font-semibold text-slate-700 mb-2">Phân bổ chi tiết số hoạt động tham gia:</div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">0 Chương trình</span>
                  <strong className="text-sm text-slate-900 font-bold">{p0} đoàn viên</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">1 Chương trình</span>
                  <strong className="text-sm text-slate-900 font-bold">{p1} đoàn viên</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">2 Chương trình</span>
                  <strong className="text-sm text-emerald-700 font-bold">{p2} đoàn viên</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg">
                  <span className="text-slate-500 text-[11px] block">3 Chương trình</span>
                  <strong className="text-sm text-amber-700 font-bold">{p3} đoàn viên</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg col-span-2 sm:col-span-1">
                  <span className="text-slate-500 text-[11px] block">≥ 4 Chương trình</span>
                  <strong className="text-sm text-indigo-700 font-bold">{p4Plus} đoàn viên</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Thống kê theo Đơn vị / Chi đoàn & Theo Khoa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chi đoàn */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Đoàn Viên Theo Chi Đoàn ({units.length} Chi đoàn)
                </h4>
                <span className="text-xs text-slate-400">Bình quân / Chi đoàn</span>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {unitStats.map(({ unit, count, percent, avgPart }) => (
                  <div key={unit.id} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => {
                          if (onSelectUnitFilter) {
                            onSelectUnitFilter(unit.id);
                            onClose();
                          }
                        }}
                        className="font-bold text-slate-800 hover:text-blue-600 truncate max-w-[210px] text-left transition"
                        title={unit.unit_name}
                      >
                        {unit.unit_name}
                      </button>
                      <span className="font-bold text-slate-900">
                        {count} ĐV ({percent}%) • TB {avgPart} CT
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Khoa */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <School className="w-4 h-4 text-blue-600" />
                  Đoàn Viên Theo Khoa / Viện
                </h4>
                <span className="text-xs text-slate-400">{facultyStats.length} Khoa</span>
              </div>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {facultyStats.map(({ faculty, count, percent }) => (
                  <div key={faculty} className="space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800 truncate max-w-[210px]" title={faculty}>
                        {faculty}
                      </span>
                      <span className="font-bold text-blue-700">
                        {count} ĐV ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Dữ liệu được cập nhật tự động theo thời gian thực</span>
          <button
            onClick={onClose}
            className="px-5 py-2 font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

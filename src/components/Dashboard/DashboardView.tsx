import React from 'react';
import { 
  Users, 
  Building2, 
  CalendarDays, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Award, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  Trophy,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getProposedBadgeStyle, getConfirmedBadgeStyle, formatDateVN } from '../../utils/evaluation';

export const DashboardView: React.FC = () => {
  const { dashboardStats, setCurrentTab, programs } = useApp();

  const totalEvaluated = dashboardStats.totalMembers;
  const datPercent = totalEvaluated ? Math.round((dashboardStats.totalDat / totalEvaluated) * 100) : 0;
  const chuaDatPercent = totalEvaluated ? Math.round((dashboardStats.totalChuaDat / totalEvaluated) * 100) : 0;
  const khenThuongPercent = totalEvaluated ? Math.round((dashboardStats.totalKhenThuong / totalEvaluated) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-800/60 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Năm học 2025 - 2026 | Hệ thống Tự động Đánh giá
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bảng Điều Hành Công Tác Đoàn & Phong Trào Thanh Niên
            </h1>
            <p className="mt-2 text-sm sm:text-base text-blue-200/90 max-w-2xl leading-relaxed">
              Theo dõi dữ liệu trực quan hồ sơ đoàn viên, chỉ số tham gia hoạt động, tự động phân loại xếp loại và chuẩn hóa văn bản hành chính theo Nghị định 30/2020/NĐ-CP.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('reports-pdf')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition"
            >
              <Award className="w-4 h-4" />
              In Báo Cáo PDF
            </button>
            <button
              onClick={() => setCurrentTab('evaluations')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm rounded-xl border border-white/20 flex items-center gap-2 transition backdrop-blur-xs"
            >
              Duyệt Đánh Giá
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards (7 Required Core Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Total Members */}
        <div 
          onClick={() => setCurrentTab('members')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đoàn viên</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{dashboardStats.totalMembers}</div>
          <p className="text-[11px] text-slate-500 mt-1">Hồ sơ quản lý</p>
        </div>

        {/* Total Units */}
        <div 
          onClick={() => setCurrentTab('units')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chi đoàn</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{dashboardStats.totalUnits}</div>
          <p className="text-[11px] text-slate-500 mt-1">Đơn vị cơ sở</p>
        </div>

        {/* Total Programs */}
        <div 
          onClick={() => setCurrentTab('programs')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-sky-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chương trình</span>
            <div className="p-2 bg-sky-50 rounded-lg text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{dashboardStats.totalPrograms}</div>
          <p className="text-[11px] text-slate-500 mt-1">Hoạt động Đoàn</p>
        </div>

        {/* Total Participations */}
        <div 
          onClick={() => setCurrentTab('participations')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Lượt tham gia</span>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{dashboardStats.totalParticipations}</div>
          <p className="text-[11px] text-slate-500 mt-1">Lượt sinh hoạt</p>
        </div>

        {/* Total Đạt (N == 2) */}
        <div 
          onClick={() => setCurrentTab('evaluations')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Đạt</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">{dashboardStats.totalDat}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">2 chương trình</p>
        </div>

        {/* Total Chưa Đạt (N < 2) */}
        <div 
          onClick={() => setCurrentTab('evaluations')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-rose-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-700">Chưa đạt</span>
            <div className="p-2 bg-rose-50 rounded-lg text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700">{dashboardStats.totalChuaDat}</div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">&lt; 2 chương trình</p>
        </div>

        {/* Total Đề Xuất Khen Thưởng (N >= 3) */}
        <div 
          onClick={() => setCurrentTab('evaluations')}
          className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-300 shadow-xs hover:shadow-md transition cursor-pointer group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">Khen thưởng</span>
            <div className="p-2 bg-amber-200 rounded-lg text-amber-800 group-hover:bg-amber-500 group-hover:text-white transition">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800">{dashboardStats.totalKhenThuong}</div>
          <p className="text-[11px] text-amber-700 font-bold mt-1">≥ 3 chương trình</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Phân loại Đánh giá Đạt / Chưa đạt / Khen thưởng */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Tỷ Lệ Phân Loại Đánh Giá</h3>
                <p className="text-xs text-slate-500">Tự động tính theo số chương trình đã tham gia</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                {totalEvaluated} Đoàn viên
              </span>
            </div>

            {/* Visual Progress Bar representation */}
            <div className="space-y-4 my-6">
              {/* Khen thưởng */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-amber-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Đề xuất khen thưởng (≥ 3 CT)
                  </span>
                  <span className="font-bold text-amber-900">{dashboardStats.totalKhenThuong} ĐV ({khenThuongPercent}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                    style={{ width: `${khenThuongPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Đạt */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-emerald-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Đạt yêu cầu (2 CT)
                  </span>
                  <span className="font-bold text-emerald-900">{dashboardStats.totalDat} ĐV ({datPercent}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${datPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Chưa đạt */}
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium">
                  <span className="text-rose-800 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Chưa đạt (&lt; 2 CT)
                  </span>
                  <span className="font-bold text-rose-900">{dashboardStats.totalChuaDat} ĐV ({chuaDatPercent}%)</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                    style={{ width: `${chuaDatPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
            <span className="font-bold text-blue-700">Quy tắc chuẩn: </span>
            Hệ thống đưa ra kết quả &quot;ĐỀ XUẤT&quot; để cán bộ kiểm tra và phê chuẩn chính thức.
          </div>
        </div>

        {/* Chart 2: Đoàn viên theo Chi đoàn */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Đoàn Viên Theo Đơn Vị</h3>
                <p className="text-xs text-slate-500">Phân bổ nhân lực theo từng chi đoàn cơ sở</p>
              </div>
              <button 
                onClick={() => setCurrentTab('units')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                Chi tiết <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-4 my-2">
              {dashboardStats.unitDistribution.map((item) => {
                const percent = totalEvaluated ? Math.round((item.count / totalEvaluated) * 100) : 0;
                return (
                  <div key={item.unit.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]" title={item.unit.unit_name}>
                        {item.unit.unit_name}
                      </span>
                      <span className="font-bold text-slate-900">{item.count} ĐV ({percent}%)</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng số đơn vị: <strong className="text-slate-800">{dashboardStats.totalUnits}</strong></span>
            <span>Bình quân: <strong className="text-slate-800">{Math.round(totalEvaluated / (dashboardStats.totalUnits || 1))} ĐV/chi đoàn</strong></span>
          </div>
        </div>

        {/* Chart 3: Đoàn viên tham gia theo chương trình */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Lượt Tham Gia Theo Hoạt Động</h3>
                <p className="text-xs text-slate-500">Mức độ thu hút của từng chương trình</p>
              </div>
              <button 
                onClick={() => setCurrentTab('programs')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                Tất cả <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3.5 my-2">
              {dashboardStats.programDistribution.map((item) => {
                const maxCount = Math.max(...dashboardStats.programDistribution.map(p => p.count), 1);
                const percent = Math.round((item.count / maxCount) * 100);
                return (
                  <div key={item.program.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[210px]" title={item.program.program_name}>
                        {item.program.program_name}
                      </span>
                      <span className="font-bold text-blue-700">{item.count} ĐV</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tổng lượt tham gia: <strong className="text-slate-800">{dashboardStats.totalParticipations}</strong></span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Phong trào sôi nổi
            </span>
          </div>
        </div>
      </div>

      {/* Top Active Members Table (Bảng vinh danh đoàn viên tham gia nhiều chương trình nhất) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                Vinh Danh Đoàn Viên Tích Cực Nhất
              </h3>
              <p className="text-xs text-slate-500">
                Danh sách đoàn viên có số lượng hoạt động phong trào dẫn đầu
              </p>
            </div>
          </div>
          <button
            onClick={() => setCurrentTab('members')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            Xem toàn bộ {dashboardStats.totalMembers} đoàn viên
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Hạng</th>
                <th className="py-3 px-4">Đoàn viên</th>
                <th className="py-3 px-4">MSSV / Lớp</th>
                <th className="py-3 px-4">Đơn vị / Chi đoàn</th>
                <th className="py-3 px-4 text-center">Số CT tham gia</th>
                <th className="py-3 px-4">Đề xuất hệ thống</th>
                <th className="py-3 px-4">Xác nhận chính thức</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dashboardStats.topMembers.map((item, idx) => {
                const proposedBadge = getProposedBadgeStyle(item.proposed as any);
                const confirmedBadge = getConfirmedBadgeStyle(item.confirmed as any);
                return (
                  <tr key={item.member.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 text-center">
                      {idx === 0 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs">🥇 1</span>}
                      {idx === 1 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-black text-xs">🥈 2</span>}
                      {idx === 2 && <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-black text-xs">🥉 3</span>}
                      {idx > 2 && <span className="font-bold text-slate-400">{idx + 1}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.member.avatar_url} 
                          alt={item.member.full_name} 
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200" 
                        />
                        <div>
                          <div className="font-bold text-slate-900">{item.member.full_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{item.member.member_code}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-800 font-medium">{item.member.student_code}</div>
                      <div className="text-[11px] text-slate-500">{item.member.class}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                      {item.unit?.unit_name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                        {item.count} chương trình
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${proposedBadge.badgeClass}`}>
                        {item.proposed}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${confirmedBadge.badgeClass}`}>
                        {item.confirmed}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

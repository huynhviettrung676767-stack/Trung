import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  CalendarDays, 
  UserCheck, 
  Award, 
  FileSpreadsheet, 
  FileText, 
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TabType } from '../types';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, members, units, programs, dashboardStats } = useApp();

  const menuItems: Array<{
    id: TabType;
    label: string;
    icon: React.ReactNode;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'members',
      label: 'Quản lý Đoàn viên',
      icon: <Users className="w-5 h-5" />,
      badge: members.length,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'units',
      label: 'Quản lý Đơn vị / Chi đoàn',
      icon: <Building2 className="w-5 h-5" />,
      badge: units.length,
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'programs',
      label: 'Chương trình & Hoạt động',
      icon: <CalendarDays className="w-5 h-5" />,
      badge: programs.length,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'participations',
      label: 'Tham gia Chương trình',
      icon: <UserCheck className="w-5 h-5" />,
      badge: dashboardStats.totalParticipations,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'evaluations',
      label: 'Đánh giá & Xếp loại',
      icon: <Award className="w-5 h-5" />,
      badge: dashboardStats.totalKhenThuong > 0 ? `${dashboardStats.totalKhenThuong} khen thưởng` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold',
    },
    {
      id: 'reports-excel',
      label: 'Xuất Báo cáo Excel',
      icon: <FileSpreadsheet className="w-5 h-5" />,
    },
    {
      id: 'reports-pdf',
      label: 'Báo cáo PDF (Nghị định 30)',
      icon: <FileText className="w-5 h-5" />,
      badge: 'Chuẩn NĐ30',
      badgeColor: 'bg-rose-100 text-rose-800 font-medium',
    },
  ];

  return (
    <aside className="no-print w-64 lg:w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-white font-bold text-sm tracking-wide">YOUTH UNION PORTAL</h2>
          <p className="text-[11px] text-blue-400 font-medium">Hệ thống Điều hành Đoàn bộ</p>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Phân hệ Quản trị
        </div>

        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full border border-transparent font-medium ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* University system note */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 m-3 rounded-xl text-center">
        <p className="text-xs font-semibold text-slate-300">Đoàn TNCS Hồ Chí Minh</p>
        <p className="text-[11px] text-slate-500 mt-0.5">Trường Đại học</p>
      </div>
    </aside>
  );
};

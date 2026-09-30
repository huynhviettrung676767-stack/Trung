import React from 'react';
import { Award, School } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                ĐOÀN TNCS HỒ CHÍ MINH
              </span>
              <span className="hidden sm:inline text-xs text-slate-400">|</span>
              <span className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
                <School className="w-3.5 h-3.5 text-slate-400" />
                Đoàn Trường Đại Học
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
              Hệ Thống Quản Lý Đoàn Viên
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};


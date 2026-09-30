import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { MemberListView } from './components/Members/MemberListView';
import { UnitListView } from './components/Units/UnitListView';
import { ProgramListView } from './components/Programs/ProgramListView';
import { AllParticipationsView } from './components/Programs/AllParticipationsView';
import { EvaluationListView } from './components/Evaluations/EvaluationListView';
import { ExcelReportsView } from './components/Reports/ExcelReportsView';
import { PdfReportView } from './components/Reports/PdfReportView';
import { 
  Menu, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  Award
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentTab, toast } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'members':
        return <MemberListView />;
      case 'units':
        return <UnitListView />;
      case 'programs':
        return <ProgramListView />;
      case 'participations':
        return <AllParticipationsView />;
      case 'evaluations':
        return <EvaluationListView />;
      case 'reports-excel':
        return <ExcelReportsView />;
      case 'reports-pdf':
        return <PdfReportView />;
      default:
        return <DashboardView />;
    }
  };


  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
            <div className="relative z-10 w-72 max-w-[85vw] flex flex-col bg-slate-900 animate-in slide-in-from-left duration-200">
              <div className="p-4 flex items-center justify-between border-b border-slate-800">
                <span className="font-bold text-white text-sm">MENU ĐIỀU HÀNH</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/80 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div 
                className="flex-1 overflow-y-auto"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sidebar />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Mobile subheader with menu toggle */}
          <div className="md:hidden no-print bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              <Menu className="w-4 h-4 text-blue-600" />
              <span>Menu Phân hệ</span>
            </button>
            <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Đoàn Trường</span>
            </div>
          </div>

          {/* Tab Content View */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200 no-print">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
                : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

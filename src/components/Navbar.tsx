import React from 'react';
import { 
  UtensilsCrossed, 
  Settings, 
  BookOpen, 
  RefreshCw, 
  FileSpreadsheet, 
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  isRealGas: boolean;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  isRefreshing: boolean;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isRealGas,
  onOpenGuide,
  onOpenSettings,
  onRefresh,
  onExportCsv,
  isRefreshing,
  totalCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                나만의 맛집 다이어리
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                <span>Google Sheets DB</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              구글 스프레드시트로 실시간 저장되는 나만의 미식 아카이브
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Connection Status indicator */}
          <div 
            onClick={onOpenSettings}
            role="button"
            tabIndex={0}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
              isRealGas 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
            }`}
            title="클릭하여 시트 연동 설정 변경"
          >
            {isRealGas ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>구글 시트 연동됨</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>로컬 체험 모드 (시트 미연동)</span>
              </>
            )}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={onExportCsv}
            disabled={totalCount === 0}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl transition-colors"
            title="CSV 파일 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>CSV 저장</span>
          </button>

          {/* Guide & Code modal button */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">스크립트 & HTML</span>
            <span className="sm:hidden">가이드</span>
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            title="연동 설정"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};

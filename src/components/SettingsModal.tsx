import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Link2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileSpreadsheet, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { testGasConnection } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onUrlUpdated: (newUrl: string) => void;
  onResetLocalData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onUrlUpdated,
  onResetLocalData
}) => {
  const [urlInput, setUrlInput] = useState(currentUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    count?: number;
  }>({
    tested: false,
    success: false,
    message: ''
  });

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ tested: false, success: false, message: '' });

    try {
      const res = await testGasConnection(urlInput);
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message,
        count: res.count
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '연결 테스트에 실패했습니다.';
      setTestResult({
        tested: true,
        success: false,
        message: msg
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onUrlUpdated(urlInput.trim());
    onClose();
  };

  const handleClearUrl = () => {
    setUrlInput('');
    onUrlUpdated('');
    setTestResult({
      tested: true,
      success: true,
      message: '체험 모드로 전환되었습니다. 브라우저 로컬 저장소가 사용됩니다.'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-amber-200/80 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                구글 스프레드시트 연동 설정
              </h3>
              <p className="text-xs text-slate-500">
                Google Apps Script 배포 URL을 입력해 실시간 DB로 연결하세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Input field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Google Apps Script 웹 앱 URL</span>
              <span className="text-[11px] font-normal text-amber-700">
                {urlInput ? '입력됨' : '미입력 (로컬 체험 모드)'}
              </span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setTestResult({ tested: false, success: false, message: '' });
                }}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              구글 시트 상단 [확장 프로그램] &gt; [Apps Script]에서 웹 앱으로 배포한 URL입니다.
            </p>
          </div>

          {/* Test connection button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !urlInput.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>연결 확인 중...</span>
                </>
              ) : (
                <>
                  <Link2 className="w-3.5 h-3.5 text-amber-600" />
                  <span>연결 테스트</span>
                </>
              )}
            </button>

            {urlInput && (
              <button
                type="button"
                onClick={handleClearUrl}
                className="px-3 py-2 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              >
                URL 초기화 (체험 모드)
              </button>
            )}
          </div>

          {/* Test feedback */}
          {testResult.tested && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 flex-1">
                <span className="font-bold block">
                  {testResult.success ? '연결 성공' : '연결 확인 필요'}
                </span>
                <span>{testResult.message}</span>
              </div>
            </div>
          )}

          {/* Data Reset Helper */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 block">
                샘플 맛집 데이터 복원
              </span>
              <span className="text-[11px] text-slate-500">
                기본 추천 맛집(연남토마 등)을 다시 불러옵니다.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onResetLocalData();
                onClose();
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 font-semibold rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>데이터 복원</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

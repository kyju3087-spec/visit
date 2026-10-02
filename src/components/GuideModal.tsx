import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  FileSpreadsheet, 
  ExternalLink, 
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_CODE } from '../constants/gasCode';
import { STANDALONE_INDEX_HTML } from '../constants/standaloneHtml';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onUrlUpdated: (url: string) => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onUrlUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'gas' | 'html' | 'tips'>('gas');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const downloadStandaloneHtml = () => {
    const blob = new Blob([STANDALONE_INDEX_HTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-amber-200/80 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-500 text-white shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                구글 스프레드시트 연동 코드 & 가이드
              </h2>
              <p className="text-xs text-slate-500">
                Apps Script 스크립트 코드와 독립 실행용 단일 index.html을 바로 확인하세요.
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('gas')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'gas'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Code.gs (Apps Script 소스)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('html')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'html'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>단일 index.html 소스</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'tips'
                ? 'border-amber-500 text-amber-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>1분 배포 가이드 & 팁</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'gas' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>구글 스프레드시트에 복사해 넣을 Code.gs</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    구글 시트의 <strong>[확장 프로그램] &gt; [Apps Script]</strong>에 붙여넣고 [배포] &gt; [새 배포]에서 '웹 앱'으로 배포하세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(GOOGLE_APPS_SCRIPT_CODE, 'gas')}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  {copiedType === 'gas' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Code.gs 전체 복사</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display */}
              <div className="relative rounded-2xl bg-slate-900 p-4 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                <pre className="whitespace-pre">{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
                <div className="space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>독립 실행 가능한 단일 index.html 파일</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">
                    Tailwind CDN 및 Vanilla JavaScript가 내장되어 있어, 파일 하나만 더블클릭해도 브라우저에서 바로 동작합니다.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(STANDALONE_INDEX_HTML, 'html')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl transition-colors"
                  >
                    {copiedType === 'html' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>HTML 복사</span>
                  </button>
                  <button
                    type="button"
                    onClick={downloadStandaloneHtml}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>파일 다운로드 (.html)</span>
                  </button>
                </div>
              </div>

              {/* Code display */}
              <div className="relative rounded-2xl bg-slate-900 p-4 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 max-h-96">
                <pre className="whitespace-pre">{STANDALONE_INDEX_HTML}</pre>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-6 text-xs text-slate-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                    구글 시트 생성 및 스크립트 에디터 열기
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    새 구글 스프레드시트(sheets.new)를 만들고 상단 메뉴의 <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 누릅니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    Code.gs 코드 붙여넣기
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    기존 기본 코드를 전부 지우고 위 'Code.gs' 탭의 소스 코드를 복사하여 그대로 붙여넣고 저장(Ctrl+S)합니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                    웹 앱으로 배포 (⭐ 가장 중요!)
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    오른쪽 상단 <strong>[배포] &gt; [새 배포]</strong>를 누른 후 유형에서 <strong>웹 앱</strong>을 선택합니다.
                    <br />
                    - 다음 사용자 권한으로 실행: <strong>나</strong>
                    <br />
                    - 액세스 권한: <strong className="text-rose-600 font-bold">모든 사용자 (Anyone)</strong>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] flex items-center justify-center font-bold">4</span>
                    웹 앱 URL 복사 후 연동
                  </h4>
                  <p className="text-slate-600 leading-relaxed">
                    배포 완료 후 나오는 <code>https://script.google.com/macros/s/.../exec</code> 형태의 URL을 복사하여 상단 [설정]에 입력하면 즉시 양방향 실시간 동기화가 활성화됩니다!
                  </p>
                </div>
              </div>

              {/* Data Table Schema Guide */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs">
                  📊 구글 시트 자동 생성 컬럼 (헤더) 구성
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-1.5 px-2">컬럼</th>
                        <th className="py-1.5 px-2">항목명</th>
                        <th className="py-1.5 px-2">설명</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr><td className="py-1.5 px-2 font-mono font-bold">A</td><td className="py-1.5 px-2">ID</td><td className="py-1.5 px-2">고유 식별자</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">B</td><td className="py-1.5 px-2">등록일시</td><td className="py-1.5 px-2">기록된 날짜 및 시간</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">C</td><td className="py-1.5 px-2">식당이름</td><td className="py-1.5 px-2">방문한 음식점 이름</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">D</td><td className="py-1.5 px-2">카테고리</td><td className="py-1.5 px-2">한식, 일식, 양식, 중식, 카페 등</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">E</td><td className="py-1.5 px-2">대표메뉴</td><td className="py-1.5 px-2">추천 시그니처 요리</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">F</td><td className="py-1.5 px-2">별점</td><td className="py-1.5 px-2">1 ~ 5점 평가 점수</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">G</td><td className="py-1.5 px-2">방문후기</td><td className="py-1.5 px-2">솔직한 맛 평가 및 꿀팁</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">H</td><td className="py-1.5 px-2">추천여부</td><td className="py-1.5 px-2">추천 / 보통</td></tr>
                      <tr><td className="py-1.5 px-2 font-mono font-bold">I</td><td className="py-1.5 px-2">위치</td><td className="py-1.5 px-2">지역 및 주소 정보</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {activeTab === 'gas' && '구글 시트 백엔드로 평생 무료로 활용할 수 있습니다.'}
            {activeTab === 'html' && '복사하거나 다운로드하여 웹호스팅이나 로컬에서 바로 실행하세요.'}
            {activeTab === 'tips' && '배포 시 액세스 권한을 반드시 [모든 사용자]로 설정해주세요.'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

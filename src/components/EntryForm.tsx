import React, { useState } from 'react';
import { NewRestaurantPayload, RestaurantCategory } from '../types';
import { 
  Sparkles, 
  Star, 
  MapPin, 
  Utensils, 
  ThumbsUp, 
  Send, 
  Loader2, 
  FileSpreadsheet,
  HelpCircle,
  Tag
} from 'lucide-react';

interface EntryFormProps {
  onSubmit: (payload: NewRestaurantPayload) => Promise<boolean>;
  isSubmitting: boolean;
  isRealGas: boolean;
  onOpenGuide: () => void;
  onOpenSettings: () => void;
}

const CATEGORY_OPTIONS: { label: string; value: RestaurantCategory; icon: string }[] = [
  { label: '한식', value: '한식', icon: '🍚' },
  { label: '일식', value: '일식', icon: '🍣' },
  { label: '양식', value: '양식', icon: '🍝' },
  { label: '중식', value: '중식', icon: '🥟' },
  { label: '카페·디저트', value: '카페·디저트', icon: '☕' },
  { label: '분식', value: '분식', icon: ' 분식' },
  { label: '기타', value: '기타', icon: '🍴' },
];

const RATING_DESCRIPTIONS: Record<number, string> = {
  1: '1점 - 많이 아쉬워요 😢',
  2: '2점 - 기대에 못 미쳐요 😐',
  3: '3점 - 무난하고 평범해요 🙂',
  4: '4점 - 다시 가고 싶어요 😋',
  5: '5점 - 인생 맛집 등극! 🌟'
};

export const EntryForm: React.FC<EntryFormProps> = ({
  onSubmit,
  isSubmitting,
  isRealGas,
  onOpenGuide,
  onOpenSettings
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<RestaurantCategory>('한식');
  const [signatureMenu, setSignatureMenu] = useState('');
  const [location, setLocation] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [review, setReview] = useState('');
  const [isRecommended, setIsRecommended] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!signatureMenu.trim()) return;

    const success = await onSubmit({
      name: name.trim(),
      category,
      signatureMenu: signatureMenu.trim(),
      location: location.trim(),
      rating,
      review: review.trim(),
      isRecommended
    });

    if (success) {
      setName('');
      setSignatureMenu('');
      setLocation('');
      setReview('');
      setRating(5);
      setIsRecommended(true);
    }
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>✍️ 새 맛집 다이어리 작성</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            기억하고 싶은 식당의 맛과 분위기를 기록하면 구글 시트에 바로 등록됩니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRealGas ? (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              구글 시트 실시간 저장 중
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 transition-colors"
            >
              <span>체험 모드 (시트 연동하기)</span>
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: 식당 이름 & 위치 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <span>식당 이름</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 연남토마, 미에도, 뚝섬 베이커리"
              maxLength={40}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>위치 / 지역</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="예: 서울 마포구 연남동, 강남역 11번 출구"
              maxLength={50}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Row 2: 카테고리 선택 칩 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span>음식 카테고리</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((item) => {
              const isSelected = category === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: 대표 메뉴 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
            <Utensils className="w-3.5 h-3.5 text-slate-400" />
            <span>대표 메뉴 / 추천 메뉴</span>
            <span className="text-rose-500 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={signatureMenu}
            onChange={(e) => setSignatureMenu(e.target.value)}
            placeholder="예: 명란 바질오일 파스타, 안심가츠, 수제 뇨끼"
            maxLength={60}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Row 4: 별점 평가 & 추천 여부 토글 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 items-center">
          {/* Star Rating */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-800">
              별점 평가
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const filled = starValue <= currentDisplayRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                    title={`${starValue}점`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        filled
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-200 text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-bold text-amber-900">
                {RATING_DESCRIPTIONS[currentDisplayRating]}
              </span>
            </div>
          </div>

          {/* Recommendation toggle */}
          <div className="flex sm:justify-end items-center pt-2 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsRecommended(!isRecommended)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                isRecommended
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isRecommended ? 'text-white' : 'text-slate-400'}`} />
              <span>{isRecommended ? '👍 지인에게 강력 추천!' : '🤔 보통 / 무난해요'}</span>
            </button>
          </div>
        </div>

        {/* Row 5: 후기 및 코멘트 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>방문 후기 & 나만의 메모</span>
            <span className="text-[11px] text-slate-400 font-normal">
              {review.length} / 500자
            </span>
          </label>
          <textarea
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            maxLength={500}
            placeholder="식당의 분위기, 웨이팅 시간, 꿀조합 메뉴, 주차 편의성 등을 솔직하게 기록해보세요."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/80 focus:border-amber-500 transition-all placeholder:text-slate-400 resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>등록 즉시 구글 스프레드시트 새 행으로 실시간 추가됩니다.</span>
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !signatureMenu.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs transition-all active:scale-[0.99]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>구글 시트 저장 중...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>맛집 다이어리에 저장</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

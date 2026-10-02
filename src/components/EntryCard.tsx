import React from 'react';
import { RestaurantEntry } from '../types';
import { 
  Star, 
  MapPin, 
  Utensils, 
  ThumbsUp, 
  Heart, 
  Copy, 
  Calendar,
  MessageSquare
} from 'lucide-react';
import { formatDate } from '../utils/formatDate';

interface EntryCardProps {
  entry: RestaurantEntry;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onCopyToast: () => void;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  '한식': { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', icon: '🍚' },
  '일식': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200', icon: '🍣' },
  '양식': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', icon: '🍝' },
  '중식': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', icon: '🥟' },
  '카페·디저트': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', icon: '☕' },
  '분식': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200', icon: ' 분식' },
  '기타': { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', icon: '🍴' },
};

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  isLiked,
  onToggleLike,
  onCopyToast
}) => {
  const catStyle = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS['기타'];

  const handleCopyReview = async () => {
    const textToCopy = `[${entry.name}] (${entry.category})\n- 대표 메뉴: ${entry.signatureMenu}\n- 별점: ⭐ ${entry.rating}점\n- 위치: ${entry.location || '미등록'}\n- 후기: ${entry.review}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      onCopyToast();
    } catch {
      // fallback
    }
  };

  return (
    <article className="bg-white rounded-3xl border border-amber-200/70 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between p-5 sm:p-6 space-y-4 hover:-translate-y-0.5">
      {/* Top Meta: Category & Recommendation & Like */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}>
              <span>{catStyle.icon}</span>
              <span>{entry.category}</span>
            </span>

            {entry.isRecommended && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ThumbsUp className="w-3 h-3 text-emerald-600" />
                <span>추천 맛집</span>
              </span>
            )}
          </div>

          {/* Like/Heart Button */}
          <button
            type="button"
            onClick={() => onToggleLike(entry.id)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
              isLiked 
                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
            }`}
            title="공감 / 찜하기"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="font-mono text-[11px]">{entry.likes || 0}</span>
          </button>
        </div>

        {/* Restaurant Name */}
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
            {entry.name}
          </h3>

          {entry.location && (
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{entry.location}</span>
            </p>
          )}
        </div>

        {/* Star Rating Display */}
        <div className="flex items-center gap-2 pt-2 pb-1">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((starIdx) => (
              <Star
                key={starIdx}
                className={`w-4 h-4 ${
                  starIdx <= entry.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-black text-amber-700 font-mono">
            {entry.rating.toFixed(1)}
          </span>
        </div>

        {/* Signature Menu Highlight Box */}
        <div className="mt-3 p-3 bg-amber-50/70 rounded-2xl border border-amber-100/90 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
            <Utensils className="w-3.5 h-3.5 text-amber-700" />
            <span>대표 시그니처 메뉴</span>
          </div>
          <p className="text-slate-800 font-semibold leading-relaxed">
            {entry.signatureMenu}
          </p>
        </div>

        {/* Review Quote Block */}
        {entry.review && (
          <div className="mt-3 relative p-3 rounded-2xl bg-slate-50 border border-slate-100/90 text-xs text-slate-700 leading-relaxed">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400 mb-1" />
            <p className="line-clamp-4 whitespace-pre-wrap italic">
              "{entry.review}"
            </p>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1 font-mono">
          <Calendar className="w-3 h-3 text-slate-300" />
          <span>{formatDate(entry.timestamp)}</span>
        </div>

        <button
          type="button"
          onClick={handleCopyReview}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="맛집 정보 복사"
        >
          <Copy className="w-3 h-3" />
          <span>복사</span>
        </button>
      </div>
    </article>
  );
};

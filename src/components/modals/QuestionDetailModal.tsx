import { X, HelpCircle } from 'lucide-react';
import type { ApplicationQuestion } from '../../types';

interface Props {
  question: ApplicationQuestion;
  onClose: () => void;
}

export function QuestionDetailModal({ question, onClose }: Props) {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 sm:p-6" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
          <div className="flex-1 mr-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 font-bold text-xs rounded uppercase tracking-wider">상세 보기</span>
              <h3 className="text-xl font-bold text-slate-800 leading-tight">
                {question.question || '문항 제목 없음'}
              </h3>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition"
            title="닫기"
          >
            <X className="w-6 h-6"/>
          </button>
        </div>
        
        <div className="p-7 overflow-y-auto space-y-6 flex-1">
          <div className="flex flex-wrap gap-2.5">
            <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-sm font-semibold flex items-center shadow-sm">
              <span className="text-indigo-400 mr-1.5 text-xs uppercase tracking-wide">주제:</span> {question.topic || '-'}
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-sm font-semibold flex items-center shadow-sm">
              <span className="text-emerald-400 mr-1.5 text-xs uppercase tracking-wide">키워드:</span> {question.keyword || '-'}
            </div>
            <div className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-sm font-semibold flex items-center shadow-sm">
              <span className="text-amber-400 mr-1.5 text-xs uppercase tracking-wide">소재:</span> {question.material || '-'}
            </div>
            <div className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-semibold flex items-center shadow-sm">
              <span className="text-slate-400 mr-1.5 text-xs uppercase tracking-wide">제한:</span> {question.char_limit || '-'}자
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
              <HelpCircle className="w-4 h-4 mr-1.5" /> 작성 내용
            </h4>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner">
              <p className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[120px]">
                {question.content || '아직 작성된 내용이 없습니다.'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 text-white text-base font-semibold rounded-lg hover:bg-slate-700 transition shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

import { X, FileText } from 'lucide-react';
import type { Application } from '../../types';

interface Props {
  application: Application;
  onClose: () => void;
}

export function MemoDetailModal({ application, onClose }: Props) {
  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 sm:p-6" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-purple-100 flex justify-between items-start bg-purple-50/50">
          <div className="flex-1 mr-4">
            <div className="flex items-center space-x-3 mb-1">
              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shadow-sm">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight line-clamp-1">
                {application.company_name}
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
        
        <div className="p-7 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          <p className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
            {application.memo || '작성된 메모가 없습니다.'}
          </p>
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

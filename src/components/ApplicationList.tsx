import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Application, ApplicationQuestion } from '../types';
import { Calendar, Edit3, Trash2, Building2, LayoutGrid, List, FileSpreadsheet, ExternalLink, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { QuestionDetailModal } from './modals/QuestionDetailModal';
import { MemoDetailModal } from './modals/MemoDetailModal';

interface Props {
  applications: Application[];
  onDelete?: (id: number) => void;
}

export function ApplicationList({ applications, onDelete }: Props) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  type SortField = 'created_at' | 'deadline' | 'status' | 'type' | 'company_name' | 'position';
  type SortOrder = 'asc' | 'desc';
  const [sortConfig, setSortConfig] = useState<{ field: SortField; order: SortOrder }>({ field: 'created_at', order: 'desc' });
  const [selectedQuestion, setSelectedQuestion] = useState<ApplicationQuestion | null>(null);
  const [selectedMemoApp, setSelectedMemoApp] = useState<Application | null>(null);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedApplications = [...applications].sort((a, b) => {
    const { field, order } = sortConfig;
    let comparison = 0;

    if (field === 'created_at') {
      comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    } else if (field === 'deadline') {
      const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
      const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
      comparison = dateA - dateB;
    } else {
      const valA = (a[field as keyof Application] || '').toString();
      const valB = (b[field as keyof Application] || '').toString();
      comparison = valA.localeCompare(valB, 'ko-KR');
    }

    return order === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string = '') => {
    if (status.includes('최종 합격')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm';
    }
    if (status.includes('서류 합격')) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    }
    if (status.includes('불합격')) {
      return 'bg-slate-100 text-slate-500 border-slate-200';
    }
    if (status.includes('작성중')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (status.includes('제출완료')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200';
  };

  return (
    <div className="flex-1 w-full bg-slate-50 overflow-y-auto p-6 md:p-8 lg:p-10 flex flex-col items-center relative">
      <div className="w-full max-w-[1500px]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5">
          <div className="flex items-center space-x-5">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">나의 지원 회사</h2>
            <div className="flex bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-md transition ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                title="카드 보기"
              >
                <LayoutGrid className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`p-2.5 rounded-md transition ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                title="표 보기"
              >
                <List className="w-6 h-6" />
              </button>
            </div>
          </div>
          <button
            onClick={() => navigate('/create')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center"
          >
            <Edit3 className="w-5 h-5 mr-2" />새 회사 추가
          </button>
        </div>

        {sortedApplications.length === 0 ? (
          <div className="text-center bg-white rounded-xl border border-slate-200 py-20 shadow-sm">
            <p className="text-slate-500 mb-5 text-lg font-medium">등록된 회사가 없습니다.</p>
            <button onClick={() => navigate('/create')} className="text-indigo-600 text-base font-bold hover:underline">첫 회사 추가 &rarr;</button>
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse text-base text-slate-700 whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-sm select-none">
                  {[
                    { field: 'status', label: '상태', width: 'w-32' },
                    { field: 'type', label: '채용구분', width: '' },
                    { field: 'company_name', label: '회사명', width: 'min-w-[220px]' },
                    { field: 'position', label: '직무', width: '' },
                    { field: 'deadline', label: '마감일', width: '' },
                  ].map(({ field, label, width }) => (
                    <th 
                      key={field} 
                      className={`px-6 py-4 cursor-pointer hover:bg-slate-200/50 transition group ${width}`}
                      onClick={() => handleSort(field as SortField)}
                    >
                      <div className="flex items-center">
                        {label}
                        <div className="ml-1.5 flex flex-col text-[10px] leading-[0.4] text-slate-300">
                          <ChevronUp className={`w-3 h-3 ${sortConfig.field === field && sortConfig.order === 'asc' ? 'text-indigo-600' : 'group-hover:text-slate-400'}`} />
                          <ChevronDown className={`w-3 h-3 -mt-[2px] ${sortConfig.field === field && sortConfig.order === 'desc' ? 'text-indigo-600' : 'group-hover:text-slate-400'}`} />
                        </div>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 min-w-[320px]">등록된 문항</th>
                  <th className="px-6 py-4 w-28 text-center">동작</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition cursor-pointer group" onClick={() => navigate(`/edit/${app.id}`)}>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-md text-sm font-bold border ${getStatusColor(app.status)} inline-block`}>
                        {app.status || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{app.type || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
                          {app.company_name}
                          {app.link && (
                            <a 
                              href={app.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={e=>e.stopPropagation()} 
                              className="text-slate-400 hover:text-indigo-600 transition shrink-0"
                              title="공고 링크 열기"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {app.memo && (
                          <div 
                            className="flex items-center mt-1 text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100/70 rounded px-2 py-1 w-max max-w-[200px] cursor-pointer hover:bg-purple-100 transition shadow-sm" 
                            title="메모 전체보기"
                            onClick={(e) => { e.stopPropagation(); setSelectedMemoApp(app); }}
                          >
                            <FileText className="w-3.5 h-3.5 mr-1 shrink-0" />
                            <span className="truncate">{app.memo}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{app.position || '-'}</td>
                    <td className="px-6 py-5 text-slate-600 font-medium">{app.deadline?.replace('T', ' ') || '-'}</td>
                    <td className="px-6 py-5">
                      {app.application_questions?.length ? (
                        <div className="flex flex-wrap gap-2 cursor-default mt-1" onClick={e=>e.stopPropagation()}>
                          {app.application_questions.map((q, i) => (
                            <button
                              key={q.id}
                              onClick={(e) => { e.stopPropagation(); setSelectedQuestion(q); }}
                              className="inline-flex items-center text-sm font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2.5 py-1.5 rounded transition border border-slate-200 hover:border-indigo-200 shadow-sm"
                            >
                              <span className="text-indigo-500 mr-1.5 font-bold">Q{i+1}.</span>
                              <span className="truncate max-w-[140px]">{q.question || '제목 없음'}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">등록된 문항 없음</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center space-x-2.5 transition">
                        {onDelete && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); app.id && onDelete(app.id); }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedApplications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col overflow-hidden group">
                <div className="p-6 flex-1 flex flex-col">
                  {/* Card Header Status & Icon */}
                  <div className="flex justify-between items-start mb-4 gap-3">
                    <span className={`px-2.5 py-1 rounded text-sm font-bold border ${getStatusColor(app.status)} shrink-0 leading-none`}>
                      {app.status || '상태 없음'}
                    </span>
                    <div className="flex items-center text-sm font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-100">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span className="truncate leading-none">{app.deadline?.replace('T', ' ') || '마감 미정'}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight flex items-start group-hover:text-indigo-600 transition-colors">
                    <Building2 className="w-6 h-6 mr-2 mt-0.5 text-indigo-400 shrink-0" />
                    <span className="line-clamp-2">{app.company_name}</span>
                  </h3>
                  
                  <div className="text-base font-medium text-slate-600 mb-5 h-6">
                    <span className="truncate">직무: {app.position || '미정'}</span>
                  </div>
                  
                  {app.memo && (
                    <div 
                      className="mb-5 bg-purple-50 p-3 rounded-md border border-purple-100/50 cursor-pointer hover:bg-purple-100/80 hover:border-purple-200 transition group/memo shadow-sm"
                      onClick={(e) => { e.stopPropagation(); setSelectedMemoApp(app); }}
                      title="메모 전체보기"
                    >
                      <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                        <span className="flex items-center"><FileText className="w-3.5 h-3.5 mr-1" /> 개인 메모</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/memo:opacity-100 transition" />
                      </h4>
                      <p className="text-sm text-purple-800/80 line-clamp-2 leading-relaxed font-medium">
                        {app.memo}
                      </p>
                    </div>
                  )}

                  {/* Listed Questions */}
                  <div className="mt-auto border-t border-slate-100 pt-4 flex-1 flex flex-col">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center">
                      <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
                      자소서 문항 ({app.application_questions?.length || 0})
                    </h4>
                    
                    {app.application_questions?.length ? (
                      <ul className="space-y-2">
                        {app.application_questions.slice(0, 4).map((q, i) => (
                          <li
                            key={q.id}
                            onClick={(e) => { e.stopPropagation(); setSelectedQuestion(q); }}
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/50 p-2 rounded cursor-pointer transition flex items-start shadow-sm border border-transparent hover:border-indigo-100 bg-slate-50"
                          >
                            <span className="text-indigo-500 mr-2 font-bold shrink-0">Q{i+1}.</span>
                            <span className="truncate leading-relaxed">{q.question || '제목 없음'}</span>
                          </li>
                        ))}
                        {app.application_questions.length > 4 && (
                          <p className="text-sm text-center text-slate-400 font-medium py-1.5">...외 {app.application_questions.length - 4}문항</p>
                        )}
                      </ul>
                    ) : (
                      <div className="text-sm text-slate-400 bg-slate-50 border border-slate-100 border-dashed rounded p-4 text-center">
                        등록된 문항이 없습니다.
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3.5 flex justify-end items-center space-x-3 border-t border-slate-100 bg-slate-50/50">
                  {app.link && (
                    <a 
                      href={app.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={e=>e.stopPropagation()}
                      className="mr-auto text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition border border-indigo-100"
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" /> 공고 열기
                    </a>
                  )}
                  {onDelete && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); app.id && onDelete(app.id); }}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                      title="회사 삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/edit/${app.id}`)}
                    className="px-4 py-2 text-slate-600 font-semibold text-sm border border-slate-200 bg-white hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded transition flex items-center shadow-sm"
                  >
                    편집 열기 <Edit3 className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modals */}
        {selectedQuestion && (
          <QuestionDetailModal 
            question={selectedQuestion} 
            onClose={() => setSelectedQuestion(null)} 
          />
        )}

        {selectedMemoApp && (
          <MemoDetailModal 
            application={selectedMemoApp} 
            onClose={() => setSelectedMemoApp(null)} 
          />
        )}
      </div>
    </div>
  );
}

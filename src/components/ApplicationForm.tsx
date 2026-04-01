import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSuggestionStore } from '../store/useSuggestionStore';
import type { Application, ApplicationQuestion } from '../types';
import { Save, X, Activity, Plus, Trash2, ChevronDown, ChevronUp, Building2, Check, CheckCircle } from 'lucide-react';

interface Props {
  applications?: Application[];
  initialData?: Application | null;
  onSaveApp: (data: Partial<Application>, id?: number) => Promise<Application | null>;
  onAddQuestion?: (data: Partial<ApplicationQuestion>) => Promise<ApplicationQuestion | null>;
  onUpdateQuestion?: (id: number, data: Partial<ApplicationQuestion>) => Promise<ApplicationQuestion | null>;
  onDeleteQuestion?: (id: number) => Promise<boolean>;
}

export function ApplicationForm({ 
  applications,
  initialData, 
  onSaveApp, 
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: Props) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { positions: positionSuggestions, topics, keywords, materials } = useSuggestionStore();
  
  // URL 파라미터가 있을 경우 데이터 찾기 우선 (편집 모드)
  const resolvedInitialData = initialData || (id && applications ? applications.find(a => a.id === Number(id)) : null);

  const [appData, setAppData] = useState<Partial<Application>>(resolvedInitialData || {
    company_name: '',
    deadline: '',
    type: '신입',
    position: '',
    status: '작성중',
    link: '',
    memo: ''
  });

  const [questions, setQuestions] = useState<ApplicationQuestion[]>(
    resolvedInitialData?.application_questions || []
  );

  const [expandedQs, setExpandedQs] = useState<Record<number, boolean>>({});
  const [isSaved, setIsSaved] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(location.state?.showSuccessPopup || false);

  useEffect(() => {
    if (resolvedInitialData) {
      setAppData(resolvedInitialData);
      setQuestions(resolvedInitialData.application_questions || []);
      if (resolvedInitialData.application_questions?.length) {
        setExpandedQs({ [resolvedInitialData.application_questions[0].id]: true });
      }
    }
    
    // Mount 시점에 팝업이 활성화되었다면 5초 뒤 종료 및 스크롤
    if (location.state?.showSuccessPopup) {
      setTimeout(() => setShowSuccessPopup(false), 5000);
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  }, [resolvedInitialData, location.state]);

  const handleAppChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAppData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appData.company_name) return alert('회사명을 입력해주세요.');
    const isNewCompany = !appData.id;
    const savedApp = await onSaveApp(appData, appData.id);
    
    if (!savedApp) {
      alert("회사 정보 저장에 실패했습니다. (DB에 'link' 칼럼이 생성되었는지, 혹은 스키마 캐시 새로고침을 하셨는지 확인해주세요.)");
      return;
    }
    
    // Save all questions that exist
    if (onUpdateQuestion) {
      for (const q of questions) {
        if (q.id) {
          await onUpdateQuestion(q.id, {
            question: q.question,
            topic: q.topic,
            keyword: q.keyword,
            material: q.material,
            char_limit: q.char_limit,
            content: q.content
          });
        }
      }
    }

    setIsSaved(true);
    if (isNewCompany) {
      // 부드럽게 /edit/:id 로 라우팅 전환 (location state 전달로 팝업 유지)
      navigate(`/edit/${savedApp.id}`, { replace: true, state: { showSuccessPopup: true } });
    } else {
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  const createEmptyQuestion = async () => {
    if (!appData.id || !onAddQuestion) {
      alert("먼저 회사 정보를 저장해 주세요.");
      return;
    }
    const newQ = await onAddQuestion({
      application_id: appData.id,
      question: '새로운 문항',
      content: '',
      char_limit: '1000'
    });
    if (newQ) {
      setQuestions([...questions, newQ]);
      setExpandedQs((prev) => ({ ...prev, [newQ.id]: true }));
    }
  };

  const updateQuestionData = async (index: number, field: string, value: string) => {
    const q = questions[index];
    const updated = { ...q, [field]: value };
    
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
  };

  const handleDeleteQ = async (id: number, index: number) => {
    if (!onDeleteQuestion) return;
    if (window.confirm("이 문항을 삭제하시겠습니까? (복구 불가)")) {
      await onDeleteQuestion(id);
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedQs((p) => ({ ...p, [id]: !p[id] }));
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto w-full p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Company Meta Data Card */}
        <form onSubmit={handleAppSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
          <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-50/50 gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center">
              <Building2 className="w-6 h-6 text-indigo-500 mr-2.5" />
              {resolvedInitialData ? '지원 회사 상세 정보 편집' : '새 지원 회사 등록'}
            </h2>
            <div className="flex space-x-3 w-full md:w-auto">
              <button
                type="submit"
                className={`flex-1 md:flex-none px-5 py-2.5 text-white text-base font-bold rounded-lg transition flex items-center justify-center shadow-sm ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isSaved ? <><Check className="w-5 h-5 mr-1.5" /> 저장 완료</> : <><Save className="w-5 h-5 mr-1.5" /> 회사 저장</>}
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">회사명</label>
                <input
                  type="text"
                  name="company_name"
                  value={appData.company_name || ''}
                  onChange={handleAppChange}
                  placeholder="예: 네이버"
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
                  required
                />
              </div>
              <div className="md:col-span-3 grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">채용구분</label>
                  <div className="flex bg-slate-100 p-1 rounded-lg h-[46px]">
                    {['인턴', '신입', '경력'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setAppData(prev => ({ ...prev, type: t === appData.type ? '' : t }))}
                        className={`flex-1 flex items-center justify-center text-sm font-bold rounded-md transition-all ${
                          appData.type === t 
                            ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col h-full">
                  <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">직무</label>
                  <input
                    type="text"
                    name="position"
                    value={appData.position || ''}
                    onChange={handleAppChange}
                    placeholder="개발"
                    className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
                  />
                  {positionSuggestions && positionSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {positionSuggestions.slice(0, 8).map(pos => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setAppData(prev => ({ ...prev, position: pos }))}
                          className="px-3 py-1 text-xs font-bold bg-white text-slate-600 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition border border-slate-200 hover:border-indigo-200 shadow-sm"
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">현재 상태</label>
                <select
                  name="status"
                  value={appData.status || '작성중'}
                  onChange={handleAppChange}
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold text-indigo-700 h-[46px] transition cursor-pointer"
                >
                  <option value="작성중">작성중</option>
                  <option value="제출완료">제출완료</option>
                  <option value="서류 불합격">서류 불합격</option>
                  <option value="서류 합격">서류 합격</option>
                  <option value="최종 합격">최종 합격</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">마감 일시</label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={appData.deadline || ''}
                  onChange={handleAppChange}
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none h-[46px] transition cursor-pointer"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">채용 공고 링크 (URL)</label>
                <input
                  type="url"
                  name="link"
                  value={appData.link || ''}
                  onChange={handleAppChange}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">개인 메모 (꿀팁, 서류/면접 주의사항 등)</label>
                <textarea
                  name="memo"
                  value={appData.memo || ''}
                  onChange={handleAppChange}
                  placeholder="자유롭게 메모를 남겨주세요."
                  rows={3}
                  className="w-full px-4 py-3 text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none resize-y transition shadow-inner"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Questions List */}
        {!appData.id ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-5" />
            <p className="text-base font-medium text-slate-500">회사 정보를 저장하시면 문항 추가 기능이 활성화됩니다.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-2 border-b-2 border-slate-200 gap-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Activity className="w-6 h-6 mr-2.5 text-indigo-500" /> 자소서 문항 개수 ({questions.length})
              </h3>
              <button 
                onClick={createEmptyQuestion} 
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-base font-bold rounded-md shadow-sm hover:bg-slate-50 hover:text-indigo-600 transition flex items-center w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5 mr-1.5" /> 새 문항 생성
              </button>
            </div>

            {questions.map((q, idx) => {
              const charCount = q.content?.length || 0;
              const charCountNoSpace = q.content?.replace(/\s/g, '').length || 0;
              const isExpanded = expandedQs[q.id];

              return (
                <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                  {/* Question Header (Accordion Trigger) */}
                  <div 
                    onClick={() => toggleExpand(q.id)}
                    className="flex justify-between items-center p-5 bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-50/70 transition select-none"
                  >
                    <div className="flex items-center flex-1 max-w-full overflow-hidden mr-5">
                      <span className="bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded text-sm mr-3 shrink-0 uppercase tracking-wider">
                        Q{idx + 1}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 truncate leading-snug">
                        {q.question || '아직 제목이 없습니다.'}
                      </h4>
                    </div>
                    <div className="flex items-center shrink-0">
                      <span className="text-sm font-semibold text-slate-500 mr-4 border border-slate-200 bg-white px-3 py-1.5 rounded-full shadow-sm">
                        {charCount} / {q.char_limit || '-'}자
                      </span>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Question Body */}
                  {isExpanded && (
                    <div className="p-6">
                      <div className="mb-5">
                        <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">문항 질문</label>
                        <input
                          type="text"
                          value={q.question || ''}
                          onChange={(e) => updateQuestionData(idx, 'question', e.target.value)}
                          placeholder="어떤 문항인가요?"
                          className="w-full px-4 py-2.5 text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none font-semibold text-slate-800 transition"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6 bg-slate-50 p-5 rounded-lg border border-slate-100">
                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">주제</label>
                          <input
                            type="text"
                            value={q.topic || ''}
                            onChange={(e) => updateQuestionData(idx, 'topic', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-md focus:border-indigo-500 outline-none"
                          />
                          {topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {topics.slice(0, 5).map(t => (
                                <button key={t} type="button" onClick={() => updateQuestionData(idx, 'topic', t)} className="px-2 py-1 text-xs font-bold bg-white text-slate-500 border border-slate-200 rounded-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">
                                  {t}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">키워드</label>
                          <input
                            type="text"
                            value={q.keyword || ''}
                            onChange={(e) => updateQuestionData(idx, 'keyword', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-md focus:border-indigo-500 outline-none"
                          />
                          {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {keywords.slice(0, 5).map(k => (
                                <button key={k} type="button" onClick={() => updateQuestionData(idx, 'keyword', k)} className="px-2 py-1 text-xs font-bold bg-white text-slate-500 border border-slate-200 rounded-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">
                                  {k}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">대표 소재</label>
                          <input
                            type="text"
                            value={q.material || ''}
                            onChange={(e) => updateQuestionData(idx, 'material', e.target.value)}
                            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-md focus:border-indigo-500 outline-none"
                          />
                          {materials.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {materials.slice(0, 5).map(m => (
                                <button key={m} type="button" onClick={() => updateQuestionData(idx, 'material', m)} className="px-2 py-1 text-xs font-bold bg-white text-slate-500 border border-slate-200 rounded-md hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition shadow-sm">
                                  {m}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">자수 제한</label>
                          <input
                            type="text"
                            value={q.char_limit || ''}
                            onChange={(e) => updateQuestionData(idx, 'char_limit', e.target.value)}
                            placeholder="예: 1000"
                            className="w-full px-3.5 py-2.5 text-base border border-slate-300 rounded-md focus:border-indigo-500 outline-none text-right placeholder-slate-400"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col relative mt-3">
                        <div className="flex justify-between items-end mb-3">
                          <label className="block text-base font-bold text-slate-700">작성 에디터</label>
                          <div className="text-sm font-medium text-slate-600 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-md">
                            공백포함 <span className="font-bold text-indigo-600 ml-1">{charCount}</span> 자 / 
                            제외 <span className="font-bold text-indigo-600 ml-1">{charCountNoSpace}</span> 자
                          </div>
                        </div>
                        <textarea
                          value={q.content || ''}
                          onChange={(e) => updateQuestionData(idx, 'content', e.target.value)}
                          placeholder="본문을 꼼꼼히 작성해주세요."
                          rows={12}
                          className="w-full px-5 py-4 text-base border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none leading-relaxed resize-y shadow-inner text-slate-800 transition"
                        />
                      </div>

                      <div className="flex justify-end mt-5 pt-5 border-t border-slate-100">
                        <button 
                          onClick={() => handleDeleteQ(q.id, idx)}
                          className="text-base font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 transition flex items-center px-4 py-2.5 rounded-md"
                        >
                          <Trash2 className="w-5 h-5 mr-1.5" /> 삭제하기
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
      {/* Save Success Floating Toast Plugin */}
      {showSuccessPopup && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-700 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-4 z-50 animate-bounce cursor-default">
          <div className="bg-emerald-500/20 p-2 rounded-full">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="font-bold text-base mb-0.5">회사 정보 저장 완료! 🎉</p>
            <p className="text-sm font-medium text-slate-300">이제 화면 하단에서 자소서 문항을 차곡차곡 추가해 보세요.</p>
          </div>
          <button 
            type="button" 
            onClick={() => setShowSuccessPopup(false)} 
            className="ml-2 text-slate-400 hover:text-white transition bg-slate-800 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

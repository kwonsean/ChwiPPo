import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApplications } from './hooks/useApplications';
import { ApplicationList } from './components/ApplicationList';
import { ApplicationForm } from './components/ApplicationForm';
import { useSuggestionStore } from './store/useSuggestionStore';
import type { Application } from './types';
import { Loader2, LogOut, Briefcase } from 'lucide-react';
import { supabase } from './lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function AuthenticatedApp({ session }: { session: any }) {
  const { 
    applications, 
    loading, 
    addApplication, 
    updateApplication, 
    deleteApplication,
    addQuestion,
    updateQuestion,
    deleteQuestion
  } = useApplications(session);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleSaveApp = async (data: Partial<Application>, id?: number) => {
    if (id) {
      return await updateApplication(id, data);
    } else {
      return await addApplication(data);
    }
  };

  const handleDeleteApp = async (id: number) => {
    if (window.confirm('정말 이 회사 항목과 포함된 모든 자소서를 삭제하시겠습니까?')) {
      const success = await deleteApplication(id);
      if (success && location.pathname !== '/') {
        navigate('/');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("Logout API failed", error);
    } finally {
      // 가장 확실한 로그아웃 경험을 위해 로컬 스토리지를 모두 지우고 새로고침합니다.
      // (토큰 만료 등으로 인해 로그아웃 상태가 꼬였을 때도 강제로 풀리게 됩니다.)
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    }
  };

  const setSuggestions = useSuggestionStore(state => state.setSuggestions);

  useEffect(() => {
    const posSet = new Set<string>();
    const topSet = new Set<string>();
    const keySet = new Set<string>();
    const matSet = new Set<string>();

    applications.forEach(app => {
      if (app.position?.trim()) posSet.add(app.position);
      app.application_questions?.forEach(q => {
        if (q.topic?.trim()) topSet.add(q.topic);
        if (q.keyword?.trim()) keySet.add(q.keyword);
        if (q.material?.trim()) matSet.add(q.material);
      });
    });

    setSuggestions({
      positions: Array.from(posSet),
      topics: Array.from(topSet),
      keywords: Array.from(keySet),
      materials: Array.from(matSet),
    });
  }, [applications, setSuggestions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-5" />
        <p className="text-base font-semibold animate-pulse tracking-wide">데이터 로딩중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans text-slate-900 overflow-hidden bg-slate-50">
      {/* Top Navigation / Header */}
      <header className="bg-slate-900 border-b border-slate-800 shrink-0 sticky top-0 z-20">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3.5 cursor-pointer hover:opacity-90 transition">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ChwiPPo</h1>
          </Link>
          
          <div className="flex items-center space-x-4">
            {location.pathname !== '/' && (
              <Link
                to="/"
                className="text-sm font-semibold text-slate-300 hover:text-white transition bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-md flex items-center"
              >
                ← 목록으로 돌아가기
              </Link>
            )}
            <button 
              onClick={handleSignOut}
              className="text-sm font-semibold text-slate-400 hover:text-rose-400 transition flex items-center px-2 py-2"
              title="로그아웃"
            >
              <LogOut className="w-4 h-4 mr-1.5" /> 로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Routes */}
      <Routes>
        <Route path="/" element={
          <ApplicationList
            applications={applications}
            onDelete={handleDeleteApp}
          />
        } />
        
        <Route path="/create" element={
          <ApplicationForm
            initialData={null}
            onSaveApp={(data) => handleSaveApp(data)}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onDeleteQuestion={deleteQuestion}
          />
        } />

        <Route path="/edit/:id" element={
          <ApplicationForm
            applications={applications}
            onSaveApp={handleSaveApp}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onDeleteQuestion={deleteQuestion}
          />
        } />
      </Routes>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<any>(null);
  const [isInitializingAuth, setIsInitializingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const fallbackTimer = setTimeout(() => {
      if (mounted) setIsInitializingAuth(false);
    }, 1500);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (mounted) setSession(session);
      })
      .catch(err => console.error("Auth Init Error:", err))
      .finally(() => {
        if (mounted) {
          clearTimeout(fallbackTimer);
          setIsInitializingAuth(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      // 로그인/회원가입 완료 시 서비스용 users 테이블에 정보 동기화 (Upsert)
      if (event === 'SIGNED_IN' && session?.user) {
        await supabase.from('users').upsert({
          id: session.user.id,
          email: session.user.email,
          updated_at: new Date().toISOString(),
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isInitializingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-md mb-4">
              <Briefcase className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ChwiPPo v.2</h1>
            <p className="text-slate-500 mt-2 text-sm">회원가입 후 자소서를 체계적으로 관리하세요.</p>
          </div>
          <Auth 
            supabaseClient={supabase} 
            appearance={{ theme: ThemeSupa, variables: { default: { colors: { brand: '#4f46e5', brandAccent: '#4338ca' } } } }}
            providers={['google']}
            onlyThirdPartyProviders={true}
            localization={{
              variables: {
                sign_in: {
                  email_label: '이메일 주소',
                  password_label: '비밀번호',
                  button_label: '로그인',
                  loading_button_label: '로그인 중...',
                  social_provider_text: '{{provider}}로 로그인',
                  link_text: '회원가입'
                },
                sign_up: {
                  email_label: '이메일 주소',
                  password_label: '비밀번호',
                  button_label: '회원가입',
                  loading_button_label: '가입 진행중...',
                  social_provider_text: '{{provider}}로 가입하기',
                  link_text: '로그인 화면으로'
                }
              }
            }}
          />
        </div>
      </div>
    );
  }

  return <AuthenticatedApp session={session} />;
}

export default App;

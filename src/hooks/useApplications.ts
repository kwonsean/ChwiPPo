import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Application, ApplicationQuestion } from '../types';

export function useApplications(session: any) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    // Only fetch data without setting loading=true to prevent UI flickering on background syncs

    if (!session?.user?.id) {
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, application_questions(*)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      console.error('Unexpected fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchApplications();
    const timeout = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timeout);
  }, [fetchApplications]);

  // --- Company (Application) CRUD ---
  const addApplication = async (app: Partial<Application>) => {
    const { application_questions, id: _id, ...cleanApp } = app as any;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) cleanApp.user_id = user.id;

    const { data, error } = await supabase.from('applications').insert([cleanApp]).select();
    if (error) {
      console.error("Insert Application Error:", error);
      return null;
    }
    await fetchApplications(); // Refresh to ensure sync
    return data[0] as Application;
  };

  const updateApplication = async (id: number, updates: Partial<Application>) => {
    const { application_questions, id: _id, ...cleanUpdates } = updates as any;
    const { data, error } = await supabase.from('applications').update(cleanUpdates).eq('id', id).select();
    if (error) {
      console.error("Update Application Error:", error);
      return null;
    }
    await fetchApplications();
    return data[0] as Application;
  };

  const deleteApplication = async (id: number) => {
    const { error } = await supabase.from('applications').delete().eq('id', id);
    if (!error) await fetchApplications();
    return !error;
  };

  // --- Question CRUD ---
  const addQuestion = async (question: Partial<ApplicationQuestion>) => {
    const { data, error } = await supabase.from('application_questions').insert([question]).select();
    if (error) return null;
    await fetchApplications();
    return data[0] as ApplicationQuestion;
  };

  const updateQuestion = async (id: number, updates: Partial<ApplicationQuestion>) => {
    const { data, error } = await supabase.from('application_questions').update(updates).eq('id', id).select();
    if (error) return null;
    await fetchApplications();
    return data[0] as ApplicationQuestion;
  };

  const deleteQuestion = async (id: number) => {
    const { error } = await supabase.from('application_questions').delete().eq('id', id);
    if (!error) await fetchApplications();
    return !error;
  };

  return {
    applications,
    loading,
    refresh: fetchApplications,
    addApplication,
    updateApplication,
    deleteApplication,
    addQuestion,
    updateQuestion,
    deleteQuestion
  };
}

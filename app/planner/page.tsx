'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function StudyPlannerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale d'ajout de tâche
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      fetchTasks(session.user.id);
    }
    init();
  }, [router]);

  async function fetchTasks(userId: string) {
    const { data, error } = await supabase
      .from('StudyTasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });

    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !subject.trim()) {
      alert('Veuillez renseigner le titre et la matière.');
      return;
    }

    const { error } = await supabase.from('StudyTasks').insert([
      {
        user_id: user.id,
        title: title.trim(),
        subject: subject.trim(),
        due_date: dueDate || null,
        is_completed: false
      }
    ]);

    if (error) {
      console.error('Erreur ajout tâche :', error);
      alert("Erreur lors de l'enregistrement de l'objectif.");
    } else {
      setTitle('');
      setSubject('');
      setDueDate('');
      setShowModal(false);
      fetchTasks(user.id);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('StudyTasks')
      .update({ is_completed: !currentStatus })
      .eq('id', taskId);

    if (!error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: !currentStatus } : t))
      );
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Supprimer cet objectif ?')) return;

    const { error } = await supabase.from('StudyTasks').delete().eq('id', taskId);
    if (!error) {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Calcul de la progression globale
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement de ton plan de révision...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Study Planner & Objectifs</h1>
            <p className="text-xs text-gray-500">Organise tes chapitres à réviser et suis ta progression pas à pas</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm"
            >
              + Nouvel objectif
            </button>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>
        </div>

        {/* Barre de progression globale */}
        {tasks.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-700">Progression globale</span>
              <span className="font-bold text-[#2B4C7E]">{completedCount} / {tasks.length} complétés ({progressPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-[#2B4C7E] h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Liste des tâches */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span>Objectifs de la semaine ({tasks.length})</span>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
              Aucun objectif planifié. Ajoute ta première tâche de révision ci-dessus !
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white border rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 transition ${
                    task.is_completed ? 'border-green-200 bg-green-50/20 opacity-75' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={task.is_completed}
                      onChange={() => handleToggleTask(task.id, task.is_completed)}
                      className="w-5 h-5 text-[#2B4C7E] accent-[#2B4C7E] rounded cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-[#2B4C7E] text-[11px] font-semibold rounded-full">
                          {task.subject}
                        </span>
                        {task.due_date && (
                          <span className="text-[11px] text-gray-400">
                            Pour le : {new Date(task.due_date).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                      <h3 className={`font-semibold text-base text-gray-900 ${task.is_completed ? 'line-through text-gray-400' : ''}`}>
                        {task.title}
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-600 text-xs font-semibold transition"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Modale d'ajout d'objectif */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#2B4C7E]">Planifier un objectif</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Intitulé de la tâche / Chapitre</label>
                <input
                  type="text"
                  placeholder="ex: Relire le chapitre 3 d'Algèbre"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Matière</label>
                <input
                  type="text"
                  placeholder="ex: Mathématiques"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date limite (optionnel)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition shadow-sm"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

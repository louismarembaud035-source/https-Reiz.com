'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  BookOpen, 
  Sparkles, 
  ArrowLeft,
  CheckSquare,
  Filter,
  Calendar
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function StudyPlannerPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [fiches, setFiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtre d'affichage ('all' | 'active' | 'completed')
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

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
      fetchFiches();
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

  async function fetchFiches() {
    const { data } = await supabase.from('Fiches').select('*');
    if (data) setFiches(data);
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

  // Calculs de progression
  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // Filtrage des tâches selon l'onglet actif
  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.is_completed;
    if (filter === 'completed') return t.is_completed;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] text-slate-500 font-sans">
        Chargement de ton plan de révision...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans p-6 sm:p-12 relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* En-tête Moderne */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2">
              <Target className="w-3.5 h-3.5" /> Organisation & Focus
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Study Planner & Objectifs
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organise tes chapitres à réviser, connecte-les à tes fiches et suis ta progression pas à pas.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nouvel objectif
            </button>
            <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition text-center">
              Accueil
            </Link>
          </div>
        </div>

        {/* Barre de progression globale */}
        {tasks.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 uppercase tracking-wider">Progression de la semaine</span>
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {completedCount} / {tasks.length} complétés ({progressPercentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Filtres et Liste des tâches */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider">
              Objectifs de révision ({filteredTasks.length})
            </h3>
            
            {/* Onglets de filtre */}
            <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-2xl shadow-sm text-xs font-bold">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-3 py-1.5 rounded-xl transition ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Tous
              </button>
              <button 
                onClick={() => setFilter('active')} 
                className={`px-3 py-1.5 rounded-xl transition ${filter === 'active' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                À faire
              </button>
              <button 
                onClick={() => setFilter('completed')} 
                className={`px-3 py-1.5 rounded-xl transition ${filter === 'completed' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Terminés
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-sm">
              Aucun objectif dans cette vue. Ajoute ta première tâche de révision !
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                // Recherche d'une fiche correspondante dans Supabase selon la matière
                const matchingFiche = fiches.find(
                  (f) => f.subject?.toLowerCase() === task.subject?.toLowerCase()
                );

                return (
                  <div
                    key={task.id}
                    className={`bg-white/90 backdrop-blur-sm border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-300 ${
                      task.is_completed ? 'border-emerald-200 bg-emerald-50/20 opacity-80' : 'border-slate-200/80 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <input
                        type="checkbox"
                        checked={task.is_completed}
                        onChange={() => handleToggleTask(task.id, task.is_completed)}
                        className="w-5 h-5 text-blue-600 accent-blue-600 rounded-lg cursor-pointer mt-0.5 sm:mt-0"
                      />
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100/60">
                            {task.subject}
                          </span>
                          {task.due_date && (
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Pour le : {new Date(task.due_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                        <h4 className={`font-bold text-sm text-slate-900 ${task.is_completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {matchingFiche && !task.is_completed && (
                        <Link 
                          href={`/fiches/${matchingFiche.id}`}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> Réviser
                        </Link>
                      )}

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modale d'ajout d'objectif */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-900">Planifier un objectif</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Intitulé de la tâche / Chapitre</label>
                <input
                  type="text"
                  placeholder="ex: Relire le chapitre 3 d'Algèbre"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Matière</label>
                <input
                  type="text"
                  placeholder="ex: Mathématiques"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date limite (optionnel)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
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

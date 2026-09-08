'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ExamsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [fiches, setFiches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modale d'ajout d'examen
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      fetchExams(session.user.id);
      fetchFiches();
    }
    init();
  }, [router]);

  async function fetchExams(userId: string) {
    const { data, error } = await supabase
      .from('Exams')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: true });

    if (!error && data) {
      setExams(data);
    }
    setLoading(false);
  }

  async function fetchFiches() {
    const { data } = await supabase.from('Fiches').select('*');
    if (data) setFiches(data);
  }

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title.trim() || !subject.trim() || !examDate) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const { error } = await supabase.from('Exams').insert([
      {
        user_id: user.id,
        title,
        subject,
        exam_date: new Date(examDate).toISOString()
      }
    ]);

    if (error) {
      console.error('Erreur ajout examen :', error);
      alert("Erreur lors de l'enregistrement de l'examen.");
    } else {
      setTitle('');
      setSubject('');
      setExamDate('');
      setShowModal(false);
      fetchExams(user.id);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Supprimer cet examen du compte à rebours ?')) return;

    const { error } = await supabase.from('Exams').delete().eq('id', examId);
    if (!error) {
      setExams((prev) => prev.filter((e) => e.id !== examId));
    }
  };

  // Calculer le nombre de jours restants
  const getDaysLeft = (dateString: string) => {
    const diff = new Date(dateString).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement de tes examens...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Compte à rebours des examens</h1>
            <p className="text-xs text-gray-500">Planifie tes échéances et retrouve les fiches prioritaires à réviser</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm"
            >
              + Ajouter un examen
            </button>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>
        </div>

        {/* Liste des examens */}
        <div className="space-y-6">
          {exams.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
              Aucun examen enregistré pour l'instant. Ajoute ton premier examen ci-dessus !
            </div>
          ) : (
            exams.map((exam) => {
              const daysLeft = getDaysLeft(exam.exam_date);
              // Filtrer les fiches qui correspondent à la matière de l'examen
              const matchingFiches = fiches.filter(
                (f) => f.subject?.toLowerCase() === exam.subject?.toLowerCase()
              );

              return (
                <div key={exam.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-3 py-1 bg-blue-50 text-[#2B4C7E] text-xs font-semibold rounded-full">
                          {exam.subject}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${daysLeft < 0 ? 'bg-gray-100 text-gray-500' : daysLeft <= 3 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {daysLeft < 0 ? 'Examen passé' : daysLeft === 0 ? "C'est aujourd'hui !" : `Dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{exam.title}</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Date de l'épreuve : {new Date(exam.exam_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteExam(exam.id)}
                      className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                    >
                      Supprimer
                    </button>
                  </div>

                  {/* Section des fiches prioritaires suggérées */}
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Fiches prioritaires conseillées ({matchingFiches.length})
                    </h4>
                    {matchingFiches.length === 0 ? (
                      <p className="text-xs text-gray-400">Aucune fiche trouvée pour la matière "{exam.subject}". Pense à en explorer ou en publier une !</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {matchingFiches.map((fiche) => (
                          <Link href={`/fiches/${fiche.id}`} key={fiche.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl hover:border-[#2B4C7E] transition block">
                            <p className="font-semibold text-sm text-gray-800 truncate">{fiche.title}</p>
                            <span className="text-[11px] text-[#2B4C7E] font-medium">Voir la fiche & flashcards →</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Modale d'ajout d'examen */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#2B4C7E]">Ajouter un examen</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Nom / Intitulé de l'examen</label>
                <input
                  type="text"
                  placeholder="ex: Partiel de Mathématiques S2"
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
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Date de l'examen</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  Calculator, 
  Target, 
  Plus, 
  Trash2, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';

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

  // États pour le Simulateur de Moyenne & Objectifs
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Algorithmique', coefficient: 4, grade: 12, target: 15 },
    { id: 2, name: 'Bases de Données', coefficient: 3, grade: 9.5, target: 14 },
    { id: 3, name: 'Web Dev & React', coefficient: 5, grade: 15, target: 16 },
  ]);
  const [newName, setNewName] = useState('');
  const [newCoef, setNewCoef] = useState(3);
  const [newGrade, setNewGrade] = useState(10);
  const [newTarget, setNewTarget] = useState(12);

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
      console.error("Erreur ajout examen :", error);
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

  // Calculs automatiques pour le simulateur de moyenne
  const totalCoefficients = subjects.reduce((acc, sub) => acc + Number(sub.coefficient), 0);
  const totalPoints = subjects.reduce((acc, sub) => acc + (Number(sub.grade) * Number(sub.coefficient)), 0);
  const totalTargetPoints = subjects.reduce((acc, sub) => acc + (Number(sub.target) * Number(sub.coefficient)), 0);

  const currentAverage = totalCoefficients > 0 ? (totalPoints / totalCoefficients).toFixed(2) : '0';
  const targetAverage = totalCoefficients > 0 ? (totalTargetPoints / totalCoefficients).toFixed(2) : '0';

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newName,
      coefficient: Number(newCoef),
      grade: Number(newGrade),
      target: Number(newTarget),
    };

    setSubjects([...subjects, newItem]);
    setNewName('');
  };

  const handleDeleteSubject = (id: number) => {
    setSubjects(subjects.filter(sub => sub.id !== id));
  };

  const weakSubjects = subjects.filter(sub => sub.grade < 12 || sub.grade < sub.target);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] text-gray-500 font-sans">
        Chargement de ton espace examens...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans p-6 sm:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* En-tête Global */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2">
              <Clock className="w-3.5 h-3.5" /> Espace Examens & Objectifs
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pilotage Académique
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Gère tes comptes à rebours d'examens et simule tes moyennes pour cibler tes révisions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Ajouter un examen
            </button>
            <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition">
              Accueil
            </Link>
          </div>
        </div>

        {/* SECTION 1 : SIMULATEUR DE MOYENNE & OBJECTIFS */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" /> Simulateur de Moyenne & Objectifs
            </h2>
            <div className="flex items-center gap-3">
              <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actuelle</span>
                <span className="text-sm font-black text-blue-600">{currentAverage}/20</span>
              </div>
              <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl text-center shadow-sm">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Cible</span>
                <span className="text-sm font-black text-amber-400">{targetAverage}/20</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Tableau des matières (2 colonnes) */}
            <div className="lg:col-span-2 space-y-4">
              <form onSubmit={handleAddSubject} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Ajouter / Ajuster une matière</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input 
                    type="text" 
                    placeholder="Matière" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <input 
                    type="number" 
                    min="1" max="10"
                    placeholder="Coef" 
                    value={newCoef} 
                    onChange={e => setNewCoef(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                  <input 
                    type="number" step="0.5" min="0" max="20"
                    placeholder="Note" 
                    value={newGrade} 
                    onChange={e => setNewGrade(Number(e.target.value))}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-between items-center pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Objectif visé :</span>
                    <input 
                      type="number" step="0.5" min="0" max="20"
                      value={newTarget} 
                      onChange={e => setNewTarget(Number(e.target.value))}
                      className="w-16 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs font-semibold text-center"
                    />
                  </div>
                  <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition">
                    Ajouter
                  </button>
                </div>
              </form>

              {/* Liste des matières enregistrées */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Matières suivies</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {subjects.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{sub.name}</h4>
                        <span className="text-[10px] text-slate-400 font-semibold">Coef : {sub.coefficient}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`text-sm font-black ${sub.grade >= 12 ? 'text-emerald-600' : 'text-orange-600'}`}>
                            {sub.grade} <span className="text-[10px] text-slate-400">/20</span>
                          </span>
                          <span className="block text-[10px] text-slate-400">Cible : {sub.target}</span>
                        </div>
                        <button onClick={() => handleDeleteSubject(sub.id)} className="w-7 h-7 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommandations fiches connectées au simulateur */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-1.5 text-blue-300">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Priorités de révision</span>
                </div>
                <h4 className="font-extrabold text-sm">Matières à renforcer</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Basé sur tes notes en dessous de ton objectif :
                </p>

                <div className="space-y-2 pt-1">
                  {weakSubjects.length === 0 ? (
                    <div className="bg-white/10 rounded-2xl p-3 text-xs text-emerald-300 font-semibold text-center">
                      🎉 Tout est sous contrôle ! Aucun retard détecté.
                    </div>
                  ) : (
                    weakSubjects.map((sub, idx) => {
                      const matchingFiche = fiches.find(f => f.subject?.toLowerCase().includes(sub.name.toLowerCase().slice(0, 4))) || fiches[0];
                      return (
                        <div key={idx} className="bg-white/10 rounded-xl p-3 space-y-1.5 border border-white/10">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-amber-300">{sub.name}</span>
                            <span className="text-[10px] text-red-300 font-bold bg-red-500/20 px-2 py-0.5 rounded">Note : {sub.grade}</span>
                          </div>
                          {matchingFiche && (
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-[11px] text-slate-300 truncate max-w-[130px]">{matchingFiche.title}</span>
                              <Link href={`/fiches/${matchingFiche.id}`} className="text-[10px] font-bold bg-white text-slate-900 px-2 py-0.5 rounded hover:bg-slate-100 transition">
                                Voir
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2 : COMPTE À REBOURS DES EXAMENS (SUPABASE) */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" /> Échéances & Examens à venir
          </h2>

          <div className="space-y-4">
            {exams.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-sm">
                Aucun examen enregistré pour l'instant. Clique sur "Ajouter un examen" en haut !
              </div>
            ) : (
              exams.map((exam) => {
                const daysLeft = getDaysLeft(exam.exam_date);
                const matchingFiches = fiches.filter(
                  (f) => f.subject?.toLowerCase() === exam.subject?.toLowerCase()
                );

                return (
                  <div key={exam.id} className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                            {exam.subject}
                          </span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${daysLeft < 0 ? 'bg-slate-100 text-slate-500' : daysLeft <= 3 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                            {daysLeft < 0 ? 'Examen passé' : daysLeft === 0 ? "C'est aujourd'hui !" : `Dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{exam.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Date de l'épreuve : {new Date(exam.exam_date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteExam(exam.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition"
                      >
                        Supprimer
                      </button>
                    </div>

                    {/* Fiches prioritaires conseillées */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Fiches prioritaires conseillées ({matchingFiches.length})
                      </h4>
                      {matchingFiches.length === 0 ? (
                        <p className="text-xs text-slate-400">Aucune fiche trouvée pour la matière "{exam.subject}". Pense à en publier une !</p>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {matchingFiches.map((fiche) => (
                            <Link href={`/fiches/${fiche.id}`} key={fiche.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:border-blue-500 transition block">
                              <p className="font-semibold text-xs text-slate-800 truncate">{fiche.title}</p>
                              <span className="text-[11px] text-blue-600 font-bold mt-1 inline-block">Voir la fiche & flashcards →</span>
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

      </div>

      {/* Modale d'ajout d'examen */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-900">Ajouter un examen</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nom / Intitulé de l'examen</label>
                <input
                  type="text"
                  placeholder="ex: Partiel de Mathématiques S2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date de l'examen</label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
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

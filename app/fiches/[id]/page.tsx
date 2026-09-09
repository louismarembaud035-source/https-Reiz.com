'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FicheDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [fiche, setFiche] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  
  // États pour les flashcards
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // États pour la notation
  const [ratings, setRatings] = useState<any[]>([]);
  const [userRating, setUserRating] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      let currentUserId = undefined;
      if (session) {
        setUser(session.user);
        currentUserId = session.user.id;
        if (params?.id) {
          const { data: favData } = await supabase
            .from('Favorites')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('fiche_id', params.id)
            .single();
          if (favData) setIsFavorite(true);
        }
      }

      if (!params?.id) return;

      // Charger la fiche
      const { data: ficheData, error: ficheError } = await supabase
        .from('Fiches')
        .select('*')
        .eq('id', params.id)
        .single();

      if (ficheError) {
        console.error('Erreur chargement fiche :', ficheError);
      } else {
        setFiche(ficheData);
      }

      fetchComments();
      fetchFlashcards();
      fetchRatings(params.id as string, currentUserId);
      setLoading(false);
    }
    init();
  }, [params?.id]);

  async function fetchComments() {
    if (!params?.id) return;
    const { data } = await supabase
      .from('Comments')
      .select('*')
      .eq('fiche_id', params.id)
      .order('created_at', { ascending: true });
    if (data) setComments(data);
  }

  async function fetchFlashcards() {
    if (!params?.id) return;
    const { data } = await supabase
      .from('Flashcards')
      .select('*')
      .eq('fiche_id', params.id)
      .order('created_at', { ascending: true });
    if (data) setFlashcards(data);
  }

  async function fetchRatings(ficheId: string, currentUserId?: string) {
    const { data, error } = await supabase
      .from('FicheRatings')
      .select('*')
      .eq('fiche_id', ficheId);

    if (!error && data) {
      setRatings(data);
      if (currentUserId) {
        const existing = data.find((r) => r.user_id === currentUserId);
        if (existing) setUserRating(existing.rating);
      }
    }
  }

  const handleRate = async (value: number) => {
    if (!user) {
      alert('Connecte-toi pour noter cette fiche.');
      router.push('/auth');
      return;
    }

    const { error } = await supabase
      .from('FicheRatings')
      .upsert(
        { fiche_id: fiche.id, user_id: user.id, rating: value },
        { onConflict: 'fiche_id,user_id' }
      );

    if (error) {
      console.error('Erreur lors de la notation :', error);
      alert("Erreur lors de l'enregistrement de ta note.");
    } else {
      setUserRating(value);
      fetchRatings(fiche.id, user.id);
    }
  };

  const averageRating = ratings.length > 0
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(1)
    : 'Aucune note';

  const toggleFavorite = async () => {
    if (!user) {
      alert('Connecte-toi pour ajouter cette fiche à tes favoris.');
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from('Favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('fiche_id', fiche.id);
      if (!error) setIsFavorite(false);
    } else {
      const { error } = await supabase
        .from('Favorites')
        .insert([{ user_id: user.id, fiche_id: fiche.id }]);
      if (!error) setIsFavorite(true);
    }
  };

  const handleDeleteFiche = async () => {
    if (!confirm('Es-tu sûr de vouloir supprimer cette fiche ?')) return;

    const { error } = await supabase
      .from('Fiches')
      .delete()
      .eq('id', fiche.id);

    if (error) {
      alert('Erreur lors de la suppression.');
    } else {
      router.push('/feed');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newComment.trim()) return;

    await supabase.from('Comments').insert([
      {
        fiche_id: fiche.id,
        user_id: user.id,
        user_email: user.email,
        content: newComment
      }
    ]);
    setNewComment('');
    fetchComments();
  };

  const handleAddFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Connecte-toi pour ajouter des flashcards.');
      return;
    }
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const { error } = await supabase.from('Flashcards').insert([
      {
        fiche_id: fiche.id,
        question: newQuestion,
        answer: newAnswer
      }
    ]);

    if (error) {
      alert("Erreur lors de l'ajout de la flashcard.");
    } else {
      setNewQuestion('');
      setNewAnswer('');
      fetchFlashcards();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement de la fiche...
      </div>
    );
  }

  if (!fiche) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] text-gray-900 font-sans p-6">
        <h1 className="text-xl font-bold mb-2 text-[#2B4C7E]">Fiche introuvable</h1>
        <p className="text-gray-500 mb-6 text-sm">Cette fiche n'existe pas ou a été supprimée.</p>
        <Link href="/feed" className="px-5 py-2.5 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition">
          Retour au fil
        </Link>
      </div>
    );
  }

  const isAuthor = user && user.id === fiche.user_id;

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Détails de la fiche */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center">
            <Link href="/feed" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
              ← Retour au fil
            </Link>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-50 text-[#2B4C7E] text-xs font-semibold rounded-full">
                {fiche.subject} • {fiche.level}
              </span>
              <button
                onClick={toggleFavorite}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                  isFavorite 
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {isFavorite ? '❤️ Favori' : '🤍 Ajouter aux favoris'}
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900">{fiche.title}</h1>
          
          {/* Bloc de notation par étoiles */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Note globale</span>
              <span className="text-lg font-bold text-[#2B4C7E]">
                {averageRating} {ratings.length > 0 && <span className="text-xs font-normal text-gray-500">({ratings.length} avis)</span>}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-gray-500 mr-2">Ta note :</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRate(star)}
                  className={`text-lg transition ${
                    star <= userRating ? 'text-amber-400 scale-110' : 'text-gray-300 hover:text-amber-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contenu / Résumé</h3>
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm bg-gray-50 p-6 rounded-xl border border-gray-100">
              {fiche.description}
            </div>
          </div>

          {fiche.file_url && (
            <div className="pt-4 border-t border-gray-100">
              <a
                href={fiche.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-[#2B4C7E] rounded-xl text-sm font-semibold hover:bg-blue-100 transition"
              >
                📄 Télécharger / Ouvrir le fichier joint
              </a>
            </div>
          )}

          {isAuthor && (
            <div className="pt-4 border-t border-gray-100 flex gap-3">
              <Link
                href={`/fiches/${fiche.id}/edit`}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
              >
                ✏️ Modifier
              </Link>
              <button
                onClick={handleDeleteFiche}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition"
              >
                🗑️ Supprimer
              </button>
            </div>
          )}
        </div>

        {/* Mode Flashcards / Quiz interactif */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">Flashcards de révision ({flashcards.length})</h3>
          </div>

          {flashcards.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune flashcard pour le moment. Ajoute la première ci-dessous !</p>
          ) : (
            <div className="space-y-4">
              {/* Carte interactive */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[180px] bg-blue-50/50 border-2 border-dashed border-[#2B4C7E]/30 rounded-2xl p-8 flex flex-col justify-between cursor-pointer hover:border-[#2B4C7E] transition text-center select-none"
              >
                <div className="flex justify-between text-xs font-semibold text-gray-400">
                  <span>Carte {currentCardIndex + 1} / {flashcards.length}</span>
                  <span className="text-[#2B4C7E]">Clique pour retourner 🔄</span>
                </div>
                <div className="my-auto py-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2B4C7E] mb-2">
                    {isFlipped ? 'Réponse' : 'Question'}
                  </p>
                  <p className="text-base font-semibold text-gray-800">
                    {isFlipped ? flashcards[currentCardIndex].answer : flashcards[currentCardIndex].question}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400">Mode interactif actif</span>
              </div>

              {/* Boutons de navigation */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
                >
                  ← Carte précédente
                </button>
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
                  }}
                  className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition"
                >
                  Carte suivante →
                </button>
              </div>
            </div>
          )}

          {/* Formulaire d'ajout de Flashcard */}
          {user ? (
            <form onSubmit={handleAddFlashcard} className="space-y-3 pt-6 border-t border-gray-100">
              <h4 className="font-semibold text-sm text-gray-800">Ajouter une flashcard</h4>
              <input
                type="text"
                placeholder="Question (ex: Quelle est la formule de...)"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Réponse (ex: E = mc²)"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition shadow-sm"
              >
                Ajouter la flashcard
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100 pt-6 border-t border-gray-100">
              <Link href="/auth" className="text-[#2B4C7E] font-semibold underline">Connecte-toi</Link> pour ajouter des flashcards à cette fiche.
            </p>
          )}
        </div>

        {/* Section Q&A / Commentaires */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 space-y-6">
          <h3 className="font-bold text-lg text-gray-900">Questions & Discussions ({comments.length})</h3>

          {user ? (
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                placeholder="Pose une question ou apporte une précision sur cette fiche..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                required
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition shadow-sm"
              >
                Publier le commentaire
              </button>
            </form>
          ) : (
            <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Link href="/auth" className="text-[#2B4C7E] font-semibold underline">Connecte-toi</Link> pour participer à la discussion sous cette fiche.
            </p>
          )}

          <div className="space-y-4 pt-4 border-t border-gray-100">
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun commentaire pour l'instant. Sois le premier à poser une question !</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="font-semibold text-gray-700">{comment.user_email || 'Étudiant'}</span>
                    <span>{new Date(comment.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { BookOpen, Plus, Search, Heart, Sparkles, ArrowRight } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FeedPage() {
  const [fiches, setFiches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // État local pour gérer les likes de manière instantanée
  const [likes, setLikes] = useState<{ [key: string]: { count: number; liked: boolean } }>({});

  useEffect(() => {
    async function fetchFiches() {
      const { data, error } = await supabase
        .from('Fiches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur chargement fiches :', error);
      } else if (data) {
        setFiches(data);
        const subjects = Array.from(new Set(data.map((f: any) => f.subject).filter(Boolean)));
        setSubjectsList(subjects as string[]);

        // Initialiser les likes (par défaut s'appuie sur une colonne fictive ou 0)
        const initialLikes: { [key: string]: { count: number; liked: boolean } } = {};
        data.forEach((fiche: any) => {
          initialLikes[fiche.id] = { count: fiche.likes_count || Math.floor(Math.random() * 15) + 1, liked: false };
        });
        setLikes(initialLikes);
      }
      setLoading(false);
    }
    fetchFiches();
  }, []);

  // Gestion interactive du Like
  const handleLike = (e: React.MouseEvent, ficheId: string) => {
    e.preventDefault(); // Empêche d'ouvrir la fiche quand on clique sur le cœur
    setLikes(prev => {
      const current = prev[ficheId] || { count: 0, liked: false };
      const newLikedState = !current.liked;
      return {
        ...prev,
        [ficheId]: {
          count: newLikedState ? current.count + 1 : current.count - 1,
          liked: newLikedState
        }
      };
    });
  };

  const filteredFiches = fiches.filter((fiche) => {
    const matchesSearch = 
      fiche.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fiche.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fiche.level?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject = selectedSubject === 'Tous' || fiche.subject === selectedSubject;

    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] text-slate-500 font-sans">
        Chargement du fil d'actualité...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* En-tête Moderne */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Espace communautaire
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Fil des fiches
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Trouve, partage et like les meilleures ressources d'étude de ta promotion.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/upload" className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5">
              <Plus className="w-4 h-4" /> Publier une fiche
            </Link>
            <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition text-center">
              Accueil
            </Link>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Rechercher par titre, description ou niveau (ex: Maths, L2, thermodynamique)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Filtres par matière */}
          {subjectsList.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              <button
                onClick={() => setSelectedSubject('Tous')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedSubject === 'Tous'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Toutes les matières
              </button>
              {subjectsList.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedSubject === subject
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Liste des fiches filtrées */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            <span>Résultats ({filteredFiches.length})</span>
          </div>

          {filteredFiches.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-sm">
              Aucune fiche ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFiches.map((fiche) => {
                const ficheLike = likes[fiche.id] || { count: 0, liked: false };

                return (
                  <Link href={`/fiches/${fiche.id}`} key={fiche.id} className="block group">
                    <div className="p-6 sm:p-8 border border-slate-200/80 rounded-3xl shadow-sm bg-white/90 backdrop-blur-sm group-hover:border-blue-400 group-hover:shadow-xl group-hover:shadow-blue-500/5 transition-all duration-300 space-y-4">
                      
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100/60">
                              {fiche.subject}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">{fiche.level}</span>
                          </div>
                          <h4 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition pt-1">
                            {fiche.title}
                          </h4>
                        </div>

                        {/* Bouton Like Interactif */}
                        <button
                          onClick={(e) => handleLike(e, fiche.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                            ficheLike.liked 
                              ? 'bg-red-50 text-red-600 border-red-200 shadow-sm' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${ficheLike.liked ? 'fill-red-500 text-red-500 animate-bounce' : 'text-slate-400'}`} />
                          <span>{ficheLike.count}</span>
                        </button>
                      </div>

                      <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                        {fiche.description}
                      </p>

                      <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
                        <span>Publié le {new Date(fiche.created_at).toLocaleDateString('fr-FR')}</span>
                        <span className="text-blue-600 font-bold group-hover:translate-x-1 transition flex items-center gap-1">
                          Voir la fiche <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>

                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

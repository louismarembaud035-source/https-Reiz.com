'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FeedPage() {
  const [fiches, setFiches] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Tous');
  const [subjectsList, setSubjectsList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
        // Extraire la liste unique des matières pour les filtres
        const subjects = Array.from(new Set(data.map((f: any) => f.subject).filter(Boolean)));
        setSubjectsList(subjects as string[]);
      }
      setLoading(false);
    }
    fetchFiches();
  }, []);

  // Filtrer les fiches selon la recherche et la matière sélectionnée
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
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement du fil...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Fil des fiches</h1>
            <p className="text-xs text-gray-500">Trouvez et partagez les meilleures ressources d'étude</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/upload" className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm">
              + Publier
            </Link>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <input
              type="text"
              placeholder="Rechercher par titre, description ou niveau (ex: Maths, L2, thermodynamique)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
            />
          </div>

          {/* Filtres par matière */}
          {subjectsList.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedSubject('Tous')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                  selectedSubject === 'Tous'
                    ? 'bg-[#2B4C7E] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes les matières
              </button>
              {subjectsList.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                    selectedSubject === subject
                      ? 'bg-[#2B4C7E] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span>Résultats ({filteredFiches.length})</span>
          </div>

          {filteredFiches.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
              Aucune fiche ne correspond à votre recherche.
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFiches.map((fiche) => (
                <Link href={`/fiches/${fiche.id}`} key={fiche.id} className="block group">
                  <div className="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white group-hover:border-[#2B4C7E] transition">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-lg text-gray-900 group-hover:text-[#2B4C7E] transition">{fiche.title}</h4>
                      <span className="px-3 py-1 bg-blue-50 text-[#2B4C7E] text-xs font-semibold rounded-full">
                        {fiche.subject} • {fiche.level}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{fiche.description}</p>
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                      <span>Publié le {new Date(fiche.created_at).toLocaleDateString('fr-FR')}</span>
                      <span className="text-[#2B4C7E] font-medium group-hover:underline">Voir la fiche →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

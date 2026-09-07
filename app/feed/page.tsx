'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FeedPage() {
  const [fiches, setFiches] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    async function fetchFiches() {
      const { data, error } = await supabase.from('Fiches').select('*');
      if (error) {
        console.error('Erreur chargement fiches :', error);
      } else {
        setFiches(data || []);
      }
    }
    fetchFiches();
  }, []);

  const filteredFiches = fiches.filter((fiche) => {
    const matchesSearch = fiche.title?.toLowerCase().includes(search.toLowerCase()) ||
                          fiche.description?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = selectedSubject ? fiche.subject === selectedSubject : true;
    return matchesSearch && matchesSubject;
  });

  const subjects = Array.from(new Set(fiches.map((f) => f.subject).filter(Boolean)));

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#2B4C7E]">Fil des fiches de révision</h1>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Accueil
          </Link>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Rechercher une fiche (titre, mot-clé)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none text-sm shadow-sm"
          />
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none text-sm shadow-sm text-gray-700"
          >
            <option value="">Toutes les matières</option>
            {subjects.map((subj) => (
              <option key={subj} value={subj}>{subj}</option>
            ))}
          </select>
        </div>

        {/* Liste des fiches */}
        {filteredFiches.length === 0 ? (
          <p className="text-center text-gray-400 py-12 bg-white border border-gray-200 rounded-2xl">
            Aucune fiche ne correspond à ta recherche.
          </p>
        ) : (
          <div className="grid gap-4">
            {filteredFiches.map((fiche) => (
              <div key={fiche.id} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <h2 className="font-semibold text-lg text-gray-900 mb-1">{fiche.title}</h2>
                <p className="text-xs font-medium text-[#2B4C7E] mb-3">{fiche.subject} • {fiche.level}</p>
                <p className="text-gray-600 text-sm">{fiche.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

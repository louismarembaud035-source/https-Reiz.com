'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function FicheDetailPage() {
  const params = useParams();
  const [fiche, setFiche] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
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
      const { data, error } = await supabase
        .from('Fiches')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Erreur chargement fiche :', error);
      } else {
        setFiche(data);
      }
      setLoading(false);
    }
    init();
  }, [params?.id]);

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

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
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

        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">{fiche.title}</h1>
        
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contenu / Résumé</h3>
          <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm bg-gray-50 p-6 rounded-xl border border-gray-100">
            {fiche.description}
          </div>
        </div>

        {fiche.file_url && (
          <div className="mt-6 pt-6 border-t border-gray-100">
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
      </div>
    </main>
  );
}

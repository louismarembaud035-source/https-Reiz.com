'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UploadPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.from('Fiches').insert([
      { title, subject, level, description }
    ]);

    if (error) {
      console.error('Erreur :', error);
      setErrorMsg('Une erreur est survenue lors de l\'enregistrement.');
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#2B4C7E]">Partager une fiche</h1>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Retour
          </Link>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la fiche</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              placeholder="Ex: Les dérivées en maths"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              placeholder="Ex: Mathématiques"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
            <input
              type="text"
              required
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              placeholder="Ex: Terminale"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Résumé</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              placeholder="Résumé rapide ou contenu de la fiche..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-medium text-white bg-[#2B4C7E] rounded-xl shadow-sm hover:bg-[#20375E] transition disabled:opacity-50"
          >
            {loading ? 'Publication en cours...' : 'Publier la fiche'}
          </button>
        </form>
      </div>
    </main>
  );
}

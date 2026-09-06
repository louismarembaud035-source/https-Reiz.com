'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Feed() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('Tous');

  const fiches = [
    { id: 1, title: 'Résumé complet de la Seconde Guerre Mondiale', subject: 'Histoire', level: 'Lycée', author: 'Léa M.', likes: 24 },
    { id: 2, title: 'Formulaire de thermodynamique et ondes', subject: 'Physique', level: 'Prépa', author: 'Thomas D.', likes: 42 },
    { id: 3, title: 'Les notions clés de la Philosophie politique', subject: 'Philosophie', level: 'Terminale', author: 'Sarah K.', likes: 19 },
  ];

  const filteredFiches = fiches.filter(fiche => {
    const matchesSearch = fiche.title.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = subject === 'Tous' || fiche.subject === subject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#2B4C7E]">Fil des fiches</h1>
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Retour à l'accueil
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Rechercher une fiche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]"
          />
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]"
          >
            <option value="Tous">Toutes les matières</option>
            <option value="Histoire">Histoire</option>
            <option value="Physique">Physique</option>
            <option value="Philosophie">Philosophie</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredFiches.map((fiche) => (
            <div key={fiche.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex justify-between items-center">
              <div>
                <div className="flex gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-[#2B4C7E] bg-blue-50 rounded-full">{fiche.subject}</span>
                  <span className="px-2.5 py-0.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-full">{fiche.level}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{fiche.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Partagé par {fiche.author}</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-[#2B4C7E] bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                {fiche.likes} ❤️
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function UploadFiche() {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Histoire');
  const [level, setLevel] = useState('Lycée');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Fiche partagée avec succès !');
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#2B4C7E]">Partager une fiche</h1>
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            ← Retour au fil
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la fiche</label>
            <input
              type="text"
              required
              placeholder="Ex: Résumé de thermodynamique"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4C7E] bg-white"
              >
                <option value="Histoire">Histoire</option>
                <option value="Physique">Physique</option>
                <option value="Philosophie">Philosophie</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Français">Français</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4C7E] bg-white"
              >
                <option value="Lycée">Lycée</option>
                <option value="Terminale">Terminale</option>
                <option value="Prépa">Prépa</option>
                <option value="Licence">Licence</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description / Résumé</label>
            <textarea
              rows={4}
              required
              placeholder="Écris un court résumé ou le contenu de ta fiche..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B4C7E]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 text-white bg-[#2B4C7E] rounded-xl font-medium hover:bg-[#20375E] transition"
          >
            Publier la fiche
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
      fetchGroups();
    }
    init();
  }, []);

  async function fetchGroups() {
    const { data, error } = await supabase
      .from('StudyGroups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement groupes :', error);
    } else {
      setGroups(data || []);
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Connecte-toi pour créer un groupe d\'étude.');
      return;
    }
    if (!name.trim() || !subject.trim()) {
      alert('Remplis au moins le nom et la matière.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('StudyGroups').insert([
      {
        name,
        description,
        subject,
        created_by: user.id
      }
    ]);

    if (error) {
      console.error('Erreur création groupe :', error);
      alert('Erreur lors de la création du groupe.');
    } else {
      setName('');
      setDescription('');
      setSubject('');
      fetchGroups();
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Groupes d'étude</h1>
            <p className="text-xs text-gray-500 mt-1">Révise en équipe par matière ou par spécialité</p>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Accueil
          </Link>
        </div>

        {user && (
          <form onSubmit={handleCreateGroup} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800 text-sm">Créer un nouveau groupe</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom du groupe (ex: Spé Maths Term)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Matière (ex: Mathématiques)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Description ou objectifs du groupe..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition shadow-sm"
            >
              {loading ? 'Création en cours...' : 'Créer le groupe'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h3 className="font-bold text-lg text-gray-800">Groupes actifs ({groups.length})</h3>
          {groups.length === 0 ? (
            <p className="text-center text-gray-400 py-12 bg-white border border-gray-200 rounded-2xl text-sm">
              Aucun groupe d'étude pour le moment. Sois le premier à en créer un !
            </p>
          ) : (
            <div className="grid gap-4">
              {groups.map((group) => (
                <div key={group.id} className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-gray-900">{group.name}</h4>
                    <span className="px-3 py-1 bg-blue-50 text-[#2B4C7E] text-xs font-semibold rounded-full">
                      {group.subject}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{group.description || 'Aucune description fournie.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

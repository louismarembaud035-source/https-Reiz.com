'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour la modale de création de demande
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      fetchRequests();
    }
    init();
  }, []);

  async function fetchRequests() {
    const { data, error } = await supabase
      .from('Requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
    }
    setLoading(false);
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Connecte-toi pour publier une demande de fiche.');
      router.push('/auth');
      return;
    }
    if (!title.trim() || !subject.trim() || !description.trim()) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const { error } = await supabase.from('Requests').insert([
      {
        title,
        subject,
        description,
        user_id: user.id,
        user_email: user.email
      }
    ]);

    if (error) {
      console.error('Erreur création demande :', error);
      alert("Erreur lors de la publication de la demande.");
    } else {
      setTitle('');
      setSubject('');
      setDescription('');
      setShowModal(false);
      fetchRequests();
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer cette demande ?')) return;

    const { error } = await supabase
      .from('Requests')
      .delete()
      .eq('id', requestId);

    if (error) {
      alert('Erreur lors de la suppression.');
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement des demandes...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Demandes de fiches</h1>
            <p className="text-xs text-gray-500">Cherchez une ressource introuvable ou aidez vos camarades</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!user) {
                  alert('Connecte-toi pour publier une demande.');
                  router.push('/auth');
                } else {
                  setShowModal(true);
                }
              }}
              className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm"
            >
              + Poster une demande
            </button>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span>Demandes en cours ({requests.length})</span>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
              Aucune demande pour l'instant. Soyez le premier à en poster une !
            </div>
          ) : (
            <div className="grid gap-4">
              {requests.map((req) => {
                const isAuthor = user && user.id === req.user_id;
                return (
                  <div key={req.id} className="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">{req.title}</h4>
                        <span className="px-3 py-1 bg-blue-50 text-[#2B4C7E] text-xs font-semibold rounded-full">
                          {req.subject}
                        </span>
                      </div>
                      {isAuthor && (
                        <button
                          onClick={() => handleDeleteRequest(req.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                    
                    <p className="text-gray-700 text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {req.description}
                    </p>

                    <div className="flex justify-between items-center text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                      <span>Demandé par : {req.user_email || 'Étudiant'}</span>
                      <span>{new Date(req.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modale de création de demande */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#2B4C7E]">Demander une fiche</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre de la demande</label>
                <input
                  type="text"
                  placeholder="ex: Résumé complet Thermodynamique L2"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Matière / Filière</label>
                <input
                  type="text"
                  placeholder="ex: Physique"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description / Précisions</label>
                <textarea
                  placeholder="Précisez les chapitres ou notions particulières recherchées..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#2B4C7E] text-white rounded-xl text-sm font-semibold hover:bg-[#20375E] transition shadow-sm"
                >
                  Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

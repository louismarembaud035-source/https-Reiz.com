'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ToolsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');

  // Formulaire d'ajout
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
      fetchTools();
    }
    init();
  }, []);

  async function fetchTools() {
    const { data, error } = await supabase
      .from('Tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTools(data);
    }
    setLoading(false);
  }

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Connecte-toi pour partager un lien utile.');
      router.push('/auth');
      return;
    }

    if (!title.trim() || !url.trim() || !subject.trim()) {
      alert('Veuillez remplir les champs obligatoires (Titre, URL, Matière).');
      return;
    }

    // S'assurer que l'URL commence par http/https
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const { error } = await supabase.from('Tools').insert([
      {
        user_id: user.id,
        user_email: user.email,
        title: title.trim(),
        url: formattedUrl,
        subject: subject.trim(),
        description: description.trim()
      }
    ]);

    if (error) {
      console.error('Erreur ajout outil :', error);
      alert("Erreur lors de l'enregistrement de la ressource.");
    } else {
      setTitle('');
      setUrl('');
      setSubject('');
      setDescription('');
      setShowModal(false);
      fetchTools();
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!confirm('Supprimer cette ressource de la boîte à outils ?')) return;

    const { error } = await supabase.from('Tools').delete().eq('id', toolId);
    if (!error) {
      setTools((prev) => prev.filter((t) => t.id !== toolId));
    }
  };

  const filteredTools = filterSubject.trim()
    ? tools.filter((t) => t.subject?.toLowerCase().includes(filterSubject.toLowerCase()))
    : tools;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement de la boîte à outils...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Boîte à outils & Liens utiles</h1>
            <p className="text-xs text-gray-500">Découvre et partage les meilleures ressources recommandées par la communauté</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (!user) {
                  alert('Connecte-toi pour partager une ressource.');
                  router.push('/auth');
                  return;
                }
                setShowModal(true);
              }}
              className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm"
            >
              + Partager une ressource
            </button>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>
        </div>

        {/* Barre de filtre */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <input
            type="text"
            placeholder="Filtrer par matière (ex: Mathématiques, Physique, Code...)"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
          />
        </div>

        {/* Liste des outils */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span>Ressources partagées ({filteredTools.length})</span>
          </div>

          {filteredTools.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
              Aucune ressource trouvée. Sois le premier à partager un site ou une chaîne utile !
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredTools.map((tool) => {
                const isAuthor = user && user.id === tool.user_id;
                return (
                  <div key={tool.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="px-3 py-1 bg-blue-50 text-[#2B4C7E] text-xs font-semibold rounded-full">
                          {tool.subject}
                        </span>
                        {isAuthor && (
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-base">{tool.title}</h3>
                      {tool.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{tool.description}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[11px] text-gray-400 truncate max-w-[180px]">Par {tool.user_email || 'Étudiant'}</span>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm"
                      >
                        Visiter le lien →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modale d'ajout de ressource */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-[#2B4C7E]">Partager un lien utile</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Titre de la ressource</label>
                <input
                  type="text"
                  placeholder="ex: Chaîne YouTube - Science Etonnante"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">URL / Lien web</label>
                <input
                  type="text"
                  placeholder="ex: https://youtube.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Matière / Catégorie</label>
                <input
                  type="text"
                  placeholder="ex: Physique, Mathématiques, Informatique"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Courte description (optionnel)</label>
                <textarea
                  placeholder="Pourquoi cette ressource est-elle utile ?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
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

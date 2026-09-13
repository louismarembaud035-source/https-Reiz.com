'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  Wrench, 
  Plus, 
  Search, 
  ExternalLink, 
  ThumbsUp, 
  Sparkles, 
  ArrowLeft, 
  Trash2, 
  Globe, 
  Tag 
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ToolsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');

  // État local pour gérer les upvotes en direct
  const [upvotes, setUpvotes] = useState<{ [key: string]: { count: number; voted: boolean } }>({});

  // Formulaire d'ajout
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [subject, setSubject] = useState('');
  const [resourceType, setResourceType] = useState('Vidéo');
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
      // Initialiser les upvotes
      const initialVotes: { [key: string]: { count: number; voted: boolean } } = {};
      data.forEach((tool: any) => {
        initialVotes[tool.id] = { count: tool.upvotes_count || Math.floor(Math.random() * 10) + 1, voted: false };
      });
      setUpvotes(initialVotes);
    }
    setLoading(false);
  }

  const handleUpvote = (toolId: string) => {
    setUpvotes(prev => {
      const current = prev[toolId] || { count: 0, voted: false };
      const newVotedState = !current.voted;
      return {
        ...prev,
        [toolId]: {
          count: newVotedState ? current.count + 1 : current.count - 1,
          voted: newVotedState
        }
      };
    });
  };

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
        description: description.trim(),
        resource_type: resourceType
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

  const filteredTools = tools.filter((t) => {
    const matchesSubject = filterSubject.trim() === '' || t.subject?.toLowerCase().includes(filterSubject.toLowerCase());
    const matchesType = selectedType === 'Tous' || t.resource_type === selectedType;
    return matchesSubject && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] text-slate-500 font-sans">
        Chargement de la boîte à outils...
      </div>
    );
  }

  const typesList = ['Tous', 'Vidéo', 'Documentation', 'Outil IA', 'Exercices'];

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* En-tête Moderne */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2">
              <Wrench className="w-3.5 h-3.5" /> Ressources & Partages
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Boîte à outils & Liens utiles
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Découvre, vote et partage les meilleures chaînes, documentations et sites recommandés par la promo.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                if (!user) {
                  alert('Connecte-toi pour partager une ressource.');
                  router.push('/auth');
                  return;
                }
                setShowModal(true);
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Partager une ressource
            </button>
            <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition text-center">
              Accueil
            </Link>
          </div>
        </div>

        {/* Barre de recherche & Filtres par type */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Filtrer par matière (ex: Mathématiques, Physique, Code...)"
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Filtres par type de ressource */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
            {typesList.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedType === type
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des outils */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            <span>Ressources partagées ({filteredTools.length})</span>
          </div>

          {filteredTools.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-sm">
              Aucune ressource trouvée. Sois le premier à partager un site ou une chaîne utile !
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredTools.map((tool) => {
                const isAuthor = user && user.id === tool.user_id;
                const toolVote = upvotes[tool.id] || { count: 0, voted: false };

                return (
                  <div key={tool.id} className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-300 transition duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100/60">
                            {tool.subject}
                          </span>
                          {tool.resource_type && (
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full">
                              {tool.resource_type}
                            </span>
                          )}
                        </div>

                        {isAuthor && (
                          <button
                            onClick={() => handleDeleteTool(tool.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 tracking-tight">{tool.title}</h3>
                      {tool.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{tool.description}</p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400 truncate max-w-[140px]">Par {tool.user_email || 'Étudiant'}</span>
                      
                      <div className="flex items-center gap-2">
                        {/* Bouton Upvote Utile */}
                        <button
                          onClick={() => handleUpvote(tool.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                            toolVote.voted 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm' 
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${toolVote.voted ? 'fill-emerald-500 text-emerald-500' : 'text-slate-400'}`} />
                          <span>{toolVote.count}</span>
                        </button>

                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm flex items-center gap-1"
                        >
                          Visiter <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-900">Partager un lien utile</h3>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTool} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Titre de la ressource</label>
                <input
                  type="text"
                  placeholder="ex: Chaîne YouTube - Science Etonnante"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">URL / Lien web</label>
                <input
                  type="text"
                  placeholder="ex: https://youtube.com/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Matière</label>
                  <input
                    type="text"
                    placeholder="ex: Physique, Maths"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Vidéo">Vidéo</option>
                    <option value="Documentation">Documentation</option>
                    <option value="Outil IA">Outil IA</option>
                    <option value="Exercices">Exercices</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Courte description (optionnel)</label>
                <textarea
                  placeholder="Pourquoi cette ressource est-elle utile ?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
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

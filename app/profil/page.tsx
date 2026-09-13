'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Edit3, 
  Trash2, 
  Heart, 
  FileText, 
  LogOut, 
  Camera, 
  Sparkles, 
  Flame, 
  Trophy, 
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [fiches, setFiches] = useState<any[]>([]);
  const [specialty, setSpecialty] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'published' | 'favorites'>('published');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);
      if (session.user.user_metadata?.specialty) {
        setSpecialty(session.user.user_metadata.specialty);
      }
      if (session.user.user_metadata?.avatar_url) {
        setAvatarUrl(session.user.user_metadata.avatar_url);
      }

      fetchUserFiches(session.user.id, session.user.email);
      setLoading(false);
    }
    init();
  }, [router]);

  async function fetchUserFiches(userId: string, email: string) {
    const { data, error } = await supabase
      .from('Fiches')
      .select('*')
      .or(`user_id.eq.${userId},author.eq.${email}`);
    
    if (!error && data) {
      setFiches(data);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { specialty, avatar_url: avatarUrl }
    });
    setSaving(false);
    if (error) {
      alert('Erreur lors de la mise à jour du profil.');
    } else {
      alert('Profil mis à jour avec succès !');
    }
  };

  const handleDeleteFiche = async (ficheId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette fiche ?')) return;
    const { error } = await supabase.from('Fiches').delete().eq('id', ficheId);
    if (!error) {
      setFiches(prev => prev.filter(f => f.id !== ficheId));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] text-slate-500 font-sans">
        Chargement de ton profil...
      </div>
    );
  }

  const totalPoints = fiches.length * 100;

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans p-6 sm:p-12 relative overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Top Navigation Bar */}
        <div className="flex justify-between items-center bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              R
            </div>
            <span className="font-extrabold text-slate-900 tracking-tight">Mon Profil Étudiant</span>
          </div>
          <Link href="/" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Accueil
          </Link>
        </div>

        {/* Social Header Card (Banner + Avatar + Stats) */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Cover Banner */}
          <div className="h-36 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"></div>
          </div>

          {/* Profile Info Section */}
          <div className="px-6 sm:px-10 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-14 mb-6 gap-4">
              
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 rounded-3xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 text-3xl font-black">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.[0].toUpperCase()
                  )}
                </div>
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              {/* Action Logout */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-red-50 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-100 transition flex items-center gap-1.5 border border-red-200/60 shadow-sm"
                >
                  <LogOut className="w-4 h-4" /> Se déconnecter
                </button>
              </div>

            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {user?.email?.split('@')[0]}
                </h1>
                <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </p>
                {specialty && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                    🎓 {specialty}
                  </span>
                )}
              </div>

              {/* Stats Badges (Social Style) */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Fiches Publiées</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{fiches.length}</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Points Reiz</span>
                  <span className="text-xl font-black text-blue-600 mt-1 block">{totalPoints} pts</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Série Active</span>
                  <span className="text-xl font-black text-orange-500 mt-1 block">🔥 Actif</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Edit Profile Settings Form */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">Personnalisation du profil</h3>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Spécialité / Filière</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="ex: L2 Mathématiques ou Master 1 Droit"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">URL de l'avatar (Photo)</label>
                <div className="relative">
                  <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    placeholder="https://exemple.com/mon-image.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition shadow-md flex items-center gap-2"
              >
                {saving ? 'Enregistrement...' : <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Enregistrer les modifications</>}
              </button>
            </div>
          </form>
        </div>

        {/* Content Tabs (Fiches Publiées / Favoris) */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Tabs Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <button
              onClick={() => setActiveTab('published')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition ${
                activeTab === 'published' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mes fiches publiées ({fiches.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition ${
                activeTab === 'favorites' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mes fiches favorites (0)
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'published' ? (
            <div className="space-y-4">
              {fiches.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tu n'as publié aucune fiche pour le moment.
                </div>
              ) : (
                fiches.map((fiche) => (
                  <div key={fiche.id} className="p-5 border border-slate-200/80 rounded-2xl bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-full border border-blue-100">
                          {fiche.subject} • {fiche.level}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{fiche.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{fiche.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/fiches/${fiche.id}`} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm">
                        Voir
                      </Link>
                      <button
                        onClick={() => handleDeleteFiche(fiche.id)}
                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition border border-red-200/60"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Tu n'as encore ajouté aucune fiche en favori. Explore le fil d'actualité pour en ajouter !
            </div>
          )}

        </div>

      </div>
    </main>
  );
}

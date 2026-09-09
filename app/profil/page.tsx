'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [myFiches, setMyFiches] = useState<any[]>([]);
  const [speciality, setSpeciality] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUser(session.user);

      // 1. Récupérer les favoris
      const { data: favs } = await supabase
        .from('Favorites')
        .select('fiche_id')
        .eq('user_id', session.user.id);

      if (favs && favs.length > 0) {
        const ficheIds = favs.map(f => f.fiche_id);
        const { data: fichesData } = await supabase
          .from('Fiches')
          .select('*')
          .in('id', ficheIds);
        setFavorites(fichesData || []);
      }

      // 2. Récupérer les fiches publiées par l'utilisateur
      const { data: userFiches } = await supabase
        .from('Fiches')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      setMyFiches(userFiches || []);

      // 3. Récupérer le profil (spécialité)
      const { data: profileData } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setSpeciality(profileData.speciality || '');
      }

      setLoading(false);
    }
    getUserData();
  }, [router]);

  const handleSaveSpeciality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('Profiles')
      .upsert({ id: user.id, email: user.email, speciality });

    if (error) {
      console.error('Erreur mise à jour spécialité :', error);
      alert('Erreur lors de la mise à jour de la spécialité.');
    } else {
      alert('✨ Spécialité mise à jour avec succès !');
    }
  };

  const handleDeleteFiche = async (ficheId: string) => {
    if (!confirm('Es-tu sûr de vouloir supprimer cette fiche ?')) return;

    const { error } = await supabase
      .from('Fiches')
      .delete()
      .eq('id', ficheId);

    if (error) {
      console.error('Erreur suppression :', error);
      alert('Erreur lors de la suppression.');
    } else {
      setMyFiches(prev => prev.filter(f => f.id !== ficheId));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement du profil...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Infos Profil & Déconnexion */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Mon Profil</h1>
            <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
              Accueil
            </Link>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-semibold text-[#2B4C7E] uppercase tracking-wider mb-1">E-mail connecté</p>
              <p className="text-gray-800 font-medium text-sm">{user?.email}</p>
            </div>

            {/* Formulaire Spécialité / Filière */}
            <form onSubmit={handleSaveSpeciality} className="space-y-3 pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">Ma Spécialité / Filière</h3>
              <p className="text-xs text-gray-500">Affiche ta promotion pour que les autres membres te retrouvent dans l'annuaire.</p>
              <input
                type="text"
                placeholder="ex: L2 Mathématiques ou Master 1 Droit"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#2B4C7E] text-white rounded-xl text-xs font-semibold hover:bg-[#20375E] transition shadow-sm"
              >
                Enregistrer ma spécialité
              </button>
            </form>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Paramètres du compte</h3>
              <p className="text-xs text-gray-500 mb-4">Gère ta session et déconnecte-toi de ton compte Reiz en toute sécurité.</p>
              <button
                onClick={handleLogout}
                className="w-full py-3 font-medium text-white bg-red-600 rounded-xl shadow-sm hover:bg-red-700 transition text-sm"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>

        {/* Mes Fiches Publiées */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h3 className="font-bold text-lg text-[#2B4C7E] mb-4">Mes fiches publiées ({myFiches.length})</h3>
          {myFiches.length === 0 ? (
            <p className="text-sm text-gray-500">Tu n'as publié aucune fiche pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {myFiches.map((fiche) => (
                <div key={fiche.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex flex-col gap-3">
                  <div>
                    <Link href={`/fiches/${fiche.id}`} className="font-semibold text-gray-900 text-sm hover:text-[#2B4C7E] transition block mb-1">
                      {fiche.title}
                    </Link>
                    <p className="text-xs font-medium text-[#2B4C7E]">{fiche.subject} • {fiche.level}</p>
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-gray-200/60">
                    <Link
                      href={`/fiches/${fiche.id}/edit`}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-100 transition shadow-sm"
                    >
                      ✏️ Modifier
                    </Link>
                    <button
                      onClick={() => handleDeleteFiche(fiche.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mes Fiches Favorites */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h3 className="font-bold text-lg text-[#2B4C7E] mb-4">Mes fiches favorites ({favorites.length})</h3>
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-500">Tu n'as encore ajouté aucune fiche en favori.</p>
          ) : (
            <div className="space-y-3">
              {favorites.map((fiche) => (
                <Link key={fiche.id} href={`/fiches/${fiche.id}`} className="block p-4 border border-gray-100 rounded-xl hover:border-[#2B4C7E] transition bg-gray-50">
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{fiche.title}</h4>
                  <p className="text-xs font-medium text-[#2B4C7E]">{fiche.subject} • {fiche.level}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

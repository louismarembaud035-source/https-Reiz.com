'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, 
  Search, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  GraduationCap 
} from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AnnuairePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpeciality, setFilterSpeciality] = useState('');

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
      }

      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .order('email', { ascending: true });

      if (!error && data) {
        setProfiles(data);
      }
      setLoading(false);
    }
    init();
  }, []);

  // Extraire les spécialités uniques pour les tags rapides
  const popularSpecialties = Array.from(
    new Set(profiles.map((p) => p.speciality).filter(Boolean))
  );

  const filteredProfiles = filterSpeciality.trim()
    ? profiles.filter((p) => p.speciality?.toLowerCase().includes(filterSpeciality.toLowerCase()))
    : profiles;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] text-slate-500 font-sans">
        Chargement de l'annuaire...
      </div>
    );
  }

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
              <Users className="w-3.5 h-3.5" /> Réseau étudiant
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Annuaire des étudiants
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Trouve tes camarades de promotion, identifie leurs spécialités et entre en contact direct.
            </p>
          </div>
          <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition text-center shadow-sm flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Accueil
          </Link>
        </div>

        {/* Barre de recherche et Filtres rapides */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Filtrer par spécialité (ex: Mathématiques, Droit, L2...)"
              value={filterSpeciality}
              onChange={(e) => setFilterSpeciality(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          {/* Tags de filtrage rapide */}
          {popularSpecialties.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
              <button
                onClick={() => setFilterSpeciality('')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  filterSpeciality === '' ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tous
              </button>
              {popularSpecialties.map((spec: any, idx) => (
                <button
                  key={idx}
                  onClick={() => setFilterSpeciality(spec)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    filterSpeciality.toLowerCase() === spec.toLowerCase() ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Liste des profils */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            <span>Étudiants inscrits ({filteredProfiles.length})</span>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-sm">
              Aucun étudiant trouvé avec cette spécialité.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredProfiles.map((profile) => {
                const isMe = currentUser && currentUser.id === profile.id;
                const initial = profile.email ? profile.email[0].toUpperCase() : 'E';

                return (
                  <div key={profile.id} className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4 hover:border-blue-300 transition duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                            {initial}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Étudiant Reiz</span>
                            <h3 className="font-extrabold text-sm text-slate-900 truncate max-w-[200px]">{profile.email || 'Membre'}</h3>
                          </div>
                        </div>

                        {isMe && (
                          <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                            C'est toi
                          </span>
                        )}
                      </div>

                      <div className="pt-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Filière / Spécialité</span>
                        <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full border ${
                          profile.speciality 
                            ? 'bg-blue-50 text-blue-700 border-blue-100' 
                            : 'bg-slate-50 text-slate-400 border-slate-200/60 italic'
                        }`}>
                          {profile.speciality || 'Non renseignée'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-blue-500" /> Membre actif
                      </span>

                      {!isMe && (
                        <Link
                          href="/messages"
                          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm flex items-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Message
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AnnuairePage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpeciality, setFilterSpeciality] = useState('');

  useEffect(() => {
    async function fetchProfiles() {
      const { data, error } = await supabase
        .from('Profiles')
        .select('*')
        .order('email', { ascending: true });

      if (!error && data) {
        setProfiles(data);
      }
      setLoading(false);
    }
    fetchProfiles();
  }, []);

  const filteredProfiles = filterSpeciality.trim()
    ? profiles.filter((p) => p.speciality?.toLowerCase().includes(filterSpeciality.toLowerCase()))
    : profiles;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement de l'annuaire...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* En-tête */}
        <div className="flex justify-between items-center bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Annuaire des étudiants</h1>
            <p className="text-xs text-gray-500">Trouve tes camarades de promotion et identifie leurs spécialités</p>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Accueil
          </Link>
        </div>

        {/* Barre de recherche / filtre par filière */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <input
            type="text"
            placeholder="Filtrer par spécialité (ex: Mathématiques, Droit, L2...)"
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#2B4C7E] focus:outline-none"
          />
        </div>

        {/* Liste des profils */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span>Étudiants inscrits ({filteredProfiles.length})</span>
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 text-sm shadow-sm">
              Aucun étudiant trouvé avec cette spécialité.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredProfiles.map((profile) => (
                <div key={profile.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block mb-1">Étudiant Reiz</span>
                    <h3 className="font-bold text-gray-900 text-base truncate">{profile.email || 'Membre'}</h3>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Filière / Spécialité</span>
                    <span className="inline-block px-3 py-1 bg-blue-50 text-[#2B4C7E] text-xs font-semibold rounded-full">
                      {profile.speciality || 'Non renseignée'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

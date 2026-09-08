'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [fiches, setFiches] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchFiches() {
      const { data, error } = await supabase.from('Fiches').select('*');
      if (error) {
        console.error('Erreur lors du chargement des fiches :', error);
      } else {
        setFiches(data || []);
      }
    }
    fetchFiches();

    async function initNotifications() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Charger le nombre de notifications non lues initiales
      const { count, error } = await supabase
        .from('Notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }

      // Écouter les nouvelles notifications en temps réel via Supabase Realtime
      const channel = supabase
        .channel('realtime-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'Notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          () => {
            setUnreadCount((prev) => prev + 1);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    initNotifications();
  }, []);

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold tracking-tight text-[#2B4C7E]">Reiz</h1>
        <div className="space-x-4 flex items-center">
          <Link href="/feed" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Fil
          </Link>
          <Link href="/groups" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Groupes
          </Link>
          <Link href="/upload" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Publier
          </Link>
          <Link href="/messages" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Chat
          </Link>
          <Link href="/profil" className="text-sm font-medium text-gray-600 hover:text-gray-900 relative">
            Profil
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-3 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/auth" className="px-4 py-2 text-sm font-medium text-white bg-[#2B4C7E] rounded-lg hover:bg-[#20375E] transition">
            Connexion
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <span className="inline-block px-3 py-1 mb-6 text-xs font-semibold text-[#2B4C7E] bg-blue-50 rounded-full">
          Entraide & Fiches de révision
        </span>
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
          Partage tes fiches, révise mieux, <span className="text-[#2B4C7E]">ensemble</span>.
        </h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Trouve les meilleures fiches de révision validées par la communauté, pose tes questions en direct et réussis tes examens sans galérer.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/feed" className="px-6 py-3 font-medium text-white bg-[#2B4C7E] rounded-xl shadow-sm hover:bg-[#20375E] transition">
            Explorer les fiches
          </Link>
          <Link href="/upload" className="px-6 py-3 font-medium text-[#2B4C7E] bg-blue-50 rounded-xl hover:bg-blue-100 transition">
            Partager une fiche
          </Link>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h3 className="text-2xl font-bold mb-6 text-gray-900">Dernières fiches partagées</h3>
        {fiches.length === 0 ? (
          <p className="text-gray-500 text-center py-8 bg-white border border-gray-200 rounded-2xl">Aucune fiche pour le moment.</p>
        ) : (
          <div className="grid gap-4">
            {fiches.map((fiche) => (
              <Link href={`/fiches/${fiche.id}`} key={fiche.id} className="block group">
                <div className="p-6 border border-gray-200 rounded-2xl shadow-sm bg-white group-hover:border-[#2B4C7E] transition">
                  <h4 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-[#2B4C7E] transition">{fiche.title}</h4>
                  <p className="text-xs font-medium text-[#2B4C7E] mb-3">{fiche.subject} • {fiche.level}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{fiche.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

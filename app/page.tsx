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

    let channel: any = null;

    async function initNotifications() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { count, error } = await supabase
        .from('Notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }

      channel = supabase
        .channel(`realtime-notifications-${session.user.id}`)
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
    }

    initNotifications();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-gray-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Pro SaaS */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-lg font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              Reiz
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/feed" className="hover:text-gray-900 transition">Fil</Link>
              <Link href="/groups" className="hover:text-gray-900 transition">Groupes</Link>
              <Link href="/exams" className="hover:text-gray-900 transition">Examens</Link>
              <Link href="/planner" className="hover:text-gray-900 transition">Objectifs</Link>
              <Link href="/annuaire" className="hover:text-gray-900 transition">Annuaire</Link>
              <Link href="/tools" className="hover:text-gray-900 transition">Outils</Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/notifications" className="text-sm font-medium text-gray-600 hover:text-gray-900 relative p-2">
              🔔
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 text-[10px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link href="/profil" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:inline">
              Profil
            </Link>
            <Link href="/auth" className="px-4 py-2 text-xs font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition shadow-sm">
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section Épurée */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
          Plateforme collaborative de révision
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
          Révise mieux, <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            réussis ensemble.
          </span>
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto font-normal leading-relaxed">
          Accède aux meilleures fiches de révision partagées par la communauté, planifie tes objectifs et collabore en temps réel.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link href="/feed" className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/25">
            Explorer les fiches →
          </Link>
          <Link href="/requests" className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition shadow-sm">
            Voir les demandes
          </Link>
        </div>
      </section>

      {/* Grille des fiches récentes */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Dernières fiches partagées</h3>
          <Link href="/feed" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            Voir tout le fil →
          </Link>
        </div>

        {fiches.length === 0 ? (
          <div className="text-gray-400 text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm text-sm">
            Aucune fiche pour le moment.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {fiches.slice(0, 4).map((fiche) => (
              <Link href={`/fiches/${fiche.id}`} key={fiche.id} className="group block">
                <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">
                      {fiche.subject}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{fiche.level}</span>
                  </div>
                  <h4 className="font-semibold text-base text-gray-900 group-hover:text-blue-600 transition">
                    {fiche.title}
                  </h4>
                  <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                    {fiche.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

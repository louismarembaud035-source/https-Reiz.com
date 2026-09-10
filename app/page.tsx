'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Users, 
  GraduationCap, 
  Wrench, 
  Plus, 
  User, 
  Bell, 
  FileText, 
  Sparkles,
  ArrowRight,
  Flame
} from 'lucide-react';
import GamificationSection from '@/components/GamificationSection';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [fiches, setFiches] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }

      const { data, error } = await supabase.from('Fiches').select('*').order('created_at', { ascending: false });
      if (!error) {
        setFiches(data || []);
      }

      if (session) {
        const { count } = await supabase
          .from('Notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);

        if (count !== null) setUnreadCount(count);
      }
    }
    init();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Background Ambient Glow (Social/Organic vibe) */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Sidebar App (Desktop) */}
      <aside className="w-full md:w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/60 p-6 flex flex-col justify-between hidden md:flex shrink-0 sticky top-0 h-screen">
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/25">
              R
            </div>
            <span className="font-extrabold tracking-tight text-slate-900 text-lg">Reiz</span>
          </div>

          <nav className="space-y-1.5">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Navigation</span>
            
            <Link href="/feed" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition group">
              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              Fil d'actualité
            </Link>

            <Link href="/planner" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition group">
              <Target className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              Study Planner
            </Link>

            <Link href="/exams" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition group">
              <Clock className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              Examens & Décompte
            </Link>

            <Link href="/groups" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition group">
              <Users className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              Groupes d'étude
            </Link>

            <Link href="/annuaire" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition group">
              <GraduationCap className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              Annuaire filières
            </Link>

            <Link href="/tools" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-slate-600 hover:bg-blue-50/60 hover:text-blue-600 transition group">
              <Wrench className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
              Boîte à outils
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-100 space-y-3">
          <Link href="/upload" className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl text-xs font-bold hover:opacity-95 transition shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" />
            Nouvelle fiche
          </Link>
          {user ? (
            <Link href="/profil" className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition truncate">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                {user.email?.[0].toUpperCase()}
              </div>
              <span className="truncate">{user.email}</span>
            </Link>
          ) : (
            <Link href="/auth" className="block text-center text-xs font-semibold text-blue-600 py-2 hover:underline">
              Se connecter
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Dashboard */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs">R</div>
            <span className="font-extrabold text-slate-900 tracking-tight">Reiz</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/upload" className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Fiche
            </Link>
            <Link href="/profil" className="text-xs font-semibold text-slate-600">Profil</Link>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <div className="p-6 sm:p-10 max-w-6xl mx-auto w-full space-y-8">
          
          {/* Immersive Welcome Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="absolute right-0 top-0 w-72 h-72 bg-gradient-to-br from-blue-500/5 to-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50/80 border border-blue-100 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Espace étudiant actif
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Tableau de bord
              </h1>
              <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                Retrouvez instantanément les derniers partages de notes et accédez à vos outils de révision en direct avec votre promotion.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto shrink-0">
              <Link href="/feed" className="flex-1 sm:flex-none px-5 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold hover:bg-slate-800 transition text-center shadow-md">
                Explorer le fil
              </Link>
              <Link href="/planner" className="flex-1 sm:flex-none px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-50 transition text-center shadow-sm">
                Mon planner
              </Link>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition duration-300 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Fiches en ligne</span>
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-3xl font-black text-slate-900 block">{fiches.length}</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition duration-300 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Notifications</span>
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-3xl font-black text-blue-600 block">{unreadCount}</span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-emerald-300 hover:shadow-md transition duration-300 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Mode actif</span>
                <Flame className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-xs font-bold text-emerald-600 block pt-1.5 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Collaboration live
              </span>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-5 shadow-sm hover:border-slate-300 hover:shadow-md transition duration-300 space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider">Statut session</span>
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-xs font-bold text-slate-700 block pt-1.5 truncate">
                {user ? user.email : 'Invité'}
              </span>
            </div>
          </div>

          {/* Gamification Section (Streaks, Badges & Leaderboard) */}
          <GamificationSection />

          {/* Main Feed Section */}
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Flux récent des fiches</h3>
              <Link href="/feed" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                Tout voir <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
              </Link>
            </div>

            {fiches.length === 0 ? (
              <div className="bg-white/80 border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-sm shadow-sm">
                Aucune fiche disponible pour le moment.
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {fiches.map((fiche) => (
                  <Link href={`/fiches/${fiche.id}`} key={fiche.id} className="group block">
                    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm hover:border-blue-400/80 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-full border border-blue-100/60">
                          {fiche.subject}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400">{fiche.level}</span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 group-hover:text-blue-600 transition">
                        {fiche.title}
                      </h4>
                      <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                        {fiche.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

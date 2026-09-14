'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Bell, Trash2, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NotificationsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from('Notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setNotifications(data || []);
      }
      setLoading(false);

      // Marquer toutes comme lues à l'ouverture
      await supabase
        .from('Notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
    }

    fetchNotifications();
  }, [router]);

  // Nouvelle fonctionnalité : Supprimer une notification spécifique
  const handleDeleteNotif = async (notifId: string) => {
    const { error } = await supabase.from('Notifications').delete().eq('id', notifId);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== notifId));
    }
  };

  // Nouvelle fonctionnalité : Tout effacer
  const handleClearAll = async () => {
    if (!userId || notifications.length === 0) return;
    if (!confirm('Voulez-vous effacer toutes vos notifications ?')) return;

    const { error } = await supabase.from('Notifications').delete().eq('user_id', userId);
    if (!error) {
      setNotifications([]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFC] text-slate-500 font-sans">
        Chargement de tes notifications...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans p-6 sm:p-12 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* En-tête Moderne */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex justify-between items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-2">
              <Bell className="w-3.5 h-3.5" /> Centre d'alertes
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-slate-500 mt-0.5">Retrouvez toutes vos alertes et messages en direct</p>
          </div>
          <Link href="/" className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition shadow-sm flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" /> Accueil
          </Link>
        </div>

        {/* Barre d'action secondaire */}
        {notifications.length > 0 && (
          <div className="flex justify-between items-center px-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Historique ({notifications.length})
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200/60 transition"
            >
              Tout effacer
            </button>
          </div>
        )}

        {/* Liste des notifications */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-12 text-center text-slate-400 text-xs shadow-sm">
              🎉 Aucune notification pour le moment. Tout est calme !
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 border rounded-3xl shadow-sm transition bg-white/90 backdrop-blur-sm flex justify-between items-start gap-4 ${
                  !notif.is_read ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200/80'
                }`}
              >
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">{notif.content}</p>
                  <span className="text-[10px] font-semibold text-slate-400 block">
                    {new Date(notif.created_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                
                <button
                  onClick={() => handleDeleteNotif(notif.id)}
                  className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}

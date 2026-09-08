'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('Notifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error) {
        setNotifications(data || []);
      }
      setLoading(false);

      // Marquer toutes comme lues lors de l'ouverture de la page
      await supabase
        .from('Notifications')
        .update({ is_read: true })
        .eq('user_id', session.user.id)
        .eq('is_read', false);
    }

    fetchNotifications();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500 font-sans">
        Chargement des notifications...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6 sm:p-12">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#2B4C7E]">Notifications</h1>
            <p className="text-xs text-gray-500 mt-1">Retrouvez toutes vos alertes en direct</p>
          </div>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-900">
            Accueil
          </Link>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
              Aucune notification pour le moment.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border rounded-2xl shadow-sm transition bg-white ${
                  !notif.is_read ? 'border-[#2B4C7E] bg-blue-50/30' : 'border-gray-200'
                }`}
              >
                <p className="text-sm text-gray-800">{notif.content}</p>
                <span className="text-[10px] text-gray-400 mt-2 block">
                  {new Date(notif.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

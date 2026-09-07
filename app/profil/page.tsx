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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    }
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] text-gray-500">
        Chargement du profil...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans p-6">
      <div className="max-w-xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
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
    </main>
  );
}

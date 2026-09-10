'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Radio } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function PresenceTicker() {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);

  useEffect(() => {
    async function fetchActiveUsers() {
      const { data, error } = await supabase.from('Fiches').select('author, user_email');
      if (!error && data) {
        const uniqueAuthors = Array.from(
          new Set(data.map((item: any) => item.author || item.user_email || 'Étudiant'))
        );
        setActiveUsers(uniqueAuthors.slice(0, 5) as string[]);
      }
    }
    fetchActiveUsers();
  }, []);

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 mt-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">Promo en direct</h4>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeUsers.length > 0 
              ? `${activeUsers.length} membres actifs repérés sur la session` 
              : 'Aucun autre étudiant en ligne pour l\'instant'}
          </p>
        </div>
      </div>

      <div className="hidden sm:flex items-center -space-x-2 overflow-hidden">
        {activeUsers.map((user, idx) => (
          <div 
            key={idx} 
            title={user}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-sm"
          >
            {user[0].toUpperCase()}
          </div>
        ))}
        {activeUsers.length === 0 && (
          <span className="text-xs font-semibold text-slate-400 italic">Sois le premier !</span>
        )}
      </div>
    </div>
  );
}

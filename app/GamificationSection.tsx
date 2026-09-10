'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Flame, Award, Trophy, Lock, CheckCircle2, Sparkles, X } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GamificationSection() {
  const [streak, setStreak] = useState(1);
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLeaderboardData() {
      const { data: fiches, error } = await supabase.from('Fiches').select('*');
      if (!error && fiches) {
        const counts: { [key: string]: number } = {};
        fiches.forEach((fiche) => {
          const author = fiche.author || fiche.user_email || 'Étudiant anonyme';
          counts[author] = (counts[author] || 0) + 100;
        });

        const sorted = Object.keys(counts)
          .map((name) => ({ name, points: counts[name] }))
          .sort((a, b) => b.points - a.points);

        setLeaderboard(sorted);
      }
    }
    fetchLeaderboardData();
  }, []);

  const handleCheckIn = () => {
    if (!checkedIn) {
      setStreak(prev => prev + 1);
      setCheckedIn(true);
    }
  };

  const badges = [
    { id: 1, title: 'Top Contributeur', icon: '👑', unlocked: true, desc: 'Partage au moins 3 fiches sur la plateforme.' },
    { id: 2, title: 'Streak x5', icon: '⚡', unlocked: true, desc: 'Atteins une série de 5 jours consécutifs de révision.' },
    { id: 3, title: 'Nuit Blanche', icon: '🔒', unlocked: false, desc: 'Consulte une fiche après minuit (Verrouillé).' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8 relative">
      
      {/* 1. Widget Streak (Fond blanc, texte noir) */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
        
        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/60">
              Série en cours
            </span>
            <div className="flex items-center gap-1.5 text-slate-900 font-black text-lg">
              🔥 {streak} jour{streak > 1 ? 's' : ''}
            </div>
          </div>
          <div>
            <h4 className="font-extrabold text-xl tracking-tight text-slate-900">Objectif de révision</h4>
            <p className="text-slate-500 text-xs mt-1">Valide ta présence quotidienne pour faire grandir ta flamme et débloquer des avantages.</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 relative z-10">
          <button 
            onClick={handleCheckIn}
            disabled={checkedIn}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm ${
              checkedIn 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {checkedIn ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Objectif validé aujourd'hui !
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-400" /> Valider ma révision du jour
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Collection de Badges Cliquables */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Trophées & Badges</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {badges.filter(b => b.unlocked).length} / {badges.length} débloqués
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`group relative rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                badge.unlocked 
                  ? 'bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 hover:scale-105 shadow-sm' 
                  : 'bg-slate-100/80 border border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                badge.unlocked ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {badge.unlocked ? badge.icon : <Lock className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">{badge.title}</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-400 text-center">Clique sur un badge pour voir ses conditions.</p>
      </div>

      {/* 3. Classement basé sur les vraies fiches Supabase */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Classement de la promo</h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Données réelles
          </span>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-40 pr-1">
          {leaderboard.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Aucun score pour le moment. Sois le premier à publier une fiche !
            </div>
          ) : (
            leaderboard.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className={`font-black text-xs w-4 text-center ${index === 0 ? 'text-amber-600 text-sm' : 'text-slate-400'}`}>
                    {index + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[110px]">{user.name}</span>
                </div>
                <span className="text-xs font-black text-slate-700">{user.points} pts</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modale d'information des badges */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <span className="text-2xl">{selectedBadge.icon}</span>
              <button onClick={() => setSelectedBadge(null)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h4 className="font-extrabold text-lg text-slate-900">{selectedBadge.title}</h4>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">
                {selectedBadge.unlocked ? '✅ Trophée débloqué' : '🔒 Trophée verrouillé'}
              </p>
              <p className="text-xs text-slate-500 mt-3 leading-relaxed">{selectedBadge.desc}</p>
            </div>
            <button 
              onClick={() => setSelectedBadge(null)} 
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Compris
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

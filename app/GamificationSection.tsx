import React from 'react';

export default function GamificationSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
      
      {/* Widget Streak & Prochaine Récompense */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between border border-indigo-500/20">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="space-y-4 relative z-10">
          <div className="flex justify-between items-center">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Série active
            </span>
            <div className="flex items-center gap-1.5 text-orange-400 font-black text-lg animate-bounce">
              🔥 12 jours
            </div>
          </div>
          <div>
            <h4 className="font-extrabold text-xl tracking-tight">Objectif du jour validé</h4>
            <p className="text-slate-400 text-xs mt-1">Plus que 2 jours avant de débloquer le badge exclusif <span className="text-amber-400 font-bold">"Oracle de l'Hiver"</span>.</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 relative z-10">
          <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
            <span>Progression palier Or</span>
            <span className="text-amber-400">80%</span>
          </div>
          <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full w-[80%] shadow-lg shadow-orange-500/50"></div>
          </div>
        </div>
      </div>

      {/* Showcase des Badges (Collection) */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Trophées & Badges</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">3 / 12 débloqués</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Badge Débloqué 1 (Légendaire / Or) */}
          <div className="group relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm hover:scale-105 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 text-lg">
              👑
            </div>
            <span className="text-[10px] font-bold text-slate-800 truncate w-full">Top 1 Promo</span>
          </div>

          {/* Badge Débloqué 2 */}
          <div className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5 shadow-sm hover:scale-105 transition">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 text-lg">
              ⚡
            </div>
            <span className="text-[10px] font-bold text-slate-800 truncate w-full">Streak x10</span>
          </div>

          {/* Badge Verrouillé (Teasing addictif) */}
          <div className="relative bg-slate-100/80 border border-slate-200 rounded-2xl p-3 text-center flex flex-col items-center justify-center gap-1.5 opacity-60">
            <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 text-base">
              🔒
            </div>
            <span className="text-[10px] font-semibold text-slate-500 truncate w-full">Nuit Blanche</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 text-center">Survole un badge verrouillé pour voir les conditions.</p>
      </div>

      {/* Classement de la Promotion (Comparaison Live) */}
      <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-900 tracking-tight">Classement de la promo</h3>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Live 🔴</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xs text-amber-600 w-4 text-center">1</span>
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">SM</div>
              <span className="text-xs font-bold text-slate-800">Sophie M.</span>
            </div>
            <span className="text-xs font-black text-slate-600">2,450 pts</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/60 border border-blue-200/60">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xs text-blue-600 w-4 text-center">2</span>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">Toi</div>
              <span className="text-xs font-bold text-blue-900">Toi (Actuel)</span>
            </div>
            <span className="text-xs font-black text-blue-700">2,120 pts</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="font-black text-xs text-slate-400 w-4 text-center">3</span>
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs">BL</div>
              <span className="text-xs font-bold text-slate-800">Ben L.</span>
            </div>
            <span className="text-xs font-black text-slate-600">1,980 pts</span>
          </div>
        </div>
      </div>

    </div>
  );
}

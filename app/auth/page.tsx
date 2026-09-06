'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-[#2B4C7E]">
          {isLogin ? 'Connexion à Reiz' : 'Créer un compte'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-[#2B4C7E] hover:underline"
          >
            {isLogin ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
                <div className="mt-1">
                  <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#2B4C7E] focus:border-[#2B4C7E]" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse e-mail</label>
              <div className="mt-1">
                <input type="email" required className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#2B4C7E] focus:border-[#2B4C7E]" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
              <div className="mt-1">
                <input type="password" required className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-[#2B4C7E] focus:border-[#2B4C7E]" />
              </div>
            </div>
            <div>
              <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-xl text-white bg-[#2B4C7E] hover:bg-[#20375E] font-medium transition">
                {isLogin ? 'Se connecter' : "S'inscrire"}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

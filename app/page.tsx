import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold tracking-tight text-[#2B4C7E]">Reiz</h1>
        <div className="space-x-4">
          <Link href="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Connexion
          </Link>
          <Link href="/auth" className="px-4 py-2 text-sm font-medium text-white bg-[#2B4C7E] rounded-lg hover:bg-[#20375E] transition">
            S'inscrire
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
        </div>
      </section>
    </main>
  );
}

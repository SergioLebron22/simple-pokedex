import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Pokeball from '../components/Pokeball';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: '📖',
    title: 'National Pokédex Binder',
    description: 'A slot for every one of the 1,025 Pokémon. Assign your real TCG cards to each entry and track exactly what you own.',
  },
  {
    icon: '🗂️',
    title: 'Custom Binders',
    description: 'Create binders for sets, favorites, or trade decks. Name them, size them, and fill them however you like.',
  },
  {
    icon: '🔍',
    title: 'TCG Card Search',
    description: 'Search thousands of real cards from the TCGdex database and attach high-res artwork directly to your slots.',
  },
  {
    icon: '💰',
    title: 'Price Tracking',
    description: 'See live TCGPlayer market prices — normal, holofoil, reverse holo, and more — without leaving your binder.',
  },
  {
    icon: '📊',
    title: 'Pokédex Info',
    description: 'Every card slot shows base stats, abilities, flavor text, move lists, and full type matchup charts.',
  },
  {
    icon: '🔗',
    title: 'Evolution Lines',
    description: 'See the full evolution chain for any Pokémon at a glance, with the trigger condition for each stage.',
  },
];

const STEPS = [
  { n: '1', title: 'Create an account', body: 'Sign up for free in seconds — no email verification required.' },
  { n: '2', title: 'Fill your binders', body: 'Search real TCG cards and assign them to Pokédex slots or custom binders.' },
  { n: '3', title: 'Track your collection', body: 'Mark cards as owned or missing, check prices, and explore Pokédex data.' },
];

export default function LandingPage() {
  const { user, openAuthModal } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/home', { replace: true });
  }, [user, navigate]);

  return (
    <>
      <NavBar />

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex items-center justify-center
                          min-h-[calc(100vh-3rem)] px-6 py-12">


        {/* Center: hero content */}
        <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-xl">
          <Pokeball size={72} />

          <div className="space-y-3">
            <h1
              className="font-pixel text-white"
              style={{ fontSize: '18px', textShadow: '3px 3px 0 #c1121f, 6px 6px 0 rgba(0,0,0,0.4)', lineHeight: 1.8 }}
            >
              DexBindr
            </h1>
            <p className="text-pokeGray-light text-base font-nunito font-semibold leading-relaxed">
              Your digital home for tracking Pokémon TCG collections.<br />
              Every Pokémon. Every card. One place.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={openAuthModal}
              className="bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                         px-7 py-3 rounded-xl text-sm transition-colors"
            >
              Get Started — It's Free
            </button>
          </div>

          <a href="#features" className="mt-4 text-pokeGray-mid text-xs animate-bounce select-none">
            ↓ Learn more
          </a>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="max-w-5xl mx-auto px-6 py-20">
        <h2
          className="font-pixel text-pokeGold text-center mb-12"
          style={{ fontSize: '11px', letterSpacing: '0.12em' }}
        >
          EVERYTHING YOU NEED
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 p-5 rounded-2xl border border-white/[0.08]
                         bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]
                         transition-all duration-200"
            >
              <span className="text-3xl">{icon}</span>
              <div className="space-y-1.5">
                <h3 className="text-white font-bold text-sm">{title}</h3>
                <p className="text-pokeGray-light text-xs leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2
          className="font-pixel text-pokeGold text-center mb-12"
          style={{ fontSize: '11px', letterSpacing: '0.12em' }}
        >
          HOW IT WORKS
        </h2>

        <div className="flex flex-col sm:flex-row gap-6">
          {STEPS.map(({ n, title, body }) => (
            <div key={n} className="flex-1 flex flex-col items-center text-center gap-3">
              <div
                className="w-10 h-10 rounded-full bg-pokeRed flex items-center justify-center
                           font-pixel text-white shrink-0"
                style={{ fontSize: '10px' }}
              >
                {n}
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-sm">{title}</p>
                <p className="text-pokeGray-light text-xs leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      {!user && (
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div
            className="rounded-2xl border border-pokeRed/30 p-10 space-y-5"
            style={{ background: 'linear-gradient(135deg, rgba(193,18,31,0.12), rgba(30,30,46,0.9))' }}
          >
            <Pokeball size={48} />
            <div className="space-y-2">
              <h2
                className="font-pixel text-white"
                style={{ fontSize: '12px', textShadow: '2px 2px 0 #c1121f' }}
              >
                Ready to start collecting?
              </h2>
              <p className="text-pokeGray-light text-sm font-nunito">
                Sign up for free and build your binder today.
              </p>
            </div>
            <button
              onClick={openAuthModal}
              className="bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                         px-8 py-3 rounded-xl text-sm transition-colors"
            >
              Create Free Account →
            </button>
          </div>
        </section>
      )}

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="text-center py-10 border-t border-white/[0.06]">
        <p className="text-pokeGray-mid text-[11px] font-nunito">
          DexBindr — not affiliated with Nintendo or The Pokémon Company
        </p>
      </footer>
    </>
  );
}

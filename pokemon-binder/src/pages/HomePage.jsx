import { Link } from 'react-router-dom';
import Pokeball from '../components/Pokeball';
import AuthModal from '../components/AuthModal';
import NavBar from '../components/NavBar';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    to:          '/national-dex',
    icon:        '📖',
    title:       'National Pokédex Binder',
    description: 'Track your physical TCG card collection slot-by-slot against all 1,025 Pokémon.',
    cta:         'Open Binder',
  },
  {
    to:          '/binders',
    icon:        '🗂️',
    title:       'Custom Binders',
    description: 'Build personalized binders for sets, themes, or any custom collection with your own grid and colors.',
    cta:         'My Binders',
  },
  {
    to:          '/stats',
    icon:        '📊',
    title:       'Collection Stats',
    description: 'Visualize completion rates, value trends, and missing cards across all your binders.',
    cta:         'Coming Soon',
    disabled:    true,
  },
];

export default function HomePage() {
  const { user, authModalOpen, openAuthModal, closeAuthModal } = useAuth();

  return (
    <>
      <NavBar />
      <div className="min-h-[calc(100vh-3rem)] flex flex-col">
        {/* Hero */}
        <header className="flex flex-col items-center justify-center gap-5 pt-10 sm:pt-16 pb-8 sm:pb-12 px-6 text-center">
          <Pokeball size={56} />
          <div className="space-y-2">
            <h1
              className="font-pixel text-white"
              style={{
                fontSize: '15px',
                textShadow: '3px 3px 0 #c1121f, 6px 6px 0 rgba(0,0,0,0.4)',
                lineHeight: 1.8,
              }}
            >
              PokéBinder
            </h1>
            <p className="text-pokeGray-light text-sm font-nunito font-semibold max-w-md">
              Your digital home for tracking Pokémon TCG card collections.
            </p>
          </div>

          {!user && (
            <button
              onClick={openAuthModal}
              className="mt-2 bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                         px-6 py-2.5 rounded-xl text-sm transition-colors"
            >
              Sign In to Get Started
            </button>
          )}
          {user && (
            <p className="text-pokeGold text-xs font-bold mt-1">
              Welcome back, {user.username}!
            </p>
          )}
        </header>

        {/* Feature cards */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-6 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {FEATURES.map(({ to, icon, title, description, cta, disabled }) => {
              const enabled = !disabled && !!user;

              const card = (
                <div
                  className={`relative flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-200
                    ${enabled
                      ? 'border-white/15 bg-white/[0.05] hover:border-pokeRed/50 hover:bg-white/[0.09] hover:-translate-y-1 cursor-pointer'
                      : 'border-white/[0.07] bg-white/[0.02] cursor-not-allowed'
                    }`}
                >
                  {disabled && (
                    <span className="absolute top-4 right-4 text-[9px] font-pixel text-pokeGray-mid
                                     bg-white/10 px-2 py-1 rounded-lg">
                      SOON
                    </span>
                  )}
                  {!disabled && !user && (
                    <span className="absolute top-4 right-4 text-[9px] font-bold text-pokeGray-mid
                                     bg-white/10 px-2 py-1 rounded-lg">
                      Login required
                    </span>
                  )}
                  <span className={`text-3xl ${!enabled ? 'opacity-40' : ''}`}>{icon}</span>
                  <div className="space-y-1.5">
                    <h2 className={`font-bold text-sm leading-snug ${enabled ? 'text-white' : 'text-white/50'}`}>
                      {title}
                    </h2>
                    <p className="text-pokeGray-light text-xs leading-relaxed opacity-80">{description}</p>
                  </div>
                  <div className="mt-auto">
                    <span
                      className={`inline-block text-xs font-extrabold px-4 py-2 rounded-xl transition-colors
                        ${enabled
                          ? 'bg-pokeRed text-white'
                          : 'bg-white/10 text-pokeGray-mid'
                        }`}
                      onClick={!disabled && !user ? openAuthModal : undefined}
                    >
                      {!disabled && !user ? 'Log In →' : `${cta}${enabled ? ' →' : ''}`}
                    </span>
                  </div>
                </div>
              );

              return enabled
                ? <Link key={to} to={to} className="block">{card}</Link>
                : <div key={to} onClick={!disabled && !user ? openAuthModal : undefined}
                    className={!disabled && !user ? 'cursor-pointer' : ''}>{card}</div>;
            })}
          </div>
        </main>

        <footer className="text-center pb-8">
          <p className="text-pokeGray-mid text-[11px] font-nunito">
            PokéBinder — not affiliated with Nintendo or The Pokémon Company
          </p>
        </footer>
      </div>

      {authModalOpen && <AuthModal onClose={closeAuthModal} />}
    </>
  );
}

import { Link, useLocation } from 'react-router-dom';
import Pokeball from './Pokeball';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'National Dex', to: '/national-dex', authRequired: true },
  { label: 'My Binders',   to: '/binders',      authRequired: true },
];

export default function NavBar() {
  const { pathname }               = useLocation();
  const { user, logout, openAuthModal } = useAuth();

  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between px-5 h-12
                 border-b border-white/[0.08] backdrop-blur-md"
      style={{ background: 'rgba(13,13,26,0.92)' }}
    >
      <Link to="/" className="flex items-center gap-2.5 group">
        <Pokeball size={22} />
        <span
          className="font-pixel text-white group-hover:text-pokeGold transition-colors"
          style={{ fontSize: '8px' }}
        >
          DexBindr
        </span>
      </Link>

      <div className="flex items-center gap-1">
        {NAV_LINKS.map(({ label, to, authRequired }) => {
          const isActive  = pathname === to || pathname.startsWith(to + '/');
          const isEnabled = !authRequired || !!user;

          if (!isEnabled) {
            return (
              <span key={to} className="px-3 py-1.5 rounded-lg text-xs font-bold
                                        text-pokeGray-mid cursor-not-allowed">
                {label}
              </span>
            );
          }
          return (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors
                ${isActive
                  ? 'bg-pokeRed/20 text-pokeRed-light border border-pokeRed/30'
                  : 'text-pokeGray-light hover:text-white hover:bg-white/[0.08]'
                }`}
            >
              {label}
            </Link>
          );
        })}

        <div className="w-px h-5 bg-white/10 mx-1" />

        {user ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-pokeGray-light font-bold hidden sm:block">
              {user.username}
            </span>
            <button
              onClick={logout}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/[0.07]
                         border border-white/[0.13] text-pokeGray-light hover:text-white
                         hover:bg-white/[0.14] transition-colors"
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-pokeRed text-white
                       hover:bg-pokeRed-dark transition-colors"
          >
            Log In
          </button>
        )}
      </div>
    </nav>
  );
}

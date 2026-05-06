import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ onClose }) {
  const { login, register } = useAuth();
  const [tab,      setTab]      = useState('login'); // 'login' | 'register'
  const [form,     setForm]     = useState({ username: '', email: '', password: '' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
      } else {
        if (!form.username.trim()) { setError('Username is required.'); setLoading(false); return; }
        await register(form.username.trim(), form.email, form.password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                    text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm
                    outline-none transition-colors`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5
                 bg-black/80 backdrop-blur-[5px] animate-fadeIn"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#555577] p-6
                   shadow-[0_30px_80px_rgba(0,0,0,0.85)] animate-slideUp"
        style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2d3d)' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div className="flex gap-1 bg-white/[0.06] rounded-xl p-1">
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors capitalize
                  ${tab === t ? 'bg-pokeRed text-white' : 'text-pokeGray-light hover:text-white'}`}
              >
                {t === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>
          <button onClick={onClose}
            className="bg-white/10 text-white w-8 h-8 rounded-lg text-lg hover:bg-white/20">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={e => update('username', e.target.value)}
              className={inputCls}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => update('email', e.target.value)}
            className={inputCls}
            required
          />
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              className={`${inputCls} pr-10`}
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pokeGray-light
                         hover:text-white transition-colors text-sm select-none"
              tabIndex={-1}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-700/30
                          rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                       py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60 mt-1"
          >
            {loading ? '…' : tab === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

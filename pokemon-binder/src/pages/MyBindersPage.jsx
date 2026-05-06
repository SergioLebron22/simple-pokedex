import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import EditBinderModal from '../components/EditBinderModal';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../lib/api';

function BinderCard({ binder, onEdit, onDelete, onClick }) {
  const slotsPerPage = binder.grid_cols * binder.grid_rows;
  const totalSlots   = slotsPerPage * binder.page_count;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-2xl border border-white/10 overflow-hidden
                 hover:border-white/25 hover:-translate-y-1 transition-all duration-200
                 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group"
      style={{ background: binder.bg_color }}
    >
      {/* Cover strip */}
      <div className="h-3" style={{ background: binder.binder_color }} />

      <div className="p-4">
        <h3 className="text-white font-extrabold text-sm mb-1 truncate">{binder.name}</h3>
        <p className="text-pokeGray-light text-[11px] mb-3">
          {binder.grid_cols}×{binder.grid_rows} · {binder.page_count} pages · {totalSlots} slots
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold"
            style={{ color: binder.binder_color === '#1a1a2e' ? '#aaaacc' : binder.binder_color }}>
            {binder.slot_count} filled
          </span>
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/10
                         text-pokeGray-light hover:text-white hover:bg-white/20 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="text-[10px] font-bold px-2.5 py-1 rounded-lg
                         bg-red-900/30 border border-red-700/30 text-red-400
                         hover:bg-red-800/50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyBindersPage() {
  const { authFetch }          = useAuth();
  const navigate               = useNavigate();
  const [binders,  setBinders] = useState([]);
  const [loading,  setLoading] = useState(true);
  const [error,    setError]   = useState(null);
  const [modal,    setModal]   = useState(null); // null | { mode: 'create' | 'edit', binder? }

  const loadBinders = useCallback(() => {
    setLoading(true);
    authFetch(apiUrl('/api/binders/'))
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setBinders)
      .catch(() => setError('Failed to load binders.'))
      .finally(() => setLoading(false));
  }, [authFetch]);

  useEffect(() => { loadBinders(); }, [loadBinders]);

  const handleSave = async (formData) => {
    if (modal.mode === 'create') {
      const res  = await authFetch(apiUrl('/api/binders/'), {
        method: 'POST', body: JSON.stringify(formData),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(Object.values(d)[0]?.[0] || 'Failed'); }
      const created = await res.json();
      setBinders(prev => [created, ...prev]);
    } else {
      const res = await authFetch(apiUrl(`/api/binders/${modal.binder.id}/`), {
        method: 'PATCH', body: JSON.stringify(formData),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(Object.values(d)[0]?.[0] || 'Failed'); }
      const updated = await res.json();
      setBinders(prev => prev.map(b => b.id === updated.id ? updated : b));
    }
    setModal(null);
  };

  const handleDelete = async (binder) => {
    if (!window.confirm(`Delete "${binder.name}"? All cards inside will be lost.`)) return;
    await authFetch(apiUrl(`/api/binders/${binder.id}/`), { method: 'DELETE' });
    setBinders(prev => prev.filter(b => b.id !== binder.id));
  };

  return (
    <>
      <NavBar />
      <div className="max-w-5xl mx-auto px-5 pt-8 pb-16">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="font-pixel text-white mb-1" style={{ fontSize: '12px' }}>My Binders</h1>
            <p className="text-pokeGray-light text-xs">{binders.length} binder{binders.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                       px-4 py-2 rounded-xl text-sm transition-colors"
          >
            + New Binder
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-pokeGray-light text-sm animate-pulse">
            Loading binders…
          </div>
        )}
        {error && (
          <div className="text-center py-20 text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && binders.length === 0 && (
          <div className="text-center py-20">
            <p className="text-pokeGray-light text-sm mb-4">No binders yet.</p>
            <button
              onClick={() => setModal({ mode: 'create' })}
              className="bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                         px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              Create your first binder →
            </button>
          </div>
        )}
        {!loading && !error && binders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {binders.map(b => (
              <BinderCard
                key={b.id}
                binder={b}
                onClick={() => navigate(`/binders/${b.id}`)}
                onEdit={() => setModal({ mode: 'edit', binder: b })}
                onDelete={() => handleDelete(b)}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <EditBinderModal
          binder={modal.mode === 'edit' ? modal.binder : null}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

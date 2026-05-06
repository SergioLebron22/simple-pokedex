import { useState } from 'react';

const GRID_PRESETS = [
  { cols: 3, rows: 3, label: '3×3', desc: '9 slots' },
  { cols: 4, rows: 3, label: '4×3', desc: '12 slots' },
  { cols: 4, rows: 4, label: '4×4', desc: '16 slots' },
  { cols: 5, rows: 3, label: '5×3', desc: '15 slots' },
  { cols: 5, rows: 4, label: '5×4', desc: '20 slots' },
  { cols: 5, rows: 5, label: '5×5', desc: '25 slots' },
];

const PAGE_COUNTS = [10, 20, 30, 40, 50];

const DEFAULT_FORM = {
  name:         '',
  bg_color:     '#1a1a2e',
  binder_color: '#4a4a5a',
  grid_cols:    4,
  grid_rows:    3,
  page_count:   20,
};

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-[11px] font-extrabold text-pokeGray-light mb-1.5">{label}</label>
      <div className="flex items-center gap-3 bg-pokeDark-card border border-[#333355] rounded-xl px-3 py-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
        />
        <span className="text-white text-xs font-mono tracking-wider">{value}</span>
        <div className="flex-1 h-5 rounded-md ml-auto" style={{ background: value }} />
      </div>
    </div>
  );
}

export default function EditBinderModal({ binder, onSave, onClose }) {
  const isCreate = !binder;
  const [form, setForm] = useState(binder ? {
    name:         binder.name,
    bg_color:     binder.bg_color,
    binder_color: binder.binder_color,
    grid_cols:    binder.grid_cols,
    grid_rows:    binder.grid_rows,
    page_count:   binder.page_count,
  } : DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Binder name is required.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSave({ ...form, name: form.name.trim() });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
      setLoading(false);
    }
  };

  const selectedPreset = GRID_PRESETS.find(p => p.cols === form.grid_cols && p.rows === form.grid_rows);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-5
                 bg-black/80 backdrop-blur-[5px] animate-fadeIn"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[#555577] p-6
                   shadow-[0_30px_80px_rgba(0,0,0,0.85)] animate-slideUp overflow-y-auto max-h-[90vh]"
        style={{ background: 'linear-gradient(135deg, #1e1e2e, #2d2d3d)' }}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-pixel text-pokeGold" style={{ fontSize: '9px' }}>
            {isCreate ? 'New Binder' : 'Edit Binder'}
          </h2>
          <button onClick={onClose}
            className="bg-white/10 text-white w-8 h-8 rounded-lg text-lg hover:bg-white/20">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-[11px] font-extrabold text-pokeGray-light mb-1.5">Binder Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g. Base Set Collection"
              className="w-full bg-pokeDark-card border border-[#333355] focus:border-pokeRed-light
                         text-white placeholder-gray-500 px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
              maxLength={100}
            />
          </div>

          {/* Colors */}
          <ColorField label="Page Background Color" value={form.bg_color}
            onChange={v => update('bg_color', v)} />
          <ColorField label="Binder Cover Color" value={form.binder_color}
            onChange={v => update('binder_color', v)} />

          {/* Grid presets */}
          <div>
            <label className="block text-[11px] font-extrabold text-pokeGray-light mb-2">
              Grid Layout (per page)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRID_PRESETS.map(p => (
                <button
                  key={`${p.cols}x${p.rows}`}
                  type="button"
                  onClick={() => { update('grid_cols', p.cols); update('grid_rows', p.rows); }}
                  className={`flex flex-col items-center py-2.5 px-2 rounded-xl border text-center transition-all
                    ${form.grid_cols === p.cols && form.grid_rows === p.rows
                      ? 'border-pokeGold bg-pokeGold/10 text-pokeGold'
                      : 'border-white/10 bg-pokeDark-card text-pokeGray-light hover:border-white/30'
                    }`}
                >
                  <span className="font-bold text-xs">{p.label}</span>
                  <span className="text-[10px] mt-0.5 opacity-70">{p.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Page count */}
          <div>
            <label className="block text-[11px] font-extrabold text-pokeGray-light mb-2">
              Number of Pages
              <span className="ml-2 font-normal text-pokeGray-mid">
                ({form.page_count * form.grid_cols * form.grid_rows} total slots)
              </span>
            </label>
            <div className="flex gap-2 flex-wrap">
              {PAGE_COUNTS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => update('page_count', n)}
                  className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors
                    ${form.page_count === n
                      ? 'border-pokeGold bg-pokeGold/10 text-pokeGold'
                      : 'border-white/10 bg-pokeDark-card text-pokeGray-light hover:border-white/30'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Preview strip */}
          <div
            className="rounded-xl overflow-hidden border border-white/10"
            style={{ background: form.bg_color }}
          >
            <div className="h-2" style={{ background: form.binder_color }} />
            <div className="px-3 py-2 flex items-center justify-between">
              <span className="text-white text-xs font-bold truncate">
                {form.name || 'Binder Name'}
              </span>
              <span className="text-[10px] text-pokeGray-light ml-2 shrink-0">
                {selectedPreset?.label || `${form.grid_cols}×${form.grid_rows}`} · {form.page_count} pages
              </span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-900/20 border border-red-700/30 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-pokeRed hover:bg-pokeRed-dark text-white font-extrabold
                         py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {loading ? '…' : isCreate ? '✦ Create Binder' : '💾 Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="bg-white/10 border border-white/15 hover:bg-white/20
                         text-white font-bold py-2.5 px-4 rounded-xl text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

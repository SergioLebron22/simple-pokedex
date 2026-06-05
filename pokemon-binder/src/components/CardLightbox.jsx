import { useState, useEffect, useRef, useCallback } from 'react';

const HOLO_RARITY_KEYWORDS = [
  'holo', 'ex', 'gx', 'vmax', 'vstar', 'ultra', 'rainbow',
  'gold', 'secret', 'illustration', 'hyper', 'amazing', 'radiant',
  'shining', 'full art', 'special', 'double rare',
];

// Broad rarity-string check
function detectHoloFromRarity(rarity) {
  if (!rarity) return false;
  const r = rarity.toLowerCase();
  return HOLO_RARITY_KEYWORDS.some(k => r.includes(k));
}

// Name-based fallback: EX/GX/V/VMAX/VSTAR all appear in the card's name
const HOLO_NAME_RE = /\b(EX|GX|VMAX|VSTAR|TAG TEAM)\b|\bV\b/;
function detectHoloFromName(name) {
  if (!name) return false;
  return HOLO_NAME_RE.test(name.toUpperCase());
}

export default function CardLightbox({ card, onClose }) {
  const [rarity,   setRarity]   = useState(null);
  const [tilt,     setTilt]     = useState({ x: 0, y: 0 });
  const [mouse,    setMouse]    = useState({ x: 50, y: 50 });
  const [hovering, setHovering] = useState(false);
  const cardRef = useRef(null);

  /* ── fetch rarity from TCGdex (same API the card IDs come from) ── */
  useEffect(() => {
    if (!card?.tcgCardId) return;
    let cancelled = false;
    fetch(`https://api.tcgdex.net/v2/en/cards/${card.tcgCardId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!cancelled && data?.rarity) setRarity(data.rarity);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [card?.tcgCardId]);

  /* ── pointer / touch tracking ─────────────────────────────────── */
  const track = useCallback((clientX, clientY) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    setTilt({ x: dy * -12, y: dx * 12 });
    setMouse({
      x: ((clientX - rect.left) / rect.width)  * 100,
      y: ((clientY - rect.top)  / rect.height) * 100,
    });
  }, []);

  const onMouseMove  = useCallback(e => { setHovering(true); track(e.clientX, e.clientY); }, [track]);
  const onMouseLeave = useCallback(() => {
    setHovering(false);
    setTilt({ x: 0, y: 0 });
    setMouse({ x: 50, y: 50 });
  }, []);
  const onTouchMove = useCallback(e => {
    e.preventDefault();
    const t = e.touches[0];
    setHovering(true);
    track(t.clientX, t.clientY);
  }, [track]);

  // Holo: use rarity if fetched, fall back to name detection
  const holo  = detectHoloFromRarity(rarity) || detectHoloFromName(card?.name);
  const angle = 115 + (mouse.x / 100) * 40;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center
                 bg-black/92 backdrop-blur-md"
      onClick={onClose}
    >
      <p className="absolute top-4 right-5 text-white/30 text-xs select-none pointer-events-none">
        Click anywhere to close
      </p>

      {/* card wrapper — isolation:isolate scopes blend modes to the card */}
      <div
        ref={cardRef}
        className="relative select-none"
        style={{
          isolation: 'isolate',
          transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`,
          transition: hovering
            ? 'transform 0.05s linear'
            : 'transform 0.6s cubic-bezier(.23,1,.32,1)',
          willChange: 'transform',
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onTouchMove={onTouchMove}
        onClick={e => e.stopPropagation()}
      >
        <img
          src={card.tcgImage}
          alt={card.name}
          draggable={false}
          className="rounded-2xl block"
          style={{
            width: 'min(360px, 82vw)',
            boxShadow: holo
              ? '0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(150,80,255,0.3)'
              : '0 30px 80px rgba(0,0,0,0.9)',
          }}
        />

        {holo && (
          <>
            {/* Rainbow shimmer — solid gradient colors, opacity controls intensity */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(
                  ${angle}deg,
                  rgb(255,  0, 100),
                  rgb(255,160,  0),
                  rgb(220,255,  0),
                  rgb(  0,255,120),
                  rgb(  0,200,255),
                  rgb(100,  0,255),
                  rgb(255,  0,200),
                  rgb(255,  0,100)
                )`,
                backgroundSize: '200% 200%',
                backgroundPosition: `${mouse.x}% ${mouse.y}%`,
                mixBlendMode: 'color-dodge',
                opacity: hovering ? 0.4 : 0.15,
                transition: 'opacity 0.3s',
              }}
            />

            {/* Specular glare — follows cursor */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `radial-gradient(
                  ellipse 55% 40% at ${mouse.x}% ${mouse.y}%,
                  rgba(255,255,255,0.55) 0%,
                  rgba(255,255,255,0.10) 45%,
                  transparent 68%
                )`,
                mixBlendMode: 'screen',
                opacity: hovering ? 1 : 0.4,
                transition: 'opacity 0.3s',
              }}
            />

            {/* Static edge gloss */}
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `linear-gradient(
                  135deg,
                  rgba(255,255,255,0.14) 0%,
                  transparent 40%,
                  transparent 60%,
                  rgba(255,255,255,0.07) 100%
                )`,
                mixBlendMode: 'screen',
              }}
            />
          </>
        )}
      </div>

      {/* Rarity badge — shows detected or fetched rarity */}
      <div
        className="mt-5 text-xs font-bold px-4 py-1.5 rounded-full border backdrop-blur-sm"
        style={{
          background: 'rgba(0,0,0,0.55)',
          borderColor: holo ? 'rgba(180,120,255,0.45)' : 'rgba(255,255,255,0.12)',
          color: holo ? '#c8a0ff' : '#888',
          opacity: rarity || holo ? 1 : 0,
        }}
      >
        {rarity || (holo ? 'Holo Rare' : '')}
      </div>
    </div>
  );
}

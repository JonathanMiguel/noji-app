import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDecks } from '../hooks/useDB.js';

export default function Explore() {
  const decks = useDecks();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!decks) return [];
    const q = query.trim().toLowerCase();
    if (!q) return decks;
    return decks.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description || '').toLowerCase().includes(q)
    );
  }, [decks, query]);

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Explorar</h1>
      </header>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar mazos..."
        className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:border-accent"
      />

      {filtered.length === 0 ? (
        <div className="text-center text-white/50 mt-12">
          {query ? 'Sin resultados' : 'No hay mazos todavía'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((d) => (
            <Link
              key={d.id}
              to={`/deck/${d.id}`}
              className="bg-bg-card rounded-2xl p-4 border border-white/5 active:scale-95 transition-transform"
              style={{ borderLeftColor: d.color, borderLeftWidth: 4 }}
            >
              <div className="text-2xl mb-2">{d.icon || '📚'}</div>
              <div className="font-semibold truncate">{d.name}</div>
              {d.description && (
                <div className="text-white/50 text-xs mt-1 line-clamp-2">
                  {d.description}
                </div>
              )}
              <div className="text-white/40 text-xs mt-2">
                {d.cardCount || 0} tarjetas
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

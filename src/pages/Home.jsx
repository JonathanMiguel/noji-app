import React from 'react';
import { Link } from 'react-router-dom';
import { useDecks } from '../hooks/useDB.js';
import { db } from '../services/db.js';
import { useLiveQuery } from 'dexie-react-hooks';

export default function Home() {
  const decks = useDecks();

  const stats = useLiveQuery(async () => {
    const now = Date.now();
    const cards = await db.cards.toArray();
    const due = cards.filter((c) => (c.sr_nextReview || 0) <= now).length;
    return { total: cards.length, due };
  }, [], { total: 0, due: 0 });

  const recent = (decks || []).slice(0, 6);

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Noji</h1>
        <p className="text-white/50 text-sm mt-1">Tarjetas de estudio personales</p>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-bg-card rounded-2xl p-4 border border-white/5">
          <div className="text-white/50 text-xs uppercase tracking-wide">Por repasar</div>
          <div className="text-3xl font-bold mt-1">{stats.due}</div>
        </div>
        <div className="bg-bg-card rounded-2xl p-4 border border-white/5">
          <div className="text-white/50 text-xs uppercase tracking-wide">Total tarjetas</div>
          <div className="text-3xl font-bold mt-1">{stats.total}</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Mazos recientes</h2>
        <Link to="/deck/new" className="text-accent text-sm font-medium">
          + Nuevo
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="bg-bg-card rounded-2xl p-8 text-center border border-white/5">
          <p className="text-white/60 mb-4">Aún no tienes mazos</p>
          <Link
            to="/deck/new"
            className="inline-block bg-accent hover:bg-accent-hover px-5 py-2.5 rounded-xl font-medium"
          >
            Crear mazo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recent.map((d) => (
            <Link
              key={d.id}
              to={`/deck/${d.id}`}
              className="bg-bg-card rounded-2xl p-4 border border-white/5 active:scale-95 transition-transform"
              style={{ borderLeftColor: d.color, borderLeftWidth: 4 }}
            >
              <div className="text-2xl mb-2">{d.icon || '📚'}</div>
              <div className="font-semibold truncate">{d.name}</div>
              <div className="text-white/50 text-xs mt-1">{d.cardCount || 0} tarjetas</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

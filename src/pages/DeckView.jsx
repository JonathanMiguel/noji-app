import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeck, useCards } from '../hooks/useDB.js';

export default function DeckView() {
  const { deckId } = useParams();
  const nav = useNavigate();
  const deck = useDeck(deckId);
  const cards = useCards(deckId);

  if (!deck) return <div className="p-6 text-center text-white/50">Cargando...</div>;

  const now = Date.now();
  const dueCount = cards.filter((c) => (c.sr_nextReview || 0) <= now).length;

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-4">
        <button onClick={() => nav(-1)} className="text-white/60 text-xl">←</button>
        <Link to={`/deck/${deckId}/edit`} className="text-white/60 text-sm">
          Editar
        </Link>
      </header>

      <div
        className="bg-bg-card rounded-2xl p-5 mb-4 border border-white/5"
        style={{ borderLeftColor: deck.color, borderLeftWidth: 4 }}
      >
        <div className="text-4xl mb-2">{deck.icon}</div>
        <h1 className="text-2xl font-bold">{deck.name}</h1>
        {deck.description && (
          <p className="text-white/60 text-sm mt-1">{deck.description}</p>
        )}
        <div className="text-white/40 text-xs mt-2">
          {cards.length} tarjetas · {dueCount} por repasar
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          to={`/deck/${deckId}/study`}
          className={`rounded-2xl p-4 font-semibold text-center ${
            dueCount > 0
              ? 'bg-accent text-white'
              : 'bg-bg-card text-white/40 border border-white/5'
          }`}
        >
          Estudiar
          <div className="text-xs opacity-70 font-normal mt-0.5">
            {dueCount > 0 ? `${dueCount} pendientes` : 'Todo al día'}
          </div>
        </Link>
        <Link
          to={`/deck/${deckId}/card/new`}
          className="bg-bg-card rounded-2xl p-4 font-semibold text-center border border-white/5"
        >
          + Nueva tarjeta
        </Link>
      </div>

      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-2">
        Tarjetas
      </h2>
      {cards.length === 0 ? (
        <div className="text-center text-white/40 py-8">Aún no hay tarjetas</div>
      ) : (
        <div className="space-y-2">
          {cards.map((c) => (
            <Link
              key={c.id}
              to={`/deck/${deckId}/card/${c.id}`}
              className="block bg-bg-card rounded-xl p-3 border border-white/5 active:scale-98"
            >
              <div className="font-medium truncate">{c.front || '(sin título)'}</div>
              <div className="text-white/50 text-sm truncate mt-0.5">{c.back}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

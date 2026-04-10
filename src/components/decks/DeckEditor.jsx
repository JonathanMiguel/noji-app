import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, createDeck, updateDeck, deleteDeck } from '../../services/db.js';

const COLORS = ['#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#14b8a6', '#f97316'];
const ICONS = ['📚', '🧠', '💡', '🔬', '🎨', '🌍', '💻', '📝', '🗣️', '🎵', '⚗️', '🧮'];

export default function DeckEditor() {
  const nav = useNavigate();
  const { deckId } = useParams();
  const editing = !!deckId;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState(ICONS[0]);

  useEffect(() => {
    if (!editing) return;
    db.decks.get(Number(deckId)).then((d) => {
      if (d) {
        setName(d.name);
        setDescription(d.description || '');
        setColor(d.color || COLORS[0]);
        setIcon(d.icon || ICONS[0]);
      }
    });
  }, [deckId, editing]);

  async function save() {
    if (!name.trim()) return;
    if (editing) {
      await updateDeck(Number(deckId), { name, description, color, icon });
      nav(`/deck/${deckId}`);
    } else {
      const id = await createDeck({ name, description, color, icon });
      nav(`/deck/${id}`);
    }
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm('¿Eliminar este mazo y todas sus tarjetas?')) return;
    await deleteDeck(Number(deckId));
    nav('/');
  }

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => nav(-1)} className="text-white/60 text-xl">←</button>
        <h1 className="text-xl font-bold">{editing ? 'Editar mazo' : 'Nuevo mazo'}</h1>
        <button onClick={save} className="text-accent font-semibold">
          Guardar
        </button>
      </header>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-white/50 uppercase mb-1.5 tracking-wide">
            Nombre
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi mazo de estudio"
            className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 uppercase mb-1.5 tracking-wide">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Opcional"
            className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 uppercase mb-2 tracking-wide">
            Icono
          </label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                onClick={() => setIcon(i)}
                className={`w-11 h-11 text-2xl rounded-xl border ${
                  icon === i ? 'border-accent bg-accent/20' : 'border-white/10 bg-bg-card'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/50 uppercase mb-2 tracking-wide">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-11 h-11 rounded-xl border-2 ${
                  color === c ? 'border-white' : 'border-transparent'
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {editing && (
          <button
            onClick={handleDelete}
            className="w-full mt-8 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium"
          >
            Eliminar mazo
          </button>
        )}
      </div>
    </div>
  );
}

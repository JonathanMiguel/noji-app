import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateDeck, PROVIDERS } from '../services/llm/index.js';
import { db, createDeck, createCard, getSetting } from '../services/db.js';
import { decryptString } from '../services/crypto.js';

export default function Generate() {
  const nav = useNavigate();
  const [topic, setTopic] = useState('');
  const [numCards, setNumCards] = useState(10);
  const [provider, setProvider] = useState('anthropic');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [availableProviders, setAvailableProviders] = useState([]);

  useEffect(() => {
    (async () => {
      const saved = await getSetting('llm_providers', {});
      const defProv = await getSetting('llm_default_provider', null);
      const list = [];
      for (const p of PROVIDERS) {
        const cfg = saved[p.id];
        if (!cfg) continue;
        if (p.needsKey && !cfg.apiKey) continue;
        list.push(p);
      }
      setAvailableProviders(list);
      if (defProv && list.find((p) => p.id === defProv)) setProvider(defProv);
      else if (list.length > 0) setProvider(list[0].id);
    })();
  }, []);

  async function handleGenerate() {
    setError(null);
    setPreview(null);
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const providersCfg = await getSetting('llm_providers', {});
      const cfg = providersCfg[provider] || {};
      const apiKey = cfg.apiKey ? await decryptString(cfg.apiKey) : null;
      const cards = await generateDeck({
        topic: topic.trim(),
        numCards,
        provider,
        apiKey,
        model: cfg.model,
        endpoint: cfg.endpoint,
        promptTemplate: await getSetting('llm_prompt_template', null),
      });
      setPreview({ topic: topic.trim(), cards });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function confirmSave() {
    if (!preview) return;
    const deckId = await createDeck({
      name: preview.topic,
      description: `Generado con ${provider}`,
      color: '#8b5cf6',
      icon: '✨',
    });
    for (const c of preview.cards) {
      const images = [];
      if (c.svg && typeof c.svg === 'string') {
        images.push(svgToBlob(c.svg));
      }
      await createCard({
        deckId,
        front: c.front || '',
        back: c.back || '',
        images,
      });
    }
    nav(`/deck/${deckId}`);
  }

  function svgToBlob(svg) {
    return new Blob([svg], { type: 'image/svg+xml' });
  }

  if (availableProviders.length === 0) {
    return (
      <div className="px-4 pt-6 max-w-xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">Generar con IA</h1>
        </header>
        <div className="bg-bg-card rounded-2xl p-6 border border-white/5 text-center">
          <p className="text-white/70 mb-4">
            Configura un proveedor de IA para empezar a generar mazos.
          </p>
          <button
            onClick={() => nav('/settings')}
            className="bg-accent px-5 py-2.5 rounded-xl font-medium"
          >
            Ir a Ajustes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Generar con IA</h1>
        <p className="text-white/50 text-sm mt-1">Describe un tema y crea un mazo completo</p>
      </header>

      {!preview && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 uppercase mb-1.5 tracking-wide">
              Tema
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              placeholder="Ej: Verbos irregulares en inglés, conceptos de Python, fotosíntesis..."
              className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 uppercase mb-1.5 tracking-wide">
              Número de tarjetas: {numCards}
            </label>
            <input
              type="range"
              min="3"
              max="30"
              value={numCards}
              onChange={(e) => setNumCards(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 uppercase mb-1.5 tracking-wide">
              Proveedor
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
            >
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-accent disabled:bg-white/10 disabled:text-white/40 py-3.5 rounded-xl font-semibold"
          >
            {loading ? 'Generando...' : '✨ Generar mazo'}
          </button>
        </div>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{preview.cards.length} tarjetas generadas</h2>
            <button onClick={() => setPreview(null)} className="text-white/60 text-sm">
              Descartar
            </button>
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {preview.cards.map((c, i) => (
              <div key={i} className="bg-bg-card rounded-xl p-3 border border-white/5">
                <div className="font-medium text-sm">{c.front}</div>
                <div className="text-white/60 text-xs mt-1">{c.back}</div>
                {c.svg && (
                  <div
                    className="mt-2 bg-[#1a1a2e] rounded p-1"
                    dangerouslySetInnerHTML={{ __html: c.svg }}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={confirmSave}
            className="w-full bg-accent py-3.5 rounded-xl font-semibold"
          >
            Guardar mazo
          </button>
        </div>
      )}
    </div>
  );
}

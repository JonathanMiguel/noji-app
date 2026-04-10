import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, createCard, updateCard, deleteCard } from '../../services/db.js';
import { resizeImage, blobToObjectUrl } from '../../utils/media.js';
import { AudioRecorder } from '../../utils/audioRecorder.js';

export default function CardEditor() {
  const nav = useNavigate();
  const { deckId, cardId } = useParams();
  const editing = !!cardId;

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [images, setImages] = useState([]); // array of Blob
  const [audio, setAudio] = useState(null); // Blob
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!editing) return;
    db.cards.get(Number(cardId)).then((c) => {
      if (!c) return;
      setFront(c.front || '');
      setBack(c.back || '');
      setImages(c.images || []);
      setAudio(c.audio || null);
    });
  }, [cardId, editing]);

  const imageUrls = images.map((b) => (b instanceof Blob ? blobToObjectUrl(b) : b));
  const audioUrl = audio instanceof Blob ? blobToObjectUrl(audio) : audio;

  async function handleImagePick(e) {
    const files = Array.from(e.target.files || []);
    const resized = await Promise.all(files.map((f) => resizeImage(f)));
    setImages((prev) => [...prev, ...resized]);
    e.target.value = '';
  }

  function removeImage(idx) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  async function toggleRecord() {
    if (recording) {
      const blob = await recorderRef.current.stop();
      setAudio(blob);
      setRecording(false);
    } else {
      try {
        recorderRef.current = new AudioRecorder();
        await recorderRef.current.start();
        setRecording(true);
      } catch (err) {
        alert('No se pudo acceder al micrófono: ' + err.message);
      }
    }
  }

  async function save() {
    if (!front.trim() && !back.trim()) return;
    const payload = { front, back, images, audio, deckId: Number(deckId) };
    if (editing) {
      await updateCard(Number(cardId), payload);
    } else {
      await createCard(payload);
    }
    nav(`/deck/${deckId}`);
  }

  async function handleDelete() {
    if (!editing) return;
    if (!confirm('¿Eliminar tarjeta?')) return;
    await deleteCard(Number(cardId));
    nav(`/deck/${deckId}`);
  }

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <button onClick={() => nav(-1)} className="text-white/60 text-xl">←</button>
        <h1 className="text-xl font-bold">{editing ? 'Editar tarjeta' : 'Nueva tarjeta'}</h1>
        <button onClick={save} className="text-accent font-semibold">Guardar</button>
      </header>

      <div className="space-y-4">
        <div>
          <label className="block text-xs text-white/50 uppercase mb-1.5 tracking-wide">
            Frente
          </label>
          <textarea
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={3}
            placeholder="Pregunta o concepto"
            className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 uppercase mb-1.5 tracking-wide">
            Reverso
          </label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={5}
            placeholder="Respuesta o explicación"
            className="w-full bg-bg-card border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-accent resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 uppercase mb-2 tracking-wide">
            Imágenes
          </label>
          <div className="grid grid-cols-3 gap-2">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-square bg-bg-card rounded-xl overflow-hidden">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/70 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square bg-bg-card border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center text-2xl text-white/40"
            >
              +
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagePick}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-xs text-white/50 uppercase mb-2 tracking-wide">
            Audio
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleRecord}
              className={`flex-1 py-3 rounded-xl font-medium ${
                recording ? 'bg-red-500' : 'bg-bg-card border border-white/10'
              }`}
            >
              {recording ? '⏹ Detener' : '🎙 Grabar'}
            </button>
            {audio && (
              <button
                onClick={() => setAudio(null)}
                className="px-4 py-3 rounded-xl bg-bg-card border border-white/10"
              >
                ✕
              </button>
            )}
          </div>
          {audioUrl && !recording && (
            <audio controls src={audioUrl} className="w-full mt-2" />
          )}
        </div>

        {editing && (
          <button
            onClick={handleDelete}
            className="w-full mt-6 py-3 rounded-xl border border-red-500/30 text-red-400 font-medium"
          >
            Eliminar tarjeta
          </button>
        )}
      </div>
    </div>
  );
}

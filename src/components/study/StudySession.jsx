import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, updateCard, getDueCards } from '../../services/db.js';
import { sm2 } from '../../services/spacedRepetition.js';
import { blobToObjectUrl } from '../../utils/media.js';

export default function StudySession() {
  const { deckId } = useParams();
  const nav = useNavigate();
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionStart] = useState(Date.now());
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const due = await getDueCards(Number(deckId), 100);
      if (due.length === 0) {
        // Allow studying all cards if none due
        const all = await db.cards.where('deckId').equals(Number(deckId)).toArray();
        setQueue(all);
      } else {
        setQueue(due);
      }
    })();
  }, [deckId]);

  const card = queue[index];

  async function grade(quality) {
    if (!card) return;
    const updates = sm2(card, quality);
    await updateCard(card.id, updates);
    if (quality >= 4) setCorrect((c) => c + 1);

    if (index + 1 >= queue.length) {
      // session complete
      await db.studySessions.add({
        deckId: Number(deckId),
        startedAt: sessionStart,
        completedAt: Date.now(),
        cardsStudied: queue.length,
        cardsCorrect: correct + (quality >= 4 ? 1 : 0),
      });
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  if (queue.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-white/60 mb-4">No hay tarjetas para estudiar</p>
        <button
          onClick={() => nav(`/deck/${deckId}`)}
          className="bg-accent px-5 py-2.5 rounded-xl font-medium"
        >
          Volver
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">¡Sesión completa!</h2>
        <p className="text-white/60 mb-1">{queue.length} tarjetas estudiadas</p>
        <p className="text-white/60 mb-6">{correct} correctas</p>
        <button
          onClick={() => nav(`/deck/${deckId}`)}
          className="bg-accent px-6 py-3 rounded-xl font-semibold"
        >
          Terminar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col safe-top safe-bottom">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => nav(`/deck/${deckId}`)} className="text-white/60 text-xl">
          ✕
        </button>
        <div className="text-white/60 text-sm">
          {index + 1} / {queue.length}
        </div>
        <div className="w-6" />
      </header>

      <div className="w-full bg-white/10 h-1">
        <div
          className="bg-accent h-full transition-all"
          style={{ width: `${((index) / queue.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 perspective">
        <div
          onClick={() => setFlipped((f) => !f)}
          className="relative w-full max-w-md h-[60vh] cursor-pointer preserve-3d transition-transform duration-500"
          style={{
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <CardFace card={card} side="front" />
          <CardFace card={card} side="back" />
        </div>
      </div>

      {!flipped ? (
        <div className="p-4">
          <button
            onClick={() => setFlipped(true)}
            className="w-full bg-accent py-4 rounded-xl font-semibold"
          >
            Mostrar respuesta
          </button>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-4 gap-2">
          <GradeBtn label="De nuevo" color="bg-red-500" onClick={() => grade(0)} />
          <GradeBtn label="Difícil" color="bg-orange-500" onClick={() => grade(3)} />
          <GradeBtn label="Bien" color="bg-green-500" onClick={() => grade(4)} />
          <GradeBtn label="Fácil" color="bg-blue-500" onClick={() => grade(5)} />
        </div>
      )}
    </div>
  );
}

function GradeBtn({ label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} py-3 rounded-xl font-semibold text-sm`}
    >
      {label}
    </button>
  );
}

function CardFace({ card, side }) {
  const isBack = side === 'back';
  const text = isBack ? card.back : card.front;
  const images = card.images || [];

  return (
    <div
      className="absolute inset-0 bg-bg-card rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center backface-hidden overflow-auto"
      style={{
        transform: isBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}
    >
      <div className="text-xs text-white/40 uppercase tracking-wider mb-4">
        {isBack ? 'Reverso' : 'Frente'}
      </div>
      <div className="text-center text-xl whitespace-pre-wrap break-words max-w-full">
        {text}
      </div>
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-4 w-full">
          {images.map((img, i) => (
            <ImageBlob key={i} blob={img} />
          ))}
        </div>
      )}
      {isBack && card.audio && <AudioBlob blob={card.audio} />}
    </div>
  );
}

function ImageBlob({ blob }) {
  if (blob instanceof Blob && blob.type === 'image/svg+xml') {
    return <SvgBlob blob={blob} />;
  }
  const url = blob instanceof Blob ? blobToObjectUrl(blob) : blob;
  if (!url) return null;
  return <img src={url} alt="" className="w-full rounded-lg object-contain max-h-48" />;
}

function SvgBlob({ blob }) {
  const [svg, setSvg] = React.useState('');
  React.useEffect(() => {
    blob.text().then(setSvg);
  }, [blob]);
  if (!svg) return null;
  return (
    <div
      className="w-full rounded-lg bg-[#1a1a2e] p-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function AudioBlob({ blob }) {
  const url = useMemo(() => (blob instanceof Blob ? blobToObjectUrl(blob) : blob), [blob]);
  if (!url) return null;
  return <audio controls src={url} className="w-full mt-4" />;
}

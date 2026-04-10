import Dexie from 'dexie';

export const db = new Dexie('NojiBrain');

db.version(1).stores({
  folders: '++id, name, parentId, color, icon, order, createdAt',
  decks: '++id, name, description, folderId, color, icon, cardCount, order, createdAt, updatedAt',
  cards: '++id, deckId, front, back, color, sr_nextReview, createdAt, updatedAt',
  studySessions: '++id, deckId, startedAt, completedAt, cardsStudied, cardsCorrect',
  settings: 'key',
});

// Helpers
export async function getSetting(key, fallback = null) {
  const row = await db.settings.get(key);
  return row ? row.value : fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value });
}

export async function createDeck(deck) {
  const now = Date.now();
  return db.decks.add({
    name: deck.name || 'Nuevo mazo',
    description: deck.description || '',
    folderId: deck.folderId ?? null,
    color: deck.color || '#8b5cf6',
    icon: deck.icon || '📚',
    cardCount: 0,
    order: deck.order ?? 0,
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateDeck(id, patch) {
  await db.decks.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteDeck(id) {
  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.cards.where('deckId').equals(id).delete();
    await db.decks.delete(id);
  });
}

export async function createCard(card) {
  const now = Date.now();
  const id = await db.cards.add({
    deckId: card.deckId,
    front: card.front || '',
    back: card.back || '',
    images: card.images || [],
    audio: card.audio || null,
    color: card.color || null,
    tags: card.tags || [],
    sr_interval: 0,
    sr_easeFactor: 2.5,
    sr_nextReview: now,
    sr_repetitions: 0,
    createdAt: now,
    updatedAt: now,
  });
  await updateDeckCount(card.deckId);
  return id;
}

export async function updateCard(id, patch) {
  await db.cards.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteCard(id) {
  const card = await db.cards.get(id);
  await db.cards.delete(id);
  if (card) await updateDeckCount(card.deckId);
}

export async function updateDeckCount(deckId) {
  const count = await db.cards.where('deckId').equals(deckId).count();
  await db.decks.update(deckId, { cardCount: count, updatedAt: Date.now() });
}

export async function getDueCards(deckId, limit = 50) {
  const now = Date.now();
  const all = await db.cards.where('deckId').equals(deckId).toArray();
  return all
    .filter((c) => (c.sr_nextReview || 0) <= now)
    .sort((a, b) => (a.sr_nextReview || 0) - (b.sr_nextReview || 0))
    .slice(0, limit);
}

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../services/db.js';

export function useDecks(folderId = null) {
  return useLiveQuery(async () => {
    const all = await db.decks.toArray();
    return all
      .filter((d) => (folderId === null ? true : d.folderId === folderId))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [folderId], []);
}

export function useDeck(deckId) {
  return useLiveQuery(
    () => (deckId ? db.decks.get(Number(deckId)) : undefined),
    [deckId]
  );
}

export function useCards(deckId) {
  return useLiveQuery(
    async () => {
      if (!deckId) return [];
      return db.cards.where('deckId').equals(Number(deckId)).toArray();
    },
    [deckId],
    []
  );
}

export function useFolders() {
  return useLiveQuery(() => db.folders.toArray(), [], []);
}

export function useSetting(key, fallback = null) {
  return useLiveQuery(async () => {
    const row = await db.settings.get(key);
    return row ? row.value : fallback;
  }, [key], fallback);
}

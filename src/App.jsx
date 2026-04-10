import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Generate from './pages/Generate.jsx';
import Settings from './pages/Settings.jsx';
import DeckView from './pages/DeckView.jsx';
import StudySession from './components/study/StudySession.jsx';
import CardEditor from './components/cards/CardEditor.jsx';
import DeckEditor from './components/decks/DeckEditor.jsx';

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-bg text-white">
      <main className="flex-1 pb-20 safe-top">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/deck/new" element={<DeckEditor />} />
          <Route path="/deck/:deckId" element={<DeckView />} />
          <Route path="/deck/:deckId/edit" element={<DeckEditor />} />
          <Route path="/deck/:deckId/study" element={<StudySession />} />
          <Route path="/deck/:deckId/card/new" element={<CardEditor />} />
          <Route path="/deck/:deckId/card/:cardId" element={<CardEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

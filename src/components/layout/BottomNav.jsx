import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Inicio', icon: '🏠' },
  { to: '/explore', label: 'Explorar', icon: '🔍' },
  { to: '/generate', label: 'Generar', icon: '✨' },
  { to: '/settings', label: 'Ajustes', icon: '⚙️' },
];

export default function BottomNav() {
  const location = useLocation();
  // Hide bottom nav on study screen
  if (location.pathname.includes('/study')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-elevated border-t border-white/10 safe-bottom z-40">
      <div className="flex justify-around items-center h-16 max-w-xl mx-auto">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-full h-full text-xs transition-colors ${
                isActive ? 'text-accent' : 'text-white/60'
              }`
            }
          >
            <span className="text-xl">{t.icon}</span>
            <span className="font-medium">{t.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

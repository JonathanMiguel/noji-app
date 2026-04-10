import React, { useState, useEffect } from 'react';
import { getSetting, setSetting } from '../services/db.js';
import { encryptString, decryptString } from '../services/crypto.js';
import { PROVIDERS } from '../services/llm/index.js';
import { requestPermission, scheduleReminders, showTestNotification } from '../services/notifications.js';

export default function Settings() {
  const [providers, setProviders] = useState({});
  const [defaultProvider, setDefaultProvider] = useState('anthropic');
  const [reminderTimes, setReminderTimes] = useState([]);
  const [newTime, setNewTime] = useState('09:00');
  const [notifStatus, setNotifStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getSetting('llm_providers', {});
      const decrypted = {};
      for (const p of PROVIDERS) {
        const cfg = saved[p.id] || {};
        decrypted[p.id] = {
          apiKey: cfg.apiKey ? await decryptString(cfg.apiKey) : '',
          model: cfg.model || p.defaultModel,
          endpoint: cfg.endpoint || p.defaultEndpoint || '',
        };
      }
      setProviders(decrypted);
      setDefaultProvider((await getSetting('llm_default_provider', 'anthropic')));
      setReminderTimes((await getSetting('reminder_times', [])));
    })();
  }, []);

  function updateProvider(id, key, value) {
    setProviders((prev) => ({
      ...prev,
      [id]: { ...prev[id], [key]: value },
    }));
  }

  async function saveAll() {
    const toStore = {};
    for (const p of PROVIDERS) {
      const cfg = providers[p.id] || {};
      toStore[p.id] = {
        apiKey: cfg.apiKey ? await encryptString(cfg.apiKey) : null,
        model: cfg.model || p.defaultModel,
        endpoint: cfg.endpoint || p.defaultEndpoint || '',
      };
    }
    await setSetting('llm_providers', toStore);
    await setSetting('llm_default_provider', defaultProvider);
    await setSetting('reminder_times', reminderTimes);
    await scheduleReminders(reminderTimes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function enableNotifications() {
    const status = await requestPermission();
    setNotifStatus(status);
    if (status === 'granted') {
      await showTestNotification();
      await scheduleReminders(reminderTimes);
    }
  }

  function addTime() {
    if (!newTime || reminderTimes.includes(newTime)) return;
    setReminderTimes([...reminderTimes, newTime].sort());
  }

  function removeTime(t) {
    setReminderTimes(reminderTimes.filter((x) => x !== t));
  }

  return (
    <div className="px-4 pt-6 max-w-xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Ajustes</h1>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
          Proveedores de IA
        </h2>
        <div className="space-y-4">
          {PROVIDERS.map((p) => {
            const cfg = providers[p.id] || {};
            return (
              <div key={p.id} className="bg-bg-card rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold">{p.label}</div>
                  <label className="flex items-center gap-1.5 text-xs text-white/60">
                    <input
                      type="radio"
                      name="defprov"
                      checked={defaultProvider === p.id}
                      onChange={() => setDefaultProvider(p.id)}
                      className="accent-accent"
                    />
                    Por defecto
                  </label>
                </div>
                {p.needsKey && (
                  <input
                    type="password"
                    value={cfg.apiKey || ''}
                    onChange={(e) => updateProvider(p.id, 'apiKey', e.target.value)}
                    placeholder="API key"
                    className="w-full bg-bg border border-white/10 rounded-lg px-3 py-2 text-sm mb-2"
                  />
                )}
                <input
                  type="text"
                  value={cfg.model || ''}
                  onChange={(e) => updateProvider(p.id, 'model', e.target.value)}
                  placeholder="Modelo"
                  className="w-full bg-bg border border-white/10 rounded-lg px-3 py-2 text-sm mb-2"
                />
                {p.id === 'ollama' && (
                  <input
                    type="text"
                    value={cfg.endpoint || ''}
                    onChange={(e) => updateProvider(p.id, 'endpoint', e.target.value)}
                    placeholder="Endpoint"
                    className="w-full bg-bg border border-white/10 rounded-lg px-3 py-2 text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">
          Notificaciones
        </h2>
        <div className="bg-bg-card rounded-2xl p-4 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm">Permiso</div>
            <div className="text-xs text-white/60">{notifStatus}</div>
          </div>
          {notifStatus !== 'granted' && (
            <button
              onClick={enableNotifications}
              className="w-full bg-accent py-2.5 rounded-xl text-sm font-medium"
            >
              Activar notificaciones
            </button>
          )}

          <div>
            <div className="text-xs text-white/50 uppercase mb-2 tracking-wide">
              Horarios de repaso
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {reminderTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => removeTime(t)}
                  className="px-3 py-1.5 bg-accent/20 border border-accent/40 rounded-full text-sm"
                >
                  {t} ✕
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1 bg-bg border border-white/10 rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={addTime}
                className="px-4 bg-bg border border-white/10 rounded-lg text-sm"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      </section>

      <button
        onClick={saveAll}
        className="w-full bg-accent py-3.5 rounded-xl font-semibold mb-4"
      >
        {saved ? '✓ Guardado' : 'Guardar ajustes'}
      </button>

      <div className="text-center text-white/30 text-xs pb-4">
        Noji Cards · v0.1.0 · Todos los datos son locales
      </div>
    </div>
  );
}

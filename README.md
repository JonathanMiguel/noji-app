# Noji Cards

PWA personal de tarjetas de estudio con generación de mazos por IA. Reemplazo de Noji — todo local, sin backend.

## Stack

- React 18 + Vite
- Tailwind CSS
- IndexedDB via Dexie.js
- Service Worker + Web App Manifest (PWA instalable)
- LLM providers: Anthropic (Claude), Groq, Google Gemini, Ollama

## Features MVP

- Mazos con nombre, descripción, icono y color
- Tarjetas con frente, reverso, imágenes y audio (grabación directa)
- Modo estudio con flip animation y SM-2 spaced repetition
- Generación de mazos con IA (configurable por proveedor)
- Notificaciones locales diarias (Notification API + SW)
- Dark mode por defecto, mobile-first
- Instalable como PWA en Android

## Desarrollo

```bash
npm install
npm run dev     # servidor local en :5173
npm run build   # build de producción en dist/
npm run preview # preview del build
```

## Deploy (GitHub Pages)

```bash
npm run build
npx gh-pages -d dist
```

El `base` de Vite está configurado como `./` para que funcione en cualquier subpath.

## Configuración de providers

Abre **Ajustes** dentro de la app y pega tu API key en el proveedor que quieras usar. Las keys se almacenan cifradas (AES-GCM) en IndexedDB, nunca en texto plano ni en el código.

- **Anthropic** — mejor calidad. Requiere `dangerous-direct-browser-access`.
- **Groq** — gratis y rápido.
- **Gemini** — gratis, con API key de AI Studio.
- **Ollama** — local, requiere Ollama corriendo en tu PC (`http://localhost:11434`).

## Notas

- Las imágenes se redimensionan a 1024px antes de guardar
- Audio grabado en `audio/webm;opus`
- Datos 100% locales (IndexedDB)
- Las notificaciones diarias usan `setTimeout` dentro del SW — abre la app periódicamente para reprogramar

# CLAUDE.md — Noji Cards (PWA de Tarjetas de Estudio)

## Resumen del Proyecto

App de tarjetas de estudio (flashcards) tipo Noji, construida como PWA instalable en Android. El usuario es Jonathan, AI/ML Engineer basado en Pachuca, México. La app es para uso personal, reemplazando Noji que cobra por imágenes y audio.

## Stack Técnico

- **Frontend:** React (single-file JSX cuando sea posible, o Vite + React para el proyecto completo)
- **Styling:** Tailwind CSS
- **Storage:** IndexedDB (via Dexie.js) — todo local en el dispositivo, sin backend
- **PWA:** Service Worker + Web App Manifest para instalación en Android
- **Notificaciones:** Push notifications locales via Service Worker + Notification API
- **Deploy:** GitHub Pages (gratis, estático)
- **LLM Integration:** Provider configurable (ver sección abajo)

## Features — MVP (v1)

### Tarjetas
- Cada tarjeta tiene: frente, reverso, imagen(es), audio, color, categoría
- El frente y reverso soportan texto enriquecido (markdown básico)
- Imágenes: carga desde galería del teléfono + diagramas SVG generados por LLM
- Audio: grabación directa desde micrófono del teléfono + carga de archivos de audio
- Colores personalizables por tarjeta individual

### Mazos (Decks)
- Agrupación de tarjetas en mazos
- Cada mazo tiene: nombre, descripción, color, icono
- Mazos agrupables en carpetas/categorías (ej: "Inglés", "Python", "ML")
- Carpetas anidables al menos 1 nivel (carpeta → mazos)
- Vista de exploración tipo grid con previews

### Modo Estudio
- Flip card animation (tap para voltear)
- Navegación entre tarjetas (swipe o botones)
- Marcar tarjeta como "conocida" / "por repasar"
- Spaced repetition básico (SM-2 algorithm o simplificado)
- Estadísticas de progreso por mazo

### Notificaciones / Recordatorios
- El usuario configura hora(s) de repaso diario
- Push notification local via Service Worker
- Sin servidor externo — todo local con la Notification API + setTimeout/setInterval en el SW

### Generación de Mazos con IA
- Pantalla de "Generar Mazo" donde el usuario describe el tema
- La app llama al LLM provider configurado
- El LLM genera: texto frente/reverso + diagramas SVG opcionales
- El usuario revisa, edita, y confirma antes de guardar
- Prompt template configurable

### LLM Providers (configurable en Settings)
- **Anthropic (Claude Sonnet)** — mejor calidad, requiere API key, cuesta centavos
  - Endpoint: `https://api.anthropic.com/v1/messages`
  - Model: `claude-sonnet-4-20250514`
  - Auth: API key del usuario almacenada localmente (encriptada en IndexedDB)
- **Groq (Llama 3)** — gratis, buena calidad, muy rápido
  - Endpoint: `https://api.groq.com/openai/v1/chat/completions`
  - Model: `llama-3.3-70b-versatile` (o el más reciente disponible)
  - Auth: API key gratuita del usuario
- **Google Gemini Flash** — gratis, buena calidad
  - Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
  - Auth: API key gratuita del usuario
- **Ollama (local)** — gratis, requiere Ollama corriendo en PC
  - Endpoint: `http://localhost:11434/api/chat` (configurable)
  - Model: configurable por el usuario
- La app debe abstraer los providers con una interfaz común: `generateDeck(topic, numCards, provider) → Card[]`

## Features — v2 (futuro)
- Widgets interactivos HTML embebidos en tarjetas (tipo los que Claude genera en chat)
- Import/Export de mazos (JSON)
- Compartir mazos entre dispositivos (via archivo o QR)
- Sync entre dispositivos via Google Drive o GitHub Gist
- Modo quiz con puntuación
- Soporte para LaTeX/MathJax en tarjetas

## Estructura del Proyecto

```
noji-app/
├── CLAUDE.md                 # Este archivo
├── README.md                 # Documentación pública del repo
├── package.json
├── vite.config.js
├── index.html
├── public/
│   ├── manifest.json         # Web App Manifest para PWA
│   ├── sw.js                 # Service Worker
│   ├── icons/                # App icons (192x192, 512x512)
│   └── favicon.ico
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Router principal
│   ├── index.css             # Tailwind imports
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── BottomNav.jsx      # Navegación móvil
│   │   ├── cards/
│   │   │   ├── CardView.jsx        # Vista de tarjeta individual (flip)
│   │   │   ├── CardEditor.jsx      # Editor de tarjeta
│   │   │   ├── CardList.jsx        # Lista de tarjetas en un mazo
│   │   │   └── ImageUploader.jsx   # Componente de carga de imágenes
│   │   ├── decks/
│   │   │   ├── DeckGrid.jsx        # Grid de mazos
│   │   │   ├── DeckEditor.jsx      # Crear/editar mazo
│   │   │   └── FolderView.jsx      # Vista de carpetas
│   │   ├── study/
│   │   │   ├── StudySession.jsx    # Sesión de estudio
│   │   │   ├── StudyStats.jsx      # Estadísticas
│   │   │   └── ProgressBar.jsx
│   │   ├── ai/
│   │   │   ├── GenerateDeck.jsx    # UI para generar mazos con IA
│   │   │   ├── ProviderConfig.jsx  # Configuración de providers
│   │   │   └── PromptTemplates.jsx
│   │   └── settings/
│   │       ├── Settings.jsx
│   │       ├── NotificationConfig.jsx
│   │       └── ThemeConfig.jsx
│   ├── hooks/
│   │   ├── useDB.js               # Hook para IndexedDB/Dexie
│   │   ├── useStudy.js            # Lógica de spaced repetition
│   │   └── useNotifications.js    # Hook para notificaciones
│   ├── services/
│   │   ├── db.js                  # Configuración de Dexie.js (esquema IndexedDB)
│   │   ├── llm/
│   │   │   ├── index.js           # Factory/dispatcher de providers
│   │   │   ├── anthropic.js       # Provider Claude
│   │   │   ├── groq.js            # Provider Groq
│   │   │   ├── gemini.js          # Provider Gemini
│   │   │   └── ollama.js          # Provider Ollama
│   │   ├── notifications.js       # Servicio de notificaciones
│   │   └── spacedRepetition.js    # Algoritmo SM-2
│   ├── utils/
│   │   ├── constants.js
│   │   ├── svgParser.js           # Parser de SVG para tarjetas
│   │   └── audioRecorder.js       # Utilidad de grabación
│   └── assets/
│       └── default-icons/         # Iconos default para mazos
└── .gitignore
```

## Esquema de Base de Datos (IndexedDB via Dexie.js)

```javascript
const db = new Dexie('NojiBrain');
db.version(1).stores({
  folders: '++id, name, parentId, color, icon, order, createdAt',
  decks: '++id, name, description, folderId, color, icon, cardCount, order, createdAt, updatedAt',
  cards: '++id, deckId, front, back, images, audio, color, tags, sr_interval, sr_easeFactor, sr_nextReview, sr_repetitions, createdAt, updatedAt',
  studySessions: '++id, deckId, startedAt, completedAt, cardsStudied, cardsCorrect',
  settings: 'key, value'
});
```

## Diseño UI / UX

### Filosofía
- Mobile-first (diseñado primero para Android, funciona en desktop)
- Dark mode por default (como Noji), con toggle a light mode
- Minimalista, bordes redondeados, animaciones suaves
- Colores: fondo oscuro (#0f0f0f), acentos configurables por el usuario
- Tipografía: Inter o system font stack
- Navegación inferior con 4 tabs: Inicio, Explorar, Generar, Ajustes

### Pantallas principales
1. **Home** — mazos recientes, próximo repaso, estadísticas rápidas
2. **Explorar** — carpetas y mazos en grid, búsqueda
3. **Mazo** — lista de tarjetas, botón de estudiar, botón de agregar
4. **Estudio** — tarjeta centrada, flip animation, swipe para navegar
5. **Editor de Tarjeta** — campos de texto, upload de imagen, grabación de audio
6. **Generar con IA** — input de tema, selector de provider, preview de tarjetas generadas
7. **Ajustes** — providers de IA, notificaciones, tema, export/import

## Configuración de Deploy (GitHub Pages)

- Build con Vite → `dist/`
- GitHub Actions para auto-deploy en push a `main`
- URL final: `https://<username>.github.io/noji-app/`
- El manifest.json debe tener `start_url` y `scope` correctos para GitHub Pages

## Notas de Implementación

### Seguridad de API Keys
- Las API keys se almacenan en IndexedDB, NO en localStorage
- Se encriptan con Web Crypto API antes de guardar
- Nunca se incluyen en el código fuente ni en el repo
- La app es 100% client-side, las keys nunca pasan por un servidor de terceros

### PWA Requirements
- El Service Worker debe cachear todos los assets para funcionamiento offline
- manifest.json con icons en 192x192 y 512x512 (PNG)
- `display: "standalone"` para que se vea como app nativa
- `theme_color` y `background_color` matching con dark mode
- Offline-first: toda la funcionalidad core funciona sin internet (excepto generación con IA)

### Audio Recording
- Usar MediaRecorder API
- Formato: webm/opus (nativo de Chrome Android)
- Almacenar como Blob en IndexedDB
- Playback con Audio API estándar

### Image Handling
- Imágenes cargadas se redimensionan client-side antes de guardar (max 1024px)
- Se almacenan como Blob en IndexedDB
- SVGs generados por IA se almacenan como string
- Canvas API para redimensionamiento

## Prompts para Generación de Mazos

### Template Default
```
Genera un mazo de {numCards} tarjetas de estudio sobre: {topic}

Para cada tarjeta, responde SOLO con JSON válido (sin markdown, sin backticks):
{
  "cards": [
    {
      "front": "Pregunta o concepto (breve)",
      "back": "Respuesta o explicación (detallada pero concisa)",
      "svg": "código SVG opcional si un diagrama ayuda a entender el concepto (o null)"
    }
  ]
}

Reglas:
- Las tarjetas deben ser progresivas (de básico a avanzado)
- El frente debe ser una pregunta clara o un concepto
- El reverso debe explicar de forma concisa pero completa
- Incluir SVG solo cuando un diagrama visual realmente ayude (máximo en 30% de las tarjetas)
- Los SVGs deben usar viewBox="0 0 400 300", colores claros sobre fondo oscuro (#1a1a2e)
- Responde ÚNICAMENTE con el JSON, sin texto adicional
```

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Deploy a GitHub Pages (manual)
npm run build && npx gh-pages -d dist
```

## Git Workflow
- Branch `main` = producción (auto-deploy a GitHub Pages)
- Branches de feature: `feature/nombre-del-feature`
- Commits en español o inglés, descriptivos

## Contexto del Desarrollador
- Jonathan tiene experiencia con React, Tailwind, APIs REST, y AWS
- Familiaridad con MCP, LLM APIs, y arquitectura de sistemas
- Usa Ubuntu (desarrollo principal) y Windows (Claude Desktop)
- Plan Max de Anthropic, API key creada en console.anthropic.com
- Objetivo: app funcional, limpia, instalable, que reemplace a Noji con features superiores

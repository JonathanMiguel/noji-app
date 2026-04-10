import { anthropicGenerate } from './anthropic.js';
import { groqGenerate } from './groq.js';
import { geminiGenerate } from './gemini.js';
import { ollamaGenerate } from './ollama.js';

const DEFAULT_PROMPT = `Genera un mazo de {numCards} tarjetas de estudio sobre: {topic}

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
- Responde ÚNICAMENTE con el JSON, sin texto adicional`;

export function buildPrompt(topic, numCards, template) {
  return (template || DEFAULT_PROMPT)
    .replace(/\{topic\}/g, topic)
    .replace(/\{numCards\}/g, String(numCards));
}

export function parseCardsResponse(text) {
  // Strip markdown fences if any
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

  // Attempt JSON parse, fall back to extracting the first {...} block
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed.cards && Array.isArray(parsed.cards)) return parsed.cards;
  } catch {}

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const parsed = JSON.parse(match[0]);
      if (parsed.cards && Array.isArray(parsed.cards)) return parsed.cards;
    } catch {}
  }
  throw new Error('No se pudo parsear la respuesta del LLM como JSON');
}

export async function generateDeck({ topic, numCards = 10, provider, apiKey, model, endpoint, promptTemplate }) {
  const prompt = buildPrompt(topic, numCards, promptTemplate);
  let text;
  switch (provider) {
    case 'anthropic':
      text = await anthropicGenerate({ prompt, apiKey, model });
      break;
    case 'groq':
      text = await groqGenerate({ prompt, apiKey, model });
      break;
    case 'gemini':
      text = await geminiGenerate({ prompt, apiKey, model });
      break;
    case 'ollama':
      text = await ollamaGenerate({ prompt, model, endpoint });
      break;
    default:
      throw new Error(`Provider desconocido: ${provider}`);
  }
  return parseCardsResponse(text);
}

export const PROVIDERS = [
  { id: 'anthropic', label: 'Anthropic (Claude)', needsKey: true, defaultModel: 'claude-sonnet-4-20250514' },
  { id: 'groq', label: 'Groq (Llama)', needsKey: true, defaultModel: 'llama-3.3-70b-versatile' },
  { id: 'gemini', label: 'Google Gemini', needsKey: true, defaultModel: 'gemini-2.0-flash' },
  { id: 'ollama', label: 'Ollama (local)', needsKey: false, defaultModel: 'llama3.2', defaultEndpoint: 'http://localhost:11434/api/chat' },
];

export async function ollamaGenerate({ prompt, model, endpoint }) {
  const url = endpoint || 'http://localhost:11434/api/chat';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3.2',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      format: 'json',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama ${res.status}: ${err}`);
  }
  const data = await res.json();
  const text = data?.message?.content;
  if (!text) throw new Error('Respuesta vacía de Ollama');
  return text;
}

// Lightweight API key "obfuscation" using Web Crypto + device-local key.
// Not true security against a determined attacker with device access, but
// keeps keys from being stored as plaintext.

const KEY_NAME = 'noji-master-key-v1';

async function getOrCreateKey() {
  const stored = localStorage.getItem(KEY_NAME);
  if (stored) {
    const raw = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key));
  localStorage.setItem(KEY_NAME, btoa(String.fromCharCode(...raw)));
  return key;
}

export async function encryptString(plain) {
  if (!plain) return null;
  const key = await getOrCreateKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plain);
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
  );
  const combined = new Uint8Array(iv.length + cipher.length);
  combined.set(iv, 0);
  combined.set(cipher, iv.length);
  return btoa(String.fromCharCode(...combined));
}

export async function decryptString(b64) {
  if (!b64) return '';
  try {
    const key = await getOrCreateKey();
    const combined = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const cipher = combined.slice(12);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plain);
  } catch {
    return '';
  }
}

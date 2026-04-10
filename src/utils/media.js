// Resize an image File/Blob to max dimension while preserving aspect ratio.
// Returns a Blob (jpeg or png based on original).
export async function resizeImage(file, maxSize = 1024) {
  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);
  const { width, height } = img;
  let w = width, h = height;
  if (Math.max(width, height) > maxSize) {
    if (width > height) {
      w = maxSize;
      h = Math.round((height * maxSize) / width);
    } else {
      h = maxSize;
      w = Math.round((width * maxSize) / height);
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
  });
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function blobToDataUrl(blob) {
  return fileToDataUrl(blob);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function blobToObjectUrl(blob) {
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

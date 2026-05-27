import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { ensureDir, uid, PDF_DIR } from './storage';

export const QUALITY = {
  high:   { q: 0.92, label: 'High Quality',   desc: 'Best clarity, larger file' },
  medium: { q: 0.72, label: 'Medium',          desc: 'Good balance of size/quality' },
  low:    { q: 0.45, label: 'Compressed',      desc: 'Smaller file, some quality loss' },
  web:    { q: 0.28, label: 'Web Optimized',   desc: 'Smallest size for sharing' },
};

export async function compressImage(uri, quality = 0.72, maxWidth = 1400) {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch {
    return uri;
  }
}

export async function rotateImage(uri) {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ rotate: 90 }],
    { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
  );
  return result.uri;
}

async function toBase64(uri) {
  return await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function buildPdf({ images, name, quality = 'medium', filter = 'none' }) {
  await ensureDir();
  const q = QUALITY[quality]?.q ?? 0.72;

  const pageHtml = [];
  for (const imgUri of images) {
    const compressed = await compressImage(imgUri, q);
    const b64 = await toBase64(compressed);
    const src = `data:image/jpeg;base64,${b64}`;
    const filterCss =
      filter === 'grayscale' ? 'filter:grayscale(100%);' :
      filter === 'enhance'   ? 'filter:contrast(1.2) brightness(1.05);' : '';
    pageHtml.push(`
      <div class="page">
        <img src="${src}" style="width:100%;height:100%;object-fit:contain;${filterCss}"/>
      </div>`);
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#fff;}
    .page{width:210mm;min-height:297mm;display:flex;align-items:center;
          justify-content:center;page-break-after:always;background:#fff;}
    .page:last-child{page-break-after:auto;}
    img{max-width:100%;max-height:290mm;}
  </style></head><body>${pageHtml.join('\n')}</body></html>`;

  const { uri: tmpUri } = await Print.printToFileAsync({ html, width: 595, height: 842 });
  const safeName = name.replace(/[^\w\s\-]/g, '_').slice(0, 60);
  const dest = `${PDF_DIR}${safeName}_${uid()}.pdf`;
  await FileSystem.moveAsync({ from: tmpUri, to: dest });
  return dest;
}

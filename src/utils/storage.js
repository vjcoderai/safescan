import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const DOCS_KEY = 'safescan_v1_docs';
export const PDF_DIR = FileSystem.documentDirectory + 'safescan_pdfs/';

export async function ensureDir() {
  const info = await FileSystem.getInfoAsync(PDF_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(PDF_DIR, { intermediates: true });
  }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function getDocs() {
  try {
    const raw = await AsyncStorage.getItem(DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveDoc(doc) {
  const docs = await getDocs();
  const idx = docs.findIndex(d => d.id === doc.id);
  if (idx >= 0) docs[idx] = doc;
  else docs.unshift(doc);
  await AsyncStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  return doc;
}

export async function deleteDoc(id) {
  const docs = await getDocs();
  const doc = docs.find(d => d.id === id);
  if (doc?.uri) {
    const info = await FileSystem.getInfoAsync(doc.uri);
    if (info.exists) await FileSystem.deleteAsync(doc.uri, { idempotent: true });
  }
  await AsyncStorage.setItem(DOCS_KEY, JSON.stringify(docs.filter(d => d.id !== id)));
}

export async function renameDoc(id, name) {
  const docs = await getDocs();
  await AsyncStorage.setItem(
    DOCS_KEY,
    JSON.stringify(docs.map(d => (d.id === id ? { ...d, name } : d)))
  );
}

export async function clearAllDocs() {
  const docs = await getDocs();
  for (const d of docs) {
    try {
      const info = await FileSystem.getInfoAsync(d.uri);
      if (info.exists) await FileSystem.deleteAsync(d.uri, { idempotent: true });
    } catch {}
  }
  await AsyncStorage.removeItem(DOCS_KEY);
}

export async function fileSize(uri) {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    if (!info.exists) return '—';
    const b = info.size || 0;
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  } catch {
    return '—';
  }
}

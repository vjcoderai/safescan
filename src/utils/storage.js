import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const DOCS_KEY = 'safescan_v1_docs';

// Improved directory handling with fallback
export const getPdfDir = async () => {
  let baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  
  if (!baseDir) {
    throw new Error('No storage directory available on this device');
  }

  const pdfDir = baseDir + 'safescan_pdfs/';
  
  try {
    const info = await FileSystem.getInfoAsync(pdfDir);
    if (!info.exists) {
      await FileSystem.makeDirectoryAsync(pdfDir, { intermediates: true });
    }
    return pdfDir;
  } catch (e) {
    console.error('Failed to create PDF directory:', e);
    throw new Error(`Failed to create PDF directory: ${e.message}`);
  }
};

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function getDocs() {
  try {
    const raw = await AsyncStorage.getItem(DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('getDocs error:', e);
    return [];
  }
}

export async function saveDoc(doc) {
  try {
    const docs = await getDocs();
    const idx = docs.findIndex(d => d.id === doc.id);
    
    if (idx >= 0) {
      docs[idx] = doc;
    } else {
      docs.unshift(doc);
    }
    
    await AsyncStorage.setItem(DOCS_KEY, JSON.stringify(docs));
    return doc;
  } catch (e) {
    console.error('saveDoc error:', e);
    throw new Error(`Failed to save document: ${e.message}`);
  }
}

export async function deleteDoc(id) {
  try {
    const docs = await getDocs();
    const doc = docs.find(d => d.id === id);
    
    if (doc?.uri) {
      try {
        const info = await FileSystem.getInfoAsync(doc.uri);
        if (info.exists) {
          await FileSystem.deleteAsync(doc.uri, { idempotent: true });
        }
      } catch (e) {
        console.warn(`Could not delete file ${doc.uri}:`, e);
      }
    }

    await AsyncStorage.setItem(
      DOCS_KEY,
      JSON.stringify(docs.filter(d => d.id !== id))
    );
  } catch (e) {
    console.error('deleteDoc error:', e);
    throw new Error(`Failed to delete document: ${e.message}`);
  }
}

export async function renameDoc(id, name) {
  try {
    const docs = await getDocs();
    await AsyncStorage.setItem(
      DOCS_KEY,
      JSON.stringify(docs.map(d => (d.id === id ? { ...d, name } : d)))
    );
  } catch (e) {
    console.error('renameDoc error:', e);
    throw new Error(`Failed to rename document: ${e.message}`);
  }
}

export async function clearAllDocs() {
  try {
    const docs = await getDocs();
    for (const d of docs) {
      if (d?.uri) {
        try {
          const info = await FileSystem.getInfoAsync(d.uri);
          if (info.exists) {
            await FileSystem.deleteAsync(d.uri, { idempotent: true });
          }
        } catch (e) {
          console.warn(`Error deleting ${d.uri}:`, e);
        }
      }
    }
    await AsyncStorage.removeItem(DOCS_KEY);
  } catch (e) {
    console.error('clearAllDocs error:', e);
    throw new Error(`Failed to clear all documents: ${e.message}`);
  }
}

export async function fileSize(uri) {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    if (!info.exists) return '—';
    const b = info.size || 0;
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  } catch (e) {
    console.error('fileSize error:', e);
    return '—';
  }
}

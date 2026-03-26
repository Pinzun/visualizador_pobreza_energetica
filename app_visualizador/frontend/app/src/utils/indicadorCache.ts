// src/utils/indicadorCache.ts
// Caché IndexedDB para respuestas de la API de indicadores.
// Se invalida automáticamente cuando cambia DATA_VERSION.
import { openDB } from "idb";

const DB_NAME = "IndicadorCache";
const STORE_NAME = "indicadores";

// ⚠️ Actualiza esto cuando el backend reciba nuevos datos (CASEN, Censo, etc.)
// Esto invalida automáticamente todas las entradas cacheadas.
const DATA_VERSION = "v2025.08.16";

// TTL de seguridad: 7 días en ms (por si DATA_VERSION no se actualiza a tiempo)
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheEntry = {
  data: unknown;
  savedAt: number;
  version: string;
};

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

function makeKey(indicator: string, cut: string | undefined): string {
  return `${DATA_VERSION}:${indicator}:${cut ?? "nacional"}`;
}

export async function getIndicadorCache(
  indicator: string,
  cut: string | undefined
): Promise<unknown | null> {
  try {
    const db = await getDB();
    const key = makeKey(indicator, cut);
    const entry = (await db.get(STORE_NAME, key)) as CacheEntry | undefined;

    if (!entry) return null;

    // Invalida si la versión cambió o si expiró el TTL
    if (entry.version !== DATA_VERSION) return null;
    if (Date.now() - entry.savedAt > TTL_MS) return null;

    return entry.data;
  } catch {
    // Si IndexedDB falla (modo privado, cuota llena, etc.), simplemente no cacheamos
    return null;
  }
}

export async function setIndicadorCache(
  indicator: string,
  cut: string | undefined,
  data: unknown
): Promise<void> {
  try {
    const db = await getDB();
    const key = makeKey(indicator, cut);
    const entry: CacheEntry = {
      data,
      savedAt: Date.now(),
      version: DATA_VERSION,
    };
    await db.put(STORE_NAME, entry, key);
  } catch {
    // Silencioso: el caché es una optimización, no funcionalidad crítica
  }
}

export async function clearIndicadorCache(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch {
    // Silencioso
  }
}

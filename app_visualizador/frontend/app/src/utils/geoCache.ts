// src/utils/geoCache.ts
import { openDB } from "idb";

const DB_NAME = "GeoDataCache";
const STORE_NAME = "geojsons";

// ⚠️ recuerda actualizar esto cuando cambies la estructura/semántica del caché
const APP_VERSION = "v2025.08.16";

// Clave global legacy (de tu proyecto previo)
const OLD_GLOBAL_KEY = `geojson_cache_${APP_VERSION}`;

// Clave global nueva (namespacing consistente)
const GLOBAL_KEY = `geojson_cache:${APP_VERSION}:GLOBAL`;

type GeoCacheMeta = {
  userKey: string; // mantenemos por compatibilidad; ahora será "GLOBAL"
  savedAt: number; // timestamp
  fingerprint?: string; // hash/versión para invalidar finamente
};

type GeoCachePayload = {
  data: any[];
  meta: GeoCacheMeta;
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

// ------------ Helpers de migración ------------

// Busca entradas "por usuario" y devuelve la más reciente (si hay)
async function findLatestPerUserPayload(
  db: IDBPDatabase<any>,
): Promise<GeoCachePayload | null> {
  const tx = db.transaction(STORE_NAME, "readonly");
  const keys = (await tx.store.getAllKeys()) as string[];
  const prefix = `geojson_cache:${APP_VERSION}:`;

  let latest: GeoCachePayload | null = null;

  // Recorremos claves tipo "geojson_cache:<APP_VERSION>:<ALGO>" que no sean GLOBAL
  for (const k of keys) {
    if (typeof k !== "string") continue;
    if (!k.startsWith(prefix)) continue;
    if (k === GLOBAL_KEY) continue;

    const payload = (await tx.store.get(k)) as any;
    if (!payload) continue;

    const candidate: GeoCachePayload = Array.isArray(payload)
      ? { data: payload, meta: { userKey: k, savedAt: 0 } }
      : payload;

    if (
      !latest ||
      (candidate.meta?.savedAt ?? 0) > (latest.meta?.savedAt ?? 0)
    ) {
      latest = candidate;
    }
  }

  await tx.done;
  return latest;
}

// Consolida una carga (data/meta) en la clave GLOBAL y borra los otros keys (opcional)
async function writeGlobalAndCleanup(
  db: IDBPDatabase<any>,
  payload: GeoCachePayload,
  deleteKeys: string[] = [],
) {
  const finalPayload: GeoCachePayload = {
    data: payload.data,
    meta: {
      userKey: "GLOBAL",
      savedAt: Date.now(),
      fingerprint: payload.meta?.fingerprint,
    },
  };
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.put(finalPayload, GLOBAL_KEY);
  for (const k of deleteKeys) {
    await tx.store.delete(k);
  }
  await tx.done;
  return finalPayload;
}

// ------------ API pública (versión global) ------------

// getGeoCache: parámetro userKey es opcional y se ignora (compat)
export async function getGeoCache(_userKey?: string): Promise<any[] | null> {
  const db = await getDB();

  // 1) Si ya hay GLOBAL, úsalo
  const existingGlobal = (await db.get(STORE_NAME, GLOBAL_KEY)) as any;
  if (existingGlobal) {
    return Array.isArray(existingGlobal)
      ? (existingGlobal as any[])
      : ((existingGlobal as GeoCachePayload).data ?? null);
  }

  // 2) Migración desde clave global legacy (OLD_GLOBAL_KEY)
  const legacyGlobal = (await db.get(STORE_NAME, OLD_GLOBAL_KEY)) as any;
  if (legacyGlobal) {
    const payload: GeoCachePayload = Array.isArray(legacyGlobal)
      ? { data: legacyGlobal, meta: { userKey: "GLOBAL", savedAt: Date.now() } }
      : legacyGlobal;

    const migrated = await writeGlobalAndCleanup(db, payload, [OLD_GLOBAL_KEY]);
    return migrated.data ?? null;
  }

  // 3) Migración desde entradas antiguas por usuario: toma la más reciente
  const latestPerUser = await findLatestPerUserPayload(db);
  if (latestPerUser) {
    // opcional: limpiar todas las claves por usuario
    const tx = db.transaction(STORE_NAME, "readonly");
    const keys = (await tx.store.getAllKeys()) as string[];
    await tx.done;
    const prefix = `geojson_cache:${APP_VERSION}:`;
    const toDelete = keys.filter(
      (k) => typeof k === "string" && k.startsWith(prefix) && k !== GLOBAL_KEY,
    );
    const migrated = await writeGlobalAndCleanup(db, latestPerUser, toDelete);
    return migrated.data ?? null;
  }

  // 4) No había nada
  return null;
}

// setGeoCache: ignora userKey y siempre escribe en GLOBAL
export async function setGeoCache(
  _userKeyOrData: string | any[],
  dataOrMeta?: any[] | Partial<GeoCacheMeta>,
  maybeMeta?: Partial<GeoCacheMeta>,
): Promise<void> {
  const db = await getDB();

  // Soporta dos firmas:
  // - setGeoCache(data, meta)
  // - setGeoCache(userKey, data, meta)  // compat
  let data: any[];
  let meta: Partial<GeoCacheMeta> | undefined;

  if (Array.isArray(_userKeyOrData)) {
    data = _userKeyOrData;
    meta = (dataOrMeta as Partial<GeoCacheMeta>) ?? {};
  } else {
    data = (dataOrMeta as any[]) ?? [];
    meta = maybeMeta ?? {};
  }

  const payload: GeoCachePayload = {
    data,
    meta: {
      userKey: "GLOBAL",
      savedAt: Date.now(),
      ...meta,
    },
  };

  await db.put(STORE_NAME, payload, GLOBAL_KEY);
}

// clearGeoCache: si se pasa userKey, se ignora; borra GLOBAL y
// (opcionalmente) todas las claves de esta versión.
export async function clearGeoCache(options?: { allForVersion?: boolean }) {
  const db = await getDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.delete(GLOBAL_KEY);

  if (options?.allForVersion) {
    const keys = (await tx.store.getAllKeys()) as string[];
    const prefix = `geojson_cache:${APP_VERSION}:`;
    await Promise.all(
      keys
        .filter((k) => typeof k === "string" && k.startsWith(prefix))
        .map((k) => tx.store.delete(k)),
    );
  }

  await tx.done;
}

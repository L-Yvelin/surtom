const DB_NAME = 'surtom';
const STORE_NAME = 'resource-packs';
const DB_VERSION = 1;

export interface StoredPack {
  id: string;
  name: string;
  bytes: ArrayBuffer;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = run(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }),
  );
}

export function savePack(pack: StoredPack): Promise<void> {
  return tx('readwrite', (store) => store.put(pack)).then(() => undefined);
}

export function deletePack(id: string): Promise<void> {
  return tx('readwrite', (store) => store.delete(id)).then(() => undefined);
}

export function loadPacks(): Promise<StoredPack[]> {
  return tx<StoredPack[]>('readonly', (store) => store.getAll());
}

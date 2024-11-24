const dbName = "TeatimeStorage";
const dbVersion = 1;
const storeName = "files";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore(storeName, { keyPath: "cid" });
    };
  });
}

// Save a File object and its hash
export async function saveFile(file: File, cid: string): Promise<void> {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.put({ cid, file });
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Lookup a File object by its hash
export async function getFile(cid: string): Promise<File | undefined> {
  const db = await openDB();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);

  return new Promise((resolve, reject) => {
    const request = store.get(cid);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result?.file);
  });
}

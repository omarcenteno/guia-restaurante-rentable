const DATABASE_NAME = "grr-knowledge-files";
const DATABASE_VERSION = 1;
const STORE_NAME = "files";

interface StoredKnowledgeFile {
  documentId: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  lastModified: number;
}

const openDatabase = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: "documentId" });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error("No fue posible abrir el almacén de documentos"));
});

const runRequest = <T>(request: IDBRequest<T>): Promise<T> => new Promise((resolve, reject) => {
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error ?? new Error("No fue posible completar la operación del archivo"));
});

export async function saveKnowledgeFile(documentId: string, file: File): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    await runRequest(transaction.objectStore(STORE_NAME).put({
      documentId,
      blob: file.slice(0, file.size, file.type),
      fileName: file.name,
      mimeType: file.type,
      lastModified: file.lastModified
    } satisfies StoredKnowledgeFile));
  } finally {
    database.close();
  }
}

export async function getKnowledgeFile(documentId: string): Promise<Blob | null> {
  const database = await openDatabase();
  try {
    const record = await runRequest(database.transaction(STORE_NAME).objectStore(STORE_NAME).get(documentId)) as StoredKnowledgeFile | undefined;
    return record?.blob ?? null;
  } finally {
    database.close();
  }
}

export async function deleteKnowledgeFile(documentId: string): Promise<void> {
  const database = await openDatabase();
  try {
    await runRequest(database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(documentId));
  } finally {
    database.close();
  }
}

export async function duplicateKnowledgeFile(sourceDocumentId: string, targetDocumentId: string): Promise<void> {
  const database = await openDatabase();
  try {
    const source = await runRequest(database.transaction(STORE_NAME).objectStore(STORE_NAME).get(sourceDocumentId)) as StoredKnowledgeFile | undefined;
    if (!source) return;
    await runRequest(database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ ...source, documentId: targetDocumentId } satisfies StoredKnowledgeFile));
  } finally {
    database.close();
  }
}

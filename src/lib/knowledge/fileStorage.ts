import { loadActiveWorkspaceId } from "@/lib/workspaces";

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

const scopedDocumentId = (documentId: string) => `${loadActiveWorkspaceId()}:${documentId}`;

export async function saveKnowledgeFile(documentId: string, file: File): Promise<void> {
  const database = await openDatabase();
  const scopedId = scopedDocumentId(documentId);
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    await runRequest(transaction.objectStore(STORE_NAME).put({
      documentId: scopedId,
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
  const scopedId = scopedDocumentId(documentId);
  try {
    const store = database.transaction(STORE_NAME).objectStore(STORE_NAME);
    const record = await runRequest(store.get(scopedId)) as StoredKnowledgeFile | undefined;
    if (record?.blob) return record.blob;
    const legacyRecord = await runRequest(store.get(documentId)) as StoredKnowledgeFile | undefined;
    if (legacyRecord?.blob) return legacyRecord.blob;
    return record?.blob ?? null;
  } finally {
    database.close();
  }
}

export async function deleteKnowledgeFile(documentId: string): Promise<void> {
  const database = await openDatabase();
  const scopedId = scopedDocumentId(documentId);
  try {
    const store = database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME);
    await runRequest(store.delete(scopedId));
    await runRequest(store.delete(documentId));
  } finally {
    database.close();
  }
}

export async function duplicateKnowledgeFile(sourceDocumentId: string, targetDocumentId: string): Promise<void> {
  const database = await openDatabase();
  const scopedSourceId = scopedDocumentId(sourceDocumentId);
  const scopedTargetId = scopedDocumentId(targetDocumentId);
  try {
    const sourceStore = database.transaction(STORE_NAME).objectStore(STORE_NAME);
    const scopedSource = await runRequest(sourceStore.get(scopedSourceId)) as StoredKnowledgeFile | undefined;
    const source = scopedSource ?? await runRequest(sourceStore.get(sourceDocumentId)) as StoredKnowledgeFile | undefined;
    if (!source) return;
    await runRequest(database.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ ...source, documentId: scopedTargetId } satisfies StoredKnowledgeFile));
  } finally {
    database.close();
  }
}

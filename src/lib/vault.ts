import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, isFirebaseConfigured, storage } from "./firebase";
import type { DocumentType, VaultDocument } from "./types";

const LOCAL_KEY = "civicbridge_vault_docs";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadLocal(uid: string): VaultDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_KEY}:${uid}`);
    return raw ? (JSON.parse(raw) as VaultDocument[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(uid: string, docs: VaultDocument[]) {
  localStorage.setItem(`${LOCAL_KEY}:${uid}`, JSON.stringify(docs));
}

export async function listVaultDocuments(
  uid: string,
  isDemo: boolean
): Promise<VaultDocument[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    return loadLocal(uid);
  }

  const snap = await getDocs(collection(db, "users", uid, "vault"));
  return snap.docs.map((d) => d.data() as VaultDocument);
}

export async function uploadVaultDocument(
  uid: string,
  isDemo: boolean,
  file: File,
  type: DocumentType
): Promise<VaultDocument> {
  const id = `doc-${Date.now()}`;
  const meta: VaultDocument = {
    id,
    name: file.name,
    type,
    size: formatSize(file.size),
    uploadedAt: new Date().toISOString(),
    verified: false,
  };

  if (isDemo || !isFirebaseConfigured || !db || !storage) {
    const docs = [meta, ...loadLocal(uid)];
    saveLocal(uid, docs);
    return meta;
  }

  const storagePath = `users/${uid}/vault/${id}-${file.name}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const record = { ...meta, url, storagePath };
  await setDoc(doc(db, "users", uid, "vault", id), record);
  return record;
}

export async function deleteVaultDocument(
  uid: string,
  isDemo: boolean,
  document: VaultDocument & { storagePath?: string }
): Promise<void> {
  if (isDemo || !isFirebaseConfigured || !db) {
    saveLocal(
      uid,
      loadLocal(uid).filter((d) => d.id !== document.id)
    );
    return;
  }

  await deleteDoc(doc(db, "users", uid, "vault", document.id));
  if (storage && document.storagePath) {
    try {
      await deleteObject(ref(storage, document.storagePath));
    } catch {
      // file may already be gone
    }
  }
}

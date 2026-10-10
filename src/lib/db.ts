import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { REAL_SCHEMES } from "./schemes-data";
import { APPLICATIONS, NOTIFICATIONS, DEMO_USER } from "./mock-data";
import type {
  Opportunity,
  Application,
  ApplicationStatus,
  NotificationItem,
  ChatMessage,
  UserProfile,
} from "./types";

// Local storage fallback keys for offline/demo operation
const APPS_KEY = "civicbridge_apps";
const NOTIFS_KEY = "civicbridge_notifs";
const BOOKMARKS_KEY = "civicbridge_bookmarks";
const CHATS_KEY = "civicbridge_chats";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Opportunities & Schemes (Global Collection: /opportunities)
// ─────────────────────────────────────────────────────────────────────────────

export async function getOpportunitiesFromFirestore(): Promise<Opportunity[]> {
  if (!isFirebaseConfigured || !db) {
    return REAL_SCHEMES;
  }

  try {
    const oppsRef = collection(db, "opportunities");
    const snapshot = await getDocs(oppsRef);
    if (snapshot.empty) {
      return REAL_SCHEMES;
    }
    return snapshot.docs.map((d) => d.data() as Opportunity);
  } catch (err) {
    console.warn("Falling back to local schemes data:", err);
    return REAL_SCHEMES;
  }
}

export async function getOpportunityByIdFromFirestore(
  id: string
): Promise<Opportunity | null> {
  if (!isFirebaseConfigured || !db) {
    return REAL_SCHEMES.find((o) => o.id === id) || null;
  }

  try {
    const oppDoc = await getDoc(doc(db, "opportunities", id));
    if (oppDoc.exists()) {
      return oppDoc.data() as Opportunity;
    }
    return REAL_SCHEMES.find((o) => o.id === id) || null;
  } catch {
    return REAL_SCHEMES.find((o) => o.id === id) || null;
  }
}

export async function addOpportunityToFirestore(
  opportunity: Opportunity
): Promise<void> {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  await setDoc(doc(db, "opportunities", opportunity.id), opportunity);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Application Tracker (Subcollection: /users/{userId}/applications)
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserApplications(
  uid: string,
  isDemo = false
): Promise<Application[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    if (typeof window === "undefined") return APPLICATIONS;
    const raw = localStorage.getItem(`${APPS_KEY}:${uid}`);
    return raw ? (JSON.parse(raw) as Application[]) : APPLICATIONS;
  }

  try {
    const appsRef = collection(db, "users", uid, "applications");
    const snapshot = await getDocs(appsRef);
    if (snapshot.empty) {
      // Seed default applications if collection is brand new
      await seedDefaultApplications(uid);
      return APPLICATIONS;
    }
    return snapshot.docs.map((d) => d.data() as Application);
  } catch (err) {
    console.warn("Could not fetch applications from Firestore:", err);
    const raw = localStorage.getItem(`${APPS_KEY}:${uid}`);
    return raw ? (JSON.parse(raw) as Application[]) : APPLICATIONS;
  }
}

export async function saveUserApplication(
  uid: string,
  app: Application,
  isDemo = false
): Promise<void> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const current = await getUserApplications(uid, true);
    const updated = [app, ...current.filter((a) => a.id !== app.id)];
    localStorage.setItem(`${APPS_KEY}:${uid}`, JSON.stringify(updated));
    return;
  }

  await setDoc(doc(db, "users", uid, "applications", app.id), app, {
    merge: true,
  });
}

export async function updateApplicationStatus(
  uid: string,
  appId: string,
  status: ApplicationStatus,
  notes?: string,
  isDemo = false
): Promise<void> {
  const patch: Partial<Application> = {
    status,
    updatedAt: new Date().toISOString(),
    ...(notes ? { notes } : {}),
  };

  if (isDemo || !isFirebaseConfigured || !db) {
    const current = await getUserApplications(uid, true);
    const updated = current.map((a) =>
      a.id === appId ? { ...a, ...patch } : a
    );
    localStorage.setItem(`${APPS_KEY}:${uid}`, JSON.stringify(updated));
    return;
  }

  await updateDoc(doc(db, "users", uid, "applications", appId), patch);
}

export async function deleteUserApplication(
  uid: string,
  appId: string,
  isDemo = false
): Promise<void> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const current = await getUserApplications(uid, true);
    const updated = current.filter((a) => a.id !== appId);
    localStorage.setItem(`${APPS_KEY}:${uid}`, JSON.stringify(updated));
    return;
  }

  await deleteDoc(doc(db, "users", uid, "applications", appId));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. In-App Notifications (Subcollection: /users/{userId}/notifications)
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserNotifications(
  uid: string,
  isDemo = false
): Promise<NotificationItem[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    if (typeof window === "undefined") return NOTIFICATIONS;
    const raw = localStorage.getItem(`${NOTIFS_KEY}:${uid}`);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : NOTIFICATIONS;
  }

  try {
    const notifsRef = collection(db, "users", uid, "notifications");
    const snapshot = await getDocs(notifsRef);
    if (snapshot.empty) {
      await seedDefaultNotifications(uid);
      return NOTIFICATIONS;
    }
    return snapshot.docs.map((d) => d.data() as NotificationItem);
  } catch (err) {
    console.warn("Could not fetch notifications from Firestore:", err);
    const raw = localStorage.getItem(`${NOTIFS_KEY}:${uid}`);
    return raw ? (JSON.parse(raw) as NotificationItem[]) : NOTIFICATIONS;
  }
}

export async function markNotificationAsRead(
  uid: string,
  notifId: string,
  isDemo = false
): Promise<void> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const current = await getUserNotifications(uid, true);
    const updated = current.map((n) =>
      n.id === notifId ? { ...n, read: true } : n
    );
    localStorage.setItem(`${NOTIFS_KEY}:${uid}`, JSON.stringify(updated));
    return;
  }

  await updateDoc(doc(db, "users", uid, "notifications", notifId), {
    read: true,
  });
}

export async function markAllNotificationsAsRead(
  uid: string,
  isDemo = false
): Promise<void> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const current = await getUserNotifications(uid, true);
    const updated = current.map((n) => ({ ...n, read: true }));
    localStorage.setItem(`${NOTIFS_KEY}:${uid}`, JSON.stringify(updated));
    return;
  }

  const notifsRef = collection(db, "users", uid, "notifications");
  const snapshot = await getDocs(notifsRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Saved Bookmarks (Subcollection: /users/{userId}/bookmarks)
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserBookmarks(
  uid: string,
  isDemo = false
): Promise<string[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(`${BOOKMARKS_KEY}:${uid}`);
    return raw ? (JSON.parse(raw) as string[]) : [];
  }

  try {
    const snap = await getDocs(collection(db, "users", uid, "bookmarks"));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

export async function toggleBookmark(
  uid: string,
  opportunityId: string,
  isDemo = false
): Promise<boolean> {
  const current = await getUserBookmarks(uid, isDemo);
  const exists = current.includes(opportunityId);

  if (isDemo || !isFirebaseConfigured || !db) {
    const updated = exists
      ? current.filter((id) => id !== opportunityId)
      : [...current, opportunityId];
    localStorage.setItem(`${BOOKMARKS_KEY}:${uid}`, JSON.stringify(updated));
    return !exists;
  }

  const ref = doc(db, "users", uid, "bookmarks", opportunityId);
  if (exists) {
    await deleteDoc(ref);
    return false;
  } else {
    await setDoc(ref, {
      opportunityId,
      savedAt: new Date().toISOString(),
    });
    return true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Chat History (Subcollection: /users/{userId}/chats)
// ─────────────────────────────────────────────────────────────────────────────

export async function getUserChatMessages(
  uid: string,
  isDemo = false
): Promise<ChatMessage[]> {
  if (isDemo || !isFirebaseConfigured || !db) {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(`${CHATS_KEY}:${uid}`);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  }

  try {
    const snap = await getDocs(collection(db, "users", uid, "chats"));
    if (snap.empty) return [];
    return snap.docs
      .map((d) => d.data() as ChatMessage)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  } catch {
    return [];
  }
}

export async function saveChatMessage(
  uid: string,
  message: ChatMessage,
  isDemo = false
): Promise<void> {
  if (isDemo || !isFirebaseConfigured || !db) {
    const current = await getUserChatMessages(uid, true);
    localStorage.setItem(
      `${CHATS_KEY}:${uid}`,
      JSON.stringify([...current, message])
    );
    return;
  }

  await setDoc(doc(db, "users", uid, "chats", message.id), message);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Automated Seeder Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function seedDefaultApplications(uid: string): Promise<void> {
  if (!db) return;
  const batch = writeBatch(db);
  APPLICATIONS.forEach((app) => {
    const ref = doc(db!, "users", uid, "applications", app.id);
    batch.set(ref, app);
  });
  await batch.commit();
}

async function seedDefaultNotifications(uid: string): Promise<void> {
  if (!db) return;
  const batch = writeBatch(db);
  NOTIFICATIONS.forEach((notif) => {
    const ref = doc(db!, "users", uid, "notifications", notif.id);
    batch.set(ref, notif);
  });
  await batch.commit();
}

/**
 * Uploads all verified Indian Government schemes from schemes-data.ts into Firestore.
 * Batched in chunks of 450 (Firestore limit is 500 per batch).
 */
export async function seedAllSchemesToFirestore(
  onProgress?: (uploaded: number, total: number) => void
): Promise<number> {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured. Set your .env.local keys first.");
  }

  const total = REAL_SCHEMES.length;
  let count = 0;
  const CHUNK_SIZE = 400;

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = REAL_SCHEMES.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const scheme of chunk) {
      const ref = doc(db, "opportunities", scheme.id);
      batch.set(ref, scheme, { merge: true });
    }

    await batch.commit();
    count += chunk.length;
    onProgress?.(count, total);
  }

  return count;
}

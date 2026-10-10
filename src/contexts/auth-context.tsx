"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { DEMO_USER } from "@/lib/mock-data";
import type { UserProfile } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  firebaseReady: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInDemo: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEMO_KEY = "civicbridge_demo_session";
const PROFILE_KEY = "civicbridge_demo_profile";

function loadDemoProfile(): UserProfile {
  if (typeof window === "undefined") return DEMO_USER;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return DEMO_USER;
    }
  }
  return DEMO_USER;
}

function clearDemoSession() {
  localStorage.removeItem(DEMO_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProfile = useCallback(async (firebaseUser: User) => {
    if (!db) {
      // Firebase Auth works but Firestore not ready — keep a local profile bridge
      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Citizen",
        email: firebaseUser.email || "",
        country: "India",
        state: "",
        occupation: "",
        education: "",
        income: "",
        skills: [],
        interests: [],
        profileComplete: false,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies UserProfile;
    }
    const ref = doc(db, "users", firebaseUser.uid);
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Citizen",
        email: firebaseUser.email || "",
        country: "India",
        state: "",
        occupation: "",
        education: "",
        income: "",
        skills: [],
        interests: [],
        profileComplete: false,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(ref, newProfile);
      return newProfile;
    } catch (err) {
      console.warn("Firestore profile unavailable; using auth profile", err);
      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Citizen",
        email: firebaseUser.email || "",
        country: "India",
        state: "",
        occupation: "",
        education: "",
        income: "",
        skills: [],
        interests: [],
        profileComplete: false,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } satisfies UserProfile;
    }
  }, []);

  useEffect(() => {
    // Check if demo session is active first
    const demoActive = typeof window !== "undefined" && localStorage.getItem(DEMO_KEY) === "1";
    if (demoActive) {
      setIsDemo(true);
      setProfile(loadDemoProfile());
      setUser({
        uid: DEMO_USER.uid,
        email: DEMO_USER.email,
        displayName: DEMO_USER.name,
      } as User);
      setLoading(false);
      return;
    }

    if (isFirebaseConfigured && auth) {
      const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          const p = await fetchProfile(firebaseUser);
          setProfile(p);
          setIsDemo(false);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsub();
    }

    setLoading(false);
  }, [fetchProfile]);

  const signInEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Auth is not configured. Enable Email/Password in Firebase Console.");
    }
    clearDemoSession();
    setIsDemo(false);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpEmail = async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Auth is not configured. Enable Email/Password in Firebase Console.");
    }
    clearDemoSession();
    setIsDemo(false);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
  };

  const signInGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Auth is not configured. Enable Google sign-in in Firebase Console.");
    }
    clearDemoSession();
    setIsDemo(false);
    await signInWithPopup(auth, googleProvider);
  };

  const signInDemo = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_KEY, "1");
    }
    const p = loadDemoProfile();
    setIsDemo(true);
    setProfile(p);
    setUser({
      uid: DEMO_USER.uid,
      email: DEMO_USER.email,
      displayName: DEMO_USER.name,
    } as User);
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error("Firebase Auth is not configured.");
    }
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    clearDemoSession();
    setIsDemo(false);
    setUser(null);
    setProfile(null);
    if (auth && isFirebaseConfigured) {
      await firebaseSignOut(auth);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
      profileComplete: Boolean(
        (data.name ?? profile.name) &&
          (data.state ?? profile.state) &&
          (data.occupation ?? profile.occupation) &&
          (data.education ?? profile.education) &&
          (data.income ?? profile.income)
      ),
    };

    if (isDemo || !db || !isFirebaseConfigured) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
      setProfile(updated);
      return;
    }

    try {
      await setDoc(doc(db, "users", profile.uid), updated, { merge: true });
    } catch (err) {
      console.warn("Could not sync profile to Firestore", err);
    }
    setProfile(updated);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      isDemo,
      firebaseReady: isFirebaseConfigured,
      signInEmail,
      signUpEmail,
      signInGoogle,
      signInDemo,
      resetPassword,
      logout,
      updateUserProfile,
    }),
    [user, profile, loading, isDemo]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

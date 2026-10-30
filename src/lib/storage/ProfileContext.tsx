import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { Profile, Progress } from './types';
import { getProfile, getProgress, saveProfile, saveProgress } from './db';
import { getStoredLocale } from '@/lib/i18n';
import { onAuthChange, signOutUser, type FirebaseUser } from '@/lib/auth';

export type ProfileStatus = 'loading' | 'none' | 'ready';

export interface ProfileContextValue {
  status: ProfileStatus;
  profile: Profile | null;
  progress: Progress | null;
  signIn: (displayName: string) => Promise<Profile>;
  signOut: () => Promise<void>;
  syncFirebaseUser: (firebaseUser: FirebaseUser) => Promise<Profile>;
  refreshProgress: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export const ACTIVE_PROFILE_STORAGE_KEY = 'asiakin_active_profile_id';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ProfileStatus>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const isSigningOutRef = useRef(false);

  const refreshProgress = useCallback(async () => {
    if (!profile) {
      setProgress(null);
      return;
    }
    try {
      const p = await getProgress(profile.id);
      setProgress(p ?? null);
    } catch {
      setProgress(null);
    }
  }, [profile]);

  const syncFirebaseUser = useCallback(async (firebaseUser: FirebaseUser): Promise<Profile> => {
    isSigningOutRef.current = false;
    setStatus('loading');
    let active = await getProfile(firebaseUser.uid);
    if (!active) {
      const name =
        firebaseUser.displayName?.trim() ||
        firebaseUser.email?.split('@')[0] ||
        'Penjelajah';
      active = {
        id: firebaseUser.uid,
        displayName: name,
        createdAt: Date.now(),
        locale: getStoredLocale(),
      };
      await saveProfile(active);
      await saveProgress({ profileId: active.id, countries: {} });
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, active.id);
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
    }

    setProfile(active);
    const prog = await getProgress(active.id);
    setProgress(prog ?? null);
    setStatus('ready');
    return active;
  }, []);

  const loadActiveProfile = useCallback(async () => {
    try {
      const savedId =
        typeof window !== 'undefined'
          ? localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY)
          : null;
      let active: Profile | null = null;

      if (savedId) {
        const found = await getProfile(savedId);
        if (found) {
          active = found;
        }
      }

      if (active) {
        setProfile(active);
        const prog = await getProgress(active.id);
        setProgress(prog ?? null);
        setStatus('ready');
      } else {
        setProfile(null);
        setProgress(null);
        setStatus('none');
      }
    } catch {
      setStatus('none');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (!mounted || isSigningOutRef.current) return;
      if (firebaseUser) {
        try {
          await syncFirebaseUser(firebaseUser);
          return;
        } catch (err) {
          console.error('Gagal sinkronisasi profil auth:', err);
          if (mounted && !isSigningOutRef.current) {
            setStatus('none');
          }
          return;
        }
      }

      // Jika sedang proses logout, jangan pulihkan sesi dari localStorage
      if (isSigningOutRef.current) {
        if (mounted) {
          setProfile(null);
          setProgress(null);
          setStatus('none');
        }
        return;
      }

      // If no firebaseUser, check local storage / IndexedDB
      try {
        const savedId =
          typeof window !== 'undefined'
            ? localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY)
            : null;
        let active: Profile | null = null;

        if (savedId) {
          const found = await getProfile(savedId);
          if (found) {
            active = found;
          }
        }

        if (!mounted || isSigningOutRef.current) return;

        if (active) {
          setProfile(active);
          const prog = await getProgress(active.id);
          if (!mounted || isSigningOutRef.current) return;
          setProgress(prog ?? null);
          setStatus('ready');
        } else {
          setProfile(null);
          setProgress(null);
          setStatus('none');
        }
      } catch {
        if (mounted && !isSigningOutRef.current) {
          setStatus('none');
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [syncFirebaseUser]);

  const signIn = useCallback(async (displayName: string): Promise<Profile> => {
    isSigningOutRef.current = false;
    const trimmed = displayName.trim();
    if (!trimmed) {
      throw new Error('Nama tampilan tidak boleh kosong');
    }

    const newProfile: Profile = {
      id: crypto.randomUUID(),
      displayName: trimmed,
      createdAt: Date.now(),
      locale: getStoredLocale(),
    };

    const initialProgress: Progress = {
      profileId: newProfile.id,
      countries: {},
    };

    await saveProfile(newProfile);
    await saveProgress(initialProgress);

    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, newProfile.id);
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
      }
    }

    setProfile(newProfile);
    setProgress(initialProgress);
    setStatus('ready');
    return newProfile;
  }, []);

  const signOut = useCallback(async () => {
    // 1. Kunci flag logout segera agar onAuthChange tidak membangkitkan profil lama
    isSigningOutRef.current = true;

    // 2. Bersihkan localStorage dan state profil segera sebelum await signOutUser
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    }
    setProfile(null);
    setProgress(null);
    setStatus('none');

    // 3. Putuskan sesi Firebase
    try {
      await signOutUser();
    } catch {
      // ignore
    } finally {
      // Pastikan flag bertahan agar event loop async Firebase tidak menduplikasi profile
      setTimeout(() => {
        isSigningOutRef.current = false;
      }, 1000);
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        status,
        profile,
        progress,
        signIn,
        signOut,
        syncFirebaseUser,
        refreshProgress,
        refresh: loadActiveProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export const DEFAULT_PROFILE_CONTEXT: ProfileContextValue = {
  status: 'none',
  profile: null,
  progress: null,
  signIn: async () => {
    throw new Error('signIn dipanggil di luar ProfileProvider');
  },
  signOut: async () => {},
  syncFirebaseUser: async () => {
    throw new Error('syncFirebaseUser dipanggil di luar ProfileProvider');
  },
  refreshProgress: async () => {},
  refresh: async () => {},
};

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    return DEFAULT_PROFILE_CONTEXT;
  }
  return ctx;
}

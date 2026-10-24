import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Profile, Progress } from './types';
import { getAllProfiles, getProfile, getProgress, saveProfile, saveProgress } from './db';
import { getStoredLocale } from '@/lib/i18n';

export type ProfileStatus = 'loading' | 'none' | 'ready';

export interface ProfileContextValue {
  status: ProfileStatus;
  profile: Profile | null;
  progress: Progress | null;
  signIn: (displayName: string) => Promise<Profile>;
  signOut: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export const ACTIVE_PROFILE_STORAGE_KEY = 'asiakin_active_profile_id';

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ProfileStatus>('loading');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);

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

      if (!active) {
        const all = await getAllProfiles();
        if (all.length > 0 && all[0]) {
          if (typeof window !== 'undefined') {
            localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, all[0].id);
          }
          active = all[0];
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
    void (async () => {
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

        if (!active) {
          const all = await getAllProfiles();
          if (all.length > 0 && all[0]) {
            if (typeof window !== 'undefined') {
              localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, all[0].id);
            }
            active = all[0];
          }
        }

        if (!mounted) return;

        if (active) {
          setProfile(active);
          const prog = await getProgress(active.id);
          if (!mounted) return;
          setProgress(prog ?? null);
          setStatus('ready');
        } else {
          setProfile(null);
          setProgress(null);
          setStatus('none');
        }
      } catch {
        if (mounted) {
          setStatus('none');
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async (displayName: string): Promise<Profile> => {
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    }
    setProfile(null);
    setProgress(null);
    setStatus('none');
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        status,
        profile,
        progress,
        signIn,
        signOut,
        refreshProgress,
        refresh: loadActiveProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return ctx;
}

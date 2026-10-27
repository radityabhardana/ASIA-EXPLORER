import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { isLengkapCountry } from '@/content/quests';
import { useI18n } from '@/lib/i18n';
import {
  ProfileProvider,
  useProfile,
  ACTIVE_PROFILE_STORAGE_KEY,
  ProfileContext,
} from './storage/ProfileContext';
import type { ProfileStatus, ProfileContextValue } from './storage/ProfileContext';

export { ProfileProvider, useProfile, ACTIVE_PROFILE_STORAGE_KEY, ProfileContext };
export type { ProfileStatus, ProfileContextValue };

export function RequireProfile({ children }: { children: React.ReactNode }) {
  const { status } = useProfile();
  const { t } = useI18n();

  if (status === 'loading') {
    return (
      <div className="dashboard-loading" role="status">
        <p className="dashboard-loading__text">{t('profile.loading')}</p>
      </div>
    );
  }

  if (status === 'none') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function RequireLengkap({ children }: { children: React.ReactNode }) {
  const { countryId } = useParams<{ countryId?: string }>();

  if (!countryId || !isLengkapCountry(countryId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

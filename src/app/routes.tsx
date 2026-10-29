import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import AuthPage from './pages/AuthPage';
import CountryPage from './pages/CountryPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LessonPage from './pages/LessonPage';
import QuestPage from './pages/QuestPage';
import QuestHubPage from './pages/QuestHubPage';
import QuestResultPage from './pages/QuestResultPage';
import ReviewPage from './pages/ReviewPage';
import MapPage from './pages/MapPage';
import ProfilePage from './pages/ProfilePage';
import CountryModulesPage from './pages/CountryModulesPage';
import SessionPage from './pages/SessionPage';
import { RequireLengkap, RequireProfile } from '@/lib/profile';

export const LANDING_PATH = '/';
export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
export const COUNTRY_PATH = '/negara/:id';
export const DASHBOARD_PATH = '/dashboard';
export const COUNTRY_MODULES_PATH = '/dashboard/negara';
export const LESSON_PATH = '/dashboard/pelajaran/:countryId/:step';
export const QUEST_PATH = '/dashboard/quest/:countryId';
export const QUEST_HUB_PATH = '/dashboard/quest';
export const QUEST_RESULT_PATH = '/dashboard/quest/:countryId/:attemptId';
export const SESSION_PATH = '/dashboard/session/:countryId';
export const REVIEW_PATH = '/dashboard/ulas';
export const SCENE_LAB_PATH = '/lab/scene';

/** Rute lab hanya ada di DEV; di build produksi cabang ini ter-eliminasi. */
const SceneLab = import.meta.env.DEV ? lazy(() => import('./pages/SceneLab')) : null;

/** Rute PRD v2.3 `/country/:id` hanya redirect (PRD v2.4 D38). */
function LegacyCountryRedirect() {
  const { id } = useParams();
  return <Navigate to={`/negara/${id ?? ''}`} replace />;
}

function LessonDefaultRedirect() {
  const { countryId } = useParams();
  return <Navigate to={`/dashboard/pelajaran/${countryId ?? ''}/kenali`} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Rute Auth */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage defaultTab="register" />} />

      {/* Rute Publik */}
      <Route path={LANDING_PATH} element={<LandingPage />} />
      <Route path="/en" element={<LandingPage />} />
      <Route path={COUNTRY_PATH} element={<CountryPage />} />
      <Route path="/en/negara/:id" element={<CountryPage />} />
      <Route path="/country/:id" element={<LegacyCountryRedirect />} />

      {/* Rute Dashboard & Belajar (Di bawah gerbang RequireProfile) */}
      <Route
        path={DASHBOARD_PATH}
        element={
          <RequireProfile>
            <DashboardPage />
          </RequireProfile>
        }
      />
      <Route
        path="/en/dashboard"
        element={
          <RequireProfile>
            <DashboardPage />
          </RequireProfile>
        }
      />

      {/* Modul Negara */}
      <Route
        path={COUNTRY_MODULES_PATH}
        element={
          <RequireProfile>
            <CountryModulesPage />
          </RequireProfile>
        }
      />
      <Route
        path="/dashboard/modul"
        element={<Navigate to={COUNTRY_MODULES_PATH} replace />}
      />
      <Route
        path="/en/dashboard/negara"
        element={
          <RequireProfile>
            <CountryModulesPage />
          </RequireProfile>
        }
      />

      {/* Pelajaran */}
      <Route
        path="/dashboard/pelajaran/:countryId"
        element={<LessonDefaultRedirect />}
      />
      <Route
        path={LESSON_PATH}
        element={
          <RequireProfile>
            <RequireLengkap>
              <LessonPage />
            </RequireLengkap>
          </RequireProfile>
        }
      />

      {/* Quest Hub */}
      <Route
        path={QUEST_HUB_PATH}
        element={
          <RequireProfile>
            <QuestHubPage />
          </RequireProfile>
        }
      />

      {/* Quest */}
      <Route
        path={QUEST_PATH}
        element={
          <RequireProfile>
            <RequireLengkap>
              <QuestPage />
            </RequireLengkap>
          </RequireProfile>
        }
      />

      {/* Hasil Quest (K21 deep link) */}
      <Route
        path={QUEST_RESULT_PATH}
        element={
          <RequireProfile>
            <QuestResultPage />
          </RequireProfile>
        }
      />

      {/* Sesi Interaktif (Story → Audio Quest → Build) */}
      <Route
        path={SESSION_PATH}
        element={
          <RequireProfile>
            <SessionPage />
          </RequireProfile>
        }
      />

      {/* Sesi Ulas Leitner */}
      <Route
        path={REVIEW_PATH}
        element={
          <RequireProfile>
            <ReviewPage />
          </RequireProfile>
        }
      />

      {/* Peta */}
      <Route
        path="/dashboard/peta"
        element={
          <RequireProfile>
            <MapPage />
          </RequireProfile>
        }
      />

      {/* Profil */}
      <Route
        path="/dashboard/profil"
        element={
          <RequireProfile>
            <ProfilePage />
          </RequireProfile>
        }
      />

      {SceneLab ? (
        <Route
          path={SCENE_LAB_PATH}
          element={
            <Suspense fallback={null}>
              <SceneLab />
            </Suspense>
          }
        />
      ) : null}

      <Route path="*" element={<Navigate to={LANDING_PATH} replace />} />
    </Routes>
  );
}

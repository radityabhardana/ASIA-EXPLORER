import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

import CountryPage from './pages/CountryPage';
import LandingPage from './pages/LandingPage';

export const LANDING_PATH = '/';
export const COUNTRY_PATH = '/negara/:id';
export const SCENE_LAB_PATH = '/lab/scene';

/** Rute lab hanya ada di DEV; di build produksi cabang ini ter-eliminasi. */
const SceneLab = import.meta.env.DEV ? lazy(() => import('./pages/SceneLab')) : null;

/** Rute PRD v2.3 `/country/:id` hanya redirect (PRD v2.4 D38). */
function LegacyCountryRedirect() {
  const { id } = useParams();
  return <Navigate to={`/negara/${id ?? ''}`} replace />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={LANDING_PATH} element={<LandingPage />} />
      <Route path={COUNTRY_PATH} element={<CountryPage />} />
      <Route path="/country/:id" element={<LegacyCountryRedirect />} />
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

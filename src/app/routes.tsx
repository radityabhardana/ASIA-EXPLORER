import { Navigate, Route, Routes } from 'react-router-dom';

import CountryPage from './pages/CountryPage';
import LandingPage from './pages/LandingPage';

export const LANDING_PATH = '/';
export const COUNTRY_PATH = '/negara/:id';

export function AppRoutes() {
  return (
    <Routes>
      <Route path={LANDING_PATH} element={<LandingPage />} />
      <Route path={COUNTRY_PATH} element={<CountryPage />} />
      <Route path="*" element={<Navigate to={LANDING_PATH} replace />} />
    </Routes>
  );
}

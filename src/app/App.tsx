import { BrowserRouter } from 'react-router-dom';

import '@/styles/shell.css';
import '@/styles/dashboard.css';
import Preloader from './Preloader';
import ScrollProgressBar from './ScrollProgressBar';
import { AppRoutes } from './routes';
import { ProfileProvider } from '@/lib/profile';
import ProfileDialog from './components/ProfileDialog';
import ScrollController from './components/ScrollController';

export const APP_ROOT_ID = 'app-root';

// Cegah konflik scroll restoration otomatis browser dengan Lenis/ScrollTrigger
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default function App() {
  return (
    <div id={APP_ROOT_ID} className="app-shell">
      <Preloader />
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>
      <ScrollProgressBar />
      <BrowserRouter>
        <ScrollController />
        <ProfileProvider>
          <main id="konten" className="app-main" tabIndex={-1}>
            <AppRoutes />
          </main>
          <ProfileDialog />
        </ProfileProvider>
      </BrowserRouter>
    </div>
  );
}

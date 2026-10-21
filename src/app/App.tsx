import { BrowserRouter } from 'react-router-dom';

import '@/styles/shell.css';
import Preloader from './Preloader';
import ScrollProgressBar from './ScrollProgressBar';
import { AppRoutes } from './routes';

export const APP_ROOT_ID = 'app-root';

export default function App() {
  return (
    <div id={APP_ROOT_ID} className="app-shell">
      <Preloader />
      <a className="skip-link" href="#konten">
        Lewati ke konten
      </a>
      <ScrollProgressBar />
      <BrowserRouter>
        <main id="konten" className="app-main" tabIndex={-1}>
          <AppRoutes />
        </main>
      </BrowserRouter>
    </div>
  );
}

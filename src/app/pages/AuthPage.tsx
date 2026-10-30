import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Compass } from 'lucide-react';
import { signInWithEmail, registerWithEmail, signInWithGoogle } from '@/lib/auth';
import { useProfile } from '@/lib/profile';
import AuthInteractiveMap from '@/app/components/AuthInteractiveMap';
import '@/styles/auth.css';

interface AuthPageProps {
  defaultTab?: 'login' | 'register';
}

export default function AuthPage({ defaultTab = 'login' }: AuthPageProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const navigate = useNavigate();
  const { status, profile, syncFirebaseUser } = useProfile();

  // Sinkronisasi tab saat prop defaultTab berubah (misal saat berganti rute /login <-> /register)
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  // Jika user sudah terautentikasi dan profil siap, langsung arahkan ke Dashboard
  useEffect(() => {
    if (status === 'ready' && profile) {
      navigate('/dashboard', { replace: true });
    }
  }, [status, profile, navigate]);

  return (
    <div className="auth-page">
      {/* ── Panel Visual: Carousel Potongan Peta Negara ── */}
      <div className="auth-visual">
        <AuthInteractiveMap />
      </div>

      {/* ── Panel Formulir: Masuk Sesi / Buat Profil ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-header-wrap">
            <div className="auth-logo-badge">
              <Compass size={20} className="auth-logo-icon" aria-hidden="true" />
              <span>Asia Explorer</span>
            </div>
            <h1 className="auth-logo">
              {tab === 'login' ? 'Masuk ke Studio' : 'Daftar Pengelana'}
            </h1>
            <p className="auth-subtitle">
              {tab === 'login'
                ? 'Lanjutkan penjelajahan aksara, etiket budaya, dan petualangan cerita Asia Anda.'
                : 'Mulai perjalanan budaya interaktif Anda dan simpan pencapaian eksplorasi.'}
            </p>
          </div>

          {/* Switcher Tab Masuk / Buat Profil */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`}
              onClick={() => setTab('login')}
            >
              Masuk Sesi
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'register'}
              className={`auth-tab${tab === 'register' ? ' auth-tab--active' : ''}`}
              onClick={() => setTab('register')}
            >
              Buat Profil
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm syncProfile={syncFirebaseUser} />
          ) : (
            <RegisterForm syncProfile={syncFirebaseUser} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Form Masuk (Login) ─────────────────────────────────────────────────── */
interface FormProps {
  syncProfile?: (user: import('@/lib/auth').FirebaseUser) => Promise<import('@/lib/storage/types').Profile>;
}

function LoginForm({ syncProfile }: FormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const user = await signInWithEmail(email, password);
        if (syncProfile) {
          await syncProfile(user);
        }
        navigate('/dashboard', { replace: true });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal masuk. Periksa email & password Anda.');
      } finally {
        setLoading(false);
      }
    },
    [email, password, syncProfile, navigate]
  );

  const handleGoogle = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (syncProfile) {
        await syncProfile(user);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal masuk dengan Google.');
      setLoading(false);
    }
  }, [syncProfile, navigate]);

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          className="auth-input"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="login-password">Password</label>
        <div className="auth-input-password-wrap">
          <input
            id="login-password"
            type={showPw ? 'text' : 'password'}
            className="auth-input auth-input--password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-pw-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? 'Memproses Sesi...' : 'Masuk ke Studio'}
      </button>

      <div className="auth-divider">atau</div>

      <button type="button" className="auth-btn-google" onClick={handleGoogle} disabled={loading}>
        <GoogleIcon />
        Masuk dengan Google
      </button>
    </form>
  );
}

/* ── Form Registrasi (Register) ─────────────────────────────────────────── */
function RegisterForm({ syncProfile }: FormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);
      try {
        const user = await registerWithEmail(name, email, password);
        if (syncProfile) {
          await syncProfile(user);
        }
        navigate('/dashboard', { replace: true });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Gagal mendaftar. Coba lagi.');
      } finally {
        setLoading(false);
      }
    },
    [name, email, password, syncProfile, navigate]
  );

  const handleGoogle = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      if (syncProfile) {
        await syncProfile(user);
      }
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar dengan Google.');
      setLoading(false);
    }
  }, [syncProfile, navigate]);

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-name">Nama Panggilan</label>
        <input
          id="reg-name"
          type="text"
          className="auth-input"
          placeholder="mis. Budi Santoso"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-email">Email</label>
        <input
          id="reg-email"
          type="email"
          className="auth-input"
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-password">Password</label>
        <div className="auth-input-password-wrap">
          <input
            id="reg-password"
            type={showPw ? 'text' : 'password'}
            className="auth-input auth-input--password"
            placeholder="Min. 6 karakter"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="auth-pw-toggle"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? 'Membuat Profil...' : 'Daftar & Mulai Eksplorasi'}
      </button>

      <div className="auth-divider">atau</div>

      <button type="button" className="auth-btn-google" onClick={handleGoogle} disabled={loading}>
        <GoogleIcon />
        Daftar dengan Google
      </button>
    </form>
  );
}

/* ── Ikon Google SVG ─────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

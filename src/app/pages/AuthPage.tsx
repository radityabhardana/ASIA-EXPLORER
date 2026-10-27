import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmail, registerWithEmail, signInWithGoogle } from '@/lib/auth';
import '@/styles/auth.css';

interface Slide {
  country: string;
  tagline: string;
  emoji: string;
  color: string;
}

const slides: Slide[] = [
  { country: 'Jepang', tagline: 'Pelajari Aksara Hiragana', emoji: '🗾', color: '#c0392b' },
  { country: 'Korea', tagline: 'Kenali Budaya Hangul', emoji: '🇰🇷', color: '#2c3e50' },
  { country: 'Indonesia', tagline: 'Jelajahi Nusantara', emoji: '🏝️', color: '#27ae60' },
  { country: 'India', tagline: 'Temukan Aksara Devanagari', emoji: '🕌', color: '#e67e22' },
  { country: 'Arab Saudi', tagline: 'Kuasai Huruf Arab', emoji: '🌙', color: '#8e44ad' },
];

interface AuthPageProps {
  defaultTab?: 'login' | 'register';
}

export default function AuthPage({ defaultTab = 'login' }: AuthPageProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);

  // Slide auto-rotate
  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // Sync tab with defaultTab prop changes (e.g. route change)
  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="auth-page">
      {/* ── Visual panel ── */}
      <div className="auth-visual">
        {slides.map((slide, i) => (
          <div
            key={slide.country}
            className={`auth-slide${i === activeSlide ? ' auth-slide--active' : ''}`}
          >
            <span className="auth-slide__emoji">{slide.emoji}</span>
            <p className="auth-slide__country">{slide.country}</p>
            <p className="auth-slide__tagline">{slide.tagline}</p>
            <span className="auth-slide__accent" style={{ background: slide.color }} />
          </div>
        ))}
        <div className="auth-dots" role="tablist" aria-label="Slide navigation">
          {slides.map((slide, i) => (
            <button
              key={slide.country}
              className={`auth-dot${i === activeSlide ? ' auth-dot--active' : ''}`}
              onClick={() => setActiveSlide(i)}
              aria-label={`Slide ${slide.country}`}
              aria-selected={i === activeSlide}
              role="tab"
            />
          ))}
        </div>
      </div>

      {/* ── Form panel ── */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <div className="auth-logo">
            Asia<span>Explorer</span>
          </div>

          <div className="auth-tabs" role="tablist">
            <button
              className={`auth-tab${tab === 'login' ? ' auth-tab--active' : ''}`}
              onClick={() => setTab('login')}
              role="tab"
              aria-selected={tab === 'login'}
            >
              Masuk
            </button>
            <button
              className={`auth-tab${tab === 'register' ? ' auth-tab--active' : ''}`}
              onClick={() => setTab('register')}
              role="tab"
              aria-selected={tab === 'register'}
            >
              Daftar
            </button>
          </div>

          {tab === 'login' ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    </div>
  );
}

/* ── Login form ──────────────────────────────────────────────────────────── */
function LoginForm() {
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
        await signInWithEmail(email, password);
        navigate('/dashboard');
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    },
    [email, password, navigate],
  );

  const handleGoogle = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          className="auth-input"
          placeholder="kamu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="login-password">Password</label>
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
          {showPw ? '🙈' : '👁️'}
        </button>
      </div>

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? 'Masuk...' : 'Masuk'}
      </button>

      <div className="auth-divider">atau</div>

      <button type="button" className="auth-btn-google" onClick={handleGoogle} disabled={loading}>
        <GoogleIcon />
        Masuk dengan Google
      </button>
    </form>
  );
}

/* ── Register form ───────────────────────────────────────────────────────── */
function RegisterForm() {
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
        await registerWithEmail(name, email, password);
        navigate('/dashboard');
      } catch (err) {
        setError(friendlyError(err));
      } finally {
        setLoading(false);
      }
    },
    [name, email, password, navigate],
  );

  const handleGoogle = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <div className="auth-error" role="alert">{error}</div>}

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-name">Nama</label>
        <input
          id="reg-name"
          type="text"
          className="auth-input"
          placeholder="Nama kamu"
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
          placeholder="kamu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label className="auth-label" htmlFor="reg-password">Password</label>
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
          {showPw ? '🙈' : '👁️'}
        </button>
      </div>

      <button type="submit" className="auth-btn" disabled={loading}>
        {loading ? 'Mendaftar...' : 'Daftar'}
      </button>

      <div className="auth-divider">atau</div>

      <button type="button" className="auth-btn-google" onClick={handleGoogle} disabled={loading}>
        <GoogleIcon />
        Daftar dengan Google
      </button>
    </form>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function friendlyError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message;
    if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
      return 'Email atau password salah.';
    }
    if (msg.includes('email-already-in-use')) {
      return 'Email sudah terdaftar. Coba masuk.';
    }
    if (msg.includes('weak-password')) {
      return 'Password terlalu lemah. Gunakan minimal 6 karakter.';
    }
    if (msg.includes('invalid-email')) {
      return 'Format email tidak valid.';
    }
    if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
      return 'Login dibatalkan.';
    }
    if (msg.includes('network-request-failed')) {
      return 'Gagal terhubung. Periksa koneksi internet kamu.';
    }
  }
  return 'Terjadi kesalahan. Coba lagi.';
}

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  Globe,
  Swords,
  Layers,
  Map,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { getLevelInfo, getXPProgress } from '@/lib/xp';
import '@/styles/dashboard-sidebar.css';

interface DashboardSidebarProps {
  profile: { displayName: string; id: string } | null;
  totalXP: number;
  streakDays: number;
  onSignOut: () => void | Promise<void>;
}

const NAV_ITEMS = [
  { icon: Compass, label: 'Beranda', to: '/dashboard' },
  { icon: Globe, label: 'Modul Negara', to: '/dashboard/negara' },
  { icon: Swords, label: 'Quest Budaya', to: '/dashboard/quest' },
  { icon: Layers, label: 'Ulasan Frasa', to: '/dashboard/ulas' },
  { icon: Map, label: 'Peta Interaktif', to: '/dashboard/peta' },
  { icon: User, label: 'Profil & DNA', to: '/dashboard/profil' },
] as const;

function getAvatarColor(name: string): string {
  const colors = [
    '#176b68', // Jade
    '#c05c46', // Terracotta
    '#2c5282', // Sapphire
    '#7b341e', // Umber
    '#4a5568', // Slate
    '#285e61', // Deep Teal
    '#744210', // Ochre
    '#6b46c1', // Plum
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return colors[hash % colors.length]!;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.slice(0, 2) ?? '??').toUpperCase();
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase();
}

export default function DashboardSidebar({
  profile,
  totalXP,
  streakDays: _streakDays,
  onSignOut,
}: DashboardSidebarProps) {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOutClick = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await onSignOut();
    } catch (err) {
      console.error('Gagal keluar sesi:', err);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // Close mobile drawer whenever location changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname, hash]);

  const levelInfo = getLevelInfo(totalXP);
  const progress = getXPProgress(totalXP);

  const displayName = profile?.displayName ?? 'Penjelajah';
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  const xpInLevel = totalXP - levelInfo.xpRequired;
  const xpNeeded = levelInfo.xpNext - levelInfo.xpRequired;

  return (
    <>
      {/* Mobile Top Header Bar (only visible on <= 900px) */}
      <header className="dsidebar-mobile-bar" role="banner">
        <button
          type="button"
          className="dsidebar-mobile-toggle"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? 'Tutup navigasi' : 'Buka navigasi'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="dsidebar-mobile-brand">
          <span className="dsidebar__brand-name">Asia Explorer</span>
          <span className="dsidebar__brand-badge">STUDIO</span>
        </Link>

        <div className="dsidebar-mobile-user">
          <div
            className="dsidebar__avatar dsidebar__avatar--small"
            style={{ backgroundColor: avatarColor }}
            aria-hidden="true"
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          className="dsidebar-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Desktop fixed sidebar, Mobile slide-in drawer) */}
      <aside
        className={`dsidebar ${isOpen ? 'dsidebar--open' : ''}`}
        aria-label="Navigasi utama"
      >
        {/* Brand Header */}
        <div className="dsidebar__brand">
          <Link to="/" className="dsidebar__brand-link" title="Kembali ke Beranda">
            <span className="dsidebar__brand-name">Asia Explorer</span>
            <span className="dsidebar__brand-badge">STUDIO</span>
          </Link>
          <button
            type="button"
            className="dsidebar-mobile-close"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup menu navigasi"
          >
            <X size={18} />
          </button>
        </div>

      {/* User Identity Card */}
      <div className="dsidebar__profile-card">
        <div className="dsidebar__profile-top">
          <div
            className="dsidebar__avatar"
            style={{ backgroundColor: avatarColor }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="dsidebar__profile-info">
            <span className="dsidebar__name" title={displayName}>
              {displayName}
            </span>
            <span className="dsidebar__level-pill">
              <Sparkles size={11} className="dsidebar__level-icon" />
              Lv.{levelInfo.level} {levelInfo.name}
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="dsidebar__xp-section">
          <div className="dsidebar__xp-label">
            <span>Kemajuan Level</span>
            <span className="dsidebar__xp-value">
              {levelInfo.level < 7
                ? `${xpInLevel} / ${xpNeeded} XP`
                : `${totalXP} XP (Maksimal)`}
            </span>
          </div>
          <div
            className="dsidebar__xp-bar"
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Kemajuan XP level"
          >
            <div
              className="dsidebar__xp-bar-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="dsidebar__nav" aria-label="Menu navigasi">
        <div className="dsidebar__nav-section-title">Navigasi</div>
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => {
          let isActive = false;
          if (to === '/dashboard') {
            isActive = pathname === '/dashboard' && !hash;
          } else if (to === '/dashboard/negara') {
            isActive = pathname === '/dashboard/negara' || (pathname === '/dashboard' && hash === '#negara');
          } else {
            isActive = pathname.startsWith(to);
          }

          return (
            <Link
              key={label}
              to={to}
              className={`dsidebar__nav-link${isActive ? ' dsidebar__nav-link--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="dsidebar__nav-icon-wrap" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="dsidebar__nav-text">{label}</span>
              {isActive && <span className="dsidebar__nav-indicator" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Sign Out */}
      <div className="dsidebar__footer">
        <button
          className="dsidebar__signout"
          onClick={handleSignOutClick}
          type="button"
          disabled={isSigningOut}
          aria-label="Keluar dari sesi"
        >
          <span className="dsidebar__nav-icon-wrap" aria-hidden="true">
            <LogOut size={17} strokeWidth={1.8} />
          </span>
          <span>{isSigningOut ? 'Keluar...' : 'Keluar Sesi'}</span>
        </button>
      </div>
      </aside>
    </>
  );
}

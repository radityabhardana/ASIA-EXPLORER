import { Link, useLocation } from 'react-router-dom';
import { getLevelInfo, getXPProgress } from '@/lib/xp';
import '@/styles/dashboard-sidebar.css';

interface DashboardSidebarProps {
  profile: { displayName: string; id: string } | null;
  totalXP: number;
  streakDays: number;
  onSignOut: () => void;
}

const NAV_ITEMS = [
  { icon: '🏠', label: 'Beranda', to: '/dashboard' },
  { icon: '🌏', label: 'Negara', to: '/dashboard' },
  { icon: '⚔️', label: 'Quest', to: '/dashboard' },
  { icon: '🔄', label: 'Ulasan', to: '/dashboard/ulas' },
  { icon: '🗺️', label: 'Peta', to: '/dashboard/peta' },
  { icon: '👤', label: 'Profil', to: '/dashboard/profil' },
] as const;

function getAvatarColor(name: string): string {
  const colors = [
    '#7c3aed', '#2563eb', '#059669', '#dc2626',
    '#d97706', '#0891b2', '#be185d', '#65a30d',
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
  const { pathname } = useLocation();
  const levelInfo = getLevelInfo(totalXP);
  const progress = getXPProgress(totalXP);

  const displayName = profile?.displayName ?? 'Pengguna';
  const initials = getInitials(displayName);
  const avatarColor = getAvatarColor(displayName);

  const xpInLevel = totalXP - levelInfo.xpRequired;
  const xpNeeded = levelInfo.xpNext - levelInfo.xpRequired;

  return (
    <nav className="dsidebar" aria-label="Navigasi utama">
      <div className="dsidebar__header">
        <div
          className="dsidebar__avatar"
          style={{ backgroundColor: avatarColor }}
          aria-hidden="true"
        >
          {initials}
        </div>
        <span className="dsidebar__name" title={displayName}>{displayName}</span>
        <span className="dsidebar__level">Lv.{levelInfo.level} {levelInfo.name}</span>

        <div className="dsidebar__xp-section">
          <div className="dsidebar__xp-label">
            <span>XP</span>
            <span>
              {levelInfo.level < 7
                ? `${xpInLevel} / ${xpNeeded} XP`
                : `${totalXP} XP (Max)`}
            </span>
          </div>
          <div className="dsidebar__xp-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="dsidebar__xp-bar-fill"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="dsidebar__nav">
        {NAV_ITEMS.map(({ icon, label, to }) => {
          const isActive = to === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(to);
          return (
            <Link
              key={label}
              to={to}
              className={`dsidebar__nav-link${isActive ? ' dsidebar__nav-link--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="dsidebar__nav-icon">{icon}</span>
              {label}
            </Link>
          );
        })}
      </div>

      <div className="dsidebar__footer">
        <button className="dsidebar__signout" onClick={onSignOut} type="button">
          <span className="dsidebar__nav-icon">🚪</span>
          Keluar
        </button>
      </div>
    </nav>
  );
}

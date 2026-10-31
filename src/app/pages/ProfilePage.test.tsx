import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProfilePage from './ProfilePage';

vi.mock('@/lib/profile', () => ({
  useProfile: () => ({
    profile: {
      id: 'test-user-profile-id',
      displayName: 'Penjelajah Nusantara',
      role: 'explorer',
    },
    signOut: vi.fn(),
  }),
}));

vi.mock('@/lib/storage/db', () => ({
  getAttemptsByProfile: vi.fn().mockResolvedValue([]),
  getLessonsByProfile: vi.fn().mockResolvedValue([]),
  getReviewsByProfile: vi.fn().mockResolvedValue([]),
}));

describe('ProfilePage Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders profile page with user identity, stats ribbon, and DNA analysis', async () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    // Header and title (awaiting async load)
    expect(await screen.findByText('Profil Penjelajah & Rekam Jejak')).toBeInTheDocument();
    expect(screen.getByText('IDENTITAS & STATISTIK')).toBeInTheDocument();

    // User name in banner and sidebar
    expect(screen.getAllByText('Penjelajah Nusantara').length).toBeGreaterThanOrEqual(1);

    // Stats ribbon items
    expect(screen.getByText('Akumulasi XP')).toBeInTheDocument();
    expect(screen.getByText('Streak Harian')).toBeInTheDocument();
    expect(screen.getByText('Modul Selesai')).toBeInTheDocument();
    expect(screen.getByText('Memori Frasa')).toBeInTheDocument();

    // Learning DNA section
    expect(screen.getByText('Analisis Dimensi Kognitif (Learning DNA)')).toBeInTheDocument();
  });
});

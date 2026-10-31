import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuestHubPage from './QuestHubPage';

vi.mock('@/lib/profile', () => ({
  useProfile: () => ({
    profile: {
      id: 'test-user-hub',
      name: 'Penjelajah Asia',
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

describe('QuestHubPage Cultural Adventure Catalog', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders catalog header with interactive RPG title and badges', async () => {
    render(
      <MemoryRouter>
        <QuestHubPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Katalog Petualangan Budaya & Etiket/i)).toBeInTheDocument();
    expect(screen.getByText(/PETUALANGAN BUDAYA INTERAKTIF/i)).toBeInTheDocument();
    expect(screen.getByText(/dari 48 Petualangan Diselesaikan/i)).toBeInTheDocument();
  });

  it(
    'renders quest cards for Japan, Thailand, and stub countries with NPC details',
    async () => {
    render(
      <MemoryRouter>
        <QuestHubPage />
      </MemoryRouter>,
    );

    // Japan quest
    expect(screen.getByText('Undangan Makan Malam Pak Tanaka')).toBeInTheDocument();
    expect(screen.getByText('Pak Tanaka')).toBeInTheDocument();
    expect(screen.getByText('Tuan Rumah Tradisional')).toBeInTheDocument();

    // Thailand quest
    expect(screen.getByText('Hangatnya Jamuan Mae Somchai')).toBeInTheDocument();
    expect(screen.getByText('Mae Somchai')).toBeInTheDocument();

    // Check action buttons exist
    const playButtons = screen.getAllByRole('link', { name: /Mulai Petualangan/i });
    expect(playButtons.length).toBe(48);
  }, 15000);
});

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import QuestPage from './QuestPage';

vi.mock('@/lib/profile', () => ({
  useProfile: () => ({
    profile: {
      id: 'test-user-1',
      name: 'Petualang Asia',
      role: 'explorer',
    },
    signOut: vi.fn(),
  }),
}));

vi.mock('@/lib/storage/db', () => ({
  getLesson: vi.fn().mockResolvedValue(null),
  saveLesson: vi.fn().mockResolvedValue(undefined),
  getProgress: vi.fn().mockResolvedValue(null),
  saveProgress: vi.fn().mockResolvedValue(undefined),
  saveAttempt: vi.fn().mockResolvedValue(undefined),
}));

describe('QuestPage Visual Novel Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Japan story quest intro and navigates to packing screen on /dashboard/quest/jp', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/quest/jp']}>
        <Routes>
          <Route path="/dashboard/quest/:countryId" element={<QuestPage />} />
          <Route path="/dashboard/quest" element={<div>Quest Hub Catalog</div>} />
        </Routes>
      </MemoryRouter>,
    );

    // Initial Intro Screen
    expect(screen.getByText(/Undangan Makan Malam Pak Tanaka/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Pak Tanaka/i).length).toBeGreaterThan(0);

    // Click to start packing
    const introStartBtn = screen.getByRole('button', { name: /Mulai Petualangan & Siapkan Bekal/i });
    fireEvent.click(introStartBtn);

    // Now in Packing Screen
    expect(screen.getByText(/Pilih 2 Bekal Petualangan/i)).toBeInTheDocument();
    expect(screen.getByText(/Oleh-oleh Khas \(Omiyage\)/i)).toBeInTheDocument();
  });

  it('transitions from intro to packing and then to first scene upon selecting 2 items', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/quest/jp']}>
        <Routes>
          <Route path="/dashboard/quest/:countryId" element={<QuestPage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Advance from intro to packing
    const introStartBtn = screen.getByRole('button', { name: /Mulai Petualangan & Siapkan Bekal/i });
    fireEvent.click(introStartBtn);

    // Click 2 items
    const omiyageBtn = screen.getByRole('button', { name: /Oleh-oleh Khas \(Omiyage\)/i });
    const socksBtn = screen.getByRole('button', { name: /Kaus Kaki Putih Bersih/i });
    fireEvent.click(omiyageBtn);
    fireEvent.click(socksBtn);

    // Click Mulai Petualangan
    const startBtn = screen.getByRole('button', { name: /Mulai Petualangan/i });
    expect(startBtn).not.toBeDisabled();
    fireEvent.click(startBtn);

    // Verify Scene 1 (Genkan) is now active
    expect(screen.getByText(/Pintu Masuk Tradisional \(Genkan\)/i)).toBeInTheDocument();
    expect(screen.getByText(/RASA HORMAT/i)).toBeInTheDocument();
    // Choice list is available
    expect(screen.getByText(/Lepas sepatu di undakan bawah/i)).toBeInTheDocument();
  });

  it('redirects to /dashboard/quest if countryId is invalid', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/quest/invalid-code']}>
        <Routes>
          <Route path="/dashboard/quest/:countryId" element={<QuestPage />} />
          <Route path="/dashboard/quest" element={<div>Quest Hub Catalog</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Quest Hub Catalog')).toBeInTheDocument();
  });
});

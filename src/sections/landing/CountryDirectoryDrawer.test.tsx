import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import Navbar from '@/app/Navbar';
import { ProfileProvider } from '@/lib/profile';
import * as speech from '@/lib/speech';
import CountryDirectoryDrawer from './CountryDirectoryDrawer';

describe('CountryDirectoryDrawer (Atlas Direktori 48 Bangsa)', () => {
  afterEach(() => {
    cleanup();
  });

  it('merender semua 48 kartu negara dan 5 kawasan saat terbuka', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CountryDirectoryDrawer open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const cards = screen.getAllByRole('article');
    expect(cards.length).toBe(48);

    // Verifikasi 5 heading kawasan tampil
    expect(screen.getByRole('heading', { name: 'Asia Tenggara' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Asia Timur' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Asia Selatan' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Asia Barat' })).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Asia Tengah' })).toBeDefined();
  }, 15000);

  it('memfilter negara secara instan melalui kolom pencarian', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CountryDirectoryDrawer open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const searchInput = screen.getByPlaceholderText(/Cari negara, ibu kota/i);
    fireEvent.change(searchInput, { target: { value: 'Uzbekistan' } });

    const filteredCards = screen.getAllByRole('article');
    expect(filteredCards.length).toBe(1);
    expect(screen.getByText('Tashkent')).toBeDefined();
  });

  it('memfilter negara berdasarkan pil kawasan', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CountryDirectoryDrawer open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    // Klik tab Asia Timur (5 negara)
    const eastAsiaBtn = screen.getByRole('button', { name: /Asia Timur/i });
    fireEvent.click(eastAsiaBtn);

    const eastAsiaCards = screen.getAllByRole('article');
    expect(eastAsiaCards.length).toBe(5);
  });

  it('memanggil onClose saat tombol tutup atau Escape ditekan', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CountryDirectoryDrawer open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const closeBtn = screen.getByLabelText(/Tutup direktori bangsa/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('memuat tautan langsung ke rute /negara/:id untuk setiap negara', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CountryDirectoryDrawer open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const indonesiaLink = screen.getByLabelText(/Telusuri Profil: Indonesia/i);
    expect(indonesiaLink.getAttribute('href')).toBe('/negara/id');
  });

  it('merender tombol audio sapaan (.country-dir-card__audio-btn) pada setiap kartu', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <CountryDirectoryDrawer open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const audioButtons = container.querySelectorAll('.country-dir-card__audio-btn');
    expect(audioButtons.length).toBe(48);
  });

  it('memutar sapaan asli saat tombol audio sapaan diklik tanpa menutup drawer', () => {
    const speakSpy = vi.spyOn(speech, 'speak').mockImplementation((_text, options) => {
      options?.onEnd?.();
      return true;
    });
    const handleClose = vi.fn();
    const handleSelect = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <CountryDirectoryDrawer
          open={true}
          onClose={handleClose}
          onSelectCountry={handleSelect}
        />
      </MemoryRouter>,
    );

    const firstAudioBtn = container.querySelector('.country-dir-card__audio-btn') as HTMLButtonElement;
    expect(firstAudioBtn).not.toBeNull();

    fireEvent.click(firstAudioBtn);

    expect(speakSpy).toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
    expect(handleSelect).not.toHaveBeenCalled();
    speakSpy.mockRestore();
  });
});

describe('Navbar Navigasi Sinkron & Trigger Atlas', () => {
  afterEach(() => {
    cleanup();
  });

  it('memiliki link Jelajah (#peta), Kawasan (#kawasan), Etiket (#etiket), dan Dashboard (/dashboard)', () => {
    render(
      <MemoryRouter>
        <ProfileProvider>
          <Navbar />
        </ProfileProvider>
      </MemoryRouter>,
    );

    const petaLinks = screen.getAllByRole('link', { name: 'Jelajah' });
    expect(petaLinks[0]?.getAttribute('href')).toBe('#peta');

    const kawasanLinks = screen.getAllByRole('link', { name: 'Kawasan' });
    expect(kawasanLinks[0]?.getAttribute('href')).toBe('#kawasan');

    const etiketLinks = screen.getAllByRole('link', { name: 'Etiket' });
    expect(etiketLinks[0]?.getAttribute('href')).toBe('#etiket');

    const dashboardLinks = screen.getAllByRole('link', { name: 'Dashboard' });
    expect(dashboardLinks[0]?.getAttribute('href')).toBe('/dashboard');
  });

  it('memanggil onOpenCountryDirectory saat tombol 48 Negara diklik', () => {
    const handleOpenDir = vi.fn();
    render(
      <MemoryRouter>
        <ProfileProvider>
          <Navbar onOpenCountryDirectory={handleOpenDir} />
        </ProfileProvider>
      </MemoryRouter>,
    );

    const atlasBtn = screen.getByRole('button', { name: /Buka Direktori Atlas 48 Bangsa/i });
    expect(atlasBtn).toBeDefined();
    fireEvent.click(atlasBtn);
    expect(handleOpenDir).toHaveBeenCalledTimes(1);
  });
});

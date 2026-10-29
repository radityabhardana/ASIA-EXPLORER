import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import CulturalComparisonMatrix from './CulturalComparisonMatrix';

describe('CulturalComparisonMatrix Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('does not render when open is false', () => {
    const { container } = render(
      <MemoryRouter>
        <CulturalComparisonMatrix open={false} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(container.querySelector('.cultural-matrix-root')).toBeNull();
  });

  it('renders with 4 curated presets when open is true', () => {
    render(
      <MemoryRouter>
        <CulturalComparisonMatrix open={true} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByText('Matriks Komparasi Budaya')).toBeDefined();

    // 4 Curated presets
    expect(screen.getByText('Jepang vs Korea Selatan')).toBeDefined();
    expect(screen.getByText('Indonesia vs Malaysia')).toBeDefined();
    expect(screen.getByText('Arab Saudi vs Iran')).toBeDefined();
    expect(screen.getByText('Turki vs Kazakhstan')).toBeDefined();
  });

  it('switches to Indonesia vs Malaysia when preset is clicked', () => {
    render(
      <MemoryRouter>
        <CulturalComparisonMatrix open={true} onClose={vi.fn()} />
      </MemoryRouter>,
    );

    const idMyBtn = screen.getByRole('button', { name: /Indonesia vs Malaysia/i });
    fireEvent.click(idMyBtn);

    // Verify presence of Indonesia and Malaysia in titles and content
    expect(screen.getAllByText('Indonesia').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Malaysia').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Gotong Royong/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Budi Pekerti/i).length).toBeGreaterThan(0);
  });

  it('swaps countries when swap button is clicked', () => {
    render(
      <MemoryRouter>
        <CulturalComparisonMatrix
          open={true}
          onClose={vi.fn()}
          initialCountryA="jp"
          initialCountryB="kr"
        />
      </MemoryRouter>,
    );

    const selectA = screen.getByLabelText(/Pilih Bangsa Pertama/i) as HTMLSelectElement;
    const selectB = screen.getByLabelText(/Pilih Bangsa Kedua/i) as HTMLSelectElement;

    expect(selectA.value).toBe('jp');
    expect(selectB.value).toBe('kr');

    const swapBtn = screen.getByLabelText(/Tukar posisi kedua bangsa/i);
    fireEvent.click(swapBtn);

    expect(selectA.value).toBe('kr');
    expect(selectB.value).toBe('jp');
  });

  it('calls onClose when close button is clicked or Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <CulturalComparisonMatrix open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const closeBtn = screen.getByLabelText(/Tutup matriks komparasi budaya/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('renders CTAs to open complete country dossiers', () => {
    render(
      <MemoryRouter>
        <CulturalComparisonMatrix
          open={true}
          onClose={vi.fn()}
          initialCountryA="id"
          initialCountryB="my"
        />
      </MemoryRouter>,
    );

    const ctaId = screen.getByRole('link', { name: /Buka Lembar Lengkap Indonesia/i });
    expect(ctaId.getAttribute('href')).toBe('/negara/id');

    const ctaMy = screen.getByRole('link', { name: /Buka Lembar Lengkap Malaysia/i });
    expect(ctaMy.getAttribute('href')).toBe('/negara/my');
  });
});

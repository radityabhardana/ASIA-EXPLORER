import { createElement } from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import App, { APP_ROOT_ID } from '@/app/App';

describe('fondasi aplikasi', () => {
  // Tanpa `globals: true`, Testing Library tidak memasang auto-cleanup; DOM
  // akan menumpuk antar test dan query tunggal gagal karena duplikat.
  afterEach(cleanup);

  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('merender wadah aplikasi dengan id yang stabil', () => {
    render(createElement(App));

    expect(APP_ROOT_ID).toBe('app-root');
    expect(document.getElementById(APP_ROOT_ID)).toBeInTheDocument();
  });

  it('menyediakan skip-link, main#konten, dan progress bar dekoratif', () => {
    render(createElement(App));

    expect(
      screen.getByRole('link', { name: 'Lewati ke konten' }),
    ).toHaveAttribute('href', '#konten');
    expect(document.getElementById('konten')?.tagName).toBe('MAIN');

    const progressBar = document.querySelector('.scroll-progress');
    expect(progressBar).not.toBeNull();
    expect(progressBar).toHaveAttribute('aria-hidden', 'true');

    // Larang header dan nav fixed (navbar K10 adalah absolute, bukan sticky/fixed).
    const navs = screen.queryAllByRole('navigation');
    for (const nav of navs) {
      const computed = getComputedStyle(nav);
      expect(computed.position).not.toBe('fixed');
    }
    const banner = screen.queryByRole('banner');
    if (banner) {
      const computed = getComputedStyle(banner);
      expect(computed.position).not.toBe('fixed');
    }
  });

  it('rute tidak dikenal dialihkan ke beranda', async () => {
    window.history.pushState({}, '', '/rute-tidak-ada');
    render(createElement(App));

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/');
  });

  it('deep link /negara/jp menampilkan nama negara dalam bahasa Indonesia', async () => {
    window.history.pushState({}, '', '/negara/jp');
    render(createElement(App));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Jepang' }),
    ).toBeInTheDocument();
  });

  it('id negara yang tidak dikenal menampilkan status tidak ditemukan', async () => {
    window.history.pushState({}, '', '/negara/atlantis');
    render(createElement(App));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Negara tidak ditemukan' }),
    ).toBeInTheDocument();
  });
});

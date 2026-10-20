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

    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('rute tidak dikenal dialihkan ke beranda', async () => {
    window.history.pushState({}, '', '/rute-tidak-ada');
    render(createElement(App));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'ASIAKIN' }),
    ).toBeInTheDocument();
  });

  it('deep link /negara/jp menampilkan nama negara dalam bahasa Indonesia', async () => {
    window.history.pushState({}, '', '/negara/jp');
    render(createElement(App));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Jepang' }),
    ).toBeInTheDocument();
  });

  it('id negara yang tidak dikenal dikembalikan ke beranda', async () => {
    window.history.pushState({}, '', '/negara/atlantis');
    render(createElement(App));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'ASIAKIN' }),
    ).toBeInTheDocument();
  });
});

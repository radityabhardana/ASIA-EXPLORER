import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as audio from '@/lib/audio';
import * as speech from '@/lib/speech';
import CountryPreviewPanel from './CountryPreviewPanel';

describe('CountryPreviewPanel (Hero Panel Preview)', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('merender preview panel dengan sapaan asli dan tombol audio', () => {
    const handleClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <CountryPreviewPanel countryId="jp" open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const audioBtn = container.querySelector('.country-preview__audio-btn') as HTMLButtonElement;
    expect(audioBtn).not.toBeNull();
    expect(container.textContent).toContain('こんにちは');
  });

  it('memutar sapaan asli bahasa daerah saat tombol audio diklik', () => {
    const speakSpy = vi.spyOn(speech, 'speak').mockImplementation((_text, options) => {
      options?.onEnd?.();
      return true;
    });
    const handleClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <CountryPreviewPanel countryId="jp" open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    const audioBtn = container.querySelector('.country-preview__audio-btn') as HTMLButtonElement;
    fireEvent.click(audioBtn);

    expect(speakSpy).toHaveBeenCalledWith(
      'こんにちは',
      expect.objectContaining({
        lang: 'ja-JP',
        fallbackText: 'Konnichiwa',
      }),
    );
  });

  it('merender carousel foto lokal 4 peran dengan counter, panah dan dots', () => {
    const clickSpy = vi.spyOn(audio, 'playParchmentClick').mockImplementation(() => {});
    const handleClose = vi.fn();
    const { container } = render(
      <MemoryRouter>
        <CountryPreviewPanel countryId="jp" open={true} onClose={handleClose} />
      </MemoryRouter>,
    );

    // Pill badge & counter awal (01 / 04)
    const pill = container.querySelector('.country-preview__photo-pill');
    expect(pill).not.toBeNull();
    expect(pill?.textContent).toContain('01 / 04');
    expect(pill?.textContent).toContain('Lansekap');

    // Tombol navigasi prev & next
    const prevBtn = container.querySelector('.country-preview__photo-nav--prev') as HTMLButtonElement;
    const nextBtn = container.querySelector('.country-preview__photo-nav--next') as HTMLButtonElement;
    expect(prevBtn).not.toBeNull();
    expect(nextBtn).not.toBeNull();

    // 4 dot indicators
    const dots = container.querySelectorAll('.country-preview__dot');
    expect(dots.length).toBe(4);
    expect(dots[0]!.classList.contains('country-preview__dot--active')).toBe(true);

    // Klik next -> foto ke-2
    fireEvent.click(nextBtn);
    expect(clickSpy).toHaveBeenCalled();
    expect(pill?.textContent).toContain('02 / 04');
    expect(dots[1]!.classList.contains('country-preview__dot--active')).toBe(true);

    // Klik dot ke-4 langsung
    fireEvent.click(dots[3]!);
    expect(pill?.textContent).toContain('04 / 04');
    expect(dots[3]!.classList.contains('country-preview__dot--active')).toBe(true);

    // Navigasi keyboard: ArrowRight memutar kembali ke 01 / 04
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(pill?.textContent).toContain('01 / 04');

    // ArrowLeft memutar kembali ke 04 / 04
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(pill?.textContent).toContain('04 / 04');
  });
});

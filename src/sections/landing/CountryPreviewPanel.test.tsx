import { cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
});

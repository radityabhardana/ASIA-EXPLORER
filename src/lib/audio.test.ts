import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AUDIO_CHANGE_EVENT,
  STORAGE_KEY,
  isAudioMuted,
  playParchmentClick,
  playStampFailure,
  playStampSuccess,
  playTransitSweep,
  setAudioMuted,
  toggleAudio,
} from './audio';

describe('audio manager', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('default audio tidak bisu (unmuted / aktif non-intrusif)', () => {
    expect(isAudioMuted()).toBe(false);
  });

  it('setAudioMuted menyimpan preferensi ke localStorage dan broadcast event', () => {
    const listener = vi.fn();
    window.addEventListener(AUDIO_CHANGE_EVENT, listener);

    const result = setAudioMuted(true);
    expect(result).toBe(true);
    expect(isAudioMuted()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('false');
    expect(listener).toHaveBeenCalledTimes(1);

    setAudioMuted(false);
    expect(isAudioMuted()).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    expect(listener).toHaveBeenCalledTimes(2);

    window.removeEventListener(AUDIO_CHANGE_EVENT, listener);
  });

  it('toggleAudio membalikkan status audio secara konsisten', () => {
    expect(isAudioMuted()).toBe(false);
    expect(toggleAudio()).toBe(true);
    expect(isAudioMuted()).toBe(true);
    expect(toggleAudio()).toBe(false);
    expect(isAudioMuted()).toBe(false);
  });

  it('fungsi playSound tidak melempar error saat dijalankan di lingkungan uji', () => {
    expect(() => {
      playParchmentClick();
      playTransitSweep();
      playStampSuccess();
      playStampFailure();
    }).not.toThrow();

    // Ketika muted, fungsi playSound langsung return aman
    setAudioMuted(true);
    expect(() => {
      playParchmentClick();
      playTransitSweep();
      playStampSuccess();
      playStampFailure();
    }).not.toThrow();
  });
});

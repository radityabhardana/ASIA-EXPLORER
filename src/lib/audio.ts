import { useEffect, useState } from 'react';

/**
 * Sound design taktil murni via Web Audio API tanpa aset eksternal (0 bundle overhead).
 * - playParchmentClick: Suara klik mekanis lembut saat klik navigasi / tombol.
 * - playTransitSweep: Desir angin halus nada rendah saat berpindah negara fokus di peta 3D.
 * - playStampSuccess: Harmoni lonceng perunggu hangat saat jawaban tantangan harian benar.
 * - playStampFailure: Ketukan kayu tumpul lembut saat jawaban salah.
 */

export const STORAGE_KEY = 'asiakin_audio_enabled';
export const AUDIO_CHANGE_EVENT = 'asiakin:audio-changed';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/** Cek status mute dari localStorage (default unmuted / audio aktif non-intrusif). */
export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    return val === 'false';
  } catch {
    return false;
  }
}

/** Set status mute dan broadcast event perubahan ke semua pendengar. */
export function setAudioMuted(muted: boolean): boolean {
  if (typeof window === 'undefined') return muted;
  try {
    localStorage.setItem(STORAGE_KEY, muted ? 'false' : 'true');
    window.dispatchEvent(
      new CustomEvent(AUDIO_CHANGE_EVENT, { detail: { muted } }),
    );
  } catch {
    // Abaikan error kuota / permission localStorage di iframe / private window
  }
  return muted;
}

/** Toggle status audio on/off dan return status muted terbaru. */
export function toggleAudio(): boolean {
  const nextMuted = !isAudioMuted();
  return setAudioMuted(nextMuted);
}

/** Hook reaktif untuk komponen UI (seperti Navbar). */
export function useAudioState() {
  const [muted, setMutedState] = useState(() => isAudioMuted());

  useEffect(() => {
    const handler = () => {
      setMutedState(isAudioMuted());
    };
    window.addEventListener(AUDIO_CHANGE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(AUDIO_CHANGE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const toggle = () => toggleAudio();
  const setMuted = (value: boolean) => setAudioMuted(value);

  return { muted, toggle, setMuted };
}

/** Suara klik mekanis lembut saat klik navigasi/tombol. */
export function playParchmentClick(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.2, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.032);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  } catch {
    // Audio context safety
  }
}

/** Desir angin halus nada rendah saat berpindah negara fokus di peta 3D. */
export function playTransitSweep(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = 0.42;

    // Lapisan desir angin bertekstur
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.04 * white) / 1.04;
      data[i] = last * 3.2;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.Q.setValueAtTime(1.8, now);
    noiseFilter.frequency.setValueAtTime(160, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(460, now + 0.16);
    noiseFilter.frequency.exponentialRampToValueAtTime(130, now + duration);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.linearRampToValueAtTime(0.07, now + 0.09);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    // Resonansi nada rendah atmosferik
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
    osc.frequency.exponentialRampToValueAtTime(75, now + duration);

    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(0.05, now + 0.08);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    noiseSource.start(now);
    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // Audio context safety
  }
}

/** Harmoni lonceng perunggu hangat saat jawaban tantangan harian benar. */
export function playStampSuccess(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = 0.85;

    // Frekuensi harmonik lonceng perunggu: C4, C5, E5, G5, C6
    const freqs = [261.63, 523.25, 659.25, 783.99, 1046.5];
    const gains = [0.06, 0.11, 0.07, 0.06, 0.03];

    const masterFilter = ctx.createBiquadFilter();
    masterFilter.type = 'lowpass';
    masterFilter.frequency.setValueAtTime(3200, now);
    masterFilter.connect(ctx.destination);

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      const detune = (idx % 2 === 0 ? 1 : -1) * (idx * 3.5);
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detune, now);

      const amp = gains[idx] ?? 0.05;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + duration * (0.65 + idx * 0.08),
      );

      osc.connect(gain);
      gain.connect(masterFilter);

      osc.start(now);
      osc.stop(now + duration);
    });
  } catch {
    // Audio context safety
  }
}

/** Ketukan kayu tumpul lembut saat jawaban salah. */
export function playStampFailure(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const duration = 0.13;

    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(210, now);
    filter.Q.setValueAtTime(3.5, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + duration);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  } catch {
    // Audio context safety
  }
}

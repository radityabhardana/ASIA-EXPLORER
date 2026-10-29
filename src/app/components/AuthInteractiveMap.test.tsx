import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AuthInteractiveMap from './AuthInteractiveMap';
import AuthPage from '@/app/pages/AuthPage';

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  rate = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

describe('AuthInteractiveMap & AuthPage Integration', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: vi.fn().mockReturnValue([]),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      writable: true,
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    });

    // Mock scrollIntoView for pills
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the interactive map canvas, graticules, and compass rose', () => {
    render(
      <MemoryRouter>
        <AuthInteractiveMap />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Peta Interaktif Benua Asia')).toBeInTheDocument();
    expect(screen.getByLabelText('Pilih Negara Asia')).toBeInTheDocument();
    expect(screen.getByText('Asia Explorer')).toBeInTheDocument();
    expect(screen.getByText('ATLAS')).toBeInTheDocument();
  });

  it('starts with Japan as the initial spotlight and displays correct script and greeting', () => {
    render(
      <MemoryRouter>
        <AuthInteractiveMap />
      </MemoryRouter>
    );

    // Spotlight title should have Jepang
    expect(screen.getByRole('heading', { level: 3, name: /Jepang/i })).toBeInTheDocument();
    expect(screen.getByText('(日本)')).toBeInTheDocument();
    expect(screen.getByText('こんにちは')).toBeInTheDocument();
    expect(screen.getByText('Asia Timur')).toBeInTheDocument();
  });

  it('switches country when clicking an interactive country pill', () => {
    const handleSelect = vi.fn();
    render(
      <MemoryRouter>
        <AuthInteractiveMap onCountrySelect={handleSelect} />
      </MemoryRouter>
    );

    const indonesiaPill = screen.getByRole('tab', { name: /Indonesia/i });
    fireEvent.click(indonesiaPill);

    expect(screen.getByRole('heading', { level: 3, name: /Indonesia/i })).toBeInTheDocument();
    expect(screen.getByText('(Nusantara)')).toBeInTheDocument();
    expect(screen.getByText('Selamat pagi')).toBeInTheDocument();
    expect(handleSelect).toHaveBeenCalledWith('id');
  });

  it('cycles to the next and previous countries using navigation buttons', () => {
    render(
      <MemoryRouter>
        <AuthInteractiveMap />
      </MemoryRouter>
    );

    // Initial is Jepang (index 0)
    expect(screen.getByRole('heading', { level: 3, name: /Jepang/i })).toBeInTheDocument();

    // Click next -> Korea Selatan
    const nextBtn = screen.getByLabelText('Negara Berikutnya');
    fireEvent.click(nextBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Korea Selatan/i })).toBeInTheDocument();
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();

    // Click prev -> Back to Jepang
    const prevBtn = screen.getByLabelText('Negara Sebelumnya');
    fireEvent.click(prevBtn);

    expect(screen.getByRole('heading', { level: 3, name: /Jepang/i })).toBeInTheDocument();
  });

  it('toggles auto-rotation when clicking the HUD toggle button', () => {
    render(
      <MemoryRouter>
        <AuthInteractiveMap />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByTitle('Jeda Rotasi Otomatis');
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByTitle('Mulai Rotasi Otomatis')).toBeInTheDocument();
  });

  it('triggers greeting speech audio when clicking Dengarkan button', () => {
    render(
      <MemoryRouter>
        <AuthInteractiveMap />
      </MemoryRouter>
    );

    const speakBtn = screen.getByLabelText(/Dengarkan sapaan こんにちは/i);
    fireEvent.click(speakBtn);

    expect(mockSpeak).toHaveBeenCalled();
  });

  it('renders correctly within the AuthPage layout', () => {
    render(
      <MemoryRouter>
        <AuthPage defaultTab="login" />
      </MemoryRouter>
    );

    expect(screen.getByText('Masuk Sesi')).toBeInTheDocument();
    expect(screen.getByText('Buat Profil')).toBeInTheDocument();
    expect(screen.getByLabelText('Peta Interaktif Benua Asia')).toBeInTheDocument();
  });
});

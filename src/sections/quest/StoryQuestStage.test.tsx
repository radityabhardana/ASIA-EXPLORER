import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import StoryQuestStage from './StoryQuestStage';
import type { StoryQuest } from '@/lib/story-quest/types';

vi.mock('@/lib/speech', () => ({
  speak: vi.fn(),
  cancelSpeech: vi.fn(),
}));

const mockQuest: StoryQuest = {
  id: 'quest-sample',
  countryId: 'jp',
  negara: 'Jepang',
  judul: 'Undangan Makan Malam',
  pengantar: 'Pengantar petualangan budaya di Tokyo.',
  npc: { nama: 'Pak Tanaka', peran: 'Ayah angkat', avatar: 'PT' },
  bekal: [
    { id: 'oleh2', nama: 'Oleh-oleh khas', ikon: 'gift' },
    { id: 'frasa', nama: 'Frasa: Itadakimasu', ikon: 'message-square' },
    { id: 'kaos', nama: 'Kaus kaki bersih', ikon: 'sparkles' },
    { id: 'uang', nama: 'Uang tunai', ikon: 'credit-card' },
  ],
  adegan: [
    {
      id: 's1',
      latar: 'Depan pintu rumah Pak Tanaka',
      narasi: 'Pintu terbuka perlahan.',
      dialog: { speaker: 'Pak Tanaka', teks: 'Irasshai! Silakan masuk.', ekspresi: 'senang' },
      pilihan: [
        {
          id: 'c1',
          teks: 'Lepas sepatu di genkan, rapikan menghadap keluar',
          respectDelta: 15,
          reaksi: { ekspresi: 'kagum', teks: 'Wah, kamu paham tata krama kami!' },
          catatan: {
            judul: 'Genkan: Batas Bersih dan Kotor',
            isi: 'Genkan adalah area peralihan untuk melepas alas kaki.',
            kategori: 'Etiket',
          },
          nextSceneId: 's2',
        },
        {
          id: 'c2',
          teks: 'Langsung melangkah masuk dengan sepatu',
          respectDelta: -20,
          reaksi: { ekspresi: 'kecewa', teks: 'Tunggu, jangan kenakan sepatu di dalam.' },
          catatan: {
            judul: 'Kesalahan di Genkan',
            isi: 'Membawa sepatu ke dalam rumah dipandang tidak sopan.',
            kategori: 'Etiket',
          },
          nextSceneId: 's2',
        },
      ],
    },
    {
      id: 's2',
      latar: 'Ruang makan keluarga',
      narasi: 'Kalian duduk di meja makan tatami.',
      dialog: { speaker: 'Pak Tanaka', teks: 'Mari kita santap hidangan ini.', ekspresi: 'netral' },
      pilihan: [
        {
          id: 'c3',
          teks: 'Ucapkan Itadakimasu sebelum menyentuh sumpit',
          respectDelta: 10,
          reaksi: { ekspresi: 'senang', teks: 'Selamat makan juga!' },
          catatan: {
            judul: 'Itadakimasu',
            isi: 'Bentuk syukur atas hidangan dan orang yang menyiapkannya.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Sahabat Keluarga', ringkasan: 'Hebat!' },
    { id: 'diterima', minRespect: 50, judul: 'Tamu yang Diterima', ringkasan: 'Bagus!' },
    { id: 'canggung', minRespect: 0, judul: 'Malam yang Canggung', ringkasan: 'Belajar lagi.' },
  ],
};

describe('StoryQuestStage UI Components', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders intro card initially and transitions to packing or stage', () => {
    const handleExit = vi.fn();
    render(<StoryQuestStage quest={mockQuest} profileId="test-user" onExit={handleExit} />);

    expect(screen.getByText('Undangan Makan Malam')).toBeInTheDocument();
    expect(screen.getByText('Pengantar petualangan budaya di Tokyo.')).toBeInTheDocument();
    expect(screen.getByText('Mulai Petualangan & Siapkan Bekal')).toBeInTheDocument();

    // Click exit
    fireEvent.click(screen.getByText('Kembali ke Katalog'));
    expect(handleExit).toHaveBeenCalledTimes(1);
  });

  it('renders dialog, respect meter, and choice buttons in playing phase', () => {
    // Seed storage with in-progress state to enter 'playing' phase immediately
    localStorage.setItem(
      'asia_story_quest_v1_test-user_jp',
      JSON.stringify({
        version: 1,
        profileId: 'test-user',
        countryId: 'jp',
        questId: 'quest-sample',
        currentSceneId: 's1',
        respect: 50,
        inventory: ['oleh2', 'frasa'],
        flags: {},
        discoveredNotes: [],
        collectedDna: [],
        history: [],
        relaxMode: false,
        startedAt: Date.now(),
        finishedAt: null,
        endingAchieved: null,
        earnedXp: 0,
        lastUpdated: Date.now(),
      }),
    );

    render(<StoryQuestStage quest={mockQuest} profileId="test-user" onExit={vi.fn()} />);

    // HUD
    expect(screen.getByText('RASA HORMAT')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('Adegan 01/02')).toBeInTheDocument();

    // NPC Card
    expect(screen.getAllByText('Pak Tanaka').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Ayah angkat')).toBeInTheDocument();

    // Narration
    expect(screen.getByText('Pintu terbuka perlahan.')).toBeInTheDocument();

    // Choices
    expect(
      screen.getByText('Lepas sepatu di genkan, rapikan menghadap keluar'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Langsung melangkah masuk dengan sepatu'),
    ).toBeInTheDocument();
  });

  it('selecting a choice shows culture note card and updates respect meter', () => {
    localStorage.setItem(
      'asia_story_quest_v1_test-user_jp',
      JSON.stringify({
        version: 1,
        profileId: 'test-user',
        countryId: 'jp',
        questId: 'quest-sample',
        currentSceneId: 's1',
        respect: 50,
        inventory: ['oleh2', 'frasa'],
        flags: {},
        discoveredNotes: [],
        collectedDna: [],
        history: [],
        relaxMode: false,
        startedAt: Date.now(),
        finishedAt: null,
        endingAchieved: null,
        earnedXp: 0,
        lastUpdated: Date.now(),
      }),
    );

    render(<StoryQuestStage quest={mockQuest} profileId="test-user" onExit={vi.fn()} />);

    // Click choice 1
    const choiceBtn = screen.getByText('Lepas sepatu di genkan, rapikan menghadap keluar');
    fireEvent.click(choiceBtn);

    // Culture Note Card should open
    expect(screen.getByText('Genkan: Batas Bersih dan Kotor')).toBeInTheDocument();
    expect(
      screen.getByText('Genkan adalah area peralihan untuk melepas alas kaki.'),
    ).toBeInTheDocument();
    expect(screen.getByText('“Wah, kamu paham tata krama kami!”')).toBeInTheDocument();
    expect(screen.getByText('Tersimpan ke Koleksi Catatan')).toBeInTheDocument();

    // Respect updated: 50 + 15 = 65
    expect(screen.getByText('65')).toBeInTheDocument();

    // Click "Lanjutkan Cerita" advances to scene 2
    fireEvent.click(screen.getByText('Lanjutkan Cerita'));

    expect(screen.getByText('Ruang makan keluarga')).toBeInTheDocument();
    expect(screen.getByText('Kalian duduk di meja makan tatami.')).toBeInTheDocument();
  });

  it('supports keyboard shortcut 1 and 2 to choose', () => {
    localStorage.setItem(
      'asia_story_quest_v1_test-user_jp',
      JSON.stringify({
        version: 1,
        profileId: 'test-user',
        countryId: 'jp',
        questId: 'quest-sample',
        currentSceneId: 's1',
        respect: 50,
        inventory: ['oleh2', 'frasa'],
        flags: {},
        discoveredNotes: [],
        collectedDna: [],
        history: [],
        relaxMode: false,
        startedAt: Date.now(),
        finishedAt: null,
        endingAchieved: null,
        earnedXp: 0,
        lastUpdated: Date.now(),
      }),
    );

    render(<StoryQuestStage quest={mockQuest} profileId="test-user" onExit={vi.fn()} />);

    // Press '1' on keyboard
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
    });

    expect(screen.getByText('Genkan: Batas Bersih dan Kotor')).toBeInTheDocument();
  });

  it('handles packing phase: allows picking 2 items, enables start button, and launches quest', () => {
    render(<StoryQuestStage quest={mockQuest} profileId="test-user" onExit={vi.fn()} />);

    // Click from intro to packing
    fireEvent.click(screen.getByText('Mulai Petualangan & Siapkan Bekal'));

    // Should now be on Packing Screen
    expect(screen.getByText('Pilih 2 Bekal Petualangan')).toBeInTheDocument();
    expect(screen.getByText('0 / 2 Bekal Dipilih')).toBeInTheDocument();

    const startBtn = screen.getByRole('button', { name: /Pilih 2 bekal lagi untuk memulai/i });
    expect(startBtn).toBeDisabled();

    // Select 1st item
    fireEvent.click(screen.getByText('Oleh-oleh khas'));
    expect(screen.getByText('1 / 2 Bekal Dipilih')).toBeInTheDocument();
    expect(startBtn).toBeDisabled();

    // Select 2nd item
    fireEvent.click(screen.getByText('Frasa: Itadakimasu'));
    expect(screen.getByText('2 / 2 Bekal Dipilih')).toBeInTheDocument();
    expect(startBtn).not.toBeDisabled();

    // Click start button to begin adventure
    fireEvent.click(startBtn);

    // Enters playing stage (Scene 1)
    expect(screen.getByText('Depan pintu rumah Pak Tanaka')).toBeInTheDocument();
    expect(screen.getByText('Pintu terbuka perlahan.')).toBeInTheDocument();
  });

  it('handles ending phase: renders EndingScreen with tier badge, XP, and replay options', () => {
    // Seed storage with state at the final choice leading to ending
    localStorage.setItem(
      'asia_story_quest_v1_test-user_jp',
      JSON.stringify({
        version: 1,
        profileId: 'test-user',
        countryId: 'jp',
        questId: 'quest-sample',
        currentSceneId: 's2',
        respect: 85,
        inventory: ['oleh2', 'frasa'],
        flags: {},
        discoveredNotes: [],
        collectedDna: [],
        history: [],
        relaxMode: false,
        startedAt: Date.now(),
        finishedAt: null,
        endingAchieved: null,
        earnedXp: 0,
        lastUpdated: Date.now(),
      }),
    );

    const handleExit = vi.fn();
    render(<StoryQuestStage quest={mockQuest} profileId="test-user" onExit={handleExit} />);

    // Select choice in s2 (which points to nextSceneId: 'ending')
    fireEvent.click(screen.getByText('Ucapkan Itadakimasu sebelum menyentuh sumpit'));

    // Culture note appears
    expect(screen.getByText('Itadakimasu')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Lanjutkan Cerita'));

    // Should now render EndingScreen
    expect(screen.getByText('Sahabat Keluarga')).toBeInTheDocument();
    expect(screen.getByText('“Hebat!”')).toBeInTheDocument();
    expect(screen.getByText('XP BUDAYA DIPEROLEH')).toBeInTheDocument();
    expect(screen.getByText('CATATAN BUDAYA TERBUKA')).toBeInTheDocument();

    // Test Exit button
    fireEvent.click(screen.getByText('Selesai & Kembali ke Katalog'));
    expect(handleExit).toHaveBeenCalledTimes(1);
  });
});

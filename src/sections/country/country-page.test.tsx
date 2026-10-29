import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { countries, getCountry } from '@/content/countries';
import { themes } from '@/content/themes';
import CountryPage from '@/app/pages/CountryPage';
import { contrastRatio } from '@/lib/color';
import CountryBackground, { getCountryTheme } from './CountryBackground';
import BackNavigation from './BackNavigation';
import CountryEtiquette from './CountryEtiquette';
import CountryFactsheet from './CountryFactsheet';
import CountryGallery, { getCountryPhotos } from './CountryGallery';
import CountryHero, { getHeroPhoto } from './CountryHero';
import CountryNeighbors from './CountryNeighbors';
import LanguageBlock from './LanguageBlock';
import { profileFor } from './scripts';
import SourceBlock from './SourceBlock';

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

describe('Country Page & Editorial Cultural Atlas Transformation', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    const mockGetVoices = vi.fn().mockReturnValue([
      { lang: 'ja-JP', name: 'Japanese' },
      { lang: 'id-ID', name: 'Indonesian' },
    ]);

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      writable: true,
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('1. Adaptive Background (CountryBackground.tsx)', () => {
    it('memiliki palet tema untuk setiap id bertema dengan kontras ink >= 12:1 (AAA)', () => {
      const themedIds = Object.keys(themes.countries);
      expect(themedIds.length).toBeGreaterThan(0);
      for (const cid of themedIds) {
        const theme = getCountryTheme(cid);
        expect(theme.base).toMatch(/^#[0-9a-f]{6}$/i);
        expect(theme.contourStroke).toMatch(/^#[0-9a-f]{6}$/i);
        expect(theme.contourOpacity).toBeGreaterThanOrEqual(0.12);
        expect(theme.contourOpacity).toBeLessThanOrEqual(0.18);

        const cr = contrastRatio('#1a1f24', theme.base);
        expect(
          cr,
          `Kontras --ink terhadap base negara ${cid} harus >= 12:1 (AAA), dapat ${cr.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(12);
      }
    });

    it('memberi tema deterministik (fallback wilayah) untuk semua negara tanpa crash', () => {
      expect(countries.length).toBeGreaterThanOrEqual(15);
      for (const country of countries) {
        const theme = getCountryTheme(country.id);
        expect(theme.base).toMatch(/^#[0-9a-f]{6}$/i);
        expect(theme.soil).toMatch(/^#[0-9a-f]{6}$/i);
        expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/i);
        const cr = contrastRatio('#1a1f24', theme.base);
        expect(cr, `fallback tema ${country.id} kontras ${cr.toFixed(2)}:1`).toBeGreaterThanOrEqual(12);
      }
    });

    it('merender cincin kontur konsentris dan siluet dengan stroke tema', () => {
      const { container } = render(<CountryBackground countryId="jp" />);
      const bg = container.querySelector('.country-background');
      expect(bg).not.toBeNull();
      expect(bg?.getAttribute('aria-hidden')).toBe('true');

      const rings = container.querySelectorAll('.country-background__ring');
      expect(rings.length).toBeGreaterThanOrEqual(4);

      const topo = container.querySelector('.country-background__topo-svg');
      expect(topo).not.toBeNull();
    });
  });

  describe('2. Smart Back Navigation (BackNavigation.tsx)', () => {
    it('mengatur data-hidden sesuai scroll window (hide saat scroll down >80px, reveal saat up / <60px)', () => {
      const { container } = render(
        <MemoryRouter>
          <BackNavigation leaving={false} onClick={vi.fn()} />
        </MemoryRouter>,
      );

      const navBar = container.querySelector('.country-back-bar');
      expect(navBar?.getAttribute('data-hidden')).toBe('false');

      // Scroll down to 120px (>80px and > prevScrollY)
      window.scrollY = 120;
      fireEvent.scroll(window);
      expect(navBar?.getAttribute('data-hidden')).toBe('true');

      // Scroll up to 90px (< prevScrollY)
      window.scrollY = 90;
      fireEvent.scroll(window);
      expect(navBar?.getAttribute('data-hidden')).toBe('false');

      // Scroll down to 200px
      window.scrollY = 200;
      fireEvent.scroll(window);
      expect(navBar?.getAttribute('data-hidden')).toBe('true');

      // Focus on the link reveals the bar
      const link = container.querySelector('.country-back');
      fireEvent.focus(link!);
      expect(navBar?.getAttribute('data-hidden')).toBe('false');

      // Scroll to near top (<60px)
      window.scrollY = 40;
      fireEvent.scroll(window);
      expect(navBar?.getAttribute('data-hidden')).toBe('false');
    });
  });

  describe('3. Photo Hero with Parallax (CountryHero.tsx)', () => {
    it('mengambil foto hero dari images.json dan merender picture tag serta kredit', () => {
      const jp = getCountry('jp')!;
      const profile = profileFor(jp);
      const heroPhoto = getHeroPhoto('jp');

      expect(heroPhoto).toBeDefined();
      expect(heroPhoto?.role).toBe('hero');

      const { container } = render(<CountryHero country={jp} profile={profile} />);

      // Picture tag with AVIF and WebP
      const picture = container.querySelector('.country-hero__picture');
      expect(picture).not.toBeNull();

      const sources = container.querySelectorAll('.country-hero__picture source');
      expect(sources.length).toBeGreaterThanOrEqual(2);

      // Watermark display
      const watermark = container.querySelector('.country-hero__watermark');
      expect(watermark).not.toBeNull();
      expect(watermark?.textContent).toContain(jp.nameLocal);

      // Indonesian name, region, depth
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(jp.nameId);
      expect(container.querySelector('.country-hero__region')?.textContent).toBe(jp.region);
      expect(container.querySelector('.country-honesty-marker')?.textContent).toBe(jp.depth);

      // Photographer caption
      const caption = container.querySelector('.country-hero__caption');
      expect(caption?.textContent).toContain(heroPhoto!.credit.author);
      expect(caption?.textContent).toContain(heroPhoto!.credit.license);
    });

    it('merender overlay identitas negara langsung di dalam visual-frame banner tanpa duplikasi nama Indonesia', () => {
      const id = getCountry('id')!;
      const profile = profileFor(id);

      const { container } = render(<CountryHero country={id} profile={profile} />);

      const visualFrame = container.querySelector('.country-hero__visual-frame');
      expect(visualFrame).not.toBeNull();

      // country-hero__inner sits directly inside visual frame
      const inner = visualFrame?.querySelector('.country-hero__inner');
      expect(inner).not.toBeNull();

      // Heading 1 has nameId
      const heading = inner?.querySelector('h1.country-hero__name');
      expect(heading?.textContent).toBe('Indonesia');

      // Because nameLocal === nameId for Indonesia, no duplicate country-hero__local is rendered
      expect(container.querySelector('.country-hero__local')).toBeNull();

      // But watermark is rendered
      const watermark = container.querySelector('.country-hero__watermark');
      expect(watermark?.textContent).toContain('Indonesia');
    });
  });

  describe('3. Audio Pronunciation in LanguageBlock.tsx', () => {
    it('merender tombol audio interaktif untuk greeting dan 3 frasa', () => {
      const jp = getCountry('jp')!;
      const profile = profileFor(jp);

      const { container } = render(<LanguageBlock country={jp} profile={profile} />);

      const audioButtons = container.querySelectorAll('.country-audio-btn');
      // 1 for greeting + 3 for phrases = 4 buttons
      expect(audioButtons.length).toBe(4);

      // Check text is "🔊 Dengarkan"
      const phraseBtn = audioButtons[1];
      expect(phraseBtn?.textContent).toContain('🔊 Dengarkan');

      // Click button triggers speech
      fireEvent.click(phraseBtn!);
      expect(mockSpeak).toHaveBeenCalled();
    });
  });

  describe('4. Country Photo Gallery (CountryGallery.tsx)', () => {
    it('mengambil seluruh foto non-hero negara dan merender grid editorial', () => {
      const nonHeroPhotos = getCountryPhotos('jp');
      expect(nonHeroPhotos.length).toBeGreaterThanOrEqual(2);

      const { container } = render(<CountryGallery countryId="jp" countryName="Jepang" />);

      const gallery = container.querySelector('.country-gallery');
      expect(gallery).not.toBeNull();

      const cards = container.querySelectorAll('.country-gallery__card');
      expect(cards.length).toBe(nonHeroPhotos.length);

      // Images have loading="lazy" and decoding="async"
      const imgs = container.querySelectorAll('.country-gallery__img');
      expect(imgs.length).toBe(nonHeroPhotos.length);
      for (const img of imgs) {
        expect(img.getAttribute('loading')).toBe('lazy');
        expect(img.getAttribute('decoding')).toBe('async');
      }

      // Check photographer credits
      const credits = container.querySelectorAll('.country-gallery__credit');
      expect(credits.length).toBe(nonHeroPhotos.length);
    });
  });

  describe('5. Foldable Provenance / Sources (SourceBlock.tsx)', () => {
    it('membungkus sitasi dalam details lipat dengan summary count dan chevron', () => {
      const jp = getCountry('jp')!;
      const { container } = render(
        <SourceBlock
          sources={jp.sources}
          needsVerification={jp.needsVerification}
          depth={jp.depth}
        />,
      );

      const details = container.querySelector('.country-sources-details');
      expect(details).not.toBeNull();

      const summary = container.querySelector('.country-sources-summary');
      expect(summary?.textContent).toContain(`Referensi & Sumber Data (${jp.sources.length})`);

      const chevron = container.querySelector('.country-sources-summary__chevron');
      expect(chevron).not.toBeNull();

      // Verified URLs list
      const verifiedLinks = container.querySelectorAll('.country-sources__link');
      expect(verifiedLinks.length).toBeGreaterThan(0);
      for (const link of verifiedLinks) {
        expect(link.getAttribute('target')).toBe('_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
      }
    });
  });

  describe('6. CountryPage Full Integration', () => {
    it('merender modul Uji Pemahaman: Etiket & Frasa untuk negara Lengkap (JP)', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/negara/jp']}>
          <Routes>
            <Route path="/negara/:id" element={<CountryPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // Title & CTA
      expect(
        screen.getByRole('heading', { name: /Uji Pemahaman: Etiket & Frasa Jepang/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Ikuti skenario budaya bercabang dan simpan frasa ke Phrase Vault di perambanmu./i,
        ),
      ).toBeInTheDocument();

      const cta = screen.getByRole('link', { name: /Mulai Pelajaran di Dashboard →/i });
      expect(cta).toBeInTheDocument();
      expect(cta.getAttribute('href')).toBe('/dashboard');

      expect(container.querySelector('.country-dashboard-callout')).not.toBeNull();
    });

    it('tidak merender modul Uji Pemahaman untuk negara Penjelajahan (MY)', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/negara/my']}>
          <Routes>
            <Route path="/negara/:id" element={<CountryPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(
        screen.queryByRole('heading', { name: /Uji Pemahaman: Etiket & Frasa Malaysia/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /Mulai Pelajaran di Dashboard →/i }),
      ).not.toBeInTheDocument();
      expect(container.querySelector('.country-dashboard-callout')).toBeNull();
    });

    it('merender Lembar Fakta Lapangan, Kaidah Etiket, dan Jelajah Negara Terdekat di CountryPage', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/negara/jp']}>
          <Routes>
            <Route path="/negara/:id" element={<CountryPage />} />
          </Routes>
        </MemoryRouter>,
      );

      // Factsheet
      const factsheet = container.querySelector('.country-factsheet');
      expect(factsheet).not.toBeNull();
      expect(factsheet?.textContent).toContain('Tokyo');
      expect(factsheet?.textContent).toContain('Asia Timur');

      // 3 Kaidah Etiket
      const etiquette = container.querySelector('.country-etiquette');
      expect(etiquette).not.toBeNull();
      const rules = container.querySelectorAll('.country-etiquette__card');
      expect(rules.length).toBe(3);

      // Jelajah Negara Terdekat
      const neighbors = container.querySelector('.country-neighbors');
      expect(neighbors).not.toBeNull();
      const neighborCards = container.querySelectorAll('.country-neighbor-card');
      expect(neighborCards.length).toBe(3);
    });
  });

  describe('7. Modular Cultural Blocks: Factsheet, Etiquette, & Neighbors', () => {
    it('CountryFactsheet merender data geodetik dan ibu kota dengan benar', () => {
      const jp = getCountry('jp')!;
      const { container } = render(<CountryFactsheet country={jp} locale="id" />);

      expect(container.querySelector('.country-factsheet__value--accent')?.textContent).toBe('Tokyo');
      expect(container.textContent).toContain('JST');
      expect(container.textContent).toContain('Asia Timur');
    });

    it('CountryEtiquette menyajikan tepat 3 kaidah sopan santun budaya', () => {
      const id = getCountry('id')!;
      const { container } = render(<CountryEtiquette country={id} locale="id" />);

      const cards = container.querySelectorAll('.country-etiquette__card');
      expect(cards.length).toBe(3);
      expect(container.textContent).toContain('KAIDAH 01');
      expect(container.textContent).toContain('KAIDAH 02');
      expect(container.textContent).toContain('KAIDAH 03');
    });

    it('CountryNeighbors menghubungkan ke 3 negara tetangga serumpun', () => {
      const jp = getCountry('jp')!;
      const { container } = render(
        <MemoryRouter>
          <CountryNeighbors currentCountry={jp} locale="id" />
        </MemoryRouter>,
      );

      const links = container.querySelectorAll('.country-neighbor-card');
      expect(links.length).toBe(3);
      for (const link of links) {
        expect(link.getAttribute('href')).toMatch(/^\/negara\/[a-z]{2}$/);
      }
    });
  });
});

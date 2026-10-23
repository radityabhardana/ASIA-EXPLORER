import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import { scrollToSection } from '@/lib/motion';
import { differs, profileFor } from '@/sections/country/scripts';
import Navbar from '@/app/Navbar';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CountryDialog from '@/sections/landing/CountryDialog';
import CountryMapSvg from '@/sections/landing/CountryMapSvg';
import Silhouette from '@/sections/landing/Silhouette';
import TopoBackground from '@/sections/landing/TopoBackground';
import {
  SCRIPT_COUNTRY_IDS,
  countries,
  countryEntry,
} from '@/sections/landing/landing-data';
import { useLandingTimeline } from '@/sections/landing/useLandingTimeline';
import '@/styles/landing.css';

const scriptCountries = SCRIPT_COUNTRY_IDS.flatMap((id) => {
  const country = countryEntry(id);
  return country ? [country] : [];
});

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const heroProgressRef = useRef(0);
  // Scene 7 statis saat interaktif (§3): progres tetap, kamera tidak berubah.
  const invitationProgressRef = useRef(0.5);
  /**
   * Sumber sorotan tunggal scene Skala: tween GSAP menulis 0..1 di sini dan
   * teks counter dalam satu onUpdate — jumlah tinta 3D selalu = teks counter.
   */
  const scaleHighlightRef = useRef(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useLandingTimeline({
    root: rootRef,
    progress: heroProgressRef,
    highlight: scaleHighlightRef,
  });

  // Hero intro triggered by preloader exit or immediate if preloader skipped.
  useEffect(() => {
    const handleReady = () => {
      setReady(true);
    };

    if (document.documentElement.dataset.ready === 'true') {
      handleReady();
    } else {
      window.addEventListener('asiakin:ready', handleReady);
    }

    return () => {
      window.removeEventListener('asiakin:ready', handleReady);
    };
  }, []);

  const selectedCountry = selectedId ? (countryEntry(selectedId) ?? null) : null;
  const hoverCountry = hoverId ? (countryEntry(hoverId) ?? null) : null;

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className={`landing ${ready ? 'landing--ready' : ''}`} ref={rootRef}>
      <TopoBackground />
      <a className="landing-skip skip-link" href="#peta" onClick={handleSkipToMap}>
        Lewati ke peta
      </a>
      <Navbar onScrollToMap={handleSkipToMap} />

      {/* Scene 1 — hero */}
      <section className="landing-scene landing-scene--hero" aria-labelledby="landing-title">
        <div className="landing-stage landing-stage--hero">
          <div className="landing-hero__ground" aria-hidden="true">
            <svg
              className="landing-hero__ground-svg"
              viewBox="0 0 1000 585"
              preserveAspectRatio="none"
            >
              <ellipse
                className="landing-hero__ground-disc"
                cx="500"
                cy="292.5"
                rx="498"
                ry="290"
              />
              <ellipse
                className="landing-hero__ground-ring landing-hero__ground-ring--1"
                cx="500"
                cy="292.5"
                rx="498"
                ry="290"
              />
              <ellipse
                className="landing-hero__ground-ring landing-hero__ground-ring--2"
                cx="500"
                cy="292.5"
                rx="410"
                ry="239"
              />
              <ellipse
                className="landing-hero__ground-ring landing-hero__ground-ring--3"
                cx="500"
                cy="292.5"
                rx="320"
                ry="187"
              />
            </svg>
          </div>

          <div className="landing-hero__copy" data-intro>
            <p className="landing-hero__eyebrow">PETA INTERAKTIF · 15 NEGARA</p>
            <span className="landing-hero__accent-bar" aria-hidden="true" />
            <h1 className="landing-hero__title" id="landing-title">
              Asia Explorer
            </h1>
          </div>

          <div className="landing-hero__scene" data-intro>
            <AsiaSceneLazy
              decorative
              debugKey="hero"
              label="Peta Asia"
              scrollProgressRef={heroProgressRef}
            />
          </div>

          <p className="landing-hint" data-intro>
            Gulir
          </p>
        </div>
      </section>

      {/* Scene 2 — skala negara: proyeksi peta SVG 15 negara dengan sorotan tersinkronisasi */}
      <section
        className="landing-scene landing-scene--scale landing-scene--pinned"
        aria-labelledby="landing-scale-heading"
      >
        <div className="landing-stage landing-stage--scale">
          <div className="landing-stage__copy landing-center" data-reveal>
            <h2
              className="landing-display landing-display--stat landing-display--wide"
              id="landing-scale-heading"
            >
              <span className="landing-display__number" data-counter="15">
                15
              </span>
              <span className="landing-display__words">negara dalam cakupan</span>
            </h2>
            <p className="landing-note">Dari Turki sampai Jepang.</p>
          </div>

          <div className="landing-scale__map-wrap" data-reveal>
            <CountryMapSvg variant="scene" className="landing-scale__map" />
          </div>
        </div>
      </section>

      {/* Scene 3 — kedalaman bahasa */}
      <section
        className="landing-scene landing-scene--language landing-scene--pinned"
        aria-labelledby="landing-language-heading"
      >
        <div className="landing-stage landing-stage--language">
          <div className="landing-lang__sil">
            <Silhouette id="id" className="landing-lang__shape" fit="slice" />
          </div>

          <div className="landing-stage__copy landing-center" data-reveal>
            <h2
              className="landing-display landing-display--stat landing-display--wide"
              id="landing-language-heading"
            >
              <span className="landing-display__number" data-counter="718">
                718
              </span>
              <span className="landing-display__words">
                bahasa daerah, Indonesia (Badan Bahasa)
              </span>
            </h2>
            <p className="landing-note">
              Tercatat dari 2.560 titik pengamatan di seluruh kepulauan.
            </p>
          </div>
        </div>
      </section>

      {/* Scene 4 — panggung aksara (K12) */}
      <section
        className="landing-scene landing-scene--script landing-scene--pinned"
        aria-labelledby="landing-script-heading"
      >
        <div className="landing-stage landing-stage--script">
          <div className="landing-stage__copy" data-reveal>
            <h2 className="landing-display" id="landing-script-heading">
              Aksara yang bergerak
            </h2>
            <p className="landing-note">Limabelas negara, limabelas cara menuliskan sapaan.</p>
          </div>

          <div className="landing-script__band" data-reveal>
            <div className="landing-script__viewport">
              <div
                className="landing-script__marquee"
                tabIndex={-1}
                aria-label="Pita aksara 15 negara"
              >
                <div className="landing-script__track">
                  {scriptCountries.map((country) => {
                    const profile = profileFor(country);
                    return (
                      <article
                        key={country.id}
                        className="landing-script__item landing-script__card"
                        tabIndex={0}
                        aria-label={`${country.nameId}: ${country.greeting.native}, bahasa ${country.language.nameId}`}
                      >
                        <div className="landing-script__card-header">
                          <span className="landing-script__country">{country.nameId}</span>
                          <span className="landing-script__label">{country.language.nameId}</span>
                        </div>
                        <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                          {country.greeting.native}
                        </p>
                        <p className="landing-script__roman">
                          {differs(country.greeting.native, country.greeting.roman)
                            ? country.greeting.roman
                            : country.greeting.meaningId}
                        </p>
                      </article>
                    );
                  })}
                </div>

                <div className="landing-script__track" aria-hidden="true">
                  {scriptCountries.map((country) => {
                    const profile = profileFor(country);
                    return (
                      <article
                        key={`dup-${country.id}`}
                        className="landing-script__item landing-script__card"
                        tabIndex={-1}
                      >
                        <div className="landing-script__card-header">
                          <span className="landing-script__country">{country.nameId}</span>
                          <span className="landing-script__label">{country.language.nameId}</span>
                        </div>
                        <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                          {country.greeting.native}
                        </p>
                        <p className="landing-script__roman">
                          {differs(country.greeting.native, country.greeting.roman)
                            ? country.greeting.roman
                            : country.greeting.meaningId}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 5 — undangan interaktif */}
      <section
        id="peta"
        ref={mapSectionRef}
        tabIndex={-1}
        className="landing-scene landing-scene--invitation"
        aria-labelledby="landing-invitation-heading"
        aria-describedby="landing-map-help"
      >
        <div className="landing-stage landing-stage--invitation">
          <div className="landing-stage__copy landing-center" data-reveal>
            <h2 className="landing-display" id="landing-invitation-heading">
              Pilih negara, mulai penjelajahan
            </h2>
            <p className="landing-note">Sentuh atau arahkan kursor ke negara di benua.</p>
          </div>

          <div className="landing-invitation__scene" data-reveal>
            <AsiaSceneLazy
              debugKey="invitation"
              label="Peta Asia interaktif"
              describedBy="landing-map-help"
              scrollProgressRef={invitationProgressRef}
              selectedId={selectedId}
              onHoverCountry={(id) => setHoverId(id)}
              onSelectCountry={(id) => setSelectedId(id)}
            />
          </div>

          <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            {hoverCountry ? `${hoverCountry.nameId}, ${hoverCountry.language.nameId}` : ''}
          </div>
          <p id="landing-map-help" className="visually-hidden">
            Gunakan peta atau indeks negara di bagian bawah halaman.
          </p>

          <CountryDialog country={selectedCountry} onClose={() => setSelectedId(null)} />
        </div>
      </section>

      {/* Scene 6 — Dashboard & Sistem Belajar */}
      <section
        id="dashboard-showcase"
        className="landing-scene landing-scene--dashboard"
        aria-labelledby="landing-dashboard-heading"
      >
        <div className="landing-stage landing-stage--dashboard">
          <div className="landing-stage__copy landing-center" data-reveal>
            <p className="landing-kicker">Ruang Belajar</p>
            <h2 className="landing-display" id="landing-dashboard-heading">
              Dashboard & Sistem Belajar
            </h2>
            <p className="landing-note">
              Setelah menjelajah, simpan progres dan pelajari norma budaya secara mendalam di perambanmu.
            </p>
          </div>

          <div className="landing-dashboard__grid" data-reveal>
            {/* Pillar 1 */}
            <article className="landing-dashboard__card">
              <div className="landing-dashboard__card-top">
                <span className="landing-dashboard__badge">Prioritas Otomatis</span>
                <span className="landing-dashboard__pillar">Kurikulum Cerdas</span>
              </div>
              <h3 className="landing-dashboard__card-title">Satu Langkah Berikutnya</h3>
              <p className="landing-dashboard__card-desc">
                Tugas cerdas dipilihkan untukmu — lanjutkan pelajaran, ulas frasa, atau baca cerita.
              </p>
              <div className="landing-dashboard__preview">
                <div className="landing-dashboard__task-header">
                  <span className="landing-dashboard__task-pill">Rekomendasi</span>
                  <span className="landing-dashboard__task-time">4 mnt</span>
                </div>
                <div className="landing-dashboard__task-text">Etiket Pertemuan & Jamuan di Kyoto</div>
              </div>
            </article>

            {/* Pillar 2 */}
            <article className="landing-dashboard__card">
              <div className="landing-dashboard__card-top">
                <span className="landing-dashboard__badge">Spaced Repetition</span>
                <span className="landing-dashboard__pillar">Memori Permanen</span>
              </div>
              <h3 className="landing-dashboard__card-title">Phrase Vault & Ulas Tepat Waktu</h3>
              <p className="landing-dashboard__card-desc">
                Sistem spaced repetition 5-kotak Leitner (1, 3, 7, 16, 35 hari) agar ingatan bertahan permanen.
              </p>
              <div className="landing-dashboard__preview">
                <div className="landing-dashboard__leitner-boxes">
                  <div className="landing-dashboard__leitner-box" title="Kotak 1: 1 hari">
                    <span className="landing-dashboard__leitner-num">1</span>
                    <span className="landing-dashboard__leitner-interval">1h</span>
                  </div>
                  <div className="landing-dashboard__leitner-box" title="Kotak 2: 3 hari">
                    <span className="landing-dashboard__leitner-num">2</span>
                    <span className="landing-dashboard__leitner-interval">3h</span>
                  </div>
                  <div className="landing-dashboard__leitner-box" title="Kotak 3: 7 hari">
                    <span className="landing-dashboard__leitner-num">3</span>
                    <span className="landing-dashboard__leitner-interval">7h</span>
                  </div>
                  <div className="landing-dashboard__leitner-box" title="Kotak 4: 16 hari">
                    <span className="landing-dashboard__leitner-num">4</span>
                    <span className="landing-dashboard__leitner-interval">16h</span>
                  </div>
                  <div className="landing-dashboard__leitner-box" title="Kotak 5: 35 hari">
                    <span className="landing-dashboard__leitner-num">5</span>
                    <span className="landing-dashboard__leitner-interval">35h</span>
                  </div>
                </div>
              </div>
            </article>

            {/* Pillar 3 */}
            <article className="landing-dashboard__card">
              <div className="landing-dashboard__card-top">
                <span className="landing-dashboard__badge">Sebab Budaya</span>
                <span className="landing-dashboard__pillar">Konteks Sosial</span>
              </div>
              <h3 className="landing-dashboard__card-title">Skenario Budaya Bercabang</h3>
              <p className="landing-dashboard__card-desc">
                Bukan sekadar kuis pilihan ganda. Pelajari sebab budaya di balik setiap aturan etiket.
              </p>
              <div className="landing-dashboard__preview">
                <div className="landing-dashboard__scenario-q">
                  &ldquo;Menerima kartu nama dengan dua tangan dan membacanya sesaat...&rdquo;
                </div>
                <div className="landing-dashboard__scenario-tags">
                  <span className="landing-dashboard__tag">Penghormatan Hierarki</span>
                  <span className="landing-dashboard__tag">Konteks Sosial</span>
                </div>
              </div>
            </article>

            {/* Pillar 4 */}
            <article className="landing-dashboard__card">
              <div className="landing-dashboard__card-top">
                <span className="landing-dashboard__badge">Local-First</span>
                <span className="landing-dashboard__pillar">Privasi Penuh</span>
              </div>
              <h3 className="landing-dashboard__card-title">Datamu Milikmu (Local-First)</h3>
              <p className="landing-dashboard__card-desc">
                Tersimpan aman di IndexedDB perangkatmu tanpa pelacak, bisa diekspor atau diimpor JSON kapan saja.
              </p>
              <div className="landing-dashboard__preview">
                <div className="landing-dashboard__privacy-row">
                  <span className="landing-dashboard__privacy-status">Tersimpan di IndexedDB</span>
                  <span className="landing-dashboard__privacy-badge">0 Pelacak</span>
                </div>
                <div className="landing-dashboard__privacy-actions">
                  <span className="landing-dashboard__privacy-btn">Ekspor JSON</span>
                  <span className="landing-dashboard__privacy-btn">Impor Riwayat</span>
                </div>
              </div>
            </article>
          </div>

          <div className="landing-dashboard__actions" data-reveal>
            <a href="/dashboard" className="landing-dashboard__cta">
              Buka Dashboard
            </a>
          </div>
        </div>
      </section>

      {/* Scene 7 — footer: indeks negara + wordmark */}
      <footer
        className="landing-scene landing-scene--footer"
        aria-labelledby="landing-footer-heading"
      >
        <div className="landing-stage landing-stage--footer">
          <div className="landing-footer__index" data-reveal>
            <h2 className="landing-footer__index-title" id="landing-footer-heading">
              Pilih negara
            </h2>
            <nav className="landing-footer__index-nav" aria-label="Indeks negara">
              <ul className="landing-footer__index-list">
                {countries.map((country) => (
                  <li key={country.id}>
                    <button
                      type="button"
                      className="landing-footer__index-button"
                      data-country={country.id}
                      aria-haspopup="dialog"
                      onClick={() => setSelectedId(country.id)}
                    >
                      <span className="landing-footer__index-name">{country.nameId}</span>
                      <span className="landing-footer__index-depth">{country.depth}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <p className="landing-footer__mark">Asia Explorer</p>
        </div>
      </footer>
    </div>
  );
}

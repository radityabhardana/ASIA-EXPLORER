import { Link } from 'react-router-dom';

import { useI18n } from '@/lib/i18n';
import { scrollToSection } from '@/lib/motion';
import '@/styles/expedition-mastery.css';

export default function ExpeditionMasterySection() {
  const { locale } = useI18n();

  return (
    <section id="metodologi" className="expedition-mastery" aria-labelledby="mastery-title">
      <div className="expedition-mastery__container">
        {/* Header */}
        <div className="expedition-mastery__header">
          <p className="expedition-mastery__eyebrow">
            <span className="expedition-mastery__eyebrow-line" aria-hidden="true" />
            <span className="expedition-mastery__eyebrow-code" aria-hidden="true">[KONSOL · MET-03]</span>
            <span>{locale === 'id' ? 'Sains Kognitif & Kartografi Belajar' : 'Cognitive Science & Learning Cartography'}</span>
          </p>
          <h2 id="mastery-title" className="expedition-mastery__title">
            {locale === 'id' ? (
              <>
                Kuasai Pemahaman 48 Bangsa dengan <span className="expedition-mastery__title-accent">Sains Memori Teruji.</span>
              </>
            ) : (
              <>
                Master 48 Asian Nations with <span className="expedition-mastery__title-accent">Proven Memory Science.</span>
              </>
            )}
          </h2>
          <p className="expedition-mastery__lead">
            {locale === 'id'
              ? 'Mempelajari adat, aksara, dan etiket asing rentan terlupakan dalam hitungan hari. Kami menggabungkan sains spaced repetition Leitner terkalibrasi, 60+ skenario dilema riil, dan buku akreditasi resmi agar pemahaman budaya Anda tertanam seumur hidup.'
              : 'Learning unfamiliar customs, scripts, and geography is prone to rapid decay. We unite calibrated Leitner spaced repetition, 60+ authentic dilemma scenarios, and official explorer accreditation so your insights last a lifetime.'}
          </p>
        </div>

        {/* Konsol Litograf Terintegrasi (Archival Methodology Console) */}
        <div
          className="mastery-console"
          role="region"
          aria-label={locale === 'id' ? 'Konsol Metodologi Retensi' : 'Retention Methodology Console'}
        >
          {/* Header Bar Konsol */}
          <div className="mastery-console__topbar">
            <div className="mastery-console__topbar-title">
              <span className="mastery-console__topbar-pip" aria-hidden="true" />
              <span>{locale === 'id' ? 'KONSOL METODOLOGI RETENSI & AKREDITASI' : 'RETENTION METHODOLOGY & ACCREDITATION CONSOLE'}</span>
            </div>
            <div className="mastery-console__topbar-meta" aria-hidden="true">
              <span>SISTEM LEITNER v3.2</span>
              <span>·</span>
              <span>48 BANGSA BERDAULAT</span>
            </div>
          </div>

          <div className="mastery-console__bays">
            {/* Bay I: Sains Memori Leitner & Kurva Retensi */}
            <article className="mastery-bay mastery-bay--retention">
              <div className="mastery-bay__header">
                <span className="mastery-bay__badge">
                  § 01 {locale === 'id' ? 'Sains Kognitif' : 'Cognitive Science'}
                </span>
                <h3 className="mastery-bay__title">
                  {locale === 'id' ? 'Instrumen Kurva Retensi Leitner' : 'Calibrated Leitner Retention Curve'}
                </h3>
                <p className="mastery-bay__desc">
                  {locale === 'id'
                    ? 'Melawan Kurva Lupa Ebbinghaus. Kartu wawasan budaya ditinjau bertahap melalui interval terkalibrasi hingga mencapai stabilitas memori permanen.'
                    : 'Counteracting the Ebbinghaus Forgetting Curve. Cultural insights expand systematically across calibrated intervals until reaching permanent stability.'}
                </p>
              </div>

              {/* Instrumen Kurva Garis Waktu Terkalibrasi */}
              <div
                className="retention-instrument"
                aria-label={locale === 'id' ? 'Diagram kurva retensi berjenjang' : 'Tiered retention curve diagram'}
              >
                <div className="retention-instrument__head">
                  <span className="retention-instrument__caption">
                    {locale === 'id' ? 'GARIS WAKTU INTERVAL RETENSI' : 'RETENTION INTERVAL TIMELINE'}
                  </span>
                  <span className="retention-instrument__tag">
                    {locale === 'id' ? 'Presisi 24 Jam' : '24h Precision'}
                  </span>
                </div>

                <div className="retention-timeline">
                  <div className="retention-timeline__track" aria-hidden="true">
                    <div className="retention-timeline__line" />
                    <div className="retention-timeline__fill" />
                  </div>

                  <div className="retention-timeline__nodes">
                    <div className="retention-node">
                      <div className="retention-node__pip" aria-hidden="true" />
                      <span className="retention-node__day">{locale === 'id' ? '1 Hari' : 'Day 1'}</span>
                      <span className="retention-node__pct">40%</span>
                    </div>

                    <div className="retention-node">
                      <div className="retention-node__pip" aria-hidden="true" />
                      <span className="retention-node__day">{locale === 'id' ? '3 Hari' : 'Day 3'}</span>
                      <span className="retention-node__pct">65%</span>
                    </div>

                    <div className="retention-node">
                      <div className="retention-node__pip" aria-hidden="true" />
                      <span className="retention-node__day">{locale === 'id' ? '7 Hari' : 'Day 7'}</span>
                      <span className="retention-node__pct">82%</span>
                    </div>

                    <div className="retention-node">
                      <div className="retention-node__pip" aria-hidden="true" />
                      <span className="retention-node__day">{locale === 'id' ? '14 Hari' : 'Day 14'}</span>
                      <span className="retention-node__pct">94%</span>
                    </div>

                    <div className="retention-node retention-node--active">
                      <div className="retention-node__pip retention-node__pip--active" aria-hidden="true">
                        <span className="retention-node__pulse" />
                      </div>
                      <span className="retention-node__day retention-node__day--active">
                        {locale === 'id' ? 'Permanen' : 'Permanent'}
                      </span>
                      <span className="retention-node__pct retention-node__pct--active">99%</span>
                    </div>
                  </div>
                </div>

                <div className="retention-instrument__footer">
                  <span className="retention-instrument__note">
                    {locale === 'id'
                      ? 'Interval otomatis terkonfigurasi pada memori lokal browser Anda.'
                      : 'Interval state securely persisted to local browser storage.'}
                  </span>
                </div>
              </div>
            </article>

            {/* Bay II: Kurikulum 60+ Skenario Dilema Lapangan */}
            <article className="mastery-bay mastery-bay--quests">
              <div className="mastery-bay__header">
                <span className="mastery-bay__badge">
                  § 02 {locale === 'id' ? 'Kurikulum Berjenjang' : 'Curated Scenarios'}
                </span>
                <h3 className="mastery-bay__title">
                  {locale === 'id' ? '60+ Berkas Dilema Budaya Riil' : '60+ Authentic Cultural Dilemmas'}
                </h3>
                <p className="mastery-bay__desc">
                  {locale === 'id'
                    ? 'Bukan hafalan pilihan ganda kering. Anda memecahkan dilema jamuan makan di Tokyo, membedakan dialek fonetik di Samarkand, dan mengenali bentang alam dari citra geodetik.'
                    : 'Not dry textbook memorization. Resolve diplomatic dining dilemmas in Tokyo, decipher phonetic greetings along the Silk Road, and identify ancient monuments from terrain imagery.'}
                </p>
              </div>

              {/* Inventaris Berkas Skenario Lapangan */}
              <div
                className="dossier-ledger"
                aria-label={locale === 'id' ? 'Daftar modul skenario' : 'Scenario module catalog'}
              >
                <div className="dossier-ledger__item">
                  <div className="dossier-ledger__code">§ BERKAS 01</div>
                  <div className="dossier-ledger__info">
                    <span className="dossier-ledger__title">
                      {locale === 'id' ? 'Sapaan & Fonetik 15 Aksara' : '15 Scripts & Phonetic Courtesy'}
                    </span>
                    <span className="dossier-ledger__desc">
                      {locale === 'id' ? 'Transkripsi audio & etiket sapaan' : 'Audio recordings & vocal cadence'}
                    </span>
                  </div>
                  <div className="dossier-ledger__count">15 {locale === 'id' ? 'Misi' : 'Quests'}</div>
                </div>

                <div className="dossier-ledger__item">
                  <div className="dossier-ledger__code">§ BERKAS 02</div>
                  <div className="dossier-ledger__info">
                    <span className="dossier-ledger__title">
                      {locale === 'id' ? 'Etiket Meja Makan & Majlis' : 'Dining Protocols & Hospitality'}
                    </span>
                    <span className="dossier-ledger__desc">
                      {locale === 'id' ? 'Dilema tata cara jamuan 5 kawasan' : 'Banquet customs across 5 regions'}
                    </span>
                  </div>
                  <div className="dossier-ledger__count">20 {locale === 'id' ? 'Misi' : 'Quests'}</div>
                </div>

                <div className="dossier-ledger__item">
                  <div className="dossier-ledger__code">§ BERKAS 03</div>
                  <div className="dossier-ledger__info">
                    <span className="dossier-ledger__title">
                      {locale === 'id' ? 'Kartografi & Geodetik Alam' : 'Terrain Relief & Geodesy'}
                    </span>
                    <span className="dossier-ledger__desc">
                      {locale === 'id' ? 'Identifikasi bentang alam & landmark' : 'Landform & landmark recognition'}
                    </span>
                  </div>
                  <div className="dossier-ledger__count">25 {locale === 'id' ? 'Misi' : 'Quests'}</div>
                </div>
              </div>
            </article>

            {/* Bay III: Buku Akreditasi Penjelajah Budaya */}
            <article className="mastery-bay mastery-bay--registry">
              <div className="mastery-bay__header">
                <span className="mastery-bay__badge">
                  § 03 {locale === 'id' ? 'Buku Akreditasi' : 'Accreditation'}
                </span>
                <h3 className="mastery-bay__title">
                  {locale === 'id' ? 'Buku Akreditasi Penjelajah' : 'Explorer Accreditation Registry'}
                </h3>
                <p className="mastery-bay__desc">
                  {locale === 'id'
                    ? 'Catatan reputasi ekspedisi resmi. Konsistensi harian dan akurasi norma mengukuhkan lencana kualifikasi dari tingkatan Mula hingga Mahaguru Penjelajah Benua.'
                    : 'Official continental explorer record. Daily streaks and cultural accuracy confirm qualification ranks from Novice Traveler to Grand Continental Scholar.'}
                </p>
              </div>

              {/* Daftar Tingkat Akreditasi */}
              <div
                className="accreditation-registry"
                aria-label={locale === 'id' ? 'Jenjang Pangkat Akreditasi' : 'Accreditation Rank Tiers'}
              >
                <div className="accreditation-item">
                  <div className="accreditation-item__rank">
                    <span className="accreditation-item__stamp">TINGKAT I</span>
                    <span className="accreditation-item__name">
                      {locale === 'id' ? 'Penjelajah Mula' : 'Novice Explorer'}
                    </span>
                  </div>
                  <span className="accreditation-item__code">SK-01</span>
                </div>

                <div className="accreditation-item">
                  <div className="accreditation-item__rank">
                    <span className="accreditation-item__stamp">TINGKAT II</span>
                    <span className="accreditation-item__name">
                      {locale === 'id' ? 'Pengembara Jalur Rempah' : 'Silk & Spice Navigator'}
                    </span>
                  </div>
                  <span className="accreditation-item__code">SK-15</span>
                </div>

                <div className="accreditation-item">
                  <div className="accreditation-item__rank">
                    <span className="accreditation-item__stamp">TINGKAT III</span>
                    <span className="accreditation-item__name">
                      {locale === 'id' ? 'Diplomat Budaya Asia' : 'Cultural Envoy of Asia'}
                    </span>
                  </div>
                  <span className="accreditation-item__code">SK-30</span>
                </div>

                <div className="accreditation-item accreditation-item--master">
                  <div className="accreditation-item__rank">
                    <span className="accreditation-item__stamp accreditation-item__stamp--master">
                      MAHAGURU
                    </span>
                    <span className="accreditation-item__name accreditation-item__name--master">
                      {locale === 'id' ? 'Mahaguru Penjelajah Benua' : 'Grand Continental Scholar'}
                    </span>
                  </div>
                  <span className="accreditation-item__code accreditation-item__code--master">SK-50</span>
                </div>
              </div>
            </article>
          </div>
        </div>

        {/* CTA Banner Megah Penutup Landing Page */}
        <aside className="mastery-cta-banner" aria-label="Ajakan Bertualang">
          <div className="mastery-cta-banner__content">
            <h3 className="mastery-cta-banner__title">
              {locale === 'id' ? (
                <>
                  Masuki Konsol Pembelajaran <span className="mastery-cta-banner__title-accent">48 Bangsa</span>
                </>
              ) : (
                <>
                  Enter the 48-Nation <span className="mastery-cta-banner__title-accent">Learning Console</span>
                </>
              )}
            </h3>
            <p className="mastery-cta-banner__desc">
              {locale === 'id'
                ? 'Jelajahi seluruh profil 48 negara, latih refleks norma budaya Anda, dan pantau progres pemahaman di ruang belajar. Tersimpan otomatis di browser tanpa biaya.'
                : 'Explore 48 comprehensive country dossiers, test your cultural instincts, and track mastery in your personal dashboard. Saved automatically in your browser.'}
            </p>
          </div>

          <div className="mastery-cta-banner__actions">
            <Link to="/dashboard" className="mastery-cta-banner__primary-btn">
              <span>{locale === 'id' ? 'Buka Ruang Belajar di Dashboard' : 'Enter Learning Dashboard'}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
            <button
              type="button"
              className="mastery-cta-banner__secondary-btn"
              onClick={() => scrollToSection('#tantangan-harian')}
            >
              <span>{locale === 'id' ? 'Mainkan Kuis 60 Detik' : 'Play 60s Quiz'}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M8 13V3M4 7l4-4 4 4" />
              </svg>
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

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
            {locale === 'id' ? 'Sains Memori & Jalur Belajar' : 'Cognitive Science & Journey'}
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
              ? 'Mempelajari adat, aksara, dan etiket asing rentan terlupakan dalam hitungan hari. Kami menggabungkan sains spaced repetition Leitner, 60+ quest bertingkat, dan rekam jejak lencana agar wawasan budaya Anda melekat seumur hidup.'
              : 'Learning unfamiliar customs and geography is prone to rapid decay. We unite Leitner spaced repetition science, 60+ tiered quests, and verified explorer rank tracking so your insights last a lifetime.'}
          </p>
        </div>

        {/* 3 Pilar Pembelajaran (Bento Architecture) */}
        <div className="expedition-mastery__pillars">
          {/* Pilar 1: Sains Memori Leitner */}
          <article className="mastery-pillar">
            <span className="mastery-pillar__badge">
              <svg
                className="mastery-pillar__badge-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
                <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
              </svg>
              <span>{locale === 'id' ? 'Sains Kognitif' : 'Cognitive Science'}</span>
            </span>
            <h3 className="mastery-pillar__title">
              {locale === 'id' ? 'Sistem 5 Kotak Spaced Repetition' : '5-Box Spaced Repetition System'}
            </h3>
            <p className="mastery-pillar__desc">
              {locale === 'id'
                ? 'Melawan Kurva Lupa Ebbinghaus. Kartu etiket yang baru dipelajari ditinjau setiap hari, lalu diulang secara bertahap pada hari ke-3, ke-7, dan ke-14 hingga menetap di memori jangka panjang.'
                : 'Defeating the Ebbinghaus Forgetting Curve. Newly discovered customs are reviewed daily, expanding systematically to intervals of 3, 7, and 14 days until solidified in permanent memory.'}
            </p>

            {/* Visual 5-Box Step */}
            <div className="leitner-visual" aria-hidden="true">
              <div className="leitner-box">
                <span className="leitner-box__icon">B1</span>
                <span className="leitner-box__label">Harian</span>
              </div>
              <svg className="leitner-arrow" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
              <div className="leitner-box">
                <span className="leitner-box__icon">B2</span>
                <span className="leitner-box__label">3 Hari</span>
              </div>
              <svg className="leitner-arrow" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
              <div className="leitner-box">
                <span className="leitner-box__icon">B3</span>
                <span className="leitner-box__label">1 Minggu</span>
              </div>
              <svg className="leitner-arrow" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
              <div className="leitner-box">
                <span className="leitner-box__icon">B4</span>
                <span className="leitner-box__label">2 Minggu</span>
              </div>
              <svg className="leitner-arrow" width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
              <div className="leitner-box leitner-box--active">
                <span className="leitner-box__icon">B5</span>
                <span className="leitner-box__label">Permanen</span>
              </div>
            </div>
          </article>

          {/* Pilar 2: 60+ Misi Ekspedisi */}
          <article className="mastery-pillar">
            <span className="mastery-pillar__badge">
              <svg
                className="mastery-pillar__badge-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
              </svg>
              <span>{locale === 'id' ? 'Kurikulum Berjenjang' : 'Curated Quests'}</span>
            </span>
            <h3 className="mastery-pillar__title">
              {locale === 'id' ? '60+ Misi Skenario Budaya Riil' : '60+ Authentic Cultural Quests'}
            </h3>
            <p className="mastery-pillar__desc">
              {locale === 'id'
                ? 'Bukan hafalan pilihan ganda kering. Anda memecahkan dilema jamuan makan di Tokyo, membedakan dialek fonetik di Samarkand, dan mengenali bentang alam dari foto udara satelit.'
                : 'Not dry textbook memorization. Resolve diplomatic dining dilemmas in Tokyo, decipher phonetic greetings along the Silk Road, and identify ancient monuments from terrain imagery.'}
            </p>

            <div className="ranks-visual" aria-hidden="true">
              <div className="rank-item">
                <span className="rank-item__name">Sapaan & Fonetik 15 Aksara</span>
                <span className="rank-item__level">15 Quest</span>
              </div>
              <div className="rank-item">
                <span className="rank-item__name">Etiket Meja Makan & Majlis</span>
                <span className="rank-item__level">20 Quest</span>
              </div>
              <div className="rank-item">
                <span className="rank-item__name">Geografi & Bentang Alam</span>
                <span className="rank-item__level">25 Quest</span>
              </div>
            </div>
          </article>

          {/* Pilar 3: Tingkatan & Lencana Penjelajah */}
          <article className="mastery-pillar">
            <span className="mastery-pillar__badge">
              <svg
                className="mastery-pillar__badge-icon"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
              <span>{locale === 'id' ? 'Rekam Jejak' : 'Explorer Progression'}</span>
            </span>
            <h3 className="mastery-pillar__title">
              {locale === 'id' ? 'Gelar Kehormatan & Pangkat' : 'Honors, Ranks & Badges'}
            </h3>
            <p className="mastery-pillar__desc">
              {locale === 'id'
                ? 'Setiap jawaban tepat dan konsistensi harian menghasilkan poin XP dan lencana terverifikasi. Tingkatkan reputasi Anda dari Pelancong Pemula hingga Mahaguru Penjelajah Benua.'
                : 'Every accurate cultural choice and streak awards verified expedition XP. Ascend from Novice Traveler to continental Cultural Diplomat and Master Explorer of Asia.'}
            </p>

            <div className="ranks-visual" aria-hidden="true">
              <div className="rank-item">
                <span className="rank-item__name">Pelancong Pemula</span>
                <span className="rank-item__level">Lv. 1</span>
              </div>
              <div className="rank-item">
                <span className="rank-item__name">Penjelajah Jalur Rempah</span>
                <span className="rank-item__level">Lv. 15</span>
              </div>
              <div className="rank-item">
                <span className="rank-item__name">Diplomat Budaya Asia</span>
                <span className="rank-item__level">Lv. 30</span>
              </div>
              <div className="rank-item">
                <span className="rank-item__name" style={{ color: 'var(--terracotta)' }}>Mahaguru Penjelajah Benua</span>
                <span className="rank-item__level">Lv. 50</span>
              </div>
            </div>
          </article>
        </div>

        {/* CTA Banner Megah Penutup Landing Page */}
        <aside className="mastery-cta-banner" aria-label="Ajakan Bertualang">
          <div className="mastery-cta-banner__content">
            <h3 className="mastery-cta-banner__title">
              {locale === 'id' ? (
                <>
                  Siap Memulai Ekspedisi <span className="mastery-cta-banner__title-accent">Pertama Anda?</span>
                </>
              ) : (
                <>
                  Ready to Embark on Your <span className="mastery-cta-banner__title-accent">First Expedition?</span>
                </>
              )}
            </h3>
            <p className="mastery-cta-banner__desc">
              {locale === 'id'
                ? 'Jelajahi seluruh profil 48 negara, latih refleks norma budaya Anda, dan pantau progres hafalan di ruang belajar. Tersimpan otomatis di browser tanpa biaya.'
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


import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { countries, countryById } from '@/content/countries';
import type { Country } from '@/content/countries';
import { iso3For } from '@/content/countries48';
import { COUNTRY_COORDINATES, formatDMS } from '@/lib/geo-coords';
import { useI18n } from '@/lib/i18n';
import { cancelSpeech, speak } from '@/lib/speech';
import { differs, profileFor } from '@/sections/country/scripts';
import { getHeroPhoto, photoObjectPosition } from './photos';

type CountryPreviewPanelProps = {
  countryId: string;
  open: boolean;
  onClose: () => void;
};

const TOTAL = countries.length;

/**
 * Pratinjau editorial di dalam hero: peta tetap terlihat, negara terpilih
 * di-frame kamera, lalu pembaca memutuskan masuk ke halaman negara.
 * Non-modal di desktop; bottom sheet di ponsel.
 *
 * Semua 48 negara resolve lewat `countries.ts` dan memakai badan penuh.
 * Foto tetap opsional: negara tanpa foto tampil sebagai komposisi teks murni
 * (figure-nya dihilangkan), tetap dengan CTA ke `/negara/:id`.
 */
export default function CountryPreviewPanel({
  countryId,
  open,
  onClose,
}: CountryPreviewPanelProps) {
  const { locale, t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  const country = countryById(countryId, locale);
  if (!country) {
    return null;
  }

  const name = country.nameId;
  const index = Math.max(0, countries.findIndex((c) => c.id === countryId)) + 1;

  return (
    <aside
      id="country-preview"
      className="country-preview"
      data-open={open ? 'true' : 'false'}
      data-country={countryId}
      data-depth={country.depth === 'Lengkap' ? 'full' : 'explore'}
      role="region"
      aria-label={`${t('preview.regionLabel')}: ${name}`}
    >
      <p className="visually-hidden" role="status" aria-live="polite">
        {open ? `${name} — ${t('preview.live')}` : ''}
      </p>

      <button
        ref={closeRef}
        type="button"
        className="country-preview__close"
        aria-label={t('preview.close')}
        onClick={onClose}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>

      <div className="country-preview__scroll">
        <div className="country-preview__topline">
          <span className="country-preview__eyebrow">{t('preview.eyebrow')}</span>
          <span className="country-preview__index">
            {String(index).padStart(2, '0')} / {TOTAL}
          </span>
        </div>

        <PreviewBody country={country} />
      </div>
    </aside>
  );
}

function PreviewBody({ country }: { country: Country }) {
  const { locale, t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);

  const photo = getHeroPhoto(country.id);
  const profile = profileFor(country);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, [country.id]);

  const handlePlayAudio = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPlaying) {
      cancelSpeech();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    const ok = speak(country.greeting.native, {
      lang: profile.speechLang,
      fallbackText: country.greeting.roman,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });

    if (!ok) {
      setIsPlaying(false);
    }
  };
  const position = photo ? photoObjectPosition(photo) : '50% 40%';
  const depthLabel =
    country.depth === 'Lengkap'
      ? t('preview.depthFull')
      : t('preview.depthExplore');
  const ctaLabel =
    country.depth === 'Lengkap' ? t('preview.ctaFull') : t('preview.ctaExplore');
  const altText =
    (locale === 'en' ? photo?.alt.en : photo?.alt.id) ??
    `${t('preview.photoFallback')} ${country.nameId}`;

  const avifLarge = photo?.avif.find((format) => format.w === 1600);
  const avifSmall = photo?.avif.find((format) => format.w === 960) ?? photo?.avif[0];
  const avifSrcSet =
    avifLarge && avifSmall && avifLarge !== avifSmall
      ? `${avifSmall.file} 960w, ${avifLarge.file} 1600w`
      : avifSmall?.file;

  const webpLarge = photo?.webp.find((format) => format.w === 1600);
  const webpSmall = photo?.webp.find((format) => format.w === 960) ?? photo?.webp[0];
  const webpSrcSet =
    webpLarge && webpSmall && webpLarge !== webpSmall
      ? `${webpSmall.file} 960w, ${webpLarge.file} 1600w`
      : webpSmall?.file;

  const fallbackSrc = webpSmall?.file ?? avifSmall?.file ?? '';

  const greetingRomanDiffers = differs(
    country.greeting.native,
    country.greeting.roman,
  );

  const iso3 = iso3For(country.id);
  const coords = iso3 ? COUNTRY_COORDINATES[iso3] : null;
  const dms = coords ? formatDMS(coords.lat, coords.lon) : null;
  const equatorDistance = coords
    ? `${Math.round(Math.abs(coords.lat) * 111.1).toLocaleString(locale === 'id' ? 'id-ID' : 'en-US')} km ${
        coords.lat >= 0
          ? locale === 'id'
            ? 'Utara Ekuator'
            : 'North of Equator'
          : locale === 'id'
            ? 'Selatan Ekuator'
            : 'South of Equator'
      }`
    : null;

  return (
    <>
      <div className="country-preview__body">
        {photo ? (
          <figure className="country-preview__figure">
            <div
              className="country-preview__frame"
              style={{ backgroundColor: photo.dominant }}
            >
              <picture className="country-preview__picture">
                {avifSrcSet ? (
                  <source
                    type="image/avif"
                    srcSet={avifSrcSet}
                    sizes="(max-width: 767px) 104px, 210px"
                  />
                ) : null}
                {webpSrcSet ? (
                  <source
                    type="image/webp"
                    srcSet={webpSrcSet}
                    sizes="(max-width: 767px) 104px, 210px"
                  />
                ) : null}
                <img
                  className="country-preview__img"
                  src={fallbackSrc}
                  alt={altText}
                  loading="eager"
                  decoding="async"
                  style={{ objectPosition: position }}
                />
              </picture>
            </div>
            <figcaption className="country-preview__credit">
              <span>
                {t('preview.credit')}: {photo.credit.author} ·{' '}
                {photo.credit.license}
              </span>
              <a href={photo.credit.sourceUrl} target="_blank" rel="noreferrer">
                {t('preview.creditSource')}
              </a>
            </figcaption>
          </figure>
        ) : null}

        <div className="country-preview__text">
          <p className="country-preview__meta">
            <span className="country-preview__region">{country.region}</span>
            <span className="country-preview__depth">{depthLabel}</span>
          </p>

          <h2 className="country-preview__name">{country.nameId}</h2>
          <p className="country-preview__native-name" lang={profile.lang}>
            {country.nameLocal}
          </p>

          {dms ? (
            <div
              className="country-preview__geodetic"
              aria-label={locale === 'id' ? 'Datum Geodetik' : 'Geodetic Datum'}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
                className="country-preview__geodetic-icon"
              >
                <circle cx="8" cy="8" r="6.5" />
                <path d="M8 1.5v13M1.5 8h13M2.5 5c1.8 1 3.7 1.5 5.5 1.5s3.7-.5 5.5-1.5M2.5 11c1.8-1 3.7-1.5 5.5-1.5s3.7.5 5.5 1.5" />
              </svg>
              <span className="country-preview__geodetic-coord">{dms}</span>
              {equatorDistance ? (
                <>
                  <span className="country-preview__geodetic-sep" aria-hidden="true">
                    ·
                  </span>
                  <span className="country-preview__geodetic-dist">{equatorDistance}</span>
                </>
              ) : null}
            </div>
          ) : null}

          <p className="country-preview__teaser">{country.peopleNote}</p>

          <blockquote className="country-preview__greeting">
            <div className="country-preview__greeting-header">
              <span className="country-preview__greeting-label">
                {t('preview.greeting')}
              </span>
              <button
                type="button"
                className={`country-preview__audio-btn ${isPlaying ? 'country-preview__audio-btn--playing' : ''}`}
                onClick={handlePlayAudio}
                aria-label={`${t('preview.listenGreeting')}: ${country.nameId} (${country.greeting.native})`}
                title={`${t('preview.listenGreeting')}: ${country.greeting.native}`}
              >
                {isPlaying ? (
                  <span className="country-preview__soundwave" aria-hidden="true">
                    <span className="country-preview__soundwave-bar" />
                    <span className="country-preview__soundwave-bar" />
                    <span className="country-preview__soundwave-bar" />
                  </span>
                ) : (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
            </div>
            <span
              className="country-preview__greeting-native"
              lang={profile.lang}
              dir={profile.dir}
            >
              {country.greeting.native}
            </span>
            {greetingRomanDiffers ? (
              <span className="country-preview__greeting-roman">
                {country.greeting.roman}
              </span>
            ) : null}
            {country.greeting.meaningId ? (
              <span className="country-preview__greeting-meaning">
                &ldquo;{country.greeting.meaningId}&rdquo;
              </span>
            ) : null}
          </blockquote>
        </div>
      </div>

      {country.depth === 'Penjelajahan' ? (
        <p className="country-preview__note">{t('preview.exploreNote')}</p>
      ) : null}

      <div className="country-preview__actions">
        <Link className="country-preview__cta" to={`/negara/${country.id}`}>
          <span>{ctaLabel}</span>
          <span className="country-preview__cta-arrow" aria-hidden="true">
            &rarr;
          </span>
        </Link>
      </div>
    </>
  );
}

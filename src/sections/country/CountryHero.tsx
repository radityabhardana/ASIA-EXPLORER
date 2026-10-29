import { useEffect, useRef } from 'react';

import type { Country } from '@/content/countries';
import imagesData from '@/content/images.json';
import {
  COUNTRY_COORDINATES,
  formatDMS,
  formatDistanceKm,
  haversineDistanceKm,
} from '@/lib/geo-coords';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';

interface ImageFormat {
  w: number;
  file: string;
  w_px: number;
  h_px: number;
}

interface ImageCredit {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  required: boolean;
}

interface ImageItem {
  slug: string;
  role: string;
  width: number;
  height: number;
  focus: { x: number; y: number };
  dominant: string;
  lqip: string;
  avif: ImageFormat[];
  webp: ImageFormat[];
  credit: ImageCredit;
  alt: { id: string; en: string };
}

type ImagesDataMap = {
  countries: Record<string, ImageItem[]>;
};

const typedImages = imagesData as unknown as ImagesDataMap;

export function getHeroPhoto(countryId: string): ImageItem | undefined {
  const countryPhotos = typedImages.countries[countryId];
  if (!countryPhotos || countryPhotos.length === 0) return undefined;
  return countryPhotos.find((p) => p.role === 'hero') ?? countryPhotos[0];
}

type CountryHeroProps = {
  country: Country;
  profile: TextProfile;
};

export default function CountryHero({ country, profile }: CountryHeroProps) {
  const photo = getHeroPhoto(country.id);
  const heroRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      return;
    }

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (heroRef.current && mediaRef.current) {
            const rect = heroRef.current.getBoundingClientRect();
            // Subtle parallax translateY within viewport
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
              const shift = (rect.top * 0.18).toFixed(1);
              mediaRef.current.style.transform = `translate3d(0, ${shift}px, 0)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const avif960 = photo?.avif.find((a) => a.w === 960) ?? photo?.avif[0];
  const avif1600 = photo?.avif.find((a) => a.w === 1600) ?? photo?.avif[photo.avif.length - 1];
  const webp960 = photo?.webp.find((w) => w.w === 960) ?? photo?.webp[0];
  const webp1600 = photo?.webp.find((w) => w.w === 1600) ?? photo?.webp[photo.webp.length - 1];

  const avifSrcSet =
    avif960 && avif1600 && avif960.file !== avif1600.file
      ? `${avif960.file} 960w, ${avif1600.file} 1600w`
      : (avif1600?.file ?? avif960?.file ?? '');

  const webpSrcSet =
    webp960 && webp1600 && webp960.file !== webp1600.file
      ? `${webp960.file} 960w, ${webp1600.file} 1600w`
      : (webp1600?.file ?? webp960?.file ?? '');

  const fallbackImg = webp1600?.file ?? webp960?.file ?? photo?.webp[0]?.file ?? '';
  const showDistinctLocalName = country.nameLocal !== country.nameId;
  const iso3 = (country.iso3 || country.id).toUpperCase();
  const coords = COUNTRY_COORDINATES[iso3];
  const distFromJakarta =
    coords && country.id !== 'id'
      ? haversineDistanceKm(-6.2088, 106.8456, coords.lat, coords.lon)
      : null;

  return (
    <header className="country-hero" ref={heroRef}>
      <div className="country-hero__visual-frame">
        {photo && (
          <div className="country-hero__media" ref={mediaRef}>
            <picture className="country-hero__picture">
              {avifSrcSet && (
                <source
                  type="image/avif"
                  srcSet={avifSrcSet}
                  sizes="(max-width: 900px) 100vw, (max-width: 1440px) 100vw, 1200px"
                />
              )}
              {webpSrcSet && (
                <source
                  type="image/webp"
                  srcSet={webpSrcSet}
                  sizes="(max-width: 900px) 100vw, (max-width: 1440px) 100vw, 1200px"
                />
              )}
              <img
                src={fallbackImg}
                alt={photo.alt.id}
                width={photo.width}
                height={photo.height}
                loading="eager"
                decoding="async"
                className="country-hero__img"
                style={{
                  objectPosition: `${photo.focus.x * 100}% ${photo.focus.y * 100}%`,
                }}
              />
            </picture>
          </div>
        )}

        {/* Scrim overlay for editorial contrast */}
        <div className="country-hero__scrim" aria-hidden="true" />

        {/* Large authentic native script watermark */}
        <div className="country-hero__watermark" aria-hidden="true">
          <NativeText profile={profile}>{country.nameLocal}</NativeText>
        </div>

        {/* Overlay country identity directly on banner */}
        <div className="country-hero__inner">
          {showDistinctLocalName && (
            <p className="country-hero__local">
              <NativeText profile={profile}>{country.nameLocal}</NativeText>
            </p>
          )}
          <h1 id="country-title" className="country-hero__name">
            {country.nameId}
          </h1>
          <p className="country-hero__meta">
            {coords && (
              <>
                <span className="country-hero__coord">{formatDMS(coords.lat, coords.lon)}</span>
                <span className="country-hero__sep" aria-hidden="true">
                  {' '}
                  ·{' '}
                </span>
              </>
            )}
            {distFromJakarta !== null && (
              <>
                <span className="country-hero__dist">
                  {formatDistanceKm(distFromJakarta, 'id')} dari Jakarta
                </span>
                <span className="country-hero__sep" aria-hidden="true">
                  {' '}
                  ·{' '}
                </span>
              </>
            )}
            <span className="country-hero__region">{country.region}</span>
            <span className="country-hero__sep" aria-hidden="true">
              {' '}
              ·{' '}
            </span>
            <span className="country-honesty-marker">{country.depth}</span>
          </p>
        </div>

        {/* Photographer credit and CC license badge in bottom corner */}
        {photo && (
          <figcaption className="country-hero__caption">
            <span className="country-hero__caption-credit">
              Foto: {photo.credit.author} ·{' '}
              <a
                href={photo.credit.licenseUrl || photo.credit.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="country-hero__caption-license"
              >
                {photo.credit.license}
              </a>
            </span>
          </figcaption>
        )}
      </div>
    </header>
  );
}

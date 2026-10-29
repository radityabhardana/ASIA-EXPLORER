import { Link } from 'react-router-dom';

import { countries, type Country } from '@/content/countries';
import { COUNTRIES, iso3For } from '@/content/countries48';
import {
  COUNTRY_COORDINATES,
  formatDistanceKm,
  haversineDistanceKm,
} from '@/lib/geo-coords';
import type { Locale } from '@/lib/i18n';

interface CountryNeighborsProps {
  currentCountry: Country;
  locale?: Locale;
}

interface NeighborItem {
  country: Country;
  capital: string;
  distanceKm: number | null;
  sameRegion: boolean;
}

export default function CountryNeighbors({
  currentCountry,
  locale = 'id',
}: CountryNeighborsProps) {
  const currentIso3 = (
    currentCountry.iso3 ||
    iso3For(currentCountry.id) ||
    currentCountry.id
  ).toUpperCase();
  const currentCoords = COUNTRY_COORDINATES[currentIso3];

  const candidateNeighbors: NeighborItem[] = countries
    .filter((c) => c.id !== currentCountry.id)
    .map((c) => {
      const neighborIso3 = (c.iso3 || iso3For(c.id) || c.id).toUpperCase();
      const neighborCoords = COUNTRY_COORDINATES[neighborIso3];
      const dist =
        currentCoords && neighborCoords
          ? haversineDistanceKm(
              currentCoords.lat,
              currentCoords.lon,
              neighborCoords.lat,
              neighborCoords.lon,
            )
          : null;
      const sameRegion = c.region === currentCountry.region;
      const c48 = COUNTRIES[neighborIso3];

      return {
        country: c,
        capital: c48?.capital || '-',
        distanceKm: dist,
        sameRegion,
      };
    })
    .sort((a, b) => {
      // Prioritize same geographic region first
      if (a.sameRegion !== b.sameRegion) {
        return a.sameRegion ? -1 : 1;
      }
      // Then sort by geodetic distance ascending
      const distA = a.distanceKm ?? 999999;
      const distB = b.distanceKm ?? 999999;
      return distA - distB;
    })
    .slice(0, 3);

  const prefix = locale === 'en' ? '/en' : '';

  return (
    <section
      className="country-block country-neighbors"
      aria-labelledby="country-neighbors-title"
    >
      <div className="country-block__inner country-neighbors__inner">
        <header className="country-neighbors__header">
          <div className="country-neighbors__kicker-wrap">
            <span className="country-neighbors__mark" aria-hidden="true" />
            <p className="country-neighbors__kicker">
              {locale === 'id' ? 'LANJUTKAN PENJELAJAHAN' : 'CONTINUE EXPEDITION'}
            </p>
          </div>
          <h2 id="country-neighbors-title" className="country-neighbors__title">
            {locale === 'id'
              ? 'Jelajah Negara Terdekat & Kawasan Serumpun'
              : 'Explore Neighboring & Proximate Nations'}
          </h2>
          <p className="country-neighbors__subtitle">
            {locale === 'id'
              ? `Telusuri bangsa tetangga di lingkar ${currentCountry.region} untuk memperluas cakrawala geografi dan tradisi Anda.`
              : `Explore neighboring nations within the ${currentCountry.region} sphere to expand your cultural and cartographic horizons.`}
          </p>
        </header>

        <div className="country-neighbors__grid">
          {candidateNeighbors.map(({ country, capital, distanceKm }) => {
            const countryPath = `${prefix}/negara/${country.id}`;
            const showDistinctLocal = country.nameLocal !== country.nameId;

            return (
              <Link
                key={country.id}
                to={countryPath}
                className="country-neighbor-card"
                aria-label={`${country.nameId} (${capital}) — ${locale === 'id' ? 'Buka profil negara' : 'Open nation profile'}`}
              >
                <div className="country-neighbor-card__top">
                  <span className="country-neighbor-card__region">{country.region}</span>
                  {distanceKm !== null && (
                    <span className="country-neighbor-card__dist">
                      ~{formatDistanceKm(distanceKm, locale)}
                    </span>
                  )}
                </div>

                <div className="country-neighbor-card__main">
                  <h3 className="country-neighbor-card__name">
                    <span>{country.nameId}</span>
                    {showDistinctLocal && (
                      <span className="country-neighbor-card__local" aria-hidden="true">
                        {country.nameLocal}
                      </span>
                    )}
                  </h3>
                  <p className="country-neighbor-card__capital">
                    <span className="country-neighbor-card__meta-label">
                      {locale === 'id' ? 'Ibu kota:' : 'Capital:'}
                    </span>{' '}
                    <strong>{capital}</strong>
                  </p>
                </div>

                <div className="country-neighbor-card__footer">
                  <span className="country-neighbor-card__cta">
                    {locale === 'id' ? 'Telusuri Wilayah' : 'Explore Territory'}
                  </span>
                  <span className="country-neighbor-card__arrow" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useState, useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { Country } from '@/content/countries';

type Region = 'Semua' | 'Asia Tenggara' | 'Asia Timur' | 'Asia Selatan' | 'Asia Barat' | 'Asia Tengah';

const REGIONS: Region[] = [
  'Semua',
  'Asia Tenggara',
  'Asia Timur',
  'Asia Selatan',
  'Asia Barat',
  'Asia Tengah',
];

type CountryFilterGridProps = {
  countries: readonly Country[];
  onSelect: (id: string) => void;
};

export default function CountryFilterGrid({ countries, onSelect }: CountryFilterGridProps) {
  const [active, setActive] = useState<Region>('Semua');

  const filtered = useMemo(() => {
    if (active === 'Semua') return countries;
    return countries.filter((c) => c.region === active);
  }, [countries, active]);

  return (
    <div className="country-filter">
      {/* Region tabs */}
      <div className="country-filter__tabs" role="tablist" aria-label="Filter wilayah">
        {REGIONS.map((region) => {
          const count = region === 'Semua' ? countries.length : countries.filter(c => c.region === region).length;
          if (count === 0 && region !== 'Semua') return null;
          return (
            <button
              key={region}
              role="tab"
              aria-selected={active === region}
              className={`country-filter__tab ${active === region ? 'country-filter__tab--active' : ''}`}
              onClick={() => setActive(region)}
            >
              {region}
              <span className="country-filter__tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Country cards */}
      <ul className="country-filter__grid" role="tabpanel">
        {filtered.map((country) => (
          <li key={country.id} className="country-filter__item">
            <button
              type="button"
              className="country-filter__card"
              style={{ '--card-color': `var(--country-${country.id})` } as CSSProperties}
              onClick={() => onSelect(country.id)}
              aria-haspopup="dialog"
            >
              <span
                className="country-filter__swatch"
                aria-hidden="true"
              />
              <span className="country-filter__content">
                <span className="country-filter__name">{country.nameId}</span>
                <span className="country-filter__local">
                  {country.nameLocal}
                </span>
              </span>
              <span className="country-filter__region">{country.region}</span>
              <span className="country-filter__depth">{country.depth}</span>
              <span className="country-filter__watermark" aria-hidden="true">
                {country.nameLocal}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

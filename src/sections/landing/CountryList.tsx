import { countries } from './landing-data';

type CountryListProps = {
  onSelect: (id: string) => void;
};

/**
 * Kontrol keyboard nyata untuk peta (§0.6). Tersembunyi sampai ada fokus di
 * dalamnya, bukan dipindah ke `left: -9999px`, jadi target 44px tetap nyata.
 */
export default function CountryList({ onSelect }: CountryListProps) {
  return (
    <nav className="landing-country-list" aria-label="Daftar negara">
      <p className="landing-country-list__title">Pilih negara</p>
      <ul className="landing-country-list__items">
        {countries.map((country) => (
          <li key={country.id}>
            <button
              type="button"
              data-country={country.id}
              aria-haspopup="dialog"
              onClick={() => onSelect(country.id)}
            >
              {country.nameId}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

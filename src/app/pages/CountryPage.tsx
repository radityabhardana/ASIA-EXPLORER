import { Link, Navigate, useParams } from 'react-router-dom';

import { MAP_COUNTRIES } from '@/lib/map-paths';

/**
 * Placeholder rute `/negara/:id`. Halaman negara sebenarnya diisi lane L8;
 * di sini hanya validasi id dan landmark halaman.
 */
export default function CountryPage() {
  const { id } = useParams();
  const country = MAP_COUNTRIES.find((entry) => entry.id === id);

  if (!country) {
    return <Navigate to="/" replace />;
  }

  return (
    <article className="page-placeholder" aria-labelledby="country-title">
      <p>
        <Link to="/">← Kembali ke beranda</Link>
      </p>
      <p className="page-placeholder__eyebrow">Halaman negara</p>
      <h1 id="country-title">{country.name_id}</h1>
      <p className="page-placeholder__lede">
        Cerita, budaya, orang, dan bahasa {country.name_id} menyusul.
      </p>
    </article>
  );
}

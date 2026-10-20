import { Link } from 'react-router-dom';

/**
 * Placeholder rute `/`. Konten landing (hero, narasi scroll, section editorial)
 * diisi lane lain; file ini hanya menjaga rute dan landmark tetap hidup.
 */
export default function LandingPage() {
  return (
    <section className="page-placeholder" aria-labelledby="landing-title">
      <p className="page-placeholder__eyebrow">Asia dalam satu layar</p>
      <h1 id="landing-title">ASIAKIN</h1>
      <p className="page-placeholder__lede">
        Jelajahi benua Asia, dengarkan sapaan aslinya, lalu buka cerita tiap
        negara.
      </p>
      <p>
        <Link to="/negara/jp">Lihat contoh halaman negara</Link>
      </p>
    </section>
  );
}

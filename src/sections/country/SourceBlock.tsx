import type { Country } from '@/content/countries';

type SourceBlockProps = {
  sources: Country['sources'];
  needsVerification?: Country['needsVerification'];
  depth: Country['depth'];
};

export default function SourceBlock({ sources, needsVerification, depth }: SourceBlockProps) {
  const hasVerification = needsVerification && needsVerification.length > 0;

  return (
    <footer className="country-sources">
      <div className="country-sources__inner">
        <p className="country-sources__depth country-honesty-marker">
          {depth === 'Lengkap' ? 'Lengkap' : 'Penjelajahan'}
        </p>
        <h2 className="country-sources__title">Sumber</h2>
        <ol className="country-sources__list">
          {sources.map((source, i) => (
            <li key={i} className="country-sources__item">
              <a
                href={source.url}
                className="country-sources__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {source.what}
              </a>
            </li>
          ))}
        </ol>
        {hasVerification && (
          <details className="country-verification">
            <summary>Perlu verifikasi</summary>
            <ul className="country-verification__list">
              {needsVerification.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </footer>
  );
}

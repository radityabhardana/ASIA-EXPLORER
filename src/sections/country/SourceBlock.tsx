import type { Country } from '@/content/countries';

type SourceBlockProps = {
  sources: Country['sources'];
  needsVerification?: Country['needsVerification'];
  depth?: Country['depth'];
};

export default function SourceBlock({ sources, needsVerification }: SourceBlockProps) {
  const hasVerification = needsVerification && needsVerification.length > 0;

  return (
    <footer className="country-block country-sources" aria-labelledby="country-sources-title">
      <div className="country-block__inner">
        <h2 id="country-sources-title" className="country-sources__title">
          Sumber
        </h2>
        <ol className="country-sources__list">
          {sources.map((source, i) => (
            <li key={i} className="country-sources__item">
              {source.url ? (
                <a
                  href={source.url}
                  className="country-sources__link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.what}
                </a>
              ) : (
                <span className="country-sources__text">{source.what}</span>
              )}
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

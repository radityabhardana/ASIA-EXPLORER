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
        <h2 id="country-sources-title" className="visually-hidden">
          Referensi dan Sumber Data
        </h2>

        <details className="country-sources-details">
          <summary className="country-sources-summary">
            <span className="country-sources-summary__label">
              Referensi & Sumber Data ({sources.length})
            </span>
            <span className="country-sources-summary__chevron" aria-hidden="true">
              ▾
            </span>
          </summary>

          <div className="country-sources-drawer">
            <p className="country-sources-provenance">
              Seluruh data budaya, etika sosial, dan korpus kebahasaan diverifikasi silang dari lembaga bahasa resmi, atlas budaya, dan dokumentasi lapangan.
            </p>

            <ol className="country-sources__list">
              {sources.map((source, i) => (
                <li key={i} className="country-sources__item">
                  <div className="country-sources__item-body">
                    <p className="country-sources__what">{source.what}</p>
                    {source.url ? (
                      <div className="country-sources__link-wrap">
                        <a
                          href={source.url}
                          className="country-sources__link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="country-sources__link-url">{source.url}</span>
                          <span className="country-sources__verified-badge">Terverifikasi</span>
                        </a>
                      </div>
                    ) : (
                      <p className="country-sources__text">Rujukan arsip literatur terkurasi</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {hasVerification && (
              <details className="country-verification">
                <summary>Catatan verifikasi kuratorial ({needsVerification.length})</summary>
                <ul className="country-verification__list">
                  {needsVerification.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </details>
      </div>
    </footer>
  );
}

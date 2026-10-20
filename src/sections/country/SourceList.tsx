import type { Source } from '@/content/countries';

type SourceListProps = {
  sources: readonly Source[];
  needsVerification: readonly string[];
};

const PRIMARY_SOURCE_COUNT = 3;

function SourceItem({ source }: { source: Source }) {
  const label = source.what.trim().length > 0 ? source.what : source.url;
  return (
    <li className="country-sources__item">
      {source.url.length > 0 ? (
        <a
          className="country-sources__link"
          href={source.url}
          target="_blank"
          rel="noopener noreferrer external"
        >
          {label}
        </a>
      ) : (
        <span>{label}</span>
      )}
    </li>
  );
}

export default function SourceList({ sources, needsVerification }: SourceListProps) {
  const primary = sources.slice(0, PRIMARY_SOURCE_COUNT);
  const remainder = sources.slice(PRIMARY_SOURCE_COUNT);

  return (
    <footer className="country-sources">
      <div className="country-sources__inner">
        <h2 className="country-sources__title">Sumber</h2>
        <ol className="country-sources__list">
          {primary.map((source, index) => (
            <SourceItem key={`${source.url}-${index}`} source={source} />
          ))}
        </ol>

        {remainder.length > 0 && (
          <details className="country-sources__more">
            <summary>Sumber tambahan ({remainder.length})</summary>
            <ol className="country-sources__list" start={PRIMARY_SOURCE_COUNT + 1}>
              {remainder.map((source, index) => (
                <SourceItem key={`${source.url}-${index}`} source={source} />
              ))}
            </ol>
          </details>
        )}

        {needsVerification.length > 0 && (
          <details className="country-verification">
            <summary>Catatan verifikasi</summary>
            <ul className="country-verification__list">
              {needsVerification.map((note, index) => (
                <li key={`${index}-${note}`}>{note}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </footer>
  );
}

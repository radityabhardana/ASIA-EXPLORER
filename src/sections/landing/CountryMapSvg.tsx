import type { CSSProperties, KeyboardEvent } from 'react';

import { mapPaths } from './landing-data';

type CountryMapSvgProps = {
  /**
   * `scene` = peta dekoratif dengan 15 path yang bisa di-highlight.
   * `interactive` = fallback tanpa WebGL; setiap path bisa difokus dan dipilih.
   */
  variant?: 'scene' | 'interactive';
  className?: string;
  onSelect?: (id: string) => void;
};

const VIEW_BOX = '0 160 1000 680';

export default function CountryMapSvg({
  variant = 'scene',
  className,
  onSelect,
}: CountryMapSvgProps) {
  const interactive = variant === 'interactive';
  const rootClass = [
    'landing-map',
    interactive ? 'landing-map--interactive' : 'landing-map--scene',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      className={rootClass}
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMidYMid meet"
      role={interactive ? 'group' : 'presentation'}
      aria-label={interactive ? 'Peta Asia' : undefined}
      aria-hidden={interactive ? undefined : true}
      focusable="false"
    >
      {mapPaths.map((entry) => {
        const pathStyle = { fill: `var(${entry.paletteKey})` } as CSSProperties;

        if (!interactive) {
          return (
            <path
              key={entry.id}
              d={entry.d}
              className="landing-map__country"
              style={pathStyle}
              data-highlight
            />
          );
        }

        const select = () => onSelect?.(entry.id);
        const handleKey = (event: KeyboardEvent<SVGPathElement>) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            select();
          }
        };

        return (
          <path
            key={entry.id}
            d={entry.d}
            className="landing-map__country"
            style={pathStyle}
            role="button"
            tabIndex={0}
            aria-label={entry.name_id}
            aria-haspopup="dialog"
            onClick={select}
            onKeyDown={handleKey}
          >
            <title>{entry.name_id}</title>
          </path>
        );
      })}
    </svg>
  );
}

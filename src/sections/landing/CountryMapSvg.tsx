import { useEffect } from 'react';
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

// Urutkan 15 negara dari Barat ke Timur (berdasarkan centroid X)
// agar sorotan di Scene 2 Skala menyala secara geografis dari Turki sampai Jepang.
const sortedMapPaths = [...mapPaths].sort((a, b) => a.centroid[0] - b.centroid[0]);

export default function CountryMapSvg({
  variant = 'scene',
  className,
  onSelect,
}: CountryMapSvgProps) {
  const interactive = variant === 'interactive';

  useEffect(() => {
    if (variant !== 'scene' || typeof window === 'undefined') {
      return;
    }
    const win = window as unknown as {
      __asiakin_scenes?: Record<string, unknown>;
    };
    win.__asiakin_scenes ??= {};
    win.__asiakin_scenes.scale = {
      ready: true,
      lit: () => {
        const counterEl = document.querySelector(
          '.landing-scene--scale [data-counter]',
        );
        const count = Math.min(
          15,
          Math.max(0, parseInt(counterEl?.textContent?.trim() ?? '0', 10)),
        );
        return sortedMapPaths.slice(0, count).map((p) => p.id);
      },
      highlightProgress: () => {
        const counterEl = document.querySelector(
          '.landing-scene--scale [data-counter]',
        );
        const val = parseInt(counterEl?.textContent?.trim() ?? '0', 10);
        return val / 15;
      },
      highlightCount: () => {
        const counterEl = document.querySelector(
          '.landing-scene--scale [data-counter]',
        );
        return Math.min(
          15,
          Math.max(0, parseInt(counterEl?.textContent?.trim() ?? '0', 10)),
        );
      },
    };

    return () => {
      if (win.__asiakin_scenes) {
        delete win.__asiakin_scenes.scale;
      }
    };
  }, [variant]);
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
      {sortedMapPaths.map((entry) => {
        const pathStyle = { fill: `var(${entry.paletteKey})` } as CSSProperties;

        if (!interactive) {
          return (
            <path
              key={entry.id}
              d={entry.d}
              className="landing-map__country"
              style={pathStyle}
              data-country={entry.id}
              data-highlight
            >
              <title>{entry.name_id}</title>
            </path>
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

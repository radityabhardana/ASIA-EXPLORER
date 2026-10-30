import { Suspense, lazy, useState } from 'react';

import '@/styles/scene.css';

/**
 * Rute DEV `/lab/scene` — bukan bagian produk. Dipakai Playwright untuk
 * membuktikan picking lewat raycast, ukuran render, dan screenshot.
 * `three` hanya masuk lewat dynamic import di sini.
 */
const AsiaMap48 = lazy(() => import('@/sections/landing/AsiaSceneLazy'));

export default function SceneLab() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  return (
    <div className="scene-lab">
      <div className="scene-lab__stage">
        <Suspense fallback={<p className="scene-lab__status">Memuat scene…</p>}>
          <AsiaMap48
            label="Lab peta Asia 48 negara"
            selectedId={selected}
            idleSway={false}
            onHoverCountry={setHovered}
            onSelectCountry={setSelected}
            onUnavailable={() => setUnavailable(true)}
          />
        </Suspense>
      </div>
      <div className="scene-lab__hud">
        <p>
          Terpilih: <strong data-testid="scene-selection">{selected ?? '-'}</strong>
        </p>
        <p>
          Hover: <span data-testid="scene-hover">{hovered ?? '-'}</span>
        </p>
        {unavailable ? (
          <p data-testid="scene-unavailable">WebGL tidak tersedia</p>
        ) : null}
      </div>
    </div>
  );
}
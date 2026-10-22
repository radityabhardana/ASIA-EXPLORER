import { useEffect, useRef, useState } from 'react';
import { mountPanelMap, type PanelMapInstance } from '@/scene/map48/panel-map.js';

interface InteractiveAsiaMap48Props {
  onSelectCountry?: (code: string) => void;
  className?: string;
}

export default function InteractiveAsiaMap48({
  onSelectCountry,
  className = '',
}: InteractiveAsiaMap48Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let destroyed = false;
    let panelInstance: PanelMapInstance | null = null;

    mountPanelMap(el, {
      interactive: true,
      onSelect: (code: string) => {
        onSelectCountry?.(code);
      },
    })
      .then((instance: PanelMapInstance) => {
        if (destroyed) {
          instance?.destroy?.();
          return;
        }
        panelInstance = instance;
        setReady(true);
      })
      .catch((err: unknown) => {
        console.error('Gagal memuat peta 48 negara:', err);
      });

    return () => {
      destroyed = true;
      if (panelInstance) {
        panelInstance.destroy?.();
        panelInstance = null;
      }
    };
  }, [onSelectCountry]);

  return (
    <div
      ref={containerRef}
      className={`interactive-asia-map48 ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 10',
        minHeight: '460px',
        overflow: 'visible',
        backgroundColor: 'transparent',
      }}
    >
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            placeItems: 'center',
            color: 'var(--ink-muted, #5c6670)',
            fontFamily: 'var(--font-text, sans-serif)',
            fontSize: '14px',
          }}
        >
          Memuat 48 negara...
        </div>
      )}
    </div>
  );
}

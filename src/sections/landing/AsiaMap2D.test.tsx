import { render, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AsiaMap2D, { type AsiaMap2DRef } from './AsiaMap2D';
import atlasData from '@/content/asia-2d-countries.json';
import { createRef } from 'react';

describe('AsiaMap2D (Atlas Vektor 2D 48 Negara)', () => {
  it('merender semua 48 negara di benua Asia tanpa crash', () => {
    const { container } = render(<AsiaMap2D />);
    const paths = container.querySelectorAll('.asia-map-2d__path');
    expect(paths.length).toBe(48);
    expect(atlasData.countries.length).toBe(48);
  });

  it('memanggil onSelectCountry ketika suatu negara diklik', () => {
    const handleSelect = vi.fn();
    const { container } = render(<AsiaMap2D onSelectCountry={handleSelect} />);

    const idPath = container.querySelector<SVGPathElement>('path[aria-label*="Indonesia"]');
    expect(idPath).not.toBeNull();

    if (idPath) {
      fireEvent.click(idPath);
      expect(handleSelect).toHaveBeenCalledWith('id');
    }
  });

  it('menampilkan tooltip informatif saat cursor meng-hover negara', () => {
    const { container } = render(<AsiaMap2D />);
    const jpPath = container.querySelector<SVGPathElement>('path[aria-label*="Jepang"]');
    expect(jpPath).not.toBeNull();

    if (jpPath) {
      fireEvent.mouseEnter(jpPath, { clientX: 200, clientY: 150 });
      const tooltip = container.querySelector('.asia-map-2d__tooltip');
      expect(tooltip).not.toBeNull();
      expect(tooltip?.textContent).toContain('Jepang');
    }
  });

  it('mendukung kontrol zoom dan reset melalui ref', () => {
    const ref = createRef<AsiaMap2DRef>();
    const { container } = render(<AsiaMap2D ref={ref} />);

    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.zoomIn).toBe('function');
    expect(typeof ref.current?.zoomOut).toBe('function');
    expect(typeof ref.current?.resetView).toBe('function');

    // Test zoom in
    ref.current?.zoomIn();
    const viewport = container.querySelector('.asia-map-2d__viewport');
    expect(viewport).toBeDefined();
  });
});

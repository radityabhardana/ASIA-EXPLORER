import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { NpcIllustratedAvatar } from './NpcIllustration';

describe('NpcIllustratedAvatar Component', () => {
  afterEach(() => {
    cleanup();
  });

  const characters = [
    { id: 'PT', name: 'Pak Tanaka' },
    { id: 'MS', name: 'Mae Somchai' },
    { id: 'PJ', name: 'Pak Joko' },
    { id: 'UT', name: 'Uncle Tan' },
    { id: 'TM', name: 'Tita Maria' },
    { id: 'MZ', name: 'Master Zhang' },
    { id: 'MP', name: 'Manajer Park' },
    { id: 'SK', name: 'Syaikh Khalid' },
    { id: 'UE', name: 'Usta Emre' },
    { id: 'AR', name: 'Aksakal Rustam' },
  ];

  characters.forEach(({ id, name }) => {
    it(`renders illustrated vector avatar for ${name} (${id})`, () => {
      const { container } = render(
        <NpcIllustratedAvatar id={id} nama={name} size="large" expression="senang" />,
      );

      const avatar = screen.getByLabelText(`Ilustrasi Karakter: ${name}`);
      expect(avatar).toBeInTheDocument();
      expect(avatar.getAttribute('data-npc')).toBe(id);

      // Ensure SVG is rendered
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();

      // Ensure no img tags or emojis exist
      expect(container.querySelectorAll('img').length).toBe(0);
      expect(avatar.textContent).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    });
  });

  it('normalizes character by name if id is missing or generic', () => {
    const { container } = render(<NpcIllustratedAvatar nama="Pak Tanaka" size="medium" />);
    const avatar = container.querySelector('[data-npc="PT"]');
    expect(avatar).toBeInTheDocument();
  });

  it('normalizes character by 2-letter country code', () => {
    const { container } = render(<NpcIllustratedAvatar id="TH" nama="Mae Somchai" size="small" />);
    const avatar = container.querySelector('[data-npc="MS"]');
    expect(avatar).toBeInTheDocument();
  });

  it('renders generic illustrated traveler fallback for unknown NPCs', () => {
    const { container } = render(<NpcIllustratedAvatar id="unknown" nama="Pemandu Misterius" />);
    const avatar = container.querySelector('[data-npc="GENERIC"]');
    expect(avatar).toBeInTheDocument();
  });

  it('applies correct dimensions based on size variant', () => {
    const { container: smallContainer } = render(
      <NpcIllustratedAvatar id="PT" nama="Pak Tanaka" size="small" />,
    );
    const smallSvg = smallContainer.querySelector('svg');
    expect(smallSvg?.getAttribute('width')).toBe('36');
    expect(smallSvg?.getAttribute('height')).toBe('36');

    const { container: largeContainer } = render(
      <NpcIllustratedAvatar id="PT" nama="Pak Tanaka" size="large" />,
    );
    const largeSvg = largeContainer.querySelector('svg');
    expect(largeSvg?.getAttribute('width')).toBe('86');
    expect(largeSvg?.getAttribute('height')).toBe('86');
  });
});

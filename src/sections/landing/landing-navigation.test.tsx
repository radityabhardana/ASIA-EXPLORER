import { fireEvent, render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import DailyChallengeExpedition from './DailyChallengeExpedition';
import EtiquetteFieldGuide from './EtiquetteFieldGuide';
import RegionExpeditionGallery from './RegionExpeditionGallery';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Direct Navigation to /negara/:id from Landing Sections', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('RegionExpeditionGallery', () => {
    it('navigates directly to /negara/:id on spotlight action button click', () => {
      const { container } = render(<RegionExpeditionGallery />);

      const spotlightBtn = container.querySelector<HTMLButtonElement>(
        '.region-spotlight__action-btn',
      );
      expect(spotlightBtn).not.toBeNull();
      fireEvent.click(spotlightBtn!);

      expect(mockNavigate).toHaveBeenCalledWith('/negara/id');
    });

    it('navigates directly to /negara/:id on grid card click and enter key', () => {
      const { container } = render(<RegionExpeditionGallery />);

      const cards = container.querySelectorAll<HTMLElement>('.region-card');
      expect(cards.length).toBeGreaterThan(0);

      const firstCard = cards[0]!;
      fireEvent.click(firstCard);
      expect(mockNavigate).toHaveBeenCalledWith('/negara/th');

      mockNavigate.mockClear();
      fireEvent.keyDown(firstCard, { key: 'Enter' });
      expect(mockNavigate).toHaveBeenCalledWith('/negara/th');
    });
  });

  describe('EtiquetteFieldGuide', () => {
    it('navigates directly to /negara/:id on etiquette card click', () => {
      const { container } = render(<EtiquetteFieldGuide />);

      const cards = container.querySelectorAll<HTMLElement>('.etiquette-card');
      expect(cards.length).toBeGreaterThan(0);

      const firstCard = cards[0]!;
      fireEvent.click(firstCard);

      expect(mockNavigate).toHaveBeenCalledWith('/negara/jp');
    });

    it('navigates directly to /negara/:id on action button click inside card', () => {
      const { container } = render(<EtiquetteFieldGuide />);

      const actionBtns = container.querySelectorAll<HTMLButtonElement>(
        '.etiquette-card__action-btn',
      );
      expect(actionBtns.length).toBeGreaterThan(0);

      const firstBtn = actionBtns[0]!;
      fireEvent.click(firstBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/negara/jp');
    });
  });

  describe('DailyChallengeExpedition', () => {
    it('navigates directly to /negara/:id when explore country button is clicked after answer', () => {
      const { container } = render(<DailyChallengeExpedition locale="id" />);

      const options = container.querySelectorAll<HTMLButtonElement>('.daily-quest__option');
      expect(options.length).toBeGreaterThan(0);

      // Select first option
      fireEvent.click(options[0]!);

      // Click check answer button
      const checkBtn = container.querySelector<HTMLButtonElement>('.daily-quest__btn-primary');
      expect(checkBtn).not.toBeNull();
      fireEvent.click(checkBtn!);

      // Challenge country explore button should now be visible
      const exploreBtn = container.querySelector<HTMLButtonElement>('.daily-quest__btn-ghost');
      expect(exploreBtn).not.toBeNull();
      fireEvent.click(exploreBtn!);

      expect(mockNavigate).toHaveBeenCalledWith('/negara/tj');
    });
  });
});

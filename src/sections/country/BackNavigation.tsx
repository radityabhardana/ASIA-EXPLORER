import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { useI18n } from '@/lib/i18n';

type BackNavigationProps = {
  leaving: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  label?: string;
};

export default function BackNavigation({ leaving, onClick, label }: BackNavigationProps) {
  const { locale, t } = useI18n();
  const text = label ?? t('country.back');
  const ariaLabel = locale === 'en' ? 'Return to home' : 'Kembali ke halaman utama';

  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollY.current;

      // Scrolling up or near top (<60px): reveal the bar
      if (currentScrollY < 60) {
        setHidden(false);
      } else if (currentScrollY > 80 && currentScrollY > prevScrollY) {
        // Scrolling down past 80px: hide the bar
        setHidden(true);
      } else if (currentScrollY < prevScrollY) {
        // Scrolling up: reveal the bar
        setHidden(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div
      className="country-back-bar"
      data-hidden={hidden ? 'true' : 'false'}
      aria-hidden="false"
    >
      <Link
        className="country-back"
        to="/"
        onClick={onClick}
        onFocus={() => setHidden(false)}
        aria-label={ariaLabel}
        aria-disabled={leaving || undefined}
        data-leaving={leaving ? 'true' : undefined}
      >
        <span aria-hidden="true">&larr;</span>
        <span>{text}</span>
      </Link>
    </div>
  );
}

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
  const prevScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 60) {
        setHidden(false);
      } else if (currentScrollY > 80 && currentScrollY > prevScrollY.current) {
        setHidden(true);
      } else if (currentScrollY < prevScrollY.current) {
        setHidden(false);
      }
      prevScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFocus = () => {
    setHidden(false);
  };

  return (
    <div
      className="country-back-bar"
      data-hidden={hidden ? 'true' : 'false'}
      aria-hidden={hidden ? 'true' : 'false'}
    >
      <Link
        className="country-back"
        to="/"
        onClick={onClick}
        onFocus={handleFocus}
        aria-label={ariaLabel}
        data-leaving={leaving ? 'true' : 'false'}
      >
        <span className="country-back__icon" aria-hidden="true">
          ←
        </span>
        <span className="country-back__text">{text}</span>
      </Link>
    </div>
  );
}

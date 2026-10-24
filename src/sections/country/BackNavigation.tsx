import { Link } from 'react-router-dom';
import type { MouseEvent } from 'react';

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

  return (
    <div className="country-back-bar" aria-hidden="false">
      <Link
        className="country-back"
        to="/"
        onClick={onClick}
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

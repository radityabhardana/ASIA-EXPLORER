import { Link } from 'react-router-dom';
import type { MouseEvent } from 'react';

type BackNavigationProps = {
  leaving: boolean;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export default function BackNavigation({ leaving, onClick }: BackNavigationProps) {
  return (
    <Link
      className="country-back"
      to="/"
      onClick={onClick}
      aria-label="Kembali ke halaman utama"
      aria-disabled={leaving || undefined}
      data-leaving={leaving ? 'true' : undefined}
    >
      <span>Kembali ke benua</span>
    </Link>
  );
}

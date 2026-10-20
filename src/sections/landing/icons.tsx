type IconProps = {
  className?: string;
};

/**
 * Ikon prosedural scene 6 (§5): cezve kopi Turki dan wai Thailand.
 * Digambar sebagai garis, bukan aset raster, dan selalu dekoratif.
 */
export function CezveIcon({ className }: IconProps) {
  return (
    <svg
      className={className ? `landing-icon ${className}` : 'landing-icon'}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M22 24h16l-2.4 21.5A4 4 0 0 1 31.6 49h-3.2a4 4 0 0 1-4-3.5Z" />
      <path d="M22 24c0-3.4 3.6-6 8-6s8 2.6 8 6" />
      <path d="M38 27h5.5L53 22" />
      <path d="M25 32h10" />
    </svg>
  );
}

export function WaiIcon({ className }: IconProps) {
  return (
    <svg
      className={className ? `landing-icon ${className}` : 'landing-icon'}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M32 26c-3.3 0-6 2.7-6 6v10c0 4.4 2.7 8 6 8s6-3.6 6-8V32c0-3.3-2.7-6-6-6Z" />
      <path d="M26 32c-2.8.8-4.5 3.4-4.5 7v2" />
      <path d="M38 32c2.8.8 4.5 3.4 4.5 7v2" />
      <path d="M28 26v-7M32 25v-9M36 26v-7" />
    </svg>
  );
}

import type { TextProfile } from './scripts';

type NativeTextProps = {
  profile: TextProfile;
  children: string;
  className?: string;
};

export default function NativeText({ profile, children, className }: NativeTextProps) {
  const classes = ['country-native', `country-native--${profile.script}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <span lang={profile.lang} dir={profile.dir} className={classes}>
      {children}
    </span>
  );
}

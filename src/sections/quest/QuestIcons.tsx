import {
  Gift,
  MessageSquare,
  Sparkles,
  CreditCard,
  ShoppingBag,
  Layers,
  Coins,
  Package,
  Shirt,
  Mail,
  Bookmark,
  Shield,
  Umbrella,
  Coffee,
  Feather,
  Briefcase,
  Compass,
  Footprints,
} from 'lucide-react';

interface BekalIconProps {
  icon?: string;
  size?: number;
  className?: string;
}

export function BekalIcon({ icon = '', size = 22, className = '' }: BekalIconProps) {
  const iconProps = {
    size,
    className: `sq-icon-svg ${className}`.trim(),
    'aria-hidden': true,
  };

  const key = icon.toLowerCase().trim();

  switch (key) {
    case 'gift':
    case 'oleh-oleh':
      return <Gift {...iconProps} />;
    case 'message-square':
    case 'frasa':
    case 'chat':
      return <MessageSquare {...iconProps} />;
    case 'sparkles':
      return <Sparkles {...iconProps} />;
    case 'credit-card':
    case 'meishi':
    case 'kartu':
      return <CreditCard {...iconProps} />;
    case 'shopping-bag':
    case 'keranjang':
      return <ShoppingBag {...iconProps} />;
    case 'layers':
    case 'kain':
      return <Layers {...iconProps} />;
    case 'coins':
    case 'uang':
    case 'koin':
      return <Coins {...iconProps} />;
    case 'package':
    case 'kotak':
      return <Package {...iconProps} />;
    case 'shirt':
    case 'pakaian':
    case 'kaos':
    case 'batik':
      return <Shirt {...iconProps} />;
    case 'footprints':
    case 'kaos_kaki':
      return <Footprints {...iconProps} />;
    case 'mail':
    case 'amplop':
      return <Mail {...iconProps} />;
    case 'bookmark':
    case 'tisu':
    case 'peci':
      return <Bookmark {...iconProps} />;
    case 'shield':
    case 'saputangan':
    case 'pelindung':
      return <Shield {...iconProps} />;
    case 'umbrella':
    case 'payung':
      return <Umbrella {...iconProps} />;
    case 'coffee':
    case 'teh':
      return <Coffee {...iconProps} />;
    case 'feather':
    case 'parfum':
      return <Feather {...iconProps} />;
    case 'briefcase':
      return <Briefcase {...iconProps} />;
    default:
      return <Compass {...iconProps} />;
  }
}

import { NpcIllustratedAvatar } from './NpcIllustration';

export { NpcIllustratedAvatar };

interface NpcAvatarBadgeProps {
  avatar?: string;
  nama: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  expression?: 'senang' | 'netral' | 'bingung' | 'kecewa' | 'kagum';
}

export function NpcAvatarBadge({
  avatar = '',
  nama,
  size = 'medium',
  className = '',
  expression = 'netral',
}: NpcAvatarBadgeProps) {
  return (
    <NpcIllustratedAvatar
      id={avatar}
      nama={nama}
      size={size}
      className={className}
      expression={expression}
    />
  );
}

import type { NpcInfo, NpcExpression } from '@/lib/story-quest/types';
import { Smile, Meh, HelpCircle, Frown, Sparkles } from 'lucide-react';
import { NpcAvatarBadge } from './QuestIcons';

interface NpcAvatarProps {
  npc: NpcInfo;
  expression: NpcExpression;
}

const expressionConfig: Record<
  NpcExpression,
  { label: string; icon: React.FC<{ size?: number; className?: string }>; moodClass: string }
> = {
  senang: { label: 'Senang & Hangat', icon: Smile, moodClass: 'sq-npc-badge--pleased' },
  netral: { label: 'Menyimak', icon: Meh, moodClass: 'sq-npc-badge--neutral' },
  bingung: { label: 'Agak Bingung', icon: HelpCircle, moodClass: 'sq-npc-badge--confused' },
  kecewa: { label: 'Kurang Berkenan', icon: Frown, moodClass: 'sq-npc-badge--disappointed' },
  kagum: { label: 'Sangat Kagum', icon: Sparkles, moodClass: 'sq-npc-badge--impressed' },
};

export default function NpcAvatar({ npc, expression }: NpcAvatarProps) {
  const currentMood = expressionConfig[expression] ?? expressionConfig.netral;
  const MoodIcon = currentMood.icon;

  return (
    <div className="sq-npc-card" role="region" aria-label={`Karakter: ${npc.nama}, ${npc.peran}`}>
      <div className="sq-npc-portrait">
        <div className="sq-npc-portrait__ring">
          <NpcAvatarBadge
            avatar={npc.avatar}
            nama={npc.nama}
            expression={expression}
            size="large"
          />
        </div>

        <div className={`sq-npc-badge ${currentMood.moodClass}`}>
          <MoodIcon size={12} aria-hidden="true" />
          <span>{currentMood.label}</span>
        </div>
      </div>

      <div className="sq-npc-info">
        <h3 className="sq-npc-info__name">{npc.nama}</h3>
        <p className="sq-npc-info__role">{npc.peran}</p>
      </div>
    </div>
  );
}

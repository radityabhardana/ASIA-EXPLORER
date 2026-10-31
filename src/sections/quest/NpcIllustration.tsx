import { useId } from 'react';

interface NpcIllustrationProps {
  id?: string;
  nama?: string;
  countryId?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  expression?: 'senang' | 'netral' | 'bingung' | 'kecewa' | 'kagum';
}

export function normalizeNpcId(rawId = '', name = '', countryId = ''): string {
  const cleanId = rawId.trim().toUpperCase();
  const cleanName = name.trim().toLowerCase();
  const cleanCid = countryId.trim().toUpperCase();

  // 1. Direct country codes or original 10 IDs
  if (cleanId === 'PT' || cleanId === 'JP' || cleanCid === 'JP' || cleanName.includes('tanaka')) return 'PT';
  if (cleanId === 'MS' || cleanId === 'TH' || cleanCid === 'TH' || cleanName.includes('somchai')) return 'MS';
  if (cleanId === 'PJ' || cleanId === 'ID' || cleanCid === 'ID' || cleanName.includes('joko')) return 'PJ';
  if (cleanId === 'UT' || cleanId === 'SG' || cleanCid === 'SG' || /\btan\b/i.test(cleanName) || cleanName.includes('uncle tan')) return 'UT';
  if (cleanId === 'TM' || cleanId === 'PH' || cleanCid === 'PH' || cleanName.includes('maria')) return 'TM';
  if (cleanId === 'MZ' || cleanId === 'CN' || cleanCid === 'CN' || cleanName.includes('zhang')) return 'MZ';
  if (cleanId === 'MP' || cleanId === 'KR' || cleanCid === 'KR' || cleanName.includes('park')) return 'MP';
  if (cleanId === 'SK' || cleanId === 'SA' || cleanCid === 'SA' || cleanName.includes('khalid')) return 'SK';
  if (cleanId === 'UE' || cleanId === 'TR' || cleanCid === 'TR' || cleanName.includes('emre')) return 'UE';
  if (cleanId === 'AR' || cleanId === 'UZ' || cleanCid === 'UZ' || cleanName.includes('rustam')) return 'AR';

  // Southeast Asia
  if (cleanId === 'MY' || cleanCid === 'MY' || cleanName.includes('faizal')) return 'MY';
  if (cleanId === 'VN' || cleanCid === 'VN' || cleanName.includes('linh')) return 'VN';
  if (cleanId === 'BN' || cleanCid === 'BN' || cleanName.includes('awang')) return 'BN';
  if (cleanId === 'KH' || cleanCid === 'KH' || cleanName.includes('sokun')) return 'KH';
  if (cleanId === 'LA' || cleanCid === 'LA' || cleanName.includes('bounmy')) return 'LA';
  if (cleanId === 'MM' || cleanCid === 'MM' || cleanName.includes('thura')) return 'MM';
  if (cleanId === 'TL' || cleanCid === 'TL' || cleanName.includes('mateus')) return 'TL';

  // East Asia
  if (cleanId === 'MN' || cleanCid === 'MN' || cleanName.includes('batbayar')) return 'MN';
  if (cleanId === 'KP' || cleanCid === 'KP' || /\bri\b/i.test(cleanName) || cleanName.includes('pemandu ri')) return 'KP';

  // Central Asia
  if (cleanId === 'KZ' || cleanCid === 'KZ' || cleanName.includes('nurlan')) return 'KZ';
  if (cleanId === 'KG' || cleanCid === 'KG' || cleanName.includes('bakyt')) return 'KG';
  if (cleanId === 'TJ' || cleanCid === 'TJ' || cleanName.includes('bobo')) return 'TJ';
  if (cleanId === 'TM_TM' || cleanCid === 'TM' || cleanName.includes('mergen')) return 'TM_TM';

  // South Asia
  if (cleanId === 'IN' || cleanCid === 'IN' || cleanName.includes('rajesh')) return 'IN';
  if (cleanId === 'AF' || cleanCid === 'AF' || cleanName.includes('ahmad')) return 'AF';
  if (cleanId === 'BD' || cleanCid === 'BD' || cleanName.includes('farhan')) return 'BD';
  if (cleanId === 'BT' || cleanCid === 'BT' || cleanName.includes('karma')) return 'BT';
  if (cleanId === 'IR' || cleanCid === 'IR' || cleanName.includes('mansoor')) return 'IR';
  if (cleanId === 'MV' || cleanCid === 'MV' || cleanName.includes('ibrahim')) return 'MV';
  if (cleanId === 'NP' || cleanCid === 'NP' || cleanName.includes('pasang')) return 'NP';
  if (cleanId === 'PK' || cleanCid === 'PK' || (cleanName.includes('tariq') && (cleanCid === 'PK' || cleanId === 'PK'))) return 'PK';
  if (cleanId === 'LK' || cleanCid === 'LK' || cleanName.includes('sunil')) return 'LK';

  // West Asia
  if (cleanId === 'AM' || cleanCid === 'AM' || cleanName.includes('vartan')) return 'AM';
  if (cleanId === 'AZ' || cleanCid === 'AZ' || cleanName.includes('murad')) return 'AZ';
  if (cleanId === 'BH' || cleanCid === 'BH' || cleanName.includes('salman')) return 'BH';
  if (cleanId === 'CY' || cleanCid === 'CY' || cleanName.includes('andreas')) return 'CY';
  if (cleanId === 'GE' || cleanCid === 'GE' || cleanName.includes('giorgi')) return 'GE';
  if (cleanId === 'IQ' || cleanCid === 'IQ' || (cleanName.includes('tariq') && (cleanCid === 'IQ' || cleanId === 'IQ'))) return 'IQ';
  if (cleanId === 'IL' || cleanCid === 'IL' || cleanName.includes('avi')) return 'IL';
  if (cleanId === 'JO' || cleanCid === 'JO' || cleanName.includes('omar')) return 'JO';
  if (cleanId === 'KW' || cleanCid === 'KW' || cleanName.includes('fahad')) return 'KW';
  if (cleanId === 'LB' || cleanCid === 'LB' || cleanName.includes('michel')) return 'LB';
  if (cleanId === 'OM' || cleanCid === 'OM' || cleanName.includes('salim')) return 'OM';
  if (cleanId === 'PS' || cleanCid === 'PS' || (cleanName.includes('tariq') && (cleanCid === 'PS' || cleanId === 'PS'))) return 'PS';
  if (cleanId === 'QA' || cleanCid === 'QA' || cleanName.includes('hamad')) return 'QA';
  if (cleanId === 'SY' || cleanCid === 'SY' || cleanName.includes('samer')) return 'SY';
  if (cleanId === 'AE' || cleanCid === 'AE' || cleanName.includes('zayed')) return 'AE';
  if (cleanId === 'YE' || cleanCid === 'YE' || cleanName.includes('saleh')) return 'YE';

  return 'GENERIC';
}

export function NpcIllustratedAvatar({
  id = '',
  nama = 'Karakter',
  countryId = '',
  size = 'medium',
  className = '',
  expression = 'netral',
}: NpcIllustrationProps) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const npcKey = normalizeNpcId(id, nama, countryId);
  const sizeMap = {
    small: { width: 36, height: 36 },
    medium: { width: 52, height: 52 },
    large: { width: 86, height: 86 },
  };

  const { width, height } = sizeMap[size] ?? sizeMap.medium;

  const isSmiling = expression === 'senang' || expression === 'kagum';
  const isConcerned = expression === 'kecewa' || expression === 'bingung';

  return (
    <div
      className={`sq-npc-illustrated-avatar sq-npc-illustrated-avatar--${size} ${className}`.trim()}
      aria-label={`Ilustrasi Karakter: ${nama}`}
      data-npc={npcKey}
      style={{ width, height, flexShrink: 0 }}
    >
      <svg
        viewBox="0 0 100 100"
        width={width}
        height={height}
        className="sq-npc-svg"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`clip-${uniqueId}`}>
            <circle cx="50" cy="50" r="47" />
          </clipPath>
          <linearGradient id={`bg-parchment-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFBF7" />
            <stop offset="100%" stopColor="#EDE4D4" />
          </linearGradient>
        </defs>

        {/* Outer Circular Base */}
        <circle cx="50" cy="50" r="48" fill={`url(#bg-parchment-${uniqueId})`} stroke="#176B68" strokeWidth="2.5" />

        {/* Clipped Character Artwork */}
        <g clipPath={`url(#clip-${uniqueId})`}>
          {/* 1. JP: Pak Tanaka */}
          {npcKey === 'PT' && (
            <g data-testid="npc-pt">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#223147" />
              <path d="M42 72 L50 86 L58 72 Z" fill="#FAF8F3" />
              <path d="M44 72 L50 83 L53 88 L46 88 Z" fill="#223147" />
              <path d="M47 72 L50 88 L58 72 L53 72 Z" fill="#1B283A" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#F8DFC8" />
              <ellipse cx="50" cy="46" rx="19" ry="21" fill="#F8DFC8" />
              <ellipse cx="30" cy="47" rx="3.5" ry="6" fill="#F3CFB0" />
              <ellipse cx="70" cy="47" rx="3.5" ry="6" fill="#F3CFB0" />
              <path d="M30 42 Q32 25 50 25 Q68 25 70 42 Q66 32 50 31 Q36 32 30 42 Z" fill="#241E1A" />
              <path d="M29 42 Q30 32 40 28 Q44 33 32 45 Z" fill="#241E1A" />
              <path d="M37 38 Q42 36 46 39" stroke="#241E1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M54 39 Q58 36 63 38" stroke="#241E1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <rect x="36" y="41" width="10" height="7" rx="2.5" fill="none" stroke="#7A532C" strokeWidth="1.6" />
              <rect x="54" y="41" width="10" height="7" rx="2.5" fill="none" stroke="#7A532C" strokeWidth="1.6" />
              <line x1="46" y1="44" x2="54" y2="44" stroke="#7A532C" strokeWidth="1.6" />
              <circle cx="41" cy="44.5" r="1.5" fill="#241E1A" />
              <circle cx="59" cy="44.5" r="1.5" fill="#241E1A" />
              <path d="M50 46 L49 53 L52 53" stroke="#DCAE8B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {isSmiling ? (
                <path d="M44 58 Q50 64 56 58" stroke="#B3654B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              ) : isConcerned ? (
                <path d="M45 61 Q50 57 55 61" stroke="#B3654B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              ) : (
                <path d="M45 59 Q50 61 55 59" stroke="#B3654B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              )}
            </g>
          )}

          {/* 2. TH: Mae Somchai */}
          {npcKey === 'MS' && (
            <g id="npc-somchai">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#D99B38" />
              <path d="M22 100 L32 73 L48 72 L36 100 Z" fill="#176B68" />
              <path d="M27 100 L35 73 L40 72 L32 100 Z" fill="#125452" />
              <rect x="44" y="58" width="12" height="16" rx="3" fill="#E8B88A" />
              <path d="M44 68 Q50 73 56 68" stroke="#D4AF37" strokeWidth="2" fill="none" />
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#E8B88A" />
              <ellipse cx="31" cy="46" rx="3" ry="5.5" fill="#DC9F6E" />
              <circle cx="31" cy="51" r="2" fill="#D4AF37" />
              <ellipse cx="69" cy="46" rx="3" ry="5.5" fill="#DC9F6E" />
              <circle cx="69" cy="51" r="2" fill="#D4AF37" />
              <circle cx="50" cy="22" r="10" fill="#382820" />
              <circle cx="50" cy="22" r="3" fill="#D4AF37" />
              <path d="M31 40 Q33 28 50 28 Q67 28 69 40 Q62 33 50 33 Q38 33 31 40 Z" fill="#382820" />
              <path d="M37 38 Q42 35 46 38" stroke="#382820" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M54 38 Q58 35 63 38" stroke="#382820" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <ellipse cx="41.5" cy="43.5" rx="2" ry="1.4" fill="#382820" />
              <ellipse cx="58.5" cy="43.5" rx="2" ry="1.4" fill="#382820" />
              <circle cx="37" cy="49" r="4" fill="#C97A5F" opacity="0.3" />
              <circle cx="63" cy="49" r="4" fill="#C97A5F" opacity="0.3" />
              <path d="M50 45 Q48 51 51 51" stroke="#C28659" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M43 56 Q50 63 57 56" stroke="#A84832" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 3. ID: Pak Joko */}
          {npcKey === 'PJ' && (
            <g id="npc-joko">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#423428" />
              <line x1="28" y1="78" x2="26" y2="100" stroke="#685444" strokeWidth="2" />
              <line x1="38" y1="75" x2="36" y2="100" stroke="#685444" strokeWidth="2" />
              <line x1="62" y1="75" x2="64" y2="100" stroke="#685444" strokeWidth="2" />
              <line x1="72" y1="78" x2="74" y2="100" stroke="#685444" strokeWidth="2" />
              <path d="M43 73 L50 82 L57 73 Z" fill="#2E241B" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D29B6C" />
              <ellipse cx="50" cy="47" rx="19" ry="21" fill="#D29B6C" />
              <ellipse cx="30" cy="48" rx="3.5" ry="6" fill="#C18756" />
              <ellipse cx="70" cy="48" rx="3.5" ry="6" fill="#C18756" />
              <path d="M28 42 Q30 22 50 22 Q70 22 72 42 Q66 34 50 34 Q34 34 28 42 Z" fill="#543621" />
              <path d="M30 38 Q50 33 70 38 L69 41 Q50 36 31 41 Z" fill="#754E33" />
              <circle cx="71" cy="43" r="4.5" fill="#543621" />
              <path d="M37 39 Q42 36 46 39" stroke="#35261C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M54 39 Q58 36 63 39" stroke="#35261C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <circle cx="41.5" cy="44.5" r="1.6" fill="#2B1E16" />
              <circle cx="58.5" cy="44.5" r="1.6" fill="#2B1E16" />
              <path d="M50 46 L48.5 53 L52.5 53" stroke="#AC7242" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M43 57 Q50 54 57 57 Q50 58 43 57 Z" fill="#35261C" />
              <path d="M44 60 Q50 64 56 60" stroke="#35261C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 4. SG: Uncle Tan */}
          {npcKey === 'UT' && (
            <g id="npc-uncletan">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#EAE6DF" />
              <path d="M40 72 L47 80 L50 87 L53 80 L60 72 Z" fill="#D6D0C5" />
              <rect x="44" y="59" width="12" height="15" rx="3" fill="#F2D8BD" />
              <ellipse cx="50" cy="46" rx="19.5" ry="21" fill="#F2D8BD" />
              <path d="M30 46 Q31 28 50 27 Q69 28 70 46 Q67 33 50 33 Q33 33 30 46 Z" fill="#5A5754" />
              <rect x="36" y="41" width="10.5" height="7.5" rx="2" fill="none" stroke="#C29B38" strokeWidth="1.5" />
              <rect x="53.5" y="41" width="10.5" height="7.5" rx="2" fill="none" stroke="#C29B38" strokeWidth="1.5" />
              <line x1="46.5" y1="44.5" x2="53.5" y2="44.5" stroke="#C29B38" strokeWidth="1.5" />
              <circle cx="41.5" cy="44.5" r="1.5" fill="#2B2623" />
              <circle cx="58.5" cy="44.5" r="1.5" fill="#2B2623" />
              <path d="M50 46 L48.5 53 L52 53" stroke="#D1A77E" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M43 58 Q50 65 57 58" stroke="#9C4436" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 5. PH: Tita Maria */}
          {npcKey === 'TM' && (
            <g id="npc-maria">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#E8D5BF" />
              <path d="M38 74 Q50 82 62 74" stroke="#B85C5C" strokeWidth="2" strokeDasharray="2,2" fill="none" />
              <rect x="44" y="58" width="12" height="16" rx="3" fill="#DFA978" />
              <ellipse cx="50" cy="45" rx="19" ry="20" fill="#DFA978" />
              <circle cx="30" cy="51" r="2.2" fill="#FFFFFF" stroke="#D5C5B5" strokeWidth="0.5" />
              <circle cx="70" cy="51" r="2.2" fill="#FFFFFF" stroke="#D5C5B5" strokeWidth="0.5" />
              <path d="M29 46 Q31 25 50 25 Q69 25 71 46 Q64 32 50 32 Q36 32 29 46 Z" fill="#2C221D" />
              <circle cx="32" cy="32" r="3.5" fill="#FFFFFF" />
              <circle cx="32" cy="32" r="1.2" fill="#E8C34E" />
              <ellipse cx="41.5" cy="42.5" rx="2" ry="1.5" fill="#2C221D" />
              <ellipse cx="58.5" cy="42.5" rx="2" ry="1.5" fill="#2C221D" />
              <circle cx="36" cy="48" r="4.5" fill="#D46A6A" opacity="0.35" />
              <circle cx="64" cy="48" r="4.5" fill="#D46A6A" opacity="0.35" />
              <path d="M50 44 L48.5 50 L52 50" stroke="#B87B48" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M42 55 Q50 63 58 55" stroke="#A83232" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 6. CN: Master Zhang */}
          {npcKey === 'MZ' && (
            <g id="npc-zhang">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#204A41" />
              <path d="M43 72 L50 78 L57 72" stroke="#17362F" strokeWidth="3" fill="none" />
              <circle cx="50" cy="76" r="2" fill="#D4AF37" />
              <rect x="44" y="60" width="12" height="14" rx="3" fill="#F0D5BB" />
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#F0D5BB" />
              <path d="M30 42 Q32 25 50 25 Q68 25 70 42 Q64 31 50 31 Q36 31 30 42 Z" fill="#231E1B" />
              <path d="M39 43 Q42 41 45 43" stroke="#231E1B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M55 43 Q58 41 61 43" stroke="#231E1B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M50 44 L49 52 L52 52" stroke="#CFA783" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M47 59 Q50 71 53 59 Z" fill="#2E241E" />
              <path d="M45 56 Q50 59 55 56" stroke="#8A4A3C" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 7. KR: Manajer Park */}
          {npcKey === 'MP' && (
            <g id="npc-park">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#1C2530" />
              <path d="M40 72 L50 92 L60 72 Z" fill="#FFFFFF" />
              <path d="M48 80 L52 80 L53 100 L47 100 Z" fill="#176B68" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#FCEBDC" />
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#FCEBDC" />
              <path d="M30 40 Q32 23 50 23 Q68 23 70 40 Q62 29 53 30 Q44 28 30 40 Z" fill="#1B2026" />
              <circle cx="41.5" cy="43" r="1.6" fill="#1B2026" />
              <circle cx="58.5" cy="43" r="1.6" fill="#1B2026" />
              <path d="M50 44 L49 51 L52 51" stroke="#DEB79B" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M44 57 Q50 61 56 57" stroke="#A85444" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 8. SA: Syaikh Khalid */}
          {npcKey === 'SK' && (
            <g id="npc-khalid">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F8F7F4" />
              <path d="M22 45 Q20 78 26 100 L35 100 Q28 78 30 50 Z" fill="#EDE9E1" />
              <path d="M78 45 Q80 78 74 100 L65 100 Q72 78 70 50 Z" fill="#EDE9E1" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBA878" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#DBA878" />
              <path d="M34 50 Q35 70 50 72 Q65 70 66 50 Q63 56 50 56 Q37 56 34 50 Z" fill="#241C16" />
              <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q66 32 50 32 Q34 32 28 42 Z" fill="#FAF9F6" />
              <ellipse cx="50" cy="27" rx="20" ry="4" fill="none" stroke="#1C1C1E" strokeWidth="3.2" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M50 44 L48.5 52 L52 52" stroke="#B88354" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M45 59 Q50 63 55 59" stroke="#DBA878" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 9. TR: Usta Emre */}
          {npcKey === 'UE' && (
            <g id="npc-emre">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F4EFE6" />
              <path d="M20 100 L24 78 Q35 73 45 74 L40 100 Z" fill="#80242D" />
              <path d="M80 100 L76 78 Q65 73 55 74 L60 100 Z" fill="#80242D" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#E5C29E" />
              <ellipse cx="50" cy="46" rx="19" ry="20" fill="#E5C29E" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#2D201A" />
              <circle cx="41" cy="43.5" r="1.6" fill="#241914" />
              <circle cx="59" cy="43.5" r="1.6" fill="#241914" />
              <path d="M35 56 Q43 51 50 55 Q57 51 65 56 Q62 61 50 58 Q38 61 35 56 Z" fill="#2D201A" />
              <path d="M45 61 Q50 65 55 61" stroke="#94483C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 10. UZ: Aksakal Rustam */}
          {npcKey === 'AR' && (
            <g id="npc-rustam">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#1C385C" />
              <path d="M40 72 L48 100 L52 100 L60 72 Z" fill="#D4AF37" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBAE82" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#DBAE82" />
              <path d="M33 50 Q34 76 50 78 Q66 76 67 50 Q63 58 50 58 Q37 58 33 50 Z" fill="#F0EDE6" />
              <path d="M31 38 L35 22 L65 22 L69 38 Q50 33 31 38 Z" fill="#20242B" />
              <circle cx="50" cy="27" r="1.5" fill="#F4F2EC" />
              <circle cx="41.5" cy="43.5" r="1.5" fill="#261E18" />
              <circle cx="58.5" cy="43.5" r="1.5" fill="#261E18" />
              <path d="M45 60 Q50 63 55 60" stroke="#BA8C60" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 11. MY: Encik Faizal (Malaysia) - Songkok baldu hitam lis emas & Baju Melayu teluk belanga */}
          {npcKey === 'MY' && (
            <g id="npc-faizal">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#234E45" />
              <path d="M44 72 L50 82 L56 72 Z" fill="#1B3E37" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D79E72" />
              <ellipse cx="50" cy="47" rx="19" ry="21" fill="#D79E72" />
              <path d="M31 38 L33 16 L67 16 L69 38 Q50 34 31 38 Z" fill="#1C1B1F" />
              <line x1="33" y1="36" x2="67" y2="36" stroke="#D4AF37" strokeWidth="1.8" />
              <circle cx="41.5" cy="44.5" r="1.6" fill="#241B15" />
              <circle cx="58.5" cy="44.5" r="1.6" fill="#241B15" />
              <path d="M43 57 Q50 55 57 57" stroke="#241B15" strokeWidth="1.6" fill="none" />
              <path d="M44 60 Q50 65 56 60" stroke="#9E4636" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 12. VN: Bibi Linh (Vietnam) - Topi Non La bambu & Ao Dai koral */}
          {npcKey === 'VN' && (
            <g id="npc-linh">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#D15043" />
              <path d="M46 72 L50 80 L54 72" stroke="#FAF7F2" strokeWidth="2" fill="none" />
              <rect x="44" y="58" width="12" height="16" rx="3" fill="#F4D3B8" />
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#F4D3B8" />
              <path d="M12 40 L50 14 L88 40 Z" fill="#E8D19F" stroke="#B89B66" strokeWidth="1.2" />
              <line x1="50" y1="14" x2="30" y2="40" stroke="#CBB17D" strokeWidth="0.8" />
              <line x1="50" y1="14" x2="70" y2="40" stroke="#CBB17D" strokeWidth="0.8" />
              <path d="M30 40 Q50 62 70 40" stroke="#0D7377" strokeWidth="2" fill="none" />
              <ellipse cx="41.5" cy="43" rx="1.8" ry="1.4" fill="#231E1B" />
              <ellipse cx="58.5" cy="43" rx="1.8" ry="1.4" fill="#231E1B" />
              <circle cx="36" cy="48" r="4" fill="#DE6B5B" opacity="0.3" />
              <circle cx="64" cy="48" r="4" fill="#DE6B5B" opacity="0.3" />
              <path d="M43 56 Q50 62 57 56" stroke="#9A382A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 13. BN: Haji Awang (Brunei) - Songkok hitam lis perak & Baju Melayu kuning emas bersongket */}
          {npcKey === 'BN' && (
            <g id="npc-awang">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#C99728" />
              <path d="M35 76 L50 92 L65 76 Z" fill="#EAD170" opacity="0.4" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D29969" />
              <ellipse cx="50" cy="47" rx="19" ry="21" fill="#D29969" />
              <path d="M31 38 L33 16 L67 16 L69 38 Q50 34 31 38 Z" fill="#1C1B1F" />
              <line x1="33" y1="36" x2="67" y2="36" stroke="#E6E8ED" strokeWidth="2" />
              <circle cx="41.5" cy="44.5" r="1.6" fill="#241B15" />
              <circle cx="58.5" cy="44.5" r="1.6" fill="#241B15" />
              <path d="M44 60 Q50 64 56 60" stroke="#9E4636" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 14. KH: Lok Ta Sokun (Kamboja) - Syal Krama kotak-kotak merah & liontin Angkor */}
          {npcKey === 'KH' && (
            <g id="npc-sokun">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#4A453E" />
              <path d="M26 74 L38 100 L62 100 L74 74 Z" fill="#A83232" />
              <line x1="38" y1="74" x2="38" y2="100" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="62" y1="74" x2="62" y2="100" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="3,3" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#C48756" />
              <ellipse cx="50" cy="47" rx="19" ry="21" fill="#C48756" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#2F2823" />
              <circle cx="50" cy="68" r="3" fill="#D4AF37" />
              <circle cx="41.5" cy="44" r="1.6" fill="#241914" />
              <circle cx="58.5" cy="44" r="1.6" fill="#241914" />
              <path d="M44 59 Q50 64 56 59" stroke="#7A3B2F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 15. LA: Mae Bounmy (Laos) - Pha Biang emas & sanggul bunga Champa */}
          {npcKey === 'LA' && (
            <g id="npc-bounmy">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#2E4A62" />
              <path d="M22 100 L32 72 L48 72 L36 100 Z" fill="#E5B942" />
              <rect x="44" y="58" width="12" height="16" rx="3" fill="#E8B88A" />
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#E8B88A" />
              <circle cx="64" cy="24" r="9" fill="#2C241E" />
              <circle cx="68" cy="22" r="4" fill="#FFFFFF" />
              <circle cx="68" cy="22" r="1.5" fill="#E8C34E" />
              <path d="M31 40 Q33 28 50 28 Q67 28 69 40 Q62 33 50 33 Q38 33 31 40 Z" fill="#2C241E" />
              <ellipse cx="41.5" cy="43" rx="1.8" ry="1.4" fill="#2C241E" />
              <ellipse cx="58.5" cy="43" rx="1.8" ry="1.4" fill="#2C241E" />
              <path d="M43 56 Q50 62 57 56" stroke="#A84832" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 16. MM: U Thura (Myanmar) - Gaung Baung sutra kuning & kemeja Eingyi */}
          {npcKey === 'MM' && (
            <g id="npc-thura">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F4EFE6" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D49968" />
              <ellipse cx="50" cy="47" rx="19" ry="21" fill="#D49968" />
              <path d="M28 38 Q30 20 50 20 Q70 20 72 38 Q50 33 28 38 Z" fill="#E8C86A" />
              <path d="M68 32 Q78 30 76 42 Q72 38 68 35 Z" fill="#E8C86A" />
              <circle cx="41.5" cy="44.5" r="1.6" fill="#241B15" />
              <circle cx="58.5" cy="44.5" r="1.6" fill="#241B15" />
              <path d="M44 60 Q50 64 56 60" stroke="#35261C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 17. TL: Avo Mateus (Timor-Leste) - Selendang Tais tenun ikat merah-hitam & janggut perak */}
          {npcKey === 'TL' && (
            <g id="npc-mateus">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#2E2824" />
              <path d="M30 74 L50 100 L70 74 Z" fill="#992D22" />
              <line x1="38" y1="74" x2="50" y2="92" stroke="#E5B942" strokeWidth="2" />
              <line x1="62" y1="74" x2="50" y2="92" stroke="#E5B942" strokeWidth="2" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#B36E40" />
              <ellipse cx="50" cy="47" rx="19" ry="21" fill="#B36E40" />
              <path d="M36 54 Q36 72 50 74 Q64 72 64 54 Q58 60 50 60 Q42 60 36 54 Z" fill="#E0DCD6" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#E0DCD6" />
              <circle cx="41.5" cy="44" r="1.6" fill="#221812" />
              <circle cx="58.5" cy="44" r="1.6" fill="#221812" />
              <path d="M45 61 Q50 64 55 61" stroke="#221812" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 18. MN: Batbayar (Mongolia) - Topi Malgai kerucut bulu rubah & Deel nomad */}
          {npcKey === 'MN' && (
            <g id="npc-batbayar">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#752222" />
              <path d="M44 72 L58 84 L52 100" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DCA376" />
              <ellipse cx="50" cy="47" rx="19" ry="20" fill="#DCA376" />
              <path d="M26 38 Q30 20 50 14 Q70 20 74 38 Z" fill="#994D22" />
              <path d="M22 38 Q50 32 78 38 L76 43 Q50 38 24 43 Z" fill="#4A2612" />
              <circle cx="50" cy="14" r="2.5" fill="#D4AF37" />
              <line x1="50" y1="14" x2="60" y2="10" stroke="#BF2424" strokeWidth="2" />
              <circle cx="41.5" cy="44" r="1.5" fill="#241B15" />
              <circle cx="58.5" cy="44" r="1.5" fill="#241B15" />
              <path d="M43 56 Q50 54 57 56" stroke="#241B15" strokeWidth="1.8" fill="none" />
              <path d="M44 59 Q50 63 56 59" stroke="#8A4032" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 19. KP: Pemandu Ri (Korea Utara) - Jas safari militer zaitun & pin merah */}
          {npcKey === 'KP' && (
            <g id="npc-ri">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#3B4739" />
              <path d="M44 72 L50 78 L56 72" stroke="#2C362B" strokeWidth="3" fill="none" />
              <circle cx="34" cy="84" r="2.8" fill="#C92828" stroke="#D4AF37" strokeWidth="0.8" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#F8DFC8" />
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#F8DFC8" />
              <path d="M30 40 Q32 23 50 23 Q68 23 70 40 Q62 29 50 29 Q38 29 30 40 Z" fill="#1C1E20" />
              <circle cx="41.5" cy="43.5" r="1.6" fill="#1C1E20" />
              <circle cx="58.5" cy="43.5" r="1.6" fill="#1C1E20" />
              <path d="M44 57 Q50 61 56 57" stroke="#9A4838" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 20. KZ: Aksakal Nurlan (Kazakhstan) - Topi Borik bulu Kazakh & Shapan hijau sulam emas */}
          {npcKey === 'KZ' && (
            <g id="npc-nurlan">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#184236" />
              <path d="M40 72 L48 100 L52 100 L60 72 Z" fill="#D4AF37" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DCA376" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#DCA376" />
              <path d="M34 52 Q35 72 50 74 Q65 72 66 52 Q62 58 50 58 Q38 58 34 52 Z" fill="#EDEDEA" />
              <path d="M26 36 Q30 18 50 16 Q70 18 74 36 Z" fill="#184236" />
              <path d="M22 36 Q50 31 78 36 L76 42 Q50 36 24 42 Z" fill="#6B3F23" />
              <circle cx="41.5" cy="43.5" r="1.5" fill="#241B15" />
              <circle cx="58.5" cy="43.5" r="1.5" fill="#241B15" />
              <path d="M45 61 Q50 64 55 61" stroke="#BA8C60" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 21. KG: Ata Bakyt (Kirgizstan) - Topi Ak-kalpak wol putih Kirgiz */}
          {npcKey === 'KG' && (
            <g id="npc-bakyt">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#2C3539" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBAE82" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#DBAE82" />
              <path d="M34 52 Q35 72 50 74 Q65 72 66 52 Q62 58 50 58 Q38 58 34 52 Z" fill="#ECE8E1" />
              <path d="M28 36 L38 12 L50 8 L62 12 L72 36 Z" fill="#FAF8F5" stroke="#242120" strokeWidth="1.2" />
              <line x1="50" y1="8" x2="50" y2="36" stroke="#242120" strokeWidth="1.5" />
              <path d="M26 36 L74 36 L70 41 L30 41 Z" fill="#242120" />
              <circle cx="41.5" cy="43.5" r="1.5" fill="#241B15" />
              <circle cx="58.5" cy="43.5" r="1.5" fill="#241B15" />
              <path d="M45 61 Q50 64 55 61" stroke="#BA8C60" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 22. TJ: Bobo Rustam (Tajikistan) - Peci Toqi Tajiki sulam & rompi chapan */}
          {npcKey === 'TJ' && (
            <g id="npc-tajik">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#752233" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D69B6C" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#D69B6C" />
              <path d="M30 38 L35 22 L65 22 L70 38 Q50 33 30 38 Z" fill="#1C4B54" />
              <line x1="35" y1="30" x2="65" y2="30" stroke="#E5B942" strokeWidth="1.8" strokeDasharray="2,2" />
              <circle cx="41.5" cy="44" r="1.6" fill="#241B15" />
              <circle cx="58.5" cy="44" r="1.6" fill="#241B15" />
              <path d="M44 59 Q50 63 56 59" stroke="#7A3B2F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 23. TM_TM: Yashuli Mergen (Turkmenistan) - Topi bulu domba Telpek hitam besar */}
          {npcKey === 'TM_TM' && (
            <g id="npc-mergen">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#8C2424" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBAE82" />
              <ellipse cx="50" cy="48" rx="18.5" ry="20" fill="#DBAE82" />
              <ellipse cx="50" cy="25" rx="26" ry="18" fill="#1E1C1A" />
              <circle cx="41.5" cy="45" r="1.5" fill="#241B15" />
              <circle cx="58.5" cy="45" r="1.5" fill="#241B15" />
              <path d="M43 57 Q50 54 57 57" stroke="#241B15" strokeWidth="1.8" fill="none" />
              <path d="M44 60 Q50 64 56 60" stroke="#7A3B2F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 24. IN: Paman Rajesh (India) - Kurta sutra kunyit, Nehru jacket marun, tilak dahi */}
          {npcKey === 'IN' && (
            <g id="npc-rajesh">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#E8A628" />
              <path d="M28 78 L42 100 L58 100 L72 78 Z" fill="#781D2E" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#B36E40" />
              <ellipse cx="50" cy="46" rx="19" ry="21" fill="#B36E40" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#1F1B18" />
              <circle cx="50" cy="38" r="2" fill="#C92828" />
              <circle cx="41.5" cy="44.5" r="1.6" fill="#1F1B18" />
              <circle cx="58.5" cy="44.5" r="1.6" fill="#1F1B18" />
              <path d="M43 56 Q50 54 57 56" stroke="#1F1B18" strokeWidth="1.8" fill="none" />
              <path d="M44 60 Q50 65 56 60" stroke="#7A3B2F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 25. AF: Kaka Ahmad (Afganistan) - Topi wol gulung Pakol & syal patu */}
          {npcKey === 'AF' && (
            <g id="npc-ahmad">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#5E4E3E" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#C9946B" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#C9946B" />
              <path d="M34 50 Q35 72 50 74 Q65 72 66 50 Q63 56 50 56 Q37 56 34 50 Z" fill="#241B15" />
              <ellipse cx="50" cy="26" rx="20" ry="6" fill="#807264" />
              <ellipse cx="50" cy="30" rx="21" ry="3.5" fill="#66594C" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1F1B18" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1F1B18" />
              <path d="M45 59 Q50 63 55 59" stroke="#C9946B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 26. BD: Chacha Farhan (Bangladesh) - Panjabi katun bordir & peci putih */}
          {npcKey === 'BD' && (
            <g id="npc-farhan">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#FAF6EE" />
              <path d="M45 72 L50 82 L55 72" stroke="#226B52" strokeWidth="2" fill="none" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#A8683D" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#A8683D" />
              <path d="M32 36 L35 22 L65 22 L68 36 Q50 32 32 36 Z" fill="#FAF6EE" stroke="#D1CCC1" strokeWidth="1" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1F1B18" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1F1B18" />
              <path d="M44 60 Q50 64 56 60" stroke="#663417" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 27. BT: Lopen Karma (Bhutan) - Gho Himalaya manset putih Laget lebar & syal kabney */}
          {npcKey === 'BT' && (
            <g id="npc-karma">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#1E334D" />
              <path d="M20 90 L30 100 L40 90 Z" fill="#FFFFFF" />
              <path d="M60 90 L70 100 L80 90 Z" fill="#FFFFFF" />
              <path d="M30 74 L42 100 L58 100 L70 74 Z" fill="#E5A633" opacity="0.8" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D79E72" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#D79E72" />
              <path d="M30 42 Q32 25 50 25 Q68 25 70 42 Q64 31 50 31 Q36 31 30 42 Z" fill="#231E1B" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1F1B18" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1F1B18" />
              <path d="M44 59 Q50 63 56 59" stroke="#7A3B2F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 28. IR: Agha Mansoor (Iran) - Jas Neoclassical Persia & rambut perak */}
          {npcKey === 'IR' && (
            <g id="npc-mansoor">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#2B303A" />
              <path d="M44 72 L50 82 L56 72" stroke="#FAF8F5" strokeWidth="2.5" fill="none" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DEB087" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#DEB087" />
              <path d="M29 44 Q31 22 50 22 Q69 22 71 44 Q64 31 50 31 Q36 31 29 44 Z" fill="#B0ACB5" />
              <circle cx="41.5" cy="44" r="1.5" fill="#201C18" />
              <circle cx="58.5" cy="44" r="1.5" fill="#201C18" />
              <path d="M45 58 Q50 62 55 58" stroke="#8A4A3C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 29. MV: Baa Ibrahim (Maladewa) - Kemeja linen maritim biru laut */}
          {npcKey === 'MV' && (
            <g id="npc-ibrahim">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#1E5E7A" />
              <line x1="30" y1="78" x2="28" y2="100" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
              <line x1="70" y1="78" x2="72" y2="100" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#99582A" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#99582A" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#29201A" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M43 57 Q50 64 57 57" stroke="#613014" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 30. NP: Dai Pasang (Nepal) - Topi Dhaka prisma bermotif geometris & rompi Daura */}
          {npcKey === 'NP' && (
            <g id="npc-pasang">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#3D3833" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#C9946B" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#C9946B" />
              <path d="M28 36 L34 16 L66 22 L72 36 Q50 32 28 36 Z" fill="#8C2B32" />
              <line x1="34" y1="26" x2="66" y2="30" stroke="#E8C34E" strokeWidth="1.8" strokeDasharray="2,2" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M44 59 Q50 63 56 59" stroke="#7A3B2F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 31. PK: Chacha Tariq (Pakistan) - Shalwar Kameez abu-abu & topi Karakul */}
          {npcKey === 'PK' && (
            <g id="npc-tariq-pk">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#3C4146" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#CCA07A" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#CCA07A" />
              <path d="M30 36 L38 18 L62 18 L70 36 Q50 32 30 36 Z" fill="#201F21" />
              <path d="M41 55 Q50 53 59 55" stroke="#201F21" strokeWidth="2" fill="none" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M44 59 Q50 63 56 59" stroke="#7A3B2F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 32. LK: Mama Sunil (Sri Lanka) - Kerah Nehru & selendang sutra teratai Ceylon */}
          {npcKey === 'LK' && (
            <g id="npc-sunil">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F8F6F0" />
              <path d="M26 74 L38 100 L54 100 L42 74 Z" fill="#B84A39" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#A86B3E" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#A86B3E" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#261E19" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M43 58 Q50 65 57 58" stroke="#6B381A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 33. AM: Vartan (Armenia) - Rompi wol Ararat ornamen salib emas */}
          {npcKey === 'AM' && (
            <g id="npc-vartan">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#6B2222" />
              <circle cx="50" cy="86" r="3" fill="#D4AF37" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DEB087" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#DEB087" />
              <path d="M34 50 Q35 70 50 72 Q65 70 66 50 Q63 56 50 56 Q37 56 34 50 Z" fill="#2D201A" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#2D201A" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#DEB087" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 34. AZ: Aga Murad (Azerbaijan) - Topi bulu Papakha Kaukasus & kemeja Arkhalig */}
          {npcKey === 'AZ' && (
            <g id="npc-murad">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#1F324D" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBAE82" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#DBAE82" />
              <ellipse cx="50" cy="27" rx="21" ry="12" fill="#2C2725" />
              <path d="M38 54 Q44 50 50 53 Q56 50 62 54" stroke="#2C2725" strokeWidth="2.2" fill="none" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#8A4A3C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 35. BH: Syaikh Salman (Bahrain) - Ghutrah merah putih shemagh kotak & agal ganda */}
          {npcKey === 'BH' && (
            <g id="npc-salman">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F8F6F0" />
              <path d="M22 45 Q20 78 26 100 L35 100 Q28 78 30 50 Z" fill="#C93232" />
              <path d="M78 45 Q80 78 74 100 L65 100 Q72 78 70 50 Z" fill="#C93232" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D49968" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#D49968" />
              <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q66 32 50 32 Q34 32 28 42 Z" fill="#C93232" />
              <ellipse cx="50" cy="27" rx="20" ry="4" fill="none" stroke="#1C1C1E" strokeWidth="3" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#D49968" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 36. CY: Kyrios Andreas (Siprus) - Kemeja linen putih & flat cap Siprus */}
          {npcKey === 'CY' && (
            <g id="npc-andreas">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#47523F" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DEB087" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#DEB087" />
              <ellipse cx="50" cy="27" rx="21" ry="7" fill="#3D4045" />
              <path d="M28 32 Q50 28 72 32 Z" fill="#2B2D30" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M44 59 Q50 64 56 59" stroke="#8A4A3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 37. GE: Batono Giorgi (Georgia) - Chokha tradisional wadah peluru gazyri */}
          {npcKey === 'GE' && (
            <g id="npc-giorgi">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#242124" />
              <rect x="25" y="80" width="12" height="5" fill="#FAF6EE" stroke="#1C1B1F" strokeWidth="0.8" />
              <rect x="63" y="80" width="12" height="5" fill="#FAF6EE" stroke="#1C1B1F" strokeWidth="0.8" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#E0B792" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#E0B792" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#241B15" />
              <path d="M36 55 Q43 51 50 54 Q57 51 64 55" stroke="#241B15" strokeWidth="2.2" fill="none" />
              <circle cx="41.5" cy="43.5" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="43.5" r="1.6" fill="#1C1612" />
              <path d="M45 61 Q50 64 55 61" stroke="#9E4636" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 38. IQ: Ustaz Tariq (Irak) - Keffiyeh Mesopotamia & Bisht cokelat tepi emas */}
          {npcKey === 'IQ' && (
            <g id="npc-tariq-iq">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#543621" />
              <path d="M38 72 L48 100 L52 100 L62 72 Z" fill="#D4AF37" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D79E72" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#D79E72" />
              <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q66 32 50 32 Q34 32 28 42 Z" fill="#FFFFFF" stroke="#333333" strokeWidth="1" strokeDasharray="2,2" />
              <ellipse cx="50" cy="27" rx="20" ry="4" fill="none" stroke="#1C1C1E" strokeWidth="3.5" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#D79E72" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 39. IL: Avi (Israel) - Kemeja katun santai & kippah rajut */}
          {npcKey === 'IL' && (
            <g id="npc-avi">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F8F7F4" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#E8BA92" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#E8BA92" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#5C4535" />
              <ellipse cx="50" cy="24" rx="8" ry="3.5" fill="#1C4B82" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M43 58 Q50 64 57 58" stroke="#8A4A3C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 40. JO: Abu Omar (Yordania) - Keffiyeh Hatta merah-putih rumbai Petra */}
          {npcKey === 'JO' && (
            <g id="npc-omar">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#57493E" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D49968" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#D49968" />
              <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q66 32 50 32 Q34 32 28 42 Z" fill="#C93232" />
              <circle cx="28" cy="42" r="2" fill="#FFFFFF" />
              <circle cx="72" cy="42" r="2" fill="#FFFFFF" />
              <ellipse cx="50" cy="27" rx="20" ry="4" fill="none" stroke="#1C1C1E" strokeWidth="3" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#D49968" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 41. KW: Abu Fahad (Kuwait) - Ghutrah putih kobra Kuwait & thobe berkilau */}
          {npcKey === 'KW' && (
            <g id="npc-fahad">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#FFFFFF" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DCA376" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#DCA376" />
              <path d="M24 38 Q30 18 50 18 Q70 18 76 38 L68 44 Q50 28 32 44 Z" fill="#F8F7F4" />
              <ellipse cx="50" cy="26" rx="18" ry="3.5" fill="none" stroke="#1C1C1E" strokeWidth="3" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M44 59 Q50 63 56 59" stroke="#8A4A3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 42. LB: Paman Michel (Lebanon) - Rompi pohon aras cedar Lebanon */}
          {npcKey === 'LB' && (
            <g id="npc-michel">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#8C2B38" />
              <path d="M50 82 L46 88 L54 88 Z" fill="#1C5E3B" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#E5BA92" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#E5BA92" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#241F1C" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M43 58 Q50 64 57 58" stroke="#8A4A3C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 43. OM: Syaikh Salim (Oman) - Peci Kuma sulam bundar khas Kesultanan Oman */}
          {npcKey === 'OM' && (
            <g id="npc-salim">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#FAF7F2" />
              <line x1="50" y1="72" x2="56" y2="84" stroke="#996E2E" strokeWidth="2" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D49968" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#D49968" />
              <path d="M30 38 L32 20 L68 20 L70 38 Q50 34 30 38 Z" fill="#C99438" />
              <circle cx="50" cy="28" r="2" fill="#1C4B54" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M44 59 Q50 63 56 59" stroke="#8A4A3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 44. PS: Abu Tariq (Palestina) - Keffiyeh jaring ikan Palestina melingkar */}
          {npcKey === 'PS' && (
            <g id="npc-tariq-ps">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#2E3338" />
              <path d="M22 68 Q50 86 78 68 L70 100 L30 100 Z" fill="#F4F2EC" stroke="#1C1C1E" strokeWidth="1.5" strokeDasharray="3,3" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D49968" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#D49968" />
              <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q66 32 50 32 Q34 32 28 42 Z" fill="#F4F2EC" stroke="#1C1C1E" strokeWidth="1.2" strokeDasharray="2,2" />
              <ellipse cx="50" cy="27" rx="20" ry="4" fill="none" stroke="#1C1C1E" strokeWidth="3" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#D49968" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 45. QA: Syaikh Hamad (Qatar) - Ghutrah putih kobra Qatar agal ekor ganda */}
          {npcKey === 'QA' && (
            <g id="npc-hamad">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#6B1D2F" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DCA376" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#DCA376" />
              <path d="M24 38 Q30 18 50 18 Q70 18 76 38 L68 44 Q50 28 32 44 Z" fill="#FFFFFF" />
              <ellipse cx="50" cy="26" rx="18" ry="3.5" fill="none" stroke="#1C1C1E" strokeWidth="3" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M44 59 Q50 63 56 59" stroke="#8A4A3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 46. SY: Paman Samer (Suriah) - Jas Damaskus wol kashmiri & syal sutra */}
          {npcKey === 'SY' && (
            <g id="npc-samer">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#3D3833" />
              <path d="M35 74 L50 94 L65 74 Z" fill="#8C382A" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DEB087" />
              <ellipse cx="50" cy="46" rx="18.5" ry="20" fill="#DEB087" />
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#2E231C" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M44 59 Q50 64 56 59" stroke="#8A4A3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 47. AE: Syaikh Zayed (UEA) - Kandura putih & ghutrah putih Emirati */}
          {npcKey === 'AE' && (
            <g id="npc-zayed">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F8F7F4" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBA878" />
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#DBA878" />
              <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q66 32 50 32 Q34 32 28 42 Z" fill="#FFFFFF" />
              <ellipse cx="50" cy="27" rx="19" ry="3.5" fill="none" stroke="#1C1C1E" strokeWidth="3" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#DBA878" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* 48. YE: Ami Saleh (Yaman) - Sorban Yamani lilit & jenggot henna */}
          {npcKey === 'YE' && (
            <g id="npc-saleh">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#6B4B32" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#C9946B" />
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#C9946B" />
              <path d="M34 50 Q35 72 50 74 Q65 72 66 50 Q63 56 50 56 Q37 56 34 50 Z" fill="#A8482A" />
              <ellipse cx="50" cy="26" rx="22" ry="9" fill="#D4AF6A" />
              <path d="M28 28 Q50 22 72 28" stroke="#8C4A22" strokeWidth="2.5" fill="none" />
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              <path d="M45 59 Q50 63 55 59" stroke="#C9946B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {/* Fallback GENERIC */}
          {npcKey === 'GENERIC' && (
            <g id="npc-generic">
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#2B4C47" />
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#E8B88A" />
              <ellipse cx="50" cy="46" rx="19" ry="21" fill="#E8B88A" />
              <path d="M30 42 Q32 25 50 25 Q68 25 70 42 Q64 32 50 32 Q36 32 30 42 Z" fill="#2E231C" />
              <circle cx="41" cy="44" r="1.6" fill="#2E231C" />
              <circle cx="59" cy="44" r="1.6" fill="#2E231C" />
              <path d="M44 58 Q50 64 56 58" stroke="#8A4A3C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}

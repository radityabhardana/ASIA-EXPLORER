import { useId } from 'react';

interface NpcIllustrationProps {
  id?: string; // 'PT' | 'MS' | 'PJ' | 'UT' | 'TM' | 'MZ' | 'MP' | 'SK' | 'UE' | 'AR' or country code or name
  nama?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  expression?: 'senang' | 'netral' | 'bingung' | 'kecewa' | 'kagum';
}

function normalizeNpcId(rawId = '', name = ''): string {
  const cleanId = rawId.trim().toUpperCase();
  const cleanName = name.trim().toLowerCase();

  if (cleanId === 'PT' || cleanId === 'JP' || cleanName.includes('tanaka')) return 'PT';
  if (cleanId === 'MS' || cleanId === 'TH' || cleanName.includes('somchai')) return 'MS';
  if (cleanId === 'PJ' || cleanId === 'ID' || cleanName.includes('joko')) return 'PJ';
  if (cleanId === 'UT' || cleanId === 'SG' || cleanName.includes('tan')) return 'UT';
  if (cleanId === 'TM' || cleanId === 'PH' || cleanName.includes('maria')) return 'TM';
  if (cleanId === 'MZ' || cleanId === 'CN' || cleanName.includes('zhang')) return 'MZ';
  if (cleanId === 'MP' || cleanId === 'KR' || cleanName.includes('park')) return 'MP';
  if (cleanId === 'SK' || cleanId === 'SA' || cleanName.includes('khalid')) return 'SK';
  if (cleanId === 'UE' || cleanId === 'TR' || cleanName.includes('emre')) return 'UE';
  if (cleanId === 'AR' || cleanId === 'UZ' || cleanName.includes('rustam')) return 'AR';

  return 'GENERIC';
}

export function NpcIllustratedAvatar({
  id = '',
  nama = 'Karakter',
  size = 'medium',
  className = '',
  expression = 'netral',
}: NpcIllustrationProps) {
  const uniqueId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const npcKey = normalizeNpcId(id, nama);
  const sizeMap = {
    small: { width: 36, height: 36, viewSize: 100 },
    medium: { width: 52, height: 52, viewSize: 100 },
    large: { width: 86, height: 86, viewSize: 100 },
  };

  const { width, height } = sizeMap[size] ?? sizeMap.medium;

  // Mouth path based on expression
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
          {/* Subtle drop shadow / gradient */}
          <linearGradient id={`bg-parchment-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDFBF7" />
            <stop offset="100%" stopColor="#EDE4D4" />
          </linearGradient>
        </defs>

        {/* Outer Circular Base */}
        <circle cx="50" cy="50" r="48" fill={`url(#bg-parchment-${uniqueId})`} stroke="#176B68" strokeWidth="2.5" />

        {/* Clipped Character Artwork */}
        <g clipPath={`url(#clip-${uniqueId})`}>
          {npcKey === 'PT' && (
            /* 1. Pak Tanaka (Jepang) - Kimono biru gelap, kacamata, rambut rapi */
            <g data-testid="npc-pt">
              {/* Shoulders & Kimono */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#223147" />
              {/* Kimono white inner collar V (cross left over right) */}
              <path d="M42 72 L50 86 L58 72 Z" fill="#FAF8F3" />
              <path d="M44 72 L50 83 L53 88 L46 88 Z" fill="#223147" />
              <path d="M47 72 L50 88 L58 72 L53 72 Z" fill="#1B283A" />
              {/* Neck */}
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#F8DFC8" />
              {/* Head / Face */}
              <ellipse cx="50" cy="46" rx="19" ry="21" fill="#F8DFC8" />
              {/* Ears */}
              <ellipse cx="30" cy="47" rx="3.5" ry="6" fill="#F3CFB0" />
              <ellipse cx="70" cy="47" rx="3.5" ry="6" fill="#F3CFB0" />
              {/* Hair (Japanese side-part, neat) */}
              <path
                d="M30 42 Q32 25 50 25 Q68 25 70 42 Q66 32 50 31 Q36 32 30 42 Z"
                fill="#241E1A"
              />
              <path d="M29 42 Q30 32 40 28 Q44 33 32 45 Z" fill="#241E1A" />
              {/* Eyebrows */}
              <path d="M37 38 Q42 36 46 39" stroke="#241E1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M54 39 Q58 36 63 38" stroke="#241E1A" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              {/* Glasses */}
              <rect x="36" y="41" width="10" height="7" rx="2.5" fill="none" stroke="#7A532C" strokeWidth="1.6" />
              <rect x="54" y="41" width="10" height="7" rx="2.5" fill="none" stroke="#7A532C" strokeWidth="1.6" />
              <line x1="46" y1="44" x2="54" y2="44" stroke="#7A532C" strokeWidth="1.6" />
              {/* Eyes */}
              <circle cx="41" cy="44.5" r="1.5" fill="#241E1A" />
              <circle cx="59" cy="44.5" r="1.5" fill="#241E1A" />
              {/* Nose */}
              <path d="M50 46 L49 53 L52 53" stroke="#DCAE8B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Mouth */}
              {isSmiling ? (
                <path d="M44 58 Q50 64 56 58" stroke="#B3654B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              ) : isConcerned ? (
                <path d="M45 61 Q50 57 55 61" stroke="#B3654B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              ) : (
                <path d="M45 59 Q50 61 55 59" stroke="#B3654B" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              )}
            </g>
          )}

          {npcKey === 'MS' && (
            /* 2. Mae Somchai (Thailand) - Sanggul khas Lanna, sabai selendang sutra teal */
            <g id="npc-somchai">
              {/* Shoulders & Traditional Thai Blouse */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#D99B38" />
              {/* Sabai Sash (Teal Silk across left shoulder) */}
              <path d="M22 100 L32 73 L48 72 L36 100 Z" fill="#176B68" />
              <path d="M27 100 L35 73 L40 72 L32 100 Z" fill="#125452" />
              {/* Neck & Gold Necklace */}
              <rect x="44" y="58" width="12" height="16" rx="3" fill="#E8B88A" />
              <path d="M44 68 Q50 73 56 68" stroke="#D4AF37" strokeWidth="2" fill="none" />
              {/* Head / Face */}
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#E8B88A" />
              {/* Ears & Gold Earrings */}
              <ellipse cx="31" cy="46" rx="3" ry="5.5" fill="#DC9F6E" />
              <circle cx="31" cy="51" r="2" fill="#D4AF37" />
              <ellipse cx="69" cy="46" rx="3" ry="5.5" fill="#DC9F6E" />
              <circle cx="69" cy="51" r="2" fill="#D4AF37" />
              {/* Traditional Bun (Top Hair) */}
              <circle cx="50" cy="22" r="10" fill="#382820" />
              <circle cx="50" cy="22" r="3" fill="#D4AF37" />
              {/* Front Hair */}
              <path d="M31 40 Q33 28 50 28 Q67 28 69 40 Q62 33 50 33 Q38 33 31 40 Z" fill="#382820" />
              {/* Eyes & Eyebrows */}
              <path d="M37 38 Q42 35 46 38" stroke="#382820" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M54 38 Q58 35 63 38" stroke="#382820" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <ellipse cx="41.5" cy="43.5" rx="2" ry="1.4" fill="#382820" />
              <ellipse cx="58.5" cy="43.5" rx="2" ry="1.4" fill="#382820" />
              {/* Soft Blush */}
              <circle cx="37" cy="49" r="4" fill="#C97A5F" opacity="0.3" />
              <circle cx="63" cy="49" r="4" fill="#C97A5F" opacity="0.3" />
              {/* Nose */}
              <path d="M50 45 Q48 51 51 51" stroke="#C28659" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Warm Smile */}
              <path d="M43 56 Q50 63 57 56" stroke="#A84832" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'PJ' && (
            /* 3. Pak Joko (Indonesia) - Blangkon Jawa Yogyakarta, surjan lurik, kumis santun */
            <g id="npc-joko">
              {/* Shoulders & Surjan Lurik jacket */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#423428" />
              {/* Lurik stripes */}
              <line x1="28" y1="78" x2="26" y2="100" stroke="#685444" strokeWidth="2" />
              <line x1="38" y1="75" x2="36" y2="100" stroke="#685444" strokeWidth="2" />
              <line x1="62" y1="75" x2="64" y2="100" stroke="#685444" strokeWidth="2" />
              <line x1="72" y1="78" x2="74" y2="100" stroke="#685444" strokeWidth="2" />
              {/* High Surjan Collar */}
              <path d="M43 73 L50 82 L57 73 Z" fill="#2E241B" />
              {/* Neck */}
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#D29B6C" />
              {/* Head / Face */}
              <ellipse cx="50" cy="47" rx="19" ry="21" fill="#D29B6C" />
              {/* Ears */}
              <ellipse cx="30" cy="48" rx="3.5" ry="6" fill="#C18756" />
              <ellipse cx="70" cy="48" rx="3.5" ry="6" fill="#C18756" />
              {/* Blangkon Jogja Headdress */}
              <path
                d="M28 42 Q30 22 50 22 Q70 22 72 42 Q66 34 50 34 Q34 34 28 42 Z"
                fill="#543621"
              />
              <path d="M30 38 Q50 33 70 38 L69 41 Q50 36 31 41 Z" fill="#754E33" />
              {/* Mondholan knob on left/back */}
              <circle cx="71" cy="43" r="4.5" fill="#543621" />
              {/* Eyebrows */}
              <path d="M37 39 Q42 36 46 39" stroke="#35261C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M54 39 Q58 36 63 39" stroke="#35261C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              {/* Friendly eyes */}
              <circle cx="41.5" cy="44.5" r="1.6" fill="#2B1E16" />
              <circle cx="58.5" cy="44.5" r="1.6" fill="#2B1E16" />
              {/* Nose */}
              <path d="M50 46 L48.5 53 L52.5 53" stroke="#AC7242" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Javanese trimmed mustache */}
              <path d="M43 57 Q50 54 57 57 Q50 58 43 57 Z" fill="#35261C" />
              {/* Gentle smile */}
              <path d="M44 60 Q50 64 56 60" stroke="#35261C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'UT' && (
            /* 4. Uncle Tan (Singapura) - Kemeja polo santai, kacamata emas, senyum ramah */
            <g id="npc-uncletan">
              {/* Shoulders & White/Cream Polo */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#EAE6DF" />
              {/* Polo Collar & Placket */}
              <path d="M40 72 L47 80 L50 87 L53 80 L60 72 Z" fill="#D6D0C5" />
              <rect x="48.5" y="80" width="3" height="12" fill="#D6D0C5" />
              <circle cx="50" cy="84" r="1" fill="#7A756D" />
              <circle cx="50" cy="89" r="1" fill="#7A756D" />
              {/* Neck */}
              <rect x="44" y="59" width="12" height="15" rx="3" fill="#F2D8BD" />
              {/* Head / Face */}
              <ellipse cx="50" cy="46" rx="19.5" ry="21" fill="#F2D8BD" />
              {/* Ears */}
              <ellipse cx="29.5" cy="47" rx="3.5" ry="6" fill="#E4C19F" />
              <ellipse cx="70.5" cy="47" rx="3.5" ry="6" fill="#E4C19F" />
              {/* Grey-black hair receding on temples */}
              <path d="M30 46 Q31 28 50 27 Q69 28 70 46 Q67 33 50 33 Q33 33 30 46 Z" fill="#5A5754" />
              <path d="M29 45 Q31 34 38 33 Q34 44 30 46 Z" fill="#5A5754" />
              <path d="M71 45 Q69 34 62 33 Q66 44 70 46 Z" fill="#5A5754" />
              {/* Eyebrows */}
              <path d="M37 38 Q42 36 46 38" stroke="#5A5754" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M54 38 Q58 36 63 38" stroke="#5A5754" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              {/* Glasses */}
              <rect x="36" y="41" width="10.5" height="7.5" rx="2" fill="none" stroke="#C29B38" strokeWidth="1.5" />
              <rect x="53.5" y="41" width="10.5" height="7.5" rx="2" fill="none" stroke="#C29B38" strokeWidth="1.5" />
              <line x1="46.5" y1="44.5" x2="53.5" y2="44.5" stroke="#C29B38" strokeWidth="1.5" />
              {/* Eyes with cheerful crinkles */}
              <circle cx="41.5" cy="44.5" r="1.5" fill="#2B2623" />
              <circle cx="58.5" cy="44.5" r="1.5" fill="#2B2623" />
              <path d="M47 44 Q49 46 47 48" stroke="#D1A77E" strokeWidth="1" fill="none" />
              <path d="M53 44 Q51 46 53 48" stroke="#D1A77E" strokeWidth="1" fill="none" />
              {/* Nose */}
              <path d="M50 46 L48.5 53 L52 53" stroke="#D1A77E" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Wide friendly Hawker smile */}
              <path d="M43 58 Q50 65 57 58" stroke="#9C4436" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'TM' && (
            /* 5. Tita Maria (Filipina) - Kerah Baro't saya, bunga sampaguita, senyum ceria */
            <g id="npc-maria">
              {/* Shoulders & Baro't Saya butterfly sleeves */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#E8D5BF" />
              {/* Embroidery detailing on neckline */}
              <path d="M38 74 Q50 82 62 74" stroke="#B85C5C" strokeWidth="2" strokeDasharray="2,2" fill="none" />
              {/* Neck */}
              <rect x="44" y="58" width="12" height="16" rx="3" fill="#DFA978" />
              <circle cx="50" cy="70" r="2" fill="#FDFBF7" stroke="#DFA978" strokeWidth="0.5" />
              {/* Head / Face */}
              <ellipse cx="50" cy="45" rx="19" ry="20" fill="#DFA978" />
              {/* Ears & Pearl earrings */}
              <ellipse cx="30" cy="46" rx="3" ry="5.5" fill="#CF935E" />
              <circle cx="30" cy="51" r="2.2" fill="#FFFFFF" stroke="#D5C5B5" strokeWidth="0.5" />
              <ellipse cx="70" cy="46" rx="3" ry="5.5" fill="#CF935E" />
              <circle cx="70" cy="51" r="2.2" fill="#FFFFFF" stroke="#D5C5B5" strokeWidth="0.5" />
              {/* Dark wavy hair */}
              <path d="M29 46 Q31 25 50 25 Q69 25 71 46 Q64 32 50 32 Q36 32 29 46 Z" fill="#2C221D" />
              {/* White Sampaguita Jasmine flower in hair */}
              <circle cx="32" cy="32" r="3.5" fill="#FFFFFF" />
              <circle cx="32" cy="32" r="1.2" fill="#E8C34E" />
              {/* Eyebrows */}
              <path d="M37 37 Q42 34 46 37" stroke="#2C221D" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              <path d="M54 37 Q58 34 63 37" stroke="#2C221D" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              {/* Eyes */}
              <ellipse cx="41.5" cy="42.5" rx="2" ry="1.5" fill="#2C221D" />
              <ellipse cx="58.5" cy="42.5" rx="2" ry="1.5" fill="#2C221D" />
              {/* Cheerful blush */}
              <circle cx="36" cy="48" r="4.5" fill="#D46A6A" opacity="0.35" />
              <circle cx="64" cy="48" r="4.5" fill="#D46A6A" opacity="0.35" />
              {/* Nose */}
              <path d="M50 44 L48.5 50 L52 50" stroke="#B87B48" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              {/* Hearty Pinoy Smile */}
              <path d="M42 55 Q50 63 58 55" stroke="#A83232" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'MZ' && (
            /* 6. Master Zhang (Tiongkok) - Baju Changshan hijau giok, kerah shanghai, jenggot bijak */
            <g id="npc-zhang">
              {/* Shoulders & Jade Green Changshan */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#204A41" />
              {/* Mandarin Standup Collar & Golden Frog Button */}
              <path d="M43 72 L50 78 L57 72" stroke="#17362F" strokeWidth="3" fill="none" />
              <circle cx="50" cy="76" r="2" fill="#D4AF37" />
              <path d="M50 78 L50 100" stroke="#17362F" strokeWidth="1.8" />
              {/* Neck */}
              <rect x="44" y="60" width="12" height="14" rx="3" fill="#F0D5BB" />
              {/* Head / Face */}
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#F0D5BB" />
              {/* Ears */}
              <ellipse cx="30.5" cy="46" rx="3.2" ry="5.5" fill="#DEBC9F" />
              <ellipse cx="69.5" cy="46" rx="3.2" ry="5.5" fill="#DEBC9F" />
              {/* Hair (traditional, sleek) */}
              <path d="M30 42 Q32 25 50 25 Q68 25 70 42 Q64 31 50 31 Q36 31 30 42 Z" fill="#231E1B" />
              {/* Eyebrows (arching gently) */}
              <path d="M37 38 Q42 35 46 38" stroke="#231E1B" strokeWidth="1.7" strokeLinecap="round" fill="none" />
              <path d="M54 38 Q58 35 63 38" stroke="#231E1B" strokeWidth="1.7" strokeLinecap="round" fill="none" />
              {/* Serene eyes */}
              <path d="M39 43 Q42 41 45 43" stroke="#231E1B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M55 43 Q58 41 61 43" stroke="#231E1B" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              {/* Nose */}
              <path d="M50 44 L49 52 L52 52" stroke="#CFA783" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              {/* Wise Goatee Beard */}
              <path d="M47 59 Q50 71 53 59 Z" fill="#2E241E" />
              {/* Calm smile */}
              <path d="M45 56 Q50 59 55 56" stroke="#8A4A3C" strokeWidth="1.4" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'MP' && (
            /* 7. Manajer Park (Korea) - Jas modern bisnis, dasi teal, gaya rambut two-block */
            <g id="npc-park">
              {/* Dark Charcoal Business Suit */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#1C2530" />
              {/* White Dress Shirt V */}
              <path d="M40 72 L50 92 L60 72 Z" fill="#FFFFFF" />
              {/* Suit Lapels */}
              <path d="M33 76 L44 94 L37 100 Z" fill="#273342" />
              <path d="M67 76 L56 94 L63 100 Z" fill="#273342" />
              {/* Teal Silk Necktie */}
              <path d="M48 80 L52 80 L53 100 L47 100 Z" fill="#176B68" />
              {/* Neck */}
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#FCEBDC" />
              {/* Head / Face */}
              <ellipse cx="50" cy="45" rx="18.5" ry="20" fill="#FCEBDC" />
              {/* Ears */}
              <ellipse cx="30.5" cy="46" rx="3.2" ry="5.5" fill="#EACBB6" />
              <ellipse cx="69.5" cy="46" rx="3.2" ry="5.5" fill="#EACBB6" />
              {/* Two-block contemporary Korean haircut */}
              <path
                d="M30 40 Q32 23 50 23 Q68 23 70 40 Q62 29 53 30 Q44 28 30 40 Z"
                fill="#1B2026"
              />
              <path d="M30 40 Q33 33 46 32 Q38 41 32 44 Z" fill="#1B2026" />
              {/* Eyebrows (neat, defined) */}
              <path d="M37 37 Q42 35 46 37" stroke="#1B2026" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M54 37 Q58 35 63 37" stroke="#1B2026" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Sharp, confident eyes */}
              <circle cx="41.5" cy="43" r="1.6" fill="#1B2026" />
              <circle cx="58.5" cy="43" r="1.6" fill="#1B2026" />
              {/* Nose */}
              <path d="M50 44 L49 51 L52 51" stroke="#DEB79B" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              {/* Professional polite smile */}
              <path d="M44 57 Q50 61 56 57" stroke="#A85444" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'SK' && (
            /* 8. Syaikh Khalid (Arab Saudi) - Ghutrah putih, agal hitam, janggut rapi bermartabat */
            <g id="npc-khalid">
              {/* Shoulders & White Thobe */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F8F7F4" />
              {/* Thobe High Collar */}
              <path d="M44 72 L50 77 L56 72" stroke="#DFDBD2" strokeWidth="2" fill="none" />
              {/* Ghutrah headdress falling over shoulders */}
              <path d="M22 45 Q20 78 26 100 L35 100 Q28 78 30 50 Z" fill="#EDE9E1" />
              <path d="M78 45 Q80 78 74 100 L65 100 Q72 78 70 50 Z" fill="#EDE9E1" />
              {/* Neck */}
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBA878" />
              {/* Head / Face */}
              <ellipse cx="50" cy="47" rx="18" ry="20" fill="#DBA878" />
              {/* Full Arab Beard & Mustache */}
              <path
                d="M34 50 Q35 70 50 72 Q65 70 66 50 Q63 56 50 56 Q37 56 34 50 Z"
                fill="#241C16"
              />
              <path d="M43 54 Q50 51 57 54 Q50 56 43 54 Z" fill="#241C16" />
              {/* Ghutrah Headdress Drape over forehead */}
              <path d="M28 42 Q30 20 50 20 Q70 20 72 42 Q66 32 50 32 Q34 32 28 42 Z" fill="#FAF9F6" />
              {/* Black Agal cord ring */}
              <ellipse cx="50" cy="27" rx="20" ry="4" fill="none" stroke="#1C1C1E" strokeWidth="3.2" />
              <ellipse cx="50" cy="29.5" rx="19.5" ry="3.5" fill="none" stroke="#1C1C1E" strokeWidth="2.5" />
              {/* Eyebrows */}
              <path d="M37 39 Q42 36 46 39" stroke="#241C16" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M54 39 Q58 36 63 39" stroke="#241C16" strokeWidth="2" strokeLinecap="round" fill="none" />
              {/* Deep warm eyes */}
              <circle cx="41.5" cy="44" r="1.6" fill="#1C1612" />
              <circle cx="58.5" cy="44" r="1.6" fill="#1C1612" />
              {/* Nose */}
              <path d="M50 44 L48.5 52 L52 52" stroke="#B88354" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Hospitable smile inside beard */}
              <path d="M45 59 Q50 63 55 59" stroke="#DBA878" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'UE' && (
            /* 9. Usta Emre (Turki) - Rompi marun Utsmani, kumis tebal Turki, mata ramah */
            <g id="npc-emre">
              {/* White Shirt base */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#F4EFE6" />
              {/* Traditional Crimson Ottoman Vest */}
              <path d="M20 100 L24 78 Q35 73 45 74 L40 100 Z" fill="#80242D" />
              <path d="M80 100 L76 78 Q65 73 55 74 L60 100 Z" fill="#80242D" />
              {/* Gold vest buttons */}
              <circle cx="47" cy="82" r="1.3" fill="#D4AF37" />
              <circle cx="48" cy="89" r="1.3" fill="#D4AF37" />
              {/* Neck */}
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#E5C29E" />
              {/* Head / Face */}
              <ellipse cx="50" cy="46" rx="19" ry="20" fill="#E5C29E" />
              {/* Ears */}
              <ellipse cx="30" cy="47" rx="3.5" ry="6" fill="#D3AA81" />
              <ellipse cx="70" cy="47" rx="3.5" ry="6" fill="#D3AA81" />
              {/* Wavy dark hair */}
              <path d="M29 44 Q31 24 50 24 Q69 24 71 44 Q64 32 50 32 Q36 32 29 44 Z" fill="#2D201A" />
              {/* Eyebrows */}
              <path d="M36 38 Q41 35 46 38" stroke="#2D201A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M54 38 Q59 35 64 38" stroke="#2D201A" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Friendly eyes */}
              <circle cx="41" cy="43.5" r="1.6" fill="#241914" />
              <circle cx="59" cy="43.5" r="1.6" fill="#241914" />
              {/* Nose */}
              <path d="M50 45 L48 53 L52.5 53" stroke="#BA8E63" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              {/* Iconic Turkish Curled Mustache */}
              <path
                d="M35 56 Q43 51 50 55 Q57 51 65 56 Q62 61 50 58 Q38 61 35 56 Z"
                fill="#2D201A"
              />
              {/* Warm smile */}
              <path d="M45 61 Q50 65 55 61" stroke="#94483C" strokeWidth="1.6" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'AR' && (
            /* 10. Aksakal Rustam (Uzbekistan) - Doppa Samarkand, janggut putih panjang, jubah chapan biru emas */
            <g id="npc-rustam">
              {/* Shoulders & Royal Blue Chapan Robe */}
              <path d="M15 100 L18 78 Q30 72 50 72 Q70 72 82 78 L85 100 Z" fill="#1C385C" />
              {/* Gold Embroidered Lapel */}
              <path d="M40 72 L48 100 L52 100 L60 72 Z" fill="#D4AF37" />
              <path d="M43 72 L50 96 L57 72 Z" fill="#142B47" />
              {/* Neck */}
              <rect x="44" y="60" width="12" height="15" rx="3" fill="#DBAE82" />
              {/* Head / Face */}
              <ellipse cx="50" cy="47" rx="18.5" ry="20" fill="#DBAE82" />
              {/* Full White Beard */}
              <path
                d="M33 50 Q34 76 50 78 Q66 76 67 50 Q63 58 50 58 Q37 58 33 50 Z"
                fill="#F0EDE6"
              />
              <path d="M43 55 Q50 52 57 55 Q50 57 43 55 Z" fill="#DCD7CE" />
              {/* Samarkand Doppa (Square skullcap, black with white bodom almond embroidery) */}
              <path d="M31 38 L35 22 L65 22 L69 38 Q50 33 31 38 Z" fill="#20242B" />
              {/* Almond/paisley traditional white embroidery */}
              <path d="M40 30 Q44 26 42 33" stroke="#F4F2EC" strokeWidth="1.3" fill="none" />
              <path d="M60 30 Q56 26 58 33" stroke="#F4F2EC" strokeWidth="1.3" fill="none" />
              <circle cx="50" cy="27" r="1.5" fill="#F4F2EC" />
              {/* Eyebrows (white, bushy) */}
              <path d="M37 38 Q42 35 46 38" stroke="#E5E1D8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M54 38 Q58 35 63 38" stroke="#E5E1D8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              {/* Kind eyes with wisdom lines */}
              <circle cx="41.5" cy="43.5" r="1.5" fill="#261E18" />
              <circle cx="58.5" cy="43.5" r="1.5" fill="#261E18" />
              {/* Nose */}
              <path d="M50 44 L48.5 52 L52 52" stroke="#BA8C60" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              {/* Kind elder smile */}
              <path d="M45 60 Q50 63 55 60" stroke="#BA8C60" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {npcKey === 'GENERIC' && (
            /* Fallback generic traveler / guide avatar */
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

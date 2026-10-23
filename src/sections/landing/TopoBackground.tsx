import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
};

const svgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

/**
 * TopoBackground:
 * Highland mountain sketch & plateau aesthetic on warm paper (#f4ede1).
 * Features:
 * - Subtle warm brown/ochre mountain ridge sketches with shaded highland plateau aesthetic
 * - Soft cartographic graticules & delicate perspective grid lines (matching video ref)
 * - Warm earthy gradient washes in sand/clay/ochre (#e8dec8, #d9c8aa, #bda688 at 6%-12% opacity)
 * - Seamlessly blends into --paper: #f4ede1 without jarring geometric blocks
 */
export default function TopoBackground() {
  return (
    <div className="topo-background" aria-hidden="true" style={containerStyle}>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={svgStyle}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Highland Hypsometric NW (315°) earth shading: ocher & sand tones (6%-12% opacity) */}
          <linearGradient id="highland-wash-nw" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="#e8dec8" stopOpacity="0.12" />
            <stop offset="38%" stopColor="#d9c8aa" stopOpacity="0.09" />
            <stop offset="72%" stopColor="#bda688" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#8c7355" stopOpacity="0.04" />
          </linearGradient>

          {/* Highland Summit Radial Warmth */}
          <radialGradient id="highland-summit-glow" cx="48%" cy="44%" r="62%">
            <stop offset="0%" stopColor="#ede4d4" stopOpacity="0.10" />
            <stop offset="45%" stopColor="#d9c8aa" stopOpacity="0.06" />
            <stop offset="80%" stopColor="#bda688" stopOpacity="0.02" />
            <stop offset="100%" stopColor="#f4ede1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Layer 1: Hypsometric Shading Washes --- */}
        <rect width="100%" height="100%" fill="url(#highland-wash-nw)" />
        <rect width="100%" height="100%" fill="url(#highland-summit-glow)" />

        {/* --- Layer 2: Cartographic Perspective Graticule & Grid (matches frame_003.jpg) --- */}
        <g
          stroke="#b8a186"
          strokeWidth="0.75"
          strokeOpacity="0.10"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        >
          {/* Perspective diagonal meridians */}
          <line x1="-120" y1="140" x2="1560" y2="680" />
          <line x1="-120" y1="320" x2="1560" y2="860" />
          <line x1="-120" y1="-40" x2="1560" y2="500" />
          <line x1="-120" y1="-220" x2="1560" y2="320" />

          {/* Perspective oblique parallels */}
          <line x1="240" y1="-100" x2="-20" y2="1000" />
          <line x1="600" y1="-100" x2="340" y2="1000" />
          <line x1="960" y1="-100" x2="700" y2="1000" />
          <line x1="1320" y1="-100" x2="1060" y2="1000" />
          <line x1="1680" y1="-100" x2="1420" y2="1000" />
        </g>

        {/* Cartographic coordinate intersection marks (+) */}
        <g
          stroke="#a68d71"
          strokeWidth="0.8"
          strokeOpacity="0.16"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        >
          <line x1="276" y1="220" x2="284" y2="220" />
          <line x1="280" y1="216" x2="280" y2="224" />

          <line x1="636" y1="340" x2="644" y2="340" />
          <line x1="640" y1="336" x2="640" y2="344" />

          <line x1="996" y1="460" x2="1004" y2="460" />
          <line x1="1000" y1="456" x2="1000" y2="464" />

          <line x1="456" y1="560" x2="464" y2="560" />
          <line x1="460" y1="556" x2="460" y2="564" />

          <line x1="816" y1="680" x2="824" y2="680" />
          <line x1="820" y1="676" x2="820" y2="684" />

          <line x1="1176" y1="800" x2="1184" y2="800" />
          <line x1="1180" y1="796" x2="1180" y2="804" />
        </g>

        {/* Soft cartographic survey guide ring (matches frame_003) */}
        <ellipse
          cx="720"
          cy="500"
          rx="480"
          ry="290"
          stroke="#bda688"
          strokeWidth="0.8"
          strokeOpacity="0.10"
          strokeDasharray="4 8"
          fill="none"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        />

        {/* --- Layer 3: Delicate Sketched Mountain Ridges & Plateau Scarps --- */}
        {/* Subtle ridge slope washes */}
        <g fill="#bda688" fillOpacity="0.025">
          <path d="M450,140 Q485,175 475,225 Q445,195 450,140 Z" />
          <path d="M600,132 Q630,165 622,212 Q590,175 600,132 Z" />
          <path d="M740,115 Q775,160 764,215 Q720,165 740,115 Z" />
          <path d="M890,105 Q925,150 912,204 Q870,155 890,105 Z" />
          <path d="M1200,122 Q1240,170 1224,226 Q1180,175 1200,122 Z" />
        </g>

        {/* Hand-sketched Mountain Ridge Lines & Peaks */}
        <g
          stroke="#8c7355"
          strokeWidth="0.85"
          strokeOpacity="0.11"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        >
          {/* Distant High Mountain Range Crest (Pamir / Tian Shan / Karakoram horizon) */}
          <path d="M-50,220 L40,205 L110,212 L180,175 L230,192 L310,158 L370,174 L450,132 L520,168 L600,125 L660,152 L740,108 L810,146 L890,98 L960,138 L1040,120 L1120,152 L1200,116 L1280,162 L1370,132 L1440,172 L1500,158" />

          {/* Descending Valley Ridge Spurs */}
          <path d="M180,175 L208,235 M230,192 L256,258 M310,158 L338,232" />
          <path d="M450,132 L475,225 L495,270 M520,168 L542,238" />
          <path d="M600,125 L622,212 L640,258 M660,152 L680,222" />
          <path d="M740,108 L764,215 L785,268 M810,146 L832,228" />
          <path d="M890,98 L912,204 L934,255 M960,138 L980,218" />
          <path d="M1040,120 L1066,206 M1120,152 L1145,228" />
          <path d="M1200,116 L1224,226 L1245,274 M1280,162 L1302,232" />

          {/* Fine Hachure Slope Hatchings (classic cartographic mountain relief) */}
          <path d="M440,155 L432,175 M446,160 L438,180 M452,166 L444,185 M458,172 L450,190" />
          <path d="M590,148 L582,168 M596,154 L588,174 M602,160 L594,180 M608,166 L600,185" />
          <path d="M730,130 L720,152 M737,136 L727,158 M744,142 L734,164 M751,148 L741,170" />
          <path d="M880,120 L870,144 M887,126 L877,150 M894,132 L884,156 M901,138 L891,162" />
        </g>

        {/* --- Layer 4: Highland Plateau Tablelands & Escarpment Scarps --- */}
        <g
          stroke="#9e8568"
          strokeWidth="0.8"
          strokeOpacity="0.10"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        >
          {/* Stepped Highland Plateau Crest Tier 1 (Central Highland) */}
          <path d="M-40,360 L140,335 L260,350 L420,320 L580,345 L720,315 L880,340 L1020,310 L1180,338 L1340,312 L1480,330" />

          {/* Plateau bluff rock strata vertical fractures */}
          <path d="M140,335 L144,385 M260,350 L266,400 M420,320 L424,372 M580,345 L586,396 M720,315 L726,368 M880,340 L886,392 M1020,310 L1026,364 M1180,338 L1186,390" />

          {/* Stepped Highland Plateau Crest Tier 2 (Southern Terrace) */}
          <path d="M-40,580 L180,550 L340,575 L520,540 L700,568 L860,535 L1040,562 L1220,530 L1380,558 L1500,542" />
          <path d="M180,550 L185,595 M340,575 L346,620 M520,540 L525,586 M700,568 L705,612 M860,535 L865,580 M1040,562 L1045,606 M1220,530 L1225,574" />

          {/* Gentle Foreground Foothill Bluff (Tier 3) */}
          <path d="M-40,780 L160,750 L360,772 L540,742 L740,768 L920,738 L1120,765 L1300,735 L1480,755" />
        </g>
      </svg>
    </div>
  );
}

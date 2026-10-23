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
 * TopoBackground (PRD §2.A, K18):
 * Latar belakang elevasi topografi organik dengan isolines vektor SVG halus
 * dan gradasi hipsometrik dataran tinggi bernuansa oker/tanah liat Northwest (315°).
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
          {/* Hypsometric Northwest (315°) earth shading: ocher & clay tones (8%-12% opacity) */}
          <linearGradient
            id="topo-hypsometric"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#e2d2be" stopOpacity="0.12" />
            <stop offset="35%" stopColor="#d0b898" stopOpacity="0.10" />
            <stop offset="70%" stopColor="#c49a72" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#8a6242" stopOpacity="0.06" />
          </linearGradient>

          <radialGradient
            id="topo-plateau"
            cx="40%"
            cy="35%"
            r="55%"
            fx="35%"
            fy="30%"
          >
            <stop offset="0%" stopColor="#e2d2be" stopOpacity="0.11" />
            <stop offset="45%" stopColor="#d0b898" stopOpacity="0.08" />
            <stop offset="85%" stopColor="#c49a72" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#f4ede1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Hypsometric Shading Layers */}
        <rect width="100%" height="100%" fill="url(#topo-hypsometric)" />
        <rect width="100%" height="100%" fill="url(#topo-plateau)" />

        {/* Topographic Contour Isolines (stroke: #c8b7a6, opacity: 0.22, 1.2px) */}
        <g
          stroke="#c8b7a6"
          strokeWidth="1.2"
          strokeOpacity="0.22"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: 'non-scaling-stroke' }}
        >
          {/* Plateau 1 — Northwest Highland Ridge */}
          <path d="M-80,140 C180,100 360,210 580,170 C800,130 1020,70 1260,110 C1380,130 1480,90 1560,60" />
          <path d="M-80,190 C190,150 370,250 600,210 C820,170 1030,120 1280,150 C1400,165 1490,130 1560,100" />
          <path d="M-80,240 C210,200 390,290 620,255 C840,215 1050,165 1300,195 C1410,210 1500,170 1560,145" />
          <path d="M-80,295 C225,250 410,335 645,295 C860,255 1070,210 1320,240 C1425,255 1510,210 1560,190" />

          {/* Plateau 2 — Central High Range (Pamir / Tibet analog) */}
          <path d="M-60,420 C140,360 340,460 540,400 C740,340 920,440 1140,370 C1320,310 1440,390 1560,340" />
          <path d="M-60,470 C150,410 350,505 560,445 C760,385 940,480 1160,415 C1340,355 1450,430 1560,385" />
          <path d="M-60,520 C165,460 370,550 580,490 C780,430 960,525 1180,460 C1360,400 1460,470 1560,430" />
          <path d="M-60,575 C180,510 390,595 600,535 C800,475 980,570 1200,505 C1380,445 1470,515 1560,475" />

          {/* Plateau 3 — Southern Undulating Valleys & Foothills */}
          <path d="M-60,690 C120,640 310,720 520,680 C730,640 950,710 1170,660 C1350,620 1460,680 1560,630" />
          <path d="M-60,745 C135,695 330,765 540,725 C750,685 970,755 1190,705 C1370,665 1475,720 1560,675" />
          <path d="M-60,800 C150,750 350,815 560,770 C770,730 990,800 1210,750 C1390,710 1490,765 1560,720" />
          <path d="M-60,855 C165,805 370,865 580,820 C790,775 1010,845 1230,795 C1410,755 1500,810 1560,765" />
        </g>
      </svg>
    </div>
  );
}

/**
 * CartographicGround:
 * Luminous Radial Pedestal for the 3D Asia Continent.
 *
 * Provides a warm, ambient illumination and subtle archival orbit rings
 * beneath the continent, elevating it into a three-dimensional centerpiece
 * without any schematic blueprint lines, graduation ticks, or red clutter.
 */

export default function CartographicGround() {
  return (
    <div className="landing-hero__ground" aria-hidden="true">
      <svg
        className="landing-hero__ground-svg"
        viewBox="0 0 1000 585"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Luminous warm ambient glow directly beneath the Asian landmass */}
          <radialGradient
            id="hero-ground-pedestal"
            cx="50%"
            cy="50%"
            r="50%"
            fx="50%"
            fy="48%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#fcf6ec" stopOpacity="0.65" />
            <stop offset="65%" stopColor="#f3e5d0" stopOpacity="0.30" />
            <stop offset="88%" stopColor="#ead8c0" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#f4ede1" stopOpacity="0" />
          </radialGradient>

          {/* Soft outer atmospheric wash */}
          <radialGradient
            id="hero-ground-ambient"
            cx="50%"
            cy="50%"
            r="52%"
          >
            <stop offset="0%" stopColor="#f8f1e6" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#efe2d0" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f4ede1" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Base Ambient Illumination Disc */}
        <ellipse
          className="landing-hero__ground-ambient"
          cx="500"
          cy="292.5"
          rx="498"
          ry="290"
          fill="url(#hero-ground-ambient)"
        />

        {/* Radiant Core Pedestal Glow */}
        <ellipse
          className="landing-hero__ground-disc"
          cx="500"
          cy="292.5"
          rx="470"
          ry="272"
          fill="url(#hero-ground-pedestal)"
        />

        {/* Minimal Archival Orbit Rings (Subtle Umber Hairlines, No Red, No Ticks) */}
        <ellipse
          className="landing-hero__ground-ring landing-hero__ground-ring--outer"
          cx="500"
          cy="292.5"
          rx="465"
          ry="270"
        />
        <ellipse
          className="landing-hero__ground-ring landing-hero__ground-ring--mid"
          cx="500"
          cy="292.5"
          rx="380"
          ry="220"
        />
        <ellipse
          className="landing-hero__ground-ring landing-hero__ground-ring--inner"
          cx="500"
          cy="292.5"
          rx="275"
          ry="160"
        />
      </svg>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { COUNTRIES, iso3For } from '@/content/countries48';
import { playParchmentClick } from '@/lib/audio';
import { useI18n } from '@/lib/i18n';
import { getHeroPhoto, photoObjectPosition } from './photos';
import '@/styles/region-gallery.css';

interface RegionExpeditionGalleryProps {
  onSelectCountry?: (id: string) => void;
  onOpenDirectory?: () => void;
}

interface SphereData {
  id: string;
  nameId: string;
  nameEn: string;
  count: number;
  taglineId: string;
  taglineEn: string;
  narrativeId: string;
  narrativeEn: string;
  featuredCountryId: string;
  spotlightCountryIds: string[];
  traits: {
    labelId: string;
    labelEn: string;
    descId: string;
    descEn: string;
  }[];
}

const REGION_SPHERES: SphereData[] = [
  {
    id: 'sea',
    nameId: 'Asia Tenggara',
    nameEn: 'Southeast Asia',
    count: 11,
    taglineId: 'Cincin Zamrud Khatulistiwa & Peradaban Maritim',
    taglineEn: 'Equatorial Emerald Arc & Maritime Heritage',
    narrativeId:
      'Gugusan kepulauan tropis dan semenanjung jalur rempah purba. Menyatukan peradaban maritim bahari Nusantara, tradisi luhur Theravada Indochina, dan nilai keramahan gotong royong yang mengakar ribuan tahun.',
    narrativeEn:
      'An archipelago of tropical islands and ancient spice trading routes. Blending maritime civilizations, Theravada heritage, and deeply rooted community hospitality.',
    featuredCountryId: 'id',
    spotlightCountryIds: ['th', 'vn', 'sg', 'ph'],
    traits: [
      {
        labelId: 'Etiket Sapaan',
        labelEn: 'Greeting Etiquette',
        descId: 'Senyum tulus, gestur santun sungkem & wai, serta kehangatan menyambut musafir.',
        descEn: 'Warm smiles, respectful wai gestures, and gracious hospitality for travelers.',
      },
      {
        labelId: 'Falsafah Hidup',
        labelEn: 'Living Philosophy',
        descId: 'Gotong royong komunal dan keselarasan hidup dengan siklus laut & sungai.',
        descEn: 'Communal solidarity and living in harmony with seasonal sea cycles.',
      },
      {
        labelId: 'Mahakarya Budaya',
        labelEn: 'Heritage Marvels',
        descId: 'Candi megah Borobudur, kota kuno Ayutthaya, dan teluk karst purba Ha Long.',
        descEn: 'Borobudur stone sanctuary, ancient Ayutthaya, and ancient Ha Long karst bays.',
      },
    ],
  },
  {
    id: 'ea',
    nameId: 'Asia Timur',
    nameEn: 'East Asia',
    count: 5,
    taglineId: 'Harmoni Tradisi, Falsafah Kehormatan & Metropolis Masa Depan',
    taglineEn: 'Harmony of Tradition, Code of Honor & Futuristic Metropolis',
    narrativeId:
      'Pusat peradaban aksara Hanzi, etiket penghormatan Konfusianisme, taman Zen yang hening, hingga metropolis paling maju di dunia. Memadukan kemurnian tradisi leluhur dengan lompatan teknologi masa depan.',
    narrativeEn:
      'The heart of Hanzi ideograms, Confucian respect codes, quiet Zen sanctuaries, and the world’s most dynamic technological metropolises.',
    featuredCountryId: 'jp',
    spotlightCountryIds: ['cn', 'kr', 'mn'],
    traits: [
      {
        labelId: 'Etiket Kehormatan',
        labelEn: 'Code of Respect',
        descId: 'Seni membungkuk (Ojigi), pertukaran kartu nama dua tangan (Meishi), dan konsep rasa malu santun.',
        descEn: 'The art of bowing (Ojigi), two-handed card exchange (Meishi), and deep courtesy.',
      },
      {
        labelId: 'Falsafah Zen & Tao',
        labelEn: 'Zen & Tao Philosophy',
        descId: 'Keindahan dalam kesederhanaan (Wabi-Sabi), ruang jeda (Ma), dan siklus empat musim.',
        descEn: 'Beauty in simplicity (Wabi-Sabi), the concept of space (Ma), and seasonal awareness.',
      },
      {
        labelId: 'Ikon Pusaka',
        labelEn: 'Iconic Landmarks',
        descId: 'Puncak salju Gunung Fuji, Tembok Besar Badaling, dan kompleks istana Gyeongbokgung.',
        descEn: 'Snowcapped Mount Fuji, Great Wall of Badaling, and Gyeongbokgung palace grounds.',
      },
    ],
  },
  {
    id: 'sa',
    nameId: 'Asia Selatan',
    nameEn: 'South Asia',
    count: 9,
    taglineId: 'Lembah Peradaban Purba, Falsafah Luhur & Atap Salju Dunia',
    taglineEn: 'Cradle of Ancient Civilizations, Philosophy & Himalayan Peaks',
    narrativeId:
      'Membentang dari benteng salju abadi Himalaya hingga dataran subur Sungai Gangga dan Indus. Tempat lahirnya tradisi filsafat luhur, monumen megah arsitektur batu marmer, dan kekayaan rempah benua.',
    narrativeEn:
      'From eternal snowcapped Himalayan summits to the fertile alluvial plains of the Ganges and Indus. Cradle of ancient philosophy, intricate stone marvels, and continental spice heritage.',
    featuredCountryId: 'in',
    spotlightCountryIds: ['np', 'lk', 'bt', 'pk'],
    traits: [
      {
        labelId: 'Etiket Namaste',
        labelEn: 'Namaste Etiquette',
        descId: 'Menyatukan kedua telapak tangan di dada sebagai lambang pengakuan kesucian jiwa lawan bicara.',
        descEn: 'Palms pressed together at heart center, honoring the sacred light within each other.',
      },
      {
        labelId: 'Falsafah Dharma',
        labelEn: 'Dharma & Ahimsa',
        descId: 'Prinsip tanpa kekerasan (Ahimsa), kebenaran hidup, dan penghormatan pada seluruh makhluk ciptaan.',
        descEn: 'Reverence for all sentient life, non-violence (Ahimsa), and cosmic balance.',
      },
      {
        labelId: 'Monumen Atap Langit',
        labelEn: 'Monuments of the Sky',
        descId: 'Kubah marmer putih Taj Mahal, Stupa mata suci Boudhanath, dan biara tebing Taktsang.',
        descEn: 'White marble Taj Mahal, ancient Boudhanath stupa eyes, and Taktsang cliffside monastery.',
      },
    ],
  },
  {
    id: 'wa',
    nameId: 'Asia Barat & Timur Tengah',
    nameEn: 'West Asia & Middle East',
    count: 18,
    taglineId: 'Jalur Karavan Kuno, Gurun Megah & Gerbang Mesopotamia',
    taglineEn: 'Ancient Caravan Trails, Towering Canyons & Mesopotamian Heritage',
    narrativeId:
      'Titik temu tiga benua dan gerbang peradaban tertua di muka bumi. Membentang dari kota batu mawar Petra, makam cadas megah Hegra AlUla, masjid berpendar ubin pirus, hingga pesisir Mediterania yang memikat.',
    narrativeEn:
      'The crossroads of three continents and the cradle of civilization. From rose-red Petra and carved Hegra tombs to turquoise Persian tile domes and Mediterranean shores.',
    featuredCountryId: 'sa',
    spotlightCountryIds: ['tr', 'jo', 'ye', 'om'],
    traits: [
      {
        labelId: 'Etiket Majlis & Kopi',
        labelEn: 'Majlis & Coffee Hospitality',
        descId: 'Penyambutan tamu dengan kopi Gahwa kapulaga dan kurma segar sebagai kehormatan tertinggi.',
        descEn: 'Cardamom-infused Gahwa coffee and fresh dates served as a sacred sign of honor.',
      },
      {
        labelId: 'Kearifan Pengelana',
        labelEn: 'Desert Caravan Wisdom',
        descId: 'Nilai ketangguhan hidup di padang pasir, kesetiaan pada janji, dan seni geometri fraktal.',
        descEn: 'Endurance across endless dunes, loyalty to word, and intricate sacred fractal geometry.',
      },
      {
        labelId: 'Keajaiban Cadas',
        labelEn: 'Rock-Hewn Wonders',
        descId: 'Makam batu Hegra AlUla, lembah tufa Cappadocia, dan gerbang Al-Khazneh di ngarai Petra.',
        descEn: 'Hegra carved monoliths in AlUla, Cappadocia fairy chimneys, and Petra canyon gates.',
      },
    ],
  },
  {
    id: 'ca',
    nameId: 'Asia Tengah',
    nameEn: 'Central Asia',
    count: 5,
    taglineId: 'Jejak Pengelana Stepa & Kubah Biru Samarkand',
    taglineEn: 'Nomadic Steppes & Turquoise Domes of the Silk Road',
    narrativeId:
      'Jantung rute perdagangan Jalur Sutra legendaris. Negeri para penunggang kuda nomaden di padang rumput tak berujung, diapit oase arsitektur madrasah ubin biru pirus yang berkilau di bawah terik matahari.',
    narrativeEn:
      'The legendary heart of the Silk Road trade route. Realm of nomadic horsemen across boundless steppes, centered around dazzling turquoise-tiled oasis cities and alpine glacial lakes.',
    featuredCountryId: 'uz',
    spotlightCountryIds: ['kz', 'tj', 'kg'],
    traits: [
      {
        labelId: 'Tradisi Choykhona',
        labelEn: 'Choykhona Tea Culture',
        descId: 'Duduk santai di balai teh Choykhona, menyeduh teh hijau di poci porselen, dan membagi roti Non bundar.',
        descEn: 'Gathering at open teahouses, pouring green tea from porcelain pots, and sharing sacred Non bread.',
      },
      {
        labelId: 'Jiwa Pengelana Nomaden',
        labelEn: 'Nomadic Spirit',
        descId: 'Koneksi erat dengan kuda padang stepa, seni mendirikan tenda Yurt, dan kebebasan langit biru.',
        descEn: 'Deep reverence for horses, yurt craftsmanship, and living beneath the eternal open sky.',
      },
      {
        labelId: 'Mahakarya Jalur Sutra',
        labelEn: 'Silk Road Marvels',
        descId: 'Alun-alun madrasah Registan Samarkand, ngarai merah Charyn Canyon, dan danau biru Iskanderkul.',
        descEn: 'Registan madrasah square in Samarkand, Charyn Canyon sandstone, and glacial Lake Iskanderkul.',
      },
    ],
  },
];

export default function RegionExpeditionGallery({
  onSelectCountry,
  onOpenDirectory,
}: RegionExpeditionGalleryProps) {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const [activeSphereId, setActiveSphereId] = useState<string>('sea');

  const activeSphere = REGION_SPHERES.find((s) => s.id === activeSphereId) ?? REGION_SPHERES[0]!;
  const featuredPhoto = getHeroPhoto(activeSphere.featuredCountryId);
  const featuredIso3 = iso3For(activeSphere.featuredCountryId);
  const featuredMeta = featuredIso3 ? COUNTRIES[featuredIso3] : null;

  return (
    <section
      id="kawasan"
      className="region-expedition"
      aria-labelledby="region-expedition-title"
    >
      <div className="region-expedition__container">
        {/* Header Seksi */}
        <div className="region-expedition__header">
          <p className="region-expedition__eyebrow">
            <span className="region-expedition__eyebrow-line" aria-hidden="true" />
            {locale === 'id' ? 'Khazanah 5 Kawasan Benua' : '5 Cultural Spheres of Asia'}
          </p>
          <h2 id="region-expedition-title" className="region-expedition__title">
            {locale === 'id' ? (
              <>
                Jelajahi Karakter, Bentang Alam, & <span className="region-expedition__title-accent">Adat Tiap Wilayah.</span>
              </>
            ) : (
              <>
                Explore the Landscape, Spirit, & <span className="region-expedition__title-accent">Living Traditions.</span>
              </>
            )}
          </h2>
          <p className="region-expedition__lead">
            {locale === 'id'
              ? 'Asia bukan daratan yang seragam. Lima zona budaya unik membentang dari cincin zamrud khatulistiwa hingga kubah pirus Jalur Sutra, masing-masing dengan etiket, falsafah, dan bentang alam ikonik.'
              : 'Asia is not a monolithic continent. Five distinct cultural spheres stretch from equatorial maritime archipelagos to Silk Road turquoise domes, each defined by unique etiquette and timeless landscapes.'}
          </p>
        </div>

        {/* Tab Navigasi 5 Kawasan */}
        <div
          className="region-expedition__tabs"
          role="tablist"
          aria-label={locale === 'id' ? 'Pilih Kawasan Asia' : 'Select Asian Region'}
        >
          {REGION_SPHERES.map((sphere) => {
            const isActive = sphere.id === activeSphereId;
            return (
              <button
                key={sphere.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`region-expedition__tab-btn ${isActive ? 'region-expedition__tab-btn--active' : ''}`}
                onClick={() => {
                  playParchmentClick();
                  setActiveSphereId(sphere.id);
                }}
              >
                <span>{locale === 'id' ? sphere.nameId : sphere.nameEn}</span>
                <span className="region-expedition__tab-count">
                  {sphere.count} {locale === 'id' ? 'Negara' : 'Nations'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Panggung Konten Bento Kawasan Aktif */}
        <div className="region-expedition__stage" key={activeSphere.id}>
          {/* Kolom Kiri: Kartu Landmark Utama (Spotlight Hero) */}
          <article className="region-spotlight">
            <div className="region-spotlight__media-wrap">
              {featuredPhoto && (
                <img
                  src={featuredPhoto.webp[0]?.file || `/images/countries/${activeSphere.featuredCountryId}/${featuredPhoto.slug}-960.webp`}
                  alt={featuredPhoto.alt[locale]}
                  className="region-spotlight__image"
                  style={{ objectPosition: photoObjectPosition(featuredPhoto) }}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div className="region-spotlight__overlay" />
              <div className="region-spotlight__badge">
                <span className="region-spotlight__badge-dot" />
                <span>
                  {locale === 'id' ? 'Landmark Utama' : 'Featured Landmark'} · {featuredMeta?.name || 'Asia'}
                </span>
              </div>
              <div className="region-spotlight__media-caption">
                <h3 className="region-spotlight__country-name">
                  {featuredMeta?.name}
                </h3>
                <p className="region-spotlight__landmark-sub">
                  {featuredPhoto?.alt[locale]}
                </p>
              </div>
            </div>

            <div className="region-spotlight__body">
              <h4 className="region-spotlight__tagline">
                "{locale === 'id' ? activeSphere.taglineId : activeSphere.taglineEn}"
              </h4>
              <p className="region-spotlight__narrative">
                {locale === 'id' ? activeSphere.narrativeId : activeSphere.narrativeEn}
              </p>

              {/* 3 Ciri Khas Budaya Kawasan */}
              <div className="region-spotlight__traits">
                {activeSphere.traits.map((trait, idx) => (
                  <div key={idx} className="region-spotlight__trait-item">
                    <span className="region-spotlight__trait-label">
                      {locale === 'id' ? trait.labelId : trait.labelEn}
                    </span>
                    <p className="region-spotlight__trait-desc">
                      {locale === 'id' ? trait.descId : trait.descEn}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="region-spotlight__action-btn"
                onClick={() => {
                  playParchmentClick();
                  onSelectCountry?.(activeSphere.featuredCountryId);
                  navigate('/negara/' + activeSphere.featuredCountryId);
                }}
              >
                <span>
                  {locale === 'id'
                    ? `Buka Lembar Lapangan: ${featuredMeta?.name}`
                    : `Open Field Profile: ${featuredMeta?.name}`}
                </span>
                <svg
                  className="region-spotlight__action-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </button>
            </div>
          </article>

          {/* Kolom Kanan: Grid 3-4 Negara Ikonik Kawasan */}
          <div className="region-grid">
            {activeSphere.spotlightCountryIds.map((cId) => {
              const photo = getHeroPhoto(cId);
              const iso3 = iso3For(cId);
              const meta = iso3 ? COUNTRIES[iso3] : null;
              if (!meta) return null;

              return (
                <article
                  key={cId}
                  className="region-card"
                  role="button"
                  tabIndex={0}
                  aria-label={`${meta.name} — ${meta.capital}`}
                  onClick={() => {
                    playParchmentClick();
                    onSelectCountry?.(cId);
                    navigate('/negara/' + cId);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      playParchmentClick();
                      onSelectCountry?.(cId);
                      navigate('/negara/' + cId);
                    }
                  }}
                >
                  <div className="region-card__media">
                    {photo && (
                      <img
                        src={photo.webp[0]?.file || `/images/countries/${cId}/${photo.slug}-960.webp`}
                        alt={photo.alt[locale]}
                        className="region-card__image"
                        style={{ objectPosition: photoObjectPosition(photo) }}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="region-card__overlay" />
                    <span className="region-card__code-badge">{cId.toUpperCase()}</span>
                    <div className="region-card__caption">
                      <h4 className="region-card__country-title">{meta.name}</h4>
                      <p className="region-card__capital-sub">{meta.capital}</p>
                    </div>
                  </div>

                  <div className="region-card__body">
                    <p className="region-card__culture-snippet">{meta.culture}</p>
                    <div className="region-card__footer">
                      <span className="region-card__greeting-pill">
                        "{meta.greet.text}" ({meta.greet.latin})
                      </span>
                      <span className="region-card__explore-link">
                        <span>{locale === 'id' ? 'Buka' : 'View'}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {onOpenDirectory ? (
          <div className="region-expedition__directory-cta">
            <p className="region-expedition__directory-prompt">
              {locale === 'id'
                ? `Menampilkan spotlight ${activeSphere.nameId}. Jelajahi seluruh ${activeSphere.count} negara di kawasan ini dan 48 bangsa Asia.`
                : `Showing ${activeSphere.nameEn} spotlight. Explore all ${activeSphere.count} nations in this region and 48 Asian nations.`}
            </p>
            <button
              type="button"
              className="region-expedition__directory-btn"
              onClick={() => {
                playParchmentClick();
                onOpenDirectory();
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
              </svg>
              <span>
                {locale === 'id'
                  ? 'Buka Direktori Lengkap 48 Negara'
                  : 'Open Full 48 Nations Directory'}
              </span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}


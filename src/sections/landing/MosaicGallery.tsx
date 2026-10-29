import { useState } from 'react';
import { Link } from 'react-router-dom';

import imagesData from '@/content/images.json';
import { useI18n } from '@/lib/i18n';
import { countries } from '@/sections/landing/landing-data';

interface ImageFormat {
  w: number;
  file: string;
  w_px: number;
  h_px: number;
}

interface ImageCredit {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  required: boolean;
}

interface ImageItem {
  slug: string;
  role: string;
  width: number;
  height: number;
  focus: { x: number; y: number };
  dominant: string;
  lqip: string;
  avif: ImageFormat[];
  webp: ImageFormat[];
  credit: ImageCredit;
  alt: { id: string; en: string };
}

type ImagesDataMap = {
  countries: Record<string, ImageItem[]>;
};

const typedImages = imagesData as unknown as ImagesDataMap;

function getHeroPhoto(countryId: string): ImageItem | undefined {
  const countryPhotos = typedImages.countries[countryId];
  if (!countryPhotos || countryPhotos.length === 0) return undefined;
  return countryPhotos.find((p) => p.role === 'hero') ?? countryPhotos[0];
}

const FIELD_DISPATCH_METADATA: Record<string, { coords: string; biomeId: string; biomeEn: string; excerptId: string; excerptEn: string }> = {
  id: {
    coords: '06°12′S · 106°49′E',
    biomeId: 'Nusantara Maritim · +8m',
    biomeEn: 'Maritime Archipelago · +8m',
    excerptId: 'Zamrud khatulistiwa dengan belasan ribu pulau dan tradisi musyawarah.',
    excerptEn: 'Equatorial emerald archipelago with thousands of islands and deep communal bonds.',
  },
  sg: {
    coords: '01°17′N · 103°51′E',
    biomeId: 'Selat Malaka · +15m',
    biomeEn: 'Malacca Strait · +15m',
    excerptId: 'Simpang pelabuhan dunia yang menyatukan empat bahasa dan budaya bersantap chope.',
    excerptEn: 'Global port crossroads uniting four tongues and vibrant hawker culture.',
  },
  my: {
    coords: '03°08′N · 101°41′E',
    biomeId: 'Semenanjung Tropis · +60m',
    biomeEn: 'Tropical Peninsula · +60m',
    excerptId: 'Harmoni rumpun Melayu, Tionghoa, dan India di bawah naungan hutan hujan.',
    excerptEn: 'Harmony of Malay, Chinese, and Indian heritages beneath tropical canopies.',
  },
  th: {
    coords: '13°45′N · 100°31′E',
    biomeId: 'Lembah Chao Phraya · +2m',
    biomeEn: 'Chao Phraya Basin · +2m',
    excerptId: 'Negeri seribu pagoda dengan etiket salam wai dan filosofi senyum keramahan.',
    excerptEn: 'Land of golden temples steeped in respectful wai greetings and radiant hospitality.',
  },
  vn: {
    coords: '21°01′N · 105°51′E',
    biomeId: 'Delta Sungai Merah · +12m',
    biomeEn: 'Red River Delta · +12m',
    excerptId: 'Kearifan desa agraris dan budaya cangkir kopi saring di trotoar bersejarah.',
    excerptEn: 'Agrarian river wisdom and cherished street-side drip coffee culture.',
  },
  jp: {
    coords: '35°41′N · 139°41′E',
    biomeId: 'Busur Vulkanik Pasifik · +40m',
    biomeEn: 'Pacific Volcanic Arc · +40m',
    excerptId: 'Keseimbangan hening antara etiket meishi, kedai teh kuno, dan metropolitan modern.',
    excerptEn: 'Serene equilibrium between ancient tea rituals, meishi etiquette, and high-speed rail.',
  },
  cn: {
    coords: '39°54′N · 116°23′E',
    biomeId: 'Dataran Rendah Utara · +43m',
    biomeEn: 'Northern Plains · +43m',
    excerptId: 'Peradaban tertua dunia dengan aksara hanzi yang menautkan ribuan tahun sejarah.',
    excerptEn: 'World cradle civilization with living logographs bridging millennia of memory.',
  },
  kr: {
    coords: '37°33′N · 126°59′E',
    biomeId: 'Semenanjung Berbukit · +38m',
    biomeEn: 'Hilly Peninsula · +38m',
    excerptId: 'Aksara fonetik hangeul yang anggun di tengah dinamika gelombang budaya hallyu.',
    excerptEn: 'Ingenious scientific hangeul script amid dynamic global cultural currents.',
  },
  in: {
    coords: '28°36′N · 77°13′E',
    biomeId: 'Dataran Indo-Gangga · +216m',
    biomeEn: 'Indo-Gangetic Plain · +216m',
    excerptId: 'Sapaan namaste yang memuliakan jiwa di persilangan ratusan dialek dan rempah.',
    excerptEn: 'Revered namaste bows across a kaleidoscope of languages and sacred rivers.',
  },
  pk: {
    coords: '33°41′N · 73°04′E',
    biomeId: 'Lembah Sungai Indus · +540m',
    biomeEn: 'Indus River Basin · +540m',
    excerptId: 'Lembah peradaban Indus purba berpadu seni kaligrafi nasta’liq dan teh chai hangat.',
    excerptEn: 'Ancient Indus valley roots meet flowing nastaliq poetry and welcoming chai stalls.',
  },
  bd: {
    coords: '23°48′N · 90°24′E',
    biomeId: 'Delta Benggala Aluvial · +4m',
    biomeEn: 'Bengal Delta · +4m',
    excerptId: 'Tanah sungai aluvial yang melahirkan gerakan pembela bahasa ibu sedunia.',
    excerptEn: 'Verdant river delta that sparked the global movement for mother language rights.',
  },
  sa: {
    coords: '24°42′N · 46°43′E',
    biomeId: 'Dataran Tinggi Nejd · +612m',
    biomeEn: 'Nejd Plateau · +612m',
    excerptId: 'Keramahan majlis padang pasir dengan seduhan kopi rempah gahwa dan buah kurma.',
    excerptEn: 'Desert majlis hospitality sealed with spiced gahwa coffee and sweet dates.',
  },
  tr: {
    coords: '39°55′N · 32°51′E',
    biomeId: 'Lintas Selat Bosporus · +850m',
    biomeEn: 'Bosporus Crossroads · +850m',
    excerptId: 'Jembatan megah Asia dan Eropa yang dirajut aroma teh çay dan kubah berkilau.',
    excerptEn: 'Grand bridge between Asia and Europe knit by çay glass aromas and ancient domes.',
  },
  ir: {
    coords: '35°41′N · 51°25′E',
    biomeId: 'Kaki Gunung Alborz · +1.189m',
    biomeEn: 'Alborz Foothills · +1,189m',
    excerptId: 'Kemegahan arsitektur ubin safawi dan etiket kesantunan taarof yang puitis.',
    excerptEn: 'Splendid turquoise tiled domes and the intricate, poetic art of taarof civility.',
  },
  uz: {
    coords: '41°18′N · 69°16′E',
    biomeId: 'Oasis Jalur Sutra Kuno · +455m',
    biomeEn: 'Silk Road Oasis · +455m',
    excerptId: 'Ibu kota perniagaan karavan sutra dengan adab sakral roti lepeshka Samarkand.',
    excerptEn: 'Caravan crossroad of blue-tiled minarets and sacred Samarkand bread rituals.',
  },
  kz: {
    coords: '51°10′N · 71°26′E',
    biomeId: 'Steppa Eurasia Luas · +347m',
    biomeEn: 'Vast Eurasian Steppe · +347m',
    excerptId: 'Kebebasan cakrawala steppa luas, tradisi elang pemburu, dan tenda yurt nomaden.',
    excerptEn: 'Boundless grassland horizons, eagle hunting legacy, and welcoming felt yurts.',
  },
};

const REGION_OPTIONS = [
  { id: 'all', labelId: 'Semua Kawasan (15)', labelEn: 'All Regions (15)' },
  { id: 'Asia Tenggara', labelId: 'Asia Tenggara', labelEn: 'Southeast Asia' },
  { id: 'Asia Timur', labelId: 'Asia Timur', labelEn: 'East Asia' },
  { id: 'Asia Selatan', labelId: 'Asia Selatan', labelEn: 'South Asia' },
  { id: 'Asia Barat', labelId: 'Asia Barat', labelEn: 'West Asia' },
  { id: 'Asia Tengah', labelId: 'Asia Tengah', labelEn: 'Central Asia' },
];

export default function MosaicGallery() {
  const { locale, t } = useI18n();
  const [selectedRegion, setSelectedRegion] = useState('all');

  const filteredCountries = selectedRegion === 'all'
    ? countries
    : countries.filter((c) => c.region === selectedRegion);

  return (
    <section
      id="galeri-mosaik"
      className="landing-scene landing-scene--mosaic"
      aria-labelledby="landing-mosaic-heading"
      tabIndex={-1}
    >
      <div className="landing-stage landing-stage--mosaic">
        {/* Section Header */}
        <div className="landing-stage__copy landing-center" data-reveal>
          <p className="landing-kicker">{t('mosaic.kicker')}</p>
          <h2 className="landing-display" id="landing-mosaic-heading">
            {t('mosaic.heading')}
          </h2>
          <p className="landing-note">
            {t('mosaic.note')}
          </p>
        </div>

        {/* Regional Filter Chips */}
        <div
          className="landing-mosaic__filter-bar"
          role="tablist"
          aria-label={locale === 'id' ? 'Filter kawasan foto' : 'Filter photo regions'}
        >
          {REGION_OPTIONS.map((reg) => {
            const isActive = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`landing-mosaic__filter-chip ${isActive ? 'landing-mosaic__filter-chip--active' : ''}`}
                onClick={() => setSelectedRegion(reg.id)}
              >
                {locale === 'id' ? reg.labelId : reg.labelEn}
              </button>
            );
          })}
        </div>

        {/* Asymmetrical Editorial Photo-Journal Grid */}
        <div className="landing-mosaic__grid" data-reveal>
          {filteredCountries.map((country, index) => {
            const photo = getHeroPhoto(country.id);
            const avif960 = photo?.avif.find((a) => a.w === 960) ?? photo?.avif[0];
            const avif1600 = photo?.avif.find((a) => a.w === 1600);
            const avifSrcSet =
              avif1600 && avif960
                ? `${avif960.file} 960w, ${avif1600.file} 1600w`
                : avif960?.file;

            const webp960 = photo?.webp.find((w) => w.w === 960) ?? photo?.webp[0];
            const webp1600 = photo?.webp.find((w) => w.w === 1600);
            const webpSrcSet =
              webp1600 && webp960
                ? `${webp960.file} 960w, ${webp1600.file} 1600w`
                : webp960?.file;

            const fallbackSrc = webp960?.file ?? photo?.avif[0]?.file ?? '';
            const altText =
              (locale === 'en' ? photo?.alt.en : photo?.alt.id) ??
              `Lanskap editorial ${country.nameId}`;

            const meta = FIELD_DISPATCH_METADATA[country.id];
            const coords = meta?.coords ?? '00°00′ · 00°00′';
            const biome = locale === 'id' ? meta?.biomeId : meta?.biomeEn;
            const excerpt = locale === 'id' ? meta?.excerptId : meta?.excerptEn;

            // Staggered column rhythm modifier for true editorial breathing
            const colIndex = index % 3;
            const staggerClass = `landing-mosaic__card--col-${colIndex}`;

            return (
              <Link
                key={country.id}
                to={`/negara/${country.id}`}
                className={`landing-mosaic__card landing-mosaic__card--${country.id} ${staggerClass}`}
                aria-label={`${country.nameId} (${country.nameLocal}) - Kawasan ${country.region} - ${coords}`}
              >
                {/* Media Container with Ken Burns Zoom */}
                <div className="landing-mosaic__media">
                  {fallbackSrc ? (
                    <picture className="landing-mosaic__picture">
                      {avifSrcSet && (
                        <source
                          type="image/avif"
                          srcSet={avifSrcSet}
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        />
                      )}
                      {webpSrcSet && (
                        <source
                          type="image/webp"
                          srcSet={webpSrcSet}
                          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                        />
                      )}
                      <img
                        src={fallbackSrc}
                        alt={altText}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="landing-mosaic__img"
                      />
                    </picture>
                  ) : null}
                  <div className="landing-mosaic__scrim" aria-hidden="true" />
                </div>

                {/* Archival Field Dispatch Overlay */}
                <div className="landing-mosaic__content">
                  {/* Top Bar: GPS Datum, Region & Status */}
                  <div className="landing-mosaic__badge-row">
                    <div className="landing-mosaic__datum-pill">
                      <span className="landing-mosaic__pin-icon">✦</span>
                      <span className="landing-mosaic__coords">{coords}</span>
                    </div>
                    <span className="landing-mosaic__region">{country.region}</span>
                  </div>

                  {/* Middle / Bottom: Editorial Excerpt & Typography */}
                  <div className="landing-mosaic__footer-content">
                    {biome ? (
                      <p className="landing-mosaic__biome">{biome}</p>
                    ) : null}

                    {excerpt ? (
                      <p className="landing-mosaic__excerpt">&ldquo;{excerpt}&rdquo;</p>
                    ) : null}

                    <div className="landing-mosaic__titles">
                      <p className="landing-mosaic__native">{country.nameLocal}</p>
                      <h3 className="landing-mosaic__name">
                        <span>{country.nameId}</span>
                        <span className="landing-mosaic__arrow" aria-hidden="true">
                          &rarr;
                        </span>
                      </h3>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="landing-mosaic__legal" data-reveal>
          {t('mosaic.legal')}
        </p>
      </div>
    </section>
  );
}

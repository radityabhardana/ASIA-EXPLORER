import { Link } from 'react-router-dom';

import imagesData from '@/content/images.json';
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

export default function MosaicGallery() {
  return (
    <section
      id="galeri-mosaik"
      className="landing-scene landing-scene--mosaic"
      aria-labelledby="landing-mosaic-heading"
      tabIndex={-1}
    >
      <div className="landing-stage landing-stage--mosaic">
        <div className="landing-stage__copy landing-center" data-reveal>
          <p className="landing-kicker">PILIHAN NEGARA</p>
          <h2 className="landing-display" id="landing-mosaic-heading">
            15 Negara, Satu Benua
          </h2>
          <p className="landing-note">
            Pilih negara untuk menjelajahi cerita, etiket, dan aksara.
          </p>
        </div>

        <div className="landing-mosaic__grid" data-reveal>
          {countries.map((country, index) => {
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
            const altText = photo?.alt.id ?? `Lanskap editorial ${country.nameId}`;

            return (
              <Link
                key={country.id}
                to={`/negara/${country.id}`}
                className={`landing-mosaic__card landing-mosaic__card--${country.id}`}
                aria-label={`${country.nameId} (${country.nameLocal}) - Kawasan ${country.region}`}
              >
                <div
                  className="landing-mosaic__media"
                  style={{ backgroundColor: photo?.dominant ?? '#26221e' }}
                >
                  {fallbackSrc ? (
                    <picture>
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

                <div className="landing-mosaic__content">
                  <div className="landing-mosaic__badge-row">
                    <span className="landing-mosaic__region">{country.region}</span>
                    <span className="landing-mosaic__depth">{country.depth}</span>
                  </div>
                  <div className="landing-mosaic__titles">
                    <p className="landing-mosaic__native">{country.nameLocal}</p>
                    <h3 className="landing-mosaic__name">
                      <span>{country.nameId}</span>
                      <span className="landing-mosaic__arrow" aria-hidden="true">
                        &rarr;
                      </span>
                    </h3>
                    <p className="landing-mosaic__greeting">
                      {country.greeting.native} &middot; {country.language.nameId}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="landing-mosaic__legal" data-reveal>
          Foto kurasi dokumentasi Wikimedia Commons berlisensi terbuka (CC BY-SA / CC0).
        </p>
      </div>
    </section>
  );
}

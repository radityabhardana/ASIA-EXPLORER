import imagesData from '@/content/images.json';

export interface ImageFormat {
  w: number;
  file: string;
  w_px: number;
  h_px: number;
}

export interface ImageCredit {
  author: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  required: boolean;
}

export interface ImageItem {
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

export function getCountryPhotos(countryId: string): ImageItem[] {
  const countryPhotos = typedImages.countries[countryId];
  if (!countryPhotos || countryPhotos.length === 0) return [];
  return countryPhotos.filter((p) => p.role !== 'hero');
}

function roleLabel(role: string): string {
  switch (role) {
    case 'life':
      return 'Keseharian & Budaya';
    case 'food':
      return 'Kuliner Tradisional';
    case 'script':
      return 'Aksara & Seni Visual';
    default:
      return 'Dokumentasi Visual';
  }
}

type CountryGalleryProps = {
  countryId: string;
  countryName: string;
};

export default function CountryGallery({ countryId, countryName }: CountryGalleryProps) {
  const photos = getCountryPhotos(countryId);

  if (photos.length === 0) {
    return null;
  }

  return (
    <section className="country-block country-gallery" aria-labelledby="country-gallery-title">
      <div className="country-block__inner">
        <div className="country-gallery__header">
          <p className="country-gallery__kicker">DOKUMENTASI VISUAL</p>
          <h2 id="country-gallery-title" className="country-gallery__title">
            Lensa Budaya & Kehidupan
          </h2>
          <p className="country-gallery__lead">
            Keseharian, kuliner, dan bentang budaya {countryName}.
          </p>
        </div>

        <div className="country-gallery__grid">
          {photos.map((photo) => {
            const avif640 = photo.avif.find((a) => a.w === 640) ?? photo.avif[0];
            const avif960 = photo.avif.find((a) => a.w === 960) ?? photo.avif[photo.avif.length - 1];
            const webp640 = photo.webp.find((w) => w.w === 640) ?? photo.webp[0];
            const webp960 = photo.webp.find((w) => w.w === 960) ?? photo.webp[photo.webp.length - 1];

            const avifSrcSet =
              avif640 && avif960 && avif640.file !== avif960.file
                ? `${avif640.file} 640w, ${avif960.file} 960w`
                : (avif960?.file ?? avif640?.file ?? '');

            const webpSrcSet =
              webp640 && webp960 && webp640.file !== webp960.file
                ? `${webp640.file} 640w, ${webp960.file} 960w`
                : (webp960?.file ?? webp640?.file ?? '');

            const fallbackImg = webp960?.file ?? webp640?.file ?? photo.webp[0]?.file ?? '';

            return (
              <figure
                key={photo.slug}
                className={`country-gallery__card country-gallery__card--${photo.role}`}
              >
                <div className="country-gallery__frame">
                  <picture className="country-gallery__picture">
                    {avifSrcSet && (
                      <source
                        type="image/avif"
                        srcSet={avifSrcSet}
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
                      />
                    )}
                    {webpSrcSet && (
                      <source
                        type="image/webp"
                        srcSet={webpSrcSet}
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 400px"
                      />
                    )}
                    <img
                      src={fallbackImg}
                      alt={photo.alt.id}
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      decoding="async"
                      className="country-gallery__img"
                      style={{
                        objectPosition: `${photo.focus.x * 100}% ${photo.focus.y * 100}%`,
                      }}
                    />
                  </picture>
                  <span className="country-gallery__tag">{roleLabel(photo.role)}</span>
                </div>
                <figcaption className="country-gallery__caption">
                  <p className="country-gallery__caption-text">{photo.alt.id}</p>
                  <p className="country-gallery__credit">
                    Foto: {photo.credit.author} ·{' '}
                    <a
                      href={photo.credit.licenseUrl || photo.credit.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="country-gallery__license-link"
                    >
                      {photo.credit.license}
                    </a>
                  </p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

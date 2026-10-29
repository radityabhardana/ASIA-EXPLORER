import imagesData from '@/content/images.json';

/**
 * Satu sumber tipe foto editorial untuk landing. `images.json` dihasilkan
 * `tools/fetch-images.mjs`; komponen tidak boleh menebak bentuk berkasnya.
 */
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

export interface CountryPhoto {
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
  countries: Record<string, CountryPhoto[]>;
};

const typedImages = imagesData as unknown as ImagesDataMap;

export function getHeroPhoto(countryId: string): CountryPhoto | undefined {
  const countryPhotos = typedImages.countries[countryId];
  if (!countryPhotos || countryPhotos.length === 0) {
    return undefined;
  }
  return countryPhotos.find((photo) => photo.role === 'hero') ?? countryPhotos[0];
}

export function photoObjectPosition(photo: CountryPhoto): string {
  return `${Math.round(photo.focus.x * 100)}% ${Math.round(photo.focus.y * 100)}%`;
}

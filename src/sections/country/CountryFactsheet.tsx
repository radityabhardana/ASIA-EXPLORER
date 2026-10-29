import type { Country } from '@/content/countries';
import { COUNTRIES, iso3For } from '@/content/countries48';
import {
  COUNTRY_COORDINATES,
  formatDMS,
  formatDistanceKm,
  haversineDistanceKm,
} from '@/lib/geo-coords';
import type { Locale } from '@/lib/i18n';

interface CountryFactsheetProps {
  country: Country;
  locale?: Locale;
}

const TIMEZONE_MAP: Record<string, { id: string; en: string }> = {
  id: { id: 'UTC+7 s/d UTC+9 (WIB, WITA, WIT)', en: 'UTC+7 to UTC+9 (WIB, WITA, WIT)' },
  my: { id: 'UTC+8 (MYT · Semenanjung & Sabah-Sarawak)', en: 'UTC+8 (MYT · Peninsular & Borneo)' },
  sg: { id: 'UTC+8 (SGT · Waktu Standar Singapura)', en: 'UTC+8 (SGT · Singapore Standard Time)' },
  th: { id: 'UTC+7 (ICT · Waktu Indochina)', en: 'UTC+7 (ICT · Indochina Time)' },
  vn: { id: 'UTC+7 (ICT · Waktu Indochina)', en: 'UTC+7 (ICT · Indochina Time)' },
  ph: { id: 'UTC+8 (PHT · Waktu Standar Filipina)', en: 'UTC+8 (PHT · Philippine Standard Time)' },
  cn: { id: 'UTC+8 (CST · Waktu Standar Beijing)', en: 'UTC+8 (CST · China Standard Time)' },
  jp: { id: 'UTC+9 (JST · Waktu Standar Jepang)', en: 'UTC+9 (JST · Japan Standard Time)' },
  kr: { id: 'UTC+9 (KST · Waktu Standar Korea)', en: 'UTC+9 (KST · Korea Standard Time)' },
  kp: { id: 'UTC+9 (KST · Waktu Pyongyang)', en: 'UTC+9 (KST · Pyongyang Time)' },
  in: { id: 'UTC+5:30 (IST · Waktu Standar India)', en: 'UTC+5:30 (IST · Indian Standard Time)' },
  sa: { id: 'UTC+3 (AST · Waktu Standar Arab)', en: 'UTC+3 (AST · Arabia Standard Time)' },
  tr: { id: 'UTC+3 (TRT · Waktu Standar Turki)', en: 'UTC+3 (TRT · Turkey Time)' },
  kz: { id: 'UTC+5 (KZT · Waktu Kazakhstan)', en: 'UTC+5 (KZT · Kazakhstan Time)' },
  uz: { id: 'UTC+5 (UZT · Waktu Uzbekistan)', en: 'UTC+5 (UZT · Uzbekistan Time)' },
  mn: { id: 'UTC+8 (ULAT · Waktu Ulaanbaatar)', en: 'UTC+8 (ULAT · Ulaanbaatar Time)' },
  bd: { id: 'UTC+6 (BST · Waktu Standar Bangladesh)', en: 'UTC+6 (BST · Bangladesh Standard Time)' },
  lk: { id: 'UTC+5:30 (SLST · Waktu Sri Lanka)', en: 'UTC+5:30 (SLST · Sri Lanka Time)' },
  np: { id: 'UTC+5:45 (NPT · Waktu Nepal)', en: 'UTC+5:45 (NPT · Nepal Time)' },
  bt: { id: 'UTC+6 (BTT · Waktu Bhutan)', en: 'UTC+6 (BTT · Bhutan Time)' },
  mm: { id: 'UTC+6:30 (MMT · Waktu Myanmar)', en: 'UTC+6:30 (MMT · Myanmar Time)' },
  kh: { id: 'UTC+7 (ICT · Waktu Indochina)', en: 'UTC+7 (ICT · Indochina Time)' },
  la: { id: 'UTC+7 (ICT · Waktu Indochina)', en: 'UTC+7 (ICT · Indochina Time)' },
  tl: { id: 'UTC+9 (TLT · Waktu Timor-Leste)', en: 'UTC+9 (TLT · Timor-Leste Time)' },
  bn: { id: 'UTC+8 (BNT · Waktu Brunei)', en: 'UTC+8 (BNT · Brunei Time)' },
  pk: { id: 'UTC+5 (PKT · Waktu Standar Pakistan)', en: 'UTC+5 (PKT · Pakistan Standard Time)' },
  af: { id: 'UTC+4:30 (AFT · Waktu Afganistan)', en: 'UTC+4:30 (AFT · Afghanistan Time)' },
  ir: { id: 'UTC+3:30 (IRST · Waktu Iran)', en: 'UTC+3:30 (IRST · Iran Standard Time)' },
  iq: { id: 'UTC+3 (AST · Waktu Irak)', en: 'UTC+3 (AST · Iraq Time)' },
  sy: { id: 'UTC+3 (AST · Waktu Suriah)', en: 'UTC+3 (AST · Syria Time)' },
  jo: { id: 'UTC+3 (AST · Waktu Yordania)', en: 'UTC+3 (AST · Jordan Time)' },
  lb: { id: 'UTC+2 / UTC+3 (EET/EEST · Lebanon)', en: 'UTC+2 / UTC+3 (EET/EEST · Lebanon Time)' },
  il: { id: 'UTC+2 / UTC+3 (IST/IDT · Israel)', en: 'UTC+2 / UTC+3 (IST/IDT · Israel Time)' },
  ps: { id: 'UTC+2 / UTC+3 (EET/EEST · Palestina)', en: 'UTC+2 / UTC+3 (EET/EEST · Palestine Time)' },
  ae: { id: 'UTC+4 (GST · Waktu Teluk)', en: 'UTC+4 (GST · Gulf Standard Time)' },
  om: { id: 'UTC+4 (GST · Waktu Teluk)', en: 'UTC+4 (GST · Gulf Standard Time)' },
  qa: { id: 'UTC+3 (AST · Waktu Qatar)', en: 'UTC+3 (AST · Arabia Standard Time)' },
  bh: { id: 'UTC+3 (AST · Waktu Bahrain)', en: 'UTC+3 (AST · Arabia Standard Time)' },
  kw: { id: 'UTC+3 (AST · Waktu Kuwait)', en: 'UTC+3 (AST · Arabia Standard Time)' },
  ye: { id: 'UTC+3 (AST · Waktu Yaman)', en: 'UTC+3 (AST · Yemen Time)' },
  ge: { id: 'UTC+4 (GET · Waktu Georgia)', en: 'UTC+4 (GET · Georgia Time)' },
  am: { id: 'UTC+4 (AMT · Waktu Armenia)', en: 'UTC+4 (AMT · Armenia Time)' },
  az: { id: 'UTC+4 (AZT · Waktu Azerbaijan)', en: 'UTC+4 (AZT · Azerbaijan Time)' },
  kg: { id: 'UTC+6 (KGT · Waktu Kirgizstan)', en: 'UTC+6 (KGT · Kyrgyzstan Time)' },
  tj: { id: 'UTC+5 (TJT · Waktu Tajikistan)', en: 'UTC+5 (TJT · Tajikistan Time)' },
  tm: { id: 'UTC+5 (TMT · Waktu Turkmenistan)', en: 'UTC+5 (TMT · Turkmenistan Time)' },
  cy: { id: 'UTC+2 / UTC+3 (EET/EEST · Siprus)', en: 'UTC+2 / UTC+3 (EET/EEST · Cyprus Time)' },
  mv: { id: 'UTC+5 (MVT · Waktu Maladewa)', en: 'UTC+5 (MVT · Maldives Time)' },
};

const DEMOGRAPHY_MAP: Record<string, { id: string; en: string }> = {
  id: { id: '~278 Juta Jiwa · 17.000+ Pulau Khatulistiwa', en: '~278 Million · 17,000+ Equatorial Islands' },
  my: { id: '~34 Juta Jiwa · Semenanjung & Borneo Utara', en: '~34 Million · Peninsular & North Borneo' },
  sg: { id: '~5,9 Juta Jiwa · Titik Temu Maritim & Finansial', en: '~5.9 Million · Global Maritime & Financial Hub' },
  th: { id: '~71 Juta Jiwa · Lembah Chao Phraya & Teluk Siam', en: '~71 Million · Chao Phraya Valley & Gulf of Siam' },
  vn: { id: '~100 Juta Jiwa · Delta Sungai Merah & Mekong', en: '~100 Million · Red River & Mekong Deltas' },
  ph: { id: '~115 Juta Jiwa · 7.641 Kepulauan Samudra Pasifik', en: '~115 Million · 7,641 Pacific Ocean Islands' },
  cn: { id: '~1,41 Miliar Jiwa · Cekungan Sungai Kuning & Yangtze', en: '~1.41 Billion · Yellow & Yangtze River Basins' },
  jp: { id: '~124 Juta Jiwa · Busur Kepulauan Vulkanik Honshu', en: '~124 Million · Honshu Volcanic Island Arc' },
  kr: { id: '~51 Juta Jiwa · Semenanjung Selatan & Lembah Han', en: '~51 Million · Southern Peninsula & Han Valley' },
  in: { id: '~1,43 Miliar Jiwa · Dataran Gangga & Plato Dekkan', en: '~1.43 Billion · Gangetic Plain & Deccan Plateau' },
  sa: { id: '~36 Juta Jiwa · Semenanjung Arab & Gurun Najd', en: '~36 Million · Arabian Peninsula & Najd Desert' },
  tr: { id: '~85 Juta Jiwa · Jembatan Anatolia & Selat Bosphorus', en: '~85 Million · Anatolian Bridge & Bosphorus Strait' },
  kz: { id: '~20 Juta Jiwa · Stepa Terluas & Pegunungan Tian Shan', en: '~20 Million · Vast Steppe & Tian Shan Range' },
  uz: { id: '~36 Juta Jiwa · Jalur Sutra Fergana & Samarkand', en: '~36 Million · Silk Road Fergana & Samarkand' },
  mn: { id: '~3,4 Juta Jiwa · Stepa Altaik & Gurun Gobi', en: '~3.4 Million · Altai Steppe & Gobi Desert' },
};

export default function CountryFactsheet({ country, locale = 'id' }: CountryFactsheetProps) {
  const iso3 = (country.iso3 || iso3For(country.id) || country.id).toUpperCase();
  const c48 = COUNTRIES[iso3];
  const coords = COUNTRY_COORDINATES[iso3];
  const capital = c48?.capital || '-';

  const timezone =
    TIMEZONE_MAP[country.id.toLowerCase()]?.[locale] ??
    (coords
      ? `UTC${coords.lon >= 0 ? '+' : ''}${Math.round(coords.lon / 15)} (Geodetik)`
      : 'UTC+7 s/d UTC+9');

  const demography =
    DEMOGRAPHY_MAP[country.id.toLowerCase()]?.[locale] ??
    (locale === 'id'
      ? `${country.depth === 'Lengkap' ? 'Dokumentasi Lengkap' : 'Penjelajahan Lapangan'} · ${country.region}`
      : `${country.depth === 'Lengkap' ? 'Comprehensive Dossier' : 'Field Exploration'} · ${country.region}`);

  const distFromJakarta =
    coords && country.id !== 'id'
      ? haversineDistanceKm(-6.2088, 106.8456, coords.lat, coords.lon)
      : null;

  return (
    <section
      className="country-block country-factsheet"
      aria-labelledby="country-factsheet-title"
    >
      <div className="country-block__inner country-factsheet__inner">
        <header className="country-factsheet__header">
          <div className="country-factsheet__kicker-wrap">
            <span className="country-factsheet__mark" aria-hidden="true" />
            <p className="country-factsheet__kicker">
              {locale === 'id' ? 'LEMBAR FAKTA LAPANGAN' : 'FIELD DOSSIER FACTSHEET'}
            </p>
          </div>
          <h2 id="country-factsheet-title" className="country-factsheet__title">
            {locale === 'id' ? 'Kompilasi Geodetik & Wilayah' : 'Geodetic & Regional Dossier'}
          </h2>
          <p className="country-factsheet__subtitle">
            {locale === 'id'
              ? 'Arsip ringkas koordinat, pusat administrasi, zona meridian, dan karakteristik demografi bangsa.'
              : 'Concise archive of coordinates, administrative center, meridian zones, and demographic characteristics.'}
          </p>
        </header>

        <dl className="country-factsheet__grid">
          {/* 1. Ibu Kota */}
          <div className="country-factsheet__cell">
            <dt className="country-factsheet__label">
              {locale === 'id' ? 'Ibu Kota Negara' : 'Capital City'}
            </dt>
            <dd className="country-factsheet__value country-factsheet__value--accent">
              {capital}
            </dd>
          </div>

          {/* 2. Koordinat Geodetik */}
          <div className="country-factsheet__cell">
            <dt className="country-factsheet__label">
              {locale === 'id' ? 'Koordinat Geodetik (DMS)' : 'Geodetic Coordinates (DMS)'}
            </dt>
            <dd className="country-factsheet__value country-factsheet__value--mono">
              {coords ? formatDMS(coords.lat, coords.lon) : '—'}
            </dd>
          </div>

          {/* 3. Kawasan Regional */}
          <div className="country-factsheet__cell">
            <dt className="country-factsheet__label">
              {locale === 'id' ? 'Kawasan Regional' : 'Geographic Region'}
            </dt>
            <dd className="country-factsheet__value">{country.region}</dd>
          </div>

          {/* 4. Zona Waktu */}
          <div className="country-factsheet__cell">
            <dt className="country-factsheet__label">
              {locale === 'id' ? 'Zona Waktu Meridian' : 'Standard Time Zone'}
            </dt>
            <dd className="country-factsheet__value country-factsheet__value--mono">{timezone}</dd>
          </div>

          {/* 5. Bahasa & Aksara */}
          <div className="country-factsheet__cell">
            <dt className="country-factsheet__label">
              {locale === 'id' ? 'Bahasa & Aksara' : 'Language & Script'}
            </dt>
            <dd className="country-factsheet__value">
              {country.language.nameId} · {country.language.script}
            </dd>
          </div>

          {/* 6. Demografi & Geografi */}
          <div className="country-factsheet__cell">
            <dt className="country-factsheet__label">
              {locale === 'id' ? 'Demografi & Karakter Wilayah' : 'Demographics & Geography'}
            </dt>
            <dd className="country-factsheet__value">{demography}</dd>
          </div>

          {/* 7. Vektor Jarak (jika bukan Indonesia) */}
          {distFromJakarta !== null && (
            <div className="country-factsheet__cell country-factsheet__cell--full">
              <dt className="country-factsheet__label">
                {locale === 'id' ? 'Jarak Geodetik dari Jakarta' : 'Geodetic Distance from Jakarta'}
              </dt>
              <dd className="country-factsheet__value country-factsheet__value--dist">
                {formatDistanceKm(distFromJakarta, locale)} ({Math.round(distFromJakarta).toLocaleString('id-ID')} km)
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

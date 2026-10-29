import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useI18n } from '@/lib/i18n';
import '@/styles/etiquette-guide.css';

interface EtiquetteFieldGuideProps {
  onSelectCountry?: (id: string) => void;
}

interface EtiquetteItem {
  id: string;
  category: 'greetings' | 'dining' | 'hospitality' | 'gestures';
  regionId: string;
  regionLabel: string;
  countryId: string;
  countryName: string;
  titleId: string;
  titleEn: string;
  doTextId: string;
  doTextEn: string;
  dontTextId: string;
  dontTextEn: string;
  philosophyId: string;
  philosophyEn: string;
}

const ETIQUETTE_DATA: EtiquetteItem[] = [
  // 1. Greetings (Menyapa)
  {
    id: 'jp-bow',
    category: 'greetings',
    regionId: 'ea',
    regionLabel: 'Asia Timur',
    countryId: 'jp',
    countryName: 'Jepang',
    titleId: 'Seni Membungkuk (Ojigi)',
    titleEn: 'The Art of Bowing (Ojigi)',
    doTextId: 'Bungkukkan badan 15° untuk sapaan kasual (Eshaku), 30° untuk rekan kerja (Keirei), dan 45° untuk kehormatan tinggi (Saikeirei).',
    doTextEn: 'Bow 15° for casual greetings (Eshaku), 30° for formal peers (Keirei), and 45° for deepest respect (Saikeirei).',
    dontTextId: 'Jangan melakukan kontak mata langsung saat membungkuk dan jangan menyilangkan tangan di saku.',
    dontTextEn: 'Never maintain direct eye contact while bowing, and keep hands neatly at sides.',
    philosophyId: 'Menundukkan kepala adalah simbol kepasrahan damai dan pengakuan kerendahan hati di hadapan lawan bicara.',
    philosophyEn: 'Lowering the head represents peace, humility, and acknowledging the honor of the counterpart.',
  },
  {
    id: 'th-wai',
    category: 'greetings',
    regionId: 'sea',
    regionLabel: 'Asia Tenggara',
    countryId: 'th',
    countryName: 'Thailand',
    titleId: 'Gestur Hormat Wai',
    titleEn: 'The Respectful Wai',
    doTextId: 'Rapatkan kedua telapak tangan di dada sambil sedikit menundukkan kepala. Semakin tinggi ujung ibu jari (hingga hidung), semakin tinggi rasa hormat.',
    doTextEn: 'Press palms together at chest level with a gentle bow. The higher your thumbs rest, the higher the honor shown.',
    dontTextId: 'Jangan memberikan wai kepada anak-anak, pedagang kaki lima, atau pelayan jasa sebagai inisiator.',
    dontTextEn: 'Do not initiate a wai to children or service workers; acknowledge with a kind nod instead.',
    philosophyId: 'Berasal dari konsep Anjali Mudra kuno, melambangkan ketiadaan senjata di tangan dan pemurnian niat hati.',
    philosophyEn: 'Rooted in the ancient Anjali Mudra, demonstrating unarmed hands and purity of intention.',
  },
  {
    id: 'in-namaste',
    category: 'greetings',
    regionId: 'sa',
    regionLabel: 'Asia Selatan',
    countryId: 'in',
    countryName: 'India',
    titleId: 'Salam Suci Namaste',
    titleEn: 'Sacred Namaste Greeting',
    doTextId: 'Satukan kedua telapak tangan di depan cakra jantung sambil mengucapkan "Namaste" atau "Namaskar" dengan senyum hangat.',
    doTextEn: 'Join palms together at the heart chakra while softly uttering "Namaste" with a warm, genuine smile.',
    dontTextId: 'Hindari bersalaman terlalu erat dengan wanita tradisional kecuali mereka yang terlebih dahulu mengulurkan tangan.',
    dontTextEn: 'Avoid firm handshakes with traditional elders or women unless they extend their hand first.',
    philosophyId: 'Jiwa suci dalam diriku menghormati dan mengenali percikan cahaya suci dalam dirimu.',
    philosophyEn: 'The divine spirit within me bows to and recognizes the divine light within you.',
  },

  // 2. Dining (Meja Makan)
  {
    id: 'cn-chopsticks',
    category: 'dining',
    regionId: 'ea',
    regionLabel: 'Asia Timur',
    countryId: 'cn',
    countryName: 'Tiongkok',
    titleId: 'Pantangan Sumpit Tegak (Tsukitate-bashi)',
    titleEn: 'The Upright Chopstick Taboo',
    doTextId: 'Letakkan sumpit mendatar di atas tatakan keramik (Hashioki) atau di samping piring mangkuk saat sedang jeda mengunyah.',
    doTextEn: 'Rest chopsticks horizontally on ceramic rests or beside the dish during pauses.',
    dontTextId: 'JANGAN PERNAH menancapkan sepasang sumpit tegak berdiri di atas semangkuk nasi putih.',
    dontTextEn: 'NEVER stick chopsticks vertically into a bowl of white rice under any circumstance.',
    philosophyId: 'Sumpit tegak menyerupai dupa pembakaran dupa di pemakaman altar leluhur, dianggap membawa pertanda kematian.',
    philosophyEn: 'Vertical chopsticks resemble funeral incense bowls, carrying bad omens of mourning and death.',
  },
  {
    id: 'id-righthand',
    category: 'dining',
    regionId: 'sea',
    regionLabel: 'Asia Tenggara',
    countryId: 'id',
    countryName: 'Indonesia',
    titleId: 'Kemuliaan Tangan Kanan',
    titleEn: 'Sanctity of the Right Hand',
    doTextId: 'Gunakan tangan kanan untuk menyantap makanan, menyerahkan piring lauk, atau menuangkan air minum kepada sesama.',
    doTextEn: 'Always use your right hand for dining, passing communal platters, or pouring tea for others.',
    dontTextId: 'Jangan menyentuh makanan bersama atau menyerahkan uang/barang memakai tangan kiri.',
    dontTextEn: 'Never touch shared dishes or pass items using the left hand.',
    philosophyId: 'Dalam kosmologi Nusantara dan Timur Tengah, tangan kanan dikhususkan untuk kesucian, sedangkan tangan kiri untuk sanitasi tubuh.',
    philosophyEn: 'In archipelago and Middle Eastern traditions, the right hand is reserved for purity and nourishment.',
  },
  {
    id: 'sa-coffee',
    category: 'dining',
    regionId: 'wa',
    regionLabel: 'Asia Barat',
    countryId: 'sa',
    countryName: 'Arab Saudi',
    titleId: 'Goyang Cangkir Kopi Gahwa',
    titleEn: 'The Gahwa Cup Shake Signal',
    doTextId: 'Terima cangkir Finjan kecil dengan tangan kanan, seruput pelan bersama kurma, dan nikmati jamuan keramahan tuan rumah.',
    doTextEn: 'Receive the Finjan cup with your right hand, sip slowly with fresh dates, and savor hospitality.',
    dontTextId: 'Jangan meletakkan cangkir kosong tanpa menggoyangkannya ke kiri-kanan bila Anda sudah merasa kenyang.',
    dontTextEn: 'Do not set down the empty cup without a gentle wrist shake if you do not desire a refill.',
    philosophyId: 'Menggoyangkan cangkir adalah isyarat visual tanpa suara agar tidak memotong pembicaraan hangat di ruang Majlis.',
    philosophyEn: 'The silent wrist shake communicates satiety politely without interrupting spoken conversations.',
  },

  // 3. Hospitality (Bertamu & Alas Kaki)
  {
    id: 'kr-shoes',
    category: 'hospitality',
    regionId: 'ea',
    regionLabel: 'Asia Timur',
    countryId: 'kr',
    countryName: 'Korea Selatan',
    titleId: 'Etiket Membuka Alas Kaki',
    titleEn: 'Footwear & Ondol Threshold',
    doTextId: 'Lepaskan sepatu di area batas pintu masuk (Genkan/Hyeon-gwan) dan putar arah ujung sepatu menghadap ke pintu luar.',
    doTextEn: 'Slip off shoes at the entryway vestibule and point shoe tips facing outward toward the door.',
    dontTextId: 'Jangan melangkahi lantai kayu rumah dengan kaus kaki kotor atau telanjang kaki yang basah.',
    dontTextEn: 'Never step onto heated ondol floors with dirty socks or wet bare feet.',
    philosophyId: 'Lantai adalah tempat beristirahat, bersantap, dan tidur; menjaga kebersihannya adalah wujud memuliakan rumah tuan rumah.',
    philosophyEn: 'Floors are sacred living spaces for dining and sleeping; pristine cleanliness honors the household.',
  },
  {
    id: 'uz-bread',
    category: 'hospitality',
    regionId: 'ca',
    regionLabel: 'Asia Tengah',
    countryId: 'uz',
    countryName: 'Uzbekistan',
    titleId: 'Kesakralan Roti Non',
    titleEn: 'Sacred Bread Non Tradition',
    doTextId: 'Patahkan roti Non dengan kedua belah tangan menjadi bagian-bagian santap untuk dibagikan ke sekeliling meja Dastarkhan.',
    doTextEn: 'Break the ornate round Non bread using both hands and share pieces around the Dastarkhan table.',
    dontTextId: 'Jangan pernah memotong roti Non dengan pisau dan pantang meletakkannya dalam posisi terbalik di meja.',
    dontTextEn: 'Never slice Non with a knife or place it upside down on the dining cloth.',
    philosophyId: 'Roti Non adalah simbol anugerah kehidupan surgawi; memperlakukannya terbalik dianggap mencabut berkah rezeki.',
    philosophyEn: 'Bread is a heavenly gift of life; placing it inverted is believed to disrespect cosmic abundance.',
  },
  {
    id: 'np-threshold',
    category: 'hospitality',
    regionId: 'sa',
    regionLabel: 'Asia Selatan',
    countryId: 'np',
    countryName: 'Nepal',
    titleId: 'Pantangan Menginjak Ambang Pintu',
    titleEn: 'Do Not Step on the Door Sill',
    doTextId: 'Langkahi balok kayu ambang pintu dengan hati-hati saat memasuki rumah adat, kuil Newar, atau biara stupa.',
    doTextEn: 'Carefully step OVER the raised wooden door threshold when entering homes and Newar shrines.',
    dontTextId: 'Jangan sekali-kali menginjak kayu ambang pintu karena dianggap menghina penjaga rumah spiritual.',
    dontTextEn: 'Never place your foot directly onto the wooden threshold beam.',
    philosophyId: 'Ambang pintu dipercaya sebagai tempat bersemayamnya dewa pelindung rumah tangga yang menjaga dari roh jahat.',
    philosophyEn: 'The door threshold is considered the dwelling boundary of household guardian spirits.',
  },

  // 4. Gestures (Gestur Santun & Tabu)
  {
    id: 'la-head',
    category: 'gestures',
    regionId: 'sea',
    regionLabel: 'Asia Tenggara',
    countryId: 'la',
    countryName: 'Laos',
    titleId: 'Kesucian Kepala & Posisi Kaki',
    titleEn: 'Sacred Head & Foot Humility',
    doTextId: 'Duduklah dengan posisi kaki bersila atau melipat ke belakang saat berada di hadapan biksu atau orang tua.',
    doTextEn: 'Tuck your legs beneath you or sit cross-legged with feet discreetly pointing backward.',
    dontTextId: 'Jangan menyentuh bagian kepala siapa pun (termasuk anak-anak) dan jangan menunjuk objek/patung dengan telapak kaki.',
    dontTextEn: 'Never touch anyone’s head, and never point the soles of your feet toward people or Buddha statues.',
    philosophyId: 'Kepala adalah mahkota paling suci tempat bersemayamnya jiwa, sementara telapak kaki adalah bagian paling duniawi.',
    philosophyEn: 'The head is the highest spiritual vessel, while the soles of feet represent the lowest worldly plane.',
  },
  {
    id: 'jp-meishi',
    category: 'gestures',
    regionId: 'ea',
    regionLabel: 'Asia Timur',
    countryId: 'jp',
    countryName: 'Jepang',
    titleId: 'Ritual Kartu Nama (Meishi Koukan)',
    titleEn: 'Business Card Ritual (Meishi)',
    doTextId: 'Pegang kartu dengan kedua tangan pada sudut atas, hadapkan tulisan ke arah penerima, dan bungkukkan badan dengan khidmat.',
    doTextEn: 'Hold the card with both hands at the top corners, orient the text toward the receiver, and bow.',
    dontTextId: 'Jangan langsung memasukkan kartu ke saku celana atau mencoret-coret kartu nama yang baru diterima.',
    dontTextEn: 'Never slide the card immediately into a back pocket or write notes on it in front of the giver.',
    philosophyId: 'Kartu nama diperlakukan sebagai perpanjangan fisik kehormatan dan martabat orang yang memberikannya.',
    philosophyEn: 'A business card is honored as a direct physical extension of the person’s professional soul.',
  },
  {
    id: 'tr-tea',
    category: 'gestures',
    regionId: 'wa',
    regionLabel: 'Asia Barat',
    countryId: 'tr',
    countryName: 'Turki',
    titleId: 'Etiket Gelas Teh Cay Tulip',
    titleEn: 'Turkish Cay Glass Etiquette',
    doTextId: 'Pegang gelas berbentuk bunga tulip pada bagian bibir atas agar jemari tidak terbakar, dan aduk gula dengan sendok kecil.',
    doTextEn: 'Hold the tulip glass by its rim to avoid the heat, and gently dissolve beet sugar with the tiny spoon.',
    dontTextId: 'Jangan menolak tawaran teh pertama dari pemilik toko atau tuan rumah karena merupakan ikatan persaudaraan hangat.',
    dontTextEn: 'Never decline the first cup of tea offered; it is a sacred gesture of hospitality and goodwill.',
    philosophyId: 'Di Turki, secangkir teh bukanlah sekadar minuman, melainkan pembuka persahabatan seumur hidup.',
    philosophyEn: 'In Turkey, a glass of tea is never merely a beverage—it is the ceremonial threshold of lifelong friendship.',
  },
];

export default function EtiquetteFieldGuide({ onSelectCountry }: EtiquetteFieldGuideProps) {
  const navigate = useNavigate();
  const { locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState<'greetings' | 'dining' | 'hospitality' | 'gestures'>('greetings');

  const filteredItems = ETIQUETTE_DATA.filter((item) => item.category === activeCategory);

  return (
    <section id="etiket" className="etiquette-guide" aria-labelledby="etiquette-guide-title">
      <div className="etiquette-guide__container">
        {/* Header */}
        <div className="etiquette-guide__header">
          <p className="etiquette-guide__eyebrow">
            <span className="etiquette-guide__eyebrow-line" aria-hidden="true" />
            {locale === 'id' ? 'Panduan Etiket & Norma Budaya' : 'Cultural Etiquette Field Guide'}
          </p>
          <h2 id="etiquette-guide-title" className="etiquette-guide__title">
            {locale === 'id' ? (
              <>
                Kuasai Sopan Santun Lokal, <span className="etiquette-guide__title-accent">Hindari Tabu Lapangan.</span>
              </>
            ) : (
              <>
                Master Local Courtesy, <span className="etiquette-guide__title-accent">Avoid Cultural Pitfalls.</span>
              </>
            )}
          </h2>
          <p className="etiquette-guide__lead">
            {locale === 'id'
              ? 'Menjelajahi Asia bukan sekadar memandang peta, melainkan memahami jiwa dan rasa hormat masyarakatnya. Pelajari komparasi etiket nyata di 48 negara agar Anda diterima bak kerabat hangat.'
              : 'Traveling across Asia is more than reading maps—it is understanding the soul of its people. Learn authentic cultural do’s and don’ts to navigate 48 nations with confidence and grace.'}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="etiquette-guide__categories" role="tablist" aria-label="Kategori Etiket">
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'greetings'}
            className={`etiquette-guide__cat-btn ${activeCategory === 'greetings' ? 'etiquette-guide__cat-btn--active' : ''}`}
            onClick={() => setActiveCategory('greetings')}
          >
            <svg
              className="etiquette-guide__cat-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m11 17 2 2a1 1 0 0 0 1.4 0l4.6-4.6a2 2 0 0 0 0-2.8l-3.4-3.4a2 2 0 0 0-2.8 0L9.4 11.6" />
              <path d="m13 7.4-1.4-1.4a2 2 0 0 0-2.8 0L5.4 9.4a2 2 0 0 0 0 2.8l3.4 3.4" />
              <path d="m2 15 4-4" />
              <path d="m22 9-4 4" />
            </svg>
            <span>{locale === 'id' ? 'Seni Menyapa & Hormat' : 'Greetings & Respect'}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'dining'}
            className={`etiquette-guide__cat-btn ${activeCategory === 'dining' ? 'etiquette-guide__cat-btn--active' : ''}`}
            onClick={() => setActiveCategory('dining')}
          >
            <svg
              className="etiquette-guide__cat-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
            <span>{locale === 'id' ? 'Meja Makan & Jamuan' : 'Dining & Table Manners'}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'hospitality'}
            className={`etiquette-guide__cat-btn ${activeCategory === 'hospitality' ? 'etiquette-guide__cat-btn--active' : ''}`}
            onClick={() => setActiveCategory('hospitality')}
          >
            <svg
              className="etiquette-guide__cat-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 21h18" />
              <path d="M5 21V9l7-5 7 5v12" />
              <path d="M9 21v-7a3 3 0 0 1 6 0v7" />
            </svg>
            <span>{locale === 'id' ? 'Bertamu & Alas Kaki' : 'Home & Hospitality'}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === 'gestures'}
            className={`etiquette-guide__cat-btn ${activeCategory === 'gestures' ? 'etiquette-guide__cat-btn--active' : ''}`}
            onClick={() => setActiveCategory('gestures')}
          >
            <svg
              className="etiquette-guide__cat-icon"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
              <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
            </svg>
            <span>{locale === 'id' ? 'Gestur Santun & Tabu' : 'Gestures & Taboos'}</span>
          </button>
        </div>

        {/* Grid Kartu Etiket */}
        <div className="etiquette-guide__grid">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="etiquette-card"
              onClick={() => {
                onSelectCountry?.(item.countryId);
                navigate('/negara/' + item.countryId);
              }}
            >
              <div className="etiquette-card__header">
                <div className="etiquette-card__badge-row">
                  <span className="etiquette-card__region-tag">{item.regionLabel}</span>
                  <span className="etiquette-card__country-pill">{item.countryName}</span>
                </div>
                <h3 className="etiquette-card__title">
                  {locale === 'id' ? item.titleId : item.titleEn}
                </h3>
              </div>

              {/* Aturan Anjuran vs Pantangan */}
              <div className="etiquette-card__rules">
                <div className="etiquette-card__rule etiquette-card__rule--do">
                  <span className="etiquette-card__rule-icon" aria-hidden="true">
                    <svg
                      className="etiquette-card__rule-svg"
                      width="12"
                      height="12"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2.5 8.5 6 12 13.5 4.5" />
                    </svg>
                  </span>
                  <span>{locale === 'id' ? item.doTextId : item.doTextEn}</span>
                </div>
                <div className="etiquette-card__rule etiquette-card__rule--dont">
                  <span className="etiquette-card__rule-icon" aria-hidden="true">
                    <svg
                      className="etiquette-card__rule-svg"
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
                      <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
                    </svg>
                  </span>
                  <span>{locale === 'id' ? item.dontTextId : item.dontTextEn}</span>
                </div>
              </div>

              {/* Filosofi di Balik Norma */}
              <div className="etiquette-card__philosophy">
                <span className="etiquette-card__philosophy-label">
                  {locale === 'id' ? 'Falsafah Budaya' : 'Cultural Wisdom'}
                </span>
                <p className="etiquette-card__philosophy-text">
                  "{locale === 'id' ? item.philosophyId : item.philosophyEn}"
                </p>
              </div>

              <div className="etiquette-card__footer">
                <button
                  type="button"
                  className="etiquette-card__action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCountry?.(item.countryId);
                    navigate('/negara/' + item.countryId);
                  }}
                >
                  <span>
                    {locale === 'id'
                      ? `Lihat Profil ${item.countryName}`
                      : `Explore ${item.countryName}`}
                  </span>
                  <svg
                    className="etiquette-card__action-arrow"
                    width="13"
                    height="13"
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
          ))}
        </div>
      </div>
    </section>
  );
}

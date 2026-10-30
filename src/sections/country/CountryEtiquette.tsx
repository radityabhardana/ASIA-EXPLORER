import type { Country } from '@/content/countries';
import type { Locale } from '@/lib/i18n';

interface CountryEtiquetteProps {
  country: Country;
  locale?: Locale;
}

interface EtiquetteRule {
  index: string;
  badge: string;
  type: 'do' | 'dont' | 'norm';
  title: string;
  instruction: string;
  philosophy: string;
}

const CURATED_ETIQUETTE: Record<
  string,
  { id: EtiquetteRule[]; en: EtiquetteRule[] }
> = {
  id: {
    id: [
      {
        index: '01',
        badge: 'PANDUAN UTAMA',
        type: 'do',
        title: 'Penghormatan Usia & Tradisi Salim',
        instruction:
          'Gunakan sapaan hormat Bapak atau Ibu di depan nama orang yang lebih tua. Salim (menyentuhkan punggung tangan sesepuh ke kening) adalah tanda takzim tertinggi dalam interaksi keluarga dan sosial.',
        philosophy:
          'Menghargai garis usia dan memohon restu kebajikan dari sesepuh sebagai fondasi keselarasan sosial.',
      },
      {
        index: '02',
        badge: 'KERAMAHAN',
        type: 'norm',
        title: 'Tata Krama Jamuan & Adab Tangan Kanan',
        instruction:
          'Selalu gunakan tangan kanan untuk menyerahkan barang, uang, makanan, atau bersalaman. Saat bersalaman, sertai dengan anggukan kepala dan senyum tulus.',
        philosophy:
          'Tangan kanan dipandang suci dan bersih; mengulurkan tangan kanan mencerminkan niat hati yang murni dan tanpa kepura-puraan.',
      },
      {
        index: '03',
        badge: 'PANTANGAN LAPANGAN',
        type: 'dont',
        title: 'Pantangan Alas Kaki & Tangan Kiri',
        instruction:
          'Wajib melepas sepatu atau sandal di ambang pintu sebelum melangkah masuk ke rumah atau tempat ibadah. Hindari menggunakan tangan kiri untuk menunjuk atau memberikan sesuatu.',
        philosophy:
          'Rumah adalah ruang suci kenyamanan keluarga; melepaskan kotoran jalanan menjaga kemurnian lantai dan keharmonisan tuan rumah.',
      },
    ],
    en: [
      {
        index: '01',
        badge: 'PRIMARY PROTOCOL',
        type: 'do',
        title: 'Respect for Elders & Salim Gesture',
        instruction:
          'Address elders using honorifics Bapak (Sir/Father) or Ibu (Ma’am/Mother). Performing salim (touching an elder’s hand to one’s forehead) demonstrates supreme filial piety.',
        philosophy:
          'Honoring generational wisdom and seeking blessing from elders forms the cornerstone of Indonesian community harmony.',
      },
      {
        index: '02',
        badge: 'HOSPITALITY',
        type: 'norm',
        title: 'Right-Hand Courtesy & Hospitality',
        instruction:
          'Always give, receive, eat, and shake hands using your right hand, accompanied by a polite nod and pleasant warmth.',
        philosophy:
          'The right hand represents purity and auspiciousness; using it affirms transparency and honorable intentions.',
      },
      {
        index: '03',
        badge: 'FIELD TABOOS',
        type: 'dont',
        title: 'Footwear in Homes & Left-Hand Taboo',
        instruction:
          'Always remove footwear at the threshold before entering private homes or sacred halls. Never point with feet or hand items using the left hand.',
        philosophy:
          'Home interiors are treated with cleanliness and sanctity; leaving road dust outside maintains domestic tranquility.',
      },
    ],
  },
  jp: {
    id: [
      {
        index: '01',
        badge: 'PANDUAN UTAMA',
        type: 'do',
        title: 'Seni Membungkuk Sesuai Derajat (Ojigi)',
        instruction:
          'Bungkukkan badan 15° untuk sapaan kasual (Eshaku), 30° untuk rekan kerja formal (Keirei), dan 45° untuk rasa hormat mendalam (Saikeirei). Jaga pandangan mata ke bawah secara wajar.',
        philosophy:
          'Menundukkan kepala melambangkan ketiadaan niat bermusuhan dan pengakuan ketulusan derajat lawan bicara.',
      },
      {
        index: '02',
        badge: 'KERAMAHAN',
        type: 'norm',
        title: 'Pertukaran Kartu Nama Meishi Dua Tangan',
        instruction:
          'Pegang dua sudut atas meishi dengan kedua tangan, teks menghadap penerima. Pelajari kartu dengan seksama sebelum meletakkannya rapi di meja, jangan pernah mengantonginya langsung.',
        philosophy:
          'Meishi dipandang sebagai ekstensi fisik kehormatan dan jiwa profesional sang pemilik.',
      },
      {
        index: '03',
        badge: 'PANTANGAN LAPANGAN',
        type: 'dont',
        title: 'Pantangan Sumpit Tegak & Alas Kaki Genkan',
        instruction:
          'Jangan pernah menancapkan sumpit tegak di atas mangkuk nasi (Tsukitate-bashi) dan lepaskan sepatu di area genkan sebelum menginjak lantai tatami.',
        philosophy:
          'Sumpit tegak diasosiasikan dengan ritual dupa pemakaman; sedangkan genkan memisahkan ranah luar yang kotor dengan ranah dalam yang murni.',
      },
    ],
    en: [
      {
        index: '01',
        badge: 'PRIMARY PROTOCOL',
        type: 'do',
        title: 'Hierarchical Art of Bowing (Ojigi)',
        instruction:
          'Bow 15° for casual greeting (Eshaku), 30° for formal peers (Keirei), and 45° for profound gratitude or apology (Saikeirei). Lower eyes modestly.',
        philosophy:
          'Lowering one’s head signifies disarmament, sincere humility, and mutual regard in Japanese societal equilibrium.',
      },
      {
        index: '02',
        badge: 'HOSPITALITY',
        type: 'norm',
        title: 'Two-Handed Business Card Protocol (Meishi)',
        instruction:
          'Present and receive business cards with both hands, text facing the recipient. Study it intently before placing it neatly on the table; never cram it into pockets.',
        philosophy:
          'A meishi represents the physical spirit and personal honor of your counterpart.',
      },
      {
        index: '03',
        badge: 'FIELD TABOOS',
        type: 'dont',
        title: 'Vertical Chopsticks Taboo & Genkan Footwear',
        instruction:
          'Never stick chopsticks vertically into rice bowls (Tsukitate-bashi), and always remove outdoor shoes at the genkan before stepping onto tatami.',
        philosophy:
          'Vertical chopsticks replicate funeral incense rituals; the genkan preserves sacred household purity from outdoor contaminants.',
      },
    ],
  },
};

function cleanSentence(s?: string): string {
  if (!s) return '';
  const str = s.trim().replace(/[.!?]+$/, '');
  return str.length > 0 ? `${str}.` : '';
}

function extractRulesFromNotes(country: Country, locale: Locale): EtiquetteRule[] {
  const isEn = locale === 'en';
  const name = country.nameId;
  const greet = country.greeting || { native: '', roman: '', meaningId: '', register: '' };
  const people = country.peopleNote || '';
  const story = country.story?.text || '';

  const allSentences = `${people}. ${story}`
    .split(/(?<=[.!?])\s+|;\s+/)
    .map((s) => s.trim().replace(/[.!?]+$/, ''))
    .filter((s) => s.length > 8);

  // 1. Greeting & hierarchy
  const greetGesture = allSentences.find(
    (s) =>
      /(?:sapa|salam|jabat|tangan di dada|bungkuk|wai|ojigi|namaste|salim|mano|el öpmek|tua|sesepuh|derajat|apni|aap|hajur|mingalaba|greet|bow|handshake|elder|hand on heart)/i.test(
        s,
      ) && !/(?:sepatu|alas kaki|shoe|footwear|sumpit|chopstick)/i.test(s),
  );

  let p1Instruction = '';
  if (isEn) {
    p1Instruction = greet.native
      ? `Open encounters with the respectful greeting «${greet.native}» (${greet.roman}), meaning "${greet.meaningId}". ${greetGesture ? `${cleanSentence(greetGesture)} ` : ''}${greet.register || ''}`.trim()
      : (greetGesture ? cleanSentence(greetGesture) : 'Observe formal greetings and show deference to elders.');
  } else {
    p1Instruction = greet.native
      ? `Awali perjumpaan dengan sapaan hormat «${greet.native}» (${greet.roman}), yang bermakna "${greet.meaningId}". ${greetGesture ? `${cleanSentence(greetGesture)} ` : ''}${greet.register || ''}`.trim()
      : (greetGesture ? cleanSentence(greetGesture) : 'Patuhi norma adat dan dahulukan menyapa yang lebih tua.');
  }

  // 2. Hospitality & table manners
  const hospSentence = allSentences.find(
    (s) =>
      /(?:jamu|teh|kopi|makan|hidangan|cangkir|piring|tuan rumah|dua tangan|tangan kanan|suguh|terima|sendok|supra|gahwa|chai|tea|coffee|guest|host|two hands|right hand|serve|dish)/i.test(
        s,
      ) && !/(?:sepatu|alas kaki|shoe|footwear|kepala|head|ambang|threshold)/i.test(s),
  );

  let p2Instruction = '';
  if (isEn) {
    p2Instruction = hospSentence
      ? `${cleanSentence(hospSentence)} Always use the right hand or both hands when giving, receiving, or dining.`
      : 'When hosted, graciously accept offerings of tea or refreshments using your right hand to honor the host’s hospitality.';
  } else {
    p2Instruction = hospSentence
      ? `${cleanSentence(hospSentence)} Selalu gunakan tangan kanan atau kedua belah tangan saat menerima, menyerahkan, atau menyantap hidangan.`
      : 'Saat bertamu, sambut sajian minuman atau hidangan dengan takzim memakai tangan kanan sebagai tanda menghormati kemurahan hati tuan rumah.';
  }

  // 3. Cultural taboos & decorum
  const tabooSentence = allSentences.find(
    (s) =>
      /(?:sepatu|alas kaki|ambang|kepala|telapak kaki|dilarang|jangan|tidak boleh|bukan telunjuk|ibu jari|sumpit|kontak fisik|shoe|footwear|threshold|head|sole|feet|never|taboo|avoid|chopstick)/i.test(
        s,
      ),
  );

  let p3Instruction = '';
  if (isEn) {
    p3Instruction = tabooSentence
      ? `${cleanSentence(tabooSentence)} Maintaining spatial boundaries and abstaining from offensive physical gestures is essential.`
      : 'Always remove outdoor footwear before entering private residences or sacred sanctuaries, and refrain from pointing aggressively.';
  } else {
    p3Instruction = tabooSentence
      ? `${cleanSentence(tabooSentence)} Menjaga tata susila ruang tempat tinggal dan menahan diri dari gestur tabu adalah keharusan mutlak.`
      : 'Wajib menanggalkan alas kaki sebelum melangkah ke area dalam kediaman atau tempat suci, serta hindari menunjuk dengan telunjuk.';
  }

  return [
    {
      index: '01',
      badge: isEn ? 'PRIMARY PROTOCOL' : 'PANDUAN UTAMA',
      type: 'do',
      title: isEn ? 'Greeting Protocol & Respect for Hierarchy' : 'Adab Sapaan & Penghormatan Hierarki',
      instruction: p1Instruction,
      philosophy: isEn
        ? `Acknowledging generational seniority and social dignity forms the foundation of communal harmony in ${name}.`
        : `Menghormati garis usia dan martabat lawan bicara merupakan fondasi utama keselarasan sosial di tengah masyarakat ${name}.`,
    },
    {
      index: '02',
      badge: isEn ? 'HOSPITALITY' : 'KERAMAHAN',
      type: 'norm',
      title: isEn ? 'Hospitality & Table Manners' : 'Tata Krama Keramahan & Jamuan',
      instruction: p2Instruction,
      philosophy: isEn
        ? 'Dining hospitality is regarded as an authentic covenant of goodwill and mutual trust.'
        : 'Jamuan makan dan minum dipandang sebagai sakramen keterbukaan hati; menghormati sajian tuan rumah mempererat tali persaudaraan.',
    },
    {
      index: '03',
      badge: isEn ? 'FIELD TABOOS' : 'PANTANGAN LAPANGAN',
      type: 'dont',
      title: isEn ? 'Cultural Taboos & Sacred Decorum' : 'Pantangan Perilaku & Tabu Tempat Tinggal',
      instruction: p3Instruction,
      philosophy: isEn
        ? 'Preserving household sanctity and bodily reverence safeguards the host’s honor.'
        : 'Menjaga kesucian batas hunian dan menghormati kesakralan tubuh adalah benteng kehormatan adat setempat.',
    },
  ];
}

export default function CountryEtiquette({ country, locale = 'id' }: CountryEtiquetteProps) {
  const curated = CURATED_ETIQUETTE[country.id.toLowerCase()]?.[locale];
  const rules = curated && curated.length >= 3 ? curated : extractRulesFromNotes(country, locale);

  return (
    <section
      className="country-block country-etiquette"
      aria-labelledby="country-etiquette-title"
    >
      <div className="country-block__inner country-etiquette__inner">
        <header className="country-etiquette__header">
          <div className="country-etiquette__kicker-wrap">
            <span className="country-etiquette__mark" aria-hidden="true" />
            <p className="country-etiquette__kicker">
              {locale === 'id' ? 'NORMA SOSIAL & ADAT LAPANGAN' : 'SOCIAL NORMS & FIELD CUSTOMS'}
            </p>
          </div>
          <h2 id="country-etiquette-title" className="country-etiquette__title">
            {locale === 'id' ? 'Tiga Kaidah Etiket Lokal' : 'Three Field Etiquette Rules'}
          </h2>
          <p className="country-etiquette__subtitle">
            {locale === 'id'
              ? 'Tiga pedoman sopan santun budaya yang wajib dipegang teguh saat melangkah di tanah bangsa ini.'
              : 'Three essential cultural etiquette rules to uphold when navigating social and civic life in this nation.'}
          </p>
        </header>

        <div className="country-etiquette__grid">
          {rules.map((rule) => {
            return (
              <article
                key={rule.index}
                className={`country-etiquette__card country-etiquette__card--${rule.type}`}
              >
                <div className="country-etiquette__card-header">
                  <span className="country-etiquette__index" aria-hidden="true">
                    KAIDAH {rule.index}
                  </span>
                  <span
                    className={`country-etiquette__badge country-etiquette__badge--${rule.type}`}
                  >
                    {rule.badge}
                  </span>
                </div>

                <h3 className="country-etiquette__card-title">{rule.title}</h3>
                <p className="country-etiquette__instruction">{rule.instruction}</p>

                <div className="country-etiquette__philosophy">
                  <span className="country-etiquette__philosophy-label">
                    {locale === 'id' ? 'Akar Nilai:' : 'Cultural Root:'}
                  </span>{' '}
                  <span className="country-etiquette__philosophy-text">
                    {rule.philosophy}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

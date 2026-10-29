import type { Country } from '@/content/countries';
import type { Locale } from '@/lib/i18n';

interface CountryEtiquetteProps {
  country: Country;
  locale?: Locale;
}

interface EtiquetteRule {
  index: string;
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
        type: 'do',
        title: 'Penghormatan Usia & Tradisi Salim',
        instruction:
          'Gunakan sapaan hormat Bapak atau Ibu di depan nama orang yang lebih tua. Salim (menyentuhkan punggung tangan sesepuh ke kening) adalah tanda takzim tertinggi dalam interaksi keluarga dan sosial.',
        philosophy:
          'Menghargai garis usia dan memohon restu kebajikan dari sesepuh sebagai fondasi keselarasan sosial.',
      },
      {
        index: '02',
        type: 'do',
        title: 'Adab Tangan Kanan & Sentuhan Santun',
        instruction:
          'Selalu gunakan tangan kanan untuk menyerahkan barang, uang, makanan, atau bersalaman. Saat bersalaman, sertai dengan anggukan kepala dan senyum tulus.',
        philosophy:
          'Tangan kanan dipandang suci dan bersih; mengulurkan tangan kanan mencerminkan niat hati yang murni dan tanpa kepura-puraan.',
      },
      {
        index: '03',
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
        type: 'do',
        title: 'Respect for Elders & Salim Gesture',
        instruction:
          'Address elders using honorifics Bapak (Sir/Father) or Ibu (Ma’am/Mother). Performing salim (touching an elder’s hand to one’s forehead) demonstrates supreme filial piety.',
        philosophy:
          'Honoring generational wisdom and seeking blessing from elders forms the cornerstone of Indonesian community harmony.',
      },
      {
        index: '02',
        type: 'do',
        title: 'Right-Hand Courtesy & Modest Bow',
        instruction:
          'Always give, receive, eat, and shake hands using your right hand, accompanied by a polite nod and pleasant warmth.',
        philosophy:
          'The right hand represents purity and auspiciousness; using it affirms transparency and honorable intentions.',
      },
      {
        index: '03',
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
        type: 'do',
        title: 'Seni Membungkuk Sesuai Derajat (Ojigi)',
        instruction:
          'Bungkukkan badan 15° untuk sapaan kasual (Eshaku), 30° untuk rekan kerja formal (Keirei), dan 45° untuk rasa hormat mendalam (Saikeirei). Jaga pandangan mata ke bawah secara wajar.',
        philosophy:
          'Menundukkan kepala melambangkan ketiadaan niat bermusuhan dan pengakuan ketulusan derajat lawan bicara.',
      },
      {
        index: '02',
        type: 'do',
        title: 'Pertukaran Kartu Nama Meishi Dua Tangan',
        instruction:
          'Pegang dua sudut atas meishi dengan kedua tangan, teks menghadap penerima. Pelajari kartu dengan seksama sebelum meletakkannya rapi di meja, jangan pernah mengantonginya langsung.',
        philosophy:
          'Meishi dipandang sebagai ekstensi fisik kehormatan dan jiwa profesional sang pemilik.',
      },
      {
        index: '03',
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
        type: 'do',
        title: 'Hierarchical Art of Bowing (Ojigi)',
        instruction:
          'Bow 15° for casual greeting (Eshaku), 30° for formal peers (Keirei), and 45° for profound gratitude or apology (Saikeirei). Lower eyes modestly.',
        philosophy:
          'Lowering one’s head signifies disarmament, sincere humility, and mutual regard in Japanese societal equilibrium.',
      },
      {
        index: '02',
        type: 'do',
        title: 'Two-Handed Business Card Protocol (Meishi)',
        instruction:
          'Present and receive business cards with both hands, text facing the recipient. Study it intently before placing it neatly on the table; never cram it into pockets.',
        philosophy:
          'A meishi represents the physical spirit and personal honor of your counterpart.',
      },
      {
        index: '03',
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

function extractRulesFromNotes(country: Country, locale: Locale): EtiquetteRule[] {
  const note = country.peopleNote || '';
  const sentences = note
    .split(/(?<=[.!?])\s+|;\s+/)
    .map((s) => s.trim().replace(/[.!?]+$/, ''))
    .filter((s) => s.length > 8);

  const defaultTitlesId = [
    'Adab Sapaan & Penghormatan Hierarki',
    'Tata Krama Gestur & Keramahan Bertamu',
    'Pantangan Perilaku & Etiket Tempat Tinggal',
  ];

  const defaultTitlesEn = [
    'Greeting Protocol & Respect for Hierarchy',
    'Gestural Etiquette & Hospitality Courtesies',
    'Cultural Taboos & Household Decorum',
  ];

  const defaultPhilosophiesId = [
    'Menegaskan keharmonisan sosial lewat pengakuan martabat dan urutan usia.',
    'Menjaga kesucian interaksi melalui gestur fisik yang santun dan penuh pertimbangan.',
    'Menghormati batas-batas privasi dan tata ruang tradisional masyarakat setempat.',
  ];

  const defaultPhilosophiesEn = [
    'Reinforcing communal harmony through respect for age and social precedence.',
    'Preserving interpersonal warmth through mindful physical gestures and hospitality.',
    'Respecting traditional boundaries of domestic tranquility and sacred decorum.',
  ];

  return [0, 1, 2].map((idx) => {
    const rawInstruction = sentences[idx] || sentences[0] || (locale === 'id' ? 'Patuhi norma adat setempat saat berinteraksi dengan warga.' : 'Observe local customary rules when engaging with residents.');
    const ruleType: 'do' | 'dont' | 'norm' =
      rawInstruction.toLowerCase().includes('jangan') ||
      rawInstruction.toLowerCase().includes('tidak') ||
      rawInstruction.toLowerCase().includes('never') ||
      rawInstruction.toLowerCase().includes('avoid')
        ? 'dont'
        : idx === 0
          ? 'do'
          : 'norm';

    return {
      index: String(idx + 1).padStart(2, '0'),
      type: ruleType,
      title: locale === 'id' ? defaultTitlesId[idx]! : defaultTitlesEn[idx]!,
      instruction: rawInstruction.endsWith('.') ? rawInstruction : `${rawInstruction}.`,
      philosophy: locale === 'id' ? defaultPhilosophiesId[idx]! : defaultPhilosophiesEn[idx]!,
    };
  });
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
            const isDo = rule.type === 'do';
            const isDont = rule.type === 'dont';

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
                    className={`country-etiquette__badge ${
                      isDo
                        ? 'country-etiquette__badge--do'
                        : isDont
                          ? 'country-etiquette__badge--dont'
                          : 'country-etiquette__badge--norm'
                    }`}
                  >
                    {isDo
                      ? locale === 'id'
                        ? '✓ Dianjurkan'
                        : '✓ Courteous'
                      : isDont
                        ? locale === 'id'
                          ? '✕ Pantangan'
                          : '✕ Cultural Taboo'
                        : locale === 'id'
                          ? '◆ Tata Krama'
                          : '◆ Field Protocol'}
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

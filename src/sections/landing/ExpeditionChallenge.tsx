import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TranslationKey } from '@/lib/i18n';

interface ExpeditionChallengeProps {
  locale: 'id' | 'en';
  t: (key: TranslationKey) => string;
}

interface WaypointDilemma {
  id: string;
  stationNum: string;
  stationNameId: string;
  stationNameEn: string;
  flag: string;
  coords: string;
  domainId: string;
  domainEn: string;
  scenarioId: string;
  scenarioEn: string;
  stampTitleId: string;
  stampTitleEn: string;
  options: [
    {
      textId: string;
      textEn: string;
      correct: boolean;
      tagId: string;
      tagEn: string;
      leadId: string;
      leadEn: string;
      feedbackId: string;
      feedbackEn: string;
    },
    {
      textId: string;
      textEn: string;
      correct: boolean;
      tagId: string;
      tagEn: string;
      leadId: string;
      leadEn: string;
      feedbackId: string;
      feedbackEn: string;
    },
  ];
}

const WAYPOINTS: WaypointDilemma[] = [
  {
    id: 'jp',
    stationNum: '01',
    stationNameId: 'Kyoto, Jepang',
    stationNameEn: 'Kyoto, Japan',
    flag: '🇯🇵',
    coords: '35°01′N · 135°46′E',
    domainId: 'Etiket Bisnis & Takzim Sosial',
    domainEn: 'Business Etiquette & Social Reverence',
    scenarioId:
      'Saat menerima kartu nama (meishi) dari mitra senior dalam pertemuan pertama di Kyoto, sikap apa yang paling mencerminkan rasa hormat dan integritas?',
    scenarioEn:
      'When receiving a business card (meishi) from a senior partner in Kyoto, which action best reflects respect and personal integrity?',
    stampTitleId: 'KYOTO ✦ MEISHI MASTERY',
    stampTitleEn: 'KYOTO ✦ MEISHI MASTERY',
    options: [
      {
        textId: 'Menerima dengan kedua tangan, membaca seksama sambil sedikit membungkuk, lalu menatanya rapi di meja di hadapan Anda.',
        textEn: 'Receive with both hands, inspect attentively with a slight bow, and rest it respectfully on the table before you.',
        correct: true,
        tagId: 'Hierarki & Takzim Sosial',
        tagEn: 'Hierarchy & Social Reverence',
        leadId: 'Adab Diterima: Kesantunan Sempurna',
        leadEn: 'Protocol Honored: Perfect Civility',
        feedbackId:
          'Kartu nama (meishi) dipandang sebagai perpanjangan fisik kehormatan pemiliknya. Menerima dengan dua belah tangan dan membacanya seksama menunjukkan bahwa Anda menghargai nama dan kedudukan mereka.',
        feedbackEn:
          'A business card (meishi) is considered an extension of its owner. Receiving it with both hands and reading it attentively signals deep respect for their identity and position.',
      },
      {
        textId: 'Menerima dengan satu tangan santai lalu langsung menyelipkannya ke saku celana belakang.',
        textEn: 'Receive casually with one hand and immediately slide it into your rear trouser pocket.',
        correct: false,
        tagId: 'Pelanggaran Etika Sosial',
        tagEn: 'Social Etiquette Violation',
        leadId: 'Kekeliruan Budaya: Menodai Martabat',
        leadEn: 'Cultural Faux Pas: Disrespecting the Name',
        feedbackId:
          'Menyimpan meishi di saku belakang berarti Anda akan mendudukinya — sebuah penghinaan simbolis berat dalam etiket bisnis tradisional Jepang.',
        feedbackEn:
          'Placing a meishi into a rear pocket implies sitting on their name — a severe symbolic slight in traditional Japanese business relations.',
      },
    ],
  },
  {
    id: 'uz',
    stationNum: '02',
    stationNameId: 'Samarkand, Uzbekistan',
    stationNameEn: 'Samarkand, Uzbekistan',
    flag: '🇺🇿',
    coords: '39°39′N · 66°57′E',
    domainId: 'Adab Roti & Keramahan Dastarkhan',
    domainEn: 'Bread Ritual & Dastarkhan Hospitality',
    scenarioId:
      'Saat disuguhi roti tradisional Non (Lepeshka) hangat di atas meja dastarkhan warga Samarkand, adab terpenting apa yang wajib dijaga?',
    scenarioEn:
      'When presented with warm traditional Non (Lepeshka) bread on a Samarkand host’s dastarkhan, what crucial custom must be honored?',
    stampTitleId: 'SAMARKAND ✦ DASTARKHAN ADAB',
    stampTitleEn: 'SAMARKAND ✦ DASTARKHAN CUSTOM',
    options: [
      {
        textId: 'Mematahkan roti dengan kedua belah tangan dan tidak pernah meletakkannya terbalik (bagian dasar menghadap ke atas).',
        textEn: 'Break bread gently with both hands and never place it upside down (bottom crust facing up).',
        correct: true,
        tagId: 'Penghormatan Berkah Makanan',
        tagEn: 'Sanctity of Sustenance',
        leadId: 'Adab Diterima: Berkah Dihormati',
        leadEn: 'Protocol Honored: Sustenance Revered',
        feedbackId:
          'Di seluruh Asia Tengah, roti dipandang suci sebagai simbol rezeki Ilahi. Meletakkan roti terbalik dianggap pertanda buruk dan meremehkan ketulusan jamuan tuan rumah.',
        feedbackEn:
          'Across Central Asia, bread is sacred as a gift of life. Placing it upside down is seen as bad omen and a slight against the host’s heartfelt hospitality.',
      },
      {
        textId: 'Memotong roti dengan pisau saku sendiri lalu menaruhnya terbalik di lantai agar tidak dingin.',
        textEn: 'Cut the bread with a pocket knife and place it upside down on the floor to keep it warm.',
        correct: false,
        tagId: 'Tabu Makanan & Keramahan',
        tagEn: 'Food & Hospitality Taboo',
        leadId: 'Kekeliruan Budaya: Menolak Berkah',
        leadEn: 'Cultural Faux Pas: Desecrating the Host',
        feedbackId:
          'Menaruh makanan suci di lantai atau memperlakukan roti lepeshka tanpa rasa takzim melanggar hukum kehormatan dastarkhan Jalur Sutra.',
        feedbackEn:
          'Placing bread near the floor or treating it without reverence directly violates ancient Silk Road dastarkhan hospitality laws.',
      },
    ],
  },
  {
    id: 'id',
    stationNum: '03',
    stationNameId: 'Bali, Indonesia',
    stationNameEn: 'Bali, Indonesia',
    flag: '🇮🇩',
    coords: '08°30′S · 115°13′E',
    domainId: 'Kesucian Ambang & Harmoni Spiritual',
    domainEn: 'Threshold Sanctity & Spiritual Balance',
    scenarioId:
      'Saat melangkah masuk melalui gapura candi bentar atau ambang pintu rumah tradisional di Bali, tindakan mana yang benar?',
    scenarioEn:
      'When stepping through a candi bentar gateway or home threshold in Bali, which action respects the living tradition?',
    stampTitleId: 'BALI ✦ AMBANG HARMONI',
    stampTitleEn: 'BALI ✦ THRESHOLD HARMONY',
    options: [
      {
        textId: 'Melangkahi balok kayu ambang pintu (tidak menginjaknya) serta memperhatikan sesajen canang sari di lantai.',
        textEn: 'Step gracefully over the wooden door threshold (never step on it) and be mindful of canang sari offerings.',
        correct: true,
        tagId: 'Harmoni Skala Tri Hita Karana',
        tagEn: 'Tri Hita Karana Harmony',
        leadId: 'Adab Diterima: Menjaga Kesakralan',
        leadEn: 'Protocol Honored: Protecting the Sacred',
        feedbackId:
          'Balok kayu ambang pintu melambangkan batas pelindung spiritual rumah. Menginjaknya dipandang mengusik energi penjaga, sedangkan melangkahinya menjaga keharmonisan tuan rumah.',
        feedbackEn:
          'The raised wooden threshold marks the spiritual protection boundary. Stepping directly onto it disrupts the house guardians; stepping over it preserves spiritual harmony.',
      },
      {
        textId: 'Menginjak kuat kayu ambang pintu dan menendang canang sari ke pinggir jalan.',
        textEn: 'Stomp firmly on the wooden threshold and kick the floral canang sari aside.',
        correct: false,
        tagId: 'Penodai Ritual Suci',
        tagEn: 'Desecration of Daily Ritual',
        leadId: 'Kekeliruan Budaya: Pelanggaran Tabu',
        leadEn: 'Cultural Faux Pas: Sacred Boundary Violated',
        feedbackId:
          'Canang sari adalah persembahan rasa syukur harian. Menginjak atau merusaknya mencederai rasa hormat mendalam masyarakat Bali terhadap keselarasan alam semesta.',
        feedbackEn:
          'Canang sari are daily offerings of gratitude. Trampling them disregards the island’s profound spiritual reverence for cosmic balance.',
      },
    ],
  },
  {
    id: 'tr',
    stationNum: '04',
    stationNameId: 'Istanbul, Turki',
    stationNameEn: 'Istanbul, Turkey',
    flag: '🇹🇷',
    coords: '41°00′N · 28°58′E',
    domainId: 'Keramahan Teh Çay & Diplomasi Pasar',
    domainEn: 'Çay Tea Hospitality & Bazaar Diplomacy',
    scenarioId:
      'Di kedai Istanbul atau saat berdiskusi di toko karpet, tuan rumah menyajikan segelas çay dalam gelas berpinggang ramping (ince belli). Bagaimana meresponnya?',
    scenarioEn:
      'In an Istanbul tea garden or carpet atelier, the host serves hot çay in a tulip-curved glass (ince belli). What is the proper response?',
    stampTitleId: 'ISTANBUL ✦ ÇAY DIPLOMACY',
    stampTitleEn: 'ISTANBUL ✦ ÇAY DIPLOMACY',
    options: [
      {
        textId: 'Menerima teh dengan hangat, memegang bibir atas gelas yang tidak panas, dan menikmati obrolan santai sebelum bicara bisnis.',
        textEn: 'Accept the tea warmly, grip the cooler upper rim of the tulip glass, and enjoy polite conversation before business.',
        correct: true,
        tagId: 'Keramahan Misafirperverlik',
        tagEn: 'Misafirperverlik Hospitality',
        leadId: 'Adab Diterima: Silaturahmi Terbina',
        leadEn: 'Protocol Honored: Rapport Established',
        feedbackId:
          'Di Turki, çay adalah tali pengikat persaudaraan. Menikmati teh bersama membuktikan bahwa Anda memandang tuan rumah sebagai sahabat, bukan sekadar objek transaksi semata.',
        feedbackEn:
          'In Turkey, çay is a vessel of friendship. Sharing tea proves you view your host as an honored peer, never merely a commercial transaction.',
      },
      {
        textId: 'Menolak keras dengan lambaian tangan lalu mendesak tuan rumah langsung ke harga tanpa sapaan.',
        textEn: 'Curtly wave away the glass and demand immediate wholesale prices without greeting.',
        correct: false,
        tagId: 'Ketidaksopanan Hubungan Dagang',
        tagEn: 'Commercial Discourtesy',
        leadId: 'Kekeliruan Budaya: Menolak Persahabatan',
        leadEn: 'Cultural Faux Pas: Rebuffing Friendship',
        feedbackId:
          'Menolak sajian teh secara kasar dipandang sebagai penolakan terhadap niat baik tuan rumah. Di Timur Dekat, ikatan sosial mendahului setiap kesepakatan dagang.',
        feedbackEn:
          'Bluntly refusing çay is seen as rejecting the host’s goodwill. In Near Eastern culture, genuine human rapport always precedes business.',
      },
    ],
  },
  {
    id: 'sa',
    stationNum: '05',
    stationNameId: 'Riyadh, Arab Saudi',
    stationNameEn: 'Riyadh, Saudi Arabia',
    flag: '🇸🇦',
    coords: '24°42′N · 46°43′E',
    domainId: 'Etiket Kopi Gahwa di Majlis',
    domainEn: 'Majlis Gahwa Coffee Etiquette',
    scenarioId:
      'Saat tuan rumah menuangkan kopi rempah gahwa ke cangkir finjan kecil Anda, bagaimana cara santun memberi tanda bahwa Anda sudah cukup minum?',
    scenarioEn:
      'When your host pours spiced gahwa into your small finjan cup, how do you politely signal that you have had enough?',
    stampTitleId: 'RIYADH ✦ GAHWA ETIQUETTE',
    stampTitleEn: 'RIYADH ✦ GAHWA ETIQUETTE',
    options: [
      {
        textId: 'Menggoyangkan cangkir finjan secara perlahan dari sisi ke sisi sebelum mengembalikannya dengan tangan kanan.',
        textEn: 'Gently tilt the finjan cup from side to side before handing it back with your right hand.',
        correct: true,
        tagId: 'Sinyal Santun Hazz al-Finjan',
        tagEn: 'Hazz al-Finjan Custom',
        leadId: 'Adab Diterima: Isyarat Tradisi Dipahami',
        leadEn: 'Protocol Honored: Sacred Code Recognized',
        feedbackId:
          'Tuan rumah majlis akan terus menuang kopi selama cangkir tidak digoyang. Isyarat goyangan lembut (hazz al-finjan) adalah kode bahasa tubuh kuno bahwa dahaga Anda telah terpenuhi dengan mulia.',
        feedbackEn:
          'A majlis host will perpetually refill your cup until tilted. The gentle side-to-side shimmer (hazz al-finjan) is the historic silent code that your thirst is graciously quenched.',
      },
      {
        textId: 'Menutup mulut cangkir dengan telapak tangan kiri sambil menggelengkan kepala keras-keras.',
        textEn: 'Cover the cup with your left palm while shaking your head vigorously.',
        correct: false,
        tagId: 'Kekeliruan Bahasa Tubuh',
        tagEn: 'Body Language Blunder',
        leadId: 'Kekeliruan Budaya: Gestur Kurang Santun',
        leadEn: 'Cultural Faux Pas: Ungraceful Refusal',
        feedbackId:
          'Tangan kiri dihindari dalam pertukaran minuman, dan isyarat penolakan yang gaduh bertentangan dengan keanggunan tata krama majlis padang pasir.',
        feedbackEn:
          'The left hand is strictly avoided when handling refreshments, and loud abrupt hand gestures clash with desert majlis decorum.',
      },
    ],
  },
  {
    id: 'th',
    stationNum: '06',
    stationNameId: 'Bangkok, Thailand',
    stationNameEn: 'Bangkok, Thailand',
    flag: '🇹🇭',
    coords: '13°45′N · 100°31′E',
    domainId: 'Seni Menghormat Wai & Ruang Sakral',
    domainEn: 'Sacred Wai Reverence & Monastic Boundaries',
    scenarioId:
      'Saat berhadapan dengan biksu atau sosok tetua di Bangkok, bagaimana postur gerak Wai yang tepat dilakukan?',
    scenarioEn:
      'When greeting a Buddhist monk or respected elder in Bangkok, how should the respectful Wai gesture be performed?',
    stampTitleId: 'BANGKOK ✦ WAI RESPECT',
    stampTitleEn: 'BANGKOK ✦ WAI RESPECT',
    options: [
      {
        textId: 'Merapatkan kedua telapak tangan setinggi dada hingga ibu jari menyentuh hidung/alis sambil menundukkan kepala dengan takzim.',
        textEn: 'Press palms together at chest level raising thumbs toward the nose/brow while bowing deeply with reverence.',
        correct: true,
        tagId: 'Ketinggian Wai Sesuai Hierarki',
        tagEn: 'Hierarchical Wai Heights',
        leadId: 'Adab Diterima: Penghormatan Tertinggi',
        leadEn: 'Protocol Honored: Supreme Reverence',
        feedbackId:
          'Tinggi posisi ibu jari dalam salam Wai mencerminkan derajat takzim. Menyentuhkan ibu jari ke pangkal hidung/alis adalah penghormatan tertinggi untuk sosok spiritual dan tetua.',
        feedbackEn:
          'The height of the thumbs in a Wai communicates reverence levels. Touching the thumbs near the bridge of the nose represents the highest honor reserved for monks and elders.',
      },
      {
        textId: 'Mengangkat dagu tinggi-tinggi sambil menepuk bahu biksu dengan akrab.',
        textEn: 'Raise your chin high and familiarly pat the monk on the shoulder.',
        correct: false,
        tagId: 'Tabu Fisik & Ruang Sakral',
        tagEn: 'Physical Taboo & Sacred Sphere',
        leadId: 'Kekeliruan Budaya: Pelanggaran Batas Tubuh',
        leadEn: 'Cultural Faux Pas: Boundary Transgression',
        feedbackId:
          'Di Thailand, kepala adalah bagian tubuh paling suci dan pantang disentuh sembarangan, sementara biksu memegang disiplin vinaya ketat yang melarang kontak fisik santai.',
        feedbackEn:
          'In Thailand, the head is sacred and casual physical contact with Buddhist monks is strictly forbidden under monastic vinaya rules.',
      },
    ],
  },
];

export default function ExpeditionChallenge({ locale, t }: ExpeditionChallengeProps) {
  const [activeStationIndex, setActiveStationIndex] = useState<number>(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number | null>>({});
  const [stampsEarned, setStampsEarned] = useState<Set<string>>(new Set(['jp']));
  const [activeLeitnerBox, setActiveLeitnerBox] = useState<number>(3);

  const currentWaypoint = WAYPOINTS[activeStationIndex]!;
  const currentSelection = selectedOptions[currentWaypoint.id] ?? (currentWaypoint.id === 'jp' ? 0 : null);

  const handleChooseOption = (optionIndex: number) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [currentWaypoint.id]: optionIndex,
    }));

    if (currentWaypoint.options[optionIndex]?.correct) {
      setStampsEarned((prev) => {
        const next = new Set(prev);
        next.add(currentWaypoint.id);
        return next;
      });
    }
  };

  const leitnerItems = [
    {
      box: 1,
      interval: '1h',
      days: 1,
      duePhrases: 18,
      label:
        locale === 'id'
          ? 'Kotak 1: Interval 1 hari · 18 frasa siap ulas'
          : 'Box 1: 1-day interval · 18 phrases due',
    },
    {
      box: 2,
      interval: '3h',
      days: 3,
      duePhrases: 9,
      label:
        locale === 'id'
          ? 'Kotak 2: Interval 3 hari · 9 frasa siap ulas'
          : 'Box 2: 3-day interval · 9 phrases due',
    },
    {
      box: 3,
      interval: '7h',
      days: 7,
      duePhrases: 12,
      label:
        locale === 'id'
          ? 'Kotak 3: Interval 7 hari · 12 frasa siap ulas'
          : 'Box 3: 7-day interval · 12 phrases due',
    },
    {
      box: 4,
      interval: '16h',
      days: 16,
      duePhrases: 4,
      label:
        locale === 'id'
          ? 'Kotak 4: Interval 16 hari · 4 frasa siap ulas'
          : 'Box 4: 16-day interval · 4 phrases due',
    },
    {
      box: 5,
      interval: '35h',
      days: 35,
      duePhrases: 2,
      label:
        locale === 'id'
          ? 'Kotak 5: Interval 35 hari · 2 frasa siap ulas'
          : 'Box 5: 35-day interval · 2 phrases due',
    },
  ];

  const activeLeitnerItem =
    leitnerItems.find((b) => b.box === activeLeitnerBox) ?? leitnerItems[2]!;

  return (
    <div className="landing-dashboard__expedition-wrapper">
      {/* Waypoint Station Switcher Bar */}
      <div
        className="landing-dashboard__waypoint-bar"
        role="tablist"
        aria-label={locale === 'id' ? 'Pilih pos ekspedisi budaya' : 'Select cultural expedition waypoint'}
      >
        <span className="landing-dashboard__waypoint-bar-label">
          {locale === 'id' ? 'POS SINGGAH:' : 'WAYPOINTS:'}
        </span>
        <div className="landing-dashboard__waypoint-tabs">
          {WAYPOINTS.map((wp, idx) => {
            const isActive = activeStationIndex === idx;
            const hasStamp = stampsEarned.has(wp.id);
            return (
              <button
                key={wp.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`landing-dashboard__waypoint-tab ${isActive ? 'landing-dashboard__waypoint-tab--active' : ''} ${hasStamp ? 'landing-dashboard__waypoint-tab--passed' : ''}`}
                onClick={() => setActiveStationIndex(idx)}
              >
                <span className="landing-dashboard__waypoint-flag" aria-hidden="true">{wp.flag}</span>
                <span className="landing-dashboard__waypoint-name">
                  {locale === 'id' ? wp.stationNameId : wp.stationNameEn}
                </span>
                {hasStamp ? (
                  <span className="landing-dashboard__waypoint-stamp-icon" title="Stempel Berhasil Didapat">
                    ✓
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Console (Dilemma + Leitner) vs Right Pillars */}
      <div className="landing-dashboard__grid" data-reveal>
        {/* Left Side: Live Interactive Field Log Console */}
        <div className="landing-dashboard__console">
          {/* Top Bar with Stamp Counter & Station Metadata */}
          <div className="landing-dashboard__console-bar">
            <div className="landing-dashboard__console-stamp" aria-hidden="true">
              <span className="landing-dashboard__stamp-icon">✦</span>
              <span>
                {locale === 'id'
                  ? `LOG EKSPEDISI · POS #${currentWaypoint.stationNum}`
                  : `EXPEDITION LOG · WAYPOINT #${currentWaypoint.stationNum}`}
              </span>
            </div>
            <div className="landing-dashboard__stamps-counter">
              <span>{locale === 'id' ? 'STEMPEL PASPOR:' : 'PASSPORT STAMPS:'}</span>
              <strong className="landing-dashboard__stamps-score">
                {stampsEarned.size} / {WAYPOINTS.length}
              </strong>
            </div>
          </div>

          <div className="landing-dashboard__console-content">
            {/* Active Quest Dilemma Box */}
            <div className="landing-dashboard__scenario-box">
              <div className="landing-dashboard__scenario-header">
                <span className="landing-dashboard__scenario-badge">
                  {locale === 'id' ? currentWaypoint.domainId : currentWaypoint.domainEn}
                </span>
                <span className="landing-dashboard__scenario-location">
                  {locale === 'id' ? currentWaypoint.stationNameId : currentWaypoint.stationNameEn} · {currentWaypoint.coords}
                </span>
              </div>

              <h3 className="landing-dashboard__scenario-title">
                {locale === 'id' ? currentWaypoint.scenarioId : currentWaypoint.scenarioEn}
              </h3>

              {/* 2 Authentic Choices */}
              <div
                className="landing-dashboard__scenario-options"
                role="radiogroup"
                aria-label="Pilihan respon etiket penjelajah"
              >
                {currentWaypoint.options.map((opt, optIndex) => {
                  const isSelected = currentSelection === optIndex;
                  const btnClass = isSelected
                    ? (opt.correct
                        ? 'landing-dashboard__option-btn--active landing-dashboard__option-btn--correct'
                        : 'landing-dashboard__option-btn--active landing-dashboard__option-btn--warning')
                    : '';

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`landing-dashboard__option-btn ${btnClass}`}
                      onClick={() => handleChooseOption(optIndex)}
                    >
                      <div className="landing-dashboard__option-content">
                        <span className="landing-dashboard__option-indicator" aria-hidden="true">
                          {isSelected && opt.correct ? (
                            <svg
                              viewBox="0 0 14 14"
                              width="10"
                              height="10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="2.5 7 5.5 10 11.5 4" />
                            </svg>
                          ) : isSelected ? (
                            <span className="landing-dashboard__option-indicator-inner" />
                          ) : (
                            <span className="landing-dashboard__option-indicator-inner" />
                          )}
                        </span>
                        <span className="landing-dashboard__option-text">
                          {locale === 'id' ? opt.textId : opt.textEn}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="landing-dashboard__option-tags">
                          <span className={`landing-dashboard__reason-tag ${opt.correct ? '' : 'landing-dashboard__reason-tag--amber'}`}>
                            {locale === 'id' ? opt.tagId : opt.tagEn}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Interactive Feedback Cards */}
              {currentSelection !== null && currentWaypoint.options[currentSelection] && (
                <div
                  className={`landing-dashboard__scenario-feedback ${
                    currentWaypoint.options[currentSelection]?.correct
                      ? 'landing-dashboard__scenario-feedback--success'
                      : 'landing-dashboard__scenario-feedback--warning'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <div className="landing-dashboard__feedback-header">
                    <span
                      className={`landing-dashboard__feedback-badge ${
                        currentWaypoint.options[currentSelection]?.correct
                          ? 'landing-dashboard__feedback-badge--success'
                          : 'landing-dashboard__feedback-badge--warning'
                      }`}
                      aria-hidden="true"
                    >
                      {currentWaypoint.options[currentSelection]?.correct ? '✓' : '!'}
                    </span>
                    <strong className="landing-dashboard__feedback-lead">
                      {locale === 'id'
                        ? currentWaypoint.options[currentSelection]?.leadId
                        : currentWaypoint.options[currentSelection]?.leadEn}
                    </strong>
                    {currentWaypoint.options[currentSelection]?.correct && (
                      <span className="landing-dashboard__stamp-unlocked-badge">
                        ✦ {locale === 'id' ? currentWaypoint.stampTitleId : currentWaypoint.stampTitleEn}
                      </span>
                    )}
                  </div>
                  <p className="landing-dashboard__feedback-text">
                    {locale === 'id'
                      ? currentWaypoint.options[currentSelection]?.feedbackId
                      : currentWaypoint.options[currentSelection]?.feedbackEn}
                  </p>
                </div>
              )}
            </div>

            {/* Spaced Repetition track: 5 Leitner review boxes */}
            <div className="landing-dashboard__leitner-track">
              <div className="landing-dashboard__leitner-header">
                <span className="landing-dashboard__leitner-label">
                  {t('dashboard.leitnerTitle')}
                </span>
                <span className="landing-dashboard__leitner-meta">
                  {t('dashboard.leitnerInterval')} {activeLeitnerItem.days}{' '}
                  {t('dashboard.leitnerDays')} &middot; {activeLeitnerItem.duePhrases}{' '}
                  {t('dashboard.leitnerPhrasesReady')}
                </span>
              </div>
              <div
                className="landing-dashboard__leitner-boxes"
                role="tablist"
                aria-label="Kotak ulasan Spaced Repetition"
              >
                {leitnerItems.map((item) => {
                  const isActive = activeLeitnerBox === item.box;
                  return (
                    <button
                      key={item.box}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`landing-dashboard__leitner-box ${isActive ? 'landing-dashboard__leitner-box--active' : ''}`}
                      title={item.label}
                      onClick={() => setActiveLeitnerBox(item.box)}
                      onMouseEnter={() => setActiveLeitnerBox(item.box)}
                    >
                      <span className="landing-dashboard__leitner-num">{item.box}</span>
                      <span className="landing-dashboard__leitner-interval">{item.interval}</span>
                      {isActive && (
                        <span className="landing-dashboard__leitner-status">
                          &bull; {item.duePhrases} {t('dashboard.leitnerPhrasesUnit')}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Local-first status bar */}
          <div className="landing-dashboard__status-bar">
            <div className="landing-dashboard__status-indicator">
              <span className="landing-dashboard__status-pulse" aria-hidden="true" />
              <span>{t('dashboard.statusLocal')}</span>
            </div>
            <span>{t('dashboard.statusMeta')}</span>
          </div>
        </div>

        {/* Right Side: 4 Strategic Capability Pillars */}
        <div className="landing-dashboard__pillars">
          <article className="landing-dashboard__pillar-item">
            <span className="landing-dashboard__pillar-num">01</span>
            <div className="landing-dashboard__pillar-content">
              <h3 className="landing-dashboard__pillar-title">{t('dashboard.p1Title')}</h3>
              <p className="landing-dashboard__pillar-desc">{t('dashboard.p1Desc')}</p>
            </div>
          </article>

          <article className="landing-dashboard__pillar-item">
            <span className="landing-dashboard__pillar-num">02</span>
            <div className="landing-dashboard__pillar-content">
              <h3 className="landing-dashboard__pillar-title">{t('dashboard.p2Title')}</h3>
              <p className="landing-dashboard__pillar-desc">{t('dashboard.p2Desc')}</p>
            </div>
          </article>

          <article className="landing-dashboard__pillar-item">
            <span className="landing-dashboard__pillar-num">03</span>
            <div className="landing-dashboard__pillar-content">
              <h3 className="landing-dashboard__pillar-title">{t('dashboard.p3Title')}</h3>
              <p className="landing-dashboard__pillar-desc">{t('dashboard.p3Desc')}</p>
            </div>
          </article>

          <article className="landing-dashboard__pillar-item">
            <span className="landing-dashboard__pillar-num">04</span>
            <div className="landing-dashboard__pillar-content">
              <h3 className="landing-dashboard__pillar-title">{t('dashboard.p4Title')}</h3>
              <p className="landing-dashboard__pillar-desc">{t('dashboard.p4Desc')}</p>
            </div>
          </article>

          <div className="landing-dashboard__actions">
            <Link to="/dashboard" className="landing-dashboard__cta">
              {t('dashboard.cta')} <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

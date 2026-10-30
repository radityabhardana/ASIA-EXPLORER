import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  playParchmentClick,
  playStampFailure,
  playStampSuccess,
} from '@/lib/audio';
import type { Locale } from '@/lib/i18n';
import { scrollToSection } from '@/lib/motion';

interface DailyChallengeExpeditionProps {
  locale: Locale;
  onExploreCountry?: (countryId: string) => void;
}

interface Question {
  id: number;
  category: string;
  categoryEn: string;
  countryCode: string;
  countryName: string;
  countryNameEn: string;
  question: string;
  questionEn: string;
  options: {
    id: string;
    text: string;
    textEn: string;
    isCorrect: boolean;
    explanation: string;
    explanationEn: string;
  }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    category: 'BAHASA & SAPAAN BUDAYA',
    categoryEn: 'CULTURAL GREETINGS & HERITAGE',
    countryCode: 'tj',
    countryName: 'Tajikistan',
    countryNameEn: 'Tajikistan',
    question:
      'Sapaan "Салом" (Salom) ditulis dalam aksara Kiril dan diucapkan hangat di kedai teh (Choykhona) sepanjang jalur pegunungan Pamir. Negara manakah ini?',
    questionEn:
      'The greeting "Салом" (Salom) is written in Cyrillic script and warmly spoken in teahouses (Choykhona) across the Pamir Mountains. Which country is this?',
    options: [
      {
        id: 'a',
        text: 'Tajikistan',
        textEn: 'Tajikistan',
        isCorrect: true,
        explanation:
          'Tepat! Di Tajikistan, bahasa Tajik (rumpun Persia) resmi ditulis dengan aksara Kiril sejak era Soviet dan dipertahankan hingga kini.',
        explanationEn:
          'Correct! In Tajikistan, the Tajik language (Persian family) is officially written in Cyrillic, preserved as part of its historical heritage.',
      },
      {
        id: 'b',
        text: 'Mongolia',
        textEn: 'Mongolia',
        isCorrect: false,
        explanation: 'Kurang tepat. Sapaan khas di Mongolia adalah "Сайн байна уу" (Sain baina uu).',
        explanationEn: 'Incorrect. The traditional greeting in Mongolia is "Сайн байна уу" (Sain baina uu).',
      },
      {
        id: 'c',
        text: 'Myanmar',
        textEn: 'Myanmar',
        isCorrect: false,
        explanation: 'Kurang tepat. Myanmar menggunakan aksara Burma bulat dengan sapaan "Mingalaba".',
        explanationEn: 'Incorrect. Myanmar uses circular Burmese script with the greeting "Mingalaba".',
      },
      {
        id: 'd',
        text: 'Lebanon',
        textEn: 'Lebanon',
        isCorrect: false,
        explanation: 'Kurang tepat. Lebanon menggunakan aksara Arab dengan sapaan "Marhaban".',
        explanationEn: 'Incorrect. Lebanon uses Arabic script with the greeting "Marhaban".',
      },
    ],
  },
  {
    id: 2,
    category: 'GEOGRAFI & BENTANG ALAM',
    categoryEn: 'FIELD GEOGRAPHY & BIOMES',
    countryCode: 'id',
    countryName: 'Indonesia',
    countryNameEn: 'Indonesia',
    question:
      'Negara kepulauan terbesar di dunia yang membentang di khatulistiwa, menghubungkan Samudra Pasifik dan Hindia dengan lebih dari 17.000 pulau vulkanik adalah...',
    questionEn:
      'The world\'s largest archipelagic state spanning the equator, connecting the Pacific and Indian Oceans with over 17,000 volcanic islands is...',
    options: [
      {
        id: 'a',
        text: 'Filipina',
        textEn: 'Philippines',
        isCorrect: false,
        explanation: 'Kurang tepat. Filipina memiliki sekitar 7.641 pulau di Pasifik barat.',
        explanationEn: 'Incorrect. The Philippines encompasses approximately 7,641 islands in the western Pacific.',
      },
      {
        id: 'b',
        text: 'Indonesia',
        textEn: 'Indonesia',
        isCorrect: true,
        explanation:
          'Tepat! Indonesia adalah episentrum megabiodiversitas maritim dunia dengan garis pantai terpanjang kedua di bumi.',
        explanationEn:
          'Correct! Indonesia is the epicenter of global marine megabiodiversity with the second-longest coastline on Earth.',
      },
      {
        id: 'c',
        text: 'Maladewa',
        textEn: 'Maldives',
        isCorrect: false,
        explanation: 'Kurang tepat. Maladewa adalah negara atol karang kecil di Samudra Hindia.',
        explanationEn: 'Incorrect. Maldives is a coral atoll nation in the central Indian Ocean.',
      },
      {
        id: 'd',
        text: 'Jepang',
        textEn: 'Japan',
        isCorrect: false,
        explanation: 'Kurang tepat. Jepang memiliki 4 pulau utama dan ribuan pulau vulkanik di Pasifik barat laut.',
        explanationEn: 'Incorrect. Japan has 4 primary islands and surrounding volcanic islets in the northwest Pacific.',
      },
    ],
  },
  {
    id: 3,
    category: 'DILEMA ETIKET LAPANGAN',
    categoryEn: 'FIELD ETIQUETTE PROTOCOL',
    countryCode: 'jp',
    countryName: 'Jepang',
    countryNameEn: 'Japan',
    question:
      'Dalam pertemuan di Kyoto, rekan bisnis menyerahkan kartu nama (meishi) kepada Anda. Langkah mana yang mencerminkan rasa hormat tertinggi?',
    questionEn:
      'During a meeting in Kyoto, a business partner presents their business card (meishi) to you. Which action demonstrates the highest respect?',
    options: [
      {
        id: 'a',
        text: 'Menerima dengan dua tangan, membungkuk sopan, membaca dengan seksama, dan meletakkannya rapi di atas meja.',
        textEn: 'Receive with both hands, bow respectfully, study it carefully, and place it neatly on the table.',
        isCorrect: true,
        explanation:
          'Tepat Sekali! Di Jepang, meishi dianggap perpanjangan dari jiwa dan kehormatan pemiliknya, tidak boleh langsung disimpan ke saku celana.',
        explanationEn:
          'Spot On! In Japan, meishi is treated as an extension of the person\'s identity and must never be jammed into pockets.',
      },
      {
        id: 'b',
        text: 'Langsung memasukkannya ke saku belakang celana agar tidak hilang.',
        textEn: 'Directly slide it into your back pocket so it won\'t get lost.',
        isCorrect: false,
        explanation: 'Pantangan besar. Menaruh meishi di saku belakang atau mendudukinya dianggap penghinaan.',
        explanationEn: 'Major cultural taboo. Placing a meishi in back pockets or sitting on it is considered disrespectful.',
      },
      {
        id: 'c',
        text: 'Menuliskan nomor telepon atau catatan pribadi langsung di atas kartu tersebut dengan pulpen.',
        textEn: 'Write notes or phone numbers directly on the card with a pen.',
        isCorrect: false,
        explanation: 'Kurang tepat. Menulis di atas kartu nama rekan di depannya dianggap mencoreng identitas mereka.',
        explanationEn: 'Incorrect. Writing on someone\'s card in front of them is considered defacing their identity.',
      },
      {
        id: 'd',
        text: 'Mengibaskan kartu nama di udara sebagai tanda antusiasme.',
        textEn: 'Fanning the business card in the air to show enthusiastic energy.',
        isCorrect: false,
        explanation: 'Kurang tepat. Gerakan mengibaskan kartu dianggap meremehkan pemiliknya.',
        explanationEn: 'Incorrect. Fanning the card is perceived as dismissive and informal.',
      },
    ],
  },
];

export default function DailyChallengeExpedition({
  locale,
  onExploreCountry,
}: DailyChallengeExpeditionProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion: Question = QUESTIONS[currentIndex] ?? QUESTIONS[0]!;

  const handleSelectOption = (optionId: string) => {
    if (hasSubmitted) return;
    playParchmentClick();
    setSelectedOptionId(optionId);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOptionId || hasSubmitted) return;
    setHasSubmitted(true);
    const chosen = currentQuestion.options.find((o) => o.id === selectedOptionId);
    if (chosen?.isCorrect) {
      playStampSuccess();
      setScore((prev) => prev + 100);
    } else {
      playStampFailure();
    }
  };

  const handleNextQuestion = () => {
    playParchmentClick();
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setHasSubmitted(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    playParchmentClick();
    setCurrentIndex(0);
    setSelectedOptionId(null);
    setHasSubmitted(false);
    setScore(0);
    setIsCompleted(false);
  };

  const selectedOption = currentQuestion?.options.find((o) => o.id === selectedOptionId);

  return (
    <section
      id="tantangan-harian"
      className="daily-quest"
      aria-labelledby="daily-quest-title"
    >
      <div className="daily-quest__container">
        {/* Header Kategori Section */}
        <div className="daily-quest__header" data-reveal>
          <div className="daily-quest__badge">
            <span className="daily-quest__badge-dot" aria-hidden="true" />
            <span>
              {locale === 'id' ? 'TANTANGAN HARIAN · 60 DETIK' : 'DAILY EXPEDITION · 60 SECONDS'}
            </span>
          </div>
          <h2 className="daily-quest__title" id="daily-quest-title">
            {locale === 'id'
              ? 'Tantangan Lapangan: Uji Insting Budaya'
              : 'Field Challenge: Test Cultural Instincts'}
          </h2>
          <p className="daily-quest__subtitle">
            {locale === 'id'
              ? 'Tiga studi kasus lapangan menguji ketajaman geografi, adat istiadat, dan etiket sosial Anda di Asia.'
              : 'Three authentic field case studies testing your geography, cultural customs, and social etiquette instincts across Asia.'}
          </p>
        </div>

        {/* Kartu Tantangan Interaktif: Buku Catatan Ekspedisi */}
        {!isCompleted ? (
          <div className="daily-quest__card daily-quest__card--logbook" role="region" aria-label="Buku Catatan Ekspedisi Lapangan">
            {/* Folio Ledger Header */}
            <div className="daily-quest__folio-tab">
              <span className="daily-quest__folio-title">
                {locale === 'id' ? 'BUKU CATATAN EKSPEDISI · ARSIP LAPANGAN' : 'FIELD EXPEDITION PASSPORT · LOGBOOK'}
              </span>
              <span className="daily-quest__folio-code">DOC #EXP-0{currentIndex + 1}</span>
            </div>

            {/* Bar Progres Kuis */}
            <div className="daily-quest__meta-bar">
              <div className="daily-quest__step-indicator">
                <span className="daily-quest__step-current">
                  {locale === 'id'
                    ? `Studi Kasus 0${currentIndex + 1} / 0${QUESTIONS.length}`
                    : `Field Dossier 0${currentIndex + 1} / 0${QUESTIONS.length}`}
                </span>
                <span className="daily-quest__meta-sep">·</span>
                <span className="daily-quest__category">
                  {locale === 'id' ? currentQuestion.category : currentQuestion.categoryEn}
                </span>
              </div>
              <div className="daily-quest__score-pill">
                <svg
                  className="daily-quest__score-icon"
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M8.5 1.5L2.5 9h5l-1 5.5 6-7.5h-5l1-5.5z" />
                </svg>
                <span>{score} XP</span>
              </div>
            </div>

            {/* Teks Pertanyaan */}
            <h3 className="daily-quest__question">
              {locale === 'id' ? currentQuestion.question : currentQuestion.questionEn}
            </h3>

            {/* Daftar Pilihan Jawaban (Border 1px halus, nomor monospaced vintage 01, 02, 03, 04) */}
            <div className="daily-quest__options" role="radiogroup">
              {currentQuestion.options.map((opt, optIndex) => {
                const isSelected = selectedOptionId === opt.id;
                const formattedNum = String(optIndex + 1).padStart(2, '0');
                let optionStateClass = '';
                if (hasSubmitted) {
                  if (opt.isCorrect) {
                    optionStateClass = 'daily-quest__option--correct';
                  } else if (isSelected && !opt.isCorrect) {
                    optionStateClass = 'daily-quest__option--wrong';
                  }
                } else if (isSelected) {
                  optionStateClass = 'daily-quest__option--selected';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    disabled={hasSubmitted}
                    className={`daily-quest__option ${optionStateClass}`}
                    onClick={() => handleSelectOption(opt.id)}
                  >
                    <span className="daily-quest__option-key" aria-hidden="true">
                      {formattedNum}
                    </span>
                    <span className="daily-quest__option-text">
                      {locale === 'id' ? opt.text : opt.textEn}
                    </span>
                    {hasSubmitted && opt.isCorrect && (
                      <span className="daily-quest__option-status" aria-hidden="true">
                        ✓
                      </span>
                    )}
                    {hasSubmitted && isSelected && !opt.isCorrect && (
                      <span className="daily-quest__option-status daily-quest__option-status--wrong" aria-hidden="true">
                        ✕
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Verifikasi Stempel Litograf Timbul & Kartu Telaah Antropologis */}
            {hasSubmitted && selectedOption && (
              <div className="daily-quest__verification" role="status" aria-live="polite">
                <div
                  className={`daily-quest__stamp ${
                    selectedOption.isCorrect
                      ? 'daily-quest__stamp--verified'
                      : 'daily-quest__stamp--rejected'
                  }`}
                >
                  <div className="daily-quest__stamp-frame">
                    <span className="daily-quest__stamp-icon" aria-hidden="true">
                      {selectedOption.isCorrect ? '★' : '✕'}
                    </span>
                    <span className="daily-quest__stamp-label">
                      {selectedOption.isCorrect
                        ? locale === 'id'
                          ? 'STAMP: TERVERIFIKASI'
                          : 'STAMP: VERIFIED AUTHENTIC'
                        : locale === 'id'
                          ? 'STAMP: KELIRU'
                          : 'STAMP: FIELD ANOMALY'}
                    </span>
                  </div>
                  <span className="daily-quest__stamp-sub">
                    {selectedOption.isCorrect
                      ? locale === 'id'
                        ? 'Diverifikasi Kurator Lapangan (+100 XP)'
                        : 'Certified by Field Curator (+100 XP)'
                      : locale === 'id'
                        ? 'Penyimpangan Protokol Lapangan (0 XP)'
                        : 'Protocol Deviation Recorded (0 XP)'}
                  </span>
                </div>

                <div className="daily-quest__anthro-card">
                  <div className="daily-quest__anthro-header">
                    <span className="daily-quest__anthro-mark" aria-hidden="true" />
                    <span className="daily-quest__anthro-kicker">
                      {locale === 'id'
                        ? 'TELAAH ANTROPOLOGIS & KAIDAH BUDAYA'
                        : 'FIELD ANTHROPOLOGICAL ANALYSIS'}
                    </span>
                  </div>
                  <p className="daily-quest__anthro-body">
                    {locale === 'id' ? selectedOption.explanation : selectedOption.explanationEn}
                  </p>
                </div>
              </div>
            )}

            {/* Aksi Navigasi Bawah */}
            <div className="daily-quest__actions">
              {!hasSubmitted ? (
                <button
                  type="button"
                  className="daily-quest__btn-primary"
                  disabled={!selectedOptionId}
                  onClick={handleConfirmAnswer}
                >
                  <span>{locale === 'id' ? 'Periksa Jawaban' : 'Check Answer'}</span>
                </button>
              ) : (
                <div className="daily-quest__action-row">
                  <button
                    type="button"
                    className="daily-quest__btn-primary"
                    onClick={handleNextQuestion}
                  >
                    <span>
                      {currentIndex < QUESTIONS.length - 1
                        ? locale === 'id'
                          ? 'Pertanyaan Selanjutnya →'
                          : 'Next Question →'
                        : locale === 'id'
                          ? 'Selesai & Lihat Skor'
                          : 'Finish & View Score'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="daily-quest__btn-ghost"
                    onClick={() => {
                      playParchmentClick();
                      onExploreCountry?.(currentQuestion.countryCode);
                      navigate('/negara/' + currentQuestion.countryCode);
                    }}
                  >
                    <span>
                      {locale === 'id'
                        ? `Buka Lembar Lapangan: ${currentQuestion.countryName}`
                        : `Open Field Profile: ${currentQuestion.countryNameEn}`}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Layar Hasil Evaluasi Tantangan */
          <div className="daily-quest__result-card" role="region" aria-label="Hasil Tantangan">
            <div className="daily-quest__result-badge">
              <span className="daily-quest__badge-dot" aria-hidden="true" />
              <span>{locale === 'id' ? 'EKSPEDISI TUNTAS' : 'EXPEDITION COMPLETE'}</span>
            </div>
            <h3 className="daily-quest__result-title">
              {score === 300
                ? locale === 'id'
                  ? 'Sempurna! Insting Penjelajah Sejati'
                  : 'Perfect! True Explorer Instincts'
                : score >= 100
                  ? locale === 'id'
                    ? 'Bagus! Wawasan Lapangan Tajam'
                    : 'Well Done! Sharp Cultural Insight'
                  : locale === 'id'
                    ? 'Terus Jelajahi dan Asah Instingmu'
                    : 'Keep Exploring and Sharpening Skills'}
            </h3>
            <div className="daily-quest__result-score">
              <span className="daily-quest__result-number">{score}</span>
              <span className="daily-quest__result-max">/ 300 XP</span>
            </div>
            <p className="daily-quest__result-desc">
              {locale === 'id'
                ? 'Anda telah menyelesaikan 3 studi kasus etiket dan geografi. Seluruh 48 negara kini siap dieksplorasi di peta atlas kartografi.'
                : 'You have completed all 3 cultural case studies. All 48 nations are ready for discovery in the cartographic atlas.'}
            </p>

            <div className="daily-quest__result-buttons">
              <button
                type="button"
                className="daily-quest__btn-primary"
                onClick={() => {
                  playParchmentClick();
                  scrollToSection('#peta');
                }}
              >
                <span>{locale === 'id' ? 'Kembali ke Peta Atlas ↑' : 'Back to Atlas Map ↑'}</span>
              </button>
              <Link
                to="/dashboard"
                className="daily-quest__btn-secondary"
                onClick={() => playParchmentClick()}
              >
                <span>{locale === 'id' ? 'Buka Dashboard Pembelajaran' : 'Open Learning Dashboard'}</span>
              </Link>
              <button
                type="button"
                className="daily-quest__btn-ghost"
                onClick={handleRestart}
              >
                <span>{locale === 'id' ? 'Ulangi Kuis' : 'Retry Quiz'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

import { countries, countryById } from '@/content/countries';
import { COUNTRIES, iso3For } from '@/content/countries48';
import {
  COUNTRY_COORDINATES,
  formatDMS,
  formatDistanceKm,
  haversineDistanceKm,
} from '@/lib/geo-coords';
import type { Locale } from '@/lib/i18n';

export interface CuratedPreset {
  id: string;
  countryA: string;
  countryB: string;
  labelId: string;
  labelEn: string;
  subtitleId: string;
  subtitleEn: string;
}

export const CURATED_PRESETS: readonly CuratedPreset[] = [
  {
    id: 'jp-kr',
    countryA: 'jp',
    countryB: 'kr',
    labelId: 'Jepang vs Korea Selatan',
    labelEn: 'Japan vs South Korea',
    subtitleId: 'Etiket Membungkuk & Konfusianisme',
    subtitleEn: 'Bowing Etiquette & Neo-Confucian Hierarchy',
  },
  {
    id: 'id-my',
    countryA: 'id',
    countryB: 'my',
    labelId: 'Indonesia vs Malaysia',
    labelEn: 'Indonesia vs Malaysia',
    subtitleId: 'Rumpun Nusantara & Adab Melayu',
    subtitleEn: 'Nusantara Heritage & Maritime Malay Decorum',
  },
  {
    id: 'sa-ir',
    countryA: 'sa',
    countryB: 'ir',
    labelId: 'Arab Saudi vs Iran',
    labelEn: 'Saudi Arabia vs Iran',
    subtitleId: 'Hospitalitas Majlis & Jalur Kopi/Teh',
    subtitleEn: 'Majlis Hospitality & Persian Tea/Coffee Traditions',
  },
  {
    id: 'tr-kz',
    countryA: 'tr',
    countryB: 'kz',
    labelId: 'Turki vs Kazakhstan',
    labelEn: 'Turkey vs Kazakhstan',
    subtitleId: 'Jembatan Eurasia & Warisan Steppe',
    subtitleEn: 'Eurasian Crossroads & Steppe Nomad Heritage',
  },
];

export interface PhraseItem {
  native: string;
  latin: string;
  meaning: string;
}

export interface CulturalMatrixEntry {
  countryId: string;
  iso3: string;
  name: string;
  nameLocal: string;
  capital: string;
  region: string;
  coordinates: {
    lat: number;
    lon: number;
    dms: string;
  };
  greeting: {
    gestureName: string;
    gestureDesc: string;
    deferenceLevel: string;
    formalGreeting: string;
    greetingRoman: string;
    greetingMeaning: string;
  };
  dining: {
    utensils: string;
    beverageTradition: string;
    hostHospitality: string;
  };
  philosophy: {
    name: string;
    nativeName: string;
    essence: string;
    description: string;
  };
  language: {
    scriptName: string;
    languageFamily: string;
    officialLanguage: string;
    phrases: {
      hello: PhraseItem;
      thankYou: PhraseItem;
      sorry: PhraseItem;
      farewell: PhraseItem;
    };
  };
}

interface DeepCultureProfile {
  greeting: {
    gestureNameId: string;
    gestureNameEn: string;
    gestureDescId: string;
    gestureDescEn: string;
    deferenceId: string;
    deferenceEn: string;
  };
  dining: {
    utensilsId: string;
    utensilsEn: string;
    beverageId: string;
    beverageEn: string;
    hospitalityId: string;
    hospitalityEn: string;
  };
  philosophy: {
    nameId: string;
    nameEn: string;
    nativeName: string;
    essenceId: string;
    essenceEn: string;
    descId: string;
    descEn: string;
  };
  script: {
    nameId: string;
    nameEn: string;
  };
}

const DEEP_PROFILES: Record<string, DeepCultureProfile> = {
  jp: {
    greeting: {
      gestureNameId: 'Ojigi (お辞儀 · Seni Membungkuk Berderajat)',
      gestureNameEn: 'Ojigi (Art of Hierarchical Bowing)',
      gestureDescId:
        'Bungkukan berderajat: Eshaku (15° sapaan kasual), Keirei (30° rekan kerja/bisnis), dan Saikeirei (45° takzim mendalam/permohonan maaf). Pandangan mata diarahkan ke bawah secara wajar.',
      gestureDescEn:
        'Graded bows: Eshaku (15° casual), Keirei (30° business peers), and Saikeirei (45° profound reverence or sincere apology). Eyes cast modestly downward.',
      deferenceId: 'Keigo (Sonkeigo & Kenjougo) · Senioritas usia dan status profesional mutlak.',
      deferenceEn: 'Keigo honorific tiers · Strict age and institutional seniority.',
    },
    dining: {
      utensilsId:
        'Sumpit kayu (Hashi). Pantangan mutlak menancapkan sumpit tegak di mangkuk nasi (Tsukitate-bashi) karena menyerupai dupa pemakaman, dan pantangan memindahkan makanan antarsumpit (Hashiwatashi).',
      utensilsEn:
        'Wooden chopsticks (Hashi). Strict taboo against sticking chopsticks upright in rice (Tsukitate-bashi) mimicking funerary incense, and passing food chopstick-to-chopstick.',
      beverageId:
        'Sadō (Upacara Teh Matcha Zen). Pantang mengisi cangkir sendiri (Oshaku); selalu tuangkan minuman untuk teman semeja terlebih dahulu.',
      beverageEn:
        'Sadō (Zen Matcha Tea Ritual). Never pour your own drink (Oshaku); always refill your companions’ glasses before receiving hospitality.',
      hospitalityId:
        'Omotenashi (keramahan tulus tanpa pamrih). Wajib melepas alas kaki di genkan sebelum menginjak tatami.',
      hospitalityEn:
        'Omotenashi (selfless hospitality). Outdoor footwear must be removed at the genkan threshold before stepping onto tatami.',
    },
    philosophy: {
      nameId: 'Wabi-Sabi & Meiwaku o Kakenai',
      nameEn: 'Wabi-Sabi & Social Consideration (Meiwaku)',
      nativeName: '侘寂 · 迷惑をかけない',
      essenceId:
        'Menemukan keindahan dalam ketidakkekalan dan kesederhanaan; pantang menyusahkan atau merepotkan ruang publik orang lain.',
      essenceEn:
        'Embracing beauty in imperfection and impermanence; never imposing burden or disruption upon fellow community members.',
      descId:
        'Menjaga keselarasan sosial (Wa) melalui keheningan, ketepatan waktu, dan tanggung jawab penuh terhadap kebersihan lingkungan bersama.',
      descEn:
        'Safeguarding collective harmony (Wa) through punctuality, quiet social restraint, and communal civic stewardship.',
    },
    script: {
      nameId: 'Kanji (Logogram) dipadukan Hiragana & Katakana fonetik',
      nameEn: 'Kanji logograms unified with Hiragana & Katakana syllabaries',
    },
  },
  kr: {
    greeting: {
      gestureNameId: 'Jeol & Insa (절 · 인사 · Bungkukan Hormat & Sujud Keunjeol)',
      gestureNameEn: 'Jeol & Insa (Formal Bowing & Reverential Prostration)',
      gestureDescId:
        'Bungkukan Insa (30°-45°) untuk sapaan harian; dan sujud Keunjeol (lutut menyentuh lantai) di hadapan orang tua dan sesepuh saat perayaan Seollal dan Chuseok.',
      gestureDescEn:
        'Polite Insa bow (30°-45°) for daily interaction; full Keunjeol kneeling prostration before parents and elders during Seollal and Chuseok.',
      deferenceId: 'Bahasa berjenjang tegas: Jondaenmal (ragam santun hormat) vs Banmal (ragam akrab kasual).',
      deferenceEn: 'Rigid linguistic hierarchy: Jondaenmal (honorific speech) vs Banmal (informal familiar).',
    },
    dining: {
      utensilsId:
        'Sujeo (sumpit logam pipih cheotgarak & sendok gagang panjang). Pantangan mengangkat mangkuk nasi dari meja; mangkuk tetap bertumpu di meja saat menyendok.',
      utensilsEn:
        'Sujeo (flat stainless-steel chopsticks & long spoon). Taboo to lift rice bowls off the dining table; bowls remain planted flat on the surface.',
      beverageId:
        'Tata krama menuang minuman berdua: tangan kanan memegang botol, tangan kiri menopang pergelangan/siku. Palingkan wajah ke samping saat minum di depan sesepuh.',
      beverageEn:
        'Two-handed pouring etiquette: right hand pours while left supports wrist/elbow. Turn head sideways when sipping drinks in front of elders.',
      hospitalityId:
        'Jeong (kehangatan ikatan batin). Meja jamuan disajikan bersama puluhan lauk pendamping (banchan) yang dapat ditambah tanpa batas.',
      hospitalityEn:
        'Jeong (deep bonded affection). Abundant banchan side dishes served generously with complimentary unlimited refills.',
    },
    philosophy: {
      nameId: 'Jeong & Nunchi',
      nameEn: 'Jeong (Heartfelt Affinity) & Nunchi',
      nativeName: '정 (情) · 눈치',
      essenceId:
        'Jeong adalah kasih sayang dan rasa persaudaraan tulus tanpa pamrih; Nunchi adalah ketajaman membaca suasana hati dan situasi sosial orang lain.',
      essenceEn:
        'Jeong is deep, selfless communal attachment; Nunchi is the intuitive emotional radar reading others’ unvoiced feelings.',
      descId:
        'Kebersamaan komunal yang kokoh di mana menjaga martabat (kibun) orang lain dan keharmonisan kelompok dipandang sebagai kebajikan moral tertinggi.',
      descEn:
        'Unbreakable community solidarity where preserving a peer’s emotional face (kibun) is the cardinal measure of social intellect.',
    },
    script: {
      nameId: 'Hangul (Aksara fonetik geometris ciptaan Raja Sejong 1443)',
      nameEn: 'Hangul (Scientific feat alphabet promulgated by King Sejong in 1443)',
    },
  },
  id: {
    greeting: {
      gestureNameId: 'Tradisi Salim, Sungkem & Salam Dada',
      gestureNameEn: 'Salim Hand-to-Forehead & Heartfelt Chest Greeting',
      gestureDescId:
        'Menyentuhkan punggung tangan sesepuh ke kening/hidung (salim) memohon berkah kebajikan; serta menempelkan kedua telapak tangan di depan dada dengan senyum tulus.',
      gestureDescEn:
        'Touching elder’s hand to one’s forehead/nose (salim) seeking blessing; accompanied by palms gently touching chest with sincere warmth.',
      deferenceId: 'Sapaan kekeluargaan takzim: Bapak, Ibu, Kakak, Mas, Mbak; mengutamakan sesepuh.',
      deferenceEn: 'Kinship honorifics: Bapak, Ibu, Mas, Mbak; venerating generational seniority.',
    },
    dining: {
      utensilsId:
        'Makan dengan jemari tangan kanan bersih (muluk) atau sendok-garpu. Tangan kiri pantang menyentuh makanan jamuan. Disediakan kobokan air jeruk nipis.',
      utensilsEn:
        'Dining with cleaned right-hand fingertips (muluk) or spoon-fork. Strict prohibition of left hand on shared food. Kobokan bowl provided for washing.',
      beverageId:
        'Kopi tubruk aromatik dan teh melati manis hangat. Disajikan tuan rumah sebagai pertanda pembuka silaturahmi yang ikhlas.',
      beverageEn:
        'Aromatic tubruk coarse coffee and sweet jasmine tea. Served by hosts as the warm inaugural sacrament of honest hospitality.',
      hospitalityId:
        'Gotong royong jamuan kenduri; tamu diperlakukan layaknya sanak saudara sekandung dan pantang membiarkan tamu pulang dengan tangan hampa.',
      hospitalityEn:
        'Kenduri banquet hospitality; guests treated as immediate kin with generous portions, never departing empty-handed.',
    },
    philosophy: {
      nameId: 'Gotong Royong & Tepaselira',
      nameEn: 'Gotong Royong (Mutual Aid) & Tepaselira',
      nativeName: 'Gotong Royong · Tepaselira',
      essenceId:
        'Gotong royong adalah memikul beban bersama tanpa pamrih upah; tepaselira adalah kemampuan menenggang rasa dan menyelami perasaan sesama.',
      essenceEn:
        'Gotong royong is selfless community heavy-lifting; tepaselira is tender empathetic calibration before word or deed.',
      descId:
        'Bhinneka Tunggal Ika: merawat persaudaraan dan toleransi di tengah mozaik ribuan pulau, ratusan tradisi suku, dan kemajemukan keyakinan.',
      descEn:
        'Unity in Diversity: stewarding brotherhood across an equatorial archipelago of 17,000 islands and hundreds of ancestral ethnolinguistic lineages.',
    },
    script: {
      nameId: 'Aksara Latin (Rumi) dibina Badan Bahasa & aksara daerah leluhur',
      nameEn: 'Latin script standardized by Badan Bahasa & indigenous regional scripts',
    },
  },
  my: {
    greeting: {
      gestureNameId: 'Salam Kasih Melayu (Sentuh Dua Tangan ke Dada Kiri)',
      gestureNameEn: 'Malay Salam (Two-Hand Clasp Brought to the Heart)',
      gestureDescId:
        'Kedua telapak tangan saling menyentuh lembut, lalu ditarik ke dada kiri di atas jantung sebagai simbol ketulusan cinta dan keikhlasan persaudaraan.',
      gestureDescEn:
        'Both palms touch gently in mutual clasp, then drawn back to the left chest over the heart, symbolizing heartfelt sincerity and affection.',
      deferenceId: 'Panggilan hormat adat berjenjang: Encik, Puan, Datuk, serta Pak Cik/Mak Cik.',
      deferenceEn: 'Honorific titles: Encik, Puan, Datuk, along with familial Pak Cik and Mak Cik.',
    },
    dining: {
      utensilsId:
        'Jemari tangan kanan menyuap hidangan nasi lemak atau lauk kenduri. Tangan kiri diletakkan di bawah meja dan pantang menyentuh pinggan lauk.',
      utensilsEn:
        'Right hand fingers savoring nasi lemak or banquet delicacies; left hand remains respectfully below table without touching communal dishes.',
      beverageId:
        'Teh Tarik berbusa pekat disajikan di kedai mamak dan kopitiam; simbol ruang inklusif tanpa sekat kelas tempat masyarakat berdialog.',
      beverageEn:
        'Frothy Teh Tarik pulled high in open-air mamak stalls and kopitiams; egalitarian cultural crossroads bridging all social strata.',
      hospitalityId:
        'Konsep Rumah Terbuka (Open House) saat perayaan adat dan hari raya di mana pintu kediaman dibuka lebar bagi tetangga lintas etnis dan agama.',
      hospitalityEn:
        'Open House cultural tradition during festive milestones where home doors swing wide for neighbors across all races and faiths.',
    },
    philosophy: {
      nameId: 'Budi Pekerti & Semangat Muhibah',
      nameEn: 'Budi Pekerti (Noble Decorum) & Muhibah',
      nativeName: 'Budi Pekerti · Semangat Muhibah',
      essenceId:
        'Merendah hati (tawaduk), memelihara air muka orang lain, serta memupuk keharmonisan antar-kaum Melayu, Tionghoa, India, dan Bumiputera.',
      essenceEn:
        'Profound modesty (tawaduk), preserving the dignity of others, and nurturing multi-ethnic harmony across communities.',
      descId:
        'Pepatah leluhur: «Hancur badan dikandung tanah, budi yang baik dikenang jua» — kemuliaan akhlak kekal abadi melampaui usia raga.',
      descEn:
        'Ancestral proverb: "Though flesh returns to soil, noble character echoes forever" — integrity outlives mortal passage.',
    },
    script: {
      nameId: 'Aksara Rumi (Latin) berdampingan dengan Aksara Jawi (Arab-Melayu)',
      nameEn: 'Rumi Latin script co-official with classical Jawi Arabic script',
    },
  },
  sa: {
    greeting: {
      gestureNameId: 'Salam Majlis & Cium Pipi / Hidung (Muqabalah)',
      gestureNameEn: 'Majlis Salutation & Traditional Cheek/Nose Clasp',
      gestureDescId:
        'Ucapan As-salamu alaykum dengan jabat tangan erat tangan kanan, disusul pelukan hangat dan cium pipi/hidung antarkerabat pria, serta cium kening sesepuh.',
      gestureDescEn:
        'As-salamu alaykum greeting with firm right clasp, warm embrace, cheek/nose kiss among close men, and kissing an elder’s forehead.',
      deferenceId: 'Penghormatan kabilah dan sapaan Abu [Anak Sulung], Syaikh, atau Ustadz.',
      deferenceEn: 'Tribal lineage honorifics: Abu [Firstborn], Sheikh, or Ustadh.',
    },
    dining: {
      utensilsId:
        'Makan bersila di atas karpet safrah menggunakan tiga jemari tangan kanan. Makanan disantap bersama dari satu nampan besar (mandi/kabsa).',
      utensilsEn:
        'Dining cross-legged on the safrah floor mat using three right-hand fingers from a single ceremonial kabsa/mandi platter.',
      beverageId:
        'Qahwa Sa’udiyyah (kopi kapulaga & safron) dituangkan dari ceret dallah ke cangkir finjan bersama kurma; goyangkan cangkir bila sudah cukup.',
      beverageEn:
        'Cardamom-saffron Qahwa poured from dallah pots into handle-less finjan cups with dates; gently wiggle cup to signal completion.',
      hospitalityId:
        'Hak Diyafa Gurun: kewajiban menjamu musafir tanpa batas minimal 3 hari tanpa menanyakan urusan pribadi atau identitasnya.',
      hospitalityEn:
        'Sacred Desert Diyafa: hosting any traveling guest for a minimum of 3 days without inquiring about their private business or origin.',
    },
    philosophy: {
      nameId: 'Karam & Muru’ah',
      nameEn: 'Karam (Boundless Generosity) & Muru’ah',
      nativeName: 'كرم · مروءة',
      essenceId:
        'Karam adalah kedermawanan menjamu orang asing tanpa pamrih; Muru’ah adalah integritas kesatria moralitas dan kehormatan janji.',
      essenceEn:
        'Karam is unconditional hospitality toward travelers; Muru’ah is chivalric honor, courage, and moral nobility.',
      descId:
        'Menempatkan kehormatan tamu di atas kebutuhan pribadi tuan rumah; tradisi gurun yang memandang tamu sebagai berkah surga.',
      descEn:
        'Placing the comfort of guests above the host’s own sustenance, deeply rooted in centuries of desert civilization.',
    },
    script: {
      nameId: 'Aksara Arab kaligrafi Naskh, Thuluth, & Diwani (RTL kanan-ke-kiri)',
      nameEn: 'Arabic script in majestic Naskh, Thuluth, & Diwani calligraphic styles',
    },
  },
  ir: {
    greeting: {
      gestureNameId: 'Dast be Sineh (Meletakkan Tangan Kanan di Dada)',
      gestureNameEn: 'Dast be Sineh (Right Palm Placed Over Heart)',
      gestureDescId:
        'Meletakkan telapak tangan kanan di atas dada diiringi sedikit bungkukan hormat dan senyum hangat; antarmahram disertai jabat tangan dan cium pipi.',
      gestureDescEn:
        'Placing right palm over the heart with a courtly bow and warm gaze; close peers exchange two-handed clasps and gentle cheek kisses.',
      deferenceId: 'Gelar takzim sastra: Agha (Tuan) dan Khanoom (Nyonya/Nona) di belakang nama.',
      deferenceEn: 'Literary deference titles: Agha (Sir) and Khanoom (Lady) suffixed to names.',
    },
    dining: {
      utensilsId:
        'Makan di atas sofrah permadani atau meja jamuan dengan sendok-garpu. Tuan rumah selalu bersikeras menyajikan porsi tambahan berulang kali.',
      utensilsEn:
        'Dining atop silk sofrah cloths or formal tables with spoon-fork. Hosts routinely insist on multiple generous second helpings.',
      beverageId:
        'Teh hitam pekat (Chai) disajikan dalam gelas kaca estekan bening; tradisi Ghand-pahloo (menaruh gula batu di antara gigi sebelum meneguk teh) atau kristal Nabat.',
      beverageEn:
        'Strong black Chai served in waist-slender estekan glasses; Ghand-pahloo ritual of placing rock sugar between teeth before sipping, or saffron Nabat crystals.',
      hospitalityId:
        'Ta’arof: seni tata krama penolakan santun berulang kali sebelum menerima jamuan agar tidak terkesan tergesa-gesa atau serakah.',
      hospitalityEn:
        'Ta’arof: subtle ritual etiquette of declining an offering several times before accepting to demonstrate courtly modesty and mutual grace.',
    },
    philosophy: {
      nameId: 'Ta’arof & Farhang',
      nameEn: 'Ta’arof (Courtly Decorum) & Farhang',
      nativeName: 'تعارف · فرهنگ',
      essenceId:
        'Ta’arof adalah seni kesantunan diplomatik dan penghormatan rasa; Farhang adalah kedalaman kebudayaan budi pekerti warisan sastra Persia.',
      essenceEn:
        'Ta’arof is the refined social covenant of mutual deference; Farhang is ancestral cultural sophistication rooted in classical Persian verse.',
      descId:
        'Menghindari benturan ego terbuka dengan memuliakan perasaan lawan bicara, berakar dari kebijaksanaan penyair Sa’di dan Hafez.',
      descEn:
        'Shielding societal dignity from abrasive confrontation, nurtured by the philosophical humanitarian poetry of Sa’di and Hafez.',
    },
    script: {
      nameId: 'Aksara Perso-Arab dengan kelenturan puitis gaya kaligrafi Nastaliq',
      nameEn: 'Perso-Arabic script rendered in fluid, poetic Nastaliq calligraphy',
    },
  },
  tr: {
    greeting: {
      gestureNameId: 'El Öpmek & Pelukan Hangat Dua Pipi',
      gestureNameEn: 'El Öpmek (Hand-Kissing) & Temple-to-Temple Embrace',
      gestureDescId:
        'Mencium punggung tangan sesepuh lalu menyentuhkannya ke kening (el öpmek) saat hari raya; serta sentuhan pelipis kepala antarpria akrab.',
      gestureDescEn:
        'Kissing the back of an elder’s hand and touching it reverently to one’s forehead (el öpmek); temple-to-temple embrace among close peers.',
      deferenceId: 'Panggilan hormat Bey (Tuan) dan Hanım (Nyonya) di belakang nama; Abi & Abla.',
      deferenceEn: 'Deference titles Bey (Mister) and Hanım (Ms.) postfixed; familial Abi and Abla.',
    },
    dining: {
      utensilsId:
        'Garpu di tangan kiri, pisau di tangan kanan. Roti (ekmek) dipandang suci dan pantang ditaruh terbalik atau dibuang sembarangan.',
      utensilsEn:
        'Continental cutlery etiquette. Bread (ekmek) is regarded with sacred esteem, never dropped or placed upside down on the table.',
      beverageId:
        'Çay (teh hitam kental) disajikan dalam gelas berlekuk ramping kuncup tulip (ince belli); serta Türk kahvesi berampas pekat dengan lokum.',
      beverageEn:
        'Çay served in hourglass-curved tulip glasses (ince belli) all day; rich unfiltered Türk kahvesi coffee paired with Turkish delight lokum.',
      hospitalityId:
        'Misafirperverlik: tamu dipandang sebagai «Tanrı misafiri» (Tamu Tuhan); tuan rumah pantang membiarkan tamu membayar sendiri jamuan makan.',
      hospitalityEn:
        'Misafirperverlik: guests honored as "Guests of God" (Tanrı misafiri); hosts strictly forbid guests from paying for dinner at restaurants.',
    },
    philosophy: {
      nameId: 'Misafirperverlik & Keyif',
      nameEn: 'Misafirperverlik & Keyif (Joyful Repose)',
      nativeName: 'Misafirperverlik · Keyif',
      essenceId:
        'Memuliakan musafir sebagai amanah rahmat Ilahi; dan Keyif adalah seni menikmati ketenangan jiwa pada momen saat ini bersama sahabat.',
      essenceEn:
        'Revering travelers as divine blessings; Keyif is the quiet art of savoring the present moment with tranquil mindfulness and camaraderie.',
      descId:
        'Jembatan peradaban Eurasia: kehangatan komunal Anatolia berpadu dengan dinamika keterbukaan kosmopolitan Mediterania.',
      descEn:
        'Eurasian bridge: blending heartland Anatolian warmth with cosmopolitan Mediterranean openness.',
    },
    script: {
      nameId: 'Alfabet Latin Turki (Reformasi 1928 Atatürk dengan Ç, Ğ, İ, Ö, Ş, Ü)',
      nameEn: 'Turkish Latin alphabet (1928 Atatürk reform with diacritics Ç, Ğ, İ, Ö, Ş, Ü)',
    },
  },
  kz: {
    greeting: {
      gestureNameId: 'Körisu & Jabat Erat Dua Belah Tangan',
      gestureNameEn: 'Körisu & Double-Handed Steppe Clasp',
      gestureDescId:
        'Menjabat tangan erat menggunakan kedua belah tangan seraya menundukkan kepala tanda takzim kepada aqsaqal (tetua bijak stepa).',
      gestureDescEn:
        'Firm two-handed clasp with a respectful bow of the head before steppe aqsaqals (wise elder statesmen).',
      deferenceId: 'Penghormatan silsilah tujuh generasi (Zheti Ata); sapaan Aga (abang) dan Apa (kakak).',
      deferenceEn: 'Seven-generation ancestral lineage (Zheti Ata); honorifics Aga and Apa.',
    },
    dining: {
      utensilsId:
        'Melingkari dastarkhan (meja jamuan rendah stepa). Hidangan kehormatan Beshbarmak («lima jari») disantap bersama menggunakan tangan atau sendok kayu.',
      utensilsEn:
        'Gathered around the dastarkhan low table. Ceremonial Beshbarmak ("five fingers") communal platter shared with hands or wooden spoons.',
      beverageId:
        'Shai (teh susu hangat) disajikan dalam piala kese hanya setengah penuh agar tuan rumah bisa terus menuangkannya hangat; tuangan penuh tanda tamu tak diharapkan.',
      beverageEn:
        'Hot milk Shai poured into shallow kese bowls only half-full so host frequently refreshes it piping hot; a full bowl hints the guest should depart.',
      hospitalityId:
        'Qonaqasy: jamuan kehormatan menyembelih domba terbaik untuk musafir yang menempuh perjalanan melintasi padang stepa tak bertepi.',
      hospitalityEn:
        'Qonaqasy: slaughtering the prime sheep to banquet travelers braving the vast expanse of the nomadic Eurasian steppe.',
    },
    philosophy: {
      nameId: 'Qonaqjaylyq & Birlik',
      nameEn: 'Qonaqjaylyq (Nomadic Hospitality) & Birlik',
      nativeName: 'Қонақжайлық · Бірлік',
      essenceId:
        'Hukum suci keramahan yurt terbuka (Qonaqjaylyq); dan Birlik adalah persatuan ketahanan hidup komunal di tengah padang luas.',
      essenceEn:
        'Sacred hospitality law of the open yurt (Qonaqjaylyq); Birlik is the unbreakable unity essential for nomadic survival.',
      descId:
        'Jiwa merdeka bangsa nomad yang menjunjung tinggi sumpah persahabatan, kehormatan kata, dan petikan dawai dombyra pengiring kisah sejarah.',
      descEn:
        'The free spirit of nomadic steppes honoring oath of brotherhood, oral truth, and the soul-stirring storytelling of the two-stringed dombyra.',
    },
    script: {
      nameId: 'Aksara Sirilik Kazakh (dengan huruf Ә, Ғ, Қ, Ң, Ө, Ұ, Ү, Һ, І) & transisi Latin',
      nameEn: 'Kazakh Cyrillic alphabet (featuring unique steppe characters) transitioning to Latin',
    },
  },
  cn: {
    greeting: {
      gestureNameId: 'Gongshou / Zuoyi (Jabat Tangan Lembut & Anggukan)',
      gestureNameEn: 'Gongshou Hand Clasp & Modest Head Nod',
      gestureDescId:
        'Jabat tangan sopan dengan kontak mata lembut; tradisi klasik menangkupkan tangan kanan di dalam telapak tangan kiri di depan dada (Zuoyi).',
      gestureDescEn:
        'Polite handshake with respectful eye contact; classical Zuoyi clasping right fist inside left palm before the chest.',
      deferenceId: 'Penghormatan gelar jabatan dan sapaan Laoshi (Guru), Xiansheng (Tuan), Nüshi.',
      deferenceEn: 'Occupational honorifics: Laoshi (Teacher), Xiansheng (Sir), Nüshi (Madam).',
    },
    dining: {
      utensilsId:
        'Sumpit bambu/kayu (Kuaizi). Pantangan mengetuk mangkuk dengan sumpit (menyerupai pengemis) dan gunakan sumpit saji bersama (Gongkuai).',
      utensilsEn:
        'Bamboo chopsticks (Kuaizi). Taboo to tap bowls (associated with beggars); public serving chopsticks (Gongkuai) used for communal dishes.',
      beverageId:
        'Upacara Teh Gongfu Cha (Oolong/Pu’er). Tradisi mengetuk meja dua jari sebagai tanda terima kasih bisu kepada yang menuangkan teh.',
      beverageEn:
        'Gongfu Cha tea ceremony. Two-finger table tapping ritual signaling silent gratitude while tea is refilled.',
      hospitalityId:
        'Jamuan meja bundar berputar (Lazy Susan) dengan hidangan berlimpah; tuan rumah senantiasa memastikan piring tamu terisi penuh.',
      hospitalityEn:
        'Round table banquets with rotating Lazy Susan; hosts ensure guests’ plates and cups remain abundantly filled throughout the meal.',
    },
    philosophy: {
      nameId: 'Ren (Kebajikan) & Guanxi',
      nameEn: 'Ren (Benevolence) & Social Harmony (Guanxi)',
      nativeName: '仁 · 关系',
      essenceId:
        'Menjaga keselarasan hubungan timbal balik (Guanxi) dan menjaga martabat wajah (Mianzi) antarsesama dalam tatanan masyarakat.',
      essenceEn:
        'Cultivating reciprocal trust networks (Guanxi) and safeguarding communal face and dignity (Mianzi).',
      descId:
        'Etika Konfusianisme yang mengajarkan kebajikan luhur, bakti kepada orang tua (Xiao), dan ketertiban bermasyarakat.',
      descEn:
        'Confucian ethics instilling filial piety (Xiao), societal decorum (Li), and benevolent righteousness (Ren).',
    },
    script: {
      nameId: 'Aksara Hanzi (Karakter Logografis Tradisional & Sederhana)',
      nameEn: 'Hanzi characters (Simplified and Traditional ideographic logograms)',
    },
  },
  in: {
    greeting: {
      gestureNameId: 'Namaste (Pranam Mudra di Depan Dada)',
      gestureNameEn: 'Namaste / Pranam (Anjali Mudra at Heart Center)',
      gestureDescId:
        'Mengatupkan kedua telapak tangan di depan dada disertai sedikit membungkuk dan berucap «Namaste»; serta tradisi menyentuh kaki sesepuh (Charan Sparsh) memohon berkah.',
      gestureDescEn:
        'Folding both palms at chest level with a reverent bow whispering "Namaste"; touching feet of elders (Charan Sparsh) to receive blessing.',
      deferenceId: 'Penghormatan dengan akhiran takzim «-ji» pada nama orang dan sapaan hormat keluarga.',
      deferenceEn: 'Respectful suffix "-ji" appended to names and kinship designations.',
    },
    dining: {
      utensilsId:
        'Menyantap hidangan Thali menggunakan jemari tangan kanan (hanya sampai ruas pertama); tangan kiri pantang menyentuh makanan langsung.',
      utensilsEn:
        'Eating from Thali platters using right-hand fingertips only; left hand strictly refrains from touching food.',
      beverageId:
        'Masala Chai beraroma rempah jahe dan kapulaga; dituangkan panas dari cerek tinggi ke cangkir tembikar kulhad.',
      beverageEn:
        'Spiced Masala Chai with ginger and cardamom; poured steaming hot into earthen clay kulhad cups.',
      hospitalityId:
        'Tuan rumah menyajikan air dingin dan manisan seketika tamu tiba; menolak sajian dianggap meremehkan berkah dewa.',
      hospitalityEn:
        'Guests are welcomed with cool water and sweets immediately upon arrival; refusing hospitality is seen as declining divine favor.',
    },
    philosophy: {
      nameId: 'Atithi Devo Bhava & Dharma',
      nameEn: 'Atithi Devo Bhava (Guest is Divine) & Dharma',
      nativeName: 'अतिथि देवो भव · धर्म',
      essenceId:
        'Tamu diperlakukan laksana perwujudan Dewa (Atithi Devo Bhava); serta hidup selaras dengan kebajikan kosmis (Dharma).',
      essenceEn:
        'The guest is venerated as divine embodiment; life directed by righteous duty and cosmic balance (Dharma).',
      descId:
        'Falsafah Ahimsa (antikekerasan) dan persatuan dalam keberagaman peradaban ribuan bahasa dan tradisi spiritual anak benua.',
      descEn:
        'Ahimsa (non-violence) and civilizational unity embracing immense linguistic and spiritual pluralism.',
    },
    script: {
      nameId: 'Aksara Devanagari bersama ratusan aksara daerah anak benua',
      nameEn: 'Devanagari script alongside diverse classical Indic regional alphabets',
    },
  },
};

export function getCulturalMatrixEntry(countryId: string, locale: Locale): CulturalMatrixEntry {
  const normId = countryId.toLowerCase();
  const cFull = countryById(normId, locale) || countries.find((c) => c.id === normId);
  const iso3 = (cFull?.iso3 || iso3For(normId) || 'IDN').toUpperCase();
  const c48 = COUNTRIES[iso3];

  const coord = COUNTRY_COORDINATES[iso3] || { lat: 0, lon: 0 };
  const dms = formatDMS(coord.lat, coord.lon);

  const isEn = locale === 'en';
  const name = cFull?.nameId || c48?.name || normId.toUpperCase();
  const nameLocal = cFull?.nameLocal || c48?.name || name;
  const capital = c48?.capital || 'Ibu Kota';
  const region = cFull?.region || c48?.region || 'Asia';

  const deep = DEEP_PROFILES[normId];

  // Greeting
  const gestureName = deep
    ? isEn
      ? deep.greeting.gestureNameEn
      : deep.greeting.gestureNameId
    : isEn
      ? 'Traditional Greeting & Deference Bow'
      : 'Sapaan Adat & Gestur Hormat';

  const gestureDesc = deep
    ? isEn
      ? deep.greeting.gestureDescEn
      : deep.greeting.gestureDescId
    : isEn
      ? `Greet companions with formal courtesy and show deference to elders before initiating conversation in ${name}.`
      : `Awali perjumpaan dengan sapaan takzim dan dahulukan menyapa yang lebih tua sebagai wujud tata krama di ${name}.`;

  const deferenceLevel = deep
    ? isEn
      ? deep.greeting.deferenceEn
      : deep.greeting.deferenceId
    : isEn
      ? 'Generational seniority and social hierarchy observed.'
      : 'Penghormatan terhadap garis usia dan senioritas sosial.';

  const formalGreeting = cFull?.greeting?.native || c48?.greet?.text || 'Salam';
  const greetingRoman = cFull?.greeting?.roman || c48?.greet?.latin || 'Salam';
  const greetingMeaning =
    cFull?.greeting?.meaningId || (isEn ? 'Traditional salutation of goodwill' : 'Sapaan selamat dan doa kebajikan');

  // Dining
  const utensils = deep
    ? isEn
      ? deep.dining.utensilsEn
      : deep.dining.utensilsId
    : isEn
      ? 'Observe local dining customs and always use the right hand or dedicated utensils when receiving offerings.'
      : 'Patuhi adab meja makan setempat dan senantiasa gunakan tangan kanan atau sendok bersih saat menerima sajian.';

  const beverageTradition = deep
    ? isEn
      ? deep.dining.beverageEn
      : deep.dining.beverageId
    : isEn
      ? 'Hot tea or coffee poured generously by the host as an honored token of welcome.'
      : 'Teh atau kopi hangat disajikan tuan rumah sebagai tanda pembuka persahabatan yang tulus.';

  const hostHospitality = deep
    ? isEn
      ? deep.dining.hospitalityEn
      : deep.dining.hospitalityId
    : isEn
      ? 'Hospitality treated as an honored duty of the household.'
      : 'Menjamu tamu dipandang sebagai kehormatan sakral keluarga.';

  // Philosophy
  const philName = deep
    ? isEn
      ? deep.philosophy.nameEn
      : deep.philosophy.nameId
    : isEn
      ? 'Communal Harmony & Cultural Virtue'
      : 'Keselarasan Komunal & Budi Pekerti';

  const philNative = deep ? deep.philosophy.nativeName : nameLocal;

  const philEssence = deep
    ? isEn
      ? deep.philosophy.essenceEn
      : deep.philosophy.essenceId
    : isEn
      ? `Cultivating mutual social trust, dignity, and generational respect in ${name}.`
      : `Menjaga kerukunan sosial, martabat keluarga, dan rasa hormat antargenerasi di ${name}.`;

  const philDesc = deep
    ? isEn
      ? deep.philosophy.descEn
      : deep.philosophy.descId
    : isEn
      ? c48?.culture || cFull?.cultureNote || 'Rich civilizational heritage spanning centuries of tradition.'
      : c48?.culture || cFull?.cultureNote || 'Warisan kebudayaan luhur yang dirawat turun-temurun antargenerasi.';

  // Script & Language
  const scriptName = deep
    ? isEn
      ? deep.script.nameEn
      : deep.script.nameId
    : cFull?.language?.script || 'Aksara Resmi Nasional';

  const languageFamily = cFull?.language?.family || 'Rumpun Bahasa Asia';
  const officialLanguage = cFull?.language?.nameId || (c48?.languages ? c48.languages.join(', ') : 'Bahasa Resmi');

  // Phrases extraction
  const pList = cFull?.phrases || [];
  const pThank = pList.find((p) => /terima|thank|syukran/i.test(p.id)) || pList[0];
  const pSorry = pList.find((p) => /maaf|sorry|afwan/i.test(p.id)) || pList[1];
  const pBye = pList.find((p) => /jumpa|bye|selamat|tinggal/i.test(p.id)) || pList[2];

  const phrases = {
    hello: {
      native: formalGreeting,
      latin: greetingRoman,
      meaning: greetingMeaning,
    },
    thankYou: {
      native: pThank?.native || (isEn ? 'Thank you' : 'Terima kasih'),
      latin: pThank?.roman || (isEn ? 'Thank you' : 'Terima kasih'),
      meaning: isEn ? 'Gratitude and recognition' : 'Ungkapan terima kasih dan budi',
    },
    sorry: {
      native: pSorry?.native || (isEn ? 'Pardon me' : 'Mohon maaf'),
      latin: pSorry?.roman || (isEn ? 'Pardon me' : 'Mohon maaf'),
      meaning: isEn ? 'Apology and humble excuse' : 'Permohonan maaf dan kerendahan hati',
    },
    farewell: {
      native: pBye?.native || (isEn ? 'Farewell' : 'Sampai jumpa'),
      latin: pBye?.roman || (isEn ? 'Farewell' : 'Sampai jumpa'),
      meaning: isEn ? 'Peaceful departure wish' : 'Harapan keselamatan bersua kembali',
    },
  };

  return {
    countryId: normId,
    iso3,
    name,
    nameLocal,
    capital,
    region,
    coordinates: {
      lat: coord.lat,
      lon: coord.lon,
      dms,
    },
    greeting: {
      gestureName,
      gestureDesc,
      deferenceLevel,
      formalGreeting,
      greetingRoman,
      greetingMeaning,
    },
    dining: {
      utensils,
      beverageTradition,
      hostHospitality,
    },
    philosophy: {
      name: philName,
      nativeName: philNative,
      essence: philEssence,
      description: philDesc,
    },
    language: {
      scriptName,
      languageFamily,
      officialLanguage,
      phrases,
    },
  };
}

export function calculateDistanceBetweenCountries(
  countryIdA: string,
  countryIdB: string,
  locale: Locale = 'id',
): { km: number; formatted: string } | null {
  const isoA = iso3For(countryIdA);
  const isoB = iso3For(countryIdB);
  if (!isoA || !isoB) return null;

  const coordA = COUNTRY_COORDINATES[isoA];
  const coordB = COUNTRY_COORDINATES[isoB];
  if (!coordA || !coordB) return null;

  const distance = Math.round(
    haversineDistanceKm(coordA.lat, coordA.lon, coordB.lat, coordB.lon),
  );
  return {
    km: distance,
    formatted: formatDistanceKm(distance, locale),
  };
}

export function getAllSelectableCountries(locale: Locale): Array<{ id: string; name: string; iso3: string }> {
  return countries.map((c) => {
    const localized = countryById(c.id, locale);
    return {
      id: c.id,
      name: localized?.nameId || c.nameId,
      iso3: c.iso3.toUpperCase(),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, locale));
}

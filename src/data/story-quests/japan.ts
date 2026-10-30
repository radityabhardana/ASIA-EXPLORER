import type { StoryQuest } from '@/lib/story-quest/types';

export const japanQuest: StoryQuest = {
  id: 'quest-jp',
  countryId: 'jp',
  negara: 'Jepang',
  judul: 'Undangan Makan Malam Pak Tanaka',
  pengantar:
    'Malam ini kamu diundang ke kediaman tradisional keluarga Tanaka di Asakusa, Tokyo. Di rumah berlantai tatami ini, setiap langkah dari pintu masuk hingga jamuan teh mencerminkan konsep "Wa" (keharmonisan) dan "Omotenashi" (keramahan tulus).',
  npc: {
    nama: 'Pak Tanaka',
    peran: 'Tuan Rumah Tradisional',
    avatar: 'PT',
    deskripsi: 'Pria paruh baya yang tenang, teliti, namun sangat ramah bila tamu menghormati tata krama rumah tangga Jepang.',
  },
  bekal: [
    {
      id: 'omiyage',
      nama: 'Oleh-oleh Khas (Omiyage)',
      ikon: 'gift',
      deskripsi: 'Bingkisan kue manis tradisional terbungkus rapi tanpa kertas warna putih polos.',
      kategori: 'oleh-oleh',
    },
    {
      id: 'frasa_itadakimasu',
      nama: 'Catatan Frasa Santun',
      ikon: 'message-square',
      deskripsi: 'Catatan frasa esensial: Itadakimasu, Gochisousama deshita, dan Ojama shimasu.',
      kategori: 'frasa',
    },
    {
      id: 'kaos_bersih',
      nama: 'Kaus Kaki Putih Bersih',
      ikon: 'sparkles',
      deskripsi: 'Kaus kaki baru tanpa lubang atau noda, esensial untuk melangkah di atas lantai tatami.',
      kategori: 'pakaian',
    },
    {
      id: 'meishi',
      nama: 'Kartu Nama Formal (Meishi)',
      ikon: 'credit-card',
      deskripsi: 'Kartu identitas resmi tersimpan di dompet kartu khusus untuk perkenalan takzim.',
      kategori: 'alat',
    },
  ],
  adegan: [
    {
      id: 'scene_genkan',
      latar: 'Pintu Masuk Tradisional (Genkan), Asakusa',
      narasi:
        'Hujan rintik membasahi lampion jalanan Tokyo. Pintu geser kayu terbuka perlahan, memperlihatkan area genkan dengan undakan batu dan lantai kayu di atasnya.',
      dialog: {
        speaker: 'Pak Tanaka',
        teks: 'Irasshaimase! Selamat datang di kediaman kami. Silakan masuk, maaf bila rumah kami sempit.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'jp_c1_genkan_proper',
          teks: 'Lepas sepatu di undakan bawah, putar sepatu menghadap pintu luar, dan ucapkan "Ojama shimasu"',
          respectDelta: 15,
          setFlags: { sopanGenkan: true },
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Oho! Kamu bahkan memutar arah sepatumu menghadap luar. Tata kramamu sungguh luar biasa!',
          },
          catatan: {
            judul: 'Etiket Genkan & Arah Sepatu',
            isi: 'Di Jepang, genkan adalah batas sakral antara dunia luar yang kotor dan ruang dalam yang bersih. Memutar sepatu menghadap pintu memudahkan saat pulang dan menunjukkan ketertiban.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_tatami',
        },
        {
          id: 'jp_c1_genkan_kaoskaki',
          teks: 'Perlihatkan kaus kaki bersihmu yang rapi sambil membungkuk hormat 30 derajat',
          syarat: {
            butuhBekal: ['kaos_bersih'],
            hint: 'Butuh: Kaus Kaki Putih Bersih',
          },
          respectDelta: 20,
          setFlags: { sopanGenkan: true, kausKakiBersih: true },
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Kaus kakimu sangat bersih dan rapi. Tatami kami akan terjaga dengan baik. Silakan naik!',
          },
          catatan: {
            judul: 'Kebersihan Kaki di Rumah Tradisional',
            isi: 'Menginjak tatami dengan telanjang kaki berpeluh atau kaus kaki berlubang dipandang kurang sopan karena serat jerami tatami sangat sensitif terhadap noda dan kelembapan.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_tatami',
        },
        {
          id: 'jp_c1_genkan_salah',
          teks: 'Langsung melangkah naik ke lantai kayu tanpa melepas sepatu basahmu',
          respectDelta: -25,
          setFlags: { sopanGenkan: false },
          reaksi: {
            ekspresi: 'kecewa',
            teks: 'Ah, tunggu! Tolong jangan menginjak lantai kayu dengan sepatu! Genkan ada untuk melepas alas kaki.',
          },
          catatan: {
            judul: 'Pantangan Alas Kaki di Jepang',
            isi: 'Membawa sepatu luar ke area dalam rumah adalah salah satu pelanggaran etiket paling fatal dalam budaya hunian Jepang.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_tatami',
        },
      ],
    },
    {
      id: 'scene_tatami',
      latar: 'Ruang Tamu Berlantai Tatami (Washitsu)',
      narasi:
        'Aroma harum jerami igusa menguar dari tikar tatami. Di sudut ruangan, terdapat ceruk dekorasi tokonoma dengan gulungan kaligrafi indah.',
      dialog: {
        speaker: 'Pak Tanaka',
        teks: 'Silakan duduk di atas bantal zabuton ini. Kami sangat bersyukur atas kunjunganmu.',
        ekspresi: 'netral',
      },
      pilihan: [
        {
          id: 'jp_c2_omiyage_dua_tangan',
          teks: 'Serahkan Omiyage dengan kedua tangan sambil berkata "Tsumaranai mono desu ga..."',
          syarat: {
            butuhBekal: ['omiyage'],
            hint: 'Butuh: Oleh-oleh Khas (Omiyage)',
          },
          respectDelta: 25,
          setFlags: { beriOmiyage: true },
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Ya ampun, kamu membawakan buah tangan! Frasa kerendahan hatimu sangat menyentuh hati kami.',
          },
          catatan: {
            judul: 'Tradisi Omiyage & Kerendahan Hati',
            isi: 'Menyerahkan oleh-oleh dengan kedua tangan diiringi ungkapan kerendahan hati adalah inti etiket bertamu Jepang, menegaskan bahwa niat baik lebih berharga daripada kemewahan bendanya.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'scene_hidangan',
        },
        {
          id: 'jp_c2_tatami_seiza',
          teks: 'Langkahi sambungan kain tatami (heri) dengan hati-hati dan duduk bersimpuh seiza',
          respectDelta: 10,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Kamu tidak menginjak pinggiran tatami kami. Kamu sangat peka terhadap detail rumah Jepang!',
          },
          catatan: {
            judul: 'Menghindari Pinggiran Tatami (Heri)',
            isi: 'Pinggiran kain tatami (heri) sering kali dibordir lambang keluarga atau dibuat dari bahan halus. Menginjaknya dipandang merusak tikar dan tidak menghormati leluhur tuan rumah.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_hidangan',
        },
        {
          id: 'jp_c2_injak_heri',
          teks: 'Menginjak tepian kain tatami dan meletakkan ranselmu langsung di dalam ceruk tokonoma',
          respectDelta: -20,
          reaksi: {
            ekspresi: 'bingung',
            teks: 'Ehm... Tokonoma adalah tempat sakral untuk pajangan seni, mohon tasnya diletakkan di samping dudukmu saja.',
          },
          catatan: {
            judul: 'Kesakralan Ruang Tokonoma',
            isi: 'Tokonoma adalah ceruk estetika spiritual tempat kaligrafi dan ikebana dipajang. Meletakkan barang bawaan di sana dipandang tidak menghargai nilai seni dan kehormatan rumah.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'scene_hidangan',
        },
      ],
    },
    {
      id: 'scene_hidangan',
      latar: 'Meja Makan Rendah (Chabudai), Ruang Keluarga',
      narasi:
        'Nyonya Tanaka menyajikan nampan kayu berisi nasi hangat berkilau, ikan bakar salmon, acar tsukemono, dan sepasang sumpit bambu di atas tatakan hashioki.',
      dialog: {
        speaker: 'Pak Tanaka',
        teks: 'Makanannya sudah siap. Hidangan sederhana ini kami buat khusus untuk menyambut sahabat dari jauh.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'jp_c3_itadakimasu_frasa',
          teks: 'Tangkupkan kedua tangan di depan dada, tundukkan kepala, dan ucapkan "Itadakimasu"',
          syarat: {
            butuhBekal: ['frasa_itadakimasu'],
            hint: 'Butuh: Catatan Frasa Santun',
          },
          respectDelta: 20,
          setFlags: { ucapItadakimasu: true },
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Itadakimasu! Pengucapanmu sangat fasih dan tulus. Selamat menikmati hidangan kami!',
          },
          catatan: {
            judul: 'Makna Sakral "Itadakimasu"',
            isi: 'Secara harfiah bermakna "saya menerima dengan rendah hati". Ucapan ini adalah bentuk syukur kepada alam, petani, nelayan, dan juru masak yang mengorbankan waktu dan bahan demi santapan kita.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'scene_miso_boss',
        },
        {
          id: 'jp_c3_angkat_mangkuk',
          teks: 'Angkat mangkuk nasi dengan tangan kiri mendekati dada saat menyuap dengan sumpit',
          respectDelta: 10,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Bagus sekali! Menopang mangkuk dengan tangan adalah cara makan yang sangat anggun.',
          },
          catatan: {
            judul: 'Mengangkat Mangkuk Nasi (O-chawan)',
            isi: 'Berbeda dari etiket Korea di mana mangkuk tetap di meja, dalam etiket Jepang mangkuk nasi dan sup wajib diangkat ke dekat dada agar makanan tidak jatuh dan postur tubuh tetap tegak.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_miso_boss',
        },
        {
          id: 'jp_c3_tusuk_sumpit',
          teks: 'Tancapkan kedua sumpit tegak lurus di tengah gundukan nasi saat hendak minum air',
          respectDelta: -30,
          reaksi: {
            ekspresi: 'kecewa',
            teks: 'Astaga! Tolong jangan tancapkan sumpit tegak lurus! Letakkan di atas hashioki saja.',
          },
          catatan: {
            judul: 'Pantangan Tsukitate-bashi',
            isi: 'Menancapkan sumpit tegak lurus di nasi (tsukitate-bashi) hanya dilakukan pada ritual pemakaman Buddha di hadapan jenazah. Melakukannya saat makan dipandang sebagai pertanda kesialan besar.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_miso_boss',
        },
      ],
    },
    {
      id: 'scene_miso_boss',
      latar: 'Meja Makan — Mangkuk Sup Miso & Soba Panas',
      timer: 12,
      timeoutChoiceId: 'jp_c4_timeout_panik',
      narasi:
        'SITUASI GENTING: Semangkuk sup miso dan mi soba panas diletakkan di hadapanmu. Uap panas mengepul tanpa sendok di dekatnya. Pak Tanaka menatapmu dengan ramah menunggu reaksimu.',
      dialog: {
        speaker: 'Pak Tanaka',
        teks: 'Sup miso dan soba ini paling nikmat disantap selagi mengepul panas. Silakan dicoba!',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'jp_c4_seruput_mie',
          teks: 'Seruput mi soba dengan suara hisapan tegas ("slurp") dan hirup kuah miso langsung dari bibir mangkuk',
          respectDelta: 20,
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Hahaha! Suara seruputanmu merdu sekali! Di Jepang, itu pujian tertinggi bahwa makanannya lezat!',
          },
          catatan: {
            judul: 'Seni Menyeruput Mi & Sup Miso',
            isi: 'Di Jepang, menyeruput mi (shiru) sengaja memasukkan udara untuk mendinginkan mi panas sekaligus menguapkan aroma kuah ke hidung. Ini tanda bahwa tamu sangat menikmati masakan.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_pamitan',
        },
        {
          id: 'jp_c4_pegang_mangkuk_dua_tangan',
          teks: 'Pegang mangkuk miso dengan kedua belah tangan, gunakan sumpit untuk menahan tahu, lalu sesap perlahan',
          respectDelta: 15,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Cara minum sup yang sangat santun dan tenang. Kehangatannya sampai ke hati.',
          },
          catatan: {
            judul: 'Menikmati Sup Tanpa Sendok',
            isi: 'Mangkuk sup miso Jepang dirancang ergonomis dari kayu atau resin berpernis agar aman dipegang kedua tangan dan diminum langsung tanpa membutuhkan sendok barat.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_pamitan',
        },
        {
          id: 'jp_c4_oper_sumpit',
          teks: 'Jepit sepotong jamur dengan sumpitmu dan operkan langsung ke ujung sumpit Pak Tanaka',
          respectDelta: -30,
          reaksi: {
            ekspresi: 'kecewa',
            teks: 'Jangan! Itu hashi-watashi! Tolong taruh makanannya di piring kecil saya, jangan dari sumpit ke sumpit.',
          },
          catatan: {
            judul: 'Pantangan Hashi-watashi (Oper Sumpit)',
            isi: 'Mengoper makanan dari sumpit ke sumpit (hashi-watashi) menyerupai prosesi pengangkatan serpihan tulang kremasi keluarga ke dalam guci abu. Sangat dilarang dalam meja makan Jepang.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_pamitan',
        },
        {
          id: 'jp_c4_timeout_panik',
          teks: 'Ragu-ragu terdiam hingga kuah dingin dan menetes di atas meja tatami',
          respectDelta: -10,
          reaksi: {
            ekspresi: 'bingung',
            teks: 'Apakah makanannya terlalu panas atau tidak sesuai seleramu? Jangan sungkan meminumnya.',
          },
          catatan: {
            judul: 'Menghargai Kesegaran Hidangan Panas',
            isi: 'Membiarkan masakan hangat mendingin tanpa disentuh dapat disalahartikan sebagai ketidaksukaan terhadap rasa hidangan yang disiapkan tuan rumah.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_pamitan',
        },
      ],
    },
    {
      id: 'scene_pamitan',
      latar: 'Pintu Depan Kediaman Tanaka, Malam Hari',
      narasi:
        'Jamuan makan malam usai. Teh hijau genmaicha hangat telah tandas. Saatnya berpamitan dan mengungkapkan rasa terima kasih atas keramahan yang tak ternilai.',
      dialog: {
        speaker: 'Pak Tanaka',
        teks: 'Waktu berlalu begitu cepat saat kita berbincang hangat. Terima kasih sudah bersedia mampir ke rumah kami.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'jp_c5_gochisousama_frasa',
          teks: 'Letakkan sumpit di hashioki, bungkukkan badan hormat, dan ucapkan "Gochisousama deshita"',
          respectDelta: 20,
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Osomatsusama deshita! Mendengar Gochisousama dari tamuku adalah kebahagiaan terbesar seorang tuan rumah.',
          },
          catatan: {
            judul: 'Makna "Gochisousama Deshita"',
            isi: 'Berasal dari kata "chisou" yang berarti berlari kesana-kemari mengumpulkan bahan masakan. Ungkapan ini mengapresiasi kerja keras tuan rumah yang telah menjamu tamu dengan sepenuh hati.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'jp_c5_bantu_rapikan',
          teks: 'Tawarkan bantuan untuk membawakan mangkuk kosong ke dapur sebelum berpamitan',
          respectDelta: 10,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Tidak perlu repot-repot, kamu adalah tamu kami! Namun niat baikmu sungguh membuat kami tersentuh.',
          },
          catatan: {
            judul: 'Menawarkan Bantuan Saat Bertamu',
            isi: 'Meskipun tuan rumah biasanya akan menolak halus demi melayani tamu sepenuhnya, gesture menawarkan bantuan menunjukkan empati dan kesopanan tinggi.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'jp_c5_langsung_pergi',
          teks: 'Langsung berdiri dan melangkah keluar sambil memainkan ponsel tanpa pamit resmi',
          respectDelta: -25,
          reaksi: {
            ekspresi: 'kecewa',
            teks: 'Ah... kamu terburu-buru sekali ya? Berpamitan dengan sopan adalah penutup sebuah perjumpaan.',
          },
          catatan: {
            judul: 'Etiket Pamitan di Jepang',
            isi: 'Momen berpamitan sama pentingnya dengan penyambutan awal. Tuan rumah sering mengantar tamu hingga ke pintu atau gerbang luar sampai tamu tak terlihat lagi.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    {
      id: 'sahabat',
      minRespect: 80,
      judul: 'Sahabat Sejati Keluarga Tanaka',
      ringkasan:
        'Pak Tanaka tersenyum lebar dan mengantarmu hingga ke belokan jalan. Beliau menghadiahkan sepasang sumpit ukir kayu khas Asakusa dan berkata bahwa pintu rumahnya akan selalu terbuka lebar untukmu kapan pun kamu berkunjung ke Tokyo.',
      badge: 'gold',
    },
    {
      id: 'diterima',
      minRespect: 50,
      judul: 'Tamu Terhormat yang Dihargai',
      ringkasan:
        'Malam yang tenang dan damai. Pak Tanaka mengapresiasi usahamu mempelajari tata krama Jepang. Jamuan berlangsung lancar dan kamu meninggalkan kesan positif sebagai tamu yang santun dan terbuka.',
      badge: 'silver',
    },
    {
      id: 'canggung',
      minRespect: 0,
      judul: 'Malam yang Penuh Pelajaran',
      ringkasan:
        'Beberapa kekeliruan etiket sempat membuat suasana canggung dan kaku. Meskipun demikian, Pak Tanaka tetap menghargai kehadiranmu dan mendoakan keselamatan perjalananmu sambil berpesan agar terus mendalami etiket lokal.',
      badge: 'bronze',
    },
  ],
};

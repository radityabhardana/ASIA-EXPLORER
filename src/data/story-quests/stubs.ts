import type { StoryQuest } from '@/lib/story-quest/types';

// ============================================================================
// 1. INDONESIA (id) — Jamuan Silaturahmi Pak Joko di Yogyakarta
// ============================================================================
export const indonesiaQuest: StoryQuest = {
  id: 'quest-id',
  countryId: 'id',
  negara: 'Indonesia',
  judul: 'Jamuan Silaturahmi Pak Joko',
  pengantar:
    'Kamu berkunjung ke rumah joglo tradisional Pak Joko di Kotagede, Yogyakarta. Di tanah Jawa, tata krama bertamu, penggunaan tangan kanan, dan rasa hormat kepada tetua menjadi fondasi keharmonisan hidup.',
  npc: {
    nama: 'Pak Joko',
    peran: 'Sesepuh Kampung & Perajin Perak',
    avatar: 'PJ',
    deskripsi: 'Pria bersahaja mengenakan surjan lurik dan blangkon Yogyakarta, santun dalam tutur kata dan penuh kebijaksanaan lokal.',
  },
  bekal: [
    { id: 'bakpia', nama: 'Kotak Bakpia Pathok', ikon: 'package', deskripsi: 'Kue khas Yogyakarta bercita rasa manis legit untuk buah tangan.', kategori: 'oleh-oleh' },
    { id: 'frasa_kulo_nuwun', nama: 'Catatan Ungkapan Santun', ikon: 'message-square', deskripsi: 'Ungkapan Kulo nuwun, Monggo, dan Matur nuwun.', kategori: 'frasa' },
    { id: 'batik_sopan', nama: 'Kemeja Batik Lengan Panjang', ikon: 'shirt', deskripsi: 'Pakaian batik bernuansa sopan untuk menghormati tuan rumah.', kategori: 'pakaian' },
    { id: 'amplop_silaturahmi', nama: 'Amplop Tanda Tali Asih', ikon: 'mail', deskripsi: 'Tanda silaturahmi rapi untuk anak-anak keluarga.', kategori: 'uang' },
  ],
  adegan: [
    {
      id: 'id_s1_pendopo',
      latar: 'Pendopo Joglo, Kotagede',
      narasi: 'Lantai ubin terakota pendopo terasa teduh. Pak Joko menyambut di ambang pintu ukir gebyok.',
      dialog: {
        speaker: 'Pak Joko',
        teks: 'Sugeng rawuh! Monggo pinarak, silakan masuk ke ruang dalam.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'id_c1_salam_sopan',
          teks: 'Ucapkan salam santun, jabat tangan dengan tangan kanan ditopang tangan kiri, lalu cium tangan takzim',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Aduh, santun sekali anak muda ini. Budi pekertimu luhur.' },
          catatan: {
            judul: 'Salim & Sungkem dalam Budaya Nusantara',
            isi: 'Mencium tangan atau menopang tangan saat bersalaman kepada orang yang lebih tua adalah wujud takzim sosial paling luhur di Indonesia.',
            kategori: 'Etiket',
          },
          nextSceneId: 'id_s2_teh_poci',
        },
        {
          id: 'id_c1_salam_biasa',
          teks: 'Mengangguk hormat dan menyapa dengan senyum ramah',
          respectDelta: 10,
          reaksi: { ekspresi: 'senang', teks: 'Mari silakan duduk santai di pendopo.' },
          catatan: {
            judul: 'Keramahan Budaya Indonesia',
            isi: 'Senyum dan sapaan ramah adalah pintu pembuka silaturahmi yang universal di seluruh Nusantara.',
            kategori: 'Etiket',
          },
          nextSceneId: 'id_s2_teh_poci',
        },
      ],
    },
    {
      id: 'id_s2_teh_poci',
      latar: 'Meja Bundar Marmer, Ruang Tengah Joglo',
      narasi: 'Secangkir teh nasgitel (panas, legi, kentel) di dalam poci tanah liat disajikan bersama gula batu.',
      dialog: {
        speaker: 'Pak Joko',
        teks: 'Dipun unjuk rumiyin wedang teh pocinya, jangan sungkan-sungkan.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'id_c2_tangan_kanan',
          teks: 'Tunggu tuan rumah mempersilakan, lalu angkat cangkir teh menggunakan tangan kanan sambil mengangguk "Monggo"',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Paham betul etiket minum teh poci Jawa. Nikmat sekali!' },
          catatan: {
            judul: 'Etiket Tangan Kanan & Menunggu Dipersilakan',
            isi: 'Di Indonesia, tangan kanan wajib digunakan saat makan dan minum. Menunggu tuan rumah mempersilakan (monggo) menandakan tamu yang beradab.',
            kategori: 'Makan',
          },
          nextSceneId: 'id_s3_pamitan',
        },
        {
          id: 'id_c2_tangan_kiri',
          teks: 'Langsung meraih cangkir teh dengan tangan kiri sebelum dipersilakan',
          respectDelta: -20,
          reaksi: { ekspresi: 'kecewa', teks: 'Ehm... gunakan tangan kanan ya Nak, itu tangan yang bersih.' },
          catatan: {
            judul: 'Pantangan Tangan Kiri di Nusantara',
            isi: 'Tangan kiri dianggap sebagai tangan untuk bersuci dan tidak pantas digunakan untuk makan, minum, atau memberi barang kepada orang lain.',
            kategori: 'Etiket',
          },
          nextSceneId: 'id_s3_pamitan',
        },
      ],
    },
    {
      id: 'id_s3_pamitan',
      latar: 'Halaman Rumah Berbatu Kerikil, Sore Hari',
      narasi: 'Lonceng gereja dan azan ashar terdengar bersahut-sahutan di kejauhan. Waktunya berpamitan.',
      dialog: {
        speaker: 'Pak Joko',
        teks: 'Matur nuwun sanget atas kunjungannya. Kapan-kapan mampir lagi ya.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'id_c3_pamit_maturnuwun',
          teks: 'Ucapkan "Matur nuwun sanget Pak Joko" sambil membungkukkan badan hormat saat melangkah keluar',
          respectDelta: 15,
          reaksi: { ekspresi: 'kagum', teks: 'Mugi rahayu! Semoga perjalananmu selalu dilindungi Gusti Allah.' },
          catatan: {
            judul: 'Matur Nuwun & Doa Restu',
            isi: 'Mengucapkan terima kasih mendalam (matur nuwun) diakhiri doa keselamatan mempererat persaudaraan yang melampaui sekat wilayah.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'id_c3_pamit_singkat',
          teks: 'Mengucapkan pamit singkat dan melambaikan tangan',
          respectDelta: 5,
          reaksi: { ekspresi: 'netral', teks: 'Hati-hati di jalan ya Nak.' },
          catatan: {
            judul: 'Penutup Silaturahmi',
            isi: 'Berpamitan adalah etiket penting untuk memastikan tuan rumah mengetahui kepulangan tamu dalam keadaan damai.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Keluarga Angkat di Yogyakarta', ringkasan: 'Pak Joko menganggapmu seperti anak sendiri dan membekalimu batik tulis perak khas Kotagede.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Tamu yang Santun & Beradab', ringkasan: 'Silaturahmi berjalan hangat dan penuh kenangan manis tentang keramahan tanah Jawa.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Pembelajaran Budi Pekerti', ringkasan: 'Beberapa kekhilafan etiket menjadi pengingat pentingnya memahami tata krama lokal Nusantara.', badge: 'bronze' },
  ],
};

// ============================================================================
// 2. SINGAPURA (sg) — Etiket Hawker Centre bersama Uncle Tan
// ============================================================================
export const singaporeQuest: StoryQuest = {
  id: 'quest-sg',
  countryId: 'sg',
  negara: 'Singapura',
  judul: 'Petualangan Hawker Centre Uncle Tan',
  pengantar:
    'Kamu diajak makan siang oleh Uncle Tan di Maxwell Food Centre. Di kota metropolitan Singapura, efisiensi waktu, antrean rapi, budaya "chope", dan kepedulian nampan halal/non-halal adalah cermin kohesi sosial.',
  npc: {
    nama: 'Uncle Tan',
    peran: 'Pemandu Kuliner & Pensiunan Guru',
    avatar: 'UT',
    deskripsi: 'Pria ramah berkaos polo bergaris, gemar berbagi cerita sejarah kuliner multikultural Singapura.',
  },
  bekal: [
    { id: 'tisu_chope', nama: 'Bungkus Tisu Saku (Chope)', ikon: 'bookmark', deskripsi: 'Paket tisu saku esensial untuk menandai meja makan di food centre.', kategori: 'alat' },
    { id: 'uang_tunai_pas', nama: 'Uang Pas Dolar Singapura', ikon: 'coins', deskripsi: 'Uang pecahan kecil pas untuk mempercepat antrean gerai makanan.', kategori: 'uang' },
    { id: 'saputangan', nama: 'Saputangan Kain Bersih', ikon: 'shield', deskripsi: 'Kain lap higienis ramah lingkungan.', kategori: 'alat' },
    { id: 'frasa_singlish', nama: 'Catatan Frasa Hawker', ikon: 'message-square', deskripsi: 'Istilah Kopi O, Teh Tarik, Chope, dan Q-ing.', kategori: 'frasa' },
  ],
  adegan: [
    {
      id: 'sg_s1_chope',
      latar: 'Maxwell Food Centre, Chinatown yang Ramai',
      narasi: 'Jam makan siang tiba. Ratusan pengunjung memadati lorong gerai makanan yang harum rempah Hainan dan laksa.',
      dialog: {
        speaker: 'Uncle Tan',
        teks: 'Wah, ramai sekali jam sibuk ini! Coba cari meja kosong dulu sebelum antre memesan makanan.',
        ekspresi: 'netral',
      },
      pilihan: [
        {
          id: 'sg_c1_chope_tisu',
          teks: 'Letakkan sebungkus tisu saku di atas meja kosong untuk menandai tempat duduk ("chope") secara resmi',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Wah! Kamu sudah paham tradisi "chope" Singapura! Sangat efisien!' },
          catatan: {
            judul: 'Budaya "Chope" Tisu di Singapura',
            isi: 'Di hawker centre Singapura, meletakkan bungkus tisu di atas meja diakui sebagai penanda sah bahwa meja tersebut sudah dipesan selagi pembeli antre makanan.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'sg_s2_antre',
        },
        {
          id: 'sg_c1_titip_teman',
          teks: 'Berdiri menunggu di samping meja sambil memberi jalan kepada pengunjung lain yang melintas',
          respectDelta: 10,
          reaksi: { ekspresi: 'senang', teks: 'Bagus, antre dengan tertib tanpa menghalangi jalan orang lain.' },
          catatan: {
            judul: 'Ketertiban Ruang Publik Singapura',
            isi: 'Menjaga ketertiban dan tidak memblokir jalur jalan kaki di pusat jajanan adalah norma mendasar di Singapura.',
            kategori: 'Etiket',
          },
          nextSceneId: 'sg_s2_antre',
        },
      ],
    },
    {
      id: 'sg_s2_antre',
      latar: 'Gerai Nasi Ayam Tian Tian yang Berderet Antre',
      narasi: 'Antrean mengular rapi. Pembeli menyiapkan uang tunai atau kode QR sebelum giliran tiba.',
      dialog: {
        speaker: 'Uncle Tan',
        teks: 'Pesan makananmu dengan cepat ya, agar antrean di belakang kita tidak terhambat.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'sg_c2_bayar_pas',
          teks: 'Sebutkan pesanan dengan lugas dan serahkan uang pas tepat saat giliran tiba',
          respectDelta: 15,
          reaksi: { ekspresi: 'senang', teks: 'Cepat dan tanggap! Penjual dan antrean di belakang pasti berterima kasih.' },
          catatan: {
            judul: 'Efisiensi Waktu di Gerai Makanan',
            isi: 'Singapura sangat menghargai kecepatan dan efisiensi waktu, terutama selama jam makan siang pekerja kantoran yang terbatas.',
            kategori: 'Etiket',
          },
          nextSceneId: 'sg_s3_nampan',
        },
        {
          id: 'sg_c2_menyerobot',
          teks: 'Memotong antrean untuk langsung memesan ke depan etalase',
          respectDelta: -30,
          reaksi: { ekspresi: 'kecewa', teks: 'Hei, jangan menyerobot! Di Singapura kita semua wajib mengantre (Q-ing) dengan adil.' },
          catatan: {
            judul: 'Disiplin Antre (Q-ing Culture)',
            isi: 'Menyerobot antrean di Singapura dipandang sebagai pelanggaran sosial berat yang sangat tidak ditoleransi warga.',
            kategori: 'Etiket',
          },
          nextSceneId: 'sg_s3_nampan',
        },
      ],
    },
    {
      id: 'sg_s3_nampan',
      latar: 'Stasiun Pengembalian Nampan (Tray Return Station)',
      narasi: 'Makan siang tuntas. Di dekat pintu keluar terdapat rak pemulangan nampan berlabel Halal dan Non-Halal.',
      dialog: {
        speaker: 'Uncle Tan',
        teks: 'Selesai makan, jangan lupa bersihkan meja dan bawa nampan piringmu ke stasiun pengembalian.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'sg_c3_kembalikan_nampan_halal',
          teks: 'Bawa nampan dan pisahkan piring ke rak Halal atau Non-Halal sesuai jenis makananmu',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Sangat bertanggung jawab! Kamu menghargai aturan hukum dan sensitivitas agama masyarakat kita.' },
          catatan: {
            judul: 'Aturan Pengembalian Nampan & Rak Halal',
            isi: 'Di Singapura, mengembalikan nampan sendiri wajib hukumnya. Memilah rak Halal dan Non-Halal adalah bentuk penghormatan antarumat beragama.',
            kategori: 'Hierarki',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'sg_c3_tinggal_meja_kotor',
          teks: 'Meninggalkan piring dan sisa makanan berserakan di atas meja',
          respectDelta: -25,
          reaksi: { ekspresi: 'kecewa', teks: 'Tolong jangan ditinggal! Ada denda resmi untuk pengunjung yang tidak memulangkan nampan.' },
          catatan: {
            judul: 'Hukum Kebersihan Hawker Centre',
            isi: 'Meninggalkan nampan kotor sembarangan di hawker centre dapat dikenakan sanksi peringatan hingga denda uang oleh otoritas lingkungan (NEA).',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Warga Kehormatan Hawker Centre', ringkasan: 'Uncle Tan sangat bangga dengan kepekaan sosialmu dan mentraktirmu kopi gu yu (kopi mentega) legendaris.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Pengelana Urban yang Apik', ringkasan: 'Makan siang berjalan menyenangkan dan kamu berhasil merasakan denyut kehidupan kota yang dinamis.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Pelajaran Tata Tertib Kota Singa', ringkasan: 'Aturan perkotaan Singapura yang ketat menuntut adaptasi cepat terhadap etiket ruang bersama.', badge: 'bronze' },
  ],
};

// ============================================================================
// 3. FILIPINA (ph) — Hangatnya Sambutan Tita Maria di Manila
// ============================================================================
export const philippinesQuest: StoryQuest = {
  id: 'quest-ph',
  countryId: 'ph',
  negara: 'Filipina',
  judul: 'Hangatnya Sambutan Tita Maria',
  pengantar:
    'Kamu diundang ke rumah keluarga Tita Maria di pinggiran Quezon City, Manila. Di Filipina, tradisi penghormatan tetua "Mano Po", kehangatan keluarga (Bayanihan), dan jamuan makan melimpah adalah jiwa dari budaya Pinoy.',
  npc: {
    nama: 'Tita Maria',
    peran: 'Bibi Tuan Rumah & Juru Masak Rumah Tangga',
    avatar: 'TM',
    deskripsi: 'Wanita Filipina paruh baya yang penuh tawa, ramah, dan selalu memastikan tamunya makan kenyang.',
  },
  bekal: [
    { id: 'pastillas', nama: 'Kotak Manisan Pastillas', ikon: 'gift', deskripsi: 'Permen susu manis tradisional khas Bulacan untuk bingkisan anak-anak.', kategori: 'oleh-oleh' },
    { id: 'frasa_po', nama: 'Catatan Partikel "Po" & "Opo"', ikon: 'message-square', deskripsi: 'Kata sopan esensial saat berbicara dengan orang yang lebih tua.', kategori: 'frasa' },
    { id: 'payung_manila', nama: 'Payung Lipat Manila', ikon: 'umbrella', deskripsi: 'Pelindung praktis dari hujan tropis mendadak.', kategori: 'alat' },
    { id: 'koin_pamasahe', nama: 'Koin Pecahan Jeepney', ikon: 'coins', deskripsi: 'Uang pas untuk transportasi umum lokal.', kategori: 'uang' },
  ],
  adegan: [
    {
      id: 'ph_s1_mano_po',
      latar: 'Pintu Masuk Rumah Berhias Capiz Shell, Manila',
      narasi: 'Lola (Nenek) dan Tita Maria berdiri di ambang pintu menyambut kedatanganmu dengan senyum lebar.',
      dialog: {
        speaker: 'Tita Maria',
        teks: 'Tuloy po kayo! Silakan masuk ke rumah kami! Mari beri salam dulu kepada Lola.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'ph_c1_mano_po_gesture',
          teks: 'Ambil punggung tangan kanan Lola dengan lembut dan sentuhkan perlahan ke dahimu sambil berucap "Mano po"',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Kaawaan ka ng Diyos! Anak yang sangat berbakti dan tahu adat Pagmamano!' },
          catatan: {
            judul: 'Tradisi Sakral "Mano Po"',
            isi: 'Mano Po adalah gestur meminta berkat dengan menempelkan tangan tetua ke dahi. Ini simbol kerendahan hati dan rasa hormat tertinggi dalam keluarga Filipina.',
            kategori: 'Hierarki',
          },
          nextSceneId: 'ph_s2_jamuan',
        },
        {
          id: 'ph_c1_salam_biasa',
          teks: 'Menundukkan kepala dan mengucapkan salam dengan menyisipkan kata "Po"',
          respectDelta: 10,
          reaksi: { ekspresi: 'senang', teks: 'Salamat po! Senang sekali kamu menghormati orang tua kami.' },
          catatan: {
            judul: 'Penggunaan Kata "Po" dan "Opo"',
            isi: 'Di Filipina, menyisipkan kata "Po" dan "Opo" dalam setiap kalimat kepada orang tua menunjukkan sopan santun verbal yang mendalam.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'ph_s2_jamuan',
        },
      ],
    },
    {
      id: 'ph_s2_jamuan',
      latar: 'Meja Makan Kayu Panjang — Jamuan Chicken Adobo & Sinigang',
      narasi: 'Semangkuk ayam adobo harum bawang putih dan sup asam sinigang mengepul di meja. Tita Maria menyodorkan sepiring nasi putih.',
      dialog: {
        speaker: 'Tita Maria',
        teks: 'Kain po tayo! Jangan malu-malu, makanlah yang banyak sampai kenyang!',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'ph_c2_sendok_garpu_pinoy',
          teks: 'Gunakan sendok di tangan kanan dan garpu di tangan kiri untuk memotong daging dan menyuap nasi dengan anggun',
          respectDelta: 15,
          reaksi: { ekspresi: 'senang', teks: 'Persis seperti cara makan orang Pinoy! Daging adobonya empuk sekali, kan?' },
          catatan: {
            judul: 'Etiket Sendok dan Garpu Filipina',
            isi: 'Masyarakat Filipina umumnya makan nasi menggunakan kombinasi sendok dan garpu, di mana sendok digunakan juga sebagai pemotong lauk yang empuk.',
            kategori: 'Makan',
          },
          nextSceneId: 'ph_s3_pamit',
        },
        {
          id: 'ph_c2_tolak_mentah',
          teks: 'Menolak makanan mentah-mentah dengan alasan sedang diet ketat',
          respectDelta: -25,
          reaksi: { ekspresi: 'kecewa', teks: 'Aduh... padahal kami memasaknya berjam-jam untuk menyambutmu. Cicipi sedikit saja ya?' },
          catatan: {
            judul: 'Keramahan Jamuan Tuan Rumah Pinoy',
            isi: 'Menolak jamuan makan sama sekali di rumah orang Filipina dapat melukai perasaan tuan rumah yang mencurahkan kasih sayangnya lewat hidangan.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'ph_s3_pamit',
        },
      ],
    },
    {
      id: 'ph_s3_pamit',
      latar: 'Gerbang Depan Rumah, Suasana Petang Menjelang Malam',
      narasi: 'Tita Maria membungkuskan sedikit kue bibingka hangat untuk bekal perjalanan pulangmu.',
      dialog: {
        speaker: 'Tita Maria',
        teks: 'Ingat po kayo! Hati-hati di jalan ya, pintu rumah kami selalu terbuka untukmu.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'ph_c3_salam_pamit_tulus',
          teks: 'Terima bekal dengan kedua tangan, ucapkan "Maraming salamat po!", dan peluk hangat tanda kekeluargaan',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Walang anuman! Kamu sudah menjadi bagian dari keluarga kami!' },
          catatan: {
            judul: 'Budaya Kekeluargaan "Bayanihan"',
            isi: 'Bayanihan dan kekeluargaan Filipina menciptakan ikatan hangat yang tulus, di mana tamu yang baik akan selalu dianggap sebagai kerabat sendiri.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'ph_c3_pamit_cepat',
          teks: 'Pamit terburu-buru tanpa menatap mata tuan rumah',
          respectDelta: -10,
          reaksi: { ekspresi: 'bingung', teks: 'Semoga selamat sampai tujuan ya.' },
          catatan: {
            judul: 'Etiket Perpisahan Filipina',
            isi: 'Momen perpisahan di Filipina selalu diliputi kehangatan dan doa keselamatan yang tulus.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Balikbayan Terkasih', ringkasan: 'Tita Maria dan keluarga menganggapmu sebagai keluarga sendiri dan berjanji akan menyambutmu kembali dengan pesta lechon.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Tamu Hangat yang Dikenang', ringkasan: 'Kunjunganmu meninggalkan kesan manis tentang keramahan tanpa pamrih khas kepulauan Filipina.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kasih Sayang Pinoy', ringkasan: 'Pengalaman bertamu membantumu memahami pentingnya membalas ketulusan jamuan keluarga lokal.', badge: 'bronze' },
  ],
};

// ============================================================================
// 4. TIONGKOK (cn) — Upacara Jamuan Teh Master Zhang di Chengdu
// ============================================================================
export const chinaQuest: StoryQuest = {
  id: 'quest-cn',
  countryId: 'cn',
  negara: 'Tiongkok',
  judul: 'Upacara Jamuan Teh Master Zhang',
  pengantar:
    'Kamu diundang ke paviliun teh tradisional Master Zhang di kota Chengdu, Sichuan. Dalam tradisi Tiongkok, tata cara menyeduh teh Gongfu, menjaga "Mianzi" (wajah/kehormatan sosial), dan etiket pertukaran kartu nama adalah seni peradaban ribuan tahun.',
  npc: {
    nama: 'Master Zhang',
    peran: 'Master Teh Gongfu & Kaligrafer',
    avatar: 'MZ',
    deskripsi: 'Pria berwibawa berjubah sutra tradisional, bicaranya lembut namun setiap gerak-geriknya penuh makna filosofis.',
  },
  bekal: [
    { id: 'meishi_cn', nama: 'Kartu Nama Bilingual', ikon: 'credit-card', deskripsi: 'Kartu nama rapi dengan aksara Mandarin di satu sisinya.', kategori: 'alat' },
    { id: 'teh_daun', nama: 'Kaleng Daun Teh Pilihan', ikon: 'coffee', deskripsi: 'Bingkisan daun teh oolong beraroma pegunungan tinggi.', kategori: 'oleh-oleh' },
    { id: 'frasa_xie_xie', nama: 'Catatan Frasa Kerendahan Hati', ikon: 'message-square', deskripsi: 'Frasa Xie xie, Nin hao, dan Bu gan dang.', kategori: 'frasa' },
    { id: 'angpao_merah', nama: 'Amplop Merah Hongbao', ikon: 'mail', deskripsi: 'Amplop merah keberuntungan berisi uang kertas baru.', kategori: 'uang' },
  ],
  adegan: [
    {
      id: 'cn_s1_perkenalan',
      latar: 'Paviliun Teh Bambu, Pinggiran Chengdu',
      narasi: 'Aliran air gemericik di taman batu. Master Zhang berdiri menyambut di depan meja kayu cendana berukir naga.',
      dialog: {
        speaker: 'Master Zhang',
        teks: 'Huan ying! Selamat datang di paviliun kami. Senang sekali bisa berbagi cangkir teh bersamamu.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'cn_c1_kartu_nama_dua_tangan',
          teks: 'Serahkan kartu nama dengan kedua tangan menghadap ke arah Master Zhang sambil membungkuk sedikit',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali. Menyerahkan kartu nama dengan kedua tangan mencerminkan rasa hormat sejati.' },
          catatan: {
            judul: 'Etiket Pertukaran Kartu Nama Tiongkok',
            isi: 'Kartu nama diperlakukan sebagai perpanjangan diri seseorang. Wajib diserahkan dan diterima dengan kedua belah tangan, lalu dibaca sesaat sebelum disimpan rapi.',
            kategori: 'Bisnis',
          },
          nextSceneId: 'cn_s2_tuang_teh',
        },
        {
          id: 'cn_c1_salam_biasa',
          teks: 'Menangkupkan tangan kanan di depan dada dan menyapa "Nin hao"',
          respectDelta: 10,
          reaksi: { ekspresi: 'senang', teks: 'Nin hao! Silakan duduk di meja teh.' },
          catatan: {
            judul: 'Sapaan Santun "Nin Hao"',
            isi: '"Nin" adalah bentuk honorifik dari "Ni" (kamu), digunakan khusus untuk menyapa orang tua, guru, atau tamu yang dihormati.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'cn_s2_tuang_teh',
        },
      ],
    },
    {
      id: 'cn_s2_tuang_teh',
      latar: 'Meja Seduh Teh Gongfu (Cha Pan)',
      narasi: 'Master Zhang menuangkan teh Pu-erh harum ke dalam cangkir porselen kecilmu dari teko tanah liat Yixing.',
      dialog: {
        speaker: 'Master Zhang',
        teks: 'Nikmati keharuman daun teh pertama ini selagi hangat.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'cn_c2_ketuk_jari_terima_kasih',
          teks: 'Ketukkan ujung jari telunjuk dan jari tengah dua kali ke permukaan meja sebagai tanda terima kasih tanpa memotong hening',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Luar biasa! Kamu memahami tradisi mengetuk jari kowtow teh dari zaman Dinasti Qing!' },
          catatan: {
            judul: 'Tradisi Mengetuk Jari (Tea Finger Tap)',
            isi: 'Mengetuk meja dengan dua jari melambangkan gestur membungkuk kowtow untuk berterima kasih kepada penyeduh teh tanpa perlu mengganggu suasana percakapan yang tenang.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'cn_s3_penutup',
        },
        {
          id: 'cn_c2_minum_langsung',
          teks: 'Menenggak teh panas itu sekaligus seperti meminum segelas air putih',
          respectDelta: -20,
          reaksi: { ekspresi: 'bingung', teks: 'Teh Gongfu bukan untuk ditenggak terburu-buru, melainkan disesap perlahan demi menikmati lapisan aromanya.' },
          catatan: {
            judul: 'Filosofi Seni Teh Gongfu',
            isi: 'Gongfu Cha berarti menyeduh teh dengan keterampilan dan kesabaran. Menghirup aroma dan menyesapnya bertahap adalah inti apresiasi teh Tiongkok.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'cn_s3_penutup',
        },
      ],
    },
    {
      id: 'cn_s3_penutup',
      latar: 'Teras Paviliun Teh Menghadap Kebun Bambu',
      narasi: 'Penyeduhan ronde terakhir usai. Aroma daun teh kering meninggalkan rasa manis di pangkal lidah (Hui Gan).',
      dialog: {
        speaker: 'Master Zhang',
        teks: 'Pertemuan yang sangat berharga. Semoga jalan persahabatan kita mengalir panjang seperti aliran air pegunungan.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'cn_c3_ungkapan_syukur_teh',
          teks: 'Tangkupkan tangan, bungkukkan badan hormat, dan puji keahlian seduh Master Zhang dengan tulus',
          respectDelta: 15,
          reaksi: { ekspresi: 'kagum', teks: 'Terima kasih atas apresiasimu. Kamu tamu yang membawa berkah ke paviliun ini.' },
          catatan: {
            judul: 'Konsep Menjaga Kehormatan (Mianzi)',
            isi: 'Memberikan pujian yang tulus di akhir pertemuan mengangkat "wajah" (Mianzi) tuan rumah dan mempererat hubungan persahabatan secara harmonis.',
            kategori: 'Hierarki',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'cn_c3_pamit_biasa',
          teks: 'Mengucapkan terima kasih sederhana dan berpamitan pulang',
          respectDelta: 5,
          reaksi: { ekspresi: 'netral', teks: 'Semoga harimu menyenangkan.' },
          catatan: {
            judul: 'Kesantunan Penutup Jamuan',
            isi: 'Menutup jamuan teh dengan ucapan santun menjaga harmoni sosial antara tamu dan tuan rumah.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Sahabat Sejati Paviliun Teh', ringkasan: 'Master Zhang menghadiahkan gulungan kaligrafi bertuliskan aksara "He" (Harmoni) yang ditulis khusus untukmu.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Tamu Budaya yang Terhormat', ringkasan: 'Kunjunganmu di Chengdu meninggalkan pemahaman mendalam tentang filosofi kesabaran seni teh Tiongkok.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Awal Mengenal Kedalaman Tradisi', ringkasan: 'Kekakuan etiket menyadarkanmu bahwa budaya teh Tiongkok memerlukan kepekaan rasa dan ketenangan batin.', badge: 'bronze' },
  ],
};

// ============================================================================
// 5. KOREA SELATAN (kr) — Jamuan Makan Malam Manajer Park di Seoul
// ============================================================================
export const koreaQuest: StoryQuest = {
  id: 'quest-kr',
  countryId: 'kr',
  negara: 'Korea Selatan',
  judul: 'Jamuan Makan Malam Manajer Park',
  pengantar:
    'Kamu menghadiri jamuan makan malam bersama Manajer Park di kawasan Gangnam, Seoul. Di Korea Selatan, rasa hormat terhadap usia dan kedudukan (K-Etiquette), cara menuangkan minuman, dan etiket alat makan logam sujeo sangat dijunjung tinggi.',
  npc: {
    nama: 'Manajer Park',
    peran: 'Manajer Senior Proyek Kreatif',
    avatar: 'MP',
    deskripsi: 'Pria profesional berjas rapi yang sangat menghargai etika pergaulan dan komitmen kerja sama tim.',
  },
  bekal: [
    { id: 'ginseng_gift', nama: 'Kotak Ekstrak Ginseng Merah', ikon: 'gift', deskripsi: 'Hadiah kesehatan bergengsi untuk tetua atau mitra kerja.', kategori: 'oleh-oleh' },
    { id: 'frasa_korea', nama: 'Catatan Frasa Honorifik', ikon: 'message-square', deskripsi: 'Frasa Annyeonghaseyo, Jal meokgetseumnida, dan Gamsahamnida.', kategori: 'frasa' },
    { id: 'dompet_kartu_kr', nama: 'Dompet Kartu Bisnis Logam', ikon: 'credit-card', deskripsi: 'Wadah rapi untuk bertukar kartu nama secara profesional.', kategori: 'alat' },
    { id: 'permen_mint', nama: 'Permen Mint Penyegar', ikon: 'sparkles', deskripsi: 'Penyegar mulut setelah menikmati hidangan beraroma bawang putih.', kategori: 'oleh-oleh' },
  ],
  adegan: [
    {
      id: 'kr_s1_salam_restoran',
      latar: 'Restoran Tradisional Hanok Modern, Gangnam',
      narasi: 'Manajer Park berdiri menyambut di depan bilik makan berpintu geser hanji.',
      dialog: {
        speaker: 'Manajer Park',
        teks: 'Annyeonghaseyo! Senang sekali bisa bertemu denganmu malam ini. Silakan masuk.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'kr_c1_bow_dua_tangan',
          teks: 'Bungkukkan badan hormat 45 derajat sambil menjabat tangan dengan tangan kanan ditopang tangan kiri di pergelangan',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Cara menyapamu sangat sopan dan memahami hierarki pergaulan Korea.' },
          catatan: {
            judul: 'Etiket Membungkuk & Jabat Tangan Korea',
            isi: 'Di Korea, menopang pergelangan tangan kanan dengan tangan kiri saat bersalaman atau menerima sesuatu dari orang yang lebih tua menunjukkan ketundukan dan kesopanan tinggi.',
            kategori: 'Hierarki',
          },
          nextSceneId: 'kr_s2_minum_tuang',
        },
        {
          id: 'kr_c1_salam_santai',
          teks: 'Melambaikan tangan santai dan langsung duduk mendahului Manajer Park',
          respectDelta: -25,
          reaksi: { ekspresi: 'bingung', teks: 'Ehm... di Korea sebaiknya menunggu orang yang lebih tua atau berkedudukan tinggi duduk terlebih dahulu.' },
          catatan: {
            judul: 'Hierarki Usia & Posisi Duduk',
            isi: 'Norma Konfusianisme Korea mewajibkan menunggu orang tertua atau tuan rumah duduk dan mulai makan sebelum tamu menyentuh makanan.',
            kategori: 'Hierarki',
          },
          nextSceneId: 'kr_s2_minum_tuang',
        },
      ],
    },
    {
      id: 'kr_s2_minum_tuang',
      latar: 'Meja Makan — Botol Minuman Teh Barley & Gelas Kaca',
      narasi: 'Manajer Park mengangkat botol untuk menuangkan minuman ke gelarmu.',
      dialog: {
        speaker: 'Manajer Park',
        teks: 'Biarkan saya tuangkan minuman hangat untukmu.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'kr_c2_pegang_gelas_dua_tangan_palingkan',
          teks: 'Pegang gelas dengan kedua belah tangan saat dituangkan, lalu palingkan wajah sedikit ke samping saat meminumnya',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Luar biasa! Kamu bahkan memalingkan wajah saat minum di depan orang yang lebih tua!' },
          catatan: {
            judul: 'Memalingkan Wajah Saat Minum di Depan Tetua',
            isi: 'Memalingkan wajah ke samping dan menutupi mulut dengan tangan saat minum di depan orang tua/atasan adalah bentuk etiket paling dihormati dalam budaya minum Korea.',
            kategori: 'Etiket',
          },
          nextSceneId: 'kr_s3_sujeo',
        },
        {
          id: 'kr_c2_tuang_minum_sendiri',
          teks: 'Mengabaikan tawaran dan menuang minuman sendiri ke gelasmu',
          respectDelta: -20,
          reaksi: { ekspresi: 'kecewa', teks: 'Di meja makan Korea, kita tidak pernah menuang minuman untuk diri sendiri. Kita saling menuangkan gelas satu sama lain.' },
          catatan: {
            judul: 'Pantangan Menuang Minuman Sendiri',
            isi: 'Menuangkan minuman ke gelas sendiri dipandang egois atau menunjukkan bahwa teman semeja kurang peduli terhadapmu. Budaya meja Korea berlandaskan saling melayani.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'kr_s3_sujeo',
        },
      ],
    },
    {
      id: 'kr_s3_sujeo',
      latar: 'Meja Makan Berisi Samgyeopsal & Sup Kimchi Jjigae',
      narasi: 'Alat makan logam tradisional sujeo (sendok panjang dan sumpit pipih) tertata rapi di samping piring.',
      dialog: {
        speaker: 'Manajer Park',
        teks: 'Makanannya sudah tersaji semua. Mari kita nikmati santap malam ini.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'kr_c3_tunggu_dan_sujeo',
          teks: 'Tunggu Manajer Park mengangkat sendoknya terlebih dahulu, lalu gunakan sendok untuk nasi/sup dan sumpit hanya untuk lauk',
          respectDelta: 15,
          reaksi: { ekspresi: 'senang', teks: 'Jal meokgetseumnida! Selamat makan. Kamu sangat tertib menggunakan sujeo.' },
          catatan: {
            judul: 'Aturan Pemakaian Alat Makan Sujeo',
            isi: 'Di Korea, sendok khusus untuk nasi dan sup, sedangkan sumpit logam pipih hanya untuk mengambil lauk. Keduanya tidak boleh dipegang di satu tangan secara bersamaan.',
            kategori: 'Makan',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'kr_c3_angkat_mangkuk_nasi',
          teks: 'Mengangkat mangkuk nasi dari meja mendekati mulut seperti kebiasaan di Jepang atau Tiongkok',
          respectDelta: -15,
          reaksi: { ekspresi: 'bingung', teks: 'Di Korea, mangkuk nasi tetap diletakkan di atas meja ya, tidak perlu diangkat.' },
          catatan: {
            judul: 'Mangkuk Tetap di Atas Meja',
            isi: 'Berbeda dari Jepang, mengangkat mangkuk nasi dari meja di Korea zaman dahulu dikaitkan dengan kebiasaan pengemis. Gunakan sendok panjang untuk menyuap.',
            kategori: 'Makan',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Mitra Tepercaya di Seoul', ringkasan: 'Manajer Park sangat terkesan dengan tata kramamu dan mengundangmu menghadiri proyek kerja sama jangka panjang di Seoul.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Kolega Santun yang Menyenangkan', ringkasan: 'Santap malam berjalan hangat dan harmonis. Hubungan profesional terjalin dengan saling menghormati.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Pelajaran Tata Krama Harian', ringkasan: 'Kompleksitas etiket usia Korea membukakan wawasan penting tentang rasa hormat dalam interaksi sosial.', badge: 'bronze' },
  ],
};

// ============================================================================
// 6. ARAB SAUDI (sa) — Majlis Tradisional Syaikh Khalid di Riyadh
// ============================================================================
export const saudiQuest: StoryQuest = {
  id: 'quest-sa',
  countryId: 'sa',
  negara: 'Arab Saudi',
  judul: 'Majlis Tradisional Syaikh Khalid',
  pengantar:
    'Kamu diundang ke ruang majlis keluarga Syaikh Khalid di Riyadh. Dalam kebudayaan Arab Saudi, hukum keramahan padang pasir (Karam), tradisi kopi Gahwa dan kurma, serta tata cara duduk di atas permadani majlis memegang nilai kehormatan yang sakral.',
  npc: {
    nama: 'Syaikh Khalid',
    peran: 'Tuan Rumah Majlis & Tokoh Masyarakat',
    avatar: 'SK',
    deskripsi: 'Pria berwibawa mengenakan thobe putih bersih dan ghutrah merah kotak-kotak, memancarkan keramahan hangat khas Jazirah Arab.',
  },
  bekal: [
    { id: 'kurma_ajwa', nama: 'Kotak Kurma Ajwa Premium', ikon: 'package', deskripsi: 'Bingkisan buah kurma berkualitas tinggi untuk tuan rumah.', kategori: 'oleh-oleh' },
    { id: 'frasa_arab', nama: 'Catatan Salam & Syukur Arab', ikon: 'message-square', deskripsi: 'Frasa Assalamu alaikum, Shukran, dan Ahlan wa sahlan.', kategori: 'frasa' },
    { id: 'parfum_oud', nama: 'Minyak Wangi Gaharu (Oud)', ikon: 'feather', deskripsi: 'Aroma wewangian kayu gaharu non-alkohol yang harum semerbak.', kategori: 'oleh-oleh' },
    { id: 'pakaian_sopan_sa', nama: 'Busana Panjang Tertutup', ikon: 'shirt', deskripsi: 'Pakaian sopan menutup lengan dan pergelangan kaki.', kategori: 'pakaian' },
  ],
  adegan: [
    {
      id: 'sa_s1_salam_majlis',
      latar: 'Pintu Masuk Ruang Majlis, Riyadh',
      narasi: 'Lantai beralaskan permadani tebal bermotif geometris. Aroma dupa bakhoor menguar lembut di udara.',
      dialog: {
        speaker: 'Syaikh Khalid',
        teks: 'Ahlan wa sahlan! Assalamu alaikum warahmatullahi wabarakatuh! Selamat datang di majlis kami.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'sa_c1_jawab_salam_lengkap',
          teks: 'Jawab salam dengan lengkap: "Wa alaikumus salam warahmatullahi wabarakatuh", jabat tangan hangat dengan tangan kanan',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Masya Allah! Salam persaudaraan yang indah. Silakan duduk di tempat terbaik majlis.' },
          catatan: {
            judul: 'Kewajiban Membalas Salam Sempurna',
            isi: 'Membalas salam dengan ucapan yang setara atau lebih baik adalah anjuran etiket moral tertinggi di Timur Tengah yang membuka berkah pertemuan.',
            kategori: 'Agama',
          },
          nextSceneId: 'sa_s2_gahwa',
        },
        {
          id: 'sa_c1_salam_singkat',
          teks: 'Menjawab "Salam" singkat dan melangkah masuk',
          respectDelta: 5,
          reaksi: { ekspresi: 'netral', teks: 'Tafaddal, silakan masuk.' },
          catatan: {
            judul: 'Etiket Memasuki Majlis',
            isi: 'Majlis adalah ruang musyawarah dan silaturahmi sosial yang sarat adab penyambutan tamu.',
            kategori: 'Etiket',
          },
          nextSceneId: 'sa_s2_gahwa',
        },
      ],
    },
    {
      id: 'sa_s2_gahwa',
      latar: 'Permadani Majlis — Teko Dallah Kuningan & Kurma',
      narasi: 'Pelayan menuangkan kopi Gahwa kuning keemasan beraroma kapulaga ke cangkir kecil finjan tanpa pegangan.',
      dialog: {
        speaker: 'Syaikh Khalid',
        teks: 'Cicipilah kopi Gahwa Arabika kami bersama kurma manis ini.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'sa_c2_terima_gahwa_kanan_goyang',
          teks: 'Terima cangkir finjan dengan tangan kanan, nikmati bersama kurma, lalu goyangkan pergelangan tangan pelan saat mengembalikan cangkir bila sudah cukup',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Luar biasa! Kamu tahu isyarat menggoyangkan finjan tanda sudah cukup minum kopi!' },
          catatan: {
            judul: 'Isyarat Finjan Kopi Gahwa',
            isi: 'Di Arab Saudi, pelayan akan terus menuangkan kopi Gahwa tanpa henti sampai tamu menggoyang-goyangkan cangkir finjan dengan tangan kanan sebagai tanda halus bahwa ia sudah cukup.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'sa_s3_duduk',
        },
        {
          id: 'sa_c2_terima_kiri',
          teks: 'Menerima cangkir kopi panas dengan tangan kiri',
          respectDelta: -25,
          reaksi: { ekspresi: 'kecewa', teks: 'Bismillah... gunakan tangan kanan ya Akhi. Tangan kanan adalah tangan keberkahan.' },
          catatan: {
            judul: 'Kesucian Tangan Kanan dalam Budaya Arab',
            isi: 'Tangan kiri pantang digunakan untuk makan, minum, atau menyodorkan sesuatu dalam etiket budaya Islam dan Arab.',
            kategori: 'Agama',
          },
          nextSceneId: 'sa_s3_duduk',
        },
      ],
    },
    {
      id: 'sa_s3_duduk',
      latar: 'Bantal Sandaran Majlis di Atas Karpet',
      narasi: 'Percakapan mengalir hangat seputar perjalanan dan keindahan negeri masing-masing.',
      dialog: {
        speaker: 'Syaikh Khalid',
        teks: 'Merupakan kehormatan bagi kami bisa mendengarkan kisah perjalananmu di majlis ini.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'sa_c3_duduk_sopan_hindari_telapak',
          teks: 'Duduk bersila rapi atau bersandar sopan dengan menyembunyikan telapak kaki di balik lipatan kaki',
          respectDelta: 15,
          reaksi: { ekspresi: 'senang', teks: 'Dudukmu sangat santun dan tenang. Kami sangat menghargai adabmu.' },
          catatan: {
            judul: 'Pantangan Menampakkan Telapak Kaki',
            isi: 'Di Timur Tengah, memperlihatkan telapak kaki atau sol sepatu ke arah lawan bicara dipandang menghina karena bagian bawah kaki dianggap kotor.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'sa_c3_selonjor_telapak_ke_tuan_rumah',
          teks: 'Duduk selonjor santai sambil mengarahkan telapak kaki tepat ke arah wajah Syaikh Khalid',
          respectDelta: -30,
          reaksi: { ekspresi: 'kecewa', teks: 'Tolong lipat kakimu ya sahabatku. Menghadapkan telapak kaki ke orang lain kurang pantas di majlis.' },
          catatan: {
            judul: 'Adab Duduk di Majlis',
            isi: 'Menghadapkan telapak kaki ke arah orang yang dihormati adalah tabu besar dalam etiket kesopanan Arab.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Tamu Kehormatan Majlis', ringkasan: 'Syaikh Khalid mengalungkan selendang bisht kehormatan dan menganggapmu sebagai sahabat mulia keluarga besarnya.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Pengelana yang Dihormati', ringkasan: 'Kehangatan keramahan Arab Saudi membekas manis dalam ingatanmu. Kunjungan yang penuh takzim dan persaudaraan.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Padang Pasir', ringkasan: 'Norma kesopanan majlis yang ketat memberimu wawasan mendalam tentang arti sejati dari memuliakan tamu.', badge: 'bronze' },
  ],
};

// ============================================================================
// 7. TURKI (tr) — Keramahan Kedai Teh Usta Emre di Istanbul
// ============================================================================
export const turkeyQuest: StoryQuest = {
  id: 'quest-tr',
  countryId: 'tr',
  negara: 'Turki',
  judul: 'Keramahan Kedai Teh Usta Emre',
  pengantar:
    'Kamu mampir ke kedai teh tradisional milik Usta Emre di dekat Grand Bazaar, Istanbul. Di Turki, teh hitam (Çay) di gelas pinggang ramping berbentuk tulip, tawar-menawar santun, dan keramahan hangat adalah napas kehidupan di persimpangan dua benua.',
  npc: {
    nama: 'Usta Emre',
    peran: 'Pemilik Çay Evi & Pengrajin Kulit',
    avatar: 'UE',
    deskripsi: 'Pria berkumis lebat dengan celemek khas kedai, periang dan suka mengobrol hangat dengan siapa saja yang mampir ke kedainya.',
  },
  bekal: [
    { id: 'lokum_gift', nama: 'Kotak Manisan Turkish Delight (Lokum)', ikon: 'gift', deskripsi: 'Manisan kenyal beraroma mawar dan kacang pistachio.', kategori: 'oleh-oleh' },
    { id: 'frasa_turki', nama: 'Catatan Frasa Keramahan Turki', ikon: 'message-square', deskripsi: 'Frasa Merhaba, Teşekkür ederim, Afiyet olsun, dan Kolay gelsin.', kategori: 'frasa' },
    { id: 'mata_nazar', nama: 'Jimat Kaca Mata Biru (Nazar Boncuğu)', ikon: 'shield', deskripsi: 'Souvenir kaca pelindung dari pandangan dengki.', kategori: 'alat' },
    { id: 'koin_lira', nama: 'Koin Lira Turki Pas', ikon: 'coins', deskripsi: 'Uang receh pas untuk membayar segelas teh panas.', kategori: 'uang' },
  ],
  adegan: [
    {
      id: 'tr_s1_salam_kedai',
      latar: 'Bangku Kayu Kecil di Luar Kedai Çay Evi, Istanbul',
      narasi: 'Lalu lalang pedagang Grand Bazaar terasa ramai. Usta Emre menyeka nampan perak sambil tersenyum ramah.',
      dialog: {
        speaker: 'Usta Emre',
        teks: 'Hoş geldiniz! Selamat datang di Istanbul! Silakan duduk di bangku kayu kecil ini, sahabatku.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'tr_c1_salam_merhaba',
          teks: 'Ucapkan "Hoş bulduk, Merhaba Usta!" dengan meletakkan tangan kanan di dada kiri tanda ketulusan',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Hoş bulduk! Jawaban yang sangat fasih dan hangat. Langsung terasa seperti saudara!' },
          catatan: {
            judul: 'Jawaban Santun "Hoş Bulduk"',
            isi: 'Di Turki, saat tuan rumah menyapa "Hoş geldiniz" (selamat datang), jawaban yang tepat adalah "Hoş bulduk" (kami merasa disambut baik).',
            kategori: 'Bahasa',
          },
          nextSceneId: 'tr_s2_gelas_tulip',
        },
        {
          id: 'tr_s1_salam_santai',
          teks: 'Mengangguk ramah dan tersenyum santai',
          respectDelta: 10,
          reaksi: { ekspresi: 'senang', teks: 'Mari silakan duduk, saya buatkan teh terlezat di distrik ini.' },
          catatan: {
            judul: 'Keramahan Budaya Kedai Teh Turki',
            isi: 'Kedai teh (Çay Evi) di Turki adalah ruang komunal tempat bertukar kabar dan menjalin persaudaraan tanpa memandang latar belakang.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'tr_s2_gelas_tulip',
        },
      ],
    },
    {
      id: 'tr_s2_gelas_tulip',
      latar: 'Meja Bundar Tembaga — Segelas Teh Çay Berbentuk Bunga Tulip',
      narasi: 'Teh merah rubi mengepul di dalam gelas kaca ramping tanpa pegangan, bertengger di atas tatakan porselen dengan sendok kecil.',
      dialog: {
        speaker: 'Usta Emre',
        teks: 'Afiyet olsun! Ini teh terbaik kami. Pegang bibir gelasnya di bagian atas agar jarimu tidak kepanasan.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'tr_c2_pegang_bibir_gelas_sendok_diatas',
          teks: 'Jepit bibir atas gelas dengan ibu jari dan telunjuk, sesap perlahan, dan taruh sendok melintang di atas gelas bila sudah cukup',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Kamu menaruh sendok di atas bibir gelas! Tanda kamu sudah paham isyarat teh Turki!' },
          catatan: {
            judul: 'Isyarat Sendok Teh Melintang di Turki',
            isi: 'Di Turki, tuan rumah akan terus mengisi ulang gelas tehmu. Meletakkan sendok kecil melintang di atas mulut gelas adalah isyarat sopan bahwa kamu sudah kenyang dan cukup minum.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'tr_s3_tawar_santun',
        },
        {
          id: 'tr_c2_tolak_mentah_teh',
          teks: 'Menolak teh tersebut mentah-mentah dengan mengibaskan tangan',
          respectDelta: -20,
          reaksi: { ekspresi: 'kecewa', teks: 'Menolak teh di Turki sama seperti menolak persahabatan, sahabatku...' },
          catatan: {
            judul: 'Sakralnya Tawaran Teh Çay di Turki',
            isi: 'Menawarkan teh adalah gestur pertama persahabatan di Turki. Menolaknya tanpa alasan sopan dipandang sebagai penolakan terhadap iktikad baik tuan rumah.',
            kategori: 'Etiket',
          },
          nextSceneId: 'tr_s3_tawar_santun',
        },
      ],
    },
    {
      id: 'tr_s3_tawar_santun',
      latar: 'Kedai Teh Menjelang Sore — Lonceng Feri Selat Bosphorus',
      narasi: 'Cahaya keemasan menyinari kubah masjid di kejauhan. Saatnya berpamitan dan membayar tagihan teh.',
      dialog: {
        speaker: 'Usta Emre',
        teks: 'Semoga harimu di Istanbul penuh berkah. Terima kasih sudah mampir ke kedai sederhana kami.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'tr_c3_kolay_gelsin',
          teks: 'Serahkan uang pas, ucapkan "Kolay gelsin!" (semoga pekerjaanmu lancar dan mudah) kepada Usta Emre',
          respectDelta: 15,
          reaksi: { ekspresi: 'kagum', teks: 'Sağ ol! Doa yang sangat menyegarkan hati pekerja keras. Datanglah lagi kapan saja!' },
          catatan: {
            judul: 'Ungkapan Ajaib "Kolay Gelsin"',
            isi: '"Kolay gelsin" adalah doa khas Turki kepada siapa pun yang sedang bekerja keras. Mengucapkannya kepada pedagang atau juru masak mencerminkan empati sosial yang tinggi.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'tr_c3_pamit_biasa',
          teks: 'Membayar dan pamit singkat',
          respectDelta: 5,
          reaksi: { ekspresi: 'netral', teks: 'Güle güle, selamat jalan.' },
          catatan: {
            judul: 'Etiket Pamit di Ruang Publik Turki',
            isi: 'Berterima kasih dengan sopan menjaga hubungan baik antara pengelana dan warga lokal.',
            kategori: 'Etiket',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Kardesh (Saudara) di Istanbul', ringkasan: 'Usta Emre menghadiahkan satu set gelas teh tulip cantik dan menyebutmu sebagai saudara kehormatan di Selat Bosphorus.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Pengelana Hangat di Dua Benua', ringkasan: 'Kenikmatan teh Çay dan keramahan warga Istanbul meninggalkan kesan persahabatan yang abadi.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Pelajaran Keramahan Anatolia', ringkasan: 'Memahami makna di balik secangkir teh mengajarimu bahwa kehangatan sosial dibangun lewat perhatian kecil.', badge: 'bronze' },
  ],
};

// ============================================================================
// 8. UZBEKISTAN (uz) — Dastarkhan Megah Aksakal Rustam di Samarkand
// ============================================================================
export const uzbekistanQuest: StoryQuest = {
  id: 'quest-uz',
  countryId: 'uz',
  negara: 'Uzbekistan',
  judul: 'Dastarkhan Megah Aksakal Rustam',
  pengantar:
    'Kamu diundang ke jamuan meja makan dastarkhan milik Aksakal Rustam di Samarkand, kota legendaris Jalur Sutra. Di Uzbekistan, kesucian roti Non, ritual menuang teh tiga kali (Loy, Moy, Choy), dan adab Omin (berdoa bersama) adalah mutiara budaya Asia Tengah.',
  npc: {
    nama: 'Aksakal Rustam',
    peran: 'Tetua Adat (Aksakal) & Pensiunan Sejarawan',
    avatar: 'AR',
    deskripsi: 'Pria sepuh berjanggut putih rapi dengan jubah chapan beludru bersulam emas dan peci doppa khas Samarkand.',
  },
  bekal: [
    { id: 'kismis_samarkand', nama: 'Kotak Kismis Emas & Kacang Kenari', ikon: 'package', deskripsi: 'Buah kering khas Samarkand berkualitas manis premium.', kategori: 'oleh-oleh' },
    { id: 'frasa_uzbek', nama: 'Catatan Frasa Kesantunan Uzbek', ikon: 'message-square', deskripsi: 'Frasa Assalomu alaykum, Rahmat, dan Xush kelibsiz.', kategori: 'frasa' },
    { id: 'peci_doppa', nama: 'Peci Tradisional Doppa', ikon: 'bookmark', deskripsi: 'Peci persegi hitam bermotif cabai putih khas Asia Tengah.', kategori: 'pakaian' },
    { id: 'uang_som_uz', nama: 'Uang Kertas Som Baru', ikon: 'coins', deskripsi: 'Uang kertas rapi dan bersih.', kategori: 'uang' },
  ],
  adegan: [
    {
      id: 'uz_s1_penyambutan',
      latar: 'Halaman Rumah Berhias Mozaik Biru, Samarkand',
      narasi: 'Ubin pirus berkilau di bawah sinar matahari. Aksakal Rustam berdiri di depan pintu berukir kayu kenari.',
      dialog: {
        speaker: 'Aksakal Rustam',
        teks: 'Xush kelibsiz! Assalomu alaykum! Selamat datang di kota Samarkand, mutiara Jalur Sutra.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'uz_c1_salam_tangan_dada',
          teks: 'Letakkan tangan kanan di atas dada kiri, membungkuk takzim, dan ucapkan "Wa alaykum assalom, Aksakal"',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Meletakkan tangan di dada adalah tanda ketulusan hati masyarakat Uzbek.' },
          catatan: {
            judul: 'Salam Tangan di Dada di Uzbekistan',
            isi: 'Di Asia Tengah, meletakkan tangan kanan di dada kiri sambil membungkuk sopan melambangkan bahwa salam yang diucapkan berasal dari lubuk hati terdalam.',
            kategori: 'Etiket',
          },
          nextSceneId: 'uz_s2_roti_non',
        },
        {
          id: 'uz_c1_salam_biasa',
          teks: 'Menyapa ramah dengan senyuman',
          respectDelta: 10,
          reaksi: { ekspresi: 'senang', teks: 'Mari silakan masuk ke ruang dastarkhan.' },
          catatan: {
            judul: 'Keramahan Jalur Sutra',
            isi: 'Tradisi menyambut musafir di Jalur Sutra menempatkan tamu sebagai karunia Tuhan yang wajib dimuliakan.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'uz_s2_roti_non',
        },
      ],
    },
    {
      id: 'uz_s2_roti_non',
      latar: 'Meja Rendah Dastarkhan Penuh Makanan Manis & Buah Kering',
      narasi: 'Di tengah meja terhampar roti bulat pipih (Non/Lepyoshka) bermotif ukiran cap tandir yang wangi semerbak.',
      dialog: {
        speaker: 'Aksakal Rustam',
        teks: 'Roti Non ini baru saja diangkat dari oven tandir tanah liat. Silakan dicicipi.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'uz_c2_robek_roti_dua_tangan_jangan_terbalik',
          teks: 'Robek roti Non menggunakan kedua belah tangan dengan posisi permukaan motif tetap menghadap ke atas (tidak terbalik)',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Masya Allah! Kamu tahu bahwa roti Non pantang ditaruh terbalik dan wajib dirobek dengan dua tangan!' },
          catatan: {
            judul: 'Kesakralan Roti Non di Asia Tengah',
            isi: 'Roti Non dianggap suci di Uzbekistan. Memotongnya dengan pisau dipandang kasar, meletakkannya terbalik dianggap pertanda buruk, dan merobeknya wajib dengan kedua tangan.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'uz_s3_teh_tiga_kali',
        },
        {
          id: 'uz_c2_balik_roti_terbalik',
          teks: 'Membalik roti Non dengan bagian bawah di atas dan memotongnya sembarangan',
          respectDelta: -25,
          reaksi: { ekspresi: 'kecewa', teks: 'Jangan ditaruh terbalik! Roti adalah rezeki suci yang harus selalu menghadap ke atas.' },
          catatan: {
            judul: 'Pantangan Membalik Roti Non',
            isi: 'Meletakkan roti terbalik dipandang sebagai bentuk penghinaan terhadap rezeki dan kerja keras pembuat roti tandir.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'uz_s3_teh_tiga_kali',
        },
      ],
    },
    {
      id: 'uz_s3_teh_tiga_kali',
      latar: 'Meja Dastarkhan — Teko Teh Keramik Pialah Biru',
      narasi: 'Aksakal Rustam menuang teh hijau Kok Choy ke mangkuk pialah kecil, lalu menuangkannya kembali ke teko sebanyak tiga kali.',
      dialog: {
        speaker: 'Aksakal Rustam',
        teks: 'Loy, Moy, Choy... Tiga kali tuangan untuk meratakan rasa teh terbaik bagi tamu kami.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'uz_c3_terima_teh_dua_tangan_amin',
          teks: 'Terima mangkuk teh pialah dengan tangan kanan yang ditopang tangan kiri di dada, lalu usapkan kedua tangan ke wajah (Omin) di akhir doa',
          respectDelta: 20,
          reaksi: { ekspresi: 'kagum', teks: 'Omin! Semoga berkah dan keselamatan menyertaimu di seluruh penjuru Jalur Sutra.' },
          catatan: {
            judul: 'Ritual Teh Tiga Kali & Gestur Omin',
            isi: '"Loy (tanah liat), Moy (mentega), Choy (teh)" adalah tradisi menuang teh 3 kali agar pekat merata. Gestur Omin (mengusap wajah) menandakan rasa syukur atas jamuan.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'uz_c3_minum_tergesa',
          teks: 'Langsung meminum teh tergesa-gesa tanpa menunggu doa bersama selesai',
          respectDelta: -10,
          reaksi: { ekspresi: 'netral', teks: 'Pelan-pelan, nikmatilah ketenangan di dastarkhan ini.' },
          catatan: {
            judul: 'Ketenangan Jamuan Dastarkhan',
            isi: 'Dastarkhan adalah lambang persaudaraan yang menuntut ketenangan, kesabaran, dan rasa syukur bersama.',
            kategori: 'Makan',
          },
          nextSceneId: 'ending',
        },
      ],
    },
  ],
  ending: [
    { id: 'sahabat', minRespect: 80, judul: 'Musafir Terhormat Jalur Sutra', ringkasan: 'Aksakal Rustam menghadiahkan mangkuk keramik pialah biru antik dan berkata namamu akan selalu diingat di Samarkand.', badge: 'gold' },
    { id: 'diterima', minRespect: 50, judul: 'Sahabat Dastarkhan', ringkasan: 'Jamuan makan siang di Samarkand menghadirkan kehangatan tradisi persaudaraan Asia Tengah yang otentik.', badge: 'silver' },
    { id: 'canggung', minRespect: 0, judul: 'Pelajaran Tata Krama Asia Tengah', ringkasan: 'Kekayaan adat istiadat roti dan teh memberimu apresiasi mendalam tentang kesucian rezeki makanan.', badge: 'bronze' },
  ],
};

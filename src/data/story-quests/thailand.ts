import type { StoryQuest } from '@/lib/story-quest/types';

export const thailandQuest: StoryQuest = {
  id: 'quest-th',
  countryId: 'th',
  negara: 'Thailand',
  judul: 'Hangatnya Jamuan Mae Somchai',
  pengantar:
    'Kamu tiba di sebuah desa asri di lereng bukit Chiang Mai dan disambut oleh Mae Somchai di rumah panggung kayunya. Di Negeri Senyuman, salam Wai, kesucian kepala vs pantangan telapak kaki, serta etiket bersantap komunal memegang peranan krusial.',
  npc: {
    nama: 'Mae Somchai',
    peran: 'Ibu Pemilik Homestay & Juru Masak',
    avatar: 'MS',
    deskripsi: 'Wanita Lanna paruh baya yang hangat dan berhati lembut. Menjunjung tinggi kesantunan leluhur dan keselarasan sosial.',
  },
  bekal: [
    {
      id: 'buah_tangan',
      nama: 'Keranjang Buah Segar',
      ikon: 'shopping-bag',
      deskripsi: 'Keranjang anyaman bambu berisi mangga harum manis dan rambutan pilihan yang dihias rapi.',
      kategori: 'oleh-oleh',
    },
    {
      id: 'frasa_sawasdee',
      nama: 'Catatan Salam & Syukur',
      ikon: 'message-square',
      deskripsi: 'Catatan salam sopan: Sawasdee khrap/kha, Khop khun khrap/kha, dan Mai pen rai.',
      kategori: 'frasa',
    },
    {
      id: 'kain_penutup',
      nama: 'Selendang Katun Sopan',
      ikon: 'layers',
      deskripsi: 'Kain tenun tipis untuk menutup bahu atau diletakkan di atas lutut saat duduk bersimpuh.',
      kategori: 'pakaian',
    },
    {
      id: 'koin_sedekah',
      nama: 'Koin Amplop Kebajikan',
      ikon: 'coins',
      deskripsi: 'Koin logam pecahan rapi untuk mengisi kotak kebajikan (tham boon) di kuil desa.',
      kategori: 'uang',
    },
  ],
  adegan: [
    {
      id: 'scene_th_salam',
      latar: 'Halaman Bawah Rumah Panggung Kayu, Chiang Mai',
      narasi:
        'Pohon kamboja putih menebarkan keharuman segar. Dari atas anak tangga kayu rumah panggung, Mae Somchai turun dengan selendang bermotif khas Lanna dan senyum hangat merekah.',
      dialog: {
        speaker: 'Mae Somchai',
        teks: 'Sawasdee ja! Selamat datang di Chiang Mai. Perjalanan dari kota pasti sangat melelahkan, bukan?',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'th_c1_wai_sempurna',
          teks: 'Tangkupkan telapak tangan di depan hidung (Wai hormat kepada tetua), tundukkan kepala, dan ucapkan "Sawasdee khrap/kha"',
          syarat: {
            butuhBekal: ['frasa_sawasdee'],
            hint: 'Butuh: Catatan Salam & Syukur',
          },
          respectDelta: 20,
          setFlags: { waiBenar: true },
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Sawasdee ka! Posisi Waimu sangat indah dan takzim. Senang sekali menyambut tamu yang menghargai adat kami.',
          },
          catatan: {
            judul: 'Tingkatan Salam Wai di Thailand',
            isi: 'Wai kepada orang yang lebih tua atau dihormati dilakukan dengan mempertemukan kedua telapak tangan setinggi hidung dan menundukkan dahi menyentuh ujung ibu jari. Ini simbol penghormatan spiritual.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_th_beranda',
        },
        {
          id: 'th_c1_wai_standar',
          teks: 'Tangkupkan kedua tangan setinggi dada dan mengangguk sopan sambil membalas senyuman',
          respectDelta: 15,
          setFlags: { waiBenar: true },
          reaksi: {
            ekspresi: 'senang',
            teks: 'Senyum yang menyejukkan hati. Mari silakan naik ke beranda atas!',
          },
          catatan: {
            judul: 'Filosofi Senyuman di Thailand',
            isi: 'Thailand dikenal sebagai "Land of Smiles". Senyuman adalah jembatan utama untuk meredakan ketegangan, menunjukkan iktikad damai, dan memulai relasi sosial yang harmonis.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_th_beranda',
        },
        {
          id: 'th_c1_jabat_tangan_barat',
          teks: 'Langsung menyodorkan tangan untuk bersalaman erat dan menepuk bahu Mae Somchai secara santai',
          respectDelta: -20,
          setFlags: { waiBenar: false },
          reaksi: {
            ekspresi: 'bingung',
            teks: 'Oh! Ah... ya, halo... Di sini kami biasanya saling memberi salam Wai daripada bersentuhan fisik.',
          },
          catatan: {
            judul: 'Menghindari Kontak Fisik Spontan',
            isi: 'Masyarakat tradisional Thailand jarang berjabat tangan, terutama antarlawan jenis atau kepada tetua. Menepuk bahu atau memeluk orang yang baru dikenal dipandang terlalu lancang.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_th_beranda',
        },
      ],
    },
    {
      id: 'scene_th_beranda',
      latar: 'Beranda Kayu Terbuka Berlantai Tikar Pandan',
      narasi:
        'Lantai papan kayu jati terasa sejuk di bawah telapak kaki. Di dinding bagian atas, terdapat altar kayu kecil berisi rupang Buddha berhiaskan untaian bunga melati segar.',
      dialog: {
        speaker: 'Mae Somchai',
        teks: 'Silakan duduk di atas tikar pandan ini. Angin sore dari bukit sangat nyaman untuk berbincang.',
        ekspresi: 'netral',
      },
      pilihan: [
        {
          id: 'th_c2_duduk_phapphiap_kain',
          teks: 'Hamparkan selendang di pangkuan dan duduk dengan posisi melipat kedua kaki ke satu sisi (Phap Phiap)',
          syarat: {
            butuhBekal: ['kain_penutup'],
            hint: 'Butuh: Selendang Katun Sopan',
          },
          respectDelta: 20,
          setFlags: { dudukSopan: true },
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Duduk dengan posisi Phap Phiap yang anggun sekali! Kakimu tersembunyi rapi dan sopan.',
          },
          catatan: {
            judul: 'Posisi Duduk Santun Phap Phiap',
            isi: 'Phap Phiap adalah cara duduk tradisional melipat kedua kaki menyamping ke satu sisi. Posisi ini memastikan telapak kaki mengarah ke belakang dan tidak menunjuk ke arah orang lain atau altar suci.',
            kategori: 'Etiket',
          },
          nextSceneId: 'scene_th_hadiah',
        },
        {
          id: 'th_c2_duduk_bersila_aman',
          teks: 'Duduk bersila rapi dengan menarik ujung jari kaki ke bawah paha agar telapak kaki tidak terlihat',
          respectDelta: 10,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Silakan cari posisi yang nyaman. Yang terpenting santai dan betah di rumah kami.',
          },
          catatan: {
            judul: 'Menyembunyikan Telapak Kaki',
            isi: 'Dalam kosmologi budaya Thailand, kaki dianggap bagian tubuh paling rendah secara fisik dan spiritual. Menghadapkan telapak kaki ke arah seseorang adalah penghinaan berat.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'scene_th_hadiah',
        },
        {
          id: 'th_c2_duduk_selonjor_kaki',
          teks: 'Duduk selonjor meluruskan kedua kaki lurus ke depan, menghadap tepat ke arah Mae Somchai dan altar Buddha',
          respectDelta: -30,
          reaksi: {
            ekspresi: 'kecewa',
            teks: 'Aduh, anak muda... Tolong lipat kakimu. Jangan mengarahkan telapak kaki ke arah orang tua dan altar suci!',
          },
          catatan: {
            judul: 'Pantangan Menunjuk dengan Telapak Kaki',
            isi: 'Mengarahkan telapak kaki secara langsung ke orang tua, guru, biksu, atau simbol keagamaan adalah salah satu tabu terbesar dalam etiket kehidupan sehari-hari di Thailand.',
            kategori: 'Agama',
          },
          nextSceneId: 'scene_th_hadiah',
        },
      ],
    },
    {
      id: 'scene_th_hadiah',
      latar: 'Sudut Beranda — Kehadiran Cucu Kecil Mae Somchai',
      narasi:
        'Seorang anak laki-laki kecil bernama Nong Chai (cucu Mae Somchai) berlari kecil menghampiri beranda sambil membawa wadah air minum dingin beraroma daun pandan.',
      dialog: {
        speaker: 'Mae Somchai',
        teks: 'Ini cucu saya, Nong Chai. Dia penasaran ingin berkenalan dengan tamunya yang ramah.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'th_c3_serahkan_buah_tangan',
          teks: 'Serahkan Keranjang Buah Segar dengan tangan kanan yang ditopang tangan kiri di pergelangan',
          syarat: {
            butuhBekal: ['buah_tangan'],
            hint: 'Butuh: Keranjang Buah Segar',
          },
          respectDelta: 20,
          setFlags: { beriBuahTangan: true },
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Mangga dan rambutan segar! Terima kasih banyak, kamu sungguh tamu yang berhati mulia.',
          },
          catatan: {
            judul: 'Etiket Memberi Barang di Thailand',
            isi: 'Memberikan hadiah atau barang kepada orang tua dilakukan dengan tangan kanan, sementara tangan kiri memegang pergelangan tangan kanan sebagai tanda ketulusan dan rasa hormat ganda.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'scene_th_jamuan_boss',
        },
        {
          id: 'th_c3_senyum_anak_tanpa_sentuh',
          teks: 'Tersenyum ramah dan mengatupkan tangan menyapa Nong Chai tanpa menyentuh kepalanya',
          respectDelta: 15,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Nong Chai tersipu malu dan membalas senyumanmu. Kamu memperlakukannya dengan sangat santun.',
          },
          catatan: {
            judul: 'Kesakralan Kepala dalam Budaya Thai',
            isi: 'Kepala dianggap sebagai bagian tubuh paling suci dan tempat bersemayam roh pelindung (Kwan). Menyentuh kepala orang lain—termasuk anak-anak—tanpa izin adalah pelanggaran privasi spiritual.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'scene_th_jamuan_boss',
        },
        {
          id: 'th_c3_elus_kepala_anak',
          teks: 'Menepuk dan mengacak-acak rambut kepala anak kecil itu dengan gemas ala kebiasaan barat',
          respectDelta: -25,
          reaksi: {
            ekspresi: 'kecewa',
            teks: 'Tolong jangan sentuh kepala anak kami! Kepala adalah mahkota sakral yang tidak boleh disentuh sembarangan.',
          },
          catatan: {
            judul: 'Pantangan Menyentuh Kepala',
            isi: 'Meskipun berniat menunjukkan kasih sayang, menyentuh kepala di Thailand sangat dihindari karena kepala adalah bagian tubuh terhormat yang paling sakral.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'scene_th_jamuan_boss',
        },
      ],
    },
    {
      id: 'scene_th_jamuan_boss',
      latar: 'Meja Bundar Rotan — Jamuan Tom Yum & Som Tum Pedas',
      timer: 12,
      timeoutChoiceId: 'th_c4_timeout_panik',
      narasi:
        'SITUASI GENTING: Hidangan Tom Yum Goong merah menyala, salad pepaya Som Tum, dan keranjang ketan khao niao tersaji. Di samping piringmu tersedia sendok logam dan garpu. Mae Somchai mempersilakanmu bersantap.',
      dialog: {
        speaker: 'Mae Somchai',
        teks: 'Gin khao gun! Mari makan bersama selagi hangat. Coba cicipi Tom Yum asam pedas ini.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'th_c4_sendok_garpu_benar',
          teks: 'Pegang sendok di tangan kanan untuk menyuap makanan ke mulut, dan gunakan garpu di tangan kiri HANYA untuk mendorong lauk',
          respectDelta: 20,
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Luar biasa! Kamu tahu persis bahwa garpu tidak pernah dimasukkan langsung ke dalam mulut di Thailand!',
          },
          catatan: {
            judul: 'Fungsi Sendok & Garpu di Thailand',
            isi: 'Diperkenalkan oleh Raja Rama V, etiket makan Thailand menetapkan sendok di tangan kanan sebagai alat suap utama, sedangkan garpu di tangan kiri semata-mata pendorong makanan ke atas sendok.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_th_pamitan',
        },
        {
          id: 'th_c4_nasi_ketan_tangan',
          teks: 'Ambil sejumput nasi ketan (khao niao), bentuk bulatan kecil dengan jari tangan kanan, lalu cocol ke kuah lauk',
          respectDelta: 15,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Benar sekali! Menikmati khao niao dengan jari tangan kanan adalah tradisi sejati masyarakat Thailand Utara!',
          },
          catatan: {
            judul: 'Seni Makan Nasi Ketan (Khao Niao)',
            isi: 'Di kawasan Isan dan Thailand Utara, nasi ketan disantap dengan mengepal bulatan kecil menggunakan ujung jari tangan kanan. Tangan kiri tidak boleh menyentuh makanan karena dianggap tangan higienis toilet.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_th_pamitan',
        },
        {
          id: 'th_c4_tusuk_makan_dengan_garpu',
          teks: 'Menusuk sepotong udang dengan garpu lalu memasukkan garpu besi itu langsung ke dalam mulutmu',
          respectDelta: -20,
          reaksi: {
            ekspresi: 'bingung',
            teks: 'Ah... kamu memasukkan garpu ke mulut? Di sini garpu hanya untuk mendorong makanan ke atas sendok.',
          },
          catatan: {
            judul: 'Pantangan Menggunakan Garpu untuk Menyuap',
            isi: 'Memasukkan garpu langsung ke dalam mulut dipandang kasar dan kurang beradab dalam etiket meja makan Thailand modern, kecuali untuk hidangan buah potong bersate kecil.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_th_pamitan',
        },
        {
          id: 'th_c4_timeout_panik',
          teks: 'Bingung menatap alat makan hingga kuah Tom Yum mendingin dan minyaknya mengendap',
          respectDelta: -10,
          reaksi: {
            ekspresi: 'bingung',
            teks: 'Ada apa? Apakah baunya terlalu pedas untukmu? Jangan takut mencoba, rasanya sangat kaya bumbu.',
          },
          catatan: {
            judul: 'Menghargai Kehangatan Sup Tom Yum',
            isi: 'Sup asam pedas Tom Yum dirancang untuk dinikmati panas-panas demi menyerap aroma rempah serai, lengkuas, dan daun jeruk purut secara optimal.',
            kategori: 'Makan',
          },
          nextSceneId: 'scene_th_pamitan',
        },
      ],
    },
    {
      id: 'scene_th_pamitan',
      latar: 'Halaman Depan Rumah Homestay, Senja Hari',
      narasi:
        'Sinar matahari senja keemasan menyapu perbukitan Chiang Mai. Jamuan makan malam telah usai dan suasana persahabatan terasa begitu akrab.',
      dialog: {
        speaker: 'Mae Somchai',
        teks: 'Malam mulai larut. Terima kasih sudah menjadi tamu yang sangat membahagiakan bagi keluarga kami hari ini.',
        ekspresi: 'senang',
      },
      pilihan: [
        {
          id: 'th_c5_wai_puji_masakan',
          teks: 'Lakukan salam Wai khidmat dan katakan "Khop khun mak khrap/kha, aroi mak mak!" (Terima kasih, masakan Mae lezat sekali!)',
          respectDelta: 20,
          reaksi: {
            ekspresi: 'kagum',
            teks: 'Yindee ka! Senang sekali mendengarnya. Perjalananmu di Thailand pasti akan diberkahi banyak sahabat.',
          },
          catatan: {
            judul: 'Pujian Tulus Juru Masak (Aroi Mak)',
            isi: 'Memuji kelezatan masakan tuan rumah (aroi mak) sambil melakukan salam Wai perpisahan adalah salah satu bentuk etiket pergaulan paling dihargai di seluruh Thailand.',
            kategori: 'Bahasa',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'th_c5_pamitan_hangat',
          teks: 'Sampaikan ucapan terima kasih tulus dan doakan kesehatan bagi seluruh anggota keluarga Mae Somchai',
          respectDelta: 15,
          reaksi: {
            ekspresi: 'senang',
            teks: 'Doa yang sangat indah. Semoga perjalanan keliling duniamu selalu dilimpahi keselamatan.',
          },
          catatan: {
            judul: 'Budaya Berkah & Keramahan Tamu',
            isi: 'Mendoakan kesehatan dan keberkahan tuan rumah mempererat ikatan kekerabatan spiritual yang melampaui batas kebangsaan.',
            kategori: 'Tradisi',
          },
          nextSceneId: 'ending',
        },
        {
          id: 'th_c5_tinggalkan_uang_tip_kasar',
          teks: 'Mengeluarkan uang kertas kusut dan melemparkannya ke atas meja makan sebagai tip tanpa pamitan',
          respectDelta: -25,
          reaksi: {
            ekspresi: 'kecewa',
            teks: 'Kami menyambutmu sebagai tamu keluarga, bukan pelanggan warung. Uang ini tolong kamu simpan kembali.',
          },
          catatan: {
            judul: 'Batas Keramahan Tuan Rumah vs Transaksional',
            isi: 'Memperlakukan jamuan rumah tangga pribadi seperti restoran komersial dengan melempar tip tanpa basa-basi dipandang merendahkan keikhlasan tuan rumah yang menjamu dengan kasih sayang.',
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
      judul: 'Kerabat Angkat di Chiang Mai',
      ringkasan:
        'Mae Somchai terharu oleh kesantunan dan ketulusanmu. Sebelum berpisah, beliau mengikatkan benang suci sai sin berwarna putih di pergelangan tanganmu sebagai doa keselamatan dan berkah, serta menganggapmu sebagai keluarga angkat.',
      badge: 'gold',
    },
    {
      id: 'diterima',
      minRespect: 50,
      judul: 'Tamu Ramah yang Dinanti',
      ringkasan:
        'Kunjungan yang penuh tawa dan kehangatan. Mae Somchai mengapresiasi usahamu menghormati adat istiadat Thailand Utara dan membekalimu sebungkus keripik buah khas desa untuk teman perjalananmu.',
      badge: 'silver',
    },
    {
      id: 'canggung',
      minRespect: 0,
      judul: 'Pengalaman Belajar yang Berharga',
      ringkasan:
        'Beberapa kekeliruan etiket seperti posisi duduk dan kontak fisik sempat mengejutkan tuan rumah. Kendati demikian, keramahan khas Thailand tetap terjaga dan pengalaman ini membuka matamu tentang dalamnya etiket Negeri Senyuman.',
      badge: 'bronze',
    },
  ],
};

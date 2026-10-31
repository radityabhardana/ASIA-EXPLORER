export const southeastAsiaQuests = [
  // 1. MALAYSIA (my)
  {
    varName: 'malaysiaQuest',
    data: {
      id: 'quest-my',
      countryId: 'my',
      negara: 'Malaysia',
      judul: 'Jamuan Rumah Panggung Encik Faizal',
      pengantar: 'Kamu berkunjung ke rumah panggung Melayu tradisional Encik Faizal di Kampung Baru. Di Malaysia, kesantunan bertamu, salam dua tangan menangkup, dan adab menunjuk dengan ibu jari adalah cermin keluhuran budi pekerti rumpun Melayu.',
      npc: {
        nama: 'Encik Faizal',
        peran: 'Guru Silat & Tokoh Adat Kampung',
        avatar: 'EF',
        deskripsi: 'Pria berwibawa mengenakan Baju Melayu teluk belanga bersamping songket dan berpeci hitam rapi.'
      },
      bekal: [
        { id: 'dodol_melaka', nama: 'Dodol Gula Melaka Segar', ikon: 'package', deskripsi: 'Kudapan manis legit khas Melaka untuk buah tangan.', kategori: 'oleh-oleh' },
        { id: 'frasa_santun_my', nama: 'Catatan Salam Sejahtera', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih, dan kemaafan.', kategori: 'frasa' },
        { id: 'songkok_baldu', nama: 'Songkok Baldu Hitam', ikon: 'bookmark', deskripsi: 'Penutup kepala sopan adat Melayu.', kategori: 'pakaian' },
        { id: 'sampul_duit_raya', nama: 'Sampul Hijau Tali Asih', ikon: 'mail', deskripsi: 'Tanda silaturahmi untuk anak-anak tuan rumah.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'my_s1',
          latar: 'Serambi Rumah Panggung Kayu, Kampung Baru',
          narasi: 'Lantai kayu cengal beraroma harum rempah. Encik Faizal menyambut hangat di beranda bertangga ubin antik.',
          dialog: { speaker: 'Encik Faizal', teks: 'Selamat sejahtera! Jemputlah naik ke anjung rumah kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'my_c1_salam_sopan',
              teks: 'Tanggalkan kasut di anak tangga, lalu jabat tangan dengan salam Melayu (dua tangan menangkup dan sentuh ke dada)',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Alhamdulillah, indah sungguh budi pekerti dan adab bertamumu.' },
              catatan: { judul: 'Salam Menangkup & Melepas Sepatu di Malaysia', isi: 'Dalam adab Melayu, salam dilakukan dengan menangkupkan kedua tangan lalu menyentuh dada kiri sebagai lambang ketulusan hati. Melepas alas kaki adalah keharusan mutlak.', kategori: 'Etiket' },
              nextSceneId: 'my_s2'
            },
            {
              id: 'my_c1_masuk_kasar',
              teks: 'Langsung melangkah masuk memakai sepatu sambil melambaikan tangan santai',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Eh, sila tanggalkan kasut dahulu di luar. Rumah panggung dijaga kebersihannya.' },
              catatan: { judul: 'Pantangan Alas Kaki di Rumah Melayu', isi: 'Memasuki rumah tanpa melepas kasut adalah pelanggaran adab berat di Nusantara karena lantai adalah tempat beribadah dan bersila.', kategori: 'Etiket' },
              nextSceneId: 'my_s2'
            }
          ]
        },
        {
          id: 'my_s2',
          latar: 'Ruang Tengah Beralas Tikar Mengkuang Halus',
          narasi: 'Encik Faizal menanyakan arah perjalananmu di Semenanjung sambil menyuguhkan teh tarik berbusa.',
          dialog: { speaker: 'Encik Faizal', teks: 'Selepas ini, ke manakah arah tujuan penjelajahanmu di tanah semenanjung?', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'my_c2_tunjuk_ibu_jari',
              teks: 'Menunjuk arah peta menggunakan ibu jari tangan kanan dengan empat jari lain digenggam sopan',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Hebat! Kamu faham betul tertib menunjuk orang Melayu, tidak guna jari telunjuk.' },
              catatan: { judul: 'Etiket Menunjuk dengan Ibu Jari', isi: 'Menunjuk orang atau arah menggunakan jari telunjuk dipandang kasar dan menuduh. Adab Melayu mewajibkan penggunaan ibu jari tangan kanan yang digenggam rapi.', kategori: 'Etiket' },
              nextSceneId: 'my_s3'
            },
            {
              id: 'my_c2_tunjuk_telunjuk',
              teks: 'Menunjuk peta menggunakan jari telunjuk tangan kiri',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Kurang manis menunjuk dengan jari telunjuk apatah lagi tangan kiri.' },
              catatan: { judul: 'Larangan Telunjuk & Tangan Kiri', isi: 'Jari telunjuk dan tangan kiri dipandang tidak sopan untuk menunjuk dalam etiket kesopanan Malaysia.', kategori: 'Etiket' },
              nextSceneId: 'my_s3'
            }
          ]
        },
        {
          id: 'my_s3',
          latar: 'Anjung Depan Rumah, Waktu Senja Menjelang',
          narasi: 'Angin petang bertiup sejuk. Encik Faizal mengantarmu hingga ke gerbang kayu halaman.',
          dialog: { speaker: 'Encik Faizal', teks: 'Terima kasih sudi singgah. Pintu anjung kami sentiasa terbuka untuk sahabat.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'my_c3_pamit_syukur',
              teks: 'Ucapkan "Terima kasih banyak atas jamuan yang mesra, Encik Faizal" dengan tunduk hormat',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Sama-sama. Selamat jalan, semoga sentiasa dalam lindungan-Nya.' },
              catatan: { judul: 'Balas Budi Jamuan Bertamu', isi: 'Memuji jamuan dan berterima kasih dengan kerendahan hati menutup silaturahmi dengan keberkahan abadi.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'my_c3_pamit_gesa',
              teks: 'Pergi tergesa-gesa tanpa pamit formal',
              respectDelta: -10,
              reaksi: { ekspresi: 'bingung', teks: 'Cepat betul bergegas... Semoga selamat di jalan.' },
              catatan: { judul: 'Etiket Pamit di Malaysia', isi: 'Pamit dengan tenang dan doa keselamatan adalah penutup wajib setiap kunjungan.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Sahabat Sejati Kampung Baru', ringkasan: 'Encik Faizal mengalungkan kain samping tenun dan menganggapmu keluarga terhormat di Kuala Lumpur.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab Semenanjung', ringkasan: 'Kenikmatan teh tarik dan hangatnya anjung rumah Melayu meninggalkan kesan mendalam.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Melayu', ringkasan: 'Memahami makna salam dan tertib bertamu menyadarkanmu akan tingginya nilai budi pekerti.', badge: 'bronze' }
      ]
    }
  },

  // 2. VIETNAM (vn)
  {
    varName: 'vietnamQuest',
    data: {
      id: 'quest-vn',
      countryId: 'vn',
      negara: 'Vietnam',
      judul: 'Hangatnya Teh Teratai Bác Nguyen',
      pengantar: 'Kamu berkunjung ke rumah kuno berarsitektur kolonial Bác Nguyen di kawasan Old Quarter Hanoi. Di Vietnam, menyapa dengan kata kekerabatan keluarga (Bác, Chú, Anh), menerima cangkir dengan dua tangan, dan tata krama sumpit adalah wujud rasa hormat mendalam.',
      npc: {
        nama: 'Bác Nguyen',
        peran: 'Tetua Komunitas & Kaligrafer Kuno',
        avatar: 'BN',
        deskripsi: 'Pria sepuh berkacamata bulat dengan jubah Ao Dai sutra gelap, tenang dan bertutur kata halus.'
      },
      bekal: [
        { id: 'kopi_robusta_vn', nama: 'Kopi Robusta Buôn Ma Thuột', ikon: 'package', deskripsi: 'Biji kopi sangrai khas dataran tinggi Vietnam.', kategori: 'oleh-oleh' },
        { id: 'frasa_chao_bac', nama: 'Catatan Sapaan Kekerabatan', ikon: 'message-square', deskripsi: 'Ungkapan Xin chào, Cảm ơn, dan sapaan Bác.', kategori: 'frasa' },
        { id: 'kipas_sutra', nama: 'Kipas Sutra Tradisional Hà Đông', ikon: 'bookmark', deskripsi: 'Kipas lukis tangan bermotif danau Hoan Kiem.', kategori: 'pakaian' },
        { id: 'dong_baru', nama: 'Uang Kertas Dong Rapi', ikon: 'coins', deskripsi: 'Mata uang Vietnam bersih tanpa lipatan.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'vn_s1',
          latar: 'Pintu Gerbang Kayu Kuno Hanoi Old Quarter',
          narasi: 'Lentera merah bergoyang di teras batu berlumut. Bác Nguyen berdiri menyambut di pintu masuk.',
          dialog: { speaker: 'Bác Nguyen', teks: 'Xin chào! Mời bạn vào nhà uống chén trà nóng.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'vn_c1_sapa_bac',
              teks: 'Bungkukkan badan sedikit, tangkupkan tangan di dada, dan ucapkan "Con chào Bác Nguyen!"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Cháu ngoan lắm! Kamu paham betul sapaan kekeluargaan bangsa Vietnam.' },
              catatan: { judul: 'Sistem Sapaan Kekerabatan Vietnam', isi: 'Di Vietnam, sapaan selalu menggunakan sebutan kekerabatan usia (Bác untuk orang setua orang tua). Ini menandakan tamu yang santun dan beradab.', kategori: 'Bahasa' },
              nextSceneId: 'vn_s2'
            },
            {
              id: 'vn_c1_tepuk_pundak',
              teks: 'Menepuk pundak Bác Nguyen dan berseru santai "Halo kawan!"',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan menepuk orang yang lebih tua, itu sangat tidak sopan dalam adat kami.' },
              catatan: { judul: 'Pantangan Kontak Fisik pada Tetua Vietnam', isi: 'Menepuk pundak atau kepala orang tua dianggap pelanggaran etiket hierarki konfusianisme yang berat di Vietnam.', kategori: 'Etiket' },
              nextSceneId: 'vn_s2'
            }
          ]
        },
        {
          id: 'vn_s2',
          latar: 'Meja Teh Kayu Jati Berukir Naga, Ruang Tamu',
          narasi: 'Bác Nguyen menuangkan teh melati teratai harum ke dalam cangkir porselen kecil.',
          dialog: { speaker: 'Bác Nguyen', teks: 'Ini teh bunga teratai Hồ Tây legendaris. Silakan dicicipi selagi hangat.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'vn_c2_dua_tangan',
              teks: 'Menerima cangkir teh menggunakan kedua tangan sambil mengangguk takzim',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Cảm ơn cháu. Menerima dengan dua belah tangan adalah tanda bakti budi pekerti.' },
              catatan: { judul: 'Menerima dengan Dua Tangan di Vietnam', isi: 'Menerima atau memberi barang kepada orang lain, terutama cangkir atau kartu nama, wajib memakai dua tangan sebagai tanda ketulusan.', kategori: 'Etiket' },
              nextSceneId: 'vn_s3'
            },
            {
              id: 'vn_c2_satu_tangan',
              teks: 'Meraih cangkir hanya dengan satu tangan sambil membuang muka',
              respectDelta: -15,
              reaksi: { ekspresi: 'kecewa', teks: 'Satu tangan menandakan ketidaksungguhan menghargai tuan rumah.' },
              catatan: { judul: 'Etiket Menghormati Sajian Tuan Rumah', isi: 'Mengambil hidangan satu tangan dipandang angkuh di ruang tamu tradisional Vietnam.', kategori: 'Makan' },
              nextSceneId: 'vn_s3'
            }
          ]
        },
        {
          id: 'vn_s3',
          latar: 'Halaman Berbatu Kuno di Bawah Pohon Kamboja',
          narasi: 'Matahari sore membiaskan cahaya emas di atas atap genteng melengkung Hanoi.',
          dialog: { speaker: 'Bác Nguyen', teks: 'Semoga perjalananmu di Vietnam membawa wawasan persahabatan yang abadi.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'vn_c3_doa_sehat',
              teks: 'Ucapkan "Cảm ơn Bác rất nhiều, chúc Bác nhiều sức khỏe!" dengan membungkuk hormat',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Hẹn gặp lại! Semoga langkahmu diberkahi kedamaian.' },
              catatan: { judul: 'Doa Kesehatan saat Pamit di Vietnam', isi: 'Mendoakan kesehatan (chúc sức khỏe) kepada orang tua saat pamit adalah ungkapan kasih sayang yang sangat dihargai di Vietnam.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'vn_c3_pergi_cepat',
              teks: 'Langsung berbalik pergi tanpa salam perpisahan',
              respectDelta: -15,
              reaksi: { ekspresi: 'bingung', teks: 'Semoga langkahmu berhati-hati di jalan.' },
              catatan: { judul: 'Adab Pamitan di Hanoi', isi: 'Pamitan dengan doa kesehatan menegaskan silaturahmi yang kokoh.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Tri Kỷ (Sahabat Karib) Hanoi', ringkasan: 'Bác Nguyen menghadiahkan gulungan kaligrafi bertinta emas bertuliskan "Tâm" (Ketulusan Hati) sebagai bukti persahabatan sejati.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Pengelana Santun di Sungai Merah', ringkasan: 'Keharuman teh teratai dan keramahan Bác Nguyen menjadi kenangan terindahmu di Vietnam.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Tata Krama Indocina', ringkasan: 'Pengalaman ini mengajarkanmu bahwa sapaan kekerabatan adalah kunci membuka hati masyarakat Vietnam.', badge: 'bronze' }
      ]
    }
  },

  // 3. BRUNEI (bn)
  {
    varName: 'bruneiQuest',
    data: {
      id: 'quest-bn',
      countryId: 'bn',
      negara: 'Brunei Darussalam',
      judul: 'Kedamaian Silaturahmi Haji Awang',
      pengantar: 'Kamu berkunjung ke pemukiman panggung air bersejarah Kampong Ayer di Bandar Seri Begawan. Di Brunei Darussalam, kesantunan Islami Melayu, salam tangan menyentuh dada, dan adab menikmati hidangan Ambuyat menjadi cermin negeri penuh berkah.',
      npc: {
        nama: 'Haji Awang',
        peran: 'Ketua Adat Kampong Ayer',
        avatar: 'HA',
        deskripsi: 'Pria bersahaja mengenakan baju kurung Melayu Brunei warna zamrud dengan dastar songket dan senyum teduh.'
      },
      bekal: [
        { id: 'kue_mor', nama: 'Kotak Kue Mor Tradisional', ikon: 'package', deskripsi: 'Kue kering kacang mentega khas Brunei yang renyah manis.', kategori: 'oleh-oleh' },
        { id: 'frasa_brunei', nama: 'Catatan Ungkapan Santun Melayu Brunei', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih, dan awang/dayang.', kategori: 'frasa' },
        { id: 'songkok_jong_sarat', nama: 'Songkok Tenun Jong Sarat', ikon: 'bookmark', deskripsi: 'Songkok berpola tenun emas khas Kesultanan Brunei.', kategori: 'pakaian' },
        { id: 'ringgit_bn', nama: 'Uang Dolar Brunei Bersih', ikon: 'coins', deskripsi: 'Mata uang resmi Brunei bernilai kuat dan rapi.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'bn_s1',
          latar: 'Jembatan Kayu Ulin Kampong Ayer, Bandar Seri Begawan',
          narasi: 'Perahu tambang bersandar di dermaga kayu. Haji Awang menyambut di muka beranda rumah panggung air berangin sejuk.',
          dialog: { speaker: 'Haji Awang', teks: 'Assalamualaikum warahmatullahi wabarakatuh. Selamat datang ke Kampong Ayer.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bn_c1_salam_lengkap',
              teks: 'Menjawab salam dengan sempurna, bersalaman dengan kedua belah tangan, lalu meletakkannya di dada kiri',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Waalaikumsalam. Sejuk rasa hati melihat anak muda beradab tinggi.' },
              catatan: { judul: 'Salam Sempurna di Brunei', isi: 'Di Brunei Darussalam, membalas salam lengkap dan menempelkan tangan di dada adalah etiket silaturahmi paling dimuliakan.', kategori: 'Etiket' },
              nextSceneId: 'bn_s2'
            },
            {
              id: 'bn_c1_salam_singkat',
              teks: 'Menjawab singkat "Halo" tanpa menyentuh salam Melayu',
              respectDelta: -15,
              reaksi: { ekspresi: 'kecewa', teks: 'Dalam adat kami, menjawab salam adalah doa keberkahan bersama.' },
              catatan: { judul: 'Pentingnya Salam Islami di Brunei', isi: 'Sebagai negara Melayu Islam Beraja (MIB), salam adalah fondasi perjumpaan yang wajib dihormati.', kategori: 'Etiket' },
              nextSceneId: 'bn_s2'
            }
          ]
        },
        {
          id: 'bn_s2',
          latar: 'Ruang Tengah Menghadap Sungai Brunei',
          narasi: 'Hidangan sagu Ambuyat disajikan bersama kuah asam pedas dan cacapan mangga muda.',
          dialog: { speaker: 'Haji Awang', teks: 'Mari santap Ambuyat ini menggunakan candas (sumpit bambu V). Jangan segan-segan.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bn_c2_makan_candas',
              teks: 'Menggunakan candas dengan tangan kanan, menggulung sagu licin, lalu mencelupkannya ke saus tanpa mengunyahnya',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Begitulah cara asli orang Brunei menikmati hidangan Ambuyat.' },
              catatan: { judul: 'Etiket Menyantap Ambuyat Brunei', isi: 'Ambuyat dimakan dengan digulung memakai candas tangan kanan, dicelup saus cacapan, lalu ditelan langsung tanpa dikunyah.', kategori: 'Makan' },
              nextSceneId: 'bn_s3'
            },
            {
              id: 'bn_c2_kunyah_kasar',
              teks: 'Mengunyah sagu dengan keras menggunakan sendok tangan kiri',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Gunakan tangan kanan Nak, dan Ambuyat lazimnya ditelan lembut.' },
              catatan: { judul: 'Adab Menggunakan Candas Tangan Kanan', isi: 'Makan hidangan tradisional dengan tangan kiri melanggar tata krama santap bersama di Brunei.', kategori: 'Makan' },
              nextSceneId: 'bn_s3'
            }
          ]
        },
        {
          id: 'bn_s3',
          latar: 'Dermaga Kayu Menjelang Waktu Maghrib',
          narasi: 'Lembayung senja memantul di permukaan Sungai Brunei. Suara azan mulai bergema merdu dari kubah emas masjid.',
          dialog: { speaker: 'Haji Awang', teks: 'Terima kasih atas kunjungan silaturahmi yang penuh berkah ini.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bn_c3_doa_berkah',
              teks: 'Ucapkan rasa syukur dan doa "Jazakallahu khair, semoga Allah memberkahi keluarga Haji Awang"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Aamiin ya Rabbal alamin. Semoga perjalananmu dirahmati keselamatan.' },
              catatan: { judul: 'Doa Penutup Silaturahmi Brunei', isi: 'Mendoakan kebaikan keluarga tuan rumah meneguhkan ikatan persaudaraan yang tulus di tanah Darussalam.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'bn_c3_pamit_gawai',
              teks: 'Pamit terburu-buru sambil memeriksa gawai telepon',
              respectDelta: -10,
              reaksi: { ekspresi: 'bingung', teks: 'Hati-hati menuruni tangga perahu tambang ya.' },
              catatan: { judul: 'Fokus Saat Berpamitan', isi: 'Memberikan perhatian penuh saat pamit menandakan penghormatan pada tuan rumah.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Keluarga Angkat Kampong Ayer', ringkasan: 'Haji Awang menghadiahkan songkok tenun Jong Sarat bersulam benang emas tanda persaudaraan abadi di Brunei.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat Bandar Seri Begawan', ringkasan: 'Keheningan Sungai Brunei dan lezatnya Ambuyat membekaskan kedamaian batin dalam perjalananmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Melayu Islam Beraja', ringkasan: 'Belajar memahami tata krama santap dan salam di Brunei memperluas kebijaksanaan budayamu.', badge: 'bronze' }
      ]
    }
  },

  // 4. CAMBODIA (kh)
  {
    varName: 'cambodiaQuest',
    data: {
      id: 'quest-kh',
      countryId: 'kh',
      negara: 'Kamboja',
      judul: 'Berkah Sampeah Lok Ta Sokun',
      pengantar: 'Kamu berkunjung ke sanggar ukir batu tradisional Lok Ta Sokun di dekat reruntuhan megah Angkor, Siem Reap. Di Kamboja, sembah penghormatan Sampeah, pantangan menyentuh kepala, dan etiket kuil kuno adalah jiwa peradaban bangsa Khmer.',
      npc: {
        nama: 'Lok Ta Sokun',
        peran: 'Sesepuh Pemahat Batu & Guru Tari Apsara',
        avatar: 'LS',
        deskripsi: 'Pria sepuh bermata teduh mengenakan krama kotak-kotak tradisional di pundak dan celana katun longgar.'
      },
      bekal: [
        { id: 'gula_aren_kh', nama: 'Gula Aren Organik Thnout', ikon: 'package', deskripsi: 'Gula kelapa aren khas Kamboja beraroma karamel alami.', kategori: 'oleh-oleh' },
        { id: 'frasa_khmer', nama: 'Catatan Ungkapan Sampeah Khmer', ikon: 'message-square', deskripsi: 'Ungkapan Chum reap sour, Orkun, dan tingkatan salam.', kategori: 'frasa' },
        { id: 'krama_khmer', nama: 'Kain Syal Krama Katun', ikon: 'bookmark', deskripsi: 'Kain serbaguna kotak-kotak warisan leluhur Khmer.', kategori: 'pakaian' },
        { id: 'riel_kh', nama: 'Mata Uang Riel Kamboja', ikon: 'coins', deskripsi: 'Uang kertas riel pecahan rapi untuk donasi kuil.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'kh_s1',
          latar: 'Halaman Berpasir Dikelilingi Pohon Palem, Siem Reap',
          narasi: 'Pahatan relief dewi Apsara berjejer rapi di teras batu pasir. Lok Ta Sokun berdiri menyambut kedatanganmu.',
          dialog: { speaker: 'Lok Ta Sokun', teks: 'Chum reap sour! Selamat datang di sanggar ukir warisan leluhur Angkor.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kh_c1_sampeah_hidung',
              teks: 'Tangkupkan kedua telapak tangan di depan hidung (Sampeah tingkat 3 untuk tetua) dan membungkuk takzim',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Saadhu! Luar biasa, kamu memahami tingkatan Sampeah bangsa Khmer.' },
              catatan: { judul: 'Tingkatan Salam Sampeah di Kamboja', isi: 'Sampeah memiliki 5 tingkatan tinggi tangan: setinggi hidung diperuntukkan khusus bagi orang tua, guru, dan biksu sebagai tanda takzim.', kategori: 'Etiket' },
              nextSceneId: 'kh_s2'
            },
            {
              id: 'kh_c1_fist_bump',
              teks: 'Menjulurkan tangan hendak tos santai (fist bump)',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Dalam tradisi kami, menyapa orang tua dilakukan dengan Sampeah yang hening.' },
              catatan: { judul: 'Pantangan Perilaku Santai di Depan Tetua', isi: 'Gestur kasual barat dianggap tidak beradab di hadapan tetua budaya di Kamboja.', kategori: 'Etiket' },
              nextSceneId: 'kh_s2'
            }
          ]
        },
        {
          id: 'kh_s2',
          latar: 'Sanggar Ukir Beraroma Serpihan Batu Pasir dan Kayu Gaharu',
          narasi: 'Lok Ta Sokun memperlihatkan ukiran kepala Buddha yang sedang dipahat dengan penuh konsentrasi.',
          dialog: { speaker: 'Lok Ta Sokun', teks: 'Ukiran ini melambangkan ketenangan jiwa. Mari perhatikan detail matanya.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kh_c2_amati_tenang',
              teks: 'Mengamati dengan takzim tanpa menyentuh bagian kepala patung atau kepala orang lain',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Ketulusan dan rasa hormatmu pada benda suci sangat menyejukkan hati.' },
              catatan: { judul: 'Kesucian Kepala dalam Budaya Khmer', isi: 'Kepala dipandang sebagai bagian tubuh paling suci dan sakral. Jangan pernah menyentuh kepala patung suci maupun kepala orang lain di Kamboja.', kategori: 'Etiket' },
              nextSceneId: 'kh_s3'
            },
            {
              id: 'kh_c2_sentuh_kepala',
              teks: 'Menepuk kepala patung pemahat cilik yang sedang belajar di sebelah',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Astaga! Jangan sentuh kepala anak itu! Kepala adalah tempat bernaungnya jiwa suci.' },
              catatan: { judul: 'Pantangan Keras Menyentuh Kepala', isi: 'Menyentuh kepala orang lain, bahkan anak kecil, adalah penghinaan spiritual serius di Kamboja.', kategori: 'Etiket' },
              nextSceneId: 'kh_s3'
            }
          ]
        },
        {
          id: 'kh_s3',
          latar: 'Pelataran Candi Berbatu Merah Saat Mentari Terbenam',
          narasi: 'Siluet menara candi Angkor tampak anggun berlatar langit senja keemasan.',
          dialog: { speaker: 'Lok Ta Sokun', teks: 'Orkun chran telah menghargai karya seni leluhur kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kh_c3_orkun_chran',
              teks: 'Ucapkan "Orkun chran, Lok Ta. Semoga berkah Angkor menyertaimu" dengan Sampeah anggun',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Semoga kedamaian Apsara menemani setiap langkah penjelajahanmu.' },
              catatan: { judul: 'Ucapan Terima Kasih Bahasa Khmer', isi: 'Orkun chran (terima kasih banyak) yang diiringi Sampeah mempererat persaudaraan antarbudaya.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'kh_c3_lambai_jauh',
              teks: 'Melambaikan tangan satu tangan dari kejauhan',
              respectDelta: -5,
              reaksi: { ekspresi: 'netral', teks: 'Selamat jalan, berhati-hatilah melangkah.' },
              catatan: { judul: 'Keselarasan Sapa dan Pamit', isi: 'Mengakhiri kunjungan dengan Sampeah memastikan kesan baik yang bertahan lama.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Ksatria Warisan Angkor', ringkasan: 'Lok Ta Sokun mengikatkan kain krama sutra merah di lehermu dan memujimu sebagai penjaga kehormatan budaya Khmer.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Pengelana Penuh Berkah Siem Reap', ringkasan: 'Keagungan Sampeah dan keteduhan sanggar ukir batu meninggalkan ketenangan batin abadi.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesucian Budaya Khmer', ringkasan: 'Menghormati kesakralan kepala dan makna Sampeah memperkaya kepekaan etikamu di Asia Tenggara.', badge: 'bronze' }
      ]
    }
  },

  // 5. LAOS (la)
  {
    varName: 'laosQuest',
    data: {
      id: 'quest-la',
      countryId: 'la',
      negara: 'Laos',
      judul: 'Ketenangan Sedekah Pagi Mae Bounmy',
      pengantar: 'Kamu berkunjung ke rumah panggung kayu Mae Bounmy di tepi Sungai Mekong, Luang Prabang. Di Laos, salam Nop yang tenang, ritual sedekah pangan pagi (Tak Bat), dan etiket nasi ketan Khao Niao mencerminkan kedamaian hidup masyarakat berlandaskan kesederhanaan.',
      npc: {
        nama: 'Mae Bounmy',
        peran: 'Penuntun Tradisi Tak Bat & Penenun Sutra',
        avatar: 'MB',
        deskripsi: 'Wanita paruh baya berwajah teduh mengenakan selendang tenun sutra Sinh khas Luang Prabang dengan rambut bersanggul rapi.'
      },
      bekal: [
        { id: 'thip_khao', nama: 'Keranjang Bambu Thip Khao', ikon: 'package', deskripsi: 'Keranjang anyaman bambu penampung nasi ketan hangat.', kategori: 'oleh-oleh' },
        { id: 'frasa_lao', nama: 'Catatan Ungkapan Sabaidee', ikon: 'message-square', deskripsi: 'Ungkapan salam Sabaidee, Khop chai, dan doa.', kategori: 'frasa' },
        { id: 'selendang_sinh', nama: 'Selendang Sutra Lipat Phaa Biang', ikon: 'bookmark', deskripsi: 'Kain selendang penghias dada untuk menghadiri acara sakral.', kategori: 'pakaian' },
        { id: 'kip_la', nama: 'Uang Kertas Kip Baru', ikon: 'coins', deskripsi: 'Mata uang Laos yang rapi.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'la_s1',
          latar: 'Jalanan Berbatu Kuno Tepi Sungai Mekong, Fajar Hari',
          narasi: 'Kabut fajar masih menyelimuti atap biara Luang Prabang. Mae Bounmy sedang menyiapkan nasi ketan hangat untuk prosesi sedekah Tak Bat.',
          dialog: { speaker: 'Mae Bounmy', teks: 'Sabaidee! Selamat pagi yang hening. Mari bersiap sebelum para biksu melintas.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'la_c1_salam_nop',
              teks: 'Menangkupkan kedua telapak tangan di dada (Nop), membungkuk sedikit, dan ucapkan "Sabaidee"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Sabaidee. Hatimu tenang dan penuh ketakziman.' },
              catatan: { judul: 'Salam Nop Tradisional Laos', isi: 'Salam Nop dengan menangkupkan kedua tangan di dada melambangkan bunga teratai kuncup yang dipersembahkan dengan damai.', kategori: 'Etiket' },
              nextSceneId: 'la_s2'
            },
            {
              id: 'la_c1_teriak_jauh',
              teks: 'Berteriak keras memanggil dari kejauhan sambil melambaikan tangan',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Fajar di Luang Prabang dijaga dalam keheningan doa, Nak.' },
              catatan: { judul: 'Menjaga Ketenangan di Kota Suci', isi: 'Berteriak atau bersuara keras merusak kekhidmatan ritual keagamaan fajar di Laos.', kategori: 'Etiket' },
              nextSceneId: 'la_s2'
            }
          ]
        },
        {
          id: 'la_s2',
          latar: 'Tepi Jalan Bertikar Pandan di Depan Vihara Vat Xieng Thong',
          narasi: 'Barisan biksu berjubah jingga berjalan hening tanpa alas kaki membawa mangkuk sedekah.',
          dialog: { speaker: 'Mae Bounmy', teks: 'Duduklah bersimpuh dengan kaki terlipat ke belakang, jangan sampai kakimu menjulur ke depan.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'la_c2_duduk_simpuh',
              teks: 'Duduk bersimpuh sopan dengan kain Phaa Biang menutupi pundak, lalu meletakkan segumpal ketan dengan takzim',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Ketakzimanmu sempurna. Begitulah cara melatih kerendahan hati dalam Tak Bat.' },
              catatan: { judul: 'Etiket Ritual Sedekah Tak Bat', isi: 'Saat Tak Bat, posisi kepala harus lebih rendah dari biksu, kaki dilipat ke belakang, dan pundak ditutup kain selendang.', kategori: 'Etiket' },
              nextSceneId: 'la_s3'
            },
            {
              id: 'la_c2_lampu_kilat',
              teks: 'Berdiri tegak menghalangi jalur biksu sambil mengambil foto selfie memakai lampu kilat',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan nyalakan lampu kilat dan jangan halangi jalan para biksu!' },
              catatan: { judul: 'Pantangan Lampu Kilat & Menghalangi Tak Bat', isi: 'Menyalakan lampu kilat atau berdiri lebih tinggi dari biksu dianggap mengganggu kesucian ibadah.', kategori: 'Etiket' },
              nextSceneId: 'la_s3'
            }
          ]
        },
        {
          id: 'la_s3',
          latar: 'Beranda Kayu Rumah Panggung Menghadap Aliran Mekong',
          narasi: 'Matahari pagi mulai menghangatkan sungai. Mae Bounmy menyajikan kopi tetes Laos yang kental manis.',
          dialog: { speaker: 'Mae Bounmy', teks: 'Khop chai deu telah menemani sedekah fajar kami dengan jiwa yang tenang.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'la_c3_khop_chai',
              teks: 'Ucapkan "Khop chai lai lai, Mae Bounmy. Semoga harimu dipenuhi kedamaian" dengan salam Nop',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Semoga kedamaian Sungai Mekong selalu mengalir dalam sanubarimu.' },
              catatan: { judul: 'Ungkapan Terima Kasih Bahasa Lao', isi: 'Khop chai lai lai (terima kasih banyak) adalah wujud syukur mendalam kepada tuan rumah di Laos.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'la_c3_buru_buru',
              teks: 'Minum kopi terburu-buru dan pamit tanpa salam',
              respectDelta: -10,
              reaksi: { ekspresi: 'bingung', teks: 'Berjalanlah perlahan, nikmati setiap hembusan angin pagi.' },
              catatan: { judul: 'Irama Hidup Santun di Laos', isi: 'Di Laos, ketenangan dan ritme hidup santai dipandang sebagai bentuk keselarasan jiwa.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Penenun Kedamaian Luang Prabang', ringkasan: 'Mae Bounmy mengikatkan benang berkah putih (Baci) di pergelangan tanganmu sebagai lambang doa persaudaraan kekal.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Berbudi di Tepian Mekong', ringkasan: 'Keheningan fajar Tak Bat dan kehangatan kopi Laos membekas menjadi kedamaian batin dalam jiwamu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesunyian Tanah Lan Xang', ringkasan: 'Memahami etiket ketakziman fajar mengajarkanmu pentingnya meredam ego di ruang sakral.', badge: 'bronze' }
      ]
    }
  },

  // 6. MYANMAR (mm)
  {
    varName: 'myanmarQuest',
    data: {
      id: 'quest-mm',
      countryId: 'mm',
      negara: 'Myanmar',
      judul: 'Harumnya Bedak Thanaka Sayar U Tin Win',
      pengantar: 'Kamu berkunjung ke sanggar pernis kuno Sayar U Tin Win di Bagan lama. Di Myanmar, sapaan Mingalaba, bedak sejuk alami Thanaka, penghormatan kepada orang tua, dan adab melepas alas kaki di tanah pagoda adalah mutiara peradaban bangsa Burma.',
      npc: {
        nama: 'Sayar U Tin Win',
        peran: 'Empu Seni Pernis (Lacquerware) Bagan',
        avatar: 'TW',
        deskripsi: 'Pria sepuh bersahaja mengenakan sarung Longyi sutra bermotif Acheik dan olesan bedak Thanaka di kedua pipinya.'
      },
      bekal: [
        { id: 'pupur_thanaka', nama: 'Batang Kayu Thanaka & Batu Kyauk Pyin', ikon: 'package', deskripsi: 'Kayu pohon alami penyejuk kulit khas Myanmar.', kategori: 'oleh-oleh' },
        { id: 'frasa_burma', nama: 'Catatan Ungkapan Mingalaba', ikon: 'message-square', deskripsi: 'Ungkapan salam berkah Mingalaba dan Cezuma.', kategori: 'frasa' },
        { id: 'sarung_longyi', nama: 'Kain Sarung Longyi Tradisional', ikon: 'bookmark', deskripsi: 'Pakaian bawahan silinder sopan masyarakat Myanmar.', kategori: 'pakaian' },
        { id: 'kyat_mm', nama: 'Uang Kyat Bersih Rapi', ikon: 'coins', deskripsi: 'Uang kertas kyat untuk sedekah vihara.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'mm_s1',
          latar: 'Halaman Sanggar Pernis di Sela Ribuan Pagoda Kuno, Bagan',
          narasi: 'Debu tanah merah berterbangan lembut diterpa angin sore. U Tin Win sedang mengeringkan mangkuk pernis hitam emas.',
          dialog: { speaker: 'U Tin Win', teks: 'Mingalaba! Selamat datang di kota seribu pagoda suci.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mm_c1_salam_sayar',
              teks: 'Membungkuk sopan dengan kedua tangan di sisi tubuh dan menyapa "Mingalaba Sayar"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Mingalaba par! Hatimu sangat menghargai guru dan tradisi.' },
              catatan: { judul: 'Makna Salam Mingalaba di Myanmar', isi: 'Mingalaba berarti "semoga keberkahan menyertaimu". Menggunakan sebutan "Sayar" (guru/empu) menandakan penghormatan tinggi.', kategori: 'Bahasa' },
              nextSceneId: 'mm_s2'
            },
            {
              id: 'mm_c1_tunjuk_kaki',
              teks: 'Menyapa "Hey bro" sambil menunjuk mangkuk pernis dengan kaki',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan pernah menunjuk karya seni atau orang dengan kakimu!' },
              catatan: { judul: 'Pantangan Kaki dalam Budaya Myanmar', isi: 'Kaki dianggap bagian tubuh paling kotor secara spiritual. Menunjuk sesuatu dengan kaki adalah penghinaan amat berat di Myanmar.', kategori: 'Etiket' },
              nextSceneId: 'mm_s2'
            }
          ]
        },
        {
          id: 'mm_s2',
          latar: 'Ruang Kerja Pernis Beraroma Getah Pohon Alami',
          narasi: 'U Tin Win menawarkan secangkir teh hijau hangat bersama piring daun teh fermentasi pedas gurih (Lahpet thoke).',
          dialog: { speaker: 'U Tin Win', teks: 'Cicipilah salad daun teh Lahpet ini, hidangan pemersatu persaudaraan kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mm_c2_topang_tangan',
              teks: 'Menerima piring sajian dengan tangan kanan, ditopang tangan kiri pada pergelangan tangan kanan',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Paham sekali adab tangan bangsa Burma. Sungguh tamu yang berbudi.' },
              catatan: { judul: 'Adab Memberi dan Menerima di Myanmar', isi: 'Menopang tangan kanan dengan tangan kiri saat menerima hidangan dari tetua adalah lambang rasa hormat dan terima kasih mendalam.', kategori: 'Etiket' },
              nextSceneId: 'mm_s3'
            },
            {
              id: 'mm_c2_ambil_kiri',
              teks: 'Meraih piring dengan tangan kiri sambil mengeluh bau daun fermentasi',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Tangan kiri bukan tangan untuk menerima anugerah rezeki.' },
              catatan: { judul: 'Penghormatan pada Makanan Tradisional', isi: 'Menghargai sajian lokal khas seperti Lahpet menandakan keterbukaan jiwa seorang penjelajah.', kategori: 'Makan' },
              nextSceneId: 'mm_s3'
            }
          ]
        },
        {
          id: 'mm_s3',
          latar: 'Teras Pagoda Menatap Matahari Terbenam di Atas Sungai Ayeyarwady',
          narasi: 'Ribuan puncak pagoda Bagan menyala keemasan di bawah cakrawala lembayung.',
          dialog: { speaker: 'U Tin Win', teks: 'Cezuma tin ba de atas kunjungan dan ketakzimanmu di tanah leluhur kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mm_c3_cezuma',
              teks: 'Ucapkan "Cezuma tin ba de, Sayar. Semoga karya senimu terus abadi"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Kha mi ba. Semoga keberkahan Bagan memayungi perjalanan hidupmu.' },
              catatan: { judul: 'Ungkapan Terima Kasih Bahasa Burma', isi: 'Cezuma tin ba de (terima kasih banyak) adalah ungkapan tulus yang mempererat persahabatan antarmanusia.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'mm_c3_sepatu_pelataran',
              teks: 'Bergegas memakai sandal sebelum meninggalkan pelataran suci',
              respectDelta: -10,
              reaksi: { ekspresi: 'bingung', teks: 'Tunggu sampai benar-benar keluar gerbang suci sebelum bersandal ya.' },
              catatan: { judul: 'Aturan Tanpa Alas Kaki di Pagoda', isi: 'Seluruh area pagoda di Myanmar wajib dijelajahi tanpa alas kaki dan tanpa kaus kaki.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Kawan Sejati Tanah Bagan', ringkasan: 'U Tin Win menghadiahkan mangkuk pernis bertatahkan daun emas bertuliskan namamu dalam aksara bulat Burma.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Lembah Seribu Pagoda', ringkasan: 'Kehangatan bedak Thanaka dan harumnya teh Lahpet menjadi kenangan persahabatan yang tak terlupakan.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesopanan Tanah Emas', ringkasan: 'Pengalaman ini mengajarkanmu bahwa menopang tangan saat menerima adalah kunci kehormatan di Myanmar.', badge: 'bronze' }
      ]
    }
  },

  // 7. TIMOR LESTE (tl)
  {
    varName: 'timorLesteQuest',
    data: {
      id: 'quest-tl',
      countryId: 'tl',
      negara: 'Timor-Leste',
      judul: 'Kopi Hangat di Uma Lulik Avo Domingos',
      pengantar: 'Kamu berkunjung ke lereng perbukitan Dili menuju rumah adat Uma Lulik milik Avo Domingos. Di Timor-Leste, ikatan persaudaraan keluarga besar, jabat tangan hangat dengan tatapan tulus, dan kain tenun Tais adalah lambang martabat budaya bangsa Bumi Lorosae.',
      npc: {
        nama: 'Avo Domingos',
        peran: 'Tetua Adat & Petani Kopi Organik Ermera',
        avatar: 'AD',
        deskripsi: 'Pria sepuh bertubuh tegap dengan kain tenun Tais tersampir di bahu dan senyum ramah khas pegunungan Timor.'
      },
      bekal: [
        { id: 'kopi_ermera', nama: 'Biji Kopi Organik Ermera', ikon: 'package', deskripsi: 'Biji kopi arabika berkualitas tinggi dari lereng Gunung Tatamailau.', kategori: 'oleh-oleh' },
        { id: 'frasa_tetun', nama: 'Catatan Ungkapan Bahasa Tetun', ikon: 'message-square', deskripsi: 'Ungkapan Bondia, Obrigadu, dan Diak ka lae.', kategori: 'frasa' },
        { id: 'kain_tais', nama: 'Kain Tenun Tais Tradisional', ikon: 'bookmark', deskripsi: 'Tenunan tangan bergaris warna-warni lambang kehormatan tamu.', kategori: 'pakaian' },
        { id: 'dolar_tl', nama: 'Uang Dolar Bersih', ikon: 'coins', deskripsi: 'Mata uang resmi yang digunakan di Timor-Leste.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'tl_s1',
          latar: 'Halaman Berumput Hijau di Bawah Naungan Rumah Adat Uma Lulik',
          narasi: 'Atap ijuk kerucut Uma Lulik menjulang anggun. Avo Domingos melangkah maju menyambutmu di muka beranda bambu.',
          dialog: { speaker: 'Avo Domingos', teks: 'Bondia, maun! Selamat datang ke tanah pegunungan kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tl_c1_jabat_hangat',
              teks: 'Jabat tangan erat dengan senyuman hangat, tatap matanya tulus, dan ucapkan "Bondia, Avo!"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Diak liu! Senang sekali melihat tamu yang penuh kehangatan jiwa.' },
              catatan: { judul: 'Salam Penuh Kehangatan di Timor-Leste', isi: 'Jabat tangan erat dengan tatapan mata terbuka dan sapaan "Avo" (kakek/tetua) adalah tanda persaudaraan paling dihargai.', kategori: 'Etiket' },
              nextSceneId: 'tl_s2'
            },
            {
              id: 'tl_c1_tangan_lemas',
              teks: 'Menghindari kontak mata dan menyodorkan tangan lemas tanpa gairah',
              respectDelta: -15,
              reaksi: { ekspresi: 'kecewa', teks: 'Dalam adat kami, jabat tangan adalah jalinan jiwa yang harus kokoh.' },
              catatan: { judul: 'Makna Kontak Mata di Timor-Leste', isi: 'Jabat tangan lemah tanpa kontak mata dipandang sebagai sikap ragu atau tidak bersungguh-sungguh.', kategori: 'Etiket' },
              nextSceneId: 'tl_s2'
            }
          ]
        },
        {
          id: 'tl_s2',
          latar: 'Bale-Bale Bambu Beratap Daun Lontar',
          narasi: 'Avo Domingos menyeduhkan kopi tubruk hitam manis beraroma cokelat tanah vulkanis.',
          dialog: { speaker: 'Avo Domingos', teks: 'Ini kopi murni hasil panen kebun kami sendiri. Minumlah selagi mengepul hangat.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tl_c2_cicip_dua_tangan',
              teks: 'Menerima cangkir kopi dengan kedua tangan, menghirup aromanya, lalu mencicipi dengan penuh apresiasi',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Kopi Timor memang menyatukan hati pengelana dan tuan rumah.' },
              catatan: { judul: 'Tradisi Kopi sebagai Tanda Persaudaraan', isi: 'Kopi adalah simbol penerimaan keluarga di Timor-Leste. Menerima dan memuji rasa kopi memperkokoh rasa persahabatan.', kategori: 'Makan' },
              nextSceneId: 'tl_s3'
            },
            {
              id: 'tl_c2_tolak_mentah',
              teks: 'Menolak mentah-mentah sajian kopi tanpa mencicipi sedikit pun',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Menolak air suguhan tuan rumah membuat hati kami tersendat.' },
              catatan: { judul: 'Adab Suguhan Tuan Rumah di Timor', isi: 'Mencicipi seteguk air suguhan adalah tanda menghargai berkah tuan rumah.', kategori: 'Etiket' },
              nextSceneId: 'tl_s3'
            }
          ]
        },
        {
          id: 'tl_s3',
          latar: 'Tepian Bukit Menatap Birunya Laut Timor di Bawah Lembayung',
          narasi: 'Matahari tenggelam perlahan di balik tanjung Dili. Lampu perahu nelayan mulai berkedip di kejauhan.',
          dialog: { speaker: 'Avo Domingos', teks: 'Obrigadu barak telah mengunjungi rumah adat leluhur kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tl_c3_obrigadu',
              teks: 'Ucapkan "Obrigadu barak, Avo Domingos. Hela ho diak (tinggallah dengan damai)"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'La’o ho diak (berjalanlah dengan selamat), saudaraku!' },
              catatan: { judul: 'Ucapan Pamitan Bahasa Tetun', isi: 'Hela ho diak dijawab dengan La’o ho diak adalah pasangan salam perpisahan yang indah penuh doa keselamatan.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'tl_c3_lompat_pagar',
              teks: 'Pamit sambil melompat pagar bambu tanpa bersalaman kembali',
              respectDelta: -15,
              reaksi: { ekspresi: 'bingung', teks: 'Lewatlah pintu gerbang utama dengan santun, maun.' },
              catatan: { judul: 'Menjaga Kesantunan Hingga Langkah Terakhir', isi: 'Keluar melalui gerbang utama menegaskan rasa hormat pada tanah adat.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Maun Alin (Saudara Kandung) Timor', ringkasan: 'Avo Domingos mengalungkan kain Tais kehormatan berhias rumbai merah di pundakmu sebagai saudara tanah Timor.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Hangat Bumi Lorosae', ringkasan: 'Kenikmatan secangkir kopi Ermera dan keteduhan Uma Lulik menjadi pelita persahabatanmu di Dili.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Ketulusan Budaya Tetun', ringkasan: 'Menatap mata dengan tulus dan menghargai suguhan kopi membuka pemahamanmu akan keramahan Timor-Leste.', badge: 'bronze' }
      ]
    }
  }
];

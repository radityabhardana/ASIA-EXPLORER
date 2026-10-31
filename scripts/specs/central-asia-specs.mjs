export const centralAsiaQuests = [
  // 1. KAZAKHSTAN (kz)
  {
    varName: 'kazakhstanQuest',
    data: {
      id: 'quest-kz',
      countryId: 'kz',
      negara: 'Kazakhstan',
      judul: 'Jamuan Nauryz Aksakal Nurlan di Almaty',
      pengantar: 'Kamu berkunjung ke pemukiman kaki pegunungan Tian Shan milik Aksakal Nurlan di Almaty. Di Kazakhstan, penghormatan kepada tetua adat, salam tangan di dada, hidangan daging Beshbarmak, dan filosofi jamuan teh Kairap Beru adalah kehormatan luhur bangsa padang rumput Kazakh.',
      npc: {
        nama: 'Aksakal Nurlan',
        peran: 'Tetua Adat Stepa & Pemain Dombra',
        avatar: 'AN',
        deskripsi: 'Pria sepuh berwajah tenang dengan jubah chapan beludru hijau bersulam emas dan topi shapan Kazakh berbulu rubah.'
      },
      bekal: [
        { id: 'roti_baursak', nama: 'Keranjang Roti Goreng Baursak', ikon: 'package', deskripsi: 'Roti goreng bantal keemasan simbol kemakmuran Kazakh.', kategori: 'oleh-oleh' },
        { id: 'frasa_kazakh', nama: 'Catatan Ungkapan Salemetsiz Be', ikon: 'message-square', deskripsi: 'Ungkapan salam formal, terima kasih, dan berkah.', kategori: 'frasa' },
        { id: 'peci_tubeteika', nama: 'Topi Tubeteika Motif Tanduk Domba', ikon: 'bookmark', deskripsi: 'Peci tradisional Kazakh dengan sulaman ornamen koshkar muyiz.', kategori: 'pakaian' },
        { id: 'tenge_kz', nama: 'Uang Kertas Tenge Kazakh', ikon: 'coins', deskripsi: 'Mata uang resmi Kazakhstan dengan desain seni elang stepa.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'kz_s1',
          latar: 'Koridor Rumah Panggung Kayu Menghadap Pegunungan Salju Almaty',
          narasi: 'Puncak gunung bersalju menjulang anggun di balik kabut pagi. Aksakal Nurlan berdiri menyambut di pintu masuk.',
          dialog: { speaker: 'Aksakal Nurlan', teks: 'Salemetsiz be! Selamat datang di lereng pegunungan Alatau.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kz_c1_salam_dada_muda_duluan',
              teks: 'Sebagai yang lebih muda, menyapa lebih dulu dengan membungkuk dan meletakkan kedua tangan di atas dada kiri',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bärekeldi! Anak muda yang tahu etiket: yang muda menyapa tetua terlebih dahulu.' },
              catatan: { judul: 'Aturan Menyapa Menurut Usia di Kazakhstan', isi: 'Dalam adat Kazakh, pihak yang lebih muda wajib menyapa terlebih dahulu kepada yang lebih tua sebagai lambang ketakziman.', kategori: 'Etiket' },
              nextSceneId: 'kz_s2'
            },
            {
              id: 'kz_c1_tunggu_disapa_sambil_duduk',
              teks: 'Duduk diam menunggu tetua menghampiri dan menyapa terlebih dahulu',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Kurang pantas menunggu orang tua mendahului memberi salam pada yang muda.' },
              catatan: { judul: 'Hierarki Kehormatan Usia di Asia Tengah', isi: 'Menunggu tetua menyapa lebih dulu dipandang sebagai tanda keangkuhan atau kurangnya sopan santun.', kategori: 'Etiket' },
              nextSceneId: 'kz_s2'
            }
          ]
        },
        {
          id: 'kz_s2',
          latar: 'Meja Bundar Dastarkhan Beralas Karpet Tekstil Tebal (Syrmak)',
          narasi: 'Tuan rumah menuangkan teh susu panas ke dalam cangkir porselen mangkuk piala (Kese), tetapi hanya mengisinya setengah.',
          dialog: { speaker: 'Aksakal Nurlan', teks: 'Minumlah teh susu panas ini. Teh diisi setengah agar kamu selalu disajikan teh yang hangat.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kz_c2_pahami_kairap_beru',
              teks: 'Menerima cangkir dengan tangan kanan, menghargai tradisi menuang setengah cangkir (Kairap Beru), dan menikmatinya perlahan',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Kamu paham filosofi teh kami! Menuang penuh berarti mengusir tamu agar cepat pergi.' },
              catatan: { judul: 'Filosofi Menuang Teh Setengah di Kazakhstan', isi: 'Di Kazakhstan, menuang teh setengah (Kairap Beru) adalah tanda keramahan agar tuan rumah bisa terus menuangkan teh segar yang masih panas.', kategori: 'Makan' },
              nextSceneId: 'kz_s3'
            },
            {
              id: 'kz_c2_protes_teh_kurang',
              teks: 'Memprotes kenapa cangkir tidak diisi penuh sampai meluap',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Cangkir penuh justru tanda tuan rumah tidak ingin kamu berlama-lama duduk.' },
              catatan: { judul: 'Makna Simbolik Isi Cangkir Teh Kazakh', isi: 'Cangkir teh yang diisi penuh melambangkan ketidaksenangan atau isyarat tamu harus segera berpamitan.', kategori: 'Makan' },
              nextSceneId: 'kz_s3'
            }
          ]
        },
        {
          id: 'kz_s3',
          latar: 'Halaman Luas Berpagar Kayu Menjelang Petang',
          narasi: 'Aksakal Nurlan memetik senar dua instrumen Dombra memainkan melodi epik prajurit stepa.',
          dialog: { speaker: 'Aksakal Nurlan', teks: 'Raqmet atas persahabatan tulusmu hari ini di tanah Kazakhstan.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kz_c3_gestur_bata_berkah',
              teks: 'Tengadahkan kedua telapak tangan menerima doa (Bata) lalu usapkan ke wajah bersama mengucap "Omin"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Omin! Semoga langit mengabulkan keberkahan perjalanan panjangmu.' },
              catatan: { judul: 'Ritual Berkah Bata di Kazakhstan', isi: 'Menerima berkah doa Bata dari tetua adat dengan mengusapkan tangan ke wajah (Omin) adalah tanda penutup perjumpaan paling sakral.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'kz_c3_pamit_acuh_main_hp',
              teks: 'Berjalan keluar saat tetua sedang membacakan doa restu',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Tunggulah doa restu selesai dibacakan sebelum melangkah pergi.' },
              catatan: { judul: 'Menghargai Doa Restu Tetua', isi: 'Meninggalkan majelis saat tetua sedang mendoakan adalah pelanggaran adab berat di Asia Tengah.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Batyr (Pahlawan Kehormatan) Stepa', ringkasan: 'Aksakal Nurlan mengalungkan miniatur Dombra perak dan mengangkatmu sebagai saudara kandung padang rumput Almaty.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Bawah Tian Shan', ringkasan: 'Kehangatan teh susu Kairap Beru dan keindahan melodi Dombra tertanam abadi dalam jiwa penjelajahanmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Tata Krama Dastarkhan', ringkasan: 'Memahami makna cangkir setengah dan adab menyapa tetua memperkaya pemahaman budayamu di Kazakhstan.', badge: 'bronze' }
      ]
    }
  },

  // 2. KIRGIZSTAN (kg)
  {
    varName: 'kyrgyzstanQuest',
    data: {
      id: 'quest-kg',
      countryId: 'kg',
      negara: 'Kirgizstan',
      judul: 'Kearifan Kalpak Putih Aksakal Kanat',
      pengantar: 'Kamu berkunjung ke pemukiman tenda Boz-Ui di tepi Danau Issyk-Kul berair biru jernih. Di Kirgizstan, kehormatan topi laken putih Ak-Kalpak, tradisi mencicipi garam dan roti Boorsok, serta kesakralan epik pahlawan Manas adalah jantung kebanggaan bangsa Kirgiz.',
      npc: {
        nama: 'Aksakal Kanat',
        peran: 'Manaschi (Pelantun Epik Manas) & Tetua Adat',
        avatar: 'AK',
        deskripsi: 'Pria sepuh berwajah karismatik mengenakan Ak-Kalpak putih bersih berujung runcing dengan jubah wol cokelat gunung.'
      },
      bekal: [
        { id: 'madu_at_bashy', nama: 'Madu Putih Pegunungan At-Bashy', ikon: 'package', deskripsi: 'Madu putih krem langka dari bunga padang rumput tinggi Altai.', kategori: 'oleh-oleh' },
        { id: 'frasa_kyrgyz', nama: 'Catatan Ungkapan Salamatsyzby', ikon: 'message-square', deskripsi: 'Ungkapan salam Kirgiz, terima kasih, dan berkah Manas.', kategori: 'frasa' },
        { id: 'topi_kalpak', nama: 'Topi Laken Ak-Kalpak Putih', ikon: 'bookmark', deskripsi: 'Topi wol putih bermotif empat puncak gunung salju Kirgizstan.', kategori: 'pakaian' },
        { id: 'som_kg', nama: 'Uang Kertas Som Kirgiz', ikon: 'coins', deskripsi: 'Mata uang kertas resmi bergambar pemandangan Issyk-Kul.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'kg_s1',
          latar: 'Tepian Berpasir Danau Issyk-Kul yang Berkilauan di Bawah Puncak Salju',
          narasi: 'Ombak kecil berdebur di danau pegunungan berair hangat. Aksakal Kanat menyambutmu di muka tenda Boz-Ui.',
          dialog: { speaker: 'Aksakal Kanat', teks: 'Salamatsyzby! Selamat datang ke danau suci kami, mutiara bangsa Kirgiz.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kg_c1_salam_kalpak_hormat',
              teks: 'Membungkuk takzim dengan tangan kanan di dada, mengenakan Ak-Kalpak dengan posisi tegak terhormat, dan mengucap "Salamatsyzby"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Kosh kelinizder! Kamu mengenakan Ak-Kalpak kami dengan martabat yang luhur.' },
              catatan: { judul: 'Kehormatan Ak-Kalpak di Kirgizstan', isi: 'Ak-Kalpak melambangkan puncak gunung es bersalju Kirgizstan. Topi ini wajib dijaga bersih, tidak boleh ditaruh di lantai, dan dipakai tegak.', kategori: 'Etiket' },
              nextSceneId: 'kg_s2'
            },
            {
              id: 'kg_c1_taruh_kalpak_tanah',
              teks: 'Melepas Ak-Kalpak dan menjadikannya alas duduk di atas batu berpasir',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan pernah letakkan Ak-Kalpak di tanah! Itu simbol puncak martabat bangsa kami!' },
              catatan: { judul: 'Pantangan Meletakkan Kalpak di Bawah', isi: 'Menduduki atau meletakkan Ak-Kalpak di tanah dipandang sebagai penghinaan berat terhadap kehormatan nasional Kirgizstan.', kategori: 'Etiket' },
              nextSceneId: 'kg_s2'
            }
          ]
        },
        {
          id: 'kg_s2',
          latar: 'Di Dalam Tenda Boz-Ui Berdinding Sulaman Shyrdak Warna-Warni',
          narasi: 'Aroma roti goreng Boorsok hangat dan teh hitam harum menguar di atas taplak meja dastarkhan.',
          dialog: { speaker: 'Aksakal Kanat', teks: 'Ambillah roti Boorsok ini dan cicipi bersama madu putih kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kg_c2_makan_boorsok_kanan',
              teks: 'Mengambil roti Boorsok dengan tangan kanan, mencelupkannya ke madu, dan memuji kelezatannya',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Dami tatty! Madu pegunungan kami memang manis seperti persahabatan sejati.' },
              catatan: { judul: 'Etiket Menikmati Roti Boorsok Kirgiz', isi: 'Roti Boorsok adalah simbol kemakmuran dan berkah perayaan. Memakannya dengan tangan kanan menunjukkan penghormatan pada rezeki.', kategori: 'Makan' },
              nextSceneId: 'kg_s3'
            },
            {
              id: 'kg_c2_langkahi_taplak_makan',
              teks: 'Melangkahkan kaki melewati taplak meja dastarkhan untuk mengambil mangkuk seberang',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan pernah melangkahi taplak meja makan! Berputarlah dari sisi belakang.' },
              catatan: { judul: 'Pantangan Melangkahi Dastarkhan', isi: 'Melangkahi taplak meja dastarkhan dipandang tabu dan tidak beradab karena meja makan adalah tempat berkah pangan.', kategori: 'Etiket' },
              nextSceneId: 'kg_s3'
            }
          ]
        },
        {
          id: 'kg_s3',
          latar: 'Bukit Berumput Menghadap Padang Penggembalaan Kuda Menjelang Senja',
          narasi: 'Aksakal Kanat mengakhiri lantunan bait epik kepahlawanan Manas yang menggetarkan sanubari.',
          dialog: { speaker: 'Aksakal Kanat', teks: 'Chon rakhmat atas kesediaanmu mendengarkan warisan leluhur kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kg_c3_tutup_omin_berkah',
              teks: 'Menangkupkan kedua tangan di depan wajah lalu mengusapkannya ke bawah sambil mengucap "Omin, Chon rakhmat"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Omin! Semoga roh pahlawan Manas memberkahi keberanian dan ketulusan hatimu.' },
              catatan: { judul: 'Gestur Doa Omin di Kirgizstan', isi: 'Mengusapkan kedua telapak tangan ke wajah sambil mengucap Omin meneguhkan rasa syukur dan doa keselamatan bersama.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'kg_c3_tepuk_tangan_ribut',
              teks: 'Bertepuk tangan gaduh dan bersiul seperti menonton konser rock',
              respectDelta: -15,
              reaksi: { ekspresi: 'bingung', teks: 'Lantunan Manas adalah doa spiritual hening, bukan tontonan riuh.' },
              catatan: { judul: 'Ketakziman Lantunan Epik Manas', isi: 'Epik Manas dihargai sebagai warisan spiritual luhur yang ditanggapi dengan ketakziman hening.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Kawan Sejati Danau Issyk-Kul', ringkasan: 'Aksakal Kanat menyematkan bros perak bermotif elang padang rumput dan menganggapmu saudara kehormatan bangsa Kirgiz.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Tenda Boz-Ui', ringkasan: 'Manisnya madu At-Bashy dan lantunan epik Manas meninggalkan kesan spiritual yang mendalam.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kehormatan Topi Ak-Kalpak', ringkasan: 'Menghargai martabat Ak-Kalpak dan kesucian dastarkhan memperdalam kepekaan antropologismu di Asia Tengah.', badge: 'bronze' }
      ]
    }
  },

  // 3. TAJIKISTAN (tj)
  {
    varName: 'tajikistanQuest',
    data: {
      id: 'quest-tj',
      countryId: 'tj',
      negara: 'Tajikistan',
      judul: 'Keharuman Roti Non Bobo Rustam di Dushanbe',
      pengantar: 'Kamu berkunjung ke rumah tradisional bertaman mawar milik Bobo Rustam di kota Dushanbe. Di Tajikistan, kesucian roti bundar Kulcha/Non yang tidak boleh dipotong pisau, salam tangan di dada (Dast ba Sina), dan adab jamuan teh hijau Chaikhana adalah pusaka peradaban Persia Asia Tengah.',
      npc: {
        nama: 'Bobo Rustam',
        peran: 'Tetua Komunitas Mahalla & Perajin Kayu Kenari',
        avatar: 'BR',
        deskripsi: 'Pria sepuh berjanggut perak rapi mengenakan jubah beludru Joma bersulam motif Chakan dan peci Toki persegi khas Tajik.'
      },
      bekal: [
        { id: 'aprikot_khujand', nama: 'Kotak Buah Aprikot Kering Emas', ikon: 'package', deskripsi: 'Aprikot manis alami dari lembah subur Fergana Khujand.', kategori: 'oleh-oleh' },
        { id: 'frasa_tajik', nama: 'Catatan Ungkapan Salom Alaykum Tajik', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Rahmat), dan doa berkah.', kategori: 'frasa' },
        { id: 'peci_toki', nama: 'Peci Tradisional Toki Tajik', ikon: 'bookmark', deskripsi: 'Peci persegi dengan sulaman ornamen flora benang warna-warni.', kategori: 'pakaian' },
        { id: 'somoni_tj', nama: 'Mata Uang Somoni Tajikistan', ikon: 'coins', deskripsi: 'Uang kertas resmi somoni bergambar monumen Ismoil Somoni.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'tj_s1',
          latar: 'Pintu Gerbang Berukir Kayu Kenari Menghadap Kebun Buah Mawar, Dushanbe',
          narasi: 'Air mancur kecil bergemercik di pelataran halaman. Bobo Rustam tersenyum menyambut di muka beranda teras.',
          dialog: { speaker: 'Bobo Rustam', teks: 'Salom alaykum! Khush omaded, selamat datang ke kediaman keluarga kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tj_c1_salam_dast_ba_sina',
              teks: 'Meletakkan tangan kanan di atas dada kiri (Dast ba Sina), membungkuk sedikit, dan ucapkan "Salom alaykum, Bobo"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Wa alaykum assalom! Tangan di dada adalah tanda hatimu menyambut kami dengan tulus.' },
              catatan: { judul: 'Tradisi Dast ba Sina di Tajikistan', isi: 'Menempelkan tangan kanan di dada kiri adalah salam khas Tajik yang melambangkan bahwa ucapan salam berakar dari cinta di lubuk hati.', kategori: 'Etiket' },
              nextSceneId: 'tj_s2'
            },
            {
              id: 'tj_c1_tos_gaya_barat',
              teks: 'Mengangkat satu tangan melambai santai tanpa membungkuk',
              respectDelta: -15,
              reaksi: { ekspresi: 'kecewa', teks: 'Di hadapan orang tua Tajik, kesantunan diwujudkan lewat ketundukan hormat.' },
              catatan: { judul: 'Adab Berjumpa Tetua Tajik', isi: 'Sikap santai berlebihan di hadapan tetua (Bobo) dipandang kurang beradab dalam tradisi Mahalla.', kategori: 'Etiket' },
              nextSceneId: 'tj_s2'
            }
          ]
        },
        {
          id: 'tj_s2',
          latar: 'Ruang Tengah Beralas Karpet Halus dengan Taplak Meja Dastarkhan',
          narasi: 'Di atas meja tersaji roti bundar Kulcha yang baru matang dari pemanggang tandoor tandur tanah liat.',
          dialog: { speaker: 'Bobo Rustam', teks: 'Roti Non adalah anugerah suci langit. Mari kita nikmati bersama.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tj_c2_patahkan_roti_dua_tangan',
              teks: 'Mematahkan roti secara perlahan menggunakan kedua belah tangan dan meletakkannya selalu menghadap ke atas',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Roti tidak boleh diiris pisau dan tidak boleh ditaruh terbalik.' },
              catatan: { judul: 'Kesucian Roti Non di Tajikistan', isi: 'Roti dipatahkan dengan dua tangan sebagai tanda takzim; memotongnya dengan pisau atau menaruhnya terbalik dipandang melanggar kesucian rezeki.', kategori: 'Makan' },
              nextSceneId: 'tj_s3'
            },
            {
              id: 'tj_c2_tusuk_pisau_balik_roti',
              teks: 'Menghunus pisau saku, membelah roti, lalu membalik sisi roti menghadap ke bawah',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Astaghfirullah! Jangan letakkan roti terbalik dan jangan potong dengan pisau!' },
              catatan: { judul: 'Pantangan Membalik Roti Non', isi: 'Menaruh roti terbalik dipercaya membawa nasib buruk dan mencerminkan rasa tidak bersyukur dalam budaya Asia Tengah.', kategori: 'Makan' },
              nextSceneId: 'tj_s3'
            }
          ]
        },
        {
          id: 'tj_s3',
          latar: 'Teras Rumah di Bawah Naungan Rambatan Pohon Anggur',
          narasi: 'Aroma teh hijau Choy dan buah anggur manis menyempurnakan santap sore yang penuh keakraban.',
          dialog: { speaker: 'Bobo Rustam', teks: 'Khaeri khezmat, terima kasih atas kehadiranmu yang membawa sukacita di rumah kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tj_c3_rahmat_kalam_berkah',
              teks: 'Ucapkan "Rahmat, Bobo Rustam. Khudo nigahbonaton (semoga Tuhan menjagamu)" dengan tangan di dada',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Rahmat! Doa berkah yang indah. Pintu rumah kami selalu terbuka bagimu.' },
              catatan: { judul: 'Ungkapan Pamitan Penuh Berkah Bahasa Tajik', isi: 'Khudo nigahbonaton (semoga Tuhan menjagamu) adalah doa perpisahan paling hangat dalam tradisi persaudaraan Tajik.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'tj_c3_buang_sisa_roti_lantai',
              teks: 'Mengibas remah roti ke lantai lalu pamit tergesa',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Remah roti harus dikumpulkan dengan hormat, jangan diinjak di lantai.' },
              catatan: { judul: 'Menghormati Remah Roti', isi: 'Menginjak remah roti dianggap perbuatan tercela di seluruh Asia Tengah.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Dust (Sahabat Karib) Dushanbe', ringkasan: 'Bobo Rustam menghadiahkan peci Toki sulaman tangan dan menyebutmu sebagai keluarga terhormat di lembah Tajikistan.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Jalur Pegunungan Pamir', ringkasan: 'Kehangatan roti Kulcha tandoor dan ketulusan salam tangan di dada meninggalkan kesan mendalam di hatimu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Dastarkhan Tajik', ringkasan: 'Memahami kesucian roti Non dan keutamaan doa berkah membuka pintu kedewasaan budayamu.', badge: 'bronze' }
      ]
    }
  },

  // 4. TURKMENISTAN (tm)
  {
    varName: 'turkmenistanQuest',
    data: {
      id: 'quest-tm',
      countryId: 'tm',
      negara: 'Turkmenistan',
      judul: 'Kemuliaan Karpet Telpek Yoldash di Ashgabat',
      pengantar: 'Kamu berkunjung ke kediaman perajin karpet Yoldash di kota marmer putih Ashgabat. Di Turkmenistan, kesakralan permadani Turkmen motif Gul, topi bulu domba Telpek, adab menerima mangkuk teh hijau Gowshurma, dan etiket kesopanan Jalur Sutra adalah lambang martabat sejati bangsa Turkmen.',
      npc: {
        nama: 'Yoldash',
        peran: 'Penenun Karpet Warisan Nasional & Penunggang Kuda Akhal-Teke',
        avatar: 'YD',
        deskripsi: 'Pria gagah mengenakan topi bulu domba putih Telpek berukuran besar dan jubah Don sutra merah bergaris halus.'
      },
      bekal: [
        { id: 'melon_kering_tm', nama: 'Melon Kering Manis Gurun Karakum', ikon: 'package', deskripsi: 'Melon manis khas Turkmenistan yang dikeringkan matahari.', kategori: 'oleh-oleh' },
        { id: 'frasa_turkmen', nama: 'Catatan Ungkapan Salam Aleykum', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Sag boluň), dan berkah.', kategori: 'frasa' },
        { id: 'miniatur_karpet', nama: 'Sulam Permadani Motif Gul', ikon: 'bookmark', deskripsi: 'Tenunan tangan miniatur karpet nasional motif suku Tekke.', kategori: 'pakaian' },
        { id: 'manat_tm', nama: 'Uang Manat Turkmenistan Baru', ikon: 'coins', deskripsi: 'Mata uang kertas resmi dengan gambar pahlawan nasional Oguz Khan.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'tm_s1',
          latar: 'Beranda Gedung Marmer Putih Berhias Gerbang Emas, Ashgabat',
          narasi: 'Sinar mentari memantul kemilau di atas dinding marmer putih. Yoldash berdiri tegak menyambutmu dengan topi Telpek megahnya.',
          dialog: { speaker: 'Yoldash', teks: 'Salam aleýkum! Hoş geldiňiz, selamat datang ke kota marmer putih kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tm_c1_salam_dua_tangan_dada',
              teks: 'Menjawab salam dengan takzim, bersalaman erat dengan kedua tangan, lalu meletakkan tangan kanan di dada',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Gaty gowy! Kamu menyambut dengan jabat tangan kehormatan bangsa ksatria Akhal-Teke.' },
              catatan: { judul: 'Salam Bersalaman Erat di Turkmenistan', isi: 'Jabat tangan dengan kedua belah tangan disusul menyentuh dada adalah tanda keakraban dan ketulusan mutlak di Turkmenistan.', kategori: 'Etiket' },
              nextSceneId: 'tm_s2'
            },
            {
              id: 'tm_c1_ejek_topi_bulu',
              teks: 'Tertawa geli menunjuk topi bulu domba Telpek yang dipakai tuan rumah',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Telpek adalah simbol kehormatan dan kejantanan leluhur kami di padang pasir!' },
              catatan: { judul: 'Kesakralan Topi Telpek Bangsa Turkmen', isi: 'Telpek adalah lambang harga diri pria Turkmen sejak berabad-abad lampau dan tidak boleh dijadikan bahan olok-olok.', kategori: 'Etiket' },
              nextSceneId: 'tm_s2'
            }
          ]
        },
        {
          id: 'tm_s2',
          latar: 'Ruang Tengah Beralas Permadani Merah Tua Tenunan Sutra Wol Murni',
          narasi: 'Karpet motif suku Tekke terbentang indah bagai mahakarya seni bernyawa.',
          dialog: { speaker: 'Yoldash', teks: 'Permadani ini ditenun selama delapan bulan dengan jutaan simpul tangan. Silakan duduk bersila di tepiannya.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tm_c2_lepas_sepatu_jaga_karpet',
              teks: 'Melepas sepatu jauh di luar batas permadani, lalu melangkah lembut tanpa alas kaki dan memuji kehalusan simpulnya',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Kamu menghargai keringat jemari para penenun karpet kami. Hati kami bersuka cita.' },
              catatan: { judul: 'Kesucian Karpet Permadani Turkmen', isi: 'Karpet Turkmen adalah lambang identitas bangsa (terpampang di bendera nasional). Menjaga kebersihannya adalah etiket tertinggi.', kategori: 'Etiket' },
              nextSceneId: 'tm_s3'
            },
            {
              id: 'tm_c2_injak_karpet_sepatu_lumpur',
              teks: 'Melangkah masuk ke atas karpet wol sutra tanpa melepas sepatu boot berdebu',
              respectDelta: -35,
              reaksi: { ekspresi: 'kecewa', teks: 'Hentikan langkahmu! Jangan nodai karpet pusaka kami dengan debu jalanan!' },
              catatan: { judul: 'Pantangan Alas Kaki di Karpet Seni Turkmen', isi: 'Menginjak karpet tenun tangan memakai sepatu luar adalah pelanggaran adab tak termaafkan di Turkmenistan.', kategori: 'Etiket' },
              nextSceneId: 'tm_s3'
            }
          ]
        },
        {
          id: 'tm_s3',
          latar: 'Teras Rumah Menatap Cahaya Lampu Emas Kota Ashgabat di Malam Hari',
          narasi: 'Mangkuk teh hijau Gok-chay diseruput hangat di tengah udara malam gurun yang menyejukkan.',
          dialog: { speaker: 'Yoldash', teks: 'Sag boluň atas ketulusan hatimu menghargai adat istiadat tanah gurun Karakum.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'tm_c3_sag_bolun_persaudaraan',
              teks: 'Ucapkan "Sag boluň, Yoldash. Semoga kuda Akhal-Teke dan karpet Turkmen selalu jaya di dunia"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Ýoluňyz ak bolsun (semoga jalanmu selalu putih terang), wahai sahabat sejati!' },
              catatan: { judul: 'Doa Jalan Terang di Turkmenistan', isi: 'Ýoluňyz ak bolsun (semoga jalanmu putih bersinar) adalah doa restu terindah bangsa Turkmen bagi para pengelana.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'tm_c3_pamit_tanpa_kata',
              teks: 'Langsung melangkah pergi tanpa membalas ucapan terima kasih',
              respectDelta: -10,
              reaksi: { ekspresi: 'bingung', teks: 'Semoga kamu tiba di tempat tujuan dengan selamat.' },
              catatan: { judul: 'Adab Berpamitan Bangsa Turkmen', isi: 'Menjawab doa perpisahan mempererat persahabatan di gerbang Jalur Sutra.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Dost (Kawan Kehormatan) Karakum', ringkasan: 'Yoldash menghadiahkan syal wol tenun sutra merah bertatahkan ornamen Gul dan mengangkatmu sebagai kawan sejati di Ashgabat.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Kota Marmer Putih', ringkasan: 'Keagungan permadani Turkmen dan aroma teh Gok-chay menjadi kenangan abadi di tanah Asia Tengah.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Martabat Bangsa Akhal-Teke', ringkasan: 'Memahami kesakralan karpet pusaka dan arti kehormatan Telpek memperkaya wawasan budayamu.', badge: 'bronze' }
      ]
    }
  }
];

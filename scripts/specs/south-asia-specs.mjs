export const southAsiaQuests = [
  // 1. INDIA (in)
  {
    varName: 'indiaQuest',
    data: {
      id: 'quest-in',
      countryId: 'in',
      negara: 'India',
      judul: 'Keagungan Namaste Pandit Sharma di Varanasi',
      pengantar: 'Kamu berkunjung ke serambi ghat kuno di tepi Sungai Gangga suci di Varanasi milik Pandit Sharma. Di India, salam Namaste dengan dua telapak tangan merapat di depan dada, penggunaan eksklusif tangan kanan saat santap, dan penghormatan pada tetua (Atithi Devo Bhava: Tamu adalah Wujud Dewa) adalah pilar spiritual bangsa Hindustan.',
      npc: {
        nama: 'Pandit Sharma',
        peran: 'Cendekiawan Musik Klasik & Guru Sitar Varanasi',
        avatar: 'PS',
        deskripsi: 'Pria sepuh berwajah teduh mengenakan kurta katun putih halus dengan selendang sutra kuning kunyit dan tanda tilak merah di dahi.'
      },
      bekal: [
        { id: 'mithai_varanasi', nama: 'Kotak Manisan Kaju Katli Mithai', ikon: 'package', deskripsi: 'Manisan kacang mede berhias kertas perak murni yang manis lembut.', kategori: 'oleh-oleh' },
        { id: 'frasa_hindi', nama: 'Catatan Ungkapan Namaste & Shukriya', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Dhanyavaad/Shukriya), dan partikel hormat -ji.', kategori: 'frasa' },
        { id: 'selendang_khadi', nama: 'Selendang Tenun Katun Khadi', ikon: 'bookmark', deskripsi: 'Kain tenun tangan alami warisan gerakan kemandirian India.', kategori: 'pakaian' },
        { id: 'rupee_in', nama: 'Uang Kertas Rupee Baru', ikon: 'coins', deskripsi: 'Mata uang rupee bersih tanpa coretan untuk persembahan.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'in_s1',
          latar: 'Undakan Batu Ghat Kuno Menghadap Aliran Tenang Sungai Gangga, Fajar Hari',
          narasi: 'Lonceng kuil berdentang lembut diiringi aroma dupa cendana semerbak. Pandit Sharma berdiri menyambut di pintu pelataran batu.',
          dialog: { speaker: 'Pandit Sharma', teks: 'Namaste! Atithi Devo Bhava, selamat datang ke kota abadi Kashi Varanasi.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'in_c1_namaste_sempurna',
              teks: 'Merapatkan kedua telapak tangan di depan dada (Namaste), membungkuk takzim, dan berucap "Namaste, Pandit-ji"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Namaste! Hati kami tersentuh melihat ketakziman dan imbuhan hormat -ji dari lisanmu.' },
              catatan: { judul: 'Makna Salam Namaste dan Imbuhan -ji di India', isi: 'Namaste bermakna "jiwa suciku bersujud pada jiwa sucimu". Menambahkan sufiks "-ji" pada nama orang tua adalah bentuk kesantunan tertinggi di India.', kategori: 'Etiket' },
              nextSceneId: 'in_s2'
            },
            {
              id: 'in_c1_jabat_tangan_kiri_kasual',
              teks: 'Menyodorkan tangan kiri untuk berjabat tangan dengan gerakan santai',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Tangan kiri dianggap tidak suci untuk bersalaman atau menyapa orang lain.' },
              catatan: { judul: 'Pantangan Tangan Kiri di India', isi: 'Tangan kiri dicadangkan hanya untuk membersihkan diri dan dipandang tabu digunakan dalam salam, memberi, atau makan.', kategori: 'Etiket' },
              nextSceneId: 'in_s2'
            }
          ]
        },
        {
          id: 'in_s2',
          latar: 'Serambi Rumah Beralas Karpet Sutra di Depan Instrumen Sitar Klasik',
          narasi: 'Sajian teh Chai rempah kapulaga dan piring manisan Mithai disuguhkan di atas meja kuningan berkilau.',
          dialog: { speaker: 'Pandit Sharma', teks: 'Silakan nikmati teh Masala Chai dan manisan ini untuk mempermanis persaudaraan kita.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'in_c2_ambil_makan_tangan_kanan',
              teks: 'Mengambil cangkir teh dan manisan secara tertib hanya menggunakan tangan kanan',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Tertib tangan kanan mencerminkan kesucian jiwa seorang tamu.' },
              catatan: { judul: 'Tata Krama Santap Tangan Kanan di India', isi: 'Di India, segala aktivitas makan, minum, dan menerima persembahan wajib dilakukan dengan tangan kanan.', kategori: 'Makan' },
              nextSceneId: 'in_s3'
            },
            {
              id: 'in_c2_arahkan_kaki_ke_sitar',
              teks: 'Duduk selonjor dengan telapak kaki mengarah langsung ke alat musik sitar di dekat Pandit',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Tolong jangan arahkan kakimu ke sitar! Instrumen musik adalah manifestasi dewi ilmu pengetahuan Saraswati.' },
              catatan: { judul: 'Pantangan Menghadapkan Kaki ke Buku dan Alat Musik', isi: 'Di India, menyentuhkan kaki ke buku, alat musik, atau orang lain adalah pelanggaran spiritual berat.', kategori: 'Etiket' },
              nextSceneId: 'in_s3'
            }
          ]
        },
        {
          id: 'in_s3',
          latar: 'Tepi Ghat Saat Ribuan Pelita Diya Dilarungkan Menjelang Malam (Ganga Aarti)',
          narasi: 'Api upacara Aarti menyala keemasan diiringi nyanyian pujian dan asap kemenyan yang menenangkan jiwa.',
          dialog: { speaker: 'Pandit Sharma', teks: 'Dhanyavaad atas kehadiranmu yang penuh berkah di kota suci kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'in_c3_dhanyavaad_namaste',
              teks: 'Ucapkan "Bahut dhanyavaad, Pandit-ji. Semoga kedamaian selalu menyertai Varanasi" dengan salam Namaste',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Shubh yatra! Semoga perjalanan hidupmu selalu dipenuhi cahaya kebijaksanaan.' },
              catatan: { judul: 'Doa Perjalanan Bahasa Hindi', isi: 'Shubh yatra berarti doa selamat jalan penuh keberkahan bagi para penjelajah.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'in_c3_tiup_api_diya_mati',
              teks: 'Meniup pelita api diya persembahan sebelum dilarungkan ke sungai',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan ditiup! Api suci harus dibiarkan menyala mengalir bersama doa.' },
              catatan: { judul: 'Kesakralan Api Upacara di India', isi: 'Meniup api pelita doa dipandang mencemari kesucian persembahan dalam ritual Gangga.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Mitra (Sahabat Jiwa) di Kashi', ringkasan: 'Pandit Sharma mengalungkan selendang sutra Varanasi kuning kunyit dan menabalkanmu sebagai tamu agung di tepi Gangga.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Pengelana Bersahaja di Varanasi', ringkasan: 'Keharuman Masala Chai dan keagungan ritual Ganga Aarti menjadi kenangan spiritual tak terhapuskan.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesakralan Budaya Hindustan', ringkasan: 'Memahami kesucian tangan kanan dan makna filosofis Namaste memperluas wawasan batinmu di India.', badge: 'bronze' }
      ]
    }
  },

  // 2. AFGHANISTAN (af)
  {
    varName: 'afghanistanQuest',
    data: {
      id: 'quest-af',
      countryId: 'af',
      negara: 'Afganistan',
      judul: 'Kemuliaan Jamuan Rubab Ustad Ahmad di Kabul',
      pengantar: 'Kamu berkunjung ke rumah tradisional bata lumpur berhias pohon delima milik Ustad Ahmad di kota tua Kabul. Di Afganistan, hukum keramahan tamu Pashtunwali (Melmastia), salam tangan di dada dengan doa panjang, dan adab menikmati hidangan nasi Kabuli Pulao adalah cermin kehormatan luhur suku bangsa pegunungan Hindu Kush.',
      npc: {
        nama: 'Ustad Ahmad',
        peran: 'Empu Pembuat Instrumen Petik Rubab & Sesepuh Warga',
        avatar: 'UA',
        deskripsi: 'Pria berwibawa berjanggut perak rapi mengenakan pakaian Perahan Tunban longgar dan topi Pakol wol cokelat khas pegunungan.'
      },
      bekal: [
        { id: 'kismis_kandahar', nama: 'Kotak Kismis Merah & Kacang Badam', ikon: 'package', deskripsi: 'Buah kering manis legit dari kebun buah Kandahar.', kategori: 'oleh-oleh' },
        { id: 'frasa_dari_pashto', nama: 'Catatan Ungkapan Salaam & Tashakor', ikon: 'message-square', deskripsi: 'Ungkapan salam ramah, terima kasih (Tashakor/Manana), dan doa kabar keluarga.', kategori: 'frasa' },
        { id: 'topi_pakol', nama: 'Topi Wol Tradisional Pakol', ikon: 'bookmark', deskripsi: 'Topi wol gulung hangat khas pejuang dan penggembala pegunungan.', kategori: 'pakaian' },
        { id: 'afghani_af', nama: 'Mata Uang Afghani Baru', ikon: 'coins', deskripsi: 'Uang kertas resmi Afganistan yang rapi.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'af_s1',
          latar: 'Halaman Berlantai Bata Tanah Liat Dikelilingi Pohon Delima, Kabul',
          narasi: 'Angin gunung yang sejuk berhembus menenangkan. Ustad Ahmad menyambut di ambang pintu berukir kayu kenari.',
          dialog: { speaker: 'Ustad Ahmad', teks: 'Salaam aleikum! Khosh amadid, pintu rumah kami adalah istana bagi setiap tamu.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'af_c1_salam_dada_tanya_kabar',
              teks: 'Menjawab salam dengan hangat, meletakkan tangan kanan di dada, dan menanyakan kabar kesehatan dengan tulus: "Jor bashe"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Khairee bashe! Betapa santun ucapanmu, menandakan jiwa yang menghargai persaudaraan.' },
              catatan: { judul: 'Etiket Bertanya Kabar Panjang di Afganistan', isi: 'Dalam etiket Melmastia, salam selalu diikuti pertanyaan kabar kesehatan dan kesejahteraan keluarga secara hangat dan mendalam.', kategori: 'Etiket' },
              nextSceneId: 'af_s2'
            },
            {
              id: 'af_c1_salam_cepat_potong',
              teks: 'Menjawab "Hai" singkat lalu langsung meminta disuguhi makanan',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Dalam tradisi kami, kehangatan kata pembuka lebih berharga daripada hidangan.' },
              catatan: { judul: 'Keutamaan Salam dalam Pashtunwali', isi: 'Memotong salam dengan tergesa-gesa dipandang tidak beradab di hadapan tetua Afganistan.', kategori: 'Etiket' },
              nextSceneId: 'af_s2'
            }
          ]
        },
        {
          id: 'af_s2',
          latar: 'Ruang Tengah Beralas Permadani Karpet Merah Herat Tenunan Tangan',
          narasi: 'Nampan tembaga besar berisi nasi Kabuli Pulao bertabur irisan wortel manis, kismis, dan potongan daging domba disajikan di tengah dastarkhan.',
          dialog: { speaker: 'Ustad Ahmad', teks: 'Bismillāh, mari santap hidangan ini bersama. Tamu dipersilakan mengambil bagian pertama.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'af_c2_santap_tangan_kanan_sopan',
              teks: 'Mempersilakan tetua menyentuh makanan dahulu, lalu menyantap menggunakan ujung jemari tangan kanan dari sisi yang terdekat',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Adab santapmu sangat mulia. Nosh-e jan (selamat menikmati anugerah rezeki).' },
              catatan: { judul: 'Etiket Menyantap Kabuli Pulao', isi: 'Mengambil nasi dari bagian yang berhadapan dengan diri sendiri menggunakan tangan kanan mencerminkan adab makan yang diajarkan dalam tradisi Afghan.', kategori: 'Makan' },
              nextSceneId: 'af_s3'
            },
            {
              id: 'af_c2_raih_makanan_tangan_kiri_acak',
              teks: 'Mengaduk-aduk nampan makanan ke bagian tengah menggunakan tangan kiri',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Gunakan tangan kanan Nak, dan makanlah dari bagian yang berada di hadapanmu.' },
              catatan: { judul: 'Pantangan Tangan Kiri di Nampan Bersama', isi: 'Menggunakan tangan kiri di nampan santap bersama melanggar aturan kebersihan dan kesopanan komunal.', kategori: 'Makan' },
              nextSceneId: 'af_s3'
            }
          ]
        },
        {
          id: 'af_s3',
          latar: 'Teras Rumah di Bawah Naungan Bintang-Bintang Langit Pegunungan Hindu Kush',
          narasi: 'Petikan dawai instrumen Rubab mengalun syahdu mengiringi teh hijau kapulaga hangat.',
          dialog: { speaker: 'Ustad Ahmad', teks: 'Tashakor atas kunjunganmu yang membawa kehormatan di rumah kami malam ini.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'af_c3_tashakor_doa_damai',
              teks: 'Ucapkan "Tashakor, Ustad Ahmad. Khoda hafez, semoga kedamaian abadi selalu memayungi tanah Afganistan"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Khoda negahdar! Doa perdamaianmu adalah anugerah terindah bagi kami.' },
              catatan: { judul: 'Doa Perpisahan Bahasa Dari', isi: 'Khoda hafez dan Khoda negahdar bermakna "Semoga Tuhan melindungimu dalam kedamaian abadi".', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'af_c3_melangkah_langkahi_karpet',
              teks: 'Melangkahi alat musik Rubab yang diletakkan di atas kain karpet',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan langkahi Rubab! Alat musik adalah suara jiwa kebudayaan kami.' },
              catatan: { judul: 'Penghormatan pada Alat Musik Tradisional Afghan', isi: 'Melangkahi alat musik dipandang meremehkan warisan seni para leluhur.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Aziz (Saudara Terkasih) Kabul', ringkasan: 'Ustad Ahmad menghadiahkan topi Pakol wol pegunungan dan menyebutmu sebagai saudara kehormatan di tanah Hindu Kush.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Bumi Afghan', ringkasan: 'Kelezatan Kabuli Pulao dan petikan dawai Rubab yang damai tertanam abadi dalam kenangan perjalananmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kemuliaan Melmastia', ringkasan: 'Memahami prinsip keramahan Pashtunwali mengajarkanmu betapa agungnya arti memuliakan tamu.', badge: 'bronze' }
      ]
    }
  },

  // 3. BANGLADESH (bd)
  {
    varName: 'bangladeshQuest',
    data: {
      id: 'quest-bd',
      countryId: 'bd',
      negara: 'Bangladesh',
      judul: 'Manisnya Keramahan Rasgulla Paman Farhan di Dhaka',
      pengantar: 'Kamu berkunjung ke kediaman perajin kain tenun Jamdani Paman Farhan di kawasan kota tua Puran Dhaka. Di Bangladesh, kecintaan pada bahasa Bengali (Bangla), jamuan teh susu manis beraroma jahe (Cha), manisan Rasgulla, dan sambutan hangat tanpa batas adalah jiwa kebanggaan bangsa delta Sungai Padma.',
      npc: {
        nama: 'Paman Farhan',
        peran: 'Empu Tenun Sutra Jamdani & Tokoh Warga Puran Dhaka',
        avatar: 'PF',
        deskripsi: 'Pria paruh baya bersahaja mengenakan kemeja kurta katun bordir rapi dan kain sarung lungi bergaris nyaman dengan senyum lebar bersahabat.'
      },
      bekal: [
        { id: 'manisan_rasgulla', nama: 'Panci Tanah Liat Manisan Rasgulla', ikon: 'package', deskripsi: 'Bola keju chhana lembut berendam air gula mawar yang manis legit.', kategori: 'oleh-oleh' },
        { id: 'frasa_bengali', nama: 'Catatan Ungkapan Bahasa Bengali', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Dhonnobad), dan sapaan Kemon achhen.', kategori: 'frasa' },
        { id: 'syal_jamdani', nama: 'Syal Tenun Motif Jamdani', ikon: 'bookmark', deskripsi: 'Kain katun bermotif tenun geometris UNESCO warisan Bengal.', kategori: 'pakaian' },
        { id: 'taka_bd', nama: 'Uang Kertas Taka Bersih', ikon: 'coins', deskripsi: 'Mata uang resmi Bangladesh bergambar Monumen Bahasa Nasional.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'bd_s1',
          latar: 'Gang Berbatu Puran Dhaka Dikelilingi Arsitektur Klasik Bengal',
          narasi: 'Dentang lonceng becak hias rickshaw bersahutan di jalanan semarak. Paman Farhan berdiri di depan pintu rumah menyambutmu.',
          dialog: { speaker: 'Paman Farhan', teks: 'Assalamu alaikum! Nomoshkar! Shagotom, selamat datang ke kediaman kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bd_c1_salam_hangat_dua_tangan',
              teks: 'Menjawab salam dengan hangat, bersalaman dengan kedua belah tangan, dan menanyakan "Kemon achhen, Chacha?"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bhaloo achhi! Senang sekali mendengar sapaan Bengali yang begitu ramah.' },
              catatan: { judul: 'Kehangatan Sapaan Bengali di Bangladesh', isi: 'Menyapa "Kemon achhen" (bagaimana kabarmu) dan memanggil "Chacha" (paman) menciptakan keakraban keluarga seketika di Bangladesh.', kategori: 'Bahasa' },
              nextSceneId: 'bd_s2'
            },
            {
              id: 'bd_c1_abaikan_tangan_dingin',
              teks: 'Menjulurkan satu tangan dingin tanpa senyum dan buru-buru masuk',
              respectDelta: -15,
              reaksi: { ekspresi: 'kecewa', teks: 'Di Bengal, kehangatan jabat tangan adalah kunci membuka pintu rumah.' },
              catatan: { judul: 'Karakter Keramahan Bangsa Bengal', isi: 'Masyarakat Bangladesh sangat ekspresif dan menghargai jabat tangan yang penuh kehangatan emosional.', kategori: 'Etiket' },
              nextSceneId: 'bd_s2'
            }
          ]
        },
        {
          id: 'bd_s2',
          latar: 'Ruang Tamu Berangin Sejuk di Bawah Kipas Angin Gantung Antik',
          narasi: 'Paman Farhan menyajikan secangkir teh susu rempah (Doodh Cha) panas dan sepiring manisan Rasgulla yang lumer di mulut.',
          dialog: { speaker: 'Paman Farhan', teks: 'Makanlah manisan Rasgulla ini. Di Bangladesh, perjumpaan sahabat wajib diawali dengan yang manis-manis.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bd_c2_makan_manisan_puji',
              teks: 'Menerima piring manisan dengan tangan kanan, mencicipinya, dan memuji kelembutan rasa kejunya: "Khub mishti!"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Khub bhalo! Manisan Bengal dibuat dengan cinta untuk memuliakan tamu agung.' },
              catatan: { judul: 'Tradisi Manisan Mithai di Bengal', isi: 'Kudapan manis adalah lambang kabar baik dan restu. Memuji rasanya membahagiakan hati keluarga tuan rumah.', kategori: 'Makan' },
              nextSceneId: 'bd_s3'
            },
            {
              id: 'bd_c2_tolak_rasgulla_jijik',
              teks: 'Mendorong piring menjauh sambil berkata cairan gulanya terlalu lengket dan kotor',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Menolak manisan suguhan tuan rumah membuat hati keluarga kami bersedih.' },
              catatan: { judul: 'Adab Menerima Hidangan Manis', isi: 'Menolak mentah-mentah hidangan kebanggaan tuan rumah dipandang kurang menghargai niat baik mereka.', kategori: 'Makan' },
              nextSceneId: 'bd_s3'
            }
          ]
        },
        {
          id: 'bd_s3',
          latar: 'Beranda Rumah Menatap Sungai Buriganga di Kala Senja',
          narasi: 'Lampu-lampu kapal kayu menyala di sungai yang sibuk di bawah langit ungu senja Dhaka.',
          dialog: { speaker: 'Paman Farhan', teks: 'Dhonnobad telah singgah. Ingatlah bahwa kamu selalu punya keluarga di Puran Dhaka.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bd_c3_dhonnobad_abar_dekha_hobe',
              teks: 'Ucapkan "Onek dhonnobad, Chacha. Abar dekha hobe (sampai jumpa lagi)!" dengan senyuman tulus',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Abar dekha hobe! Semoga langkahmu selalu dinaungi keselamatan dan kebahagiaan.' },
              catatan: { judul: 'Ungkapan Pamitan Bahasa Bengali', isi: 'Abar dekha hobe (sampai kita berjumpa kembali) adalah salam perpisahan yang menjanjikan persahabatan abadi.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'bd_c3_pergi_tanpa_kata',
              teks: 'Pergi melenggang tanpa mengucap salam penutup',
              respectDelta: -10,
              reaksi: { ekspresi: 'bingung', teks: 'Semoga langkahmu selamat di jalanan Dhaka yang ramai.' },
              catatan: { judul: 'Pentingnya Salam Penutup di Bangladesh', isi: 'Berpamitan dengan hangat menegaskan ikatan persaudaraan yang telah terjalin.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Bondhu (Sahabat Sejati) Bengal', ringkasan: 'Paman Farhan menghadiahkan selendang tenun sutra Jamdani berbenang emas dan menganggapmu keluarga kandung di Dhaka.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Berbudi di Tepian Buriganga', ringkasan: 'Manisnya Rasgulla dan kehangatan teh Doodh Cha menjadi kenangan persahabatan tak terlupakan di Bangladesh.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kehangatan Budaya Delta', ringkasan: 'Memahami arti penting sapaan keluarga dan hidangan manis memperkaya rasa empatimu di Asia Selatan.', badge: 'bronze' }
      ]
    }
  },

  // 4. BHUTAN (bt)
  {
    varName: 'bhutanQuest',
    data: {
      id: 'quest-bt',
      countryId: 'bt',
      negara: 'Bhutan',
      judul: 'Kedamaian Khadhar Dasho Tenzin di Thimphu',
      pengantar: 'Kamu berkunjung ke benteng biara Dzong megah milik Dasho Tenzin di lembah berkabut Thimphu. Di Bhutan, salam hormat Kuzuzangpo La, filosofi kebahagiaan nasional bruto (GNH), adab menolak dengan sopan tiga kali sebelum menerima hidangan (Meshu La), dan mengelilingi stupa searah jarum jam adalah mutiara spiritual di negeri Naga Guntur (Druk Yul).',
      npc: {
        nama: 'Dasho Tenzin',
        peran: 'Cendekiawan Benteng Dzong & Pelindung Budaya',
        avatar: 'DT',
        deskripsi: 'Pria terhormat berpostur tegak mengenakan jubah Gho tenun wol bertali rapi dengan selendang sutra putih Kabney di pundak kirinya.'
      },
      bekal: [
        { id: 'keju_chhurpi', nama: 'Untaian Keju Kering Chhurpi Yak', ikon: 'package', deskripsi: 'Keju susu yak khas pegunungan Himalaya berkalsium tinggi.', kategori: 'oleh-oleh' },
        { id: 'frasa_dzongkha', nama: 'Catatan Ungkapan Kuzuzangpo La', ikon: 'message-square', deskripsi: 'Ungkapan salam Dzongkha, terima kasih (Kadrinchey), dan partikel hormat La.', kategori: 'frasa' },
        { id: 'selendang_khata', nama: 'Syal Sutra Putih Khata Suci', ikon: 'bookmark', deskripsi: 'Syal sutra putih lambang ketulusan dan berkah kedamaian.', kategori: 'pakaian' },
        { id: 'ngultrum_bt', nama: 'Mata Uang Ngultrum Bhutan', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar burung gagak suci dan naga guntur.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'bt_s1',
          latar: 'Jembatan Kayu Beratap Menuju Gerbang Benteng Tashichho Dzong, Thimphu',
          narasi: 'Bendera doa warna-warni berkibar di udara pegunungan Himalaya yang jernih. Dasho Tenzin berdiri menyambut dengan senyum tenang.',
          dialog: { speaker: 'Dasho Tenzin', teks: 'Kuzuzangpo La! Selamat datang ke lembah damai Druk Yul, tanah naga guntur.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bt_c1_kuzuzangpo_bungkuk_rendah',
              teks: 'Membungkuk rendah dengan kedua tangan terbuka ke bawah, menatap hormat, dan ucapkan "Kuzuzangpo La, Dasho"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Kuzuzangpo La! Ketundukan dan partikel La membuktikan jiwa tamumu yang luhur.' },
              catatan: { judul: 'Makna Salam dan Partikel "La" di Bhutan', isi: 'Menambahkan kata "La" di akhir kalimat adalah etiket wajib di Bhutan yang menyatakan kerendahan hati dan rasa hormat takzim.', kategori: 'Bahasa' },
              nextSceneId: 'bt_s2'
            },
            {
              id: 'bt_c1_sapa_kasual_tanpa_la',
              teks: 'Melambaikan tangan dengan sebelah tangan sambil berkata "Halo bro"',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Di hadapan pejabat adat Dzong, bahasa tubuh yang santun adalah cermin ketertiban jiwa.' },
              catatan: { judul: 'Etiket Tata Krama di Benteng Dzong', isi: 'Gaya santai barat dianggap melanggar protokol kesakralan benteng biara di Bhutan.', kategori: 'Etiket' },
              nextSceneId: 'bt_s2'
            }
          ]
        },
        {
          id: 'bt_s2',
          latar: 'Ruang Tamu Kayu Berhias Lukisan Mandala Buddha, Di Dalam Dzong',
          narasi: 'Pelayan menyajikan semangkuk teh mentega asin (Suja) dan beras sangrai Zaow.',
          dialog: { speaker: 'Dasho Tenzin', teks: 'Silakan nikmati teh Suja ini untuk menghangatkan badan dari dinginnya hawa gunung.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bt_c2_etiket_meshu_la',
              teks: 'Menutup mulut dengan tangan sopan dan menolak halus sekali ("Meshu La"), sebelum menerimanya di tawaran kedua dengan kedua tangan',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Kamu paham adat Meshu La: orang beradab tidak rakus langsung menyambar hidangan.' },
              catatan: { judul: 'Tradisi Etiket "Meshu La" di Bhutan', isi: 'Dalam etiket Bhutan, menolak tawaran pertama dengan sopan (Meshu La) sebelum menerimanya di tawaran berikutnya adalah bukti pengendalian diri yang mulia.', kategori: 'Makan' },
              nextSceneId: 'bt_s3'
            },
            {
              id: 'bt_c2_langsung_sambar_minum',
              teks: 'Langsung menyambar mangkuk teh dan menenggaknya rakus sampai berceceran',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Ketenangan adalah kebajikan. Kendalikan nafsumu di tempat suci.' },
              catatan: { judul: 'Pengendalian Diri dalam Budaya Drukpa', isi: 'Sikap tergesa-gesa dalam bersantap dipandang sebagai kurangnya disiplin rohani.', kategori: 'Makan' },
              nextSceneId: 'bt_s3'
            }
          ]
        },
        {
          id: 'bt_s3',
          latar: 'Pelataran Stupa Memorial Chorten di Bawah Sinar Rembulan Pegunungan',
          narasi: 'Para peziarah berjalan pelan memutar mengelilingi stupa putih suci searah jarum jam sambil memutar roda doa mani.',
          dialog: { speaker: 'Dasho Tenzin', teks: 'Kadrinchey La atas kesantunan dan kedamaian yang kamu bawa ke lembah kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'bt_c3_putar_stupa_searah_jarum_jam',
              teks: 'Mengelilingi stupa searah jarum jam (Kora) sambil berucap "Kadrinchey La, Dasho. Tashi Delek!"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Tashi Delek! Berkah keberuntungan dan kedamaian tertinggi menyertai perjalananmu.' },
              catatan: { judul: 'Aturan Kora Searah Jarum Jam di Bhutan', isi: 'Di seluruh situs Buddhis Bhutan, stupa dan roda doa wajib dikelilingi searah jarum jam (kanan ke kiri). Tashi Delek bermakna keberkahan agung.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'bt_c3_putar_stupa_lawan_arah',
              teks: 'Berjalan memotong stupa berlawanan arah jarum jam',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan berjalan melawan arah matahari di sekitar stupa suci!' },
              catatan: { judul: 'Pantangan Berjalan Melawan Arah di Stupa', isi: 'Berjalan berlawanan jarum jam dipandang merusak aliran energi spiritual dalam tradisi Vajrayana.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Pemegang Kebijaksanaan Druk Yul', ringkasan: 'Dasho Tenzin mengalungkan syal Khata sutra putih suci dan mendoakan kebahagiaan sejatimu di puncak pegunungan Himalaya.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Penuh Kedamaian di Thimphu', ringkasan: 'Kehangatan teh Suja dan ketenangan stupa Chorten membekas menjadi kedamaian batin seumur hidup.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kerendahan Hati Bangsa Naga', ringkasan: 'Memahami adab Meshu La dan kesucian ritual Kora memperkaya kematangan jiwamu sebagai pengelana sejati.', badge: 'bronze' }
      ]
    }
  },

  // 5. IRAN (ir)
  {
    varName: 'iranQuest',
    data: {
      id: 'quest-ir',
      countryId: 'ir',
      negara: 'Iran',
      judul: 'Kesenian Taarof Agha Reza di Isfahan',
      pengantar: 'Kamu berkunjung ke rumah tradisional berhalaman kolam pirus milik Agha Reza di kota bersejarah Isfahan (Nesf-e Jahan: Separuh Dunia). Di Iran, seni kesopanan Taarof yang halus, penghormatan pada puisi Hafez, jamuan teh beraroma safron dengan gula batu Nabat, dan adab melepas sepatu di atas karpet Persia adalah puncak peradaban bangsa Persia.',
      npc: {
        nama: 'Agha Reza',
        peran: 'Kurator Seni Kaligrafi & Kolektor Karpet Isfahan',
        avatar: 'AR',
        deskripsi: 'Pria terpelajar berwajah teduh mengenakan jas linen rapi tanpa dasi dengan tutur kata sastrawi yang sangat halus.'
      },
      bekal: [
        { id: 'safron_khorasan', nama: 'Kotak Emas Safron Murni Khorasan', ikon: 'package', deskripsi: 'Pucuk putik bunga safron merah bernilai tinggi khas Persia.', kategori: 'oleh-oleh' },
        { id: 'frasa_farsi', nama: 'Catatan Ungkapan Salaam & Merci', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Merci/Mamnoon), dan etiket Taarof.', kategori: 'frasa' },
        { id: 'buku_puisi_hafez', nama: 'Buku Mini Puisi Hafez Shirazi', ikon: 'bookmark', deskripsi: 'Kumpulan bait puisi cinta spiritual penyair agung Persia.', kategori: 'pakaian' },
        { id: 'toman_ir', nama: 'Uang Toman Kertas Bersih', ikon: 'coins', deskripsi: 'Mata uang yang digunakan sehari-hari di Iran.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'ir_s1',
          latar: 'Gerbang Berhias Mozaik Keramik Bunga Safir, Isfahan',
          narasi: 'Kolam air persegi berubin pirus memantulkan kubah masjid Syekh Lotfollah. Agha Reza berdiri di tepi kolam menyambutmu.',
          dialog: { speaker: 'Agha Reza', teks: 'Salaam! Khosh amadid, Isfahan Nesf-e Jahan menyambutmu dengan penuh kehormatan.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'ir_c1_salam_farsi_dada',
              teks: 'Meletakkan tangan kanan di dada, membungkuk takzim, dan berucap "Salaam Agha Reza, hal-e shoma chetore?"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Khahesh mikonam! Bahasa tubuh dan tutur katamu sangat anggun mencerminkan adab Persia.' },
              catatan: { judul: 'Salam dan Tata Krama Farsi di Iran', isi: 'Menyapa dengan tangan di dada dan menanyakan kabar secara sopan adalah pembuka interaksi yang sangat dihargai di Iran.', kategori: 'Etiket' },
              nextSceneId: 'ir_s2'
            },
            {
              id: 'ir_c1_acungkan_jempol_puji',
              teks: 'Mengacungkan jempol (thumbs-up) ke arah gerbang rumah sambil tersenyum lebar',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan acungkan jempolmu! Dalam tradisi lama kami itu memiliki makna kasar.' },
              catatan: { judul: 'Pantangan Mengacungkan Jempol di Iran', isi: 'Gestur jempol ke atas (thumbs-up) secara tradisional di Iran dipandang memiliki konotasi vulgar dan menghina.', kategori: 'Etiket' },
              nextSceneId: 'ir_s2'
            }
          ]
        },
        {
          id: 'ir_s2',
          latar: 'Ruang Tamu Beralas Permadani Sutra Isfahan Berhias Lampu Kristal',
          narasi: 'Agha Reza menyajikan teh hitam panas dengan sebatang gula batu safron (Nabat) dan kotak manisan Gaz bertabur pistachio.',
          dialog: { speaker: 'Agha Reza', teks: 'Befarma’id! Rumah ini dan segala isinya adalah milikmu, silakan nikmati semuanya.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'ir_c2_pahami_seni_taarof',
              teks: 'Memahami seni Taarof (kesopanan simbolik): menolak dengan rendah hati sekali, berterima kasih "Dastetoon dard nakoneh", lalu mencicipi saat dipersilakan kedua kali',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Afarin! Kamu memahami jiwa Taarof bangsa Persia. Sungguh tamu yang amat terpelajar.' },
              catatan: { judul: 'Seni Kesopanan Taarof di Iran', isi: 'Taarof adalah seni diplomasi sosial di mana tuan rumah merendahkan diri dan tamu menolak tawaran dengan santun sebelum menerimanya untuk menunjukkan rasa tidak serakah.', kategori: 'Etiket' },
              nextSceneId: 'ir_s3'
            },
            {
              id: 'ir_c2_anggap_taarof_literal',
              teks: 'Langsung membungkus seluruh kotak manisan dan berkata "Terima kasih, karena ini milikku aku bawa pulang semuanya sekarang!"',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Itu adalah ungkapan keramahan Taarof, bukan untuk dimaknai secara harfiah kasar.' },
              catatan: { judul: 'Kekeliruan Memahami Taarof Harfiah', isi: 'Memaknai ucapan keramahan Taarof secara harfiah dipandang tidak peka dan merusak harmoni percakapan.', kategori: 'Etiket' },
              nextSceneId: 'ir_s3'
            }
          ]
        },
        {
          id: 'ir_s3',
          latar: 'Jembatan Bersejarah Si-o-se-pol di Bawah Gemintang Malam Isfahan',
          narasi: 'Tiga puluh tiga lengkungan batu jembatan menyala keemasan di atas sungai Zayandeh yang tenang.',
          dialog: { speaker: 'Agha Reza', teks: 'Kheyli mamnoon atas kehangatan persahabatanmu malam ini di kota peradaban kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'ir_c3_khoda_hafez_hafez_quote',
              teks: 'Ucapkan "Dast-e shoma dard nakoneh, Agha Reza. Khoda hafez!" dengan tangan di dada',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Salamat bashid! Semoga langkah hidupmu selalu dipenuhi keindahan syair Hafez.' },
              catatan: { judul: 'Ungkapan Terima Kasih Khas Persia', isi: 'Dastetoon dard nakoneh bermakna puitis "semoga tanganmu tidak pernah sakit" atas jamuan yang disiapkan.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'ir_c3_duduk_arah_kaki_warga',
              teks: 'Duduk di tepian jembatan dengan menyilangkan kaki hingga telapak sepatu mengarah ke wajah orang di sebelahnya',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Arahkan kakimu ke bawah, jangan biarkan telapak sepatumu menghadap orang lain.' },
              catatan: { judul: 'Pantangan Menghadapkan Telapak Sepatu di Iran', isi: 'Mengarahkan telapak sepatu atau kaki ke arah orang lain dianggap merendahkan martabat orang tersebut.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Hamdam (Sahabat Hati) Isfahan', ringkasan: 'Agha Reza menghadiahkan buku seni kaligrafi safron bertuliskan namamu dalam aksara Nasta’liq yang memesona.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Pengelana Beradab di Nesf-e Jahan', ringkasan: 'Kelezatan teh gula Nabat dan keanggunan seni Taarof meninggalkan pemahaman filosofis yang mendalam di Iran.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Diplomasi Budaya Persia', ringkasan: 'Belajar menyelami seni Taarof dan kehalusan budi pekerti Iran memperkaya kebijaksanaan sosialmu.', badge: 'bronze' }
      ]
    }
  },

  // 6. MALDIVES (mv)
  {
    varName: 'maldivesQuest',
    data: {
      id: 'quest-mv',
      countryId: 'mv',
      negara: 'Maladewa',
      judul: 'Kesejukan Mas Huni Harun di Maafushi',
      pengantar: 'Kamu berkunjung ke rumah dinding batu karang putih milik nelayan sepuh Harun di pulau Maafushi. Di Maladewa, ketenangan hidup pulau berlandaskan nilai Islami, sarapan tradisional Mas Huni bersama roti Roshi hangat, dan adab melepas sandal sebelum menginjak teras karang adalah kedamaian sejati kepulauan atol Samudra Hindia.',
      npc: {
        nama: 'Harun',
        peran: 'Pawang Ikan Tuna Atol & Tokoh Nelayan Tradisional',
        avatar: 'HN',
        deskripsi: 'Pria berkulit sawo matang terbakar matahari dengan sarung Mundu tenun bergaris dan senyum teduh penuh kedamaian laut.'
      },
      bekal: [
        { id: 'tuna_valhomas', nama: 'Ikan Tuna Asap Kering Valhomas', ikon: 'package', deskripsi: 'Ikan cakalang asap khas olahan nelayan atol Maladewa.', kategori: 'oleh-oleh' },
        { id: 'frasa_dhivehi', nama: 'Catatan Ungkapan Bahasa Dhivehi', ikon: 'message-square', deskripsi: 'Ungkapan Assalaamu alaikum, Shukuriyaa, dan sapaan pulau.', kategori: 'frasa' },
        { id: 'sarung_mundu', nama: 'Kain Sarung Mundu Tradisional', ikon: 'bookmark', deskripsi: 'Kain sarung nyaman untuk beraktivitas di pemukiman pulau.', kategori: 'pakaian' },
        { id: 'rufiyaa_mv', nama: 'Mata Uang Rufiyaa Maladewa', ikon: 'coins', deskripsi: 'Uang polimer bergambar perahu dhoani dan kehidupan bahari.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'mv_s1',
          latar: 'Jalanan Berpasir Putih Lembut di Bawah Pohon Kelapa, Pulau Maafushi',
          narasi: 'Angin laut berhembus lembut menggoyangkan pelepah kelapa. Harun menyambut di teras rumah berlantai pasir putih bersih.',
          dialog: { speaker: 'Harun', teks: 'Assalaamu alaikum! Maruhabaa, selamat datang ke pulau karang kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mv_c1_salam_lepas_sandal_pasir',
              teks: 'Melepas sandal di tepi jalan berpasir, membalas salam dengan takzim, dan berjabat tangan hangat',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Wa alaikumus salaam! Bersih sekali langkah kakimu, menghargai kebersihan rumah pulau.' },
              catatan: { judul: 'Etiket Melepas Sandal di Maladewa', isi: 'Di pulau-pulau lokal Maladewa, sandal dilepas sebelum melangkah ke area teras rumah berlantai pasir halus atau kayu.', kategori: 'Etiket' },
              nextSceneId: 'mv_s2'
            },
            {
              id: 'mv_c1_masuk_pakai_sepatu_lumpur',
              teks: 'Melangkah masuk dengan sepatu boot kotor berdebu',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Tolong tanggalkan sepatumu di luar, pasir teras rumah dijaga kesuciannya.' },
              catatan: { judul: 'Kebersihan Lantai Pasir Pemukiman Atol', isi: 'Menjaga kebersihan pasir pemukiman adalah bagian penting dari adab hidup masyarakat pulau.', kategori: 'Etiket' },
              nextSceneId: 'mv_s2'
            }
          ]
        },
        {
          id: 'mv_s2',
          latar: 'Teras Rumah Menghadap Birunya Laguna Laut Dangkal',
          narasi: 'Harun menyajikan hidangan sarapan Mas Huni (irisan tuna, kelapa parut, bawang, cabai, dan jeruk limau) bersama roti pipih Roshi.',
          dialog: { speaker: 'Harun', teks: 'Ini Mas Huni buatan keluarga kami. Robeklah rotinya dan nikmatilah bersama.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mv_c2_robek_roshi_tangan_kanan',
              teks: 'Merobek roti Roshi dengan tangan kanan, menyendok Mas Huni gurih, dan memuji kesegaran ikannya',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Ikan tuna segar hasil tangkapan perahu dhoani fajar tadi. Nikmat sekali makan bersamamu.' },
              catatan: { judul: 'Etiket Menyantap Mas Huni Maladewa', isi: 'Mas Huni dimakan dengan menyobek roti Roshi menggunakan tangan kanan dan mencampurnya langsung dengan olahan tuna kelapa.', kategori: 'Makan' },
              nextSceneId: 'mv_s3'
            },
            {
              id: 'mv_c2_makan_tangan_kiri_tumpah',
              teks: 'Mengaduk Mas Huni dengan tangan kiri hingga berceceran di lantai',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Makanlah dengan tangan kanan yang bersih, Nak.' },
              catatan: { judul: 'Adab Makan Tangan Kanan di Maladewa', isi: 'Sebagai negara mayoritas muslim, etiket tangan kanan dipegang teguh dalam kehidupan komunal.', kategori: 'Makan' },
              nextSceneId: 'mv_s3'
            }
          ]
        },
        {
          id: 'mv_s3',
          latar: 'Dermaga Kayu Menghadap Birunya Samudra Hindia Saat Senja',
          narasi: 'Perahu tradisional Dhoani bersandar tenang di perairan atol yang tenang dan berkilau keemasan.',
          dialog: { speaker: 'Harun', teks: 'Shukuriyaa atas kunjunganmu yang penuh ketenangan jiwa di pulau kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mv_c3_shukuriyaa_doa_laut',
              teks: 'Ucapkan "Bodu shukuriyaa, Harun. Semoga laut selalu bersahabat dan memberkahi keluargamu"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Dhaanvee! Semoga angin Samudra Hindia selalu membimbing keselamatan langkahmu.' },
              catatan: { judul: 'Ungkapan Terima Kasih Bahasa Dhivehi', isi: 'Bodu shukuriyaa berarti "terima kasih banyak", memperkokoh tali persahabatan antarinsan bahari.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'mv_c3_buang_sampah_ke_laguna',
              teks: 'Membuang puntung rokok atau sampah plastik ke laut laguna sebelum naik perahu',
              respectDelta: -35,
              reaksi: { ekspresi: 'kecewa', teks: 'Jangan kotori laut kami! Terumbu karang adalah napas kehidupan anak cucu kami!' },
              catatan: { judul: 'Kesadaran Lingkungan Ekologi Karang', isi: 'Membuang sampah ke laut adalah pelanggaran moral berat bagi masyarakat kepulauan karang Maladewa.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Rathehi (Sahabat Karib) Atol', ringkasan: 'Harun menghadiahkan kerang mutiara laut alami dan menyambutmu sebagai bagian dari keluarga nelayan Maafushi.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Tepian Laguna', ringkasan: 'Kelezatan Mas Huni dan damainya semilir angin atol Maladewa menjadi penawar lelah perjalananmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Keselarasan Alam Bahari', ringkasan: 'Belajar menjaga kebersihan pasir dan menghormati kesucian laut membuka kepekaan ekologis budayamu.', badge: 'bronze' }
      ]
    }
  },

  // 7. NEPAL (np)
  {
    varName: 'nepalQuest',
    data: {
      id: 'quest-np',
      countryId: 'np',
      negara: 'Nepal',
      judul: 'Keteduhan Namaskar Dai Pemba di Lembah Kathmandu',
      pengantar: 'Kamu berkunjung ke pemukiman bertingkat bata merah kuno Dai Pemba di dekat stupa agung Boudhanath di Lembah Kathmandu. Di Nepal, salam penuh hormat Namaskar dengan partikel takzim Hajur, pantangan menyentuh orang atau benda suci dengan kaki, dan adab jamuan nasi Dal Bhat adalah jiwa peradaban lereng Himalaya.',
      npc: {
        nama: 'Dai Pemba',
        peran: 'Pelukis Thangka Suci & Pemandu Budaya Himalaya',
        avatar: 'DP',
        deskripsi: 'Pria bersahaja berparas ramah mengenakan rompi wol yak dan topi Dhaka Topi geometris khas tradisi Nepal.'
      },
      bekal: [
        { id: 'teh_ilam', nama: 'Teh Hitam Organik Dataran Tinggi Ilam', ikon: 'package', deskripsi: 'Daun teh beraroma bunga dari lereng pegunungan Himalaya timur.', kategori: 'oleh-oleh' },
        { id: 'frasa_nepali', nama: 'Catatan Ungkapan Namaskar & Hajur', ikon: 'message-square', deskripsi: 'Ungkapan salam takzim, terima kasih (Dhanyabad), dan kata santun Hajur.', kategori: 'frasa' },
        { id: 'topi_dhaka', nama: 'Topi Tradisional Dhaka Topi', ikon: 'bookmark', deskripsi: 'Topi katun bermotif tenun geometris simbol kebanggaan nasional Nepal.', kategori: 'pakaian' },
        { id: 'rupee_np', nama: 'Mata Uang Rupee Nepal', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar puncak Gunung Everest (Sagarmatha).', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'np_s1',
          latar: 'Pelataran Batu Merah di Bawah Tatapan Mata Welas Asih Stupa Boudhanath',
          narasi: 'Asap dupa herbal membubung ke langit biru jernih. Dai Pemba melangkah menyambut di depan sanggar lukis Thangka.',
          dialog: { speaker: 'Dai Pemba', teks: 'Namaskar! Swagatam, selamat datang ke lembah para dewa dan pegunungan salju.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'np_c1_namaskar_hajur_sopan',
              teks: 'Merapatkan kedua telapak tangan di depan dada, menunduk takzim, dan menyapa "Namaskar, Dai! Hajur kasto chha?"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Sanchai chhu! Senang sekali mendengar kata santun Hajur dari lisanmu.' },
              catatan: { judul: 'Kata Hormat "Hajur" dalam Budaya Nepal', isi: 'Hajur adalah partikel kehormatan tertinggi dalam bahasa Nepali yang menunjukkan rasa takzim mendalam kepada orang yang diajak bicara.', kategori: 'Bahasa' },
              nextSceneId: 'np_s2'
            },
            {
              id: 'np_c1_senggol_kaki',
              teks: 'Menyapa santai sambil menjulurkan kaki menyenggol kaki tuan rumah',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Aduh! Jangan menyentuh orang lain dengan kaki, itu sangat tidak sopan!' },
              catatan: { judul: 'Pantangan Menyentuh dengan Kaki di Nepal', isi: 'Kaki dianggap bagian tubuh paling rendah secara spiritual. Menyentuh orang atau barang berharga dengan kaki dianggap penghinaan besar.', kategori: 'Etiket' },
              nextSceneId: 'np_s2'
            }
          ]
        },
        {
          id: 'np_s2',
          latar: 'Ruang Tengah Sanggar Beraroma Cat Mineral Alami dan Emas',
          narasi: 'Nampan kuningan berisi hidangan nasional Dal Bhat (nasi, sup miju-miju lentil, kari sayur tarkari, dan acar pedas achar) dihidangkan hangat.',
          dialog: { speaker: 'Dai Pemba', teks: 'Dal Bhat Power 24 Hour! Mari makan bersama dengan tangan kanan yang bersih.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'np_c2_makan_dal_bhat_tangan_kanan',
              teks: 'Mencampur sedikit kuah dal ke nasi menggunakan ujung jemari tangan kanan dan memakannya dengan lahap tanpa sisa',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Dherai mitho! Cara makanmu mencerminkan penghargaan tulus pada kerja keras petani kami.' },
              catatan: { judul: 'Etiket Santap Dal Bhat di Nepal', isi: 'Dal Bhat dinikmati dengan mencampur nasi dan lentil menggunakan tangan kanan. Menghabiskan sajian menunjukkan rasa syukur.', kategori: 'Makan' },
              nextSceneId: 'np_s3'
            },
            {
              id: 'np_c2_minta_daging_sapi',
              teks: 'Meminta daging sapi panggang kepada tuan rumah di meja makan',
              respectDelta: -35,
              reaksi: { ekspresi: 'kecewa', teks: 'Di Nepal sapi adalah hewan suci yang dilindungi undang-undang dan tidak dikonsumsi!' },
              catatan: { judul: 'Kesucian Sapi dalam Budaya Nepal', isi: 'Sapi adalah hewan nasional dan lambang kesucian ibu pertiwi dalam tradisi Hindu Nepal; daging sapi dilarang keras.', kategori: 'Makan' },
              nextSceneId: 'np_s3'
            }
          ]
        },
        {
          id: 'np_s3',
          latar: 'Lingkaran Putaran Stupa Menjelang Gemerlap Lampu Minyak Senja Hari',
          narasi: 'Para biksu dan warga berjalan hening mengitari stupa putih megah searah jarum jam.',
          dialog: { speaker: 'Dai Pemba', teks: 'Dhanyabad atas perjumpaan penuh kedamaian ini, sahabatku.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'np_c3_dhanyabad_kora_searah',
              teks: 'Ucapkan "Dherai dhanyabad, Dai. Subha yatra!" dengan membungkuk Namaskar dan berjalan mengitari stupa searah jarum jam',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Subha yatra! Semoga berkah Himalaya selalu menaungi jiwamu dengan kedamaian.' },
              catatan: { judul: 'Tradisi Mengitari Stupa di Kathmandu', isi: 'Mengitari stupa (Kora) selalu searah jarum jam sebagai lambang keharmonisan kosmis alam semesta.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'np_c3_langkahi_sesaji',
              teks: 'Melangkahi sesaji bunga di tanah sambil berlari tergesa',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Perhatikan langkahmu, jangan langkahi persembahan doa warga di jalan.' },
              catatan: { judul: 'Menghormati Persembahan di Ruang Publik', isi: 'Sesaji bunga dan beras di jalanan Nepal harus dihindari dengan hati-hati.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Sathi (Kawan Sejati) Himalaya', ringkasan: 'Dai Pemba menghadiahkan lukisan Thangka mata welas asih dan menyambutmu sebagai saudara kehormatan di lembah Kathmandu.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Negeri Para Dewa', ringkasan: 'Kelezatan Dal Bhat dan ketenangan tatapan stupa Boudhanath membekas abadi dalam perjalanan hidupmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesakralan Tanah Sagarmatha', ringkasan: 'Menghormati kesucian sapi dan makna salam Namaskar memperluas kebijaksanaan spiritualmu di Nepal.', badge: 'bronze' }
      ]
    }
  },

  // 8. PAKISTAN (pk)
  {
    varName: 'pakistanQuest',
    data: {
      id: 'quest-pk',
      countryId: 'pk',
      negara: 'Pakistan',
      judul: 'Kemegahan Jamuan Biryani Mian Tariq di Lahore',
      pengantar: 'Kamu berkunjung ke rumah bergaya haveli peninggalan era Mughal milik Mian Tariq di kota budaya Lahore. Di Pakistan, keramahan mehman-nawazi yang luar biasa, jabat tangan erat dua tangan dengan salam di dada, adab dastarkhwan meja santap bersama, dan kehangatan secangkir teh Kashmiri Chai merah muda adalah kebanggaan abadi negeri lembah Sungai Indus.',
      npc: {
        nama: 'Mian Tariq',
        peran: 'Budayawan Kota Tua Lahore & Pemilik Haveli Bersejarah',
        avatar: 'MT',
        deskripsi: 'Pria berwibawa mengenakan setelan Kurta Shalwar Kameez putih bersih dengan rompi bordir beludru dan senyum hangat berkharisma.'
      },
      bekal: [
        { id: 'manisan_gulab_jamun', nama: 'Kotak Manisan Gulab Jamun Hangat', ikon: 'package', deskripsi: 'Bola susu goreng berendam sirup kapulaga wangi mawar.', kategori: 'oleh-oleh' },
        { id: 'frasa_urdu', nama: 'Catatan Ungkapan Bahasa Urdu', ikon: 'message-square', deskripsi: 'Ungkapan Assalam-o-alaikum, Shukriya, dan sapaan Aap kaisay hain.', kategori: 'frasa' },
        { id: 'syal_pashmina_pk', nama: 'Syal Wol Pashmina Indus', ikon: 'bookmark', deskripsi: 'Syal wol lembut tenunan tangan lereng pegunungan Karakoram.', kategori: 'pakaian' },
        { id: 'rupee_pk', nama: 'Mata Uang Rupee Pakistan', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar pendiri bangsa Quaid-e-Azam Muhammad Ali Jinnah.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'pk_s1',
          latar: 'Pelataran Haveli Berarsitektur Bata Merah Mughal di Dekat Masjid Badshahi, Lahore',
          narasi: 'Lengkungan kubah megah terbentang di bawah langit petang. Mian Tariq menyambut dengan kedua tangan terbuka di gerbang ukir jati.',
          dialog: { speaker: 'Mian Tariq', teks: 'Assalam-o-alaikum! Khush amdeed, mehman hamare liye rehmat hain (tamu adalah anugerah berkah).', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'pk_c1_salam_dua_tangan_urdu',
              teks: 'Menjawab salam lengkap, bersalaman erat dengan kedua tangan, lalu meletakkan tangan kanan di dada sambil menanyakan kabar',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Wa alaikum assalam! Masya Allah, kehangatan jabat tanganmu mencerminkan jiwa tamu agung.' },
              catatan: { judul: 'Tradisi Mehman-Nawazi di Pakistan', isi: 'Masyarakat Pakistan memuliakan tamu (mehman) dengan jabat tangan dua belah tangan dan sambutan penuh cinta kasih kekeluargaan.', kategori: 'Etiket' },
              nextSceneId: 'pk_s2'
            },
            {
              id: 'pk_c1_jabat_ujung_jari_dingin',
              teks: 'Menjulurkan dua jari secara dingin tanpa kontak mata',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Di Lahore, persahabatan dimulai dengan kehangatan genggaman yang tulus.' },
              catatan: { judul: 'Pentingnya Kontak Mata dan Genggaman Hangat', isi: 'Jabat tangan dingin tanpa ekspresi dipandang sebagai sikap enggan atau tidak menghargai tuan rumah.', kategori: 'Etiket' },
              nextSceneId: 'pk_s2'
            }
          ]
        },
        {
          id: 'pk_s2',
          latar: 'Ruang Jamuan Dastarkhwan Berhias Kaligrafi dan Lilin Kuningan',
          narasi: 'Nampan perak berisi hidangan nasi Biryani kambing rempah harum dan mangkuk Kashmiri Chai merah muda disajikan di atas dastarkhwan.',
          dialog: { speaker: 'Mian Tariq', teks: 'Bismillāh, nikmatilah Biryani Lahore ini. Di rumah kami, piring tamu tidak boleh sampai kosong.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'pk_c2_santap_tangan_kanan_puji_biryani',
              teks: 'Menyantap dengan tangan kanan secara rapi, menerima suapan tambahan dengan senang hati, dan memuji kelezatannya: "Lajawab!"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Lajawab! Senang sekali melihat tamu menikmati jamuan masakan keluarga kami dengan berselera.' },
              catatan: { judul: 'Etiket Menjamu Dastarkhwan Pakistan', isi: 'Tuan rumah di Pakistan akan berulang kali menawarkan porsi tambahan. Menerima sedikit tambahan dan memuji rasa masakan sangat membahagiakan hati mereka.', kategori: 'Makan' },
              nextSceneId: 'pk_s3'
            },
            {
              id: 'pk_c2_tolak_kasar_sisa_makanan',
              teks: 'Mendorong piring dengan kasar dan menyisakan banyak makanan berantakan',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Menyisakan makanan tanpa adab menandakan kurangnya rasa syukur pada rezeki.' },
              catatan: { judul: 'Menghormati Makanan Jamuan Bersama', isi: 'Menyisakan makanan secara mubazir dipandang tidak beradab di hadapan tuan rumah.', kategori: 'Makan' },
              nextSceneId: 'pk_s3'
            }
          ]
        },
        {
          id: 'pk_s3',
          latar: 'Balkon Atas Haveli Menatap Menara Masjid Badshahi di Bawah Bulan Purnama',
          narasi: 'Angin malam berhembus lembut membawa aroma bunga melati Motia yang harum menenangkan.',
          dialog: { speaker: 'Mian Tariq', teks: 'Bohat shukriya atas kehadiranmu yang telah menghidupkan suasana haveli kami malam ini.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'pk_c3_shukriya_khuda_hafiz',
              teks: 'Ucapkan "Bohat shukriya, Mian Tariq. Khuda hafiz, semoga kemakmuran selalu menyertai Lahore"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Fi Amanillah! Rumah kami akan selalu menyambut kedatanganmu kembali, saudaraku.' },
              catatan: { judul: 'Doa Perlindungan Bahasa Urdu', isi: 'Fi Amanillah bermakna "semoga kamu berada dalam perlindungan Allah", doa terindah bagi pengelana.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'pk_c3_pamit_acuh_tergesa',
              teks: 'Berlari menuruni tangga tanpa membalas ucapan pamitan tuan rumah',
              respectDelta: -10,
              reaksi: { ekspresi: 'bingung', teks: 'Hati-hati melangkah menuruni tangga kuno kami, Nak.' },
              catatan: { judul: 'Ketertiban Berpamitan di Haveli', isi: 'Pamitan yang tenang meneguhkan kesan persahabatan yang abadi.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Dost-e Khaas (Sahabat Istimewa) Lahore', ringkasan: 'Mian Tariq mengalungkan syal pashmina tenun halus dan menyebutmu sebagai keluarga terhormat di tanah Pakistan.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Berbudi di Kota Mughal', ringkasan: 'Kelezatan Biryani Lahore dan kehangatan tradisi Mehman-Nawazi menjadi pelita persahabatan dalam hatimu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kemuliaan Tradisi Mehman', ringkasan: 'Memahami adab dastarkhwan dan kemuliaan memuliakan tamu memperdalam pemahaman budayamu di Asia Selatan.', badge: 'bronze' }
      ]
    }
  },

  // 9. SRI LANKA (lk)
  {
    varName: 'sriLankaQuest',
    data: {
      id: 'quest-lk',
      countryId: 'lk',
      negara: 'Sri Lanka',
      judul: 'Kehangatan Teh Ceylon Silva di Kandy',
      pengantar: 'Kamu berkunjung ke lereng perkebunan teh perbukitan berkabut milik Silva di kota suci Kandy. Di Sri Lanka, salam bertangkup tangan Ayubowan (semoga panjang umur), kesucian kuil gigi Buddha (Sri Dalada Maligawa), teh hitam Ceylon kelas dunia, dan adab santap nasi kari pedas berdaun pisang adalah mutiara peradaban pulau permata Samudra Hindia.',
      npc: {
        nama: 'Silva',
        peran: 'Empu Perkebunan Teh Dataran Tinggi Kandy',
        avatar: 'SV',
        deskripsi: 'Pria bersahaja berwajah ramah mengenakan sarung Sarong katun tenun rapi dengan kemeja putih bersahaja dan senyum penuh welas asih.'
      },
      bekal: [
        { id: 'teh_ceylon_kandy', nama: 'Kaleng Daun Teh Hitam Ceylon Murni', ikon: 'package', deskripsi: 'Teh hitam beraroma buah kering dari perkebunan tinggi Nuwara Eliya.', kategori: 'oleh-oleh' },
        { id: 'frasa_sinhala', nama: 'Catatan Ungkapan Ayubowan Sinhala', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Bohoma Sthuthi), dan doa berkah.', kategori: 'frasa' },
        { id: 'kain_putih_vihara', nama: 'Kain Selendang Katun Putih Bersih', ikon: 'bookmark', deskripsi: 'Pakaian putih sopan untuk mengunjungi pelataran suci kuil vihara.', kategori: 'pakaian' },
        { id: 'rupee_lk', nama: 'Mata Uang Rupee Sri Lanka', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar burung endemik dan bendungan sejarah.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'lk_s1',
          latar: 'Beranda Kayu Perkebunan Teh Menghadap Danau Kandy yang Teduh',
          narasi: 'Embun pagi membasahi pucuk-pucuk daun teh hijau berkilauan. Silva berdiri di teras depan menyambut kedatanganmu.',
          dialog: { speaker: 'Silva', teks: 'Ayubowan! Selamat datang ke perbukitan sejuk kota bersejarah Kandy.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'lk_c1_salam_ayubowan_tangkup',
              teks: 'Menangkupkan kedua telapak tangan di depan dada, sedikit membungkuk takzim, dan berucap "Ayubowan"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Ayubowan! Semoga umur panjang dan kedamaian memayungi hidupmu.' },
              catatan: { judul: 'Makna Salam Ayubowan di Sri Lanka', isi: 'Ayubowan adalah doa restu terindah bangsa Sinhala yang bermakna "semoga kamu dianugerahi umur panjang dan kesehatan prima".', kategori: 'Bahasa' },
              nextSceneId: 'lk_s2'
            },
            {
              id: 'lk_c1_lambaian_tangan_kasual',
              teks: 'Melambaikan tangan satu tangan sambil mengunyah permen karet santai',
              respectDelta: -15,
              reaksi: { ekspresi: 'kecewa', teks: 'Di kota suci Kandy, salam diucapkan dengan ketundukan doa yang hening.' },
              catatan: { judul: 'Ketakziman Sikap di Kota Warisan Dunia Kandy', isi: 'Sikap santai berlebihan di kota suci Kandy dipandang kurang menghargai tradisi lokal.', kategori: 'Etiket' },
              nextSceneId: 'lk_s2'
            }
          ]
        },
        {
          id: 'lk_s2',
          latar: 'Meja Bundar Jati di Serambi Menghadap Lembah Hijau',
          narasi: 'Silva menuangkan teh hitam Ceylon keemasan dari poci porselen dan menyajikan hidangan nasi kari di atas daun pisang segar.',
          dialog: { speaker: 'Silva', teks: 'Ini teh Ceylon hasil petikan fajar kami. Nikmatilah selagi hangat bersama hidangan kari kelapa.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'lk_c2_santap_tangan_kanan_daun_pisang',
              teks: 'Menikmati hidangan nasi kari menggunakan ujung jemari tangan kanan secara tertib dan menghirup aroma tehnya',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Menyantap dengan ujung jemari tangan kanan adalah seni makan asli pulau kami.' },
              catatan: { judul: 'Etiket Santap Tangan Kanan di Sri Lanka', isi: 'Nasi dan kari dinikmati dengan jemari tangan kanan tanpa menyentuh telapak tangan agar tetap bersih dan beradab.', kategori: 'Makan' },
              nextSceneId: 'lk_s3'
            },
            {
              id: 'lk_c2_foto_belakangi_patung_buddha',
              teks: 'Berdiri membelakangi patung suci Buddha di sudut ruangan untuk berfoto selfie',
              respectDelta: -35,
              reaksi: { ekspresi: 'kecewa', teks: 'Hentikan! Jangan pernah membelakangi patung Buddha saat berfoto!' },
              catatan: { judul: 'Pantangan Keras Membelakangi Patung Buddha di Sri Lanka', isi: 'Membelakangi patung Buddha untuk berfoto dianggap penodaan agama serius yang dilarang keras secara hukum dan budaya di Sri Lanka.', kategori: 'Etiket' },
              nextSceneId: 'lk_s3'
            }
          ]
        },
        {
          id: 'lk_s3',
          latar: 'Pelataran Luar Kuil Sri Dalada Maligawa Saat Senja Menyala Lilin Kuningan',
          narasi: 'Aroma bunga kamboja putih dan ketukan genderang kuil bergema syahdu di tepian danau Kandy.',
          dialog: { speaker: 'Silva', teks: 'Bohoma sthuthi telah menghormati kesucian dan tradisi leluhur kami hari ini.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'lk_c3_bohoma_sthuthi_doa',
              teks: 'Ucapkan "Bohoma sthuthi, Silva. Suba gaman (semoga perjalanan penuh berkah)!" dengan salam Ayubowan',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Suba davasak! Semoga langkahmu diberkahi kedamaian di setiap penjuru dunia.' },
              catatan: { judul: 'Ucapan Terima Kasih Bahasa Sinhala', isi: 'Bohoma sthuthi bermakna "terima kasih banyak", meneguhkan persahabatan tulus di tanah permata.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'lk_c3_masuk_kuil_sepatu_topi',
              teks: 'Berjalan masuk ke pelataran kuil dengan memakai topi dan sepatu luar',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Tanggalkan topi dan alas kakimu sebelum menginjak pelataran suci kuil!' },
              catatan: { judul: 'Aturan Masuk Tempat Ibadah di Sri Lanka', isi: 'Melepas alas kaki dan penutup kepala adalah kewajiban mutlak di seluruh situs keagamaan Sri Lanka.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Mithura (Sahabat Karib) Kandy', ringkasan: 'Silva menghadiahkan kotak kayu berukir berisi teh Ceylon pilihan dan mengangkatmu sebagai kawan sejati di perbukitan Sri Lanka.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Pulau Permata', ringkasan: 'Keharuman teh Ceylon dan keteduhan salam Ayubowan menjadi kenangan persahabatan yang damai di hatimu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesakralan Negeri Ayubowan', ringkasan: 'Menghormati etika patung suci dan tata krama santap memperkaya kedewasaan budayamu di Samudra Hindia.', badge: 'bronze' }
      ]
    }
  }
];

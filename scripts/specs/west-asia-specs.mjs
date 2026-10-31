export const westAsiaQuests = [
  // 1. ARMENIA (am)
  {
    varName: 'armeniaQuest',
    data: {
      id: 'quest-am',
      countryId: 'am',
      negara: 'Armenia',
      judul: 'Kehangatan Roti Lavash Garo di Yerevan',
      pengantar: 'Kamu berkunjung ke rumah batu tuff merah muda milik perajin roti Garo di lereng menghadap Gunung Ararat di Yerevan. Di Armenia, kesucian roti tipis Lavash (warisan takbenda UNESCO), salam hangat jabat tangan erat, dan jamuan kopi Soorj adalah bukti keluhuran bangsa di persimpangan Kaukasus.',
      npc: { nama: 'Garo', peran: 'Empu Pembuat Roti Lavash Tonir & Musisi Duduk', avatar: 'GR', deskripsi: 'Pria berambut perak dengan senyum hangat, mengenakan rompi wol tradisional dan celemek pemanggang roti tanah liat.' },
      bekal: [
        { id: 'aprikot_kering_am', nama: 'Kotak Buah Aprikot Emas Tsiran', ikon: 'package', deskripsi: 'Buah aprikot manis lambang kebanggaan nasional Armenia.', kategori: 'oleh-oleh' },
        { id: 'frasa_armenia', nama: 'Catatan Ungkapan Barev Dzez', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Shnorhakalutyun), dan doa.', kategori: 'frasa' },
        { id: 'alat_tiup_duduk', nama: 'Suling Kayu Aprikot Duduk', ikon: 'bookmark', deskripsi: 'Instrumen tiup kayu aprikot bersuara merdu menyentuh kalbu.', kategori: 'pakaian' },
        { id: 'dram_am', nama: 'Mata Uang Dram Armenia', ikon: 'coins', deskripsi: 'Uang kertas dram bersih bergambar situs biara bersejarah.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'am_s1',
          latar: 'Pelataran Batu Tuff Merah Muda Menghadap Siluet Ararat, Yerevan',
          narasi: 'Asap pemanggang tonir menguarkan aroma gandum matang. Garo berdiri menyambut dengan tangan terbuka.',
          dialog: { speaker: 'Garo', teks: 'Barev dzez! Selamat datang ke tanah berakar kuno di kaki Gunung Ararat.', ekspresi: 'senang' },
          pilihan: [
            { id: 'am_c1_salam_erat_tatap_mata', teks: 'Jabat tangan erat dengan senyuman tulus, tatap matanya, dan ucapkan "Barev dzez, Garo!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Barev! Jabat tangan yang kuat dan tatapan jujur mencerminkan jiwa sahabat sejati.' }, catatan: { judul: 'Jabat Tangan dan Kontak Mata di Armenia', isi: 'Masyarakat Armenia sangat menghargai jabat tangan erat dan kontak mata langsung sebagai bukti kejujuran niat.', kategori: 'Etiket' }, nextSceneId: 'am_s2' },
            { id: 'am_c1_jabat_lemas_buang_muka', teks: 'Menyodorkan tangan lemas sambil membuang pandangan ke arah lain', respectDelta: -15, reaksi: { ekspresi: 'kecewa', teks: 'Di Kaukasus, sahabat saling memandang mata dengan keterbukaan jiwa.' }, catatan: { judul: 'Pentingnya Ketulusan dalam Perjumpaan', isi: 'Menghindari kontak mata dipandang sebagai tanda keraguan atau ketidakterbukaan.', kategori: 'Etiket' }, nextSceneId: 'am_s2' }
          ]
        },
        {
          id: 'am_s2',
          latar: 'Ruang Pemanggang Tanah Liat Bawah Tanah (Tonir)',
          narasi: 'Lembaran roti tipis Lavash yang baru diangkat dari dinding pemanggang disajikan bersama keju kambing segar dan daun tarragon.',
          dialog: { speaker: 'Garo', teks: 'Roti Lavash adalah lambang berkah pangan keluarga kami. Robeklah dengan kedua tanganmu.', ekspresi: 'senang' },
          pilihan: [
            { id: 'am_c2_robek_lavash_dua_tangan', teks: 'Mematahkan roti Lavash dengan kedua tangan secara takzim dan membungkus keju dengan lembut', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Bari akhorzhak (selamat menikmati)! Begitulah leluhur kami memuliakan roti kehidupan.' }, catatan: { judul: 'Kesucian Roti Lavash UNESCO', isi: 'Roti Lavash dipandang sebagai simbol perdamaian dan kemakmuran keluarga; dimakan dengan dua tangan penuh rasa syukur.', kategori: 'Makan' }, nextSceneId: 'am_s3' },
            { id: 'am_c2_lempar_roti_meja', teks: 'Melemparkan roti ke atas meja dan menginjak remahannya tanpa peduli', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Jangan remehkan roti Lavash! Menghamburkan roti adalah perbuatan tabu.' }, catatan: { judul: 'Menghormati Berkah Roti di Armenia', isi: 'Roti diperlakukan dengan penuh ketakziman dan remahannya tidak boleh dibuang sembarangan.', kategori: 'Makan' }, nextSceneId: 'am_s3' }
          ]
        },
        {
          id: 'am_s3',
          latar: 'Beranda Luar di Bawah Naungan Rambatan Buah Anggur Menjelang Petang',
          narasi: 'Alunan suling Duduk mengalun sendu membelah keheningan sore kota Yerevan.',
          dialog: { speaker: 'Garo', teks: 'Shnorhakalutyun atas kehadiranmu yang telah menghangatkan perapian rumah kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'am_c3_shnorhakalutyun_doa', teks: 'Ucapkan "Shnorhakalutyun, Garo. Tstesutyun, semoga damai menyertai Armenia!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Hajoghutyun! Semoga langkah hidupmu selalu dipenuhi cahaya persahabatan.' }, catatan: { judul: 'Ungkapan Terima Kasih Bahasa Armenia', isi: 'Shnorhakalutyun adalah ungkapan terima kasih yang tulus dan Tstesutyun bermakna sampai jumpa kembali.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'am_c3_pamit_kasar', teks: 'Pergi tanpa mengucap salam penutup', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga langkahmu terlindungi di jalanan berliku.' }, catatan: { judul: 'Kehangatan Pamitan Kaukasus', isi: 'Berpamitan dengan hangat menegaskan persaudaraan yang abadi.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Enker (Sahabat Sejati) Yerevan', ringkasan: 'Garo menghadiahkan suling Duduk kayu aprikot bertatahkan perak dan mengangkatmu sebagai saudara di kaki Ararat.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Tanah Tuff Merah Muda', ringkasan: 'Kelezatan roti Lavash dan sendunya alunan suling Duduk tertanam abadi dalam jiwamu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesantunan Kaukasus', ringkasan: 'Memahami kesucian roti Lavash dan arti jabat tangan erat memperkaya kepekaan budayamu di Armenia.', badge: 'bronze' }
      ]
    }
  },

  // 2. AZERBAIJAN (az)
  {
    varName: 'azerbaijanQuest',
    data: {
      id: 'quest-az',
      countryId: 'az',
      negara: 'Azerbaijan',
      judul: 'Kilau Teh Armudu Dayi Elmir di Baku',
      pengantar: 'Kamu berkunjung ke rumah berhalaman ubin batu kuno Dayi Elmir di dalam benteng Icherisheher, kota tua Baku. Di Azerbaijan, upacara minum teh Çay dalam gelas kaca ramping berbentuk buah pir (Armudu), manisan selai ceri putih, dan filosofi keramahan negeri api (Odlar Yurdu) adalah mutiara peradaban Kaspia.',
      npc: { nama: 'Dayi Elmir', peran: 'Peniup Musik Balaban & Sesepuh Benteng Kuno', avatar: 'DE', deskripsi: 'Pria sepuh ramah mengenakan rompi wol abu-abu dan topi pet kulit khas Baku dengan senyum hangat bersahaja.' },
      bekal: [
        { id: 'selai_ceri_putih', nama: 'Toples Selai Ceri Putih (Ağ Gilas)', ikon: 'package', deskripsi: 'Selai buah ceri putih manis teman minum teh khas Azerbaijan.', kategori: 'oleh-oleh' },
        { id: 'frasa_azerbaijan', nama: 'Catatan Ungkapan Salam & Çox Sağ Ol', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Sağ ol), dan sapaan hormat Dayi.', kategori: 'frasa' },
        { id: 'gelas_armudu', nama: 'Gelas Kristal Bentuk Pir Armudu', ikon: 'bookmark', deskripsi: 'Gelas khas penahan panas teh di bagian bawah dan penyejuk di bagian atas.', kategori: 'pakaian' },
        { id: 'manat_az', nama: 'Mata Uang Manat Azerbaijan', ikon: 'coins', deskripsi: 'Uang kertas manat resmi bergambar instrumen musik Tar tradisional.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'az_s1',
          latar: 'Gerbang Batu Kuno Icherisheher Menghadap Menara Maiden Tower, Baku',
          narasi: 'Angin laut Kaspia berhembus sejuk di sela dinding batu pasir kuno. Dayi Elmir berdiri menyambutmu di muka pintu kayu tembaga.',
          dialog: { speaker: 'Dayi Elmir', teks: 'Salam alekum! Xoş gəlmisiniz, selamat datang ke kota tua bersejarah Baku.', ekspresi: 'senang' },
          pilihan: [
            { id: 'az_c1_salam_hangat_forsa', teks: 'Menjawab salam dengan takzim, bersalaman erat, dan menyapa "Salam alekum, Dayi Elmir! Xoş gördük"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Çox gözəl! Memanggil dengan sebutan Dayi (paman) menandakan jiwa yang beradab.' }, catatan: { judul: 'Sebutan Keakraban Dayi di Azerbaijan', isi: 'Memanggil tetua dengan sebutan "Dayi" (paman) menciptakan suasana kekeluargaan yang sangat dihargai di Azerbaijan.', kategori: 'Bahasa' }, nextSceneId: 'az_s2' },
            { id: 'az_c1_salam_dingin', teks: 'Hanya mengangguk kaku tanpa membalas salam dan langsung melihat jam tangan', respectDelta: -15, reaksi: { ekspresi: 'kecewa', teks: 'Di negeri kami, keramahan perjumpaan tidak boleh dibatasi oleh ketergesaan waktu.' }, catatan: { judul: 'Adab Waktu Tamu di Baku', isi: 'Masyarakat Azerbaijan memandang santai waktu saat menjamu tamu demi menjaga kualitas persaudaraan.', kategori: 'Etiket' }, nextSceneId: 'az_s2' }
          ]
        },
        {
          id: 'az_s2',
          latar: 'Ruang Tamu Tradisional Beralas Karpet Quba Merah',
          narasi: 'Samovar tembaga mendidih menyebarkan aroma teh hitam Ceylon wangi bergamot dan timi kekik (Kəklikotu).',
          dialog: { speaker: 'Dayi Elmir', teks: 'Minumlah teh di gelas Armudu ini bersama sepotong gula batu (Qənd). Jangan aduk gulanya di dalam teh.', ekspresi: 'senang' },
          pilihan: [
            { id: 'az_c2_minum_teh_qand_celup', teks: 'Mencelupkan sedikit gula batu ke teh, menggigit kecil gula di mulut, lalu menyeruput teh panas dari gelas Armudu', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Nuş olsun! Begitulah cara sejati menikmati teh bangsa Azerbaijan.' }, catatan: { judul: 'Tradisi Minum Teh Gula Gigit di Azerbaijan', isi: 'Tradisi Qənd qənding: gula batu digigit di gigi sebelum teh diseruput agar rasa manis dan pahit teh berpadu sempurna.', kategori: 'Makan' }, nextSceneId: 'az_s3' },
            { id: 'az_c2_buang_teh_tidak_habis', teks: 'Menolak minum teh dan meminta minuman kaleng dingin bersoda', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Menolak teh di Azerbaijan sama dengan menolak jalinan persahabatan.' }, catatan: { judul: 'Kedudukan Sakral Teh di Azerbaijan', isi: 'Teh adalah simbol diplomasi dan perdamaian keluarga; menolak teh dipandang sebagai penolakan relasi sosial.', kategori: 'Makan' }, nextSceneId: 'az_s3' }
          ]
        },
        {
          id: 'az_s3',
          latar: 'Balkon Kayu Mengarah ke Teluk Laut Kaspia Saat Malam',
          narasi: 'Menara Api Flame Towers berkilauan megah di kejauhan langit malam Baku.',
          dialog: { speaker: 'Dayi Elmir', teks: 'Çox sağ olun atas perbincangan hangat yang memperkaya malam ini.', ekspresi: 'senang' },
          pilihan: [
            { id: 'az_c3_cox_sag_olun_doa', teks: 'Ucapkan "Çox sağ olun, Dayi Elmir. Xuda hafiz, semoga Baku selalu bercahaya damai"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Yolun açıq olsun! Semoga jalanmu selalu terbuka terang dalam kebaikan.' }, catatan: { judul: 'Doa Jalan Terbuka Bahasa Azerbaijan', isi: 'Yolun açıq olsun (semoga jalanmu terbuka lapang) adalah doa pamitan terindah bagi sahabat pengelana.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'az_c3_pamit_gesa_tanpa_kata', teks: 'Bergegas lari menuruni tangga tanpa berpamitan', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Hati-hati menuruni undakan tangga batu kuno kami.' }, catatan: { judul: 'Keberkahan Penutup Perjumpaan', isi: 'Mengakhiri kunjungan dengan doa menegaskan kesan baik yang abadi.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Dost (Kawan Akrab) Icherisheher', ringkasan: 'Dayi Elmir menghadiahkan satu set gelas Armudu kristal berukir perak dan menganggapmu keluarga kehormatan di Baku.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Negeri Api', ringkasan: 'Kenikmatan teh timi Kəklikotu dan hangatnya obrolan samovar menjadi kenangan manis di tepi Laut Kaspia.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Tradisi Teh Kaspia', ringkasan: 'Menghargai filosofi gelas Armudu dan adab keramahan memperkaya wawasan budayamu di Azerbaijan.', badge: 'bronze' }
      ]
    }
  },

  // 3. BAHRAIN (bh)
  {
    varName: 'bahrainQuest',
    data: {
      id: 'quest-bh',
      countryId: 'bh',
      negara: 'Bahrain',
      judul: 'Manisan Halwa Bu Jasim di Muharraq',
      pengantar: 'Kamu berkunjung ke rumah berarsitektur pintu angin Badgir milik penyelam mutiara sepuh Bu Jasim di pulau bersejarah Muharraq. Di Bahrain, keharuman kopi Arab Gahwa kapulaga safron, manisan Halwa Bahrain merah hangat, dan kerendahan hati masyarakat dua laut adalah mutiara peradaban Teluk Persia.',
      npc: { nama: 'Bu Jasim', peran: 'Tetua Penyelam Mutiara Tradisional & Tokoh Budaya', avatar: 'BJ', deskripsi: 'Pria sepuh berwajah teduh mengenakan jubah Thobe putih bersih, ghutra putih bersahaja, dan senyum ramah khas pelaut mutiara.' },
      bekal: [
        { id: 'halwa_bahrain', nama: 'Kotak Manisan Halwa Bahrain Merah', ikon: 'package', deskripsi: 'Manisan agar-agar pati kanji kapulaga bertabur kacang mete goreng.', kategori: 'oleh-oleh' },
        { id: 'frasa_bahrain', nama: 'Catatan Ungkapan Marhaba & Mashkur', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Mashkoor), dan adab majlis.', kategori: 'frasa' },
        { id: 'mutiara_teluk', nama: 'Mutiara Air Asin Alami Muharraq', ikon: 'bookmark', deskripsi: 'Kilau mutiara murni hasil selaman laut tanpa budidaya buatan.', kategori: 'pakaian' },
        { id: 'dinar_bh', nama: 'Mata Uang Dinar Bahrain', ikon: 'coins', deskripsi: 'Mata uang bernilai tinggi resmi Kerajaan Bahrain.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'bh_s1',
          latar: 'Lorong Beratap Teduh di Jalur Mutiara (Pearling Path), Muharraq',
          narasi: 'Menara angin badgir menangkap hembusan angin laut sejuk. Bu Jasim menyambut di ambang gerbang majlis.',
          dialog: { speaker: 'Bu Jasim', teks: 'Marhaba! Ahlan wa sahlan, selamat datang ke pulau penyelam mutiara Muharraq.', ekspresi: 'senang' },
          pilihan: [
            { id: 'bh_c1_salam_dada_bahrain', teks: 'Menjawab salam dengan takzim, meletakkan tangan kanan di dada, dan membungkuk hormat', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Hala bik! Adab tangan di dada menunjukkan ketulusan hati yang jernih laksana mutiara.' }, catatan: { judul: 'Salam Penuh Hormat di Bahrain', isi: 'Masyarakat Bahrain menyambut salam dengan meletakkan tangan di dada sebagai lambang ketulusan dan keterbukaan jiwa.', kategori: 'Etiket' }, nextSceneId: 'bh_s2' },
            { id: 'bh_c1_masuk_pakai_sepatu', teks: 'Melangkah masuk ke atas karpet majlis tanpa melepas sepatu berdebu', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Tolong lepas alas kakimu di luar teras majlis, karpet dijaga kebersihannya.' }, catatan: { judul: 'Aturan Masuk Majlis di Bahrain', isi: 'Sepatu luar wajib ditanggalkan di ambang pintu sebelum menginjak karpet majlis tempat duduk komunal.', kategori: 'Etiket' }, nextSceneId: 'bh_s2' }
          ]
        },
        {
          id: 'bh_s2',
          latar: 'Ruang Duduk Majlis Berbantal Empuk Berhias Miniatur Perahu Dhow',
          narasi: 'Pelayan menuangkan kopi Gahwa kuning keemasan beraroma kapulaga ke dalam cangkir kecil Finjan tanpa gagang.',
          dialog: { speaker: 'Bu Jasim', teks: 'Cicipilah Halwa Bahrain hangat ini bersama secangkir Gahwa rempah kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'bh_c2_terima_kanan_goyang_cangkir', teks: 'Menerima finjan dengan tangan kanan, menikmati rasanya, dan menggoyangkan cangkir dari sisi ke sisi saat sudah cukup', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali! Kamu paham isyarat goyangan finjan tanda sudah selesai minum kopi.' }, catatan: { judul: 'Etiket Menggoyangkan Finjan di Teluk', isi: 'Menggoyangkan cangkir finjan dengan pergelangan tangan memberi isyarat santun bahwa tamu sudah cukup dan tidak ingin dituangi lagi.', kategori: 'Makan' }, nextSceneId: 'bh_s3' },
            { id: 'bh_c2_terima_kiri_taruh_lantai', teks: 'Meraih finjan dengan tangan kiri dan meletakkannya terbalik di lantai', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Gunakan tangan kanan untuk menerima kopi, itu etiket kebersihan kami.' }, catatan: { judul: 'Pantangan Tangan Kiri dalam Jamuan Gahwa', isi: 'Menerima kopi dengan tangan kiri dipandang tidak sopan dalam adat istiadat Arab Teluk.', kategori: 'Makan' }, nextSceneId: 'bh_s3' }
          ]
        },
        {
          id: 'bh_s3',
          latar: 'Teras Menghadap Laut Dangkal Saat Semburat Senja Menyala',
          narasi: 'Air pasang naik perlahan membasahi tiang-tiang dermaga perahu dhow bersejarah.',
          dialog: { speaker: 'Bu Jasim', teks: 'Mashkoor atas kunjungan yang membawa keceriaan di rumah kami hari ini.', ekspresi: 'senang' },
          pilihan: [
            { id: 'bh_c3_mashkoor_doa_berkah', teks: 'Ucapkan "Mashkoor jiddan, Bu Jasim. Ma’a as-salaamah, semoga laut selalu memberi berkah melimpah"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Fi amanillah! Semoga perjalananmu di laut kehidupan selalu dipenuhi mutiara kebajikan.' }, catatan: { judul: 'Ucapan Terima Kasih Bahasa Arab Teluk', isi: 'Mashkoor (terima kasih) diiringi doa keberkahan menutup silaturahmi dengan keluhuran budi.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'bh_c3_tinggalkan_ruangan_acuh', teks: 'Bergegas pergi tanpa mengucap salam perpisahan', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga keselamatan selalu menemanimu berlayar.' }, catatan: { judul: 'Keutamaan Pamitan Santun', isi: 'Pamitan yang beradab meneguhkan ikatan persahabatan di kepulauan dua laut.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Nokhatha (Kapten Kehormatan) Muharraq', ringkasan: 'Bu Jasim menghadiahkan butiran mutiara alami Teluk dalam kotak beludru dan menyambutmu sebagai sahabat sejati di Bahrain.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Majlis Mutiara', ringkasan: 'Manisnya Halwa kapulaga dan hangatnya aroma kopi Gahwa membekas menjadi kenangan indah di tanah Bahrain.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Jamuan Arab Teluk', ringkasan: 'Memahami isyarat finjan dan kesopanan majlis memperdalam wawasan sosialmu di Timur Tengah.', badge: 'bronze' }
      ]
    }
  },

  // 4. CYPRUS (cy)
  {
    varName: 'cyprusQuest',
    data: {
      id: 'quest-cy',
      countryId: 'cy',
      negara: 'Siprus',
      judul: 'Keju Halloumi Panggang Andreas di Lefkara',
      pengantar: 'Kamu berkunjung ke rumah berdinding batu kapur putih milik perajin renda dan pembuat keju Andreas di desa perbukitan Lefkara. Di Siprus, jamuan hidangan Meze bersama keju Halloumi panggang, keramahan Mediterania yang santai (Kopiaste: mari bergabung), dan sulaman renda Lefkaritika (warisan UNESCO) adalah kehangatan pulau dewi cinta Afrodit.',
      npc: { nama: 'Andreas', peran: 'Peternak Kambing & Pelindung Tradisi Renda Lefkara', avatar: 'AD', deskripsi: 'Pria paruh baya bersahaja berwajah ramah mengenakan rompi katun gelap, celemek linen, dan senyum terbuka khas desa pulau.' },
      bekal: [
        { id: 'keju_halloumi', nama: 'Blok Keju Halloumi Daun Mint', ikon: 'package', deskripsi: 'Keju kenyal gurih dari susu kambing beraroma daun mint kering.', kategori: 'oleh-oleh' },
        { id: 'frasa_siprus', nama: 'Catatan Ungkapan Yasas & Kopiaste', ikon: 'message-square', deskripsi: 'Ungkapan salam (Yasas), terima kasih (Efcharisto), dan ajakan Kopiaste.', kategori: 'frasa' },
        { id: 'renda_lefkara', nama: 'Kain Renda Sulaman Lefkaritika', ikon: 'bookmark', deskripsi: 'Renda sulam tangan legendaris yang pernah dikagumi Leonardo da Vinci.', kategori: 'pakaian' },
        { id: 'euro_cy', nama: 'Mata Uang Euro Koin Bergambar Mouflon', ikon: 'coins', deskripsi: 'Mata uang resmi Siprus bergambar domba gunung mouflon.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'cy_s1',
          latar: 'Jalanan Berbatu Sempit Berhias Pot Bunga Bugenvil Merah, Lefkara',
          narasi: 'Aroma roti oregano panggang menguar dari oven kayu luar ruangan. Andreas berdiri di beranda batunya menyambutmu.',
          dialog: { speaker: 'Andreas', teks: 'Yasas! Kopiaste, silakan mampir dan bergabung di meja kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'cy_c1_salam_kopiaste_senyum', teks: 'Menjawab salam dengan hangat "Yasas Andreas!", tersenyum ramah, dan menerima ajakan Kopiaste', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Kalos orisate! Senang sekali melihat tamu yang begitu terbuka menyambut keramahan desa kami.' }, catatan: { judul: 'Makna Kata "Kopiaste" di Siprus', isi: 'Kopiaste bermakna "bergabunglah bersama kami", undangan universal keramahan Siprus yang sangat tulus dari lubuk hati.', kategori: 'Bahasa' }, nextSceneId: 'cy_s2' },
            { id: 'cy_c1_abaikan_ajakan_meze', teks: 'Menolak ketus dan berkata hanya ingin memotret rumah tanpa berbincang', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Di desa kami, hubungan antarmanusia lebih berharga daripada sekadar bidikan kamera.' }, catatan: { judul: 'Etiket Keramahan Komunitas Mediterania', isi: 'Menolak sapaan warga desa dipandang sebagai sikap dingin dan tidak menghargai budaya lokal.', kategori: 'Etiket' }, nextSceneId: 'cy_s2' }
          ]
        },
        {
          id: 'cy_s2',
          latar: 'Halaman Dalam Berlantai Batu di Bawah Naungan Pohon Zaitun Berusia Ratusan Tahun',
          narasi: 'Irisan keju Halloumi panggang keemasan mengepul di atas piring tembikar bersama buah zaitun hitam dan tomat segar.',
          dialog: { speaker: 'Andreas', teks: 'Meze adalah tradisi berbagi perlahan. Nikmatilah keju ini selagi hangat dan renyah di luarnya.', ekspresi: 'senang' },
          pilihan: [
            { id: 'cy_c2_nikmati_meze_berbagi', teks: 'Mengambil sepotong keju dengan garpu, mencicipinya santai, dan berbagi piring Meze bersama tuan rumah', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Nostimo! Begitulah Meze dinikmati: santai, berbagi, dan diiringi canda tawa hangat.' }, catatan: { judul: 'Budaya Santap Meze di Siprus', isi: 'Meze adalah budaya menikmati puluhan hidangan kecil secara komunal tanpa tergesa-gesa sebagai media bercengkerama.', kategori: 'Makan' }, nextSceneId: 'cy_s3' },
            { id: 'cy_c2_habiskan_sendiri_rakus', teks: 'Menarik seluruh piring ke depan dada sendiri dan menghabiskannya sendirian dengan cepat', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Meze adalah hidangan berbagi di tengah meja, bukan untuk dimonopoli sendiri.' }, catatan: { judul: 'Adab Berbagi di Meja Meze', isi: 'Mengambil seluruh sajian komunal untuk diri sendiri melanggar esensi kebersamaan Meze.', kategori: 'Makan' }, nextSceneId: 'cy_s3' }
          ]
        },
        {
          id: 'cy_s3',
          latar: 'Sudut Desa Menatap Lembah Perbukitan Menuju Birunya Laut Mediterania',
          narasi: 'Matahari senja membiaskan cahaya keemasan di atas dinding batu kapur putih Lefkara.',
          dialog: { speaker: 'Andreas', teks: 'Efcharisto telah berbagi waktu dan cerita berharga di beranda kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'cy_c3_efcharisto_antio', teks: 'Ucapkan "Efcharisto poli, Andreas. Antio, semoga desa Lefkara selalu makmur dan damai!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Sto epanidhin (sampai jumpa kembali)! Pintu rumah kami selalu terbuka bagimu.' }, catatan: { judul: 'Ucapan Terima Kasih Bahasa Yunani Siprus', isi: 'Efcharisto poli bermakna "terima kasih banyak" dan Sto epanidhin menjanjikan perjumpaan kembali yang indah.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'cy_c3_pergi_tanpa_pamit', teks: 'Langsung berjalan pergi tanpa berpamitan', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Selamat jalan, semoga langkahmu selamat menuruni bukit.' }, catatan: { judul: 'Pentingnya Pamitan Santun', isi: 'Berpamitan hangat menyempurnakan kenangan manis di pulau Siprus.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Filos (Sahabat Karib) Lefkara', ringkasan: 'Andreas menghadiahkan taplak meja berenda sulam Lefkaritika asli dan menyambutmu sebagai sahabat sejati di Siprus.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Bawah Pohon Zaitun', ringkasan: 'Kelezatan keju Halloumi panggang dan kehangatan tradisi Kopiaste menjadi kenangan indah di Mediterania.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Seni Berbagi Meze', ringkasan: 'Memahami arti kebersamaan di meja makan memperkaya kepekaan interaksi antarmasyarakatmu.', badge: 'bronze' }
      ]
    }
  },

  // 5. GEORGIA (ge)
  {
    varName: 'georgiaQuest',
    data: {
      id: 'quest-ge',
      countryId: 'ge',
      negara: 'Georgia',
      judul: 'Keagungan Jamuan Supra Tamada Giorgi di Tbilisi',
      pengantar: 'Kamu diundang ke jamuan pesta perjamuan tradisional (Supra) yang dipimpin oleh pemimpin upacara (Tamada) Giorgi di kota tua Tbilisi. Di Georgia, roti keju Khachapuri berbentuk perahu, permen kacang Churchkhela, seni orasi roti panggang (Toast) puitis, dan pepatah "Tamu adalah utusan dari Tuhan" adalah jantung peradaban bangsa Sakartvelo.',
      npc: { nama: 'Tamada Giorgi', peran: 'Pemimpin Jamuan Adat Supra & Sejarawan Kaukasus', avatar: 'TG', deskripsi: 'Pria berwibawa bertubuh kekar mengenakan jubah Chokha wol hitam dengan wadah peluru dekoratif di dada dan tanduk minum Khantsi.' },
      bekal: [
        { id: 'roti_khachapuri', nama: 'Roti Keju Meleleh Khachapuri Adjaruli', ikon: 'package', deskripsi: 'Roti berbentuk perahu berisi keju Sulguni gurih dan kuning telur mentega.', kategori: 'oleh-oleh' },
        { id: 'frasa_georgia', nama: 'Catatan Ungkapan Gamarjoba & Gaumarjos', ikon: 'message-square', deskripsi: 'Ungkapan salam (Gamarjoba), terima kasih (Madloba), dan seruan toast Gaumarjos.', kategori: 'frasa' },
        { id: 'tanduk_khantsi', nama: 'Tanduk Minum Tradisional Khantsi', ikon: 'bookmark', deskripsi: 'Tanduk hewan berukir perak untuk upacara minum toast kehormatan.', kategori: 'pakaian' },
        { id: 'lari_ge', nama: 'Mata Uang Lari Georgia', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar penyair agung Shota Rustaveli.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'ge_s1',
          latar: 'Balkon Kayu Berukir Renda Menggantung di Tebing Sungai Kura, Tbilisi',
          narasi: 'Benteng Narikala berdiri megah di puncak bukit. Giorgi berdiri di kepala meja jamuan panjang yang penuh sesak makanan lezat.',
          dialog: { speaker: 'Giorgi', teks: 'Gamarjoba! Selamat datang ke jamuan Supra kami. Di Georgia, tamu adalah utusan langsung dari Tuhan.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ge_c1_salam_gamarjoba_hormat', teks: 'Menyapa dengan senyum hangat "Gamarjoba, Tamada Giorgi!", membungkuk hormat, dan menjabat tangannya erat', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Gaumarjos! Menghormati peran Tamada membuktikan kamu paham tata tertib jamuan Sakartvelo.' }, catatan: { judul: 'Peran Sakral Tamada dalam Budaya Georgia', isi: 'Tamada adalah pemimpin jamuan perjamuan Supra yang dihormati layaknya jenderal pesta; perkataannya mengatur ritme keharmonisan meja makan.', kategori: 'Etiket' }, nextSceneId: 'ge_s2' },
            { id: 'ge_c1_duduk_di_kursi_tamada', teks: 'Langsung duduk di kursi utama kepala meja yang diperuntukkan khusus bagi Tamada', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Kursi kepala meja hanya untuk Tamada yang memimpin perjamuan!' }, catatan: { judul: 'Pantangan Menduduki Kursi Tamada', isi: 'Menduduki kursi kepala meja tanpa ditunjuk melanggar hierarki adat perjamuan Supra.', kategori: 'Etiket' }, nextSceneId: 'ge_s2' }
          ]
        },
        {
          id: 'ge_s2',
          latar: 'Meja Jamuan Supra yang Dipenuhi Puluhan Piring Makanan Khinkali dan Sayuran',
          narasi: 'Giorgi mengangkat tanduk minum Khantsi dan melantunkan orasi puitis tentang perdamaian dunia dan persahabatan sejati.',
          dialog: { speaker: 'Giorgi', teks: 'Orasi ini untuk persahabatan antarbangsa! Dengarkanlah hingga bait terakhir sebelum kita bersulang.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ge_c2_dengar_toast_sampai_selesai', teks: 'Mendengarkan orasi toast Tamada dengan hening takzim, lalu berseru "Gaumarjos!" dan bersulang bersama', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Gaumarjos! Begitulah tamu sejati menghargai bait-bait doa jamuan Supra.' }, catatan: { judul: 'Etiket Bersulang Toast di Georgia', isi: 'Dalam jamuan Supra, tidak ada yang boleh minum sebelum Tamada menyelesaikan orasinya dan menyerukan "Gaumarjos!" (kejayaan/kemenangan).', kategori: 'Makan' }, nextSceneId: 'ge_s3' },
            { id: 'ge_c2_potong_orasi_minum_duluan', teks: 'Memotong pembicaraan Tamada di tengah kalimat dan langsung menenggak minuman sendirian', respectDelta: -30, reaksi: { ekspresi: 'kecewa', teks: 'Memotong toast Tamada adalah pelanggaran adab paling berat di meja perjamuan kami!' }, catatan: { judul: 'Pantangan Memotong Pidato Tamada', isi: 'Memotong pidato Tamada dipandang tidak menghargai kehormatan seluruh peserta jamuan.', kategori: 'Makan' }, nextSceneId: 'ge_s3' }
          ]
        },
        {
          id: 'ge_s3',
          latar: 'Pemandian Air Panas Belerang Abanotubani di Bawah Sinar Bulan',
          narasi: 'Kubah bata merah pemandian kuno memancarkan uap hangat di tengah malam kota Tbilisi yang syahdu.',
          dialog: { speaker: 'Giorgi', teks: 'Didi madloba atas malam yang indah ini. Kamu telah menjadi bagian dari keluarga kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ge_c3_madloba_didi_doa', teks: 'Ucapkan "Didi madloba, Giorgi! Mshvidoba (damai) selalu untuk negeri Sakartvelo yang agung"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Genatsvale! Hatimu seluas lembah Kaukasus. Selamat jalan, saudaraku!' }, catatan: { judul: 'Kata Kasih "Genatsvale" di Georgia', isi: 'Genatsvale adalah panggilan kasih sayang terdalam Georgia yang bermakna "aku siap memikul dukamu demi kebahagiaanmu".', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'ge_c3_pamit_tanpa_kata', teks: 'Pergi diam-diam saat pesta masih berlangsung hangat', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Perpisahan seorang sahabat harus dirayakan dengan pelukan hangat.' }, catatan: { judul: 'Adab Pamit di Jamuan Supra', isi: 'Berpamitan secara terbuka kepada Tamada menegaskan rasa hormat atas jamuan yang diberikan.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Dzma (Saudara Angkat) Tbilisi', ringkasan: 'Giorgi menghadiahkan tanduk minum Khantsi berukir perak dan menabalkanmu sebagai ksatria persahabatan kehormatan di Georgia.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Meja Supra', ringkasan: 'Kelezatan Khachapuri dan kemegahan orasi puitis Tamada menjadi pengalaman budaya paling berkesan dalam hidupmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Disiplin Jamuan Kaukasus', ringkasan: 'Memahami kesakralan peran Tamada dan aturan bersulang memperluas kedewasaan budayamu di Georgia.', badge: 'bronze' }
      ]
    }
  },

  // 6. IRAQ (iq)
  {
    varName: 'iraqQuest',
    data: {
      id: 'quest-iq',
      countryId: 'iq',
      negara: 'Irak',
      judul: 'Aroma Ikan Masgouf Sayyid Ali di Baghdad',
      pengantar: 'Kamu berkunjung ke kediaman perajin tembaga dan kaligrafer Sayyid Ali di kawasan bersejarah Jalan Al-Mutanabbi di tepian Sungai Tigris, Baghdad. Di Irak, keramahan bangsa Mesopotamia (Karam), tradisi memanggang ikan Masgouf dengan kayu pohon buah aprikot, dan secangkir teh hitam kapulaga Chai adalah warisan kejayaan peradaban seribu satu malam.',
      npc: { nama: 'Sayyid Ali', peran: 'Sesepuh Kaligrafer Kuno & Penjaga Warisan Buku Baghdad', avatar: 'SA', deskripsi: 'Pria sepuh bermartabat dengan jubah Dishdasha abu-abu rapi, sorban hitam Yaman, dan janggut putih bersahaja.' },
      bekal: [
        { id: 'kurma_barhi', nama: 'Kotak Kurma Barhi Basra Segar', ikon: 'package', deskripsi: 'Kurma kuning manis renyah khas kebun kurma sungai Shatt al-Arab.', kategori: 'oleh-oleh' },
        { id: 'frasa_irak', nama: 'Catatan Ungkapan Marhaba & Shlama', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Shukran jazeelan), dan sapaan hormat Abu.', kategori: 'frasa' },
        { id: 'pena_kaligrafi', nama: 'Batang Bambu Kaligrafi Qalam Warka', ikon: 'bookmark', deskripsi: 'Pena celup bambu alami pembuat naskah aksara Kufi kuno.', kategori: 'pakaian' },
        { id: 'dinar_iq', nama: 'Mata Uang Dinar Irak Baru', ikon: 'coins', deskripsi: 'Uang kertas dinar resmi bergambar Menara Malwiya Samarra.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'iq_s1',
          latar: 'Jalanan Bersejarah Al-Mutanabbi Penuh Kios Buku Tua di Tepi Sungai Tigris, Baghdad',
          narasi: 'Aroma kertas buku kuno berpadu semilir angin sungai. Sayyid Ali berdiri di depan gerbang berhias ukiran bata Babilonia menyambutmu.',
          dialog: { speaker: 'Sayyid Ali', teks: 'Marhaba bikum! Ahlan wa sahlan di kota peradaban para sarjana Baghdad.', ekspresi: 'senang' },
          pilihan: [
            { id: 'iq_c1_salam_dada_sayyid', teks: 'Meletakkan tangan kanan di dada, membungkuk takzim, dan menyapa "Marhaba ya Sayyid Ali, ahlan bik!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ahlan wa sahlan! Tangan di dada adalah lambang ketulusan cinta tanah Mesopotamia.' }, catatan: { judul: 'Salam Penuh Martabat di Irak', isi: 'Di Irak, meletakkan tangan di dada saat menyapa adalah bukti penghormatan takzim kepada tetua dan ulama.', kategori: 'Etiket' }, nextSceneId: 'iq_s2' },
            { id: 'iq_c1_tunjuk_jari_ke_wajah', teks: 'Menunjuk muka Sayyid Ali dengan jari telunjuk sambil memanggil namanya santai', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Menunjuk wajah orang yang lebih tua adalah perbuatan yang sangat tercela dalam adab kami.' }, catatan: { judul: 'Pantangan Menunjuk Wajah di Timur Tengah', isi: 'Menunjuk wajah seseorang dengan jari dipandang sebagai penghinaan langsung terhadap kehormatan pribadi.', kategori: 'Etiket' }, nextSceneId: 'iq_s2' }
          ]
        },
        {
          id: 'iq_s2',
          latar: 'Teras Tepi Sungai Tigris Menghadap Perapian Kayu Terbuka',
          narasi: 'Ikan mas air tawar Masgouf dibelah melingkar dan dipanggang tegak mengelilingi bara api kayu pohon buah.',
          dialog: { speaker: 'Sayyid Ali', teks: 'Ikan Masgouf ini adalah hidangan kebanggaan nasional kami sejak zaman Sumeria. Silakan santap bersama roti Samoon hangat.', ekspresi: 'senang' },
          pilihan: [
            { id: 'iq_c2_robek_ikan_tangan_kanan', teks: 'Merobek roti Samoon berbentuk belah ketupat dengan tangan kanan dan menyantap daging ikan panggang bersama lemon kering', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Bel’afiyeh (semoga membawa kesehatan)! Begitulah kemuliaan santap di tepian Tigris.' }, catatan: { judul: 'Etiket Menikmati Ikan Masgouf di Irak', isi: 'Ikan Masgouf dimakan komunal menggunakan potongan roti Samoon dengan tangan kanan, diperciki perasan lemon kering amba.', kategori: 'Makan' }, nextSceneId: 'iq_s3' },
            { id: 'iq_c2_makan_tangan_kiri_hina_sungai', teks: 'Mencomot makanan dengan tangan kiri dan membuang tulangnya sembarangan ke sungai', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Makanlah dengan tangan kanan dan jaga kebersihan sungai kehidupan kami!' }, catatan: { judul: 'Kebersihan Sungai Tigris', isi: 'Sungai Tigris dihormati sebagai urat nadi peradaban bangsa Irak dan tidak boleh dikotori.', kategori: 'Makan' }, nextSceneId: 'iq_s3' }
          ]
        },
        {
          id: 'iq_s3',
          latar: 'Kedai Kopi Bersejarah Shabandar di Bawah Lampu Gantung Minyak Klasik',
          narasi: 'Gelas kecil berkaki (Istikan) berisi teh hitam manis kental berkapulaga Chai disajikan mengepul hangat.',
          dialog: { speaker: 'Sayyid Ali', teks: 'Shukran jazeelan atas silaturahmi yang membawa berkah di kota kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'iq_c3_shukran_doa_baghdad', teks: 'Ucapkan "Shukran jazeelan, Sayyid Ali. Fi amanillah, semoga kedamaian selalu menyinari Baghdad"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ma’as salaamah! Semoga ilmu dan keberkahan selalu menerangi jalan hidupmu.' }, catatan: { judul: 'Doa Perlindungan di Irak', isi: 'Mendoakan kedamaian bagi kota Baghdad adalah ungkapan empati yang menyentuh sanubari warga lokal.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'iq_c3_pergi_tergesa', teks: 'Berlari keluar tanpa membalas ucapan perpisahan', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga langkahmu selalu dalam lindungan-Nya.' }, catatan: { judul: 'Adab Berpamitan di Mesopotamia', isi: 'Perpisahan yang santun melanggengkan doa kebaikan antarsahabat.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Rafiq (Sahabat Karib) Mesopotamia', ringkasan: 'Sayyid Ali menuliskan namamu dalam lembaran kertas kaligrafi bertinta emas dan mengangkatmu sebagai kawan sejati di Baghdad.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Tepian Tigris', ringkasan: 'Kelezatan ikan Masgouf dan kehangatan aroma teh kapulaga Chai menjadi kenangan agung di tanah Irak.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Seribu Satu Malam', ringkasan: 'Memahami kesantunan tangan di dada dan etika perjumpaan memperkaya kedewasaan budayamu di Timur Tengah.', badge: 'bronze' }
      ]
    }
  },

  // 7. ISRAEL (il)
  {
    varName: 'israelQuest',
    data: {
      id: 'quest-il',
      countryId: 'il',
      negara: 'Israel',
      judul: 'Kehangatan Roti Challah David di Yerusalem',
      pengantar: 'Kamu diundang ke jamuan santap malam menyambut hari perhentian suci (Shabbat) oleh David di kawasan kota tua Yerusalem. Di Israel, salam kedamaian Shalom, ritual memotong roti kepang Challah, adab ketertiban hari Shabbat, dan kehangatan jamuan makan keluarga adalah tradisi kuno yang dijaga turun-temurun.',
      npc: { nama: 'David', peran: 'Sejarawan Kota Kuno & Pengrajin Roti Tradisional', avatar: 'DV', deskripsi: 'Pria paruh baya bersahaja mengenakan kemeja putih rapi, penutup kepala rajut Kippah, dan senyum bersahabat.' },
      bekal: [
        { id: 'roti_challah', nama: 'Roti Kepang Challah Bertabur Wijen', ikon: 'package', deskripsi: 'Roti manis telur kepang tradisional lambang berkah hari Shabbat.', kategori: 'oleh-oleh' },
        { id: 'frasa_ibrani', nama: 'Catatan Ungkapan Shalom & Toda', ikon: 'message-square', deskripsi: 'Ungkapan salam (Shalom), terima kasih (Toda raba), dan sapaan Shabbat Shalom.', kategori: 'frasa' },
        { id: 'tahini_murni', nama: 'Pasta Wijen Sangrai Tahini Murni', ikon: 'bookmark', deskripsi: 'Saus wijen giling alami pelengkap hidangan hummus dan falafel.', kategori: 'pakaian' },
        { id: 'shekel_il', nama: 'Mata Uang Shekel Baru', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar para sastrawan dan penyair kenamaan.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'il_s1',
          latar: 'Gerbang Batu Putih Kuno di Kawasan Bersejarah Yerusalem Menjelang Matahari Terbenam',
          narasi: 'Lonceng dan seruan doa bersahutan di udara senja kota batu putih. David berdiri menyambut di pintu masuk rumahnya.',
          dialog: { speaker: 'David', teks: 'Shalom aleichem! Shabbat Shalom, selamat datang ke meja perjamuan damai keluarga kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'il_c1_salam_shabbat_hangat', teks: 'Menjawab salam dengan senyum hangat "Aleichem shalom! Shabbat Shalom, David!" dan menjabat tangannya', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Shalom! Senang sekali mendengar sapaan damai Shabbat yang begitu tulus.' }, catatan: { judul: 'Makna Salam Shabbat Shalom', isi: 'Shabbat Shalom berarti "semoga hari perhentianmu diliputi kedamaian sejati", sapaan paling bermakna di Yerusalem.', kategori: 'Bahasa' }, nextSceneId: 'il_s2' },
            { id: 'il_c1_sapa_dingin_acuh', teks: 'Mengabaikan salam Shabbat dan langsung bertanya di mana colokan listrik untuk mengecas gawai', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Saat Shabbat dimulai, kami beristirahat dari penggunaan gawai elektronik.' }, catatan: { judul: 'Ketertiban Hari Shabbat di Lingkungan Tradisional', isi: 'Pada hari Shabbat, perangkat elektronik dimatikan untuk menjaga keheningan dan kebersamaan keluarga.', kategori: 'Etiket' }, nextSceneId: 'il_s2' }
          ]
        },
        {
          id: 'il_s2',
          latar: 'Meja Makan Putih Bersih Diterangi Sepasang Lilin Kuningan Shabbat',
          narasi: 'Sepasang roti kepang Challah tertutup kain beludru sulam di samping piring garam dan anggur buah delima.',
          dialog: { speaker: 'David', teks: 'Bete’avon! Setelah doa berkah, robeklah roti Challah ini, celupkan sedikit ke garam, dan nikmatilah.', ekspresi: 'senang' },
          pilihan: [
            { id: 'il_c2_robek_challah_celup_garam', teks: 'Menunggu doa selesai dibacakan, merobek roti dengan sopan, mencelupkannya sedikit ke garam, lalu memakannya dengan khidmat', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Bete’avon! Garam mengikat perjanjian berkah dan menjaga kesucian rezeki meja makan.' }, catatan: { judul: 'Ritual Roti Challah dan Garam', isi: 'Mencelupkan roti ke garam melambangkan pemeliharaan berkah abadi dan pengingat akan pengorbanan di kuil kuno.', kategori: 'Makan' }, nextSceneId: 'il_s3' },
            { id: 'il_c2_sambar_roti_sebelum_doa', teks: 'Menyambar roti dan mengunyahnya sebelum tuan rumah selesai melantunkan doa berkah', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Tunggulah doa berkah selesai dipanjatkan sebelum menyantap hidangan.' }, catatan: { judul: 'Adab Menunggu Doa Berkah Meja Makan', isi: 'Menunggu doa berkah selesai adalah tanda kesopanan dan ketertiban spiritual seorang tamu.', kategori: 'Makan' }, nextSceneId: 'il_s3' }
          ]
        },
        {
          id: 'il_s3',
          latar: 'Atap Teras Menatap Dinding Ratapan dan Kubah Emas di Bawah Langit Berbintang',
          narasi: 'Angin malam berhembus sejuk di antara lorong-lorong batu kuno Yerusalem yang damai.',
          dialog: { speaker: 'David', teks: 'Toda raba atas kehadiranmu yang membawa sukacita dan kehangatan di malam Shabbat ini.', ekspresi: 'senang' },
          pilihan: [
            { id: 'il_c3_toda_shavua_tov', teks: 'Ucapkan "Toda raba, David! Shavua Tov (semoga minggu barumu penuh berkah) dan Shalom!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Shavua Tov! Semoga hari-harimu selalu diberkahi kedamaian dan kesehatan.' }, catatan: { judul: 'Doa Berkah Minggu Baru Bahasa Ibrani', isi: 'Shavua Tov adalah doa agar minggu yang baru dipenuhi kesuksesan, kebahagiaan, dan kedamaian.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'il_c3_nyalakan_kamera_kilat_ke_warga', teks: 'Menyalakan lampu kilat kamera menyorot warga yang sedang berdoa hening di luar jendela', respectDelta: -30, reaksi: { ekspresi: 'kecewa', teks: 'Harap hormati privasi dan keheningan ibadah warga saat malam suci.' }, catatan: { judul: 'Menghargai Keheningan Ibadah di Yerusalem', isi: 'Memotret dengan lampu kilat di area doa pada hari Shabbat dilarang keras demi menjaga kekhidmatan ibadah.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Chaver (Sahabat Sejati) Yerusalem', ringkasan: 'David menghadiahkan penutup roti Challah bersulam benang perak dan menyambutmu sebagai kawan sejati di kota kuno.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Meja Shabbat', ringkasan: 'Keharuman roti Challah dan kedamaian malam lilin Shabbat menjadi kenangan spiritual yang indah dalam hidupmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesakralan Hari Perhentian', ringkasan: 'Memahami makna di balik keheningan Shabbat dan adab santap memperluas wawasan antarbudayamu.', badge: 'bronze' }
      ]
    }
  },

  // 8. JORDAN (jo)
  {
    varName: 'jordanQuest',
    data: {
      id: 'quest-jo',
      countryId: 'jo',
      negara: 'Yordania',
      judul: 'Kemurahan Hati Mansaf Sheikh Mansour di Wadi Rum',
      pengantar: 'Kamu diundang ke tenda wol hitam suku Badui milik Sheikh Mansour di padang pasir merah Wadi Rum yang megah. Di Yordania, hidangan kehormatan nasional Mansaf (nasi daging domba berkuah yogurt fermentasi Jameed), kopi kapulaga penyambut tamu (Gahwa Sadah), dan hukum kesopanan padang pasir Badui adalah puncak keluhuran peradaban Arab.',
      npc: { nama: 'Sheikh Mansour', peran: 'Tetua Suku Badui Wadi Rum & Penjaga Jalur Karavan Kuno', avatar: 'SM', deskripsi: 'Pria sepuh berwibawa bermata tajam mengenakan jubah Bisht cokelat bersulam benang emas dan keffiyeh merah putih dengan tali agal hitam.' },
      bekal: [
        { id: 'minyak_ajloun', nama: 'Botol Minyak Zaitun Murni Ajloun', ikon: 'package', deskripsi: 'Minyak zaitun perasan dingin dari pohon zaitun kuno perbukitan Yordania.', kategori: 'oleh-oleh' },
        { id: 'frasa_yordania', nama: 'Catatan Ungkapan Ahlan Wa Sahlan', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Shukran), dan adab kopi Badui.', kategori: 'frasa' },
        { id: 'keffiyeh_merah', nama: 'Keffiyeh Hatta Merah Putih', ikon: 'bookmark', deskripsi: 'Syal penutup kepala tradisional khas Kerajaan Hasyimiyah Yordania.', kategori: 'pakaian' },
        { id: 'dinar_jo', nama: 'Mata Uang Dinar Yordania', ikon: 'coins', deskripsi: 'Uang kertas resmi bernilai kuat bergambar reruntuhan batu Petra.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'jo_s1',
          latar: 'Tenda Bulu Kambing Hitam di Bawah Naungan Tebing Batu Merah Wadi Rum',
          narasi: 'Pasir merah berkilauan di bawah matahari sore. Sheikh Mansour berdiri di depan tenda menyambut kedatanganmu dengan tangan terbuka.',
          dialog: { speaker: 'Sheikh Mansour', teks: 'Ahlan wa sahlan! Tenda kami luas menyambut setiap pengelana padang pasir.', ekspresi: 'senang' },
          pilihan: [
            { id: 'jo_c1_salam_dada_sheikh', teks: 'Meletakkan tangan kanan di dada, membungkuk takzim, dan menyapa "Ahlan wa sahlan ya Sheikh Mansour, salam aleikum"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Marhaban bik! Kesopananmu mencerminkan jiwa tamu agung yang memuliakan tuan rumah.' }, catatan: { judul: 'Salam Penghormatan Suku Badui di Yordania', isi: 'Menyapa tetua suku dengan tangan di dada dan panggilan Sheikh adalah bentuk takzim tertinggi di padang pasir Yordania.', kategori: 'Etiket' }, nextSceneId: 'jo_s2' },
            { id: 'jo_c1_masuk_tanpa_salam', teks: 'Langsung menerobos masuk ke dalam tenda tanpa mengucap salam dan duduk selonjor', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Tamu beradab menunggu disapa dan dipersilakan sebelum melangkah ke area majlis.' }, catatan: { judul: 'Adab Memasuki Tenda Badui', isi: 'Memasuki kemah tanpa salam dipandang melanggar privasi dan kehormatan keluarga suku.', kategori: 'Etiket' }, nextSceneId: 'jo_s2' }
          ]
        },
        {
          id: 'jo_s2',
          latar: 'Ruang Tengah Kemah Beralas Karpet Tenun Wol Badui Merah Geometris',
          narasi: 'Nampan perak raksasa berisi nasi Mansaf kuning bertabur kacang pinus, potongan daging domba empuk, dan roti tipis Shrak berkuah saus Jameed disajikan hangat.',
          dialog: { speaker: 'Sheikh Mansour', teks: 'Mansaf dimakan bersama menggunakan tangan kanan. Kepalkan nasi dengan tiga jemari dan nikmatilah anugerah kemurahan hati kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'jo_c2_santap_mansaf_tangan_kanan', teks: 'Menggunakan tangan kanan untuk mengepal nasi lembut menjadi bola kecil dan memakannya tanpa menyentuh tangan kiri', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Sahtain wa afiyeh! Kamu makan seperti penunggang kuda padang pasir sejati.' }, catatan: { judul: 'Etiket Santap Bersama Mansaf di Yordania', isi: 'Mansaf dinikmati bersama di satu nampan besar dengan tangan kanan; tangan kiri disimpan di belakang punggung sebagai tanda penghormatan komunal.', kategori: 'Makan' }, nextSceneId: 'jo_s3' },
            { id: 'jo_c2_makan_dua_tangan_acak_nampan', teks: 'Menggunakan kedua belah tangan mencakar daging dan mengaduk seluruh isi nampan', respectDelta: -30, reaksi: { ekspresi: 'kecewa', teks: 'Gunakan hanya tangan kananmu dan makanlah dari bagian yang berada di hadapanmu.' }, catatan: { judul: 'Pantangan Tangan Kiri di Nampan Mansaf', isi: 'Menyentuh nampan bersama dengan tangan kiri dipandang mencemari makanan rekan bersantap lainnya.', kategori: 'Makan' }, nextSceneId: 'jo_s3' }
          ]
        },
        {
          id: 'jo_s3',
          latar: 'Api Unggun Padang Pasir di Bawah Langit Berbintang Tak Bertepi Wadi Rum',
          narasi: 'Sheikh Mansour menuangkan kopi kapulaga pekat dari poci tembakar Dallah berparuh panjang ke finjan kecilmu.',
          dialog: { speaker: 'Sheikh Mansour', teks: 'Kopi ini adalah meterai persahabatan kita di lembah bulan Wadi Rum.', ekspresi: 'senang' },
          pilihan: [
            { id: 'jo_c3_goyang_finjan_syukur', teks: 'Meneguk kopi dengan tangan kanan, lalu menggoyangkan finjan kecil tanda sudah kenyang dan berucap "Daimah, shukran ya Sheikh!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Daimah in syaa Allah! Semoga kemakmuran dan keberkahan selalu menyertai rumahmu.' }, catatan: { judul: 'Ucapan "Daimah" Setelah Santap Jamuan', isi: 'Daimah bermakna "semoga meja makan dan rezekimu selalu berlimpah ruah abadi", doa pamitan terindah bagi tuan rumah.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'jo_c3_tumpahkan_kopi_ke_pasir', teks: 'Membuang kopi ke pasir sambil mencela rasanya terlalu pahit', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Kopi Badui adalah simbol kehormatan perjamuan, jangan buang anugerah tuan rumah.' }, catatan: { judul: 'Kesakralan Kopi Gahwa Badui', isi: 'Mencela atau membuang kopi yang disuguhkan tetua suku adalah penghinaan terhadap kehormatan suku.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Nashmi (Ksatria Berani) Wadi Rum', ringkasan: 'Sheikh Mansour mengikatkan Keffiyeh merah putih di kepalamu dan menabalkanmu sebagai saudara kehormatan suku Badui Yordania.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Lembah Gurun Merah', ringkasan: 'Kelezatan Mansaf dan kehangatan api unggun padang pasir Wadi Rum menjadi kenangan tak terlupakan dalam hidupmu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Kesopanan Badui', ringkasan: 'Memahami filosofi nampan Mansaf dan etika kopi finjan memperkaya pemahaman sosialmu di tanah Arab.', badge: 'bronze' }
      ]
    }
  },

  // 9. KUWAIT (kw)
  {
    varName: 'kuwaitQuest',
    data: {
      id: 'quest-kw',
      countryId: 'kw',
      negara: 'Kuwait',
      judul: 'Keharuman Diwaniya Abu Fahad di Kuwait City',
      pengantar: 'Kamu diundang ke balai pertemuan sosial tradisional Diwaniya milik budayawan sepuh Abu Fahad di Kuwait City. Di Kuwait, tradisi musyawarah Diwaniya tempat bertemunya para tokoh masyarakat, keharuman asap dupa kayu gaharu (Bukhoor), sajian hidangan Machboos, dan kemuliaan adab majlis adalah pilar peradaban bangsa Kuwait.',
      npc: { nama: 'Abu Fahad', peran: 'Tokoh Tetua Diwaniya & Kurator Sejarah Maritim Teluk', avatar: 'AF', deskripsi: 'Pria bersahaja berwibawa mengenakan jubah Dishdasha putih licin, ghutra putih berseri dengan agal hitam tebal, dan senyum ramah.' },
      bekal: [
        { id: 'minyak_gaharu_kw', nama: 'Botol Kristal Minyak Gaharu Dehn Al Oud', ikon: 'package', deskripsi: 'Minyak wangi gaharu murni aromatik kebanggaan aroma Teluk.', kategori: 'oleh-oleh' },
        { id: 'frasa_kuwait', nama: 'Catatan Ungkapan Hala Wallah', ikon: 'message-square', deskripsi: 'Ungkapan salam hangat (Hala wallah), terima kasih (Mashkoor), dan adab Diwaniya.', kategori: 'frasa' },
        { id: 'tasbih_misbaha', nama: 'Untaian Tasbih Amber Alami Misbaha', ikon: 'bookmark', deskripsi: 'Untaian biji batu ambar wangi yang diputar di jemari saat berbincang.', kategori: 'pakaian' },
        { id: 'dinar_kw', nama: 'Mata Uang Dinar Kuwait Bernilai Tertinggi', ikon: 'coins', deskripsi: 'Mata uang bernilai nominal tertinggi di dunia dengan desain perahu dhow.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'kw_s1',
          latar: 'Pintu Gerbang Balai Pertemuan Tradisional Diwaniya, Kuwait City',
          narasi: 'Aroma wangi dupa gaharu menyambut dari balik pintu berukir tembaga. Abu Fahad berdiri menyambut di pintu masuk.',
          dialog: { speaker: 'Abu Fahad', teks: 'Hala wallah! Ya marhaba bikum di Diwaniya keluarga kami, tempat berkumpulnya para sahabat.', ekspresi: 'senang' },
          pilihan: [
            { id: 'kw_c1_salam_sapa_tertua_ujung', teks: 'Melepas sepatu di luar, memberi salam hangat, dan menyapa tetua yang duduk di ujung kehormatan terlebih dahulu', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Hala bik! Kamu paham tata krama Diwaniya: menyapa tetua di ujung kehormatan terlebih dahulu.' }, catatan: { judul: 'Tata Krama Masuk Diwaniya di Kuwait', isi: 'Di balai Diwaniya, tamu menyapa tetua yang duduk di posisi kehormatan (Shadr al-Diwaniya) sebelum menyapa yang lain searah jarum jam.', kategori: 'Etiket' }, nextSceneId: 'kw_s2' },
            { id: 'kw_c1_duduk_tanpa_sapa_warga', teks: 'Langsung duduk di sudut sofa tanpa menyapa para hadirin di ruangan', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Di Diwaniya, memberi salam kepada setiap orang yang hadir adalah adab wajib.' }, catatan: { judul: 'Keharusan Bersalaman di Diwaniya', isi: 'Melewati orang yang hadir di Diwaniya tanpa menyapa dipandang sebagai sikap arogan.', kategori: 'Etiket' }, nextSceneId: 'kw_s2' }
          ]
        },
        {
          id: 'kw_s2',
          latar: 'Ruang Tamu Majlis Berkarpet Sutra Tebal dengan Pembakar Dupa Mabkhara',
          narasi: 'Pelayan membawa wadah dupa tembikar Mabkhara yang mengepulkan asap kayu gaharu Bukhoor ke hadapan para tamu.',
          dialog: { speaker: 'Abu Fahad', teks: 'Teburrak bil-oud! Hiruplah keharuman Bukhoor ini dan biarkan asapnya mengharumkan pakaianmu.', ekspresi: 'senang' },
          pilihan: [
            { id: 'kw_c2_kibas_asap_bukhoor_dada', teks: 'Mengibaskan asap dupa Bukhoor dengan kedua tangan ke arah dada, kemeja, dan rambut sambil berterima kasih', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Taieb Allah anfaasak! Keharuman dupa adalah doa kemuliaan bagi tamu agung.' }, catatan: { judul: 'Etiket Menerima Dupa Bukhoor di Kuwait', isi: 'Menerima wadah dupa dengan mengibaskan asapnya ke tubuh menggunakan kedua tangan adalah tanda penghargaan tinggi.', kategori: 'Etiket' }, nextSceneId: 'kw_s3' },
            { id: 'kw_c2_tiup_mabkhara_mati', teks: 'Meniup bara api dupa di dalam wadah mabkhara hingga abunya berterbangan', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Jangan tiup bara dupa! Abu panas bisa mengotori karpet dan pakaian hadirin.' }, catatan: { judul: 'Pantangan Meniup Wadah Dupa', isi: 'Meniup wadah dupa dipandang tidak sopan dan dapat membahayakan keselamatan ruangan.', kategori: 'Etiket' }, nextSceneId: 'kw_s3' }
          ]
        },
        {
          id: 'kw_s3',
          latar: 'Teras Diwaniya Menghadap Menara Kuwait Towers di Bawah Langit Malam',
          narasi: 'Poci teh mint manis dan kopi Gahwa kapulaga disajikan menutup malam musyawarah yang penuh hikmah.',
          dialog: { speaker: 'Abu Fahad', teks: 'Mashkoor atas kehadiran dan percakapan berbobot yang mencerahkan malam ini.', ekspresi: 'senang' },
          pilihan: [
            { id: 'kw_c3_mashkoor_fi_amanillah', teks: 'Ucapkan "Mashkoor jiddan ya Abu Fahad, Diwaniya amirah bi ahliha (semoga Diwaniya ini selalu makmur ramai)!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Amerat ayyaamak! Doa yang sangat indah khas masyarakat Teluk. Selamat jalan, saudaraku.' }, catatan: { judul: 'Doa Kemakmuran Diwaniya', isi: 'Diwaniya amirah bi ahliha adalah pujian dan doa tertinggi agar balai pertemuan tuan rumah selalu ramai dipenuhi orang-orang bijak.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'kw_c3_pamit_gesa_tanpa_salam', teks: 'Keluar tergesa-gesa sambil menelepon suara keras di depan pintu', respectDelta: -15, reaksi: { ekspresi: 'bingung', teks: 'Jagalah ketenangan saat meninggalkan balai musyawarah.' }, catatan: { judul: 'Ketenangan Saat Berpamitan', isi: 'Berpamitan dengan tenang menegaskan wibawa seorang tamu berpendidikan tinggi.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Rijal (Tokoh Sahabat) Diwaniya', ringkasan: 'Abu Fahad menghadiahkan untaian tasbih Misbaha batu amber alami dan menyambutmu sebagai anggota kehormatan Diwaniya Kuwait.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Majlis Teluk', ringkasan: 'Keharuman asap Bukhoor dan kebijaksanaan musyawarah Diwaniya membekas menjadi kenangan berharga di Kuwait.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Musyawarah Budaya Diwaniya', ringkasan: 'Memahami adab bertamu di balai komunal memperluas wawasan diplomasi sosialmu di Timur Tengah.', badge: 'bronze' }
      ]
    }
  },

  // 10. LEBANON (lb)
  {
    varName: 'lebanonQuest',
    data: {
      id: 'quest-lb',
      countryId: 'lb',
      negara: 'Lebanon',
      judul: 'Kemurahan Manisan Baklava Paman Ziad di Byblos',
      pengantar: 'Kamu berkunjung ke rumah kuno berpintu lengkung batu kapur milik Paman Ziad di pelabuhan bersejarah Byblos. Di Lebanon, keramahan bertamu yang melimpah ruah (Karam), jamuan kopi putih air bunga jeruk (Café Blanc), kotak manisan Baklava kacang pinus, dan adab menyapa tetua sesuai urutan usia adalah lambang peradaban pohon cedar abadi.',
      npc: { nama: 'Paman Ziad', peran: 'Sejarawan Pelabuhan Fenesia & Tokoh Budaya Byblos', avatar: 'PZ', deskripsi: 'Pria ramah berwibawa mengenakan kemeja linen putih santai dengan senyum hangat khas pesisir Mediterania timur.' },
      bekal: [
        { id: 'baklava_byblos', nama: 'Kotak Manisan Baklava Kacang Pinus', ikon: 'package', deskripsi: 'Kue lapis renyah filo manis madu bertabur kacang pinus segar.', kategori: 'oleh-oleh' },
        { id: 'frasa_lebanon', nama: 'Catatan Ungkapan Marhaba & Ahlan', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Yislamo), dan sapaan Kifak.', kategori: 'frasa' },
        { id: 'air_mazaher', nama: 'Botol Kaca Air Bunga Jeruk Mazaher', ikon: 'bookmark', deskripsi: 'Penyulingan sari bunga jeruk wangi untuk minuman santai.', kategori: 'pakaian' },
        { id: 'pound_lb', nama: 'Mata Uang Pound Lebanon', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar pohon cedar kebanggaan bangsa.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'lb_s1',
          latar: 'Pelataran Pelabuhan Batu Kuno Fenesia di Dekat Pohon Cedar, Byblos',
          narasi: 'Ombak biru Mediterania berdebur pelan di dermaga perahu kayu. Paman Ziad berdiri menyambut bersama para tetua keluarga.',
          dialog: { speaker: 'Paman Ziad', teks: 'Marhaba! Ahlan wa sahlan fikon, rumah kami terbuka lebar untuk sahabat.', ekspresi: 'senang' },
          pilihan: [
            { id: 'lb_c1_sapa_tetua_urut_usia', teks: 'Menyapa para penghuni rumah menurut urutan usia mulai dari yang paling tua, lalu menyapa Paman Ziad dengan jabat tangan hangat', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ahlan fik! Menyapa tetua terlebih dahulu membuktikan adab keluargamu yang sangat terpuji.' }, catatan: { judul: 'Menyapa Menurut Urutan Usia di Lebanon', isi: 'Dalam etiket perjumpaan Lebanon, menyapa orang-orang yang hadir dimulai dari yang paling berumur sebagai bentuk penghormatan.', kategori: 'Etiket' }, nextSceneId: 'lb_s2' },
            { id: 'lb_c1_abaikan_kakek_tua', teks: 'Melewati tetua tertua tanpa menyapa dan hanya menyapa orang yang termuda', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Orang yang lebih tua selalu disapa dan dihormati terlebih dahulu dalam adat kami.' }, catatan: { judul: 'Penghormatan pada Generasi Senior', isi: 'Mengabaikan tetua dalam salam keluarga dipandang sebagai sikap yang tidak beretika di Lebanon.', kategori: 'Etiket' }, nextSceneId: 'lb_s2' }
          ]
        },
        {
          id: 'lb_s2',
          latar: 'Teras Rumah Kuno Menghadap Birunya Laut Mediterania',
          narasi: 'Paman Ziad menyajikan cangkir porselen berisi minuman seduhan air bunga jeruk hangat (Café Blanc) dan manisan Baklava.',
          dialog: { speaker: 'Paman Ziad', teks: 'Tfaddalo! Minumlah Café Blanc ini, minuman penenang jiwa setelah perjalanan jauh.', ekspresi: 'senang' },
          pilihan: [
            { id: 'lb_c2_duduk_sopan_terima_cangkir', teks: 'Menerima cangkir dengan tangan kanan, duduk bersila sopan tanpa mengarahkan telapak kaki ke orang lain, dan mencicipi dengan takzim', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Sahtein! Sikap dudukmu sangat sopan dan menghargai suasana santap bersama.' }, catatan: { judul: 'Etiket Posisi Kaki di Lebanon', isi: 'Menyilangkan kaki hingga telapak sepatu mengarah langsung ke orang lain dipandang tidak sopan di ruang tamu Lebanon.', kategori: 'Etiket' }, nextSceneId: 'lb_s3' },
            { id: 'lb_c2_selonjor_kaki_ke_wajah', teks: 'Duduk selonjor mengangkat kaki ke atas meja kopi di depan tuan rumah', respectDelta: -30, reaksi: { ekspresi: 'kecewa', teks: 'Tolong turunkan kakimu dari meja, jaga kesopanan di ruang tamu keluarga.' }, catatan: { judul: 'Pantangan Kaki di Atas Meja', isi: 'Menaruh kaki di atas meja adalah pelanggaran berat etiket kesopanan di seluruh Timur Tengah.', kategori: 'Etiket' }, nextSceneId: 'lb_s3' }
          ]
        },
        {
          id: 'lb_s3',
          latar: 'Tepian Dermaga Berbatu Karang Saat Matahari Merah Padam di Cakrawala Laut',
          narasi: 'Lampu mercusuar kuno Byblos mulai berpendar menerangi perahu nelayan.',
          dialog: { speaker: 'Paman Ziad', teks: 'Ktir mabsut bi jiyyetkon, terima kasih atas kunjungan indah ini.', ekspresi: 'senang' },
          pilihan: [
            { id: 'lb_c3_yislamo_kalam_berkah', teks: 'Ucapkan "Yislamo idek, Paman Ziad. Ma’as salaamah, semoga tanah Lebanon selalu diberkahi kedamaian!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Yislamo! Semoga Tuhan memberkahi langkahmu di setiap penjuru bumi.' }, catatan: { judul: 'Ungkapan Rasa Syukur "Yislamo Idek" di Lebanon', isi: 'Yislamo idek bermakna puitis "semoga tanganmu selalu dilindungi keberkahan" atas jamuan yang disajikan.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'lb_c3_pergi_tanpa_ucapan', teks: 'Bergegas lari menuju mobil tanpa pamit', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Selamat jalan, semoga langkahmu terlindungi.' }, catatan: { judul: 'Kehangatan Pamitan Mediterania', isi: 'Pamitan hangat mengunci kesan persaudaraan yang tak akan pudar.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Habib (Kawan Terkasih) Byblos', ringkasan: 'Paman Ziad mengalungkan liontin kayu pohon cedar berukir dan mengangkatmu sebagai kawan sejati di pesisir Lebanon.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Pelabuhan Kuno Fenesia', ringkasan: 'Kelezatan Baklava dan keharuman minuman Café Blanc menjadi kenangan persahabatan yang abadi di Mediterania.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Tata Krama Pesisir Levant', ringkasan: 'Memahami adab menyapa tetua menurut usia memperkaya kepekaan budayamu di Lebanon.', badge: 'bronze' }
      ]
    }
  },

  // 11. OMAN (om)
  {
    varName: 'omanQuest',
    data: {
      id: 'quest-om',
      countryId: 'om',
      negara: 'Oman',
      judul: 'Kemenyan Frankincense Salim di Benteng Nizwa',
      pengantar: 'Kamu berkunjung ke rumah tradisional bertembok lumpur tebal milik perajin tembikar Salim di dekat benteng bundar raksasa Nizwa. Di Kesultanan Oman, aroma dupa kemenyan Frankincense (Luban) dari Dhofar, sajian kurma manis bersama kopi kapulaga Gahwa Omani, dan ketenangan tutur kata yang sangat santun adalah kehormatan luhur bangsa pelaut Oman.',
      npc: { nama: 'Salim', peran: 'Peniup Musik Terompet Berukir & Tetua Pasar Souq Nizwa', avatar: 'SL', deskripsi: 'Pria bersahaja mengenakan jubah Dishdasha putih berumbai wangi Farakha di leher dan topi rajut Kumma bersulam halus.' },
      bekal: [
        { id: 'kemenyan_luban', nama: 'Kotak Getah Kemenyan Luban Hijau Hojari', ikon: 'package', deskripsi: 'Getah kemenyan kualitas tertinggi dunia dari lembah wadi Dhofar.', kategori: 'oleh-oleh' },
        { id: 'frasa_oman', nama: 'Catatan Ungkapan Salam Alaykum Omani', ikon: 'message-square', deskripsi: 'Ungkapan salam santun, terima kasih (Ahsant), dan doa berkah.', kategori: 'frasa' },
        { id: 'topi_kumma', nama: 'Topi Bordir Tradisional Kumma', ikon: 'bookmark', deskripsi: 'Topi rajut bundar berlubang ventilasi khas pria Kesultanan Oman.', kategori: 'pakaian' },
        { id: 'rial_om', nama: 'Mata Uang Rial Omani', ikon: 'coins', deskripsi: 'Uang kertas resmi bernilai tinggi bergambar belati tradisional Khanjar.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'om_s1',
          latar: 'Pelataran Gerbang Benteng Bundar Raksasa Berbatu Pasir, Nizwa',
          narasi: 'Pohon kurma melambai di bawah terik mentari gurun. Salim berdiri menyambut dengan tangan diletakkan di dada penuh ketenangan.',
          dialog: { speaker: 'Salim', teks: 'Salam alaykum! Ahlan bikum di ibu kota kebudayaan kuno Nizwa.', ekspresi: 'senang' },
          pilihan: [
            { id: 'om_c1_salam_tenang_tutur_kata', teks: 'Menjawab salam dengan nada suara tenang dan santun, meletakkan tangan kanan di dada, dan mengucap "Wa alaykum assalam ya Salim"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ahlan wa sahlan! Ketenangan tutur katamu mencerminkan kepribadian tamu yang beradab.' }, catatan: { judul: 'Ketenangan Karakter Bangsa Oman', isi: 'Masyarakat Oman terkenal di seluruh dunia Arab karena tutur kata yang sangat lembut, tenang, dan rendah hati.', kategori: 'Etiket' }, nextSceneId: 'om_s2' },
            { id: 'om_c1_berteriak_gaduh_kasar', teks: 'Berteriak keras memanggil dari kejauhan dengan gaya gaduh tergesa-gesa', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Di negeri kami, ketenangan dan suara lembut adalah cermin kedewasaan jiwa.' }, catatan: { judul: 'Pantangan Bersuara Keras di Oman', isi: 'Berteriak atau bersikap gaduh di ruang publik dipandang tidak beradab dalam norma kesopanan Oman.', kategori: 'Etiket' }, nextSceneId: 'om_s2' }
          ]
        },
        {
          id: 'om_s2',
          latar: 'Ruang Sablah (Majlis Tradisional Oman) Beralas Tikar Palem Halus',
          narasi: 'Asap dupa kemenyan Luban mengepul wangi membersihkan udara. Semangkuk kurma basah Fardh disajikan bersama poci Gahwa kapulaga.',
          dialog: { speaker: 'Salim', teks: 'Dalam adat Omani, makanlah kurma terlebih dahulu sebelum meneguk secangkir kopi Gahwa.', ekspresi: 'senang' },
          pilihan: [
            { id: 'om_c2_makan_kurma_baru_gahwa', teks: 'Mengambil kurma dengan tangan kanan, memakannya dengan nikmat, lalu menerima cangkir kopi Gahwa dengan tangan kanan', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Barakallahu fik! Tepat sekali tertib jamuan Omani: manisnya kurma membalut hangatnya kopi Gahwa.' }, catatan: { judul: 'Tertib Santap Kurma dan Kopi di Oman', isi: 'Di Oman, kurma selalu dimakan terlebih dahulu untuk menetralkan rasa pahit kapulaga kopi Gahwa tanpa gula.', kategori: 'Makan' }, nextSceneId: 'om_s3' },
            { id: 'om_c2_buang_biji_kurma_ke_karpet', teks: 'Meludahkan biji kurma langsung ke atas tikar sablah', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Letakkan biji kurma di piring penampung kecil dengan sopan, jangan di lantai.' }, catatan: { judul: 'Adab Meletakkan Biji Kurma', isi: 'Biji kurma dikumpulkan di wadah penampung kecil dengan tertib tangan kanan.', kategori: 'Makan' }, nextSceneId: 'om_s3' }
          ]
        },
        {
          id: 'om_s3',
          latar: 'Puncak Benteng Nizwa Menatap Hamparan Kebun Kurma Hijau di Bawah Senja',
          narasi: 'Lembayung senja membungkus perbukitan batu cadas Jabal Akhdar yang megah.',
          dialog: { speaker: 'Salim', teks: 'Ahsant atas kehadiranmu yang membawa keteduhan di kota kami hari ini.', ekspresi: 'senang' },
          pilihan: [
            { id: 'om_c3_ahsant_doa_oman', teks: 'Ucapkan "Ahsant jiddan, Salim. Fi hifzillah (dalam lindungan Allah), semoga Kesultanan Oman selalu damai!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Fi amanillah! Semoga langkah hidupmu selalu dipayungi kedamaian abadi.' }, catatan: { judul: 'Ungkapan Terima Kasih Bahasa Arab Oman', isi: 'Ahsant bermakna "kamu telah berbuat kebaikan mulia", ungkapan apresiasi tertinggi dalam budaya Oman.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'om_c3_pamit_tanpa_kata', teks: 'Bergegas pergi tanpa mengucap salam penutup', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga keselamatan selalu menyertai perjalananmu.' }, catatan: { judul: 'Keberkahan Pamitan Santun', isi: 'Menutup pertemuan dengan doa meneguhkan rasa persaudaraan yang kokoh.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Rafiq (Kawan Kehormatan) Nizwa', ringkasan: 'Salim menghadiahkan belati miniatur Khanjar perak dan menyambutmu sebagai sahabat sejati Kesultanan Oman.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Sablah Gurun', ringkasan: 'Keharuman dupa Luban dan kelezatan kurma Fardh menjadi kenangan spiritual yang damai di hatimu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Ketenangan Budi Pekerti Omani', ringkasan: 'Memahami nilai kesabaran dan etika jamuan sablah memperkaya kematangan budayamu di Timur Tengah.', badge: 'bronze' }
      ]
    }
  },

  // 12. PALESTINE (ps)
  {
    varName: 'palestineQuest',
    data: {
      id: 'quest-ps',
      countryId: 'ps',
      negara: 'Palestina',
      judul: 'Keharuman Minyak Zaitun Abu Tariq di Nablus',
      pengantar: 'Kamu berkunjung ke pemukiman kuno batu kapur milik Abu Tariq di kota bersejarah Nablus. Di Palestina, keteguhan hati (Sumud), hidangan Musakhan di atas roti Taboon berlumur minyak zaitun murni dan bumbu sumac merah tua, serta manisan Knafeh Nabulsi keju leleh adalah lambang cinta abadi pada tanah air.',
      npc: { nama: 'Abu Tariq', peran: 'Sesepuh Petani Zaitun & Pengrajin Sabun Nablus', avatar: 'AT', deskripsi: 'Pria sepuh bermata teduh penuh keteguhan mengenakan jubah Thobe katun gelap dan Keffiyeh kotak-kotak hitam putih khas Palestina.' },
      bekal: [
        { id: 'sabun_nablus', nama: 'Batangan Sabun Zaitun Murni Nablus', ikon: 'package', deskripsi: 'Sabun alami perasan minyak zaitun murni yang diproduksi sejak abad pertengahan.', kategori: 'oleh-oleh' },
        { id: 'frasa_palestina', nama: 'Catatan Ungkapan Marhaba & Yikhlif Aleik', ikon: 'message-square', deskripsi: 'Ungkapan salam hangat, terima kasih (Shukran), dan doa ketabahan.', kategori: 'frasa' },
        { id: 'rempah_sumac', nama: 'Kantong Rempah Sumac Merah Ungu', ikon: 'bookmark', deskripsi: 'Bubuk buah beri sumac asam segar pelengkap hidangan Musakhan.', kategori: 'pakaian' },
        { id: 'koin_kenangan_ps', nama: 'Koin Kenangan Bersejarah Palestina', ikon: 'coins', deskripsi: 'Koin suvenir bergambar cabang pohon zaitun lambang perdamaian abadi.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'ps_s1',
          latar: 'Lorong Beratap Lengkung Kuno di Pasar Tua Nablus Beraroma Sabun Zaitun',
          narasi: 'Lengkungan batu kuno berdiri kokoh menaungi gang kota tua. Abu Tariq berdiri menyambut di pintu masuk kediamannya.',
          dialog: { speaker: 'Abu Tariq', teks: 'Marhaba! Ahlan wa sahlan, selamat datang ke Nablus, kota zaitun dan ketabahan.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ps_c1_salam_erat_tatapan_hangat', teks: 'Menjawab salam dengan takzim, menjabat tangan erat dua tangan, dan berucap "Marhaba ya Ammu Abu Tariq, ahlan bik!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ahlan wa sahlan! Salam hangatmu mengobati rasa lelah kami di tanah leluhur ini.' }, catatan: { judul: 'Kehangatan Menyapa Tetua di Palestina', isi: 'Memanggil tetua dengan sebutan "Ammu" (pamanku) dan jabat tangan erat adalah tanda penghormatan dan persaudaraan sejati.', kategori: 'Etiket' }, nextSceneId: 'ps_s2' },
            { id: 'ps_c1_sapa_dingin_acuh', teks: 'Melambaikan tangan malas sambil sibuk memotret tanpa menyapa', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Di negeri kami, jabat tangan persaudaraan jauh lebih bermakna daripada sekadar gambar.' }, catatan: { judul: 'Nilai Kemanusiaan dalam Budaya Palestina', isi: 'Masyarakat Palestina sangat menghargai kontak emosional yang tulus dan empati mendalam.', kategori: 'Etiket' }, nextSceneId: 'ps_s2' }
          ]
        },
        {
          id: 'ps_s2',
          latar: 'Ruang Tengah Rumah Bertembok Batu Tebal Berhias Sulaman Tatreez',
          narasi: 'Nampan besar berisi hidangan Musakhan (ayam panggang rempah sumac di atas roti Taboon berlumur minyak zaitun) disajikan mengepul harum.',
          dialog: { speaker: 'Abu Tariq', teks: 'Makanlah Musakhan ini dengan tanganmu. Minyak zaitun ini hasil perasan kebun pohon warisan kakek kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ps_c2_santap_musakhan_tangan_kanan', teks: 'Merobek roti Taboon dengan tangan kanan, mengambil suwiran ayam gurih berbalur sumac, dan memuji kelezatannya', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Sahtein wa hana! Minyak zaitun tanah Palestina memang menyehatkan tubuh dan jiwa.' }, catatan: { judul: 'Etiket Menikmati Musakhan Palestina', isi: 'Musakhan adalah lambang musim panen zaitun; disantap menggunakan sobekan roti Taboon dengan tangan kanan secara bersahaja.', kategori: 'Makan' }, nextSceneId: 'ps_s3' },
            { id: 'ps_c2_hina_minyak_zaitun_berlebih', teks: 'Mengeluh dengan nada menghina bahwa makanannya terlalu banyak minyak', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Minyak zaitun murni adalah berkah suci tanah kami, bukan minyak murahan.' }, catatan: { judul: 'Kesucian Pohon Zaitun di Palestina', isi: 'Minyak zaitun dianggap suci dan merupakan simbol keberkahan tanah air yang sangat dijunjung tinggi.', kategori: 'Makan' }, nextSceneId: 'ps_s3' }
          ]
        },
        {
          id: 'ps_s3',
          latar: 'Teras Atas Rumah Menatap Perbukitan Gunung Gerizim dan Ebal di Kala Senja',
          narasi: 'Abu Tariq menyajikan sepiring manisan Knafeh Nabulsi hangat bertabur kacang pistachio hijau.',
          dialog: { speaker: 'Abu Tariq', teks: 'Shukran atas kehadiran dan ketulusan hatimu mendengarkan kisah tanah kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ps_c3_yikhlif_aleik_doa_sumud', teks: 'Ucapkan "Yikhlif aleik ya Ammu, shukran jazeelan. Semoga kedamaian dan keadilan selalu menyertai Palestina!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Yikhlif aleik! Doamu adalah pelita kekuatan kami. Semoga engkau selalu dalam lindungan-Nya.' }, catatan: { judul: 'Ungkapan Terima Kasih Khas Palestina', isi: 'Yikhlif aleik bermakna "semoga Allah melipatgandakan rezeki dan kebaikanmu", doa tulus rakyat Palestina.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'ps_c3_pergi_tanpa_pamit', teks: 'Langsung berjalan keluar tanpa mengucap salam penutup', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga langkahmu selalu diberkahi di mana pun berada.' }, catatan: { judul: 'Adab Pamitan di Palestina', isi: 'Perpisahan dengan doa memperkuat ikatan solidaritas kemanusiaan.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Sadiq (Sahabat Sejati) Nablus', ringkasan: 'Abu Tariq mengalungkan syal Keffiyeh sulaman tangan dan menyebutmu sebagai saudara kehormatan di tanah Palestina.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Kota Zaitun', ringkasan: 'Kelezatan Musakhan dan manisnya Knafeh Nabulsi menjadi kenangan persaudaraan yang membekas abadi di hatimu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Ketabahan dan Kemuliaan Jiwa', ringkasan: 'Memahami arti penting pohon zaitun dan adab silaturahmi memperkaya rasa empatimu di Asia Barat.', badge: 'bronze' }
      ]
    }
  },

  // 13. QATAR (qa)
  {
    varName: 'qatarQuest',
    data: {
      id: 'quest-qa',
      countryId: 'qa',
      negara: 'Qatar',
      judul: 'Kemilau Majlis Jasim di Souq Waqif, Doha',
      pengantar: 'Kamu diundang ke balai majlis tradisional berarsitektur lumpur kayu kapur milik budayawan Jasim di kawasan pasar bersejarah Souq Waqif di Doha. Di Qatar, etiket majlis suku bangsa Teluk, keharuman dupa Bukhoor safron, jamuan kurma Khalas bersama kopi Gahwa, dan etika privasi kesopanan adalah cermin peradaban modern yang berpijak kokoh pada warisan leluhur.',
      npc: { nama: 'Jasim', peran: 'Kolektor Elang Berburu (Falconry) & Tokoh Majlis Souq Waqif', avatar: 'JS', deskripsi: 'Pria terhormat berwibawa mengenakan Thobe putih bersih, ghutra putih terlipat rapi gaya elang (Kobra), dan sarung tangan kulit perawat elang.' },
      bekal: [
        { id: 'kurma_khalas', nama: 'Kotak Kurma Khalas Al-Hasa Emas', ikon: 'package', deskripsi: 'Kurma manis karamel berkualitas premium dari perkebunan oase.', kategori: 'oleh-oleh' },
        { id: 'frasa_qatar', nama: 'Catatan Ungkapan Marhaba & Ya Hala', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Mashkoor), dan adab majlis Qatar.', kategori: 'frasa' },
        { id: 'tudung_elang_burqa', nama: 'Tudung Kulit Elang Hiasan Burqa', ikon: 'bookmark', deskripsi: 'Kerajinan kulit penutup mata burung elang pemburu gurun.', kategori: 'pakaian' },
        { id: 'riyal_qa', nama: 'Mata Uang Riyal Qatar', ikon: 'coins', deskripsi: 'Uang kertas riyal resmi bergambar Museum Kesenian Islam Doha.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'qa_s1',
          latar: 'Lorong Berlantai Batu Pasar Tradisional Souq Waqif, Doha',
          narasi: 'Lentera tembaga bergoyang di teras kayu. Jasim berdiri di muka gerbang majlis menyambutmu dengan senyum ramah.',
          dialog: { speaker: 'Jasim', teks: 'Ya marhaba! Ahlan wa sahlan di majlis kami, silakan masuk ke ruang kehormatan.', ekspresi: 'senang' },
          pilihan: [
            { id: 'qa_c1_lepas_sepatu_salam_dada', teks: 'Melepas sepatu di luar teras, meletakkan tangan kanan di dada, dan membalas "Ya hala bik ya Jasim, marhaba!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Hala wallah! Langkahmu bersih dan adabmu sangat menghormati tempat kami.' }, catatan: { judul: 'Adab Melepas Sepatu di Majlis Qatar', isi: 'Sepatu selalu ditinggalkan di luar area duduk majlis sebagai bentuk menjaga kesucian dan kebersihan ruang bersama.', kategori: 'Etiket' }, nextSceneId: 'qa_s2' },
            { id: 'qa_c1_sorot_kamera_ke_warga_lokal', teks: 'Mengarahkan kamera ponsel langsung memotret keluarga wanita lokal di dekat gerbang', respectDelta: -35, reaksi: { ekspresi: 'kecewa', teks: 'Hentikan! Di Qatar, memotret orang tanpa izin adalah pelanggaran privasi dan hukum yang serius!' }, catatan: { judul: 'Etika Privasi Fotografi di Qatar', isi: 'Memotret warga lokal, terutama wanita dan keluarga, tanpa izin tertulis dilarang keras secara hukum dan etiket di Qatar.', kategori: 'Etiket' }, nextSceneId: 'qa_s2' }
          ]
        },
        {
          id: 'qa_s2',
          latar: 'Ruang Majlis Berkarpet Merah Marun dengan Tempat Duduk Sofa Lesehan Rendah',
          narasi: 'Burung elang berbulu cokelat keemasan bertengger anggun di tempat peristirahatannya. Poci Gahwa kapulaga disajikan bersama kurma Khalas manis.',
          dialog: { speaker: 'Jasim', teks: 'Makanlah kurma dengan ganjil (satu atau tiga butir), lalu minumlah kopi Gahwa ini dengan tangan kananmu.', ekspresi: 'senang' },
          pilihan: [
            { id: 'qa_c2_makan_kurma_ganjil_tangan_kanan', teks: 'Mengambil satu butir kurma dengan tangan kanan, memakannya dengan anggun, lalu menerima finjan kopi dengan tangan kanan', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Hayyakallah! Menikmati kurma dalam bilangan ganjil adalah sunnah adab bangsa kami.' }, catatan: { judul: 'Tradisi Bilangan Ganjil Memakan Kurma', isi: 'Di jazirah Arab, memakan kurma dalam hitungan ganjil (1, 3, atau 5 butir) adalah tradisi adab yang mencerminkan ketertiban diri.', kategori: 'Makan' }, nextSceneId: 'qa_s3' },
            { id: 'qa_c2_sentuh_elang_sembarangan', teks: 'Mencoba membelai kepala burung elang yang sedang bertengger tanpa seizin pawang', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Hati-hati! Burung elang pemangsa sangat peka terhadap gerakan mendadak orang asing.' }, catatan: { judul: 'Penghormatan pada Tradisi Falconry', isi: 'Burung elang adalah hewan kehormatan bernilai tinggi dan hanya boleh disentuh atas bimbingan sang empu.', kategori: 'Etiket' }, nextSceneId: 'qa_s3' }
          ]
        },
        {
          id: 'qa_s3',
          latar: 'Teras Atas Souq Menatap Cahaya Gedung Pencakar Langit West Bay di Seberang Teluk',
          narasi: 'Kilau lampu modern Teluk Doha berpadu indah dengan arsitektur klasik pasar tradisional.',
          dialog: { speaker: 'Jasim', teks: 'Mashkoor atas percakapan berharga yang telah mempererat tali persahabatan kita.', ekspresi: 'senang' },
          pilihan: [
            { id: 'qa_c3_mashkoor_fi_amanillah', teks: 'Ucapkan "Mashkoor jiddan ya Jasim. Fi amanillah, semoga Qatar selalu maju dan berkeadaban luhur!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ma’as salaamah! Pintu majlis kami akan selalu terbuka lebar untuk kedatanganmu kembali.' }, catatan: { judul: 'Ucapan Terima Kasih Bahasa Arab Qatar', isi: 'Mashkoor jiddan berarti "terima kasih banyak", menutup perjumpaan majlis dengan penuh kehormatan.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'qa_c3_pamit_gesa', teks: 'Berlari tergesa-gesa tanpa salam penutup', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga langkahmu selalu aman terlindungi.' }, catatan: { judul: 'Keanggunan Berpamitan', isi: 'Berpamitan dengan tenang menegaskan kesan mulia seorang sahabat.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Sahib (Sahabat Kehormatan) Doha', ringkasan: 'Jasim menghadiahkan tudung kulit elang Burqa bertatahkan benang emas dan menyambutmu sebagai kawan sejati di Qatar.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Majlis Souq Waqif', ringkasan: 'Kelezatan kurma Khalas dan wibawa tradisi elang falconry menjadi kenangan tak terlupakan di tanah Teluk.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesantunan Majlis Modern', ringkasan: 'Memahami privasi ruang publik dan etika jamuan kopi memperkaya wawasan diplomasimu di Timur Tengah.', badge: 'bronze' }
      ]
    }
  },

  // 14. SYRIA (sy)
  {
    varName: 'syriaQuest',
    data: {
      id: 'quest-sy',
      countryId: 'sy',
      negara: 'Suriah',
      judul: 'Keharuman Mawar Damaskus Paman Nabil',
      pengantar: 'Kamu berkunjung ke rumah tradisional berhalaman dalam (Beit Arabi) dengan air mancur batu pualam milik perajin mosaik kayu Paman Nabil di kota kuno Damaskus. Di Suriah, kemegahan peradaban kota tertua di dunia yang berpenghuni terus menerus, keharuman air mawar Damaskus, manisan Barazek wijen pistachio, dan ketabahan jiwa bangsa Levant adalah mutiara peradaban manusia.',
      npc: { nama: 'Paman Nabil', peran: 'Empu Tatah Kayu Mosaik Kulit Kerang & Tetua Bab Touma', avatar: 'PN', deskripsi: 'Pria sepuh berwajah teduh mengenakan rompi bordir wol dan peci kakek bersahaja dengan tutur kata sastra Syam yang amat manis.' },
      bekal: [
        { id: 'air_mawar_damaskus', nama: 'Botol Kristal Air Mawar Damaskus Asli', ikon: 'package', deskripsi: 'Penyulingan minyak bunga mawar Damaskus wangi legendaris.', kategori: 'oleh-oleh' },
        { id: 'frasa_suriah', nama: 'Catatan Ungkapan Ahlan Bika & Ya Hala', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih (Teslam), dan kata penghormatan Ammu.', kategori: 'frasa' },
        { id: 'kotak_kayu_mosaik', nama: 'Kotak Kayu Mosaik Kulit Kerang', ikon: 'bookmark', deskripsi: 'Kerajinan tatah kayu kenari bertatahkan cangkang kerang mutiara asli.', kategori: 'pakaian' },
        { id: 'pound_sy', nama: 'Mata Uang Pound Suriah', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar amfiteater kuno Bosra.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'sy_s1',
          latar: 'Pelataran Gerbang Bab Touma Berbatu Kuno di Kota Tua Damaskus',
          narasi: 'Pohon melati merambat di dinding batu kuno beraroma harum. Paman Nabil berdiri menyambut di pintu kayu berukir geometri rumit.',
          dialog: { speaker: 'Paman Nabil', teks: 'Ahlan wa sahlan! Ya marhaba di kota tertua di dunia, Damaskus yang selalu menyayangi tamunya.', ekspresi: 'senang' },
          pilihan: [
            { id: 'sy_c1_salam_dada_ammu_nabil', teks: 'Meletakkan tangan kanan di dada, membungkuk takzim, dan berucap "Ahlan bik ya Ammu Nabil, salam aleikum!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ahlan bik ya ibni (wahai anakku)! Kelembutan tutur katamu menghangatkan sanubari kami.' }, catatan: { judul: 'Kehalusan Bahasa Syam di Damaskus', isi: 'Masyarakat Damaskus terkenal dengan dialek bahasa Arab yang sangat puitis, santun, dan penuh kasih sayang kekeluargaan.', kategori: 'Bahasa' }, nextSceneId: 'sy_s2' },
            { id: 'sy_c1_sapa_kasual_tanpa_takzim', teks: 'Menyapa "Halo bro" sambil meniup permen karet santai', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Di kota penuh sejarah ini, kesantunan kata adalah mahkota kemuliaan insan.' }, catatan: { judul: 'Adab Berjumpa Tetua di Levant', isi: 'Sikap santai berlebihan di hadapan tetua dipandang kurang menghargai kedewasaan dan sejarah lokal.', kategori: 'Etiket' }, nextSceneId: 'sy_s2' }
          ]
        },
        {
          id: 'sy_s2',
          latar: 'Halaman Dalam (Hosh) dengan Pohon Jeruk Pahit dan Air Mancur Batu Marmer',
          narasi: 'Air mancur berdenting menenangkan. Paman Nabil menyajikan biskuit renyah Barazek bertabur wijen madu dan secangkir teh mint harum.',
          dialog: { speaker: 'Paman Nabil', teks: 'Cicipilah kue Barazek ini. Rasa manis wijen dan pistachionya adalah resep turun-temurun leluhur kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'sy_c2_cicip_barazek_tangan_kanan', teks: 'Menerima piring kue dengan tangan kanan, mencicipi kerapuhannya, dan memuji kelezatan madu wijennya', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Sahtein wa hana! Manisnya kue ini semoga mempermanis perjalanan hidupmu.' }, catatan: { judul: 'Tradisi Kue Barazek di Damaskus', isi: 'Barazek adalah kue kebanggaan Damaskus; memuji rasa buatannya membahagiakan hati keluarga tuan rumah.', kategori: 'Makan' }, nextSceneId: 'sy_s3' },
            { id: 'sy_c2_makan_rakus_cecer_remah', teks: 'Mengambil segenggam besar kue dengan tangan kiri dan membuang remahnya ke dalam kolam air mancur', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Air mancur ini dijaga kejernihannya, jangan lemparkan makanan ke dalamnya.' }, catatan: { judul: 'Kebersihan Air Mancur Hosh Tradisional', isi: 'Kolam air mancur halaman rumah Arab adalah elemen suci penyejuk udara dan tidak boleh dikotori.', kategori: 'Etiket' }, nextSceneId: 'sy_s3' }
          ]
        },
        {
          id: 'sy_s3',
          latar: 'Teras Atas Rumah Menatap Kubah Masjid Umayyah di Kala Senja Merah',
          narasi: 'Azan maghrib berkumandang syahdu dari menara masjid bersejarah di bawah lembayung senja Damaskus.',
          dialog: { speaker: 'Paman Nabil', teks: 'Teslam atas kehadiranmu yang telah membawa kegembiraan di kediaman kuno kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'sy_c3_teslam_doa_damai_suriah', teks: 'Ucapkan "Teslam idek ya Ammu Nabil. Ma’as salaamah, semoga kedamaian abadi selalu memayungi Suriah!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Allah yisallmak! Doamu adalah berkah terindah bagi negeri kami. Selamat jalan, saudaraku.' }, catatan: { judul: 'Doa Perlindungan Bahasa Arab Suriah', isi: 'Allah yisallmak bermakna "semoga Allah selalu menyelamatkan dan melindungimu", doa pamitan yang sangat mendalam.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'sy_c3_pergi_tanpa_kata', teks: 'Bergegas pergi tanpa mengucap salam perpisahan', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga keselamatan selalu menaungi langkahmu.' }, catatan: { judul: 'Keberkahan Penutup Silaturahmi', isi: 'Menutup kunjungan dengan doa meneguhkan rasa persaudaraan yang tak akan padam.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Ghalia (Sahabat Berharga) Damaskus', ringkasan: 'Paman Nabil menghadiahkan kotak kayu bertatahkan kulit kerang mutiara asli dan mengangkatmu sebagai kawan sejati di tanah Syam.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Beit Arabi Kuno', ringkasan: 'Kelezatan kue Barazek dan gemercik air mancur halaman Damaskus menjadi pelita kenangan indah di hatimu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Keluhuran Adab Syam', ringkasan: 'Memahami kelembutan tutur kata dan kesantunan jamuan memperkaya kepekaan budayamu di Suriah.', badge: 'bronze' }
      ]
    }
  },

  // 15. UNITED ARAB EMIRATES (ae)
  {
    varName: 'uaeQuest',
    data: {
      id: 'quest-ae',
      countryId: 'ae',
      negara: 'Uni Emirat Arab',
      judul: 'Kedermawanan Gahwa Sultan di Al Fahidi, Dubai',
      pengantar: 'Kamu berkunjung ke rumah halaman menara angin (Barjeel) milik budayawan Sultan di kawasan bersejarah Al Fahidi di tepi Dubai Creek. Di Uni Emirat Arab, tradisi kedermawanan padang pasir Karam, penyambutan kurma Bateel dan kopi Gahwa berkapulaga, serta perpaduan harmonis antara warisan suku Badui dan kemajuan masa depan adalah jiwa bangsa Uni Emirat Arab.',
      npc: { nama: 'Sultan', peran: 'Kurator Warisan Budaya Maritim & Tetua Majlis Al Fahidi', avatar: 'ST', deskripsi: 'Pria berwibawa mengenakan jubah Kandura putih bersih dengan tali karkusha beraroma oud dan ghutra putih rapi bersahaja.' },
      bekal: [
        { id: 'cokelat_susu_unta', nama: 'Kotak Cokelat Susu Unta Premium', ikon: 'package', deskripsi: 'Cokelat lembut kaya nutrisi dari susu unta padang pasir Emirat.', kategori: 'oleh-oleh' },
        { id: 'frasa_emirat', nama: 'Catatan Ungkapan Marhaba & Hayyakallah', ikon: 'message-square', deskripsi: 'Ungkapan salam khas Emirat, terima kasih (Shukran), dan adab majlis.', kategori: 'frasa' },
        { id: 'minyak_dehn_oud', nama: 'Minyak Wangi Gaharu Dehn Al Oud', ikon: 'bookmark', deskripsi: 'Minyak wangi kayu gaharu alami berkualitas tinggi warisan wewangian Teluk.', kategori: 'pakaian' },
        { id: 'dirham_ae', nama: 'Mata Uang Dirham Emirat', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar teko kopi Dallah tradisional.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'ae_s1',
          latar: 'Gang Berbatu Karang Al Fahidi Menghadap Dermaga Perahu Kayu Abra di Dubai Creek',
          narasi: 'Perahu kayu abra melintas anggun membelah riak air creek. Sultan menyambut di depan gerbang kayu jati bertatahkan paku kuningan.',
          dialog: { speaker: 'Sultan', teks: 'Marhaba! Hayyakumullah di majlis Al Fahidi, tempat bertemunya tradisi dan masa depan.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ae_c1_salam_dada_hayyakallah', teks: 'Meletakkan tangan kanan di dada, menjabat tangan hangat, dan berucap "Hayyakallah ya Sultan, marhaba bik!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Marhaban bik! Kesantunanmu mencerminkan jiwa tamu agung yang beradab luhur.' }, catatan: { judul: 'Salam Penuh Kehangatan di Uni Emirat Arab', isi: 'Sapaan "Hayyakallah" (semoga Allah memuliakan hidupmu) diiringi tangan di dada adalah salam penuh takzim di Uni Emirat Arab.', kategori: 'Bahasa' }, nextSceneId: 'ae_s2' },
            { id: 'ae_c1_masuk_pakai_alas_kaki_kotor', teks: 'Melangkah masuk ke atas karpet majlis tanpa melepas sandal luar', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Tolong tanggalkan sandalmu di depan pintu masuk majlis.' }, catatan: { judul: 'Menjaga Kebersihan Karpet Majlis Emirat', isi: 'Alas kaki luar selalu dilepas di ambang teras majlis untuk menjaga kebersihan lantai bersila.', kategori: 'Etiket' }, nextSceneId: 'ae_s2' }
          ]
        },
        {
          id: 'ae_s2',
          latar: 'Ruang Majlis Tradisional Beratap Balok Kayu Palem Berangin Sejuk dari Menara Barjeel',
          narasi: 'Poci kopi keemasan Dallah dituangkan perlahan ke cangkir Finjan kecil ditemani kurma manis isi almond.',
          dialog: { speaker: 'Sultan', teks: 'Gahwa adalah simbol kemurahan hati kami. Minumlah selagi mengepul wangi kapulaga.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ae_c2_terima_kanan_goyang_finjan', teks: 'Menerima finjan dengan tangan kanan, meneguknya santai, lalu menggoyangkan finjan perlahan tanda sudah cukup', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Sahtain wa afiyeh! Kamu paham betul bahasa isyarat finjan bangsa Arab Teluk.' }, catatan: { judul: 'Isyarat Finjan dalam Adab Gahwa Emirat', isi: 'Menggoyangkan finjan dari kanan ke kiri menandakan tamu sudah puas menikmati kopi dan tidak ingin dituangkan kembali.', kategori: 'Makan' }, nextSceneId: 'ae_s3' },
            { id: 'ae_c2_terima_finjan_tangan_kiri', teks: 'Mencomot finjan panas menggunakan tangan kiri dan menaruhnya sembarangan', respectDelta: -20, reaksi: { ekspresi: 'kecewa', teks: 'Gunakan tangan kanan untuk menerima kopi kehormatan tuan rumah.' }, catatan: { judul: 'Keutamaan Tangan Kanan dalam Upacara Gahwa', isi: 'Menerima dan memegang finjan dengan tangan kiri dipandang tidak beradab dalam tradisi kesopanan Emirat.', kategori: 'Makan' }, nextSceneId: 'ae_s3' }
          ]
        },
        {
          id: 'ae_s3',
          latar: 'Teras Atas Menara Barjeel Menatap Semburat Lampu Senja Menara Burj Khalifa di Kejauhan',
          narasi: 'Siluet menara modern tertinggi di dunia tampak menjulang di cakrawala petang Dubai yang mempesona.',
          dialog: { speaker: 'Sultan', teks: 'Shukran jazeelan atas kunjunganmu yang memperkaya persaudaraan antarbangsa di tanah kami.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ae_c3_shukran_fi_amanillah', teks: 'Ucapkan "Shukran jazeelan, Sultan. Fi amanillah, semoga Uni Emirat Arab selalu menjadi mercusuar kemajuan dan kedamaian!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ma’as salaamah! Doa yang sangat mulia. Semoga langkah hidupmu selalu dipenuhi kejayaan.' }, catatan: { judul: 'Doa Keselamatan Bahasa Arab Emirat', isi: 'Shukran jazeelan dan Ma’as salaamah menutup perjumpaan majlis dengan doa keselamatan abadi.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'ae_c3_pergi_tanpa_ucapan', teks: 'Bergegas turun tangga tanpa mengucap salam penutup', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Semoga langkahmu selalu aman dan terlindungi.' }, catatan: { judul: 'Etiket Berpamitan di Majlis', isi: 'Pamitan santun menegaskan keluhuran budi pekerti seorang tamu terhormat.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Khaveer (Sahabat Mulia) Dubai', ringkasan: 'Sultan menghadiahkan botol kristal minyak gaharu Dehn Al Oud dan menyambutmu sebagai sahabat sejati di tanah Emirat.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Majlis Al Fahidi', ringkasan: 'Kehangatan kopi Gahwa dan indahnya semilir angin menara Barjeel menjadi kenangan abadi di Dubai.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesantunan Budaya Teluk', ringkasan: 'Memahami adab finjan dan etika majlis memperkaya kedewasaan diplomasimu di Uni Emirat Arab.', badge: 'bronze' }
      ]
    }
  },

  // 16. YEMEN (ye)
  {
    varName: 'yemenQuest',
    data: {
      id: 'quest-ye',
      countryId: 'ye',
      negara: 'Yaman',
      judul: 'Kesejukan Kopi Qishr Sheikh Yahya di Sana’a Kuno',
      pengantar: 'Kamu berkunjung ke rumah menara bertingkat bata tanah liat (Tower House) milik Sheikh Yahya di kota tua Sana’a yang berusia ribuan tahun. Di Yaman, arsitektur jendela kaca patri warna-warni Qamariya, seduhan kulit kopi berempah kapulaga jahe (Qishr), madu murni Sidr Do’ani, dan belati perak bersarung lengkung Jambiya adalah pusaka kebanggaan tanah asal bangsa Arab.',
      npc: { nama: 'Sheikh Yahya', peran: 'Sesepuh Arsitektur Menara Kuno & Petani Kopi Mocha', avatar: 'SY', deskripsi: 'Pria sepuh karismatik mengenakan jubah Thobe putih bersahaja, syal kepala bermotif kembang, dan belati perak Jambiya terpasang tegak di sabuk pinggangnya.' },
      bekal: [
        { id: 'madu_sidr_yaman', nama: 'Guci Tanah Liat Madu Sidr Do’ani Murni', ikon: 'package', deskripsi: 'Madu nektar pohon bidara sidr pegunungan Hadramaut bernilai sangat tinggi.', kategori: 'oleh-oleh' },
        { id: 'frasa_yaman', nama: 'Catatan Ungkapan Marhaba Bikum', ikon: 'message-square', deskripsi: 'Ungkapan salam hangat Yaman, terima kasih (Shukran), dan doa berkah.', kategori: 'frasa' },
        { id: 'miniatur_jambiya', nama: 'Replika Belati Perak Jambiya Kuno', ikon: 'bookmark', deskripsi: 'Belati lengkung tradisional lambang kejantanan dan kehormatan pria Yaman.', kategori: 'pakaian' },
        { id: 'riyal_ye', nama: 'Mata Uang Riyal Yaman', ikon: 'coins', deskripsi: 'Uang kertas resmi bergambar pintu gerbang kota kuno Bab al-Yaman.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'ye_s1',
          latar: 'Pelataran Gerbang Bab al-Yaman Berbata Lumpur Putih Berornamen Gips, Sana’a',
          narasi: 'Jendela kaca patri Qamariya berkilauan warna-warni membiaskan sinar matahari. Sheikh Yahya berdiri menyambut di pintu masuk rumah menara bertingkat enam.',
          dialog: { speaker: 'Sheikh Yahya', teks: 'Marhaba bikum! Hayyakumullah di kota warisan leluhur tertua Sana’a.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ye_c1_salam_dada_sheikh_yahya', teks: 'Menjawab salam dengan takzim, meletakkan tangan kanan di dada, dan berucap "Marhaba ya Sheikh Yahya, ahlan bik!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Hayyakallah! Salam tangan di dada membuktikan engkau memuliakan tanah leluhur kami.' }, catatan: { judul: 'Adab Menyapa Tetua di Yaman', isi: 'Masyarakat Yaman menyambut tamu dengan meletakkan tangan di dada sebagai lambang ketulusan dan keterikatan persaudaraan.', kategori: 'Etiket' }, nextSceneId: 'ye_s2' },
            { id: 'ye_c1_pegang_gagang_jambiya', teks: 'Mencoba meraih dan menarik belati Jambiya yang terpasang di pinggang Sheikh Yahya', respectDelta: -35, reaksi: { ekspresi: 'kecewa', teks: 'Jangan pernah menyentuh senjata Jambiya orang lain! Itu lambang kehormatan pribadi yang sakral.' }, catatan: { judul: 'Pantangan Menyentuh Belati Jambiya di Yaman', isi: 'Menyentuh atau menarik belati Jambiya orang lain dianggap penghinaan atau ancaman serius dalam hukum adat suku Yaman.', kategori: 'Etiket' }, nextSceneId: 'ye_s2' }
          ]
        },
        {
          id: 'ye_s2',
          latar: 'Ruang Duduk Tertinggi (Mafraj) dengan Pemandangan Seluruh Atap Kota Tua Sana’a',
          narasi: 'Cahaya pelangi dari jendela kaca patri Qamariya jatuh di atas bantal duduk beludru. Poci tanah liat menyajikan minuman seduhan kulit kopi berempah kapulaga jahe (Qishr).',
          dialog: { speaker: 'Sheikh Yahya', teks: 'Ini Qishr, seduhan kulit biji kopi Mocha berempah jahe kayu manis. Minumlah selagi hangat mengepul.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ye_c2_minum_qishr_tangan_kanan', teks: 'Menerima cangkir tembikar dengan tangan kanan, menghirup aroma rempahnya, dan meminumnya perlahan dengan santun', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Bel’afiyeh! Kopi Qishr menenangkan pikiran dan menghangatkan tubuh di hawa sejuk pegunungan.' }, catatan: { judul: 'Tradisi Minum Kopi Qishr di Yaman', isi: 'Qishr adalah minuman tradisional Yaman dari rebusan kulit ceri kopi (cascara) dengan rempah jahe kapulaga penambah stamina.', kategori: 'Makan' }, nextSceneId: 'ye_s3' },
            { id: 'ye_c2_duduk_arah_kaki_ke_tetua', teks: 'Duduk selonjor mengarahkan kedua telapak kaki lurus ke wajah Sheikh Yahya', respectDelta: -25, reaksi: { ekspresi: 'kecewa', teks: 'Lipat kakimu dengan santun, jangan arahkan telapak kakimu kepada tetua majlis.' }, catatan: { judul: 'Pantangan Menghadapkan Kaki di Mafraj', isi: 'Duduk di ruang Mafraj dilakukan dengan bersila atau bersimpuh rapi tanpa memperlihatkan telapak kaki ke orang lain.', kategori: 'Etiket' }, nextSceneId: 'ye_s3' }
          ]
        },
        {
          id: 'ye_s3',
          latar: 'Puncak Atap Rumah Menara Sana’a di Bawah Bintang Gemerlap Langit Arab Selatan',
          narasi: 'Bulan sabit menyinari siluet ribuan rumah menara kota tua Sana’a yang tampak seperti negeri dongeng.',
          dialog: { speaker: 'Sheikh Yahya', teks: 'Shukran jazeelan atas silaturahmi yang membawa kedamaian di rumah menara kami malam ini.', ekspresi: 'senang' },
          pilihan: [
            { id: 'ye_c3_shukran_doa_damai_yaman', teks: 'Ucapkan "Shukran jazeelan ya Sheikh Yahya. Fi amanillah, semoga kedamaian dan kemakmuran selalu kembali ke Yaman!"', respectDelta: 20, reaksi: { ekspresi: 'kagum', teks: 'Ma’as salaamah! Doa damaimu sangat berarti bagi kami. Semoga engkau selalu terlindungi dalam kebaikan.' }, catatan: { judul: 'Doa Kedamaian untuk Yaman', isi: 'Mendoakan kedamaian bagi tanah Yaman adalah wujud cinta dan simpati terdalam bagi rakyat bangsa pejuang.', kategori: 'Bahasa' }, nextSceneId: 'ending' },
            { id: 'ye_c3_pamit_gesa_tanpa_kata', teks: 'Berlari menuruni tangga rumah menara tanpa pamitan', respectDelta: -10, reaksi: { ekspresi: 'bingung', teks: 'Hati-hati menuruni tangga curam rumah menara kami, Nak.' }, catatan: { judul: 'Keberkahan Penutup Silaturahmi', isi: 'Pamitan santun mengunci kenangan persaudaraan yang tak akan terlupakan.', kategori: 'Etiket' }, nextSceneId: 'ending' }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Asil (Sahabat Luhur) Sana’a', ringkasan: 'Sheikh Yahya menghadiahkan guci madu Sidr murni pegunungan Do’an dan menyambutmu sebagai saudara kehormatan di tanah Yaman.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Beradab di Rumah Menara Seribu Tahun', ringkasan: 'Kelezatan aroma kopi Qishr dan indahnya kilau jendela Qamariya menjadi kenangan abadi di tanah Arab Selatan.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Kesakralan Adat Pegunungan Arab', ringkasan: 'Memahami kesucian senjata kehormatan Jambiya dan etika duduk mafraj memperdalam kepekaan budayamu di Yaman.', badge: 'bronze' }
      ]
    }
  }
];

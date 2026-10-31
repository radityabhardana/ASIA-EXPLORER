export const eastAsiaQuests = [
  // 1. MONGOLIA (mn)
  {
    varName: 'mongoliaQuest',
    data: {
      id: 'quest-mn',
      countryId: 'mn',
      negara: 'Mongolia',
      judul: 'Kehangatan Ger Batbayar di Padang Rumput Altai',
      pengantar: 'Kamu berkunjung ke perkemahan yurt (Ger) milik penggembala nomaden Batbayar di padang stepa tak bertepi. Di Mongolia, pantangan menginjak ambang pintu kayu ger, menerima mangkuk teh susu Suutei Tsai dengan tangan kanan, dan adab duduk di sisi barat adalah hukum kehormatan padang rumput.',
      npc: {
        nama: 'Batbayar',
        peran: 'Penggembala Kuda Stepa & Ahli Busur Tradisional',
        avatar: 'BB',
        deskripsi: 'Pria tegap bermata tajam dengan jubah Deel wol biru bersabuk sutra oranye dan sepatu bot kulit berkumis melengkung.'
      },
      bekal: [
        { id: 'teh_suutei', nama: 'Bata Teh Padat & Garam Batu', ikon: 'package', deskripsi: 'Bahan dasar teh susu asin khas nomaden padang rumput.', kategori: 'oleh-oleh' },
        { id: 'frasa_mongol', nama: 'Catatan Ungkapan Sain Baina Uu', ikon: 'message-square', deskripsi: 'Ungkapan salam, terima kasih, dan doa perjalanan.', kategori: 'frasa' },
        { id: 'syal_khadag', nama: 'Syal Sutra Biru Khadag', ikon: 'bookmark', deskripsi: 'Syal sutra biru lambang langit abadi dan rasa hormat tertinggi.', kategori: 'pakaian' },
        { id: 'tugrik_mn', nama: 'Uang Tugrik Mongolia', ikon: 'coins', deskripsi: 'Mata uang resmi bergambar pahlawan Genghis Khan.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'mn_s1',
          latar: 'Pintu Masuk Tenda Bundar Ger di Tengah Padang Rumput',
          narasi: 'Kain felt putih tenda Ger berkibar pelan. Pintu kayu berukir merah terbuka menyambut. Batbayar berdiri di depan pintu.',
          dialog: { speaker: 'Batbayar', teks: 'Sain baina uu! Selamat datang ke perkemahan nomaden kami.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mn_c1_langkah_kanan_ambang',
              teks: 'Melangkahi ambang pintu kayu dengan kaki kanan tanpa menginjak kayu kusen sama sekali',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Sain baina! Kamu tahu aturan sakral Ger kami. Jangan pernah injak ambang pintu.' },
              catatan: { judul: 'Pantangan Menginjak Ambang Pintu Ger', isi: 'Dalam kosmologi nomaden Mongolia, menginjak ambang pintu sama dengan menginjak leher tuan rumah atau membawa sial bagi seluruh perkemahan.', kategori: 'Etiket' },
              nextSceneId: 'mn_s2'
            },
            {
              id: 'mn_c1_injak_ambang',
              teks: 'Menginjak kayu ambang pintu dengan kedua sepatu bot untuk membersihkan debu',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Astaga! Mengapa kamu menginjak ambang pintu kami? Itu pantangan paling berat!' },
              catatan: { judul: 'Kekudusan Ambang Pintu Nomaden', isi: 'Menginjak ambang pintu adalah penghinaan berat dalam budaya nomaden Mongolia kuno.', kategori: 'Etiket' },
              nextSceneId: 'mn_s2'
            }
          ]
        },
        {
          id: 'mn_s2',
          latar: 'Di Dalam Tenda Ger Mengelilingi Tungku Api Perapian',
          narasi: 'Istri Batbayar menyajikan semangkuk susu kuda fermentasi (Airag) dan roti gurih Boortsog.',
          dialog: { speaker: 'Batbayar', teks: 'Cicipilah Airag ini. Di padang rumput, tamu wajib mencicipi hidangan yang disuguhkan.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mn_c2_terima_kanan_siku',
              teks: 'Menerima mangkuk dengan tangan kanan sambil menopang siku kanan dengan telapak tangan kiri, lalu mencicipi seteguk',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Hebat! Menopang siku adalah tanda kepatuhan pada adab padang rumput.' },
              catatan: { judul: 'Menerima Sajian di Mongolia', isi: 'Menerima mangkuk atau hadiah wajib menggunakan tangan kanan dengan tangan kiri menopang siku, dan mencicipi seteguk sebagai tanda penghargaan.', kategori: 'Makan' },
              nextSceneId: 'mn_s3'
            },
            {
              id: 'mn_c2_tolak_airag',
              teks: 'Menepis mangkuk dengan satu tangan kiri karena bau fermentasi',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Menolak minuman suguhan tanpa mencicipi melukai kehormatan tuan rumah.' },
              catatan: { judul: 'Wajib Mencicipi Hidangan Tuan Rumah', isi: 'Di Mongolia, tamu minimal menyentuhkan bibir ke mangkuk sebagai bukti niat baik persaudaraan.', kategori: 'Makan' },
              nextSceneId: 'mn_s3'
            }
          ]
        },
        {
          id: 'mn_s3',
          latar: 'Padang Rumput Luas Menatap Matahari Terbenam di Horizon Stepa',
          narasi: 'Kuda-kuda padang rumput merumput dengan tenang di bawah langit biru luas tanpa batas.',
          dialog: { speaker: 'Batbayar', teks: 'Bayarlalaa atas kunjungan penuh kehormatan ini, wahai penjelajah.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'mn_c3_bayarlalaa_khadag',
              teks: 'Menyerahkan syal sutra Khadag biru dengan kedua tangan terbuka sambil berucap "Bayarlalaa, Batbayar!"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Khadag biru lambang langit abadi! Kamu sekarang adalah saudara darah padang rumput kami.' },
              catatan: { judul: 'Pemberian Khadag Biru Mongolia', isi: 'Menyerahkan kain Khadag biru dengan telapak tangan terbuka adalah persembahan rasa hormat dan persahabatan spiritual tertinggi di Mongolia.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            },
            {
              id: 'mn_c3_tunjuk_kaki_arah_ger',
              teks: 'Duduk selonjor mengarahkan telapak kaki ke arah tungku api perapian sambil pamit',
              respectDelta: -20,
              reaksi: { ekspresi: 'kecewa', teks: 'Tarik kakimu! Jangan arahkan telapak kakimu ke perapian suci.' },
              catatan: { judul: 'Pantangan Menghadapkan Kaki ke Tungku', isi: 'Tungku perapian adalah tempat bernaungnya roh pelindung keluarga dalam tradisi Mongolia.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Ksatria Langit Abadi Stepa', ringkasan: 'Batbayar menghadiahkan busur panah tanduk tradisional dan menabalkanmu sebagai saudara kehormatan di padang rumput Altai.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Tamu Terhormat di Tenda Ger', ringkasan: 'Kenikmatan semangkuk Airag dan luasnya cakrawala padang rumput Mongolia terukir abadi di hatimu.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Adab Penggembala Kuda', ringkasan: 'Menghormati kekudusan ambang pintu dan tradisi mangkuk menopang siku memperdalam kebijaksanaan antarbudayamu.', badge: 'bronze' }
      ]
    }
  },

  // 2. KOREA UTARA (kp)
  {
    varName: 'northKoreaQuest',
    data: {
      id: 'quest-kp',
      countryId: 'kp',
      negara: 'Korea Utara',
      judul: 'Protokol Santun Pemandu Ri Yong-ho',
      pengantar: 'Kamu berkunjung ke pusat sejarah dan kebudayaan di Pyongyang dipandu oleh Ri Yong-ho. Di Korea Utara, tata krama formal tingkat tinggi (Hasipsio-che), penghormatan mutlak pada simbol dan monumen kenegaraan, serta ketertiban sikap adalah etiket wajib yang tak boleh dilanggar.',
      npc: {
        nama: 'Ri Yong-ho',
        peran: 'Pemandu Sejarah Kebudayaan Nasional Pyongyang',
        avatar: 'RY',
        deskripsi: 'Pria tegap berpakaian setelan jas Choson-ot abu-abu rapi dengan lencana merah di dada kiri dan tutur kata sangat teratur.'
      },
      bekal: [
        { id: 'ginseng_kaesong', nama: 'Kotak Ginseng Merah Kaesong Asli', ikon: 'package', deskripsi: 'Akar ginseng merah premium kebanggaan semenanjung Korea.', kategori: 'oleh-oleh' },
        { id: 'frasa_formal_kp', nama: 'Catatan Ungkapan Formal Korea', ikon: 'message-square', deskripsi: 'Ungkapan Annyeonghashimnikka dan Kamsahamnida tingkat tinggi.', kategori: 'frasa' },
        { id: 'pin_sahabat', nama: 'Semat Kemeja Diplomatik', ikon: 'bookmark', deskripsi: 'Pin lambang pertukaran budaya persahabatan antarbangsa.', kategori: 'pakaian' },
        { id: 'won_kp', nama: 'Uang Won Korea Rapi', ikon: 'coins', deskripsi: 'Mata uang kertas dalam dompet tertata rapi.', kategori: 'uang' }
      ],
      adegan: [
        {
          id: 'kp_s1',
          latar: 'Pelataran Monumental Berlantai Granit Abu-abu, Pyongyang',
          narasi: 'Angin sejuk berhembus di pelataran luas berlatar Sungai Taedong. Ri Yong-ho berdiri tegak menyambutmu.',
          dialog: { speaker: 'Ri Yong-ho', teks: 'Annyeonghashimnikka! Selamat datang ke ibu kota Pyongyang.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kp_c1_bungkuk_formal',
              teks: 'Membungkuk 30 derajat dengan kedua tangan di samping celana dan menyapa "Annyeonghashimnikka, Pemandu Ri"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Bagus sekali. Kesantunan dan kerapian sikapmu mencerminkan penghargaan tinggi.' },
              catatan: { judul: 'Bentuk Hormat Tingkat Tinggi di Korea', isi: 'Penggunaan register formal Hasipsio-che dan membungkuk takzim adalah protokol wajib saat berinteraksi resmi di Korea Utara.', kategori: 'Bahasa' },
              nextSceneId: 'kp_s2'
            },
            {
              id: 'kp_c1_tos_kasual',
              teks: 'Menepuk dada dan berkata "Hai bung, apa kabar?" dengan gaya santai',
              respectDelta: -25,
              reaksi: { ekspresi: 'kecewa', teks: 'Harap jaga kesopanan formal. Di tempat ini keseriusan adalah tanda kehormatan.' },
              catatan: { judul: 'Protokol Kerapian di Pyongyang', isi: 'Gaya santai berlebihan dipandang tidak beradab dalam konteks kunjungan terpandu di Korea Utara.', kategori: 'Etiket' },
              nextSceneId: 'kp_s2'
            }
          ]
        },
        {
          id: 'kp_s2',
          latar: 'Galeri Museum Sejarah Nasional Pyongyang',
          narasi: 'Ri Yong-ho memandu melewati koridor pameran foto dan dokumen bersejarah.',
          dialog: { speaker: 'Ri Yong-ho', teks: 'Di galeri ini, seluruh surat kabar dan potret tokoh pendiri harus diperlakukan dengan penuh rasa hormat.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kp_c2_bawa_koran_lurus',
              teks: 'Menerima koran lembaran budaya dengan dua tangan dan menyimpannya mendatar tanpa melipat bagian wajah foto',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Tindakanmu sangat cermat dan memahami aturan etika visual kami.' },
              catatan: { judul: 'Etika Foto dan Surat Kabar di Korea Utara', isi: 'Di Korea Utara, surat kabar yang memuat foto pemimpin tidak boleh dilipat melintang di wajah foto atau diduduki.', kategori: 'Etiket' },
              nextSceneId: 'kp_s3'
            },
            {
              id: 'kp_c2_lipat_koran_kantong',
              teks: 'Meremas surat kabar lalu menjejalkannya ke saku belakang celana',
              respectDelta: -30,
              reaksi: { ekspresi: 'kecewa', teks: 'Hentikan! Jangan remas atau duduki gambar dokumen kenegaraan!' },
              catatan: { judul: 'Pantangan Pelanggaran Simbolik di Korea Utara', isi: 'Menduduki atau meremas foto pemimpin adalah pelanggaran hukum dan etiket paling fatal di Korea Utara.', kategori: 'Etiket' },
              nextSceneId: 'kp_s3'
            }
          ]
        },
        {
          id: 'kp_s3',
          latar: 'Ruang Makan Tradisional Okryu-gwan di Tepi Taedong',
          narasi: 'Semangkuk mie dingin Pyongyang Naengmyeon disajikan dalam mangkuk kuningan berkilau.',
          dialog: { speaker: 'Ri Yong-ho', teks: 'Kamsahamnida atas kerja sama dan kepatuhanmu pada tata tertib selama kunjungan.', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'kp_c3_kamsahamnida_formal',
              teks: 'Ucapkan "Daidanhi Kamsahamnida, Pemandu Ri. Terima kasih atas bimbingan yang teratur ini"',
              respectDelta: 20,
              reaksi: { ekspresi: 'kagum', teks: 'Semoga kunjungan ini memperluas wawasanmu tentang keteguhan bangsa kami.' },
              catatan: { judul: 'Ucapan Terima Kasih Formal Korea', isi: 'Kamsahamnida tingkat tinggi menunjukkan pengakuan atas dedikasi pemandu lokal.', kategori: 'Bahasa' },
              nextSceneId: 'ending'
            },
            {
              id: 'kp_c3_keluar_rombongan',
              teks: 'Mencoba kabur sendiri keluar gedung tanpa izin pemandu',
              respectDelta: -35,
              reaksi: { ekspresi: 'kecewa', teks: 'Harap tetap berada bersama pemandu resmi demi keselamatan dan ketertiban bersama.' },
              catatan: { judul: 'Aturan Pendampingan Pemandu di Korea Utara', isi: 'Pengunjung luar negeri wajib selalu didampingi oleh pemandu resmi yang berwenang.', kategori: 'Etiket' },
              nextSceneId: 'ending'
            }
          ]
        }
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Tamu Teladan Pyongyang', ringkasan: 'Ri Yong-ho memuji kedisiplinan dan rasa hormatmu serta menghadiahkan buku seni cetak tradisional Choson.', badge: 'gold' },
        { id: 'diterima', minRespect: 50, judul: 'Pengelana Tertib Semenanjung Utara', ringkasan: 'Kelezatan mie dingin Naengmyeon dan ketertiban kota Pyongyang meninggalkan pemahaman budaya yang mendalam.', badge: 'silver' },
        { id: 'canggung', minRespect: 0, judul: 'Pelajaran Protokol Disiplin', ringkasan: 'Menyadari betapa sakralnya aturan dan tata krama kenegaraan memperluas kehati-hatianmu sebagai penjelajah.', badge: 'bronze' }
      ]
    }
  }
];

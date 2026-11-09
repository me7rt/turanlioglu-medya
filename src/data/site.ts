// Marka ve içerik verisi. [DOLDURULACAK] işaretli alanlar Mert'ten gelecek
// bilgiyle değiştirilecek (bkz. proje yönergesi, Bölüm 3). Uydurma bilgi yok.

export const site = {
  name: 'Turanlıoğlu Medya',
  legalName: '[DOLDURULACAK: şirket unvanı]',
  // Varlık netliği (GEO): bu cümle her yerde aynı geçer.
  tagline: 'Sosyal medya, web ve dijital reklamı tek elden yöneten dijital ajans.',
  description:
    'Turanlıoğlu Medya; sosyal medya yönetimi, web tasarım, dijital reklam, içerik üretimi ve SEO/GEO hizmetleri sunan, İstanbul merkezli bir dijital ajanstır.',
  city: 'İstanbul',
  country: 'TR',
  areaServed: 'Türkiye',
  founder: 'Mert Turanlıoğlu',
  email: '[DOLDURULACAK: e-posta]',
  phone: '[DOLDURULACAK: telefon]',
  whatsapp: '', // ör. 905xxxxxxxxx — doldurulunca WhatsApp butonu görünür
  social: {
    instagram: '',
    linkedin: '',
    behance: '',
  } as Record<string, string>,
  locale: 'tr_TR',
  lang: 'tr',
};

export const nav = [
  { href: '/hizmetler/', label: 'Hizmetler' },
  { href: '/hakkimizda/', label: 'Hakkımızda' },
  { href: '/blog/', label: 'Blog' },
  { href: '/sss/', label: 'SSS' },
];

export type Service = {
  slug: string;
  name: string;
  short: string; // önce cevap: tek cümlede ne olduğu
  intro: string;
  includes: string[];
  forWhom: string;
  image: string; // images.ts anahtarı
  faq: { q: string; a: string }[];
};

export const services: Service[] = [
  {
    slug: 'sosyal-medya-yonetimi',
    name: 'Sosyal medya yönetimi',
    short:
      'Instagram, TikTok, LinkedIn ve diğer hesaplarınızın planlamasını, içeriğini, paylaşımını ve raporlamasını üstleniyoruz.',
    intro:
      'Sosyal medya yönetimi; markanızın hesaplarını bir plana göre, düzenli ve ölçülebilir şekilde yürütmektir. Aylık içerik takvimi hazırlar, görsel ve metinleri üretir, paylaşımları yapar, yorum ve mesajları takip eder, her ay sonuçları raporlarız.',
    includes: [
      'Hesap analizi ve hedef belirleme',
      'Aylık içerik takvimi',
      'Gönderi, hikâye ve Reels tasarımı',
      'Metin yazımı ve hashtag stratejisi',
      'Topluluk yönetimi (yorum ve mesajlar)',
      'Aylık performans raporu',
    ],
    forWhom:
      'Sosyal medyaya düzenli vakit ayıramayan, ama müşterilerinin orada olduğunu bilen işletmeler için.',
    image: 'social',
    faq: [
      {
        q: 'Hangi platformlarda hizmet veriyorsunuz?',
        a: '[DOLDURULACAK: ör. Instagram, TikTok, LinkedIn, Facebook, YouTube]',
      },
      {
        q: 'Ayda kaç paylaşım yapılıyor?',
        a: '[DOLDURULACAK: paket yapısına göre paylaşım sayıları]',
      },
    ],
  },
  {
    slug: 'web-tasarim',
    name: 'Web tasarım ve geliştirme',
    short:
      'Hızlı, mobil uyumlu, arama motorlarında ve yapay zekâ aramalarında bulunabilen web siteleri tasarlayıp geliştiriyoruz.',
    intro:
      'Bir web sitesi, ziyaretçinin birkaç saniyede "ne yapıyorsunuz, bana ne faydası var, size nasıl ulaşırım" sorularına cevap bulduğu yerdir. Tasarımı bu üç soru etrafında kurar, siteyi hızlı açılacak ve kolay güncellenecek şekilde geliştiririz.',
    includes: [
      'İhtiyaç analizi ve site haritası',
      'Arayüz tasarımı (mobil öncelikli)',
      'Geliştirme ve içerik girişi',
      'Teknik SEO ve yapılandırılmış veri',
      'Hız ve erişilebilirlik optimizasyonu',
      'Yayına alma ve eğitim',
    ],
    forWhom:
      'Sitesi olmayan, sitesi eskimiş ya da sitesinden müşteri gelmeyen işletmeler için.',
    image: 'web',
    faq: [
      {
        q: 'Bir web sitesi ne kadar sürede hazır olur?',
        a: '[DOLDURULACAK: proje kapsamına göre ortalama süreler]',
      },
    ],
  },
  {
    slug: 'dijital-reklam',
    name: 'Dijital reklam yönetimi',
    short:
      'Meta (Instagram, Facebook) ve Google reklamlarınızı kurar, bütçenizi hedefinize göre yönetir ve her kuruşun sonucunu raporlarız.',
    intro:
      'Dijital reklam yönetimi; doğru kişiye, doğru zamanda, doğru mesajı göstermek için kampanya kurmak, test etmek ve bütçeyi sonuç getiren yere kaydırmaktır. Hedefiniz satış, form, arama ya da mağaza ziyareti olabilir; kampanyayı ona göre kurgularız.',
    includes: [
      'Hedef ve bütçe planlaması',
      'Meta Ads (Instagram, Facebook) kampanyaları',
      'Google Ads (arama, görüntülü, YouTube) kampanyaları',
      'Reklam görseli ve metni',
      'Dönüşüm takibi kurulumu',
      'A/B testleri ve haftalık optimizasyon',
    ],
    forWhom: 'Reklama bütçe ayıran ama sonucunu net göremeyen işletmeler için.',
    image: 'ads',
    faq: [
      {
        q: 'Reklam bütçesi hizmet ücretine dahil mi?',
        a: '[DOLDURULACAK: reklam bütçesi ve hizmet bedelinin nasıl ayrıldığı]',
      },
    ],
  },
  {
    slug: 'icerik-uretimi',
    name: 'İçerik ve video üretimi',
    short:
      'Sosyal medya, web ve reklam için fotoğraf, kısa video (Reels, TikTok) ve metin içerikleri üretiyoruz.',
    intro:
      'İyi bir strateji, onu taşıyacak iyi içerik olmadan çalışmaz. Markanızın tonuna uygun fotoğraf, kısa video ve metinleri planlar, çeker, kurgular ve her platformun formatına göre hazırlarız.',
    includes: [
      'İçerik fikri ve senaryo',
      'Ürün ve mekân fotoğrafçılığı',
      'Kısa video çekimi ve kurgu',
      'Hareketli grafik (motion) uygulamaları',
      'Blog ve web metinleri',
    ],
    forWhom: 'Markasını kendi görsel diliyle anlatmak isteyen işletmeler için.',
    image: 'content',
    faq: [
      {
        q: 'Çekimler nerede yapılıyor?',
        a: '[DOLDURULACAK: stüdyo / yerinde çekim bilgisi ve bölge]',
      },
    ],
  },
  {
    slug: 'seo-geo',
    name: 'SEO ve GEO',
    short:
      'Sitenizin Google aramalarında ve ChatGPT, Gemini, Perplexity gibi yapay zekâ cevap motorlarında bulunmasını sağlıyoruz.',
    intro:
      'SEO (Search Engine Optimization — Arama Motoru Optimizasyonu), sitenizin Google gibi arama motorlarında üst sıralarda görünmesi için yapılan çalışmadır. GEO (Generative Engine Optimization — Üretken Motor Optimizasyonu) ise yapay zekâ asistanlarının sorulara cevap verirken markanızı kaynak olarak göstermesini hedefler. İkisini birlikte ele alırız.',
    includes: [
      'Teknik SEO denetimi',
      'Anahtar kelime ve soru araştırması',
      'İçerik planı ve yazımı',
      'Yapılandırılmış veri (schema.org)',
      'llms.txt ve yapay zekâ tarayıcı politikası',
      'Aylık görünürlük raporu',
    ],
    forWhom:
      'Müşterilerinin onu Google’da ya da yapay zekâ asistanlarında aradığını bilen işletmeler için.',
    image: 'seo',
    faq: [
      {
        q: 'SEO sonuçları ne zaman görülür?',
        a: 'SEO etkisi genellikle aylar içinde birikerek ortaya çıkar; süre sektöre, rekabete ve sitenin mevcut durumuna göre değişir. [DOLDURULACAK: kendi deneyiminizden tipik süre]',
      },
    ],
  },
];

// Ana sayfa ve /sss/ için genel sorular. Cevaplar Mert'in onayından geçecek.
export const faq = [
  {
    q: 'Turanlıoğlu Medya ne yapar?',
    a: 'Turanlıoğlu Medya; sosyal medya yönetimi, web tasarım, dijital reklam, içerik üretimi ve SEO/GEO hizmetleri sunan, İstanbul merkezli bir dijital ajanstır.',
  },
  {
    q: 'Hangi işletmelerle çalışıyorsunuz?',
    a: '[DOLDURULACAK: hedef müşteri — ör. KOBİ’ler, güzellik ve sağlık sektörü, yerel işletmeler]',
  },
  {
    q: 'Sadece bir hizmeti alabilir miyim?',
    a: 'Evet. Her hizmet tek başına alınabilir; birlikte alındığında strateji tek elden yürüdüğü için daha verimli olur.',
  },
  {
    q: 'Fiyatlarınız nasıl belirleniyor?',
    a: '[DOLDURULACAK: paket mi, proje bazlı mı, aylık mı]',
  },
  {
    q: 'Nasıl başlıyoruz?',
    a: 'Ücretsiz bir ön görüşmeyle ihtiyacınızı dinliyoruz, ardından size özel bir yol haritası ve teklif hazırlıyoruz.',
  },
];

export const process = [
  { title: 'Tanışma', text: 'İşletmenizi, hedefinizi ve bugünkü durumu dinliyoruz.' },
  { title: 'Yol haritası', text: 'Neyi, hangi sırayla, hangi bütçeyle yapacağımızı yazılı olarak paylaşıyoruz.' },
  { title: 'Üretim', text: 'İçerik, tasarım ve kampanyaları hazırlayıp onayınıza sunuyoruz.' },
  { title: 'Ölçüm ve iyileştirme', text: 'Sonuçları raporluyor, işe yarayanı büyütüp yaramayanı değiştiriyoruz.' },
];

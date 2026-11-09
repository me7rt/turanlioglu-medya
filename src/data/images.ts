// Geçici stok görseller — Unsplash Lisansı (ticari kullanım serbest, atıf zorunlu değil).
// https://unsplash.com/license
// Revize aşamasında gerçek çekimler / marka görselleriyle değiştirilecek.
// Görseller Unsplash CDN'inden (images.unsplash.com) çağrılır; Unsplash'ın
// önerdiği kullanım şekli budur. Yayına çıkmadan önce yerel kopyaya geçilebilir.

export type StockImage = { id: string; alt: string; w: number; h: number };

export const images: Record<string, StockImage> = {
  hero: {
    id: 'photo-1552664730-d307ca884978',
    alt: 'Bir masa etrafında not kâğıtlarıyla fikir geliştiren ekip',
    w: 1600, h: 1067,
  },
  social: {
    id: 'photo-1611162617474-5b21e879e113',
    alt: 'Ekranında sosyal medya uygulamaları görünen akıllı telefon',
    w: 1600, h: 1067,
  },
  web: {
    id: 'photo-1498050108023-c5249f4df085',
    alt: 'Dizüstü bilgisayarda açık kod editörü',
    w: 1600, h: 1067,
  },
  ads: {
    id: 'photo-1460925895917-afdab827c52f',
    alt: 'Dizüstü bilgisayar ekranında reklam ve trafik grafikleri',
    w: 1600, h: 1067,
  },
  content: {
    id: 'photo-1492691527719-9d1e07e534b4',
    alt: 'Kamerayla çekim yapan içerik üreticisi',
    w: 1600, h: 1067,
  },
  seo: {
    id: 'photo-1551288049-bebda4e38f71',
    alt: 'Ekranda analiz paneli ve performans grafikleri',
    w: 1600, h: 1067,
  },
  team: {
    id: 'photo-1522202176988-66273c2fd55f',
    alt: 'Dizüstü bilgisayarlarla birlikte çalışan genç ekip',
    w: 1600, h: 1067,
  },
  blogGeo: {
    id: 'photo-1504868584819-f8e8b4b6d7e3',
    alt: 'Masada veri grafikleri ve dizüstü bilgisayar',
    w: 1600, h: 1067,
  },
};

export function imgSrc(key: string, width = 1200): string {
  const im = images[key];
  return `https://images.unsplash.com/${im.id}?auto=format&fit=crop&w=${width}&q=70`;
}

export function imgSrcset(key: string, widths = [480, 800, 1200, 1600]): string {
  return widths.map((w) => `${imgSrc(key, w)} ${w}w`).join(', ');
}

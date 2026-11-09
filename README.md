# Turanlıoğlu Medya — kurumsal web sitesi

Sosyal medya, web ve dijital reklam hizmetlerini anlatan; SEO ve GEO (yapay zekâ aramaları) uyumlu, hızlı ve erişilebilir ajans sitesi.

**Canlı önizleme:** https://me7rt.github.io/turanlioglu-medya/
(Önizleme arama motorlarına kapalıdır. Asıl yayın ileride Cloudflare Pages'te olacak.)

## Nasıl revize ediyoruz?

1. Her revize bir **issue** olarak açılır ([Issues](../../issues)). Issue'lar aşamalara (**milestone**) bağlıdır.
2. Claude revizeyi ayrı bir dalda yapar ve **pull request** açar.
3. PR birleşince önizleme 1–2 dakika içinde kendiliğinden güncellenir.
4. Siteyi inceleyip yeni yorumunu ilgili issue'ya ya da sohbete yazarsın.

Aşamalar ve yapılacaklar: [docs/calisma-plani.md](docs/calisma-plani.md)

## Teknik

- **Astro** (statik site, her sayfa hazır HTML olarak gelir — SEO/GEO için ideal)
- Fontlar: Bricolage Grotesque (başlık), Instrument Sans (metin) — ikisi de SIL Open Font License, siteyle birlikte barındırılıyor
- Kurumsal renkler: turkuaz `#40E0D0` (rgb 64,224,208) ve `#30D5C8` (rgb 48,213,200)
- SEO/GEO: JSON-LD schema (ProfessionalService, WebSite, BreadcrumbList, Service, FAQPage, BlogPosting, Person), `sitemap-index.xml`, `robots.txt` (yapay zekâ botları dahil), `llms.txt`, RSS, Open Graph

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ klasörüne statik site
```

### Ortam değişkenleri

| Değişken | Önizleme (GitHub Pages) | Yayın (Cloudflare Pages) |
|---|---|---|
| `SITE_URL` | `https://me7rt.github.io` | `https://alanadi.com` |
| `BASE_PATH` | `/turanlioglu-medya` | boş bırak |
| `PUBLIC_PREVIEW` | `true` (noindex) | boş bırak |

Cloudflare Pages ayarı: Build command `npm run build`, output `dist`, Node 22.

## İçerik nerede?

- Marka bilgisi, hizmetler, SSS: `src/data/site.ts`
- Blog yazıları: `src/content/blog/*.md`
- Görseller: `src/data/images.ts` (bkz. [docs/gorsel-lisanslari.md](docs/gorsel-lisanslari.md))

`[DOLDURULACAK: ...]` ile işaretli yerler sarı görünür; gerçek bilgi gelince doldurulur. Sahte yorum, rakam ya da referans kullanılmaz.

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { site, services, faq } from '../data/site';

// https://llmstxt.org — yapay zekâ araçları için sitenin kısa özeti ve önemli sayfaları
export const GET: APIRoute = async ({ site: siteUrl }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const abs = (p: string) => new URL(base + p, siteUrl).toString();
  const posts = (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  const ready = faq.filter((f) => !f.a.includes('[DOLDURULACAK'));

  const body = `# ${site.name}

> ${site.description}

${site.name}, ${site.founder} tarafından kurulmuştur ve ${site.city} merkezlidir. Hizmet bölgesi: ${site.areaServed}. İletişim ve ücretsiz ön görüşme: ${abs('/iletisim/')}

## Hizmetler

${services.map((s) => `- [${s.name}](${abs(`/hizmetler/${s.slug}/`)}): ${s.short}`).join('\n')}

## Rehberler

${posts.map((p) => `- [${p.data.title}](${abs(`/blog/${p.id}/`)}): ${p.data.description}`).join('\n')}

## Kurumsal

- [Hakkımızda](${abs('/hakkimizda/')}): Kurucu ve ajans hakkında bilgi
- [Sık sorulan sorular](${abs('/sss/')}): Çalışma süreci ve hizmetler hakkında sorular

## Kısa cevaplar

${ready.map((f) => `- **${f.q}** ${f.a}`).join('\n')}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

import type { APIRoute } from 'astro';

// Yapay zekâ tarayıcı politikası: varsayılan olarak HEPSİNE İZİN (GEO için).
// [KARAR bekliyor — yönerge Bölüm 7] Seçici olmak istenirse ilgili satır "Disallow: /" yapılır.
const aiBots = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'CCBot',
];

export const GET: APIRoute = ({ site }) => {
  const preview = import.meta.env.PUBLIC_PREVIEW === 'true';
  const sitemap = new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/sitemap-index.xml`, site).toString();
  const body = preview
    ? `# Önizleme ortamı — indekslenmesin\nUser-agent: *\nDisallow: /\n`
    : [
        'User-agent: *',
        'Allow: /',
        '',
        '# Yapay zekâ arama ve cevap motorları',
        ...aiBots.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
        `Sitemap: ${sitemap}`,
        '',
      ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

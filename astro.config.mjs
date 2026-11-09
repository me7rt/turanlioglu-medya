// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL ve BASE_PATH ortam değişkenleri sayesinde aynı kod hem
// GitHub Pages önizlemesinde (alt klasör) hem Cloudflare Pages'te (kök) çalışır.
const site = process.env.SITE_URL || 'https://turanlioglumedya.com';
const base = process.env.BASE_PATH || '/';

// Markdown içindeki "/iletisim/" gibi kök linklere base path ekler.
function rehypeBaseLinks() {
  const prefix = base.replace(/\/$/, '');
  const walk = (node) => {
    if (node.type === 'element' && node.tagName === 'a') {
      const href = node.properties?.href;
      if (prefix && typeof href === 'string' && href.startsWith('/') && !href.startsWith('//')) {
        node.properties.href = prefix + href;
      }
    }
    (node.children || []).forEach(walk);
  };
  return (tree) => walk(tree);
}

export default defineConfig({
  markdown: { rehypePlugins: [rehypeBaseLinks] },
  site,
  base,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/yasal/') && !page.includes('/404') })],
});

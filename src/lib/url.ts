/** Site içi linkleri base path'e göre üretir: url('/blog/') */
export function url(path = '/'): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

/** Tam (mutlak) URL: canonical, schema ve sitemap için */
export function absUrl(path = '/'): string {
  return new URL(url(path), import.meta.env.SITE).toString();
}

/** Önizleme ortamında arama motorlarına "indeksleme" deriz */
export const isPreview = import.meta.env.PUBLIC_PREVIEW === 'true';

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    author: z.string().default('Mert Turanlıoğlu'),
    image: z.string(), // src/data/images.ts anahtarı
    category: z.string(),
    summary: z.array(z.string()).optional(), // "Kısaca" kutusu — GEO için önce cevap
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };

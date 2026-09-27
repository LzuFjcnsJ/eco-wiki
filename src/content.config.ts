import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * The wiki is driven entirely by Markdown files in `src/content/docs`.
 * Dropping a new `.md` file there is the whole "add a page" workflow —
 * routing, cards, search index, tags and prev/next navigation are derived.
 */
const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().max(60),
    summary: z.string().max(160),
    chapter: z.number().int().positive(),
    group: z.enum(['core', 'workflow', 'reference']).default('core'),
    icon: z.string().default('•'),
    tags: z.array(z.string()).default([]),
    status: z.enum(['stable', 'review', 'draft']).default('stable'),
    updated: z.coerce.date().optional(),
    maintainer: z.string().default('宣传部负责人'),
  }),
});

/**
 * The legacy archive: an open-ended chronicle rather than a closed memorial.
 * Every cohort adds entries while still in office, and keeps adding after
 * graduating — the collection is designed to grow for as long as the
 * department exists. Files starting with `_` are excluded so `_template.md`
 * can live next to real entries.
 */
const legacy = defineCollection({
  loader: glob({ base: './src/content/legacy', pattern: '**/[!_]*.{md,mdx}' }),
  schema: z.object({
    name: z.string().max(30),
    role: z.string().max(40),
    cohort: z.string().max(20),
    year: z.number().int().min(2000).max(2100),
    lesson: z.string().max(80),
    stage: z.enum(['in-office', 'alumni']).default('alumni'),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { docs, legacy };

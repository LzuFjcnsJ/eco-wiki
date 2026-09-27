import type { APIRoute } from 'astro';
import { getCollection, render } from 'astro:content';
import { withBase } from '../lib/url';

/**
 * Build-time search index.
 *
 * Three kinds of entries are indexed so the palette can answer the way a
 * handbook should — by landing on the exact section, not just the page:
 *   page     one per Markdown file in `docs`
 *   section  one per `##` heading (deep-links to `#slug`)
 *   legacy   one per entry in the legacy archive
 */
export const GET: APIRoute = async () => {
  const docs = (await getCollection('docs')).slice().sort((a, b) => a.data.chapter - b.data.chapter);
  const index: Record<string, unknown>[] = [];

  for (const doc of docs) {
    const badge = String(doc.data.chapter).padStart(2, '0');

    index.push({
      kind: 'page',
      order: doc.data.chapter * 1000,
      badge,
      title: doc.data.title,
      summary: doc.data.summary,
      tags: doc.data.tags,
      group: doc.data.group,
      url: withBase(`/wiki/${doc.id}/`),
    });

    const { headings } = await render(doc);

    headings
      .filter((heading) => heading.depth === 2)
      .forEach((heading, position) => {
        index.push({
          kind: 'section',
          order: doc.data.chapter * 1000 + 1 + position,
          badge,
          title: heading.text,
          summary: doc.data.title,
          tags: [],
          group: doc.data.group,
          url: withBase(`/wiki/${doc.id}/#${heading.slug}`),
        });
      });
  }

  const legacy = await getCollection('legacy');

  for (const entry of legacy) {
    index.push({
      kind: 'legacy',
      order: 900000 + (2100 - entry.data.year) * 10,
      badge: '遗产',
      title: entry.data.lesson,
      summary: `${entry.data.name} · ${entry.data.role} · ${entry.data.cohort}`,
      tags: [entry.data.cohort, entry.data.role],
      group: 'legacy',
      url: withBase(`/legacy/#${entry.id}`),
    });
  }

  index.sort((a, b) => (a.order as number) - (b.order as number));

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};

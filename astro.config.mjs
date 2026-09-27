// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkCallouts from './src/plugins/remark-callouts.mjs';
import rehypeWikiEnhancements from './src/plugins/rehype-wiki-enhancements.mjs';
import { site as siteMeta } from './src/site.config.ts';

// 部署位置只在构建时决定这两项，源码里的链接写法不用改：
//   BASE_PATH —— 部署在**子路径**时设置，例如 GitHub Pages 项目页是
//                https://<组织>.github.io/eco-wiki/，此时 BASE_PATH=/eco-wiki
//                部署在根路径（自定义域名 / Cloudflare Pages / Vercel）时留空
//   SITE_URL  —— 正式域名，site.config.ts 里填过就以它为准
const base = process.env.BASE_PATH || '/';
const siteUrl = process.env.SITE_URL || siteMeta.url || 'https://eco-wiki.example.com';

export default defineConfig({
  site: siteUrl,
  base,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  markdown: {
    // Astro's default Markdown processor, extended with the wiki pipeline:
    // `:::` containers become themed callouts, tables get scroll wrappers,
    // task-list checkboxes become interactive.
    processor: unified({
      remarkPlugins: [remarkDirective, remarkCallouts],
      // base 传进 rehype 插件，让 Markdown 正文里写的 /wiki/xxx/ 这类
      // 站内链接也能自动带上部署前缀（部署在子路径时才需要）
      rehypePlugins: [[rehypeWikiEnhancements, { base }]],
    }),
    shikiConfig: {
      theme: 'vitesse-dark',
      wrap: true,
    },
  },
  devToolbar: {
    enabled: false,
  },
});

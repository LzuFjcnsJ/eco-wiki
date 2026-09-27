/**
 * 内部链接工具。
 *
 * 站点部署在**子路径**时（例如 GitHub Pages 的项目页
 * https://<组织>.github.io/eco-wiki/），构建期 BASE_URL 会被设成 '/eco-wiki/'。
 * 如果页面里写死 href="/wiki/"，浏览器会去请求站点根目录，链接全部 404。
 *
 * 所以：所有站内链接统一写成 href={withBase('/wiki/')}，这个函数负责补前缀。
 * 部署在根路径时（自定义域名 / Cloudflare Pages / Vercel / Netlify）
 * BASE_URL 是 '/'，函数等价于原样返回，什么也不影响。
 *
 * 注意：只有 .astro 模板和 .ts 端点会用到它。
 * 写 Markdown 的部员不需要关心这个文件。
 */

/** 给站内绝对路径补上部署前缀 */
export function withBase(path: string): string {
  if (!path.startsWith('/')) return path;
  const base = import.meta.env.BASE_URL || '/';
  const trimmed = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${trimmed}${path}`;
}

/**
 * 去掉 BASE_URL 前缀，把浏览器里的真实路径还原成源码里写的那个路径。
 * 导航高亮要用它：源码里写 '/wiki/'，但部署在子路径时浏览器地址栏是
 * '/eco-wiki/wiki/'，两者直接比较永远不会相等。
 */
export function currentPath(pathname: string): string {
  const base = import.meta.env.BASE_URL || '/';
  let path = pathname;
  if (base !== '/' && path.startsWith(base)) {
    path = path.slice(base.length - 1);
  }
  return path.replace(/\/+$/, '') || '/';
}

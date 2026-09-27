/**
 * 站点级配置 —— 全站唯一一个「认识的人」才需要改的文件。
 *
 * 换仓库、换域名、加共同维护者，都只改这里；
 * 页面上的「在 GitHub 上编辑本页」、页脚署名、canonical 链接会自动跟着变。
 *
 * ── 上线时怎么做（只改这一处）─────────────────────────────
 * 1. 把 eco-wiki/ 推到一个 GitHub 仓库
 * 2. 把下面的 org 填成你的 GitHub 用户名，repo 填成仓库名
 * 3. 提交。除本文件外的任何文件都不用动。
 *
 * 关于「放个人账号还是组织账号」：
 * 先用自己的账号把它跑起来完全没问题 —— GitHub 支持把仓库**整体转移**到组织账号，
 * 转移后旧地址会自动重定向，已经发出去的链接不会失效，历史提交也全部保留。
 * 但请记住毕业前一定要转：个人账号会随人离开，组织账号可以一直往里加人。
 *
 * 只要 org / repo 是空的，全站所有「编辑此页」入口会自动隐藏，
 * 不会出现点进去 404 的死链 —— 也就是现在这个状态。
 */

export const site = {
  /**
   * 正式域名，带 https、结尾不加斜杠。
   *
   * 用 GitHub Pages 时**留空即可**：自动构建会按仓库信息推导出
   * https://<用户名>.github.io/<仓库名>/ 并通过环境变量传进来。
   * 只有绑了自定义域名时，才需要去仓库的 Variables 里加 SITE_URL（或直接填在这里）。
   */
  url: '',

  /** 站点中文名，出现在页脚与浏览器标签页后缀 */
  name: '宣传部教程站',

  /** GitHub 组织或账号名，例如 'eco-college'。留空 = 隐藏所有编辑入口 */
  org: 'LzuFjcnsJ',

  /** 仓库名。在 GitHub 建仓库时如果改了名字，这里也要跟着改 */
  repo: 'eco-wiki',

  /** 默认分支名，通常是 'main' */
  branch: 'main',

  /** 内容目录在仓库里的相对位置，一般不用改 */
  docsDir: 'src/content/docs',
  legacyDir: 'src/content/legacy',

  /** 页脚署名的维护主体 */
  steward: '生态学院团委宣传部',
} as const;

/** 仓库信息是否已配置。未配置时所有编辑入口隐藏，避免死链。 */
export const repoReady: boolean = Boolean(site.org && site.repo);

/** 仓库主页，例如 https://github.com/eco-college/eco-wiki */
export const repoUrl: string = repoReady ? `https://github.com/${site.org}/${site.repo}` : '';

/**
 * 在 GitHub 网页上直接编辑一个已存在的文件。
 * filePath 是仓库内的相对路径，如 'src/content/docs/writing.md'。
 */
export function editFileUrl(filePath: string): string {
  if (!repoReady) return '';
  return `${repoUrl}/edit/${site.branch}/${filePath}`;
}

/**
 * 在 GitHub 网页上于某个目录下新建文件（可预填文件名）。
 * 这是「不用装任何软件就加一条档案」的入口。
 */
export function newFileUrl(dir: string, filename?: string): string {
  if (!repoReady) return '';
  const query = filename ? `?filename=${encodeURIComponent(filename)}` : '';
  return `${repoUrl}/new/${site.branch}/${dir}${query}`;
}

/** 某个文件的修订历史（谁在哪天改了什么，全在这里） */
export function historyUrl(filePath: string): string {
  if (!repoReady) return '';
  return `${repoUrl}/commits/${site.branch}/${filePath}`;
}

/** 贡献指南。仓库里没有 CONTRIBUTING.md 时会显示 404，但不影响阅读正文 */
export const contributingUrl: string = repoReady
  ? `${repoUrl}/blob/${site.branch}/CONTRIBUTING.md`
  : '';

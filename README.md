# Eco Wiki · 宣传部教程站

> 一份来自前任的数字遗产，现在是一个**可协作维护的 Wiki**。

把原来散在 7 个 Markdown 文件里的教程，变成一个内容驱动、可搜索、可增量维护的静态站点。

## 设计取向：速查手册优先

站点的第一身份是**工具**，不是作品集。用户是站在活动现场、需要 30 秒内查到相机 ISO 的部员，
所以：

- 首页顶部就是一个**能直接输入的搜索框**，不是跳转按钮
- 搜索索引**下沉到小节级**（9 篇 + 53 个 `##` 小节），搜「参数」直接落到 `参数速查表`
- 首页列出**高频速查**深链：相机参数、发表前检查清单、排版规则卡、催稿话术、照片命名规范
- 章节目录用**紧凑列表**而非大卡片，一屏能扫完
- 同时保留对外展示所需的可读定位语，外部访客（新生、其他学院）也看得懂这是什么

视觉上融合了两个参考站点，但都做了降权处理：

| 参考站 | 借用了什么 | 本项目的处理 |
|---|---|---|
| **nk.studio** (`inspiring.nk.studio`) | 深青绿渐变、星点粒子场、衬线大标题配青色下划线、等宽标签、自定义光标 | 粒子密度降低（96），Hero 从全屏沉浸改为紧凑 |
| **Alethia** (`alethia.earth`) | 近黑天顶、悬浮暗色矿物体（鼠尾草绿反弹光 + 呼吸辉光） | 只保留 1 个作为品牌符号，透明度 0.4 |

> 两个参考站分别在布宜诺斯艾利斯，且 `inspiring.nk.studio` 本身是 nk.studio 的 20 周年
> **「活档案」** —— 33 位同行各留一句话。这个结构范式被用在了 `/legacy/` 上。

## 两种内容

| 目录 | 是什么 | 怎么长 |
|---|---|---|
| `src/content/docs/` | 教程正文（规范、参数、话术） | 新增 `.md` = 新增一章 |
| `src/content/legacy/` | **数字遗产档案**：每一届留一句话 | 新增 `.md` = 新增一条，按年份往前排 |

档案是**开放的编年**，不是纪念册 —— 每一届在任时写，毕业后再补，只要部门存续就会一直增长。

## 技术栈

- **Astro 7**（静态输出，零客户端框架运行时）
- **Content Collections** —— 路由、目录、搜索索引、上下篇全部由内容派生
- **原生 CSS**（Design Tokens 分层）+ **原生 JS**（约 700 行，无运行时依赖）

## 目录结构

```
eco-wiki/
├── site.config.ts              # ★ 站点名 / 域名 / 仓库地址 —— 交接时只改这个
├── CONTRIBUTING.md             # ★ 完整贡献指南：下一届怎么改这个站
├── astro.config.mjs            # Markdown 处理器 + remark/rehype 插件 + 部署路径
├── .github/workflows/deploy.yml# ★ 推送 main 自动构建并发布
├── src/
│   ├── content.config.ts       # docs / legacy 两个集合的 Zod 校验
│   ├── content/docs/*.md       # ★ 教程正文
│   ├── content/legacy/*.md     # ★ 数字遗产档案（_template.md 为模板）
│   ├── plugins/
│   │   ├── remark-callouts.mjs          # :::danger 等 → 主题化 aside
│   │   └── rehype-wiki-enhancements.mjs # 表格滚动 / 可选清单 / 外链 / 链接补前缀
│   ├── lib/url.ts              # withBase()：子路径部署时的链接前缀
│   ├── layouts/BaseLayout.astro
│   ├── components/             # Header / Cursor / Loader / 粒子 / 岩石 / 卡片 / 档案条目 / EditLink
│   ├── scripts/                # ui / cursor / search / effects / toc
│   ├── styles/                 # tokens / base / components / prose
│   └── pages/
│       ├── index.astro              # 首页：速查优先
│       ├── wiki/index.astro         # 章节目录（分组 + 筛选 + 标签云 + 新建一章）
│       ├── wiki/[...slug].astro     # 章节详情（正文 + 右侧目录 + 上下篇 + 编辑入口）
│       ├── legacy/index.astro       # 数字遗产编年（含新建一条 / 打开模板）
│       └── search-index.json.ts     # 构建时生成（页 + 节 + 档案）
├── public/favicon.svg
└── preview/                    # 视觉验收截图
```

## 每一页都能一键去改

文章底部、侧栏「源文件」、每条档案下方、以及目录/档案页的「新建…」按钮，
都指向 GitHub 的对应文件或新建页：

```
文章底部  →  https://github.com/<组织>/<仓库>/edit/main/src/content/docs/writing.md
侧栏源文件 →  同上（点文件名即可）
档案条目  →  …/edit/main/src/content/legacy/2026-in-office.md
新建一章  →  …/new/main/src/content/docs?filename=new-chapter.md
新建一条  →  …/new/main/src/content/legacy?filename=2027-your-name.md
```

这些地址全部由 `src/site.config.ts` 派生。**`org` / `repo` 留空时整块入口自动隐藏**，
不会留下点进去 404 的死链 —— 所以现在这个状态下站点是完全干净的，
填上仓库信息后编辑入口才会出现。

## 怎么上线

站点是纯静态输出（`dist/` 里就是一堆 html/css/js），任何静态托管都能放。
按「零维护成本」排序：

| 方案 | 费用 | 自动 HTTPS | 自定义域名 | 适合 |
|---|---|---|---|---|
| **Cloudflare Pages** | 免费 | ✅ | ✅ 最省事 | 推荐首选，连通性在国内也较好 |
| **GitHub Pages** | 免费 | ✅ | ✅ | 代码已经在 GitHub 时最顺，仓库里已配好工作流 |
| **Vercel / Netlify** | 免费额度充足 | ✅ | ✅ | 想顺手看到每个 PR 的预览部署 |
| **学院/学校官方挂靠** | 免费 | ✅ | ✅ 学院子域 | 想被官方认领时；代价是走行政流程、以后换人要走审批 |
| **自己买服务器 / 云主机** | 几十～几百元/年 | 需自己配 | 需自己配 | **不推荐**：要自己管证书、续费、备份，交接时最容易断 |

> 结论：**先用 Cloudflare Pages 或 GitHub Pages，不要自己买服务器。**
> 这个站的体量是一堆静态文件，自己维护一台机器只会把「交接」变成「交接运维」。

### 最快路径：挂到自己的 GitHub 账号（约 5 分钟）

**① 建一个空仓库** —— 打开 <https://github.com/new>：

- Repository name 填 `eco-wiki`
- 选 **Public**（GitHub Pages 免费额度要求公开仓库；一定要私有的话改用 Cloudflare Pages）
- **不要**勾 Add a README / .gitignore / license —— 本地已经有了，勾了会产生冲突

**② 把本地代码推上去**（把 `<用户名>` 换成你的 GitHub 用户名）：

```bash
cd eco-wiki
git config user.name "你的名字"
git config user.email "你的邮箱"
git commit -m "初始化：从 Markdown 教程站改造为可协作 Wiki"
git remote add origin https://github.com/<用户名>/eco-wiki.git
git push -u origin main
```

第一次 push 会弹出浏览器让你登录授权，点一次即可，之后不再问。

**没有装 git / 不想用命令行？** 装 [GitHub Desktop](https://desktop.github.com/)，
选 `File → Add local repository` 指向 `eco-wiki` 文件夹，然后点 **Publish repository**，
效果和上面完全一样。

**③ 打开 Pages** —— 仓库 Settings → Pages → Build and deployment →
Source 选 **GitHub Actions**。路径不用填，会自动推导。

**④ 等两分钟** —— 去仓库的 **Actions** 标签页能看到构建过程。
跑完访问 `https://<用户名>.github.io/eco-wiki/`，就是线上站点。

**⑤ 让编辑入口生效** —— 打开 `src/site.config.ts`，把 `org` 填成你的用户名、
`repo` 填成 `eco-wiki`，提交。再等两分钟，每篇文章底部的「在 GitHub 上编辑本页」就出现了。

> 第 ⑤ 步可以直接在 GitHub 网页上做：打开这个文件 → 点右上角铅笔图标 → 改 → Commit changes。
> 这正是以后别人改内容的方式，可以顺手试一遍。

**关于「个人账号还是组织账号」**：先用自己的账号跑起来没问题。
GitHub 支持把仓库**整体转移**到组织账号（Settings → General → Transfer ownership），
转移后旧地址自动重定向，已发出的链接不失效，提交历史全部保留。
但**毕业前一定要转** —— 个人账号会随人离开，组织账号可以一直往里加人。

### GitHub Pages（仓库里已经配好了）

1. 把 `eco-wiki/` 推到一个 GitHub 仓库
2. Settings → Pages → Source 选 **GitHub Actions**
3. 之后每次推 `main` 都会自动构建并发布，约一两分钟

`BASE_PATH` 会自动按仓库名推断（项目页形如 `https://<组织>.github.io/<仓库名>/`）。
如果要用**自定义域名**或**组织主页仓库**（地址在根路径 `/`），
去 Settings → Variables 加一个变量：

| 变量 | 什么时候用 | 值 |
|---|---|---|
| `BASE_PATH` | 站点部署在根路径时 | `/` |
| `SITE_URL` | 有正式域名时 | `https://eco.example.edu.cn` |

**部署路径这件事已经处理好了**：源码里所有站内链接、Markdown 正文里写的
`/wiki/xxx/`、搜索索引里的地址，都会在构建时自动带上前缀，
部署到子路径不会 404。迁移域名也不用改内容。

### Cloudflare Pages

连上同一个 GitHub 仓库，构建设置填：

```
Build command:   npm run build
Build output:    dist
Node version:    22
```

不需要 `BASE_PATH`（它部署在根路径），在 Pages 里绑自定义域名即可。

## 怎么交给下一届

关键不是「把代码给出去」，而是**让仓库的归属不跟着某个人走**：

1. **仓库放进组织账号**（学院 / 社团 / 系团委），不要放在个人账号下。
   个人账号毕业就带走了，组织账号可以一直往里面加人。
2. 现任负责人加进组织并给 `Write` 权限 —— 之后他就能在浏览器里直接改内容。
3. 部署服务（Cloudflare / GitHub Pages）的账号绑**组织邮箱**，不要绑个人 QQ 邮箱。
   GitHub Pages 不需要额外账号；Cloudflare 记得把组织里的人加成成员。
4. 每年换届照着 `CONTRIBUTING.md` 末尾的**交接清单**打勾，五分钟就能交完。
5. 让当年负责人在 `/legacy/` 里写一条 —— 在任时就写，不要等毕业再补。

新人不需要装任何东西：打开页面 → 点「在 GitHub 上编辑本页」→ 改 → 提交。
不是成员的话 GitHub 会自动引导 Fork + Pull Request，管理员点一下合并就行。


## 命令

```bash
npm install      # 首次安装（Node 22+）
npm run dev      # 开发预览
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

## 键盘操作

| 键 | 作用 |
|---|---|
| 直接打字 | 首页自动聚焦搜索框 |
| `/` 或 `Ctrl/⌘ + K` | 任意页面唤起搜索面板 |
| `↑` `↓` | 选择结果 |
| `Enter` | 打开当前结果 |
| `Esc` | 关闭 |

## 排版扩展：`:::` 容器

```markdown
:::danger[红线规则]
红色危险块，用于不可逾越的规则。
:::
```

可用类型：`danger`、`warn`、`tip`、`info`、`good`、`bad`。方括号内是自定义标题。

## 无障碍与性能

- 全部交互可键盘访问；悬停动效均有 `:focus-visible` 等价反馈
- 完整响应 `prefers-reduced-motion`：入场动画落到终态，粒子只渲染一帧
- 粒子循环在 Hero 离屏时自动暂停
- 静态输出，首屏无框架运行时

## 已知事项

- `src/site.config.ts` 里的 `org` / `repo` **当前是空的**，所以全站「编辑此页」入口
  处于隐藏状态。填上真实仓库信息后即自动出现，其余文件不用动。
- Astro 7 起默认 Markdown 处理器已更换，使用 remark/rehype 插件必须同时安装
  `@astrojs/markdown-remark` 并通过 `markdown.processor: unified({...})` 传入。
- 部署在子路径（GitHub Pages 项目页）时由 `BASE_PATH` 控制，链接前缀在构建期自动补齐。
  验证方式：`BASE_PATH=/仓库名 npm run build`，然后 grep 一下 `dist/` 里有没有
  漏掉前缀的 `href="/wiki/`。
- `/legacy/` 现有 2 条种子条目均为 `placeholder: true`，需要替换成真实内容。
- 本机 bash 环境异常（`dirname`/`wc`/`head`/`rm` 等缺失），命令行请用 PowerShell，
  或显式调用 `C:\Users\admin\.workbuddy\binaries\node\versions\22.22.2-3\node.exe`。
- 无头截图（Edge `--headless=new --screenshot`）有两个坑：页面里的 Google Fonts
  在离线环境会挂住 load 事件，需要 `--host-resolver-rules="MAP * ~NOTFOUND, EXCLUDE 127.0.0.1"`；
  另外静态服务器**不能和截图脚本跑在同一个 Node 进程里**，否则 Edge 会一直不返回。

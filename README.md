# Eco Wiki · 宣传部教程站

**线上站点 → <https://lzufjcnsj.github.io/eco-wiki/>**

一份被重新整理过的部门教程手册。原本散落在七个 Markdown 文件里，现在是一个能搜、能改、能一直传下去的网站。

它由生态学院团委宣传部维护，前身是往届成员留下的一批文档。整理的时候我们做了一个刻意的选择：**让它变成「谁都能改」的形式** —— 不用会写代码，不用装任何软件，打开网页点一下就能改。

---

## 为什么是一个网站，而不是一份 Word

因为它的使用者是**站在活动现场、需要在 30 秒内查到相机 ISO 的部员**。

所以站点的第一身份是工具，不是作品集。具体到设计上：

- 首页顶部就是**能直接打字的搜索框**，不是「点这里去搜索」
- 搜索索引下沉到**小节级**（9 篇正文 + 55 个二级标题），搜「参数」直接落到「参数速查表」那一段
- 首页列出**高频速查**入口：相机参数、发表前检查清单、排版规则卡、催稿话术、照片命名规范
- 章节目录用紧凑列表，一屏能扫完

同时它也能被外部访客读懂 —— 新生、其他学院、或者只是想看看学生部门怎么做文档的人。

## 站里有什么

| 页面 | 内容 |
|---|---|
| `/` | 首页：搜索框 + 高频速查 + 章节目录 |
| `/wiki/` | 章节目录，按分组和标签筛选 |
| `/wiki/<章节>/` | 正文，共 9 章 —— 撰写文稿 / 相机拍摄 / 排版设计 / 发表与发布规范 / 设计工具 / 协作流程 / 补充资料 / 新人第一周 / 如何维护这个 Wiki |
| `/legacy/` | **数字遗产档案**：每一届留一条记录 |
| `/search-index.json` | 构建时生成的搜索索引（页面 + 小节 + 档案） |

`/legacy/` 不是纪念册，是一份**往前长的编年**。每一届在任时就写一条，毕业后再补；只要部门还在，它就会一直增厚。

## 本地跑起来

需要 Node 22 以上。

```bash
npm install
npm run dev       # 开发预览 → http://localhost:4321
npm run build     # 构建到 dist/
npm run preview   # 预览构建产物
```

加内容不需要动页面代码 —— **新增一个 `.md` 文件就是新增一章**，目录、搜索索引、上下篇导航全部自动派生。

## 想改内容？

**你不需要会写代码，也不需要装任何软件。**

打开任意一页，滚到文章底部，点 **「在 GitHub 上编辑本页」**，就能在浏览器里直接改这篇 Markdown 原文，改完点 `Commit changes`，一两分钟后线上自动更新。

加新内容也不用找文件：章节目录页右上角有「新建一章」，数字遗产页有「新建一条」。

不是仓库成员也没关系，GitHub 会自动引导你 Fork + 提交 Pull Request。

完整说明（内容放哪里、front-matter 怎么写、强调块语法、权限模型）见 **[CONTRIBUTING.md](CONTRIBUTING.md)**。

## 技术栈

- **[Astro 7](https://astro.build/)** —— 静态输出，首屏零框架运行时
- **Content Collections** —— 路由、目录、标签云、搜索索引、上下篇全部由内容派生
- **原生 CSS**（Design Tokens 分层）+ **原生 JS**（约 700 行，无运行时依赖）
- 两个自研 Markdown 插件：`remark-callouts`（把 `:::danger` 变成主题化提示块）、`rehype-wiki-enhancements`（表格滚动、可勾选清单、外链处理、部署路径补前缀）

## 项目结构

```
eco-wiki/
├── src/site.config.ts           # 站点名 / 域名 / 仓库地址 —— 换仓库换域名只改这里
├── src/content.config.ts        # docs / legacy 两个集合的 Zod 校验
├── src/content/docs/*.md        # 教程正文
├── src/content/legacy/*.md      # 数字遗产档案（_template.md 为模板）
├── src/plugins/                 # remark-callouts / rehype-wiki-enhancements
├── src/lib/url.ts               # withBase()：子路径部署时的链接前缀
├── src/components/              # Header / 光标 / 加载条 / 粒子 / 卡片 / 档案条目 / EditLink
├── src/scripts/                 # ui / cursor / search / effects / toc
├── src/styles/                  # tokens / base / components / prose
├── src/pages/                   # index / wiki / legacy / search-index.json
├── astro.config.mjs             # Markdown 处理器 + 插件 + 部署路径
├── .github/workflows/deploy.yml # 推送 main 自动构建并发布
├── CONTRIBUTING.md              # 面向内容作者的贡献指南
└── HANDOVER.md                  # 面向站点负责人的运维与交接手册
```

## 键盘操作

| 键 | 作用 |
|---|---|
| 直接打字 | 首页自动聚焦搜索框 |
| `/` 或 `Ctrl` / `⌘` + `K` | 任意页面唤起搜索面板 |
| `↑` `↓` | 选择结果 |
| `Enter` | 打开当前结果 |
| `Esc` | 关闭 |

## 排版扩展：`:::` 容器

正文里可以直接写主题化提示块，源文件保持纯 Markdown：

```markdown
:::danger[红线规则]
不可逾越的规则用这个，渲染成红色警示块。
:::
```

可用类型：`danger`、`warn`、`tip`、`info`、`good`、`bad`。方括号里是自定义标题。

## 无障碍与性能

- 全部交互可键盘访问；所有悬停效果都有 `:focus-visible` 等价反馈
- 完整响应 `prefers-reduced-motion`：入场动画直接落到终态，粒子只渲染一帧
- 粒子循环在首屏离屏时自动暂停
- 静态输出，首屏没有框架运行时

## 视觉参考

站点的视觉融合了两个参考站点，两者都做了明显降权：

| 参考站 | 借用了什么 | 这里的处理 |
|---|---|---|
| **[nk.studio](https://inspiring.nk.studio/es)**（布宜诺斯艾利斯，20 周年企划） | 深青绿渐变、星点粒子场、衬线大标题配青色下划线、自定义光标 | 粒子密度降到 96，Hero 从全屏沉浸改为紧凑 |
| **[Alethia](https://alethia.earth)**（环境情报公司） | 近黑天顶、悬浮暗色矿物体（鼠尾草绿反弹光 + 呼吸辉光） | 只保留 1 个作为品牌符号，透明度 0.4 |

> 顺带一提：`inspiring.nk.studio` 本身是 nk.studio 邀请 33 位同行各留一句话的**活档案** —— `/legacy/` 的结构范式正是从这里来的。

## 致谢与版权

站点的内容、组织方式和这段「让文档能一直传下去」的尝试，属于**生态学院团委宣传部**及其历届成员。

代码部分目前未指定开源许可证。如果你希望复用这套做法（尤其是给其他学生组织用），欢迎开个 Issue 聊聊 —— 我们大概会很乐意。

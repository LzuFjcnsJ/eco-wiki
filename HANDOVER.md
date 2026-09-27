# 站点负责人手册

> **给谁看**：现在管这个站的人，以及下一届接手的人。
> 想改内容 → [CONTRIBUTING.md](CONTRIBUTING.md)　·　只想了解这个站 → [README.md](README.md)
>
> 这份文件管的是「站点怎么活着」：怎么部署、怎么排障、怎么交出去。

---

## 一、当前状态

| 项目 | 值 |
|---|---|
| 线上地址 | <https://lzufjcnsj.github.io/eco-wiki/> |
| 仓库 | `LzuFjcnsJ/eco-wiki`（public，**个人账号**） |
| 分支 | `main`，最新提交 `8acf877` |
| 托管方式 | GitHub Pages + GitHub Actions（仓库里已配好工作流） |
| 站点配置 | `src/site.config.ts`：`org: 'LzuFjcnsJ'`、`repo: 'eco-wiki'` |

### 待办

- [ ] **把 Pages 的 Source 改成「GitHub Actions」** —— 这是站点现在打不开的原因，见第二节
- [ ] 改完重跑一次失败的工作流：Actions → 左侧「构建并发布站点」→ 右上 **Re-run all jobs**
- [ ] `/legacy/` 现有 2 条种子条目都是 `placeholder: true`，需要替换成真实记录
- [ ] 决定要不要给仓库加一份 `LICENSE`（现在没有，见 README 末尾）
- [ ] **毕业前把仓库 Transfer 到组织账号** —— 见第五节

---

## 二、部署：GitHub Pages

### 它是怎么工作的

```
你 push main
  → .github/workflows/deploy.yml 被触发
  → 构建 job：npm ci → npm run build → 把 dist/ 打包上传
  → 发布 job：把上传的产物发布到 GitHub Pages
  → 一两分钟后线上更新
```

**你不需要手动构建、也不需要往仓库里提交 `dist/`。** `dist/` 在 `.gitignore` 里，构建在 GitHub 的机器上做。

### 必须手动做的那一步（只做一次）

打开 <https://github.com/LzuFjcnsJ/eco-wiki/settings/pages>：

> **Build and deployment → Source → 选 `GitHub Actions`**

**这一步不做，站点不会出现，而且不会报错。** 这是 GitHub Pages 最常见的坑，原因见下面的对照表。

### 症状对照表

| 你看到的 | 真正的原因 | 怎么办 |
|---|---|---|
| 打开网址是**一大段 README 文字**，没有导航、没有样式 | Pages 的 Source 是 `Deploy from a branch`。GitHub 用自带的 Jekyll 把仓库根目录的 `README.md` 渲染成了首页 | 把 Source 改成 `GitHub Actions` |
| Actions 里「**构建**」是绿的、「**发布**」是红的 | 同上。`actions/deploy-pages` 要求 Pages 的 build type 是 `workflow`；分支模式下它会拿到 404 而失败 | 同上，改完重跑工作流 |
| 工作流全绿，但网址 404 或转圈很久 | Pages 刚开启，DNS 还没生效；或者 Source 没保存成功 | 等几分钟再刷新；确认 Settings → Pages 顶部显示的是 `https://...` 而不是提示还在配置 |
| 页面能打开但 **CSS 全丢、链接点哪都 404** | `BASE_PATH` 不对 —— 站点的静态资源在 `/eco-wiki/` 前缀下 | 见下一节 |

### 域名和路径：默认什么都不用配

`deploy.yml` 里两个环境变量会按仓库信息**自动推导**：

```
SITE_URL  = https://<仓库所有者>.github.io/<仓库名>
BASE_PATH = /<仓库名>
```

所以默认情况（个人/组织的项目页）**一个变量都不用设**。只有两种例外：

| 情况 | 地址长什么样 | 要设什么 |
|---|---|---|
| 仓库名就是 `<用户名>.github.io`（组织主页仓库） | `https://<用户名>.github.io/` | `BASE_PATH` = `/` |
| 绑了自定义域名 | `https://eco.example.edu.cn/` | `SITE_URL` = 域名，`BASE_PATH` = `/` |

设置位置：仓库 **Settings → Secrets and variables → Actions → Variables → New repository variable**。

### 换了仓库名或换了账号

站点代码里所有链接都由 `src/site.config.ts` 派生，页面上的「在 GitHub 上编辑本页」也来自它。所以：

1. 改 `src/site.config.ts` 的 `org` / `repo`
2. 提交
3. 等一次自动构建

除这一个文件外，其他文件都不用动。**改域名同理**（但有自定义域名时记得同时配上面那两个 Variable）。

---

## 三、站点配置中枢：`src/site.config.ts`

这是全站唯一一个「认识的人」才需要改的文件。

| 字段 | 作用 | 备注 |
|---|---|---|
| `url` | 正式域名 | 用 GitHub Pages 时留空即可，会自动推导 |
| `name` | 站点中文名 | 出现在页脚和浏览器标签页 |
| `org` | GitHub 组织/账号名 | **留空 = 隐藏全站所有编辑入口** |
| `repo` | 仓库名 | |
| `branch` | 默认分支 | 通常是 `main` |
| `docsDir` / `legacyDir` | 内容目录位置 | 一般不用改 |
| `steward` | 页脚署名的维护主体 | 换届时改这里 |

**`org` 或 `repo` 为空时，全站「编辑此页」入口会整块不渲染**，不留点进去 404 的死链。这是刻意设计的：站点可以在还没确定仓库的状态下先跑起来。

---

## 四、内容约定（摘要）

完整规则在 **[CONTRIBUTING.md](CONTRIBUTING.md)**，这里只列最容易忘的几条：

- **文件名就是网址**（`writing.md` → `/wiki/writing/`）。定了之后尽量别改，改了等于换网址。
- **front-matter 是唯一的结构约束**。必填：`title` / `summary` / `chapter` / `group`。
  `group` 只能是 `core`、`workflow`、`reference` 三选一，写错会直接构建失败。
- **加内容 = 加文件**。目录卡片、分组、标签云、搜索索引、右侧本页目录、上下篇导航全部自动派生，**不要手改页面代码**。
- **`legacy` 不是纪念册，是往前长的编年**。在任时就写，不要等毕业再补。
- **红线规则只增不减**：某条不再适用时改成 `:::warn` 并注明原因，不要直接删。
- 改完本地跑一次 `npm run build` —— front-matter 写错会在这里直接指出行号。

---

## 五、交接：怎么把它交给下一届

**核心不是「把代码给出去」，而是让仓库的归属不跟着某个人走。**

### 为什么现在在个人账号下

先用个人账号把它跑起来是**可行的临时方案**：GitHub 支持把仓库**整体转移**到组织账号
（Settings → General → 最下面 Danger Zone → **Transfer ownership**），
转移后**旧地址会自动重定向、已发出的链接不失效、提交历史全部保留**。

但**毕业前一定要转**。个人账号会随人离开，组织账号可以一直往里加人。

### 换届清单

内容侧的清单在 [CONTRIBUTING.md](CONTRIBUTING.md#每年交接清单)。运维侧补充：

- [ ] **Transfer ownership** 到学院/社团的 GitHub 组织账号
- [ ] 确认 **Settings → Pages** 的 Source 仍然是 `GitHub Actions`
- [ ] 确认 **Actions → Variables** 里的 `SITE_URL` / `BASE_PATH`（如果之前设过）依然正确
- [ ] 把新一届负责人加进组织并给 `Write`，确认他能用「在 GitHub 上编辑本页」成功提交一次
- [ ] 确认部署相关的账号绑的是**组织邮箱**，不是某个人的 QQ 邮箱
- [ ] 当面说清楚：**任何一届都可以回来继续改**，这不是某一届的私有产物

### 权限怎么给

- **现任负责人 / 部员** → 给 `Write`，可以直接推 `main`（小团队够用）
- **担心误操作** → 给 `Read`，让他们走 Fork + Pull Request
- **往届学长学姐 / 校外的人** → Fork + Pull Request，管理员合并
- 仅当**同时有 2 人以上在频繁改动**时，才建议在 Settings → Branches 给 `main`
  打开「Require a pull request before merging」；人少的时候反而拖慢节奏

---

## 六、已知技术事项

### Astro 7 换了默认 Markdown 处理器

`markdown.remarkPlugins` / `markdown.rehypePlugins` 已弃用，只写这两个字段会**直接构建失败**。
必须安装 `@astrojs/markdown-remark` 并用新写法：

```js
import { unified } from '@astrojs/markdown-remark';

export default defineConfig({
  markdown: {
    processor: unified({ remarkPlugins: [...], rehypePlugins: [...] }),
  },
});
```

### 子路径部署已经处理好，但要会验证

GitHub Pages 项目页的地址形如 `https://<用户名>.github.io/<仓库名>/`，站点活在**子路径**下。
写死的 `href="/wiki/"` 会去请求站点根目录 → 全站 404。

仓库里三层都处理过了（配置读 `BASE_PATH`、模板走 `withBase()`、**Markdown 正文里的站内链接由 rehype 插件在构建期补前缀**），
所以**写内容的人完全不需要知道站点部署在哪里**。

出问题时这样验证：

```bash
BASE_PATH=/eco-wiki npm run build
# 然后检查 dist/ 里还有没有漏掉前缀的 href="/xxx
```

注意：这类问题**不会让构建失败**，只看构建绿不绿是发现不了的。

### 其他

- `/legacy/` 的模板文件 `_template.md` 以 `_` 开头，被 glob 的 `**/[!_]*.md` 排除，不会被当成一条真实记录收录。
- 站点的 `preview/` 目录是视觉验收截图，不参与构建。

---

## 七、从零重建这个站

如果仓库彻底丢了，按这个顺序能恢复：

1. 新建空仓库（**不要**勾 Add a README / .gitignore / license，会冲突）
2. 把本地 `eco-wiki/` 推上去
3. Settings → Pages → Source 选 `GitHub Actions`
4. 等一两分钟，访问 `https://<用户名>.github.io/<仓库名>/`
5. 确认 `src/site.config.ts` 里的 `org` / `repo` 和实际仓库一致（不一致的话编辑入口会指向错误的地方）

**没有装 git、也不想用命令行**：装 [GitHub Desktop](https://desktop.github.com/)，
`File → Add local repository` 指向 `eco-wiki` 文件夹，点 **Publish repository**，效果完全一样。

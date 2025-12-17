# Blog 项目指南

这是一个基于 VitePress 的个人博客项目，使用自定义主题 @blog/theme。

## 项目结构

```
blog/
├── docs/                    # 博客文章目录
│   ├── 专题系列/            # 专题文章
│   │   ├── AI 打铁铺/       # AI 深度技术文章
│   │   ├── Web 前端/        # 前端相关文章
│   │   └── 其他/            # 其他文章
│   └── .vitepress/          # VitePress 配置
│       ├── config.mts       # 主配置文件
│       └── blog-theme.ts    # 主题配置
├── src/                     # 主题源码
│   ├── components/          # Vue 组件
│   ├── composables/         # 组合式函数
│   └── styles/              # 样式文件
└── .claude/
    └── skills/              # Claude Code skills
        └── blog-migrate.md  # 文章迁移 skill
```

## 通用规则

- 默认情况下，所有回复都必须是中文，称呼用户为"大帅："
- 遵循项目代码风格与 TypeScript/ESLint 规范
- 代码实现符合 KISS 原则，不过度设计
- 代码变更范围最小化
- 如有疑问，先询问再修改

## 博客文章规范

### Frontmatter 模板

```yaml
---
group:
  title: [专题名称]
tags:
  - [标签1]
  - [标签2]
sidebar: false
sticky: [置顶优先级，1最高]
date: [YYYY-MM-DD HH:mm:ss]
recommend: [推荐级别]
title: [文章标题]
description: [文章描述，100字以内]
cover: ""
---
```

### 文章目录选择

- AI、LLM、Agent、AI Coding → `专题系列/AI 打铁铺/`
- 前端基础学习 → `专题系列/Web 前端/重学前端/`
- 前端问题解决 → `专题系列/Web 前端/疑难杂症/`
- JS 速查 → `专题系列/Web 前端/JS 速查表/`

### AI 打铁铺文章规范

AI 打铁铺是博客的核心专题，文章默认展示在首页。新增文章时：

1. **必须添加 `sticky: 1`** - AI 打铁铺的最新文章默认置顶首页
2. **更新旧文章置顶** - 新文章发布后，将之前置顶文章的 `sticky` 值改为 `2` 或移除
3. **推荐级别** - 使用 `recommend: 1` 表示高推荐度

示例 frontmatter：
```yaml
---
group:
  title: AI 打铁铺
tags:
  - AI
  - [其他相关标签]
sidebar: false
sticky: 1
date: [YYYY-MM-DD HH:mm:ss]
recommend: 1
title: [文章标题]
description: [文章描述，100字以内]
cover: ""
---
```

### 文件命名

- 使用英文或拼音，多个单词用 `-` 连接
- 示例：`figma-to-code-last-mile.md`

## 可用 Skills

- **blog-migrate**: 将外部 md 文件迁移到博客项目，自动添加 frontmatter

## 开发命令

- `pnpm start` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm lint` - 代码检查

## 飞书通知

每次完成任务后，发送飞书通知（使用全局环境变量 `$FEISHU_WEBHOOK_KEY`）：

```bash
curl --request POST \
--url "https://open.feishu.cn/open-apis/bot/v2/hook/$FEISHU_WEBHOOK_KEY" \
--header 'content-type: application/json' \
--data '{"msg_type":"interactive","card":{"header":{"title":{"tag":"plain_text","content":"✅ Claude Code Blog 任务完成"},"template":"green"},"elements":[{"tag":"div","text":{"tag":"lark_md","content":"**本次调整内容:**\n- [具体调整内容1]\n- [具体调整内容2]\n- [具体调整内容3]"}},{"tag":"hr"},{"tag":"note","elements":[{"tag":"plain_text","content":"⏰ 完成时间: [当前时间]"}]}]}}'
```

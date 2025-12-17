import fg from "fast-glob"
import matter from "gray-matter"
import path from "path"
import fs from 'fs'
import type { Theme } from '../../composables/config/index'
import { getDefaultTitle, getFileBirthTime, getTextSummary } from "."
import { formatDate } from '../client'

// hack：RSS用
export const pageMap = new Map<string, string>()

export function getArticles(cfg?: Partial<Theme.BlogConfig>) {
  const srcDir = cfg?.srcDir || process.argv.slice(2)?.[1] || '.'
  const files = fg.sync(`${srcDir}/**/*.md`, { ignore: ['node_modules'] })

  // 文章数据
  const data = files
    .map((v) => {
      let route = v
        // 处理文件后缀名
        .replace('.md', '')

      // 去除 srcDir 处理目录名
      if (route.startsWith('./')) {
        route = route.replace(
          new RegExp(
            `^\\.\\/${path
              .join(srcDir, '/')
              .replace(new RegExp(`\\${path.sep}`, 'g'), '/')}`
          ),
          ''
        )
      } else {
        route = route.replace(
          new RegExp(
            `^${path
              .join(srcDir, '/')
              .replace(new RegExp(`\\${path.sep}`, 'g'), '/')}`
          ),
          ''
        )
      }
      // hack：RSS使用
      pageMap.set(`/${route}`, v)

      const fileContent = fs.readFileSync(v, 'utf-8')
      // TODO：摘要生成优化
      const { data: frontmatter } = matter(fileContent, {
        excerpt: true
      })

      const meta: Partial<Theme.PageMeta> = {
        ...frontmatter
      }

      if (!meta.title) {
        meta.title = getDefaultTitle(fileContent)
      }
      if (!meta.date) {
        // getGitTimestamp(v).then((v) => {
        //   meta.date = formatDate(v)
        // })
        meta.date = getFileBirthTime(v)
      } else {
        const timeZone = cfg?.timeZone ?? 8
        meta.date = formatDate(
          new Date(`${new Date(meta.date).toUTCString()}+${timeZone}`)
        )
      }

      const _tags = typeof meta.tags === "string" ? [meta.tags] : meta.tags;
      meta.tags = [.../* @__PURE__ */ new Set([...(_tags || [])])].flat();

      // 获取摘要信息
      const wordCount = 200
      meta.description =
        meta.description || getTextSummary(fileContent, wordCount)

      // 获取封面图
      meta.cover =
        meta.cover ??
        (fileContent.match(/[!]\[.*?\]\((https:\/\/.+)\)/)?.[1] || '')

      // 是否发布 默认发布
      if (meta.publish === false) {
        meta.hiddenInHome = true
        meta.recommend = false
      }

      return {
        route: `/${route}`,
        meta
      }
    })
    .filter((v) => v.meta.layout !== 'home')
  return data as Theme.PageData[]
}


// 执行getArticles，并把pageMap写入文件
export function getPosts(cfg?: Partial<Theme.BlogConfig>) {
  const data = getArticles(cfg)
  // 如果是build模式，可以写入文件，但这里主要是给虚拟模块用的
  // 保持原有逻辑，如果是直接运行此文件（比如通过 node 执行）
  if (require.main === module) {
    fs.writeFileSync(
      path.join(process.cwd(), 'src/data/posts.json'),
      JSON.stringify(data)
    )
    console.log(" pageMap",pageMap,data)
  }
  return data
}


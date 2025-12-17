import type { Plugin } from 'vite'
import path from 'path'

/**
 * Vite 插件：监听 posts.json 文件变化并触发热更新
 *
 * 由于 VitePress 基于 SSR，静态 import 的 JSON 会被缓存，
 * 因此采用强制清除整个模块图 + full-reload 的方式实现更新
 */
export function postsHMRPlugin(): Plugin {
  const postsJsonPath = path.resolve(process.cwd(), 'src/data/posts.json')

  return {
    name: 'posts-hmr-plugin',
    enforce: 'pre',

    configureServer(server) {
      // 使用 Vite 内置的 chokidar watcher 监听文件变化
      server.watcher.add(postsJsonPath)

      server.watcher.on('change', async (changedPath: string) => {
        if (path.normalize(changedPath) === path.normalize(postsJsonPath)) {
          console.log('\n📝 posts.json 文件已更新')

          // 强制清除所有模块缓存，确保下次加载时获取新数据
          const moduleGraph = server.moduleGraph

          // 清除 posts.json 相关的所有模块
          for (const [id, mod] of moduleGraph.idToModuleMap) {
            if (id.includes('posts.json') ||
                id.includes('blog.ts') ||
                id.includes('BlogRecommendArticle') ||
                id.includes('BlogSidebar') ||
                id.includes('BlogList') ||
                id.includes('BlogHomeTags') ||
                id.includes('BlogHomeOverview') ||
                id.includes('BlogHotArticle') ||
                id.includes('BlogSearch')) {
              moduleGraph.invalidateModule(mod)
            }
          }

          // 同时通过 URL 清除
          const urlsToInvalidate = [
            '/src/data/posts.json',
            '/src/composables/config/blog.ts'
          ]
          for (const url of urlsToInvalidate) {
            const mod = moduleGraph.getModuleById(url) || moduleGraph.urlToModuleMap.get(url)
            if (mod) {
              moduleGraph.invalidateModule(mod)
            }
          }

          console.log('🔄 模块缓存已清除，触发页面重载...\n')

          // 发送完整页面重载
          server.ws.send({
            type: 'full-reload',
            path: '*'
          })
        }
      })
    },

    handleHotUpdate({ file }) {
      // 拦截 posts.json 的默认 HMR 处理
      if (file.includes('posts.json')) {
        console.log('🔥 handleHotUpdate: 拦截 posts.json 变化')
        return [] // 返回空数组，由 configureServer 处理
      }
    }
  }
}


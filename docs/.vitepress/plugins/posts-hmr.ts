import type { Plugin } from 'vite'
import path from 'path'
import fs from 'fs'

/**
 * Vite 插件：监听 posts.json 文件变化并触发热更新
 */
export function postsHMRPlugin(): Plugin {
  const postsJsonPath = path.resolve(process.cwd(), 'src/data/posts.json')
  
  return {
    name: 'posts-hmr-plugin',
    
    // 配置服务器监听
    configureServer(server) {
      // 监听 posts.json 文件变化
      const watcher = fs.watch(postsJsonPath, (eventType) => {
        if (eventType === 'change') {
          console.log('📝 posts.json 文件已更新，触发热更新...')
          
          // 使模块失效
          const module = server.moduleGraph.getModuleById(postsJsonPath)
          if (module) {
            server.moduleGraph.invalidateModule(module)
          }
          
          // 触发完整重载
          server.ws.send({
            type: 'full-reload',
            path: '*'
          })
        }
      })
      
      // 服务器关闭时清理监听器
      server.httpServer?.on('close', () => {
        watcher.close()
      })
    },
    
    // 处理 posts.json 的导入
    handleHotUpdate({ file, server }) {
      if (file === postsJsonPath) {
        console.log('🔥 检测到 posts.json 变化，触发热更新')
        
        // 使所有导入 posts.json 的模块失效
        const modules = server.moduleGraph.getModulesByFile(file)
        if (modules) {
          modules.forEach(module => {
            server.moduleGraph.invalidateModule(module)
          })
        }
        
        // 返回需要更新的模块
        return Array.from(modules || [])
      }
    }
  }
}


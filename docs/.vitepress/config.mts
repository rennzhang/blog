import path from 'path'
import { defineConfig } from '@blog/theme/node'
import packageJSON from '../../package.json'
import { blogTheme, extraHead } from './blog-theme'
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import UnoCSS from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from "unplugin-icons/resolver";
import { SearchPlugin } from 'vitepress-plugin-search'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
export default defineConfig({
  extends: blogTheme,
  lang: 'zh-cn',
  title: 'Renkin',
  description: 'Renkin 的扯淡日记',
  head: [...extraHead],
  vite: {
    // configFile:"./vite.config.ts",
    server: {
      host: '0.0.0.0'
    },
    resolve: {
      alias: {
        '@blog/theme': path.join(__dirname, '../../src/index.ts')
      }
    },
    optimizeDeps: {
      exclude: ['vitepress-plugin-tabs']
    },
    plugins: [
      SearchPlugin({
        previewLength: 62,
        buttonLabel: "Search",
        placeholder: "Search docs",
        allow: [],
        ignore: [],
        // encode: false,
        tokenize: "full"
      }),
      Icons(),
      UnoCSS(),
      // https://github.com/antfu/unplugin-auto-import
      AutoImport({
        imports: ["vue", "@vueuse/core"],
        dts: "../types/auto-imports.d.ts",
        dirs: [
          "./doc/.vitepress/",
          "./src/components",
          "./src/composables",
          "./src/utils",
          "./src/types",
        ],
        vueTemplate: true,
        eslintrc: {
          enabled: true,
        },
        resolvers: [ElementPlusResolver()],
      }),
      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: true,
        dirs: ["./src/components","./","src"],
        resolvers: [IconsResolver(),ElementPlusResolver()],
      }),
    ],
  },
  themeConfig: {
    outline: [2,4],
    search: {
      provider: 'local',
    },
    footer: {
      message: `Power By <a target="_blank" href="https://theme.sugarat.top/"> @blog/theme@${packageJSON.version} </a>`,
      copyright: 'MIT License | Copyright © Renkin'
    },
    nav: [
      {
        text: `关于我`,
        link: '/aboutme'
      },
      {
        text: `我的开源`,
        link: '/我的开源/'
      },
      {
        text: '重学前端',
        items: [
          {
            text: "Javascript",
            link:"/专题系列/重学前端/javascript/"
          }
        ]
      },
      {
        text: '其他',
        items: [
          {
            text: "博客配置",
            link:"/专题系列/其他/博客配置/"
          }
        ]
      },
      // {
      //   text: '线上作品',
      //   items: [
      //     {
      //       text: '轻取(文件收集)',
      //       link: 'https://ep2.sugarat.top'
      //     },
      //     {
      //       text: '个人图床',
      //       link: 'https://imgbed.sugarat.top'
      //     },
      //     {
      //       text: '考勤小程序',
      //       link: 'https://hdkq.sugarat.top/'
      //     },
      //     {
      //       text: '时光恋人',
      //       link: 'https://lover.sugarat.top'
      //     },
      //     {
      //       text: '在线简历生成',
      //       link: 'https://resume.sugarat.top/'
      //     }
      //   ]
      // }
    ],
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/rennzhang'
      }
    ],
    editLink: {
      // https://github.com/rennzhang/blog/blob/main/docs/changelog.md
      pattern:
        'https://github.com/rennzhang/blog/blob/main/docs/:path',
      text: '去 GitHub 上编辑内容'
    },
    lastUpdatedText: '上次更新于'
  },
  lastUpdated: true
})

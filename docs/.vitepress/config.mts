import path from "path";
import { defineConfig } from "@blog/theme/node";
import packageJSON from "../../package.json";
import { blogTheme, extraHead } from "./blog-theme";
import Components from "unplugin-vue-components/vite";
import AutoImport from "unplugin-auto-import/vite";
import UnoCSS from "unocss/vite";
import Icons from "unplugin-icons/vite";
import IconsResolver from "unplugin-icons/resolver";
import { SearchPlugin } from "vitepress-plugin-search";
export default defineConfig({
  extends: blogTheme,
  lang: "zh-cn",
  title: "Renkin",
  titleTemplate: "扯淡日记",
  description: "Renkin 的扯淡日记",
  head: [...extraHead],
  vite: {
    server: {
      host: "0.0.0.0",
    },
    resolve: {
      alias: {
        "@blog/theme": path.join(__dirname, "../../src/index.ts"),
        "@blog": path.join(__dirname, "../../src"),
      },
    },
    optimizeDeps: {
      exclude: ["vitepress-plugin-tabs"],
    },
    // @ts-ignore
    bulid: {
      terserOptions: {
        compress: {
          drop_console: false,
        },
      },
    },
    plugins: [
      SearchPlugin({
        previewLength: 62,
        buttonLabel: "Search",
        placeholder: "Search docs",
        allow: [],
        ignore: [],
        // encode: false,
        tokenize: "full",
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
      }),
      // https://github.com/antfu/vite-plugin-components
      Components({
        dts: true,
        dirs: ["./src/components", "./", "src"],
        resolvers: [IconsResolver()],
      }),
    ],
  },
  themeConfig: {
    outline: [2, 4],
    outlineTitle: "文章目录",
    search: {
      provider: "local",
    },
    footer: {
      message: `Power By <a target="_blank" href="https://theme.sugarat.top/"> @blog/theme@${packageJSON.version} </a>`,
      copyright: "MIT License | Copyright © Renkin",
    },
    nav: [
      {
        text: "AI 专题",
        items: [
          {
            text: "AI 工具",
            link: "/专题系列/AI/AI工具/",
          },
          {
            text: "AI Coding 工作流",
            link: "/专题系列/AI/AICoding工作流/",
          },
          {
            text: "AI 实战",
            link: "/专题系列/AI/AI实战/",
          },
        ],
      },

      {
        text: "Web 前端",
        items: [
          {
            text: "重学前端",
            link: "/专题系列/Web 前端/重学前端/",
          },
          {
            text: "疑难杂症",
            link: "/专题系列/Web 前端/疑难杂症/",
          },
          {
            text: "JS 速查表",
            link: "/专题系列/Web 前端/JS 速查表/",
          },
        ],
      },

      {
        text: "其他",
        items: [
          {
            text: "博客配置",
            link: "/专题系列/其他/博客配置/",
          },
          {
            text: "我的开源",
            link: "/专题系列/其他/我的开源/",
          },
        ],
      },
      {
        text: `关于我`,
        link: "/aboutme",
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
        icon: "github",
        link: "https://github.com/rennzhang",
      },
    ],
    editLink: {
      // https://github.com/rennzhang/blog/blob/main/docs/changelog.md
      pattern: "https://github.com/rennzhang/blog/blob/main/docs/:path",
      text: "去 GitHub 上编辑内容",
    },
    lastUpdatedText: "上次更新于",
  },
  lastUpdated: true,
  ignoreDeadLinks: true,
});

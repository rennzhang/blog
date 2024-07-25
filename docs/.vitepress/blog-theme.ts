import type { Theme } from '@blog/theme'
import { getThemeConfig } from '@blog/theme/node'

export const workConfig: Theme.UserWorks = {
  title: '个人项目/线上作品',
  description: '记录开发的点点滴滴',
  topTitle: '举些🌰',
  list: [
    {
      title: '博客主题 @blog/theme',
      description: '基于 vitepress 实现的博客主题',
      time: {
        start: '2023/01/29'
      },
      github: {
        owner: 'rennzhang',
        repo: 'blog',
        branch: 'main',
        path: 'docs'
      },
      status: {
        text: '积级维护'
      },
      url: 'https://theme.sugarat.top',
      cover:
        'https://img.cdn.sugarat.top/mdImg/MTY3MzE3MDUxOTMwMw==673170519303',
      tags: ['Vitepress', 'Vue'],
      links: [
        {
          title: '一个简约风的VitePress博客主题',
          url: 'https://juejin.cn/post/7196517835380293693'
        }
      ]
    },
    {
      title: 'EasyPicker(轻取)',
      description:
        '在线文件收集系统，支持各种文件的收集，一站式存储，提交者无需注册',
      time: {
        start: '2019/03/27'
      },
      github: {
        owner: 'ATQQ',
        repo: 'easypicker2-client',
        branch: 'main'
      },
      status: {
        text: '积级维护'
      },
      url: 'https://docs.ep.sugarat.top',
      cover:
        'https://img.cdn.sugarat.top/mdImg/MTY3ODAwMzU3MTc2Ng==678003571766',
      tags: ['Vue'],
      links: [
        {
          title: '提交示例',
          url: 'https://ep2.sugarat.top/task/627bd3b18a567f1b47bcdace'
        },
        { title: '私有化部署', url: 'https://docs.ep.sugarat.top/deploy/' }
      ]
    },
    {
      title: '个人博客',
      description: '✍️📚我写博客的地方🤪🤪🤪，记录随笔与学习笔记',
      time: {
        start: '2020/02/18'
      },
      github: 'https://github.com/ATQQ/sugar-blog',
      url: 'https://sugarat.top',
      tags: ['Vitepress', 'Vue'],
      cover:
        'https://img.cdn.sugarat.top/mdImg/MTY3MzE3MDUxOTMwMw==673170519303',
      links: [
        { title: '掘金', url: 'https://juejin.cn/user/1028798615918983' },
        { title: 'GitHub主页', url: 'https://github.com/ATQQ' }
      ]
    },
    {
      title: '示例1',
      description: `项目介绍${'阿巴'.repeat(50)}`,
      time: {
        start: '2022/03/27'
      },
      status: {
        text: '内置badge',
        type: 'danger'
      },
      top: 1,
      github: 'https://github.com/ATQQ/sugar-blog',
      url: 'https://sugarat.top',
      tags: ['Vitepress', 'Vue'],
      cover: [
        'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
        'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
        'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
        'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
        'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
        'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
        'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg'
      ],
      links: [
        { title: '掘金', url: 'https://juejin.cn/user/1028798615918983' },
        { title: 'GitHub主页', url: 'https://github.com/ATQQ' }
      ]
    },
    {
      title: '示例2',
      description: `项目介绍${'哈哈'.repeat(50)}`,
      time: {
        start: '2022/03/27'
      },
      status: {
        text: '内置badge',
        type: 'tip'
      },
      top: 2,
      github: 'https://github.com/ATQQ/sugar-blog',
      tags: ['Vitepress'],
      cover: {
        urls: [
          'https://fuss10.elemecdn.com/a/3f/3302e58f9a181d2509f3dc0fa68b0jpeg.jpeg',
          'https://fuss10.elemecdn.com/1/34/19aa98b1fcb2781c4fba33d850549jpeg.jpeg',
          'https://fuss10.elemecdn.com/0/6f/e35ff375812e6b0020b6b4e8f9583jpeg.jpeg',
          'https://fuss10.elemecdn.com/9/bb/e27858e973f5d7d3904835f46abbdjpeg.jpeg',
          'https://fuss10.elemecdn.com/d/e6/c4d93a3805b3ce3f323f7974e6f78jpeg.jpeg',
          'https://fuss10.elemecdn.com/3/28/bbf893f792f03a54408b3b7a7ebf0jpeg.jpeg',
          'https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg'
        ],
        layout: 'list'
      },
      links: [
        { title: '自定义链接', url: 'https://juejin.cn/user/1028798615918983' }
      ]
    }
  ]
}

const baseUrl = 'https://renkin.cn'
const RSS: Theme.RSSOptions = {
  title: 'Renkin 的扯淡日记',
  baseUrl,
  copyright: 'Copyright (c) 2023-present, Renkin',
}

export const blogTheme = getThemeConfig({
  RSS,
  recommend: {
    nextText: '下一页'
  },
  friend: [
    {
      nickname: '前端导航',
      des: '丰富的前端生态导航站点',
      avatar:
        'https://cdn.icon-icons.com/icons2/1537/PNG/512/1562687-code-computer-creative-html-process-technology-web-development_107058.png',
      url: 'https://no.buging.cn/'
    },
    {
      nickname: '大前端面试宝典 - 图解前端',
      des: '宇宙最强的前端面试指南',
      avatar:
        'https://p.ipic.vip/jiysdy.jpg',
      url: 'https://lucifer.ren/fe-interview/'
    },
    {
      nickname: 'Vitepress',
      des: 'Vite & Vue Powered Static Site Generator',
      avatar: 'https://vitepress.dev/vitepress-logo-large.webp',
      url: 'https://vitepress.dev/'
    }
  ],
  // 文章默认作者
  author: 'Renkin',
  // 评论
  comment: {
    repo: 'rennzhang/blog',
    repoId: 'R_kgDOKTkGhQ',
    category: 'Announcements',
    categoryId: 'DIC_kwDOKTkGhc4CZXQD',
    inputPosition: 'top'
  },
  popover: {
    title: '公告',
    body: [
      {
        type: 'text',
        content: 'QQ交流群：681489336 🎉🎉'
      },
      { type: 'text', content: '👇公众号👇---👇 微信 👇' },
      {
        type: 'image',
        src: 'https://img.cdn.sugarat.top/mdImg/MTYxNTAxODc2NTIxMA==615018765210'
      },
      {
        type: 'text',
        content: '欢迎大家加群&私信交流'
      },
      {
        type: 'button',
        content: '博客',
        link: 'https://sugarat.top'
      }
    ],
    duration: 0
  },
  search: {
    mode: false,
    btnPlaceholder: 'Search',
    placeholder: 'Search Docs',
    emptyText: 'No results found',
    heading: 'Total: {{searchResult}} search results.'
  },
  tabs: true,
  works: workConfig
})

export const extraHead: any =
  process.env.NODE_ENV === 'production'
    ? [
      [
        'script',
        {
          charset: 'UTF-8',
          id: 'LA_COLLECT',
          src: '//sdk.51.la/js-sdk-pro.min.js'
        }
      ],
      [
        'script',
        {},
        'LA.init({id:"Jyzk2AcXA3JsYbrG",ck:"Jyzk2AcXA3JsYbrG",hashMode:true})'
      ]
    ]
    : []

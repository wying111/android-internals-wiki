import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { generateSidebar } from './sidebar.mts'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(dirname, '../src')

// 扫描 src 下所有 README.md，重写为 index.md，
// 使章节首页路由为干净的目录路径（/partX/chYY/ 而非 /partX/chYY/README.html）
function collectReadmeRewrites(dir: string, base = ''): Record<string, string> {
  const rewrites: Record<string, string> = {}
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    const rel = base ? `${base}/${name}` : name
    if (fs.statSync(full).isDirectory()) {
      Object.assign(rewrites, collectReadmeRewrites(full, rel))
    } else if (name === 'README.md') {
      rewrites[rel] = rel.replace(/README\.md$/, 'index.md')
    }
  }
  return rewrites
}

export default withMermaid(
  defineConfig({
    srcDir: 'src',
    srcExclude: ['SUMMARY.md'],

    // 部署在 iaimer.com/wiki 子路径下
    base: '/wiki/',

    lang: 'zh-CN',
    title: 'Android 技术内幕',
    titleTemplate: ':title | Android 技术内幕',
    description:
      '一本由 AI 辅助持续进化的 Android 技术百科：系统机制、性能优化与工具实战',

    cleanUrls: true,
    lastUpdated: true,

    rewrites: {
      ...collectReadmeRewrites(srcDir),
    },

    markdown: {
      lineNumbers: false,
    },

    mermaid: {
      // vitepress-plugin-mermaid 配置
    },

    themeConfig: {
      nav: [
        { text: '首页', link: '/' },
        { text: '开始阅读', link: '/preface/intro' },
        { text: '附录', link: '/appendix/glossary' },
        {
          text: 'GitHub',
          link: 'https://github.com/Gracker/android-internals-wiki',
        },
      ],

      sidebar: generateSidebar(path.join(srcDir, 'SUMMARY.md')),

      outline: {
        level: [2, 3],
        label: '本页目录',
      },

      search: {
        provider: 'local',
        options: {
          locales: {
            root: {
              translations: {
                button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
                modal: {
                  noResultsText: '未找到相关结果',
                  resetButtonTitle: '清除查询',
                  footer: {
                    selectText: '选择',
                    navigateText: '切换',
                    closeText: '关闭',
                  },
                },
              },
            },
          },
        },
      },

      editLink: {
        pattern:
          'https://github.com/Gracker/android-internals-wiki/edit/master/src/:path',
        text: '在 GitHub 上编辑此页',
      },

      socialLinks: [
        {
          icon: 'github',
          link: 'https://github.com/Gracker/android-internals-wiki',
        },
      ],

      docFooter: { prev: '上一页', next: '下一页' },
      lastUpdatedText: '最后更新',
      returnToTopLabel: '回到顶部',
      sidebarMenuLabel: '菜单',
      darkModeSwitchLabel: '主题',
      lightModeSwitchTitle: '切换到浅色模式',
      darkModeSwitchTitle: '切换到深色模式',

      footer: {
        message: '基于知识共享协议发布 | 由 VitePress 驱动',
        copyright: 'Copyright © 高建武（Gracker）',
      },
    },
  }),
)

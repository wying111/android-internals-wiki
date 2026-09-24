import fs from 'node:fs'
import path from 'node:path'

interface SidebarItem {
  text: string
  link?: string
  items?: SidebarItem[]
  collapsed?: boolean
}

/** 把 mdBook 的 md 路径转成 VitePress 路由链接 */
function toLink(mdPath: string): string {
  let p = mdPath.trim().replace(/\.md$/, '')
  // 章节 README.md 经由 rewrites 映射为 index.md，路由为目录本身
  p = p.replace(/\/README$/, '')
  return '/' + p
}

/**
 * 解析 src/SUMMARY.md（mdBook 目录），生成 VitePress sidebar 配置。
 * 结构约定：
 *   # 目录            —— 忽略
 *   # 第 N 部分：xxx   —— 一个 part 分组
 *   - [章节](path)     —— 章（顶层条目）
 *     - [小节](path)   —— 章内小节（缩进两个空格）
 *   ---               —— 分隔线，忽略
 */
export function generateSidebar(summaryPath: string): SidebarItem[] {
  const content = fs.readFileSync(summaryPath, 'utf-8')
  const lines = content.split('\n')

  const sidebar: SidebarItem[] = []
  let currentPart: SidebarItem | null = null
  let lastChapter: SidebarItem | null = null

  for (const line of lines) {
    // 标题行：`# xxx`
    const heading = line.match(/^#\s+(.+?)\s*$/)
    if (heading) {
      const text = heading[1]
      if (text === '目录') continue
      currentPart = { text, items: [] }
      sidebar.push(currentPart)
      lastChapter = null
      continue
    }

    // 列表项：`- [text](path)` 或 `  - [text](path)`
    const item = line.match(/^(\s*)-\s+\[(.+?)\]\((.+?)\)\s*$/)
    if (!item) continue

    const indent = item[1].length
    const entry: SidebarItem = { text: item[2], link: toLink(item[3]) }

    if (indent === 0) {
      // 顶层条目：前言页 / 章 / 附录页
      const target = currentPart ? currentPart.items! : sidebar
      target.push(entry)
      lastChapter = entry
    } else if (lastChapter) {
      // 子条目：挂到最近的章下面
      if (!lastChapter.items) {
        lastChapter.items = []
        lastChapter.collapsed = true
      }
      lastChapter.items.push(entry)
    }
  }

  return sidebar
}

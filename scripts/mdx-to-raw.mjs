#!/usr/bin/env node
// mdx-to-raw.mjs — content/ 의 MDX 파일을 knowledge/raw/ 의 평문 markdown 으로 변환.
//
// 변환 규칙 (Phase A 시드 마이그레이션과 동일):
//   - MDX frontmatter (---...---) 제거 (입력에서 제목·설명만 추출해 참고)
//   - import { ... } from '...' 라인 제거
//   - <Callout>...</Callout> → blockquote (각 라인에 `> ` 접두)
//   - <Mermaid chart={`...`}/> 또는 <Mermaid chart={`...`} /> → ```mermaid ... ``` 코드 블록
//   - {/* MDX 주석 */} 제거 (단일·다중 라인)
//   - <Card>, <CardGrid>, <Hero>, <Toggle> 등 그 외 JSX 태그는 제거하되 내용은 유지
//   - 본문 markdown 은 한 글자도 손대지 않음
//
// 출력 frontmatter (knowledge/raw 표준):
//   ---
//   source_type: <log|external|conversation|...>
//   captured: <YYYY-MM-DD>
//   published_at: <원본 mdx 상대 경로>
//   ---
//
// 사용법:
//   node scripts/mdx-to-raw.mjs --input <mdx-path> --output <md-path> --captured <YYYY-MM-DD> [--source-type log]

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, relative } from 'node:path'
import { parseArgs } from 'node:util'

const ROOT = process.cwd()

const args = parseArgs({
  options: {
    input: { type: 'string' },
    output: { type: 'string' },
    captured: { type: 'string' },
    'source-type': { type: 'string', default: 'log' },
  },
})

const { input, output, captured } = args.values
const sourceType = args.values['source-type']

if (!input || !output || !captured) {
  console.error('Usage: node mdx-to-raw.mjs --input <mdx> --output <md> --captured <YYYY-MM-DD> [--source-type log]')
  process.exit(1)
}

const inputContent = await readFile(input, 'utf8')

let body = inputContent

// 1. MDX frontmatter 제거 (파일 맨 위 ---...--- 블록)
body = body.replace(/^---\n[\s\S]*?\n---\n+/, '')

// 2. import 문 제거 (라인 단위)
body = body
  .split('\n')
  .filter((line) => !/^import\s+.+from\s+['"]/.test(line.trim()))
  .join('\n')

// 3. {/* MDX 주석 */} 제거 — 다중 라인 가능
body = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')

// 4. <Mermaid chart={`...`}/> → ```mermaid ... ```
//    chart 안 내용은 백틱·이스케이프 가능. 일단 단순 케이스만.
body = body.replace(/<Mermaid\s+chart=\{`([\s\S]*?)`\}\s*\/>/g, (_, chart) => {
  const trimmed = chart.trim().replace(/\n+$/, '')
  return '```mermaid\n' + trimmed + '\n```'
})

// 5. <Callout>...</Callout> → blockquote
body = body.replace(/<Callout(?:\s[^>]*)?>([\s\S]*?)<\/Callout>/g, (_, inner) => {
  const trimmed = inner.replace(/^\n+/, '').replace(/\n+$/, '')
  return trimmed
    .split('\n')
    .map((line) => (line.trim() === '' ? '>' : '> ' + line))
    .join('\n')
})

// 6. 그 외 JSX 컴포넌트 태그 제거 (열고 닫는 짝)
//    <Card>...</Card>, <CardGrid>...</CardGrid>, <Hero>...</Hero>, <Toggle>...</Toggle>,
//    <Timeline>...</Timeline>, <TimelineItem>...</TimelineItem>, <Placeholder>...</Placeholder>,
//    <AssetCard>...</AssetCard>, <RecentUpdates ... />, <LogList ... />
const COMPONENTS_WITH_CHILDREN = ['Card', 'CardGrid', 'Hero', 'Toggle', 'Timeline', 'TimelineItem', 'Placeholder', 'AssetCard']
for (const tag of COMPONENTS_WITH_CHILDREN) {
  // 여는 태그 (속성 포함) 제거
  const openRe = new RegExp(`<${tag}(?:\\s[^>]*)?>`, 'g')
  body = body.replace(openRe, '')
  // 닫는 태그 제거
  const closeRe = new RegExp(`</${tag}>`, 'g')
  body = body.replace(closeRe, '')
}

// 7. 자체-닫힘 JSX 컴포넌트 (<RecentUpdates />, <LogList />, <Placeholder />) 제거
body = body.replace(/<(RecentUpdates|LogList|Placeholder|AssetCard)\s*(?:[^>]*)\/>/g, '')

// 8. 연속된 빈 줄 3개 이상을 2개로 압축 (정리)
body = body.replace(/\n{3,}/g, '\n\n')

// 앞뒤 공백 정리
body = body.replace(/^\n+/, '').replace(/\n+$/, '\n')

// 출력 frontmatter
const publishedAt = relative(ROOT, input)
const outputFrontmatter = `---
source_type: ${sourceType}
captured: ${captured}
published_at: ${publishedAt}
---

`

await mkdir(dirname(output), { recursive: true })
await writeFile(output, outputFrontmatter + body, 'utf8')

const lineCount = body.split('\n').length
console.log(`✓ ${output} (${lineCount} lines from ${input})`)

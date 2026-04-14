import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..', '..')
const builtAppPath = path.join(repoRoot, '.next', 'server', 'app')
const pagefindPath = path.join(repoRoot, 'public', '_pagefind')

const requiredAssets = [
  'pagefind-entry.json',
  'pagefind.js',
  'pagefind-worker.js'
]

for (const asset of requiredAssets) {
  const assetPath = path.join(pagefindPath, asset)

  if (!existsSync(assetPath)) {
    throw new Error(`검색 인덱스 필수 파일이 없습니다: ${path.relative(repoRoot, assetPath)}`)
  }
}

const walkFiles = (directoryPath) => {
  const entries = readdirSync(directoryPath, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const entryPath = path.join(directoryPath, entry.name)

    if (entry.isDirectory()) {
      return walkFiles(entryPath)
    }

    return entryPath
  })
}

const htmlFiles = walkFiles(builtAppPath).filter((filePath) => filePath.endsWith('.html'))
const searchableHtmlFiles = htmlFiles.filter((filePath) => {
  if (filePath.endsWith(`${path.sep}_not-found.html`)) {
    return false
  }

  return readFileSync(filePath, 'utf8').includes('data-pagefind-body')
})

const pagefindEntryPath = path.join(pagefindPath, 'pagefind-entry.json')
const pagefindEntry = JSON.parse(readFileSync(pagefindEntryPath, 'utf8'))
const indexedPageCount = Object.values(pagefindEntry.languages).reduce((count, language) => {
  return count + language.page_count
}, 0)

if (searchableHtmlFiles.length === 0) {
  throw new Error('검색 가능한 HTML 페이지를 찾지 못했습니다.')
}

if (indexedPageCount !== searchableHtmlFiles.length) {
  throw new Error(
    `검색 인덱스 페이지 수가 맞지 않습니다. expected=${searchableHtmlFiles.length}, actual=${indexedPageCount}`
  )
}

console.log(
  `[search] verified ${indexedPageCount} indexed pages across ${Object.keys(pagefindEntry.languages).length} language(s)`
)

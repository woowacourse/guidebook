import fs from 'node:fs/promises'
import path from 'node:path'

const [, , inputArg, outputArg] = process.argv

if (!inputArg) {
  console.error(
    'Usage: node scripts/interview-challenge/normalize-vtt.mjs <input-file-or-dir> [output-dir]'
  )
  process.exit(1)
}

const inputPath = path.resolve(process.cwd(), inputArg)
const outputPath = outputArg ? path.resolve(process.cwd(), outputArg) : null

function stripTags(text) {
  return text
    .replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '')
    .replace(/<\/?c[^>]*>/g, '')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function toClockLabel(raw) {
  const [clock] = raw.split('.')
  const parts = clock.split(':')
  if (parts.length === 3) {
    return clock
  }

  return raw
}

function parseBlocks(source) {
  return source
    .split(/\r?\n\r?\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
}

function extractCues(source) {
  const blocks = parseBlocks(source)
  const cues = []

  for (const block of blocks) {
    if (
      block.startsWith('WEBVTT') ||
      block.startsWith('Kind:') ||
      block.startsWith('Language:') ||
      block.startsWith('NOTE')
    ) {
      continue
    }

    const lines = block.split(/\r?\n/).map((line) => line.trim())
    const timeLineIndex = lines.findIndex((line) => line.includes('-->'))

    if (timeLineIndex === -1) {
      continue
    }

    const timeLine = lines[timeLineIndex]
    const [startRaw, endRaw] = timeLine.split('-->').map((part) => part.trim().split(' ')[0])
    const textCandidates = lines
      .slice(timeLineIndex + 1)
      .map(stripTags)
      .filter(Boolean)

    if (textCandidates.length === 0) {
      continue
    }

    const text = textCandidates[textCandidates.length - 1]
    const previous = cues[cues.length - 1]

    if (previous && previous.text === text) {
      continue
    }

    cues.push({
      start: toClockLabel(startRaw),
      end: toClockLabel(endRaw),
      text,
    })
  }

  return cues
}

async function collectVttFiles(targetPath) {
  const stats = await fs.stat(targetPath)

  if (stats.isFile()) {
    if (!targetPath.endsWith('.vtt')) {
      throw new Error(`Expected a .vtt file: ${targetPath}`)
    }

    return [targetPath]
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(targetPath, entry.name)

      if (entry.isDirectory()) {
        return collectVttFiles(fullPath)
      }

      if (entry.isFile() && entry.name.endsWith('.vtt')) {
        return [fullPath]
      }

      return []
    })
  )

  return files.flat().sort()
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

function buildOutputFile(filePath) {
  if (!outputPath) {
    return filePath.replace(/\.vtt$/i, '.txt')
  }

  const fileName = `${path.basename(filePath, '.vtt')}.txt`
  return path.join(outputPath, fileName)
}

function renderCues(cues) {
  return cues.map((cue) => `[${cue.start}] ${cue.text}`).join('\n')
}

async function normalizeFile(filePath) {
  const source = await fs.readFile(filePath, 'utf8')
  const cues = extractCues(source)
  const destination = buildOutputFile(filePath)

  await ensureDir(path.dirname(destination))
  await fs.writeFile(destination, `${renderCues(cues)}\n`, 'utf8')

  return {
    filePath,
    destination,
    cueCount: cues.length,
  }
}

async function main() {
  const files = await collectVttFiles(inputPath)

  if (files.length === 0) {
    console.log('No .vtt files found.')
    return
  }

  if (outputPath) {
    await ensureDir(outputPath)
  }

  const results = []

  for (const filePath of files) {
    const result = await normalizeFile(filePath)
    results.push(result)
    console.log(
      `${path.relative(process.cwd(), result.filePath)} -> ${path.relative(
        process.cwd(),
        result.destination
      )} (${result.cueCount} cues)`
    )
  }

  console.log(`Normalized ${results.length} file(s).`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})

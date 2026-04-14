import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const playlistPath = path.join(rootDir, '.temp/education-briefing/playlist.json')
const cleanDir = path.join(rootDir, '.temp/education-briefing/clean')
const outputPath = path.join(rootDir, '.temp/education-briefing/report.json')
const contentDataPath = path.join(
  rootDir,
  'content/education/conversations/education-briefing-data.json'
)

const GROUPS = [
  {
    key: 'admission_info',
    label: '입학 설명회와 안내',
    description: '연도별 입학 설명회 본편, 세션 클립, 소개 영상을 모아 본 흐름입니다.',
  },
  {
    key: 'coach_chat',
    label: '코치와 수다 타임',
    description: '설명회 뒤에 이어지는 자유 Q&A 성격의 긴 대화입니다.',
  },
  {
    key: 'educator_talk',
    label: '교육자 관점 강연',
    description: '개발자에서 교육자로의 전환, 교육의 의미, 역량에 대한 긴 호흡의 발표입니다.',
  },
  {
    key: 'educator_qa',
    label: '교육 운영 Q&A',
    description: '교육 준비, 운영, 참여 독려, 코드리뷰, 커뮤니티 질문에 답하는 짧은 문답입니다.',
  },
]

const GROUP_MAP = new Map(GROUPS.map((group) => [group.key, group]))

const TRANSCRIPT_STATUS = {
  ok: 'ok',
  noCaptions: 'no_captions',
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function parseDuration(value) {
  return value
    .split(':')
    .map(Number)
    .reduce((total, current) => total * 60 + current, 0)
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 ${seconds}초`
  }

  return `${minutes}분 ${seconds}초`
}

function detectGroup(title) {
  if (title.includes('코치와 수다 타임')) {
    return 'coach_chat'
  }

  if (title.startsWith('[우아한테크코스 교육설명회] Q')) {
    return 'educator_qa'
  }

  if (title.startsWith('[우아한테크코스 교육설명회]')) {
    return 'educator_talk'
  }

  if (
    title.includes('입학 설명회') ||
    title.includes('입학설명회') ||
    title === '우아한테크코스 소개'
  ) {
    return 'admission_info'
  }

  return 'admission_info'
}

function detectFormat(entry) {
  const title = entry.title

  if (title.includes('코치와 수다 타임')) {
    return '라이브 Q&A'
  }

  if (title === '우아한테크코스 소개') {
    return '소개'
  }

  if (title.startsWith('[우아한테크코스 교육설명회] Q')) {
    return '짧은 Q&A'
  }

  if (title.startsWith('[우아한테크코스 교육설명회]')) {
    return '강연'
  }

  if (title.includes('세션')) {
    return '세션 클립'
  }

  const seconds = parseDuration(entry.durationString)

  if (title.includes('입학 설명회') || title.includes('입학설명회')) {
    return seconds >= 3600 ? '본편' : '하이라이트'
  }

  return '기타'
}

function detectYear(title) {
  const match = title.match(/20\d{2}/)
  return match ? Number(match[0]) : null
}

function stripPrefix(title) {
  return normalizeWhitespace(
    title
      .replace(/^\[우아한테크코스 교육설명회\]\s*/u, '')
      .replace(/^\[우아한테크코스\]\s*/u, '')
  )
}

async function readTranscript(entry) {
  const transcriptPath = path.join(
    cleanDir,
    `${String(entry.index).padStart(2, '0')}-${entry.id}.ko.txt`
  )

  try {
    const source = await fs.readFile(transcriptPath, 'utf8')
    return {
      exists: true,
      source,
      transcriptPath,
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        exists: false,
        source: '',
        transcriptPath,
      }
    }

    throw error
  }
}

function countMatches(source, keyword) {
  if (!keyword) {
    return 0
  }

  return source.split(keyword).length - 1
}

async function main() {
  const playlist = JSON.parse(await fs.readFile(playlistPath, 'utf8'))
  const entries = []

  for (const item of playlist) {
    const transcript = await readTranscript(item)
    const groupKey = detectGroup(item.title)
    const group = GROUP_MAP.get(groupKey)
    const durationSeconds = parseDuration(item.durationString)

    const transcriptStatus = transcript.exists
      ? TRANSCRIPT_STATUS.ok
      : TRANSCRIPT_STATUS.noCaptions

    const source = transcript.source

    entries.push({
      index: item.index,
      id: item.id,
      title: item.title,
      displayTitle: stripPrefix(item.title),
      url: item.url,
      duration: item.durationString,
      durationSeconds,
      durationLabel: formatDuration(durationSeconds),
      year: detectYear(item.title),
      groupKey,
      groupLabel: group.label,
      format: detectFormat(item),
      transcriptStatus,
      transcriptPath: transcript.exists
        ? path.relative(rootDir, transcript.transcriptPath)
        : null,
      transcriptLineCount: transcript.exists
        ? source.split(/\r?\n/).filter(Boolean).length
        : 0,
      keywordCounts: transcript.exists
        ? {
            입학: countMatches(source, '입학'),
            몰입: countMatches(source, '몰입'),
            교육자: countMatches(source, '교육자'),
            코치: countMatches(source, '코치'),
            질문: countMatches(source, '질문'),
            프로젝트: countMatches(source, '프로젝트'),
            리뷰: countMatches(source, '리뷰'),
            공유: countMatches(source, '공유'),
          }
        : {
            입학: 0,
            몰입: 0,
            교육자: 0,
            코치: 0,
            질문: 0,
            프로젝트: 0,
            리뷰: 0,
            공유: 0,
          },
    })
  }

  const summary = {
    totalVideos: entries.length,
    totalSeconds: entries.reduce((total, entry) => total + entry.durationSeconds, 0),
    totalDuration: formatDuration(
      entries.reduce((total, entry) => total + entry.durationSeconds, 0)
    ),
    transcriptOk: entries.filter((entry) => entry.transcriptStatus === TRANSCRIPT_STATUS.ok)
      .length,
    transcriptUnavailable: entries.filter(
      (entry) => entry.transcriptStatus !== TRANSCRIPT_STATUS.ok
    ).length,
    transcriptStatusCounts: {
      ok: entries.filter((entry) => entry.transcriptStatus === TRANSCRIPT_STATUS.ok).length,
      no_captions: entries.filter(
        (entry) => entry.transcriptStatus === TRANSCRIPT_STATUS.noCaptions
      ).length,
    },
  }

  const groups = GROUPS.map((group) => {
    const groupEntries = entries.filter((entry) => entry.groupKey === group.key)
    const totalSeconds = groupEntries.reduce((total, entry) => total + entry.durationSeconds, 0)
    const transcriptOk = groupEntries.filter(
      (entry) => entry.transcriptStatus === TRANSCRIPT_STATUS.ok
    ).length

    return {
      ...group,
      count: groupEntries.length,
      totalSeconds,
      totalDuration: formatDuration(totalSeconds),
      transcriptOk,
      transcriptUnavailable: groupEntries.length - transcriptOk,
      entries: groupEntries,
    }
  })

  const admissionByYear = groups
    .find((group) => group.key === 'admission_info')
    .entries.reduce((accumulator, entry) => {
      const key = entry.year ? String(entry.year) : '기타'
      const bucket =
        accumulator[key] ??
        {
          year: key,
          count: 0,
          totalSeconds: 0,
          transcriptOk: 0,
        }

      bucket.count += 1
      bucket.totalSeconds += entry.durationSeconds
      if (entry.transcriptStatus === TRANSCRIPT_STATUS.ok) {
        bucket.transcriptOk += 1
      }

      accumulator[key] = bucket
      return accumulator
    }, {})

  const report = {
    summary,
    groups,
    admissionByYear: Object.values(admissionByYear)
      .map((item) => ({
        ...item,
        totalDuration: formatDuration(item.totalSeconds),
      }))
      .sort((a, b) => String(a.year).localeCompare(String(b.year))),
    entries,
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.mkdir(path.dirname(contentDataPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await fs.writeFile(contentDataPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(
    `Wrote ${path.relative(rootDir, outputPath)} and ${path.relative(
      rootDir,
      contentDataPath
    )}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

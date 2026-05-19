import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const playlistPath = path.join(rootDir, '.temp/demo-day/playlist.json')
const cleanDir = path.join(rootDir, '.temp/demo-day/clean')
const outputPath = path.join(rootDir, '.temp/demo-day/report.json')
const contentDataPath = path.join(
  rootDir,
  'content/education/conversations/demo-day-data.json'
)

const CURRENT_GEN_4 = new Set([
  'F12',
  '회고덕',
  '티타임',
  '체크 메이트',
  '속닥속닥',
  '모아모아',
  '모락',
  '땡쿠',
  '공식',
  '레벨로그',
  '터놓고',
  '줍줍',
  '스모디',
  '모두모여라',
  '달록',
  '내편',
  '꼭꼭',
  '공책',
])

const CURRENT_GEN_5 = new Set([
  '코드봐줘',
  '놀토',
  'Thank you for ___',
  'GPU 내껀데',
  '깃-들다',
  '여기서 만나',
  '백중원',
  '찜꽁',
  'babble',
  '보고 또 보고',
  '다라쓰',
  '주절주절',
])

const LEGACY_PROJECTS = new Set([
  'Taggle',
  'Slidemd',
  '직고래',
  'Peloton',
  '도란도란',
  'CocktailPick',
  '우리 동네 캡짱',
  'Devbie',
  '미소',
  '새벽',
  'Seller, lee',
  'Hashtagmap',
])

const STAGE_ORDER = [
  '스케치 영상',
  '프로젝트 최종 데모',
  '프로젝트 5차 데모',
  '프로젝트 4차 데모',
  '프로젝트 3차 데모',
  '프로젝트 2차 데모',
  '프로젝트 1차 데모',
  '프로젝트 소개',
  '미니프로젝트',
  '비공개',
]

const CATEGORY_KEYWORDS = {
  problem_context: [
    '문제',
    '불편',
    '필요',
    '경험',
    '가치',
    '해결',
    '왜',
    '사용자',
  ],
  collaboration_culture: [
    '회고',
    '면담',
    '협업',
    '팀',
    '문화',
    '컨벤션',
    '성장',
    '모임',
    '스터디',
    '피드백',
  ],
  product_flow: [
    '기능',
    '서비스',
    '조회',
    '검색',
    '예약',
    '신청',
    '알림',
    '리뷰',
    '채팅',
    '공유',
    '기록',
    '메시지',
    '편지',
  ],
  performance_quality: [
    '성능',
    '최적화',
    '라이트하우스',
    'lighthouse',
    '번들',
    '이미지',
    '폰트',
    '로딩',
    '압축',
    '캐시',
    '인덱스',
    '쿼리',
    '부하',
    '측정',
  ],
  operations_infra: [
    '배포',
    '운영',
    '서버',
    '인프라',
    '관리자',
    '로그',
    '분석',
    '통계',
    '도메인',
    '문서',
    '리드미',
    '멀티 모듈',
    '웹소켓',
    '테스트',
    '접근성',
    'seo',
    '인증',
    '보안',
  ],
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function detectStage(title) {
  const match = title.match(/^\[([^\]]+)\]/)

  if (!match) {
    return '기타'
  }

  if (match[1] === 'Private video') {
    return '비공개'
  }

  return match[1]
}

function stripStagePrefix(title) {
  return normalizeWhitespace(title.replace(/^\[[^\]]+\]\s*/, ''))
}

function extractProjectName(title, stage) {
  if (stage === '비공개') {
    return '비공개 영상'
  }

  const body = stripStagePrefix(title)

  if (body.includes(' - ')) {
    return normalizeProjectName(body.split(' - ')[0])
  }

  const possessiveMatch = body.match(/^.+?(?:의|들의)\s*(.+)$/)

  if (possessiveMatch) {
    return normalizeProjectName(possessiveMatch[1])
  }

  const teamMatch = body.match(/^.+?team의\s*(.+)$/i)

  if (teamMatch) {
    return normalizeProjectName(teamMatch[1])
  }

  return normalizeProjectName(body)
}

function normalizeProjectName(rawName) {
  const value = normalizeWhitespace(rawName)

  const aliases = new Map([
    ['체크메이트', '체크 메이트'],
    ['체크메이트(구 모라고라)', '체크 메이트'],
    ['모라고라', '체크 메이트'],
    ['모두 모여라', '모두모여라'],
    ['우리동네캡짱', '우리 동네 캡짱'],
  ])

  const normalized = value.replace(/Thank you for___/g, 'Thank you for ___')

  return aliases.get(normalized) ?? normalized
}

function detectCohort(projectName, stage) {
  if (stage === '미니프로젝트') {
    return '미니프로젝트'
  }

  if (CURRENT_GEN_4.has(projectName)) {
    return '4기'
  }

  if (CURRENT_GEN_5.has(projectName)) {
    return '5기'
  }

  if (LEGACY_PROJECTS.has(projectName)) {
    return '초기 프로젝트'
  }

  return '기타'
}

async function readTranscript(entry) {
  const transcriptPath = path.join(
    cleanDir,
    `${String(entry.index).padStart(3, '0')}-${entry.id}.ko.txt`
  )

  try {
    const source = await fs.readFile(transcriptPath, 'utf8')
    return {
      transcriptPath,
      source,
      exists: true,
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        transcriptPath,
        source: '',
        exists: false,
      }
    }

    throw error
  }
}

function detectTranscriptStatus(source) {
  if (source.includes('비공개 영상')) {
    return 'private'
  }

  if (source.includes('HTTP 429')) {
    return 'rate_limited'
  }

  if (source.includes('자막 없음')) {
    return 'no_captions'
  }

  if (source.trim().length === 0) {
    return 'missing'
  }

  return 'ok'
}

function countKeyword(text, keyword) {
  const regex = new RegExp(escapeRegExp(keyword.toLowerCase()), 'gu')
  return (text.match(regex) ?? []).length
}

function collectCategoryCounts(source) {
  const normalized = source.toLowerCase()
  const counts = {}

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    counts[category] = keywords.reduce((sum, keyword) => sum + countKeyword(normalized, keyword), 0)
  }

  return counts
}

function topCategories(counts) {
  return Object.entries(counts)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category)
}

function lineCount(source) {
  return source.trim() ? source.trim().split('\n').length : 0
}

function stageSummary(entries) {
  const groups = new Map()

  for (const entry of entries) {
    const key = entry.stage
    const current = groups.get(key) ?? {
      stage: key,
      totalVideos: 0,
      transcriptOk: 0,
      transcriptUnavailable: 0,
      categoryMentions: Object.fromEntries(
        Object.keys(CATEGORY_KEYWORDS).map((category) => [category, 0])
      ),
    }

    current.totalVideos += 1

    if (entry.transcriptStatus === 'ok') {
      current.transcriptOk += 1

      for (const [category, count] of Object.entries(entry.categoryCounts)) {
        if (count > 0) {
          current.categoryMentions[category] += 1
        }
      }
    } else {
      current.transcriptUnavailable += 1
    }

    groups.set(key, current)
  }

  return [...groups.values()]
    .sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage))
    .map((group) => ({
      ...group,
      categoryMentionRates: Object.fromEntries(
        Object.entries(group.categoryMentions).map(([category, count]) => [
          category,
          group.transcriptOk === 0 ? 0 : Number((count / group.transcriptOk).toFixed(3)),
        ])
      ),
    }))
}

function cohortSummary(entries) {
  const groups = new Map()

  for (const entry of entries) {
    const key = entry.cohort
    const current = groups.get(key) ?? {
      cohort: key,
      totalVideos: 0,
      transcriptOk: 0,
      categoryMentions: Object.fromEntries(
        Object.keys(CATEGORY_KEYWORDS).map((category) => [category, 0])
      ),
    }

    current.totalVideos += 1

    if (entry.transcriptStatus === 'ok') {
      current.transcriptOk += 1

      for (const [category, count] of Object.entries(entry.categoryCounts)) {
        if (count > 0) {
          current.categoryMentions[category] += 1
        }
      }
    }

    groups.set(key, current)
  }

  return [...groups.values()].map((group) => ({
    ...group,
    categoryMentionRates: Object.fromEntries(
      Object.entries(group.categoryMentions).map(([category, count]) => [
        category,
        group.transcriptOk === 0 ? 0 : Number((count / group.transcriptOk).toFixed(3)),
      ])
    ),
  }))
}

function projectSummary(entries) {
  const groups = new Map()

  for (const entry of entries) {
    const current = groups.get(entry.projectName) ?? {
      projectName: entry.projectName,
      cohort: entry.cohort,
      videos: 0,
      stages: [],
      transcriptOk: 0,
      categoryCounts: Object.fromEntries(
        Object.keys(CATEGORY_KEYWORDS).map((category) => [category, 0])
      ),
    }

    current.videos += 1
    current.stages.push(entry.stage)

    if (entry.transcriptStatus === 'ok') {
      current.transcriptOk += 1

      for (const [category, count] of Object.entries(entry.categoryCounts)) {
        current.categoryCounts[category] += count
      }
    }

    groups.set(entry.projectName, current)
  }

  return [...groups.values()]
    .map((project) => ({
      ...project,
      stages: [...new Set(project.stages)],
      topCategories: topCategories(project.categoryCounts),
    }))
    .sort((a, b) => a.projectName.localeCompare(b.projectName, 'ko'))
}

async function main() {
  const playlist = JSON.parse(await fs.readFile(playlistPath, 'utf8'))
  const entries = []

  for (const item of playlist) {
    const stage = detectStage(item.title)
    const projectName = extractProjectName(item.title, stage)
    const cohort = detectCohort(projectName, stage)
    const transcript = await readTranscript(item)
    const transcriptStatus = detectTranscriptStatus(transcript.source)
    const categoryCounts =
      transcriptStatus === 'ok'
        ? collectCategoryCounts(transcript.source)
        : Object.fromEntries(Object.keys(CATEGORY_KEYWORDS).map((category) => [category, 0]))

    entries.push({
      index: item.index,
      id: item.id,
      title: item.title,
      duration: item.duration,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      stage,
      projectName,
      cohort,
      transcriptStatus,
      transcriptPath: path.relative(rootDir, transcript.transcriptPath),
      transcriptLineCount: lineCount(transcript.source),
      transcriptCharCount: transcript.source.length,
      categoryCounts,
      topCategories: transcriptStatus === 'ok' ? topCategories(categoryCounts) : [],
    })
  }

  const summary = {
    totalVideos: entries.length,
    transcriptOk: entries.filter((entry) => entry.transcriptStatus === 'ok').length,
    transcriptUnavailable: entries.filter((entry) => entry.transcriptStatus !== 'ok').length,
    transcriptStatusCounts: Object.fromEntries(
      [...new Set(entries.map((entry) => entry.transcriptStatus))]
        .sort()
        .map((status) => [
          status,
          entries.filter((entry) => entry.transcriptStatus === status).length,
        ])
    ),
  }

  const report = {
    generatedAt: new Date().toISOString(),
    summary,
    stageSummary: stageSummary(entries),
    cohortSummary: cohortSummary(entries),
    projectSummary: projectSummary(entries),
    entries,
  }

  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await fs.writeFile(contentDataPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(
    JSON.stringify(
      {
        outputPath: path.relative(rootDir, outputPath),
        contentDataPath: path.relative(rootDir, contentDataPath),
        totalVideos: summary.totalVideos,
        transcriptOk: summary.transcriptOk,
        transcriptUnavailable: summary.transcriptUnavailable,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

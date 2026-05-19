import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const playlistPath = path.join(rootDir, '.temp/vlog/playlist.json')
const cleanDir = path.join(rootDir, '.temp/vlog/clean')
const outputPath = path.join(rootDir, '.temp/vlog/report.json')
const contentDataPath = path.join(rootDir, 'content/education/conversations/vlog-data.json')

const CATEGORY_ORDER = [
  'day_life',
  'campus_space',
  'project_culture',
  'events_transition',
  'ops_support',
  'message_legacy',
]

const CATEGORY_META = {
  day_life: {
    label: '하루와 생활',
    description: '크루 개인의 하루와 팀 프로젝트의 루틴, 수업·점심·미션·협업 흐름을 볼 수 있는 묶음입니다.',
  },
  campus_space: {
    label: '캠퍼스와 공간',
    description: '선릉·잠실 캠퍼스의 자리, 동선, 식사, 학습 분위기처럼 공간의 공기를 먼저 보여주는 묶음입니다.',
  },
  project_culture: {
    label: '프로젝트와 발표',
    description: '테코톡, 데모데이, 프로젝트 비하인드처럼 발표 문화와 프로젝트 준비 과정을 엿볼 수 있는 묶음입니다.',
  },
  events_transition: {
    label: '행사와 전환',
    description: '방학식, 시상식, 마무리 이야기처럼 한 레벨이나 한 기수를 정리하며 남는 메시지를 볼 수 있는 묶음입니다.',
  },
  ops_support: {
    label: '운영과 지원',
    description: '리뷰·영상·서비스 근로팀처럼 우테코 운영을 뒤에서 받치는 역할을 소개하는 묶음입니다.',
  },
  message_legacy: {
    label: '메시지와 세대',
    description: '한 기수가 다음 기수에게 남기는 응원과 조언처럼 세대 전환의 메시지를 담은 묶음입니다.',
  },
}

const TRANSCRIPT_EXCEPTION_BY_ID = {
  eRffd42sd4I: {
    status: 'rate_limited',
    note: '자동 자막 수집 중 HTTP 429가 발생했습니다.',
  },
  '7Lie6YtzoUs': {
    status: 'no_captions',
    note: '요청 가능한 한국어 자동 자막이 없습니다.',
  },
}

const SUMMARY_OVERRIDE_BY_ID = {
  FaIe0OyEZ5w:
    '테코톡 발표 전 긴장, 예상 질문 준비, 발표 직후 소감까지 따라가며 우테코의 발표 문화를 보여줍니다.',
  BnzaxnWAHO0:
    '4기 레벨2를 마무리하며 크루들의 회고와 축하 분위기를 함께 볼 수 있는 행사 기록입니다.',
  'wS-W8oo9vXU':
    '4기 레벨1 방학식 현장을 따라가며 수상, 회고, 코치 메시지가 어떻게 오가는지 들을 수 있습니다.',
  '86QwjcRkSMc':
    '4기 시즌을 정리하는 마지막 브이로그로, 떠나는 분위기와 팀·크루 사이의 아쉬움을 보여줍니다.',
  D8OLeqFDS7M:
    '4기 레벨3 데모데이의 발표 공기와 프로젝트 소개 흐름을 짧고 선명하게 담은 하이라이트입니다.',
  xqjspN6PS_A:
    '3기 연말 시상식 후반부를 담아 축하 장면과 기수 말미의 분위기를 읽을 수 있습니다.',
  GeyNnIdwT0U:
    '3기 연말 시상식 전반부를 담아 수상과 소감, 한 해를 마무리하는 톤을 느낄 수 있습니다.',
  eRffd42sd4I:
    '3기 데모데이 현장을 짧게 압축한 하이라이트 영상입니다.',
  ZQklkmFlYQI:
    '프로젝트 발표와 팀 선택을 앞둔 크루들의 분위기, 아이디어, 인터뷰를 따라가는 비하인드 영상입니다.',
  tpdrVhMEqMQ:
    '우테코를 마무리하며 남는 감정, 관계, 성장의 언어를 차분하게 들을 수 있는 정리 영상입니다.',
  w4m52z2IuBs:
    '우테코를 마무리하는 시점에 코치와 크루가 무엇을 남기고 싶은지 돌아보는 영상입니다.',
  kG5whDnMcqs:
    '리뷰 근로팀이 무엇을 기록하고 어떤 방식으로 우테코 운영을 돕는지 소개합니다.',
  ehVHCulY5wE:
    '영상 근로팀이 어떤 장비와 작업으로 우테코의 기록을 만드는지 짧게 소개합니다.',
  zefknOpaRXw:
    '서비스 근로팀이 블로그와 서비스 운영을 어떻게 맡는지 보여주는 소개 영상입니다.',
  BgaUJqZFFCU:
    '온라인으로 진행된 방학식 기록으로, 원격 시기의 소통 방식과 행사 분위기를 함께 보여줍니다.',
  Xm0SmqBGaBA:
    '1기가 2기에게 응원과 조언을 전하며 우테코의 세대 간 연결감을 보여주는 메시지 영상입니다.',
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

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

function normalizeTitle(title) {
  return title
    .replace(/^\[[^\]]+\]\s*/u, '')
    .replace(/[☀️🎬🎥📝💻🎞👾✉️🧑‍💻👩‍💻🌴]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanTag(tag) {
  return tag.replace(/\s+/g, ' ').trim()
}

function extractTeamName(title) {
  const match = normalizeTitle(title).match(/우테코\s*\d+기\s*(.+?)팀의 하루/u)
  return match ? cleanTag(match[1]) : null
}

function extractPersonName(title) {
  const match = normalizeTitle(title).match(/Ep\.\s*\d+\s+(.+?)의 하루/u)
  return match ? cleanTag(match[1]) : null
}

function detectCategoryId(title) {
  const normalized = normalizeTitle(title)

  if (normalized.includes('메세지')) {
    return 'message_legacy'
  }

  if (normalized.includes('근로팀을 소개합니다')) {
    return 'ops_support'
  }

  if (normalized.includes('캠퍼스 이야기')) {
    return 'campus_space'
  }

  if (
    normalized.includes('방학식') ||
    normalized.includes('시상식') ||
    normalized.includes('마무리 이야기') ||
    normalized.includes('마지막 브이로그')
  ) {
    return 'events_transition'
  }

  if (
    normalized.includes('테코톡') ||
    normalized.includes('데모데이') ||
    normalized.includes('프로젝트 비하인드')
  ) {
    return 'project_culture'
  }

  if (normalized.includes('의 하루')) {
    return 'day_life'
  }

  return 'events_transition'
}

function detectEra(title, index) {
  const normalized = normalizeTitle(title)

  if (normalized.includes('4기')) {
    return '4기'
  }

  if (normalized.includes('3기')) {
    return '3기'
  }

  if (normalized.includes('1기가 2기에게')) {
    return '1기→2기'
  }

  if (index >= 15 && index <= 27) {
    return '기수 미표기'
  }

  return '기수 미표기'
}

function buildTags(title, categoryId) {
  const normalized = normalizeTitle(title)

  if (categoryId === 'message_legacy') {
    return ['선배 메시지', '세대 전환', '응원']
  }

  if (categoryId === 'ops_support') {
    if (normalized.includes('리뷰')) {
      return ['리뷰', '운영팀', '지원']
    }
    if (normalized.includes('영상')) {
      return ['영상', '운영팀', '기록']
    }
    return ['서비스', '운영팀', '지원']
  }

  if (categoryId === 'campus_space') {
    if (normalized.includes('잠실')) {
      return ['잠실 캠퍼스', '캠퍼스', '학습 환경']
    }
    return ['선릉 캠퍼스', '캠퍼스', '학습 환경']
  }

  if (categoryId === 'project_culture') {
    if (normalized.includes('테코톡')) {
      return ['테코톡', '발표', 'Q&A', '준비 과정']
    }
    if (normalized.includes('프로젝트 비하인드')) {
      return ['프로젝트 비하인드', '프로젝트 주제', '인터뷰']
    }
    return ['데모데이', '프로젝트 발표', '발표 문화']
  }

  if (categoryId === 'events_transition') {
    if (normalized.includes('방학식')) {
      return normalized.includes('온라인')
        ? ['방학식', '온라인', '회고', '코치 메시지']
        : ['방학식', '회고', '코치 메시지', '수상']
    }
    if (normalized.includes('시상식')) {
      return ['시상식', '연말', '회고', '축하']
    }
    if (normalized.includes('마지막 브이로그')) {
      return ['마무리', '작별', '4기']
    }
    return ['마무리', '회고', '관계']
  }

  const teamName = extractTeamName(normalized)

  if (teamName) {
    return [teamName, '팀 하루', '프로젝트 일상', '협업']
  }

  const personName = extractPersonName(normalized)

  if (personName) {
    if (normalized.includes('Jeju')) {
      return [personName, '개인 하루', '제주', '브이로그']
    }

    return [personName, '개인 하루', '학습 루틴', '프로젝트']
  }

  return ['우테코', '브이로그']
}

function buildSummary(title, categoryId) {
  const override = SUMMARY_OVERRIDE_BY_ID[title.id]

  if (override) {
    return override
  }

  const normalized = normalizeTitle(title.title)
  const teamName = extractTeamName(title.title)
  const personName = extractPersonName(title.title)

  if (categoryId === 'campus_space') {
    return `${normalized.replace('우테코 ', '')}를 따라가며 공간의 분위기와 학습 리듬을 먼저 읽을 수 있습니다.`
  }

  if (categoryId === 'day_life' && teamName) {
    return `${teamName}팀이 하루 동안 어떻게 협업하고 프로젝트를 굴리는지 따라가는 팀 브이로그입니다.`
  }

  if (categoryId === 'day_life' && personName) {
    return `${personName} 크루의 수업, 점심, 미션, 프로젝트 루틴을 따라가며 우테코의 하루 리듬을 보여줍니다.`
  }

  if (categoryId === 'project_culture') {
    return `${normalized} 현장을 통해 프로젝트와 발표 문화의 결을 빠르게 훑어볼 수 있습니다.`
  }

  if (categoryId === 'events_transition') {
    return `${normalized}를 통해 한 레벨 또는 한 기수를 정리하는 행사 분위기와 남는 메시지를 볼 수 있습니다.`
  }

  if (categoryId === 'ops_support') {
    return `${normalized}를 통해 우테코 운영을 돕는 역할이 무엇인지 빠르게 이해할 수 있습니다.`
  }

  return `${normalized}에서 우테코의 분위기와 메시지를 확인할 수 있습니다.`
}

function buildAudienceNeeds(title, categoryId) {
  const normalized = normalizeTitle(title)

  if (categoryId === 'campus_space') {
    return ['캠퍼스 분위기가 궁금하다', '어디서 어떻게 배우는지 보고 싶다']
  }

  if (categoryId === 'project_culture') {
    if (normalized.includes('테코톡')) {
      return ['테코톡이 어떻게 진행되는지 궁금하다', '발표 준비 분위기를 보고 싶다']
    }

    if (normalized.includes('프로젝트 비하인드')) {
      return ['프로젝트 시작 전 분위기가 궁금하다', '무슨 아이디어가 오가는지 보고 싶다']
    }

    return ['데모데이 분위기가 궁금하다', '프로젝트 발표 문화를 보고 싶다']
  }

  if (categoryId === 'events_transition') {
    if (normalized.includes('방학식')) {
      return ['레벨 마무리 행사가 궁금하다', '코치 메시지를 듣고 싶다']
    }

    if (normalized.includes('시상식')) {
      return ['연말 행사 분위기가 궁금하다', '기수 말미의 공기가 궁금하다']
    }

    return ['우테코를 마무리할 때 남는 감정이 궁금하다', '기수의 마지막 분위기를 보고 싶다']
  }

  if (categoryId === 'ops_support') {
    return ['운영을 돕는 사람들은 무슨 일을 하는지 궁금하다']
  }

  if (categoryId === 'message_legacy') {
    return ['선배가 후배에게 어떤 말을 남기는지 궁금하다']
  }

  if (extractTeamName(title)) {
    return ['팀 프로젝트의 하루가 궁금하다', '협업 분위기를 보고 싶다']
  }

  return ['우테코에서 하루가 어떻게 흘러가는지 궁금하다']
}

async function readTranscript(index, id) {
  const transcriptPath = path.join(cleanDir, `${String(index).padStart(2, '0')}-${id}.ko.txt`)

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

function detectTranscriptStatus(id, exists) {
  if (exists) {
    return {
      status: 'ok',
      label: '정리본 있음',
      note: '',
    }
  }

  const exception = TRANSCRIPT_EXCEPTION_BY_ID[id]

  if (exception) {
    return {
      status: exception.status,
      label: exception.status === 'rate_limited' ? '재수집 필요' : '자막 없음',
      note: exception.note,
    }
  }

  return {
    status: 'missing',
    label: '정리본 없음',
    note: '정리본을 아직 수집하지 못했습니다.',
  }
}

function lineCount(source) {
  return source.trim() ? source.trim().split('\n').length : 0
}

function countMap(values) {
  return values.reduce((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1
    return acc
  }, {})
}

async function main() {
  const playlist = JSON.parse(await fs.readFile(playlistPath, 'utf8'))
  const entries = []

  for (const [offset, item] of playlist.entries.entries()) {
    const index = offset + 1
    const transcript = await readTranscript(index, item.id)
    const transcriptStatus = detectTranscriptStatus(item.id, transcript.exists)
    const categoryId = detectCategoryId(item.title)
    const tags = buildTags(item.title, categoryId)
    const era = detectEra(item.title, index)

    entries.push({
      index,
      id: item.id,
      title: normalizeTitle(item.title),
      rawTitle: item.title,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      durationSeconds: item.duration,
      duration: formatClock(item.duration),
      categoryId,
      categoryLabel: CATEGORY_META[categoryId].label,
      era,
      tags,
      summary: buildSummary(item, categoryId),
      audienceNeeds: buildAudienceNeeds(item.title, categoryId),
      transcriptStatus: transcriptStatus.status,
      transcriptStatusLabel: transcriptStatus.label,
      transcriptNote: transcriptStatus.note,
      transcriptPath: transcript.exists
        ? path.relative(rootDir, transcript.transcriptPath)
        : null,
      transcriptLineCount: lineCount(transcript.source),
      transcriptCharCount: transcript.source.length,
      searchText: [normalizeTitle(item.title), CATEGORY_META[categoryId].label, ...tags]
        .join(' ')
        .toLowerCase(),
    })
  }

  const totalDurationSeconds = entries.reduce((sum, entry) => sum + entry.durationSeconds, 0)
  const transcriptOk = entries.filter((entry) => entry.transcriptStatus === 'ok').length
  const transcriptUnavailable = entries.length - transcriptOk
  const categoryCounts = countMap(entries.map((entry) => entry.categoryId))
  const tagCounts = countMap(entries.flatMap((entry) => entry.tags))

  const categories = CATEGORY_ORDER.map((id) => ({
    id,
    ...CATEGORY_META[id],
    count: categoryCounts[id] ?? 0,
  }))

  const questionPaths = [
    {
      question: '우테코에서 하루가 어떻게 흘러가는지 궁금하다',
      entryIds: ['gh8D550NlRc', '-wNPwne8jJk', 'unVia11bC78'],
      why: '개인 브이로그를 보면 수업, 점심, 미션, 프로젝트가 하루 안에서 어떻게 연결되는지 감이 옵니다.',
    },
    {
      question: '팀 프로젝트는 어떤 분위기로 굴러가는지 궁금하다',
      entryIds: ['dx_1loDD-UM', 'ARcJOFjuNGU', 'ZQklkmFlYQI'],
      why: '팀 하루 영상과 프로젝트 비하인드를 이어 보면 협업과 발표 준비의 흐름이 더 잘 보입니다.',
    },
    {
      question: '캠퍼스 공간과 학습 환경이 궁금하다',
      entryIds: ['fb3z6Fe5u_k', '1QvyX3rPp0E'],
      why: '잠실과 선릉 캠퍼스 이야기가 각각 공간의 결을 보여주는 가장 직접적인 입구입니다.',
    },
    {
      question: '발표 문화와 테코톡·데모데이가 궁금하다',
      entryIds: ['FaIe0OyEZ5w', 'D8OLeqFDS7M', 'eRffd42sd4I'],
      why: '테코톡 발표 준비와 데모데이 하이라이트를 함께 보면 우테코 발표 문화의 톤을 빠르게 잡을 수 있습니다.',
    },
    {
      question: '행사에서는 어떤 메시지가 오가는지 궁금하다',
      entryIds: ['wS-W8oo9vXU', 'GeyNnIdwT0U', 'BgaUJqZFFCU'],
      why: '방학식·시상식·온라인 행사 기록을 보면 회고와 축하, 코치 메시지가 어떻게 섞이는지 읽을 수 있습니다.',
    },
    {
      question: '우테코를 마무리할 때 남는 감정이 궁금하다',
      entryIds: ['86QwjcRkSMc', 'w4m52z2IuBs', 'tpdrVhMEqMQ'],
      why: '마지막 브이로그와 마무리 이야기 두 편이 기수 끝무렵의 감정을 가장 잘 보여줍니다.',
    },
    {
      question: '운영을 돕는 사람들은 어떤 일을 하는지 궁금하다',
      entryIds: ['kG5whDnMcqs', 'ehVHCulY5wE', 'zefknOpaRXw'],
      why: '리뷰·영상·서비스 근로팀 소개 세 편을 보면 우테코 운영 뒤편의 역할 분담이 보입니다.',
    },
    {
      question: '선배가 후배에게 남기는 말이 궁금하다',
      entryIds: ['Xm0SmqBGaBA'],
      why: '1기가 2기에게 전하는 메시지는 세대 간 연결감이 가장 직접적으로 드러나는 영상입니다.',
    },
  ].map((pathInfo) => ({
    ...pathInfo,
    entries: pathInfo.entryIds.map((id) => entries.find((entry) => entry.id === id)).filter(Boolean),
  }))

  const report = {
    generatedAt: new Date().toISOString(),
    playlist: {
      id: playlist.id,
      title: playlist.title,
      url: playlist.original_url,
      channel: playlist.channel,
      totalVideos: entries.length,
      totalDurationSeconds,
      totalDurationLabel: formatDuration(totalDurationSeconds),
    },
    summary: {
      totalVideos: entries.length,
      totalDurationSeconds,
      totalDurationLabel: formatDuration(totalDurationSeconds),
      transcriptOk,
      transcriptUnavailable,
      transcriptStatusCounts: countMap(entries.map((entry) => entry.transcriptStatus)),
      categoryCounts,
      tagCounts,
    },
    categories,
    questionPaths,
    entries,
  }

  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  await fs.writeFile(contentDataPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(
    JSON.stringify(
      {
        outputPath: path.relative(rootDir, outputPath),
        contentDataPath: path.relative(rootDir, contentDataPath),
        totalVideos: report.summary.totalVideos,
        transcriptOk: report.summary.transcriptOk,
        transcriptUnavailable: report.summary.transcriptUnavailable,
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

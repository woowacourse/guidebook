import fs from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const inputPath = path.resolve(rootDir, process.argv[2] ?? '.temp/techtalk/playlist.json')
const outputPath = path.resolve(
  rootDir,
  process.argv[3] ?? 'content/education/conversations/techtalk-data.json',
)

const PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLgXGHBqgT2TvpJ_p9L_yZKPifgdBOzdVH'

const EMOJI_PATTERN =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu

const CATEGORY_DEFINITIONS = [
  {
    id: 'server-backend',
    name: '서버·스프링',
    description:
      'Spring, Servlet, MVC, JPA, 인증/인가, 트랜잭션처럼 백엔드 애플리케이션 구조를 다루는 발표',
    focusKeywords: ['Spring', 'JPA/JDBC', 'Servlet', '트랜잭션', '인증/인가'],
    score(text) {
      return weightedScore(text, [
        [/spring\s*boot|springboot|spring batch|spring security|spring webflux|spring websocket/gi, 4],
        [/\bspring\b|스프링/gi, 3],
        [/\bservlet\b|tomcat|was|web server|웹서버/gi, 3],
        [/\bmvc\b|controller|rest api|restdocs|swagger/gi, 2],
        [/\bjpa\b|\bjdbc\b|sql mapper|orm\b|hibernate/gi, 3],
        [/\bbean\b|ioc|di\b|의존성 주입|\baop\b/gi, 2],
        [/트랜잭션|transaction|인증|인가|oauth|security|responsebody|responseentity|connection pool|keep-alive|영속성 컨텍스트/gi, 2],
        [/mdc|멱등성|서킷브레이커|restful|쿠키와 세션|cookie|session/gi, 2],
      ])
    },
  },
  {
    id: 'frontend-web',
    name: '프론트엔드·웹',
    description:
      'React, 브라우저 렌더링, CSS, 컴포넌트 설계, 접근성, 상태관리처럼 웹 프론트엔드 감각을 키우는 발표',
    focusKeywords: ['React', '브라우저', '렌더링', '컴포넌트', '접근성'],
    score(text) {
      return weightedScore(text, [
        [/\breact\b|리액트|react query|tanstack query|react fiber|react hooks/gi, 4],
        [/\bbrowser\b|브라우저|dom\b|bom\b|virtual dom|custom hook|suspense|error boundary|에러바운더리/gi, 3],
        [/렌더링|render|csr|ssr|hydration/gi, 3],
        [/\bcss\b|layout|animation|responsive|semantic|메타 태그|meta 태그/gi, 2],
        [/프론트엔드|frontend|component|컴포넌트|jsx|ui\b|ux\b|web animation|interactive|인터랙티브/gi, 2],
        [/접근성|accessibility|screen reader|스크린 리더|history api|ajax|pwa|무한 스크롤|pagination|seo|검색 엔진 최적화/gi, 2],
        [/usestate|useeffect|usereducer|hooks|context|createportal|상태관리|webpack|babel|spa|design system|디자인시스템|display|debouncing|throttling|번들사이즈/gi, 2],
      ])
    },
  },
  {
    id: 'mobile-android',
    name: '모바일·안드로이드',
    description:
      'Android 컴포넌트, Kotlin Flow, Compose, Activity/Fragment, Notification처럼 모바일 앱 개발에 가까운 발표',
    focusKeywords: ['안드로이드', 'Kotlin', 'Compose', 'Activity', 'Coroutine'],
    score(text) {
      return weightedScore(text, [
        [/안드로이드|android/gi, 4],
        [/\bkotlin\b|코틀린|kotlin flow|coroutine|코루틴/gi, 3],
        [/\bcompose\b|jetpack compose/gi, 3],
        [/activity|fragment|viewmodel|livedata|databinding|recyclerview|retrofit|mvvm|room|sqlite|fcm/gi, 3],
        [/notification|permission|service\b|handler|looper|modifier|hilt|espresso|fcm/gi, 2],
      ])
    },
  },
  {
    id: 'database-storage',
    name: '데이터베이스·저장소',
    description:
      'MySQL, Redis, 인덱스, 정규화, 락, 샤딩, 검색처럼 데이터 저장과 조회 성능에 초점이 맞는 발표',
    focusKeywords: ['MySQL', 'Redis', '인덱스', '정규화', '락'],
    score(text) {
      return weightedScore(text, [
        [/\bmysql\b|innodb|optimizer|스토리지 엔진|storage engine/gi, 4],
        [/\bredis\b|cache\b|캐시/gi, 3],
        [/database|데이터베이스|\bdb\b|정규화|normalization/gi, 3],
        [/index|인덱스|검색 인덱스|query tuning|쿼리 튜닝/gi, 3],
        [/lock\b|락\b|replication|sharding|clustering|elasticsearch/gi, 3],
        [/sql\b|nosql|storage|파일 저장소|전문 검색|flyway|entitymanager|영속성 컨텍스트/gi, 2],
      ])
    },
  },
  {
    id: 'network-os-concurrency',
    name: '네트워크·운영체제·동시성',
    description:
      'HTTP, TCP/IP, DNS, Process/Thread, Event Loop, JVM, GC처럼 시스템 동작 원리를 다루는 발표',
    focusKeywords: ['HTTP', 'TCP/IP', 'Process/Thread', 'JVM', 'GC'],
    score(text) {
      return weightedScore(text, [
        [/\bhttp\b|\bhttps\b|dns|tcp\/ip|\btcp\b|\budp\b|osi|quic|arp|socket|websocket|웹소켓|server sent events|realtime web|polling/gi, 4],
        [/process|thread|race condition|event loop|blocking|non-blocking|sync|async|concurrency|동시성/gi, 4],
        [/\bjvm\b|gc\b|garbage|heap|stack|memory|class loader|class path|가상 메모리/gi, 3],
        [/리눅스|linux|filesystem|file system|\bio\b|시간복잡도|algorithm|알고리즘|hash table|자료구조|semaphore|mutex|네트워크 기초|데이터 통신/gi, 3],
        [/execution context|실행 컨텍스트|가상 스레드|virtual thread|ip\b|latency|bandwidth|요청과 응답|응답과 요청|웹 통신의 흐름/gi, 2],
      ])
    },
  },
  {
    id: 'infra-security',
    name: '인프라·배포·보안',
    description:
      'AWS, Docker, Nginx, Terraform, CI/CD, 무중단 배포, CORS, XSS, SSRF처럼 운영과 보안을 다루는 발표',
    focusKeywords: ['AWS', 'Docker', '배포', 'Nginx', '보안'],
    score(text) {
      return weightedScore(text, [
        [/\baws\b|private subnet|terraform|docker|nginx|apache|kubernetes/gi, 4],
        [/배포|deploy|ci\/cd|github actions|무중단/gi, 4],
        [/cors|xss|ssrf|보안|비밀번호|security|oauth 2|oauth2/gi, 3],
        [/proxy|load balancer|포트포워딩|scale up|scale out|spof|tls|암호|난독화|엔진엑스/gi, 3],
        [/cloud|infra|인프라|클라우드|컨테이너|가상화|swarm|compose/gi, 2],
      ])
    },
  },
  {
    id: 'architecture-patterns',
    name: '설계·아키텍처·패턴',
    description:
      '객체지향, 설계 패턴, DDD, 이벤트 스토밍, DI/IoC, 상속과 조합처럼 구조적 사고를 다루는 발표',
    focusKeywords: ['객체지향', '패턴', 'DDD', 'DI/IoC', '상속과 조합'],
    score(text) {
      return weightedScore(text, [
        [/객체지향|oop|object oriented|도메인 주도 설계|ddd/gi, 4],
        [/event storming|event sourcing|아키텍처|architecture/gi, 3],
        [/전략 패턴|전략패턴|factory|상태 패턴|state pattern|prototype|mvc pattern|pattern|디자인 패턴/gi, 3],
        [/상속|조합|composition|framework vs library|프레임워크 vs 라이브러리|solid|ocp/gi, 3],
        [/\bioc\b|\bdi\b|의존성 주입|좋은 코드|유지보수|구조 설계|dto vs vo|api vs library vs framework|auto configuration/gi, 2],
        [/함수형 프로그래밍|불변성|singleton|정적 클래스|enum|uml/gi, 2],
      ])
    },
  },
  {
    id: 'testing-quality',
    name: '테스트·품질',
    description:
      'JUnit, TDD, 테스트 전략, 성능 측정, 로깅, 메트릭, 디버깅처럼 품질을 높이는 발표',
    focusKeywords: ['테스트', 'TDD', 'JUnit', '로깅', '메트릭'],
    score(text) {
      return weightedScore(text, [
        [/\btest\b|테스트|tdd|unit tests|junit/gi, 4],
        [/성능 테스트|performance test|품질|error boundary|에러 처리/gi, 3],
        [/logging|로깅|metric|metrics|observability|monitoring/gi, 3],
        [/debug|debugging|restdocs|rest docs|swagger|mock|msw|디버깅/gi, 2],
      ])
    },
  },
  {
    id: 'language-runtime',
    name: '언어·런타임',
    description:
      'Java, JavaScript, TypeScript, Kotlin 문법과 실행 모델, 제네릭, 람다, 프로토타입 같은 기초 발표',
    focusKeywords: ['Java', 'JavaScript', 'TypeScript', 'Kotlin', '제네릭'],
    score(text) {
      return weightedScore(text, [
        [/\bjava\b|modern java|record|annotation|reflection|object class|stream\b|jcf\b|직렬화/gi, 4],
        [/javascript|ecmascript|prototype|closure|this\b|generator|async\/await|비동기 프로그래밍|자바스크립트 동작 원리/gi, 4],
        [/typescript|type script|interface|generics|제네릭/gi, 4],
        [/\bkotlin\b|scope function|final과 불변|불변 객체|예외|exception|람다|이터레이터|제네레이터|동일성과 동등성/gi, 3],
        [/xml|json|class\b|scope\b|context란|정규 표현식|callback|var let const|데이터타입|parameter|argument/gi, 2],
      ])
    },
  },
  {
    id: 'devtools-collaboration-ai',
    name: '개발도구·협업·AI',
    description:
      'Git, Gradle, 빌드 도구, 문서화, 페어 프로그래밍, 생성형 AI, MCP처럼 개발 워크플로우를 다루는 발표',
    focusKeywords: ['Git', 'Gradle', '빌드', '협업', 'AI'],
    score(text) {
      return weightedScore(text, [
        [/\bgit\b|github actions|merge|rebase|cherry pick|branch/gi, 4],
        [/gradle|빌드|build|모듈 번들러|번들러|intellij debugging|debugging/gi, 4],
        [/페어 프로그래밍|함께 자라기|문서|documentation|협업|소통/gi, 3],
        [/생성형 ai|mcp|ai\b|chrome extension|개발문서/gi, 3],
        [/랜덤|metric|낭만개발자|애자일|lean startup|package manager|eslint/gi, 2],
      ])
    },
  },
  {
    id: 'misc-experiments',
    name: '기타·실험',
    description:
      '프로젝트 소개나 실험성 발표처럼 제목만으로 분류가 어려운 콘텐츠',
    focusKeywords: ['실험', '프로젝트', '기타'],
    score() {
      return 0
    },
  },
]

const TAG_DEFINITIONS = [
  { label: 'Spring', pattern: /\bspring\b|스프링|springboot|spring boot/gi },
  { label: 'JPA/JDBC', pattern: /\bjpa\b|\bjdbc\b|sql mapper|orm\b/gi },
  { label: 'React', pattern: /\breact\b|리액트|react query|tanstack query|react hooks|react fiber/gi },
  { label: '브라우저', pattern: /\bbrowser\b|브라우저|dom\b|bom\b|virtual dom/gi },
  { label: '렌더링', pattern: /render|렌더링|csr|ssr|hydration/gi },
  { label: '컴포넌트', pattern: /component|컴포넌트|jsx|ui\b|ux\b|layout/gi },
  { label: '안드로이드', pattern: /android|안드로이드/gi },
  { label: 'Kotlin', pattern: /\bkotlin\b|코틀린|kotlin flow|coroutine|코루틴/gi },
  { label: 'MySQL', pattern: /\bmysql\b|innodb|optimizer/gi },
  { label: 'Redis', pattern: /\bredis\b|cache\b|캐시/gi },
  { label: '인덱스', pattern: /index|인덱스/gi },
  { label: 'HTTP', pattern: /\bhttp\b|\bhttps\b|quic/gi },
  { label: '웹소켓', pattern: /websocket|web socket|stomp/gi },
  { label: 'DNS/TCP', pattern: /dns|tcp\/ip|\btcp\b|\budp\b|osi|arp/gi },
  { label: 'Thread', pattern: /process|thread|blocking|non-blocking|sync|async|event loop/gi },
  { label: 'JVM/GC', pattern: /\bjvm\b|gc\b|garbage|heap|stack|memory/gi },
  { label: 'AWS/Docker', pattern: /\baws\b|docker|terraform|private subnet|nginx|apache/gi },
  { label: '배포', pattern: /배포|deploy|ci\/cd|무중단|github actions/gi },
  { label: '보안', pattern: /oauth|cors|xss|ssrf|보안|security|비밀번호/gi },
  { label: '테스트', pattern: /test|테스트|tdd|junit/gi },
  { label: '로깅/메트릭', pattern: /logging|로깅|metric|metrics|observability|monitoring/gi },
  { label: '패턴', pattern: /pattern|패턴|factory|state pattern|prototype/gi },
  { label: '객체지향', pattern: /객체지향|oop|object oriented|상속|조합|composition/gi },
  { label: '아키텍처', pattern: /architecture|아키텍처|ddd|event storming|event sourcing|framework vs library/gi },
  { label: 'Java', pattern: /\bjava\b|modern java|record|stream\b|annotation|reflection|object class|jcf/gi },
  { label: 'JavaScript', pattern: /javascript|ecmascript|prototype|closure|this\b|generator|async\/await/gi },
  { label: 'TypeScript', pattern: /typescript|type script|interface|generics|제네릭/gi },
  { label: 'Git', pattern: /\bgit\b|merge|rebase|cherry pick|branch/gi },
  { label: '빌드도구', pattern: /gradle|빌드|build|번들러|bundle|intellij debugging/gi },
  { label: '협업', pattern: /협업|소통|페어 프로그래밍|함께 자라기|문서/gi },
  { label: 'AI/MCP', pattern: /생성형 ai|mcp|ai\b/gi },
]

function weightedScore(text, rules) {
  return rules.reduce((score, [pattern, weight]) => {
    const matches = text.match(pattern)
    return matches ? score + matches.length * weight : score
  }, 0)
}

function stripTitlePrefix(title) {
  return title
    .replace(/^\[[^\]]+\]\s*/u, '')
    .replace(EMOJI_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseTitle(title) {
  const cleanTitle = stripTitlePrefix(title)

  if (!cleanTitle) {
    return {
      cleanTitle: '제목 미상',
      speaker: '',
      topic: '제목 미상',
    }
  }

  const possessiveMatch =
    cleanTitle.match(/^(.+?)(?:의|['’]s)\s+(.+)$/u) ??
    cleanTitle.match(/^(.+?)와\s+(.+)$/u)

  if (!possessiveMatch) {
    return {
      cleanTitle,
      speaker: '',
      topic: cleanTitle,
    }
  }

  const [, speaker, topic] = possessiveMatch

  return {
    cleanTitle,
    speaker: speaker.trim(),
    topic: topic.trim(),
  }
}

function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0:00'
  }

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function extractTags(text) {
  return TAG_DEFINITIONS.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label)
}

function categorize(text) {
  let selected = CATEGORY_DEFINITIONS[CATEGORY_DEFINITIONS.length - 1]
  let bestScore = 0

  for (const definition of CATEGORY_DEFINITIONS.slice(0, -1)) {
    const score = definition.score(text)

    if (score > bestScore) {
      selected = definition
      bestScore = score
    }
  }

  return selected
}

function topItemsByCount(map, limit = 6) {
  return [...map.entries()]
    .sort((a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]
      }
      return a[0].localeCompare(b[0], 'ko')
    })
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }))
}

async function main() {
  const source = JSON.parse(await fs.readFile(inputPath, 'utf8'))
  const entries = (source.entries ?? []).map((entry, index) => {
    const { cleanTitle, speaker, topic } = parseTitle(entry.title ?? '')
    const searchableText = `${cleanTitle} ${topic}`.toLowerCase()
    const category = categorize(searchableText)
    const tags = extractTags(searchableText).slice(0, 5)

    return {
      index: index + 1,
      id: entry.id,
      title: cleanTitle,
      speaker,
      topic,
      duration: formatDuration(entry.duration ?? 0),
      durationSeconds: entry.duration ?? 0,
      viewCount: entry.view_count ?? 0,
      url: entry.url ?? `https://www.youtube.com/watch?v=${entry.id}`,
      categoryId: category.id,
      tags,
    }
  })

  const categoryReports = CATEGORY_DEFINITIONS.map((definition) => {
    const categoryEntries = entries.filter((entry) => entry.categoryId === definition.id)
    const tagCounts = new Map()

    for (const entry of categoryEntries) {
      for (const tag of entry.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
      }
    }

    const rankedEntries = categoryEntries
      .slice()
      .sort((a, b) => {
        const aBonus = a.speaker ? 1 : 0
        const bBonus = b.speaker ? 1 : 0

        if (bBonus !== aBonus) {
          return bBonus - aBonus
        }

        if (b.viewCount !== a.viewCount) {
          return b.viewCount - a.viewCount
        }

        return a.index - b.index
      })

    return {
      id: definition.id,
      name: definition.name,
      description: definition.description,
      focusKeywords: definition.focusKeywords,
      count: categoryEntries.length,
      topTags: topItemsByCount(tagCounts, 6),
      recommendations: rankedEntries
        .slice(0, 3)
        .map(({ id, title, topic, speaker, url, viewCount }) => ({
          id,
          title,
          topic,
          speaker,
          url,
          viewCount,
        })),
    }
  }).filter((category) => category.count > 0)

  const tagCounts = new Map()
  for (const entry of entries) {
    for (const tag of entry.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1)
    }
  }

  const totalSeconds = entries.reduce((sum, entry) => sum + entry.durationSeconds, 0)
  const totalHours = Math.floor(totalSeconds / 3600)
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60)

  const report = {
    source: {
      playlistTitle: source.title,
      playlistUrl: PLAYLIST_URL,
      channelTitle: source.channel,
      generatedAt: new Date().toISOString(),
    },
    summary: {
      totalVideos: entries.length,
      totalSeconds,
      totalDuration: `${totalHours}시간 ${totalMinutes}분`,
      topTags: topItemsByCount(tagCounts, 16),
    },
    categories: categoryReports,
    entries,
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(
    JSON.stringify(
      {
        outputPath: path.relative(rootDir, outputPath),
        totalVideos: report.summary.totalVideos,
        totalDuration: report.summary.totalDuration,
        categories: categoryReports.map(({ id, count }) => ({ id, count })),
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

# AGENTS.md

LLM 에이전트(Claude Code, Codex, Cursor, 기타)가 이 저장소를 읽고 기여할 때 따르는 규약.

## 이 저장소가 뭔가요?

우아한테크코스의 교육 철학·검증된 패턴·커리큘럼·실험 로그를 모은 공식 가이드북. Nextra 4 + Next.js 15 App Router 기반.
세부 워크플로우와 데이터 구조는 [`CLAUDE.md`](./CLAUDE.md), 외부 LLM이 빠르게 훑을 카탈로그는 [`public/llms.txt`](./public/llms.txt) 참고.

## 3계층 컨텐츠 구조 (Karpathy LLM Wiki 패턴)

- **Raw sources** — `content/education/logs/` (매주 추가되는 실험 로그). 직접 수정 지양, 새 로그 추가는 `/로그추가` 사용.
- **Wiki pages** — `content/education/{philosophy,curriculum,insights,tools}/`. 실험 로그에서 추출·승격된 안정화된 지식.
- **Schema** — `CLAUDE.md`, `.claude/conventions/`, `.claude/promotion-rubric.md`, `.claude/log-quality-rubric.md`.

> 원본 raw 1차자료와 합성 wiki 노트는 별도 비공개 정본 repo `woowacourse-projects/llm-wiki`(로컬 `./llm-wiki/`, gitignore)에 있다. 이 repo의 `content/`는 거기서 분석·정리한 **발행 문서**다. 원본 위키 작업은 `/위키흡수·정제·점검·질의`, 발행 문서 lint는 `/위키정리`.

## 기여 시 따라야 할 규약

### 1. 새 페이지를 만들 때

- 템플릿을 복사한다: `.claude/templates/{insight,design-pattern,tool}-template.mdx`
- frontmatter는 `.claude/conventions/frontmatter-spec.md` 를 따른다 (필수: `id`, `summary`, `last_verified`).
- 새 페이지는 해당 디렉토리의 `_meta.ts` 와 (랜딩에 노출이 필요하면) `content/updates.ts` 에 등록한다.
- 실험 로그라면 `/로그추가` 커맨드가 MDX 스켈레톤, `content/logs.ts`, 브랜치, PR을 한 번에 처리한다.

### 2. 기존 페이지를 수정할 때

- 의미 있는 변경이면 frontmatter 의 `last_verified` 를 오늘 날짜로 갱신한다.
- 다른 페이지의 주장과 모순되는 내용을 추가했다면 양쪽에 cross-reference를 단다 (`related: [{slug: ..., type: contradicts}]`).
- 기존에 frontmatter 가 없는 페이지에 frontmatter 를 추가하는 건 환영. 강제는 아님.

### 3. 크로스 레퍼런스

- 페이지 본문에서 다른 페이지를 언급할 때는 절대 경로 마크다운 링크: `[제목](/education/insights/foo)`.
- 관계 메타데이터는 frontmatter `related` 에 표기 — "이 페이지가 어떤 페이지를 확장/유사/반박하는가" 를 LLM이 그래프로 읽을 수 있도록.

### 4. 자동 검사

- 빌드 시 `public/llms.txt` 와 `public/llms-full.txt` 가 자동 생성된다 (`scripts/llms-txt/build.mjs`).
- `/위키정리` 커맨드로 lint 가능: 모순, 고아 페이지, 오래된 `last_verified`, 깨진 `related`.

### 5. 무엇을 자동화하지 말 것

- **기존 페이지 본문의 일괄 재작성.** 사람 검토 없이 수행하지 말 것.
- **`.claude/log-quality-rubric.md` 와 `.claude/promotion-rubric.md` 수정.** 사람이 직접 수정한다 (autoresearch 의 `prepare.py` 원칙 — 평가 기준을 에이전트가 바꾸면 모든 이전 점수와 비교 불가능해진다).
- **`_meta.ts` 의 `display: 'hidden'` 항목 삭제.** 의도된 숨김이다.

### 6. 문체 (말투) — 합니다체로 통일

- `content/` 본문 문장은 **합니다체**(`~합니다`/`~습니다`/`~입니다`)로 쓴다. 한다체(`~한다`/`~다`)·해요체(`~해요`/`~예요`)를 섞지 않는다.
- **예외(그대로 둔다):** 코드블록, 따옴표 안 크루·코치 실제 발화 인용, 도구의 질문/프롬프트 템플릿. 의도된 예외 블록은 `{/* tone-lint:ignore-start */}` ~ `{/* tone-lint:ignore-end */}` 로 감싼다.
- **점검:** `npm run lint:tone` 또는 `/말투점검`. 큐레이션 교육 콘텐츠(philosophy·insights·design-patterns·curriculum·tools)를 검사하며, 본문 위반이 있으면 종료코드 1.
- 선언·매니페스토 톤이어도 어미는 합니다체를 지킨다.

### 7. 이미지·일러스트

- 문서에 일러스트가 필요하면 **새 이미지를 만들지 말고 공식 캐릭터 행성이를 쓴다.** 카탈로그는 `public/images/characters/index.md` 에 있다.
- 18가지 포즈(걷기·축하·협업·코딩·과열·발표 등)가 "추천 사용 맥락" 태그와 함께 정리돼 있다. 맥락으로 후보를 좁히고 파일명으로 고른다.
- 본문 참조 경로는 `/images/characters/행성이-걷기.png` 형식. 주황 컬러는 `행성이-대표-주황.png` 한 장뿐이고 나머지는 라인아트다.

## 외부 LLM(ChatGPT/Claude/Gemini 등) 진입 흐름

```
1. public/llms.txt 를 먼저 읽는다 → 사이트 구조와 핵심 페이지 카탈로그 파악
2. 관심 페이지의 URL 을 따라 본문을 읽는다
3. 전체 ingest가 필요하면 public/llms-full.txt 단일 요청
```

## 출처 표기

이 저장소의 LLM Wiki 구조는 다음을 참고한다:

- Andrej Karpathy, "llm wiki" gist (2026-04) — https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Jeremy Howard, llms.txt spec — https://llmstxt.org/

---
date: 2026-04-23
topic: 팀원 온보딩 · 한국어 커맨드 재구성
status: 설계안
---

# 팀 참여 개방 · 한국어 커맨드 재구성 설계

## 배경

`woowacourse-docs` 저장소는 지금까지 단일 운영자가 관리해 왔다. 이제 다른 코치들도 실험 로그 추가·품질 개선·승격 파이프라인에 함께 참여하도록 개방하려 한다. 기존 구조는 다음 문제를 가진다.

- **진입점 부재**: 팀원이 "새 실험 로그 하나 쓰려면 뭘 어떻게 하나?"에 대한 단일 커맨드가 없다. MDX 파일 생성, `logs.ts` 등록, `updates.ts` 등록 3곳을 따로 챙겨야 하고 한 군데라도 빠뜨리면 빌드·랜딩 타임라인이 깨진다.
- **영문 커맨드 장벽**: `/research-cycle`, `/extract-insights` 등 영문 이름이 autoresearch 메타포에 기대어 있어 신규 팀원에게 직관성이 떨어진다.
- **커맨드 수 과잉**: 7개 커맨드 중 `/improve-all`은 `/improve-log` wrapper, `/auto-sync`·`/extract-insights`·`/sync-model`은 전체 사이클의 부분이라 상당 부분 겹친다.
- **팀 공용 설정 위험**: `settings.local.json`이 tracked 상태이고 `Bash(*)` 등 폭넓은 권한이 공유되고 있다.
- **문서 참조 드리프트**: CLAUDE.md와 `.claude/hooks/auto-sync-check.sh`가 존재하지 않는 경로 `content/education-experiment/logs/`를 참조한다. 실제 경로는 `content/education/logs/`.

## 목표

1. 팀원이 Claude Code를 띄운 상태에서 **한국어 커맨드 하나**로 새 실험 로그를 온전히 추가할 수 있다 (MDX + `logs.ts`는 항상, `updates.ts`는 팀원이 "랜딩 타임라인에 올림"을 선택할 때만).
2. 커맨드 수를 **7개 → 5개**로 축소하고 전부 한국어로 전환한다.
3. 기존 영문 커맨드는 **얇은 리디렉션 shim**으로 유지해 과거 참조를 깨뜨리지 않는다.
4. 팀 공용 저장소에서 개인 설정(`settings.local.json`)이 공유되지 않도록 정리한다.
5. 낡은 경로 참조(CLAUDE.md, 훅)를 현재 디렉터리 구조에 맞게 고친다.
6. README를 팀원 온보딩 흐름 중심으로 재구성한다.

## 비목표

- 스킬(`.claude/skills/`)·에이전트(`.claude/agents/`) 구조 개편. 이름·인터페이스 그대로 유지하고 한국어 커맨드가 내부에서 호출한다.
- 루브릭 파일 수정. `.claude/log-quality-rubric.md`·`.claude/promotion-rubric.md`·`.claude/tool-promotion-rubric.md`는 과거 점수와의 비교 가능성을 위해 변경하지 않는다 (CLAUDE.md 명시 원칙).
- GitHub PR/Issue 템플릿 등 저장소 외부 협업 도구 정비. 이번 범위에서 제외.

## 최종 설계

### 1. 커맨드 (5개, 전부 한국어)

| 커맨드 | 역할 | 인자 | 파일 변경 |
|---|---|---|---|
| `/사용방법` | 팀원 온보딩 가이드 출력 (README 요약판) | 없음 | 없음 |
| `/로그추가` | 신규 실험 로그 생성 — MDX + `logs.ts` 갱신, `updates.ts`는 옵션 | 없음 (대화형) | 2~3파일 생성/수정 |
| `/로그평가` | 품질 루브릭 점수 측정 (읽기 전용) | `[슬러그]` | 없음 |
| `/로그개선` | 한 로그를 차원별 반복 개선 | `<슬러그>` 필수 | 로그 MDX |
| `/로그승격` | 승격 파이프라인 전체 또는 단계 실행 | `[dry-run\|추출\|동기화\|자동]` | 서브커맨드별 |

#### 1.1 `/사용방법`

README의 "팀원으로 처음 왔다면" 섹션을 그대로 출력한다. 5개 커맨드 한 줄 설명 + 전형적인 워크플로우(로그 추가 → 평가 → 개선 → 승격) + 도움말 위치(README 경로).

#### 1.2 `/로그추가` 동작 명세

대화형으로 다음을 차례로 묻는다. 기본값이 있는 항목은 엔터로 스킵 가능.

| 필드 | 타입 | 예시 | 필수/기본값 |
|---|---|---|---|
| 슬러그 | 영문 소문자·하이픈 | `pair-programming-retro` | 필수, 중복 검사 |
| 제목 (한국어) | 문자열 | `페어 프로그래밍 회고` | 필수 |
| 한 줄 요약 | 문자열 | `레벨1 페어 회고 5회 누적 패턴 정리.` | 필수 |
| `phases` | `LogPhase[]` | `['레벨1']` | 필수, 다중 선택 |
| `tracks` | `LogTrack[]` | `['웹 백엔드']` | 필수, 다중 선택 |
| `themes` | `LogTheme[]?` | `['소프트스킬']` | 선택 |
| 랜딩 타임라인에 올릴까요? | y/n | `n` | 기본값: **아니오** (CLAUDE.md 규칙상 실험 로그는 `logs.ts`에만 넣는 것이 원칙) |
| └ `updates.ts` date 라벨 | 문자열 | `7기·8기` | y일 때만 질문. 기본값: `updates.ts` 최상단 항목의 `date` 값 |

생성 결과:

1. **`content/education/logs/{slug}.mdx`** — 루브릭 D1~D5 구조가 담긴 스켈레톤 (frontmatter + "맥락 / 시도한 것 / 관찰 / 반성 / 다음 실험" 5개 섹션 + 품질 루브릭 힌트 주석)
2. **`content/logs.ts`** — 배열 맨 위에 새 항목 삽입. `date`는 오늘 날짜 자동 (`YYYY-MM-DD`), `href`는 `/education/logs/{slug}`
3. **`content/updates.ts`** — 옵션. 팀원이 "랜딩에 올림"을 선택한 경우에만 배열 맨 위에 새 항목 삽입 (`status: 'active'`)

생성 후 출력:
- 생성된 파일 경로
- 다음 단계 힌트 (`"본문 작성 후 /로그평가 {slug}로 점수를 확인하세요."`)

#### 1.3 `/로그평가`

기존 `.claude/commands/review-log.md`의 로직을 그대로 한국어 커맨드 파일로 옮긴다. 내부에서 `log-quality-agent`/`log-quality` 스킬을 호출하는 구조는 유지.

#### 1.4 `/로그개선`

기존 `.claude/commands/improve-log.md` 로직 이식. 슬러그 인자 필수. 최대 5회 반복, 점수 하락 시 자동 revert.

#### 1.5 `/로그승격`

기존 `/research-cycle`의 전체 파이프라인 + 흡수된 3개 커맨드의 서브 동작.

```
/로그승격               # 전체 6단계 파이프라인
/로그승격 dry-run       # 평가·후보 파악만, 파일 변경 없음
/로그승격 추출          # 인사이트 추출만 (구 /extract-insights)
/로그승격 동기화        # 교육 모델 반영만 (구 /sync-model)
/로그승격 자동          # 증분 비대화형 자동 처리 (구 /auto-sync)
```

내부적으로는 기존 `research-cycle-orchestrator` 에이전트·`research-cycle` 스킬을 그대로 호출한다.

### 2. 영문 커맨드 shim (7개)

기존 영문 커맨드 파일 전부를 다음 형식의 1~3줄 리디렉션 shim으로 교체한다. 파일을 유지함으로써 과거 대화 기록·외부 문서의 `/research-cycle` 참조가 깨지지 않는다.

예시 (`.claude/commands/review-log.md`):

```markdown
---
description: (구) 로그 품질 측정 — 이제 /로그평가로 이름이 바뀌었습니다.
---

이 커맨드는 `/로그평가`로 이름이 바뀌었습니다. 대신 `/로그평가 $ARGUMENTS`를 실행하세요. 전체 사용법은 `/사용방법`을 참고하세요.
```

매핑:

| 영문 (shim) | 한국어 (실질 구현) |
|---|---|
| `/review-log` | `/로그평가` |
| `/improve-log` | `/로그개선` |
| `/improve-all` | `/로그승격` |
| `/extract-insights` | `/로그승격 추출` |
| `/sync-model` | `/로그승격 동기화` |
| `/research-cycle` | `/로그승격` |
| `/auto-sync` | `/로그승격 자동` |

### 3. 스킬 · 에이전트

구조 변경 없음. `.claude/skills/{log-quality,insight-extraction,promotion,research-cycle}`·`.claude/agents/{log-quality-agent,insight-agent,promotion-agent,research-cycle-orchestrator}` 전부 그대로. 한국어 커맨드 파일 내부 지시문에서 이들을 호출한다.

### 4. 훅

- `.claude/hooks/test-auto-sync-check.sh` **삭제**. `settings.json` 훅 설정에 등록되어 있지 않은 테스트 잔재.
- `.claude/hooks/auto-sync-check.sh` 수정:
  - 로그 경로 glob: `content/education-experiment/logs/*.mdx` → `content/education/logs/*.mdx`
  - 알림 문구: `/auto-sync 실행을 권장합니다` → `/로그승격 자동 실행을 권장합니다`
- `settings.json` 훅 설정은 그대로.

### 5. settings / .gitignore

- `.claude/settings.local.json` — `.gitignore`에 추가, `git rm --cached`로 추적 해제. 파일 자체는 로컬에 남겨둔다.
- `.claude/settings.json` — 훅 설정만 유지. 권한은 각 팀원이 자신의 `.local.json`에서 설정 (README에 안내).
- `.claude/sync-state.json` — 팀 공유 상태로 계속 tracked 유지.

### 6. README 재구성

`README.md`를 다음 목차로 재작성한다. 기존 "상황별 커맨드 선택" 사례 블록은 축약하여 핵심만 남긴다.

```
# 우아한테크코스 공식문서

1. 빠른 시작 (설치 + dev 서버)
2. 팀원으로 처음 왔다면
   - /사용방법 소개
   - /로그추가로 첫 실험 로그 써보기
   - 권한 설정 안내 (settings.local.json 개인 조정)
3. 실험 로그 워크플로우
   - 작성: /로그추가
   - 점검: /로그평가
   - 보강: /로그개선
4. 승격 파이프라인 (/로그승격)
   - 전체 실행 / 서브커맨드 4종
5. 커맨드 레퍼런스 (표)
6. 내부 구성 (에이전트/스킬/루브릭 한 줄씩)
7. 콘텐츠 구조
8. 기술 스택
```

### 7. CLAUDE.md 업데이트

다음 섹션을 동기화한다.

- "콘텐츠 추가 시 필수 작업": `/로그추가`가 3파일 자동 처리를 담당함을 명시
- "실험 로그 반복 개선" 커맨드 표: 영문 → 한국어로 교체
- 경로 `content/education-experiment/logs/` → `content/education/logs/`
- 하네스 "연구 사이클" 섹션의 커맨드 이름을 한국어로 교체

### 8. docs/plans 정리

`docs/plans/2026-04-14-javascript-lotto-research-plan.md`는 현재 브랜치에 변경사항이 있지만 이번 스코프와 무관. 손대지 않는다.

## 전체 파일 체크리스트

**신규**
- `.claude/commands/사용방법.md`
- `.claude/commands/로그추가.md`
- `.claude/commands/로그평가.md`
- `.claude/commands/로그개선.md`
- `.claude/commands/로그승격.md`

**수정 (shim으로 교체)**
- `.claude/commands/review-log.md`
- `.claude/commands/improve-log.md`
- `.claude/commands/improve-all.md`
- `.claude/commands/extract-insights.md`
- `.claude/commands/sync-model.md`
- `.claude/commands/research-cycle.md`
- `.claude/commands/auto-sync.md`

**수정 (내용 업데이트)**
- `.claude/hooks/auto-sync-check.sh`
- `README.md`
- `CLAUDE.md`
- `.gitignore`

**삭제**
- `.claude/hooks/test-auto-sync-check.sh`

**추적 해제 (파일은 남김)**
- `.claude/settings.local.json` (→ `git rm --cached`)

**손대지 않음**
- `.claude/skills/**`
- `.claude/agents/**`
- `.claude/settings.json`
- `.claude/sync-state.json`
- `.claude/*-rubric.md`
- `content/**` (단, `/로그추가` 테스트 시 임시 파일은 정리)

## 수락 기준

1. `/사용방법` 실행 시 팀원이 첫 로그 작성까지 이어질 수 있는 가이드가 출력된다.
2. `/로그추가` 실행 → 대화형 입력 → `content/education/logs/{slug}.mdx`와 `content/logs.ts`가 정합적으로 갱신된다. `updates.ts`는 "랜딩에 올림"을 선택한 경우에만 추가된다.
3. 기존 영문 커맨드(`/review-log` 등) 실행 시 "이제 이름이 바뀌었다"는 안내가 출력되고 동작은 하지 않는다 (리디렉션).
4. `.claude/settings.local.json`이 `git status`에서 untracked로 보이고 `.gitignore`에 포함되어 있다.
5. `git grep "education-experiment/logs"`가 빈 결과를 반환한다 (경로 드리프트 제거).
6. `/로그승격 dry-run`이 기존 `/research-cycle dry-run`과 동일한 동작을 한다.
7. `.claude/hooks/auto-sync-check.sh`가 `/로그승격 자동`을 권장한다.

## 리스크와 대응

- **위험 A — 대화형 입력이 불안정할 수 있음**: 특히 `phases`·`tracks` 같은 배열 입력. 대응: 기본값 + "엔터로 가장 흔한 값 선택" 패턴, 잘못 입력 시 재질문.
- **위험 B — `updates.ts` 중복 추가**: 팀원이 실수로 `/로그추가`를 두 번 실행. 대응: 슬러그 중복 검사 단계에서 중단.
- **위험 C — 과거 영문 커맨드를 여전히 자동 호출하는 외부 스크립트 존재 가능성**: 훅은 이미 수정 대상. 그 외에는 grep으로 확인 → 발견 시 한국어로 교체.
- **위험 D — 브랜치에 이미 존재하는 다른 작업과의 충돌**: 현재 브랜치에 `TecobleArchiveExplorer` 등 미커밋 변경이 있음. 이번 작업은 `.claude/`·`README.md`·`CLAUDE.md`·`.gitignore` 중심이라 충돌 가능성은 낮으나, 커밋 분리로 회피.

## 마이그레이션 순서 (구현 플랜 소재)

실제 구현 플랜은 별도 문서로 작성한다. 대략의 순서:

1. `.gitignore` + `settings.local.json` 추적 해제 (가장 무해)
2. 한국어 커맨드 5개 작성
3. 영문 커맨드 7개를 shim으로 교체
4. 훅 수정
5. README / CLAUDE.md 업데이트
6. `test-auto-sync-check.sh` 삭제
7. 수락 기준 검증 (실제 `/로그추가` 수동 실행, grep 검증)

## 열린 질문

없음. 필요 시 구현 단계에서 별도로 논의.

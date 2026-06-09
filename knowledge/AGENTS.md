# Knowledge Wiki — Agent Schema

이 문서는 LLM(Claude Code / Codex / Cursor / 그 외)이 `knowledge/` 를 유지보수할 때 따를 규약이다. 카파시 LLM Wiki 패턴의 "schema" 파일에 해당한다.

> "The schema is what makes the LLM a disciplined wiki maintainer rather than a generic chatbot." — Karpathy Gist

## 디렉터리 계약

```
knowledge/
├── raw/         불변 (append-only). LLM은 읽기만 한다.
├── wiki/        LLM이 소유. 자유 편집. 납작한 구조.
├── index.md     모든 wiki 노트의 카탈로그 (단일 컨텍스트 크기 유지).
├── log.md       운영 일지 (append-only, 최신이 위).
└── AGENTS.md    이 파일.
```

## raw/ 규약

1. **불변 (immutable)**: 한 번 들어온 raw는 절대 수정하지 않는다. 오류 정정은 wiki에서 한다. 이게 깨지면 wiki의 모든 주장이 출처 추적 불가능해진다.
2. **하위 폴더 정확히 3개만**: `conversations/`, `external/`, `assets/`. 그 외 분류가 필요하면 frontmatter로 해결한다. 새 폴더를 만들지 말 것.
3. **파일명**: `YYYY-MM-DD-슬러그.md`. 슬러그는 kebab-case 한국어 가능.
4. **frontmatter** (권장):
   ```yaml
   ---
   source_type: log | retrospective | conversation | external | observation
   author: 작성자
   captured: 2026-06-09
   ---
   ```

## wiki/ 규약

1. **원자성**: 한 노트 = 한 아이디어. 두 아이디어가 섞이면 두 파일로 분리한다.
2. **납작한 구조**: 하위 폴더를 만들지 않는다. 분류는 frontmatter `tags:` 로.
3. **파일명**: kebab-case slug. 예: `feedback-loop.md`, `pair-coding-rotation.md`.
4. **frontmatter** (필수):
   ```yaml
   ---
   title: 짧은 피드백 루프
   tags: [개념]              # 개념 | 패턴 | 인물 | 외부영향 | stub
   sources:                   # 어느 raw에서 합성됐는지
     - raw/2026-06-09-expedition.md
     - raw/external/ahrens.md
   links:                     # 관련 노트 slug
     - pair-coding-rotation
     - psychological-safety
   updated: 2026-06-09
   ---
   ```
5. **본문 구조**: 한 줄 요약 → 핵심 (자기 언어로) → 근거 인용 → 관련 노트.
6. **백링크는 frontmatter `links:` 로**. 본문 인라인 `[[slug]]` 가 아니라. (파싱·역링크 계산·lint에 유리)

## index.md 규약

1. **반드시 단일 컨텍스트 윈도우에 들어가는 크기 유지**. 노트당 한 줄 절대 원칙.
2. **포맷**: `- [slug](wiki/slug.md) — 한 줄 요약. (sources: N, updated: YYYY-MM-DD)`
3. **그룹**: H2 헤더 5개 — `## 핵심 개념`, `## 디자인 패턴`, `## 인물·개체`, `## 외부 영향`, `## 미발달 (stub)`.
4. **새 wiki 노트를 만들면 같은 턴에 반드시 index.md 에 한 줄 추가**.
5. wiki 노트의 `tags:` 와 index.md 의 그룹은 일치시킨다.

## log.md 규약

- append-only, 최신이 위.
- 형식: `## [YYYY-MM-DD] event | target`
- event 종류: `ingest` | `lint` | `promote` | `refactor` | `bootstrap`
- 한 단락 이내로 요약. 길어지면 wiki 노트에 적고 log엔 링크만.

예시:
```markdown
## [2026-06-09] ingest | raw/2026-06-09-expedition.md
새 raw 4개 ingest. wiki/feedback-loop.md 갱신, wiki/coach-checkpoint.md 신규.

## [2026-06-08] lint
wiki 87개, index.md 정합성 OK. stub 3개 발견.
```

## 워크플로우

### 새 raw ingest
1. 사용자가 raw에 파일 추가.
2. LLM: 새 raw 읽기 → 관련 wiki 노트 갱신 또는 새 노트 생성 (자기 언어로 재작성, 복붙 금지).
3. 새 wiki 노트가 생기면 같은 턴에 index.md 등록.
4. log.md 에 ingest 기록.

### 질의 응답
1. LLM: 먼저 index.md 를 통째로 읽는다.
2. 관련 wiki 노트 2~5개 통째 로드.
3. 답변에 wiki 노트 + raw 출처 둘 다 인용.

### 정기 lint
- raw에 있는데 wiki에 미반영된 파일
- wiki에서 깨진 `links:` 또는 깨진 `sources:` 경로
- index.md 에서 누락된 wiki 노트
- 30일 이상 `updated:` 없는 노트
- 결과를 log.md 에 한 줄로 기록

## 절대 금지

- ❌ raw/ 안 파일 수정 (오타 포함)
- ❌ wiki/ 안 하위 폴더 생성
- ❌ index.md 한 줄을 단락으로 늘림
- ❌ frontmatter 없이 wiki 노트 작성
- ❌ raw에서 wiki로 옮길 때 복붙 (반드시 자기 언어로 재작성)
- ❌ `content/` 디렉터리를 직접 편집 (knowledge → content는 별도 큐레이션 단계)

## 참고

- [Karpathy LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- 저장소 전체 규약: [`../AGENTS.md`](../AGENTS.md)
- 저장소 전체 규약(Claude Code용): [`../CLAUDE.md`](../CLAUDE.md)

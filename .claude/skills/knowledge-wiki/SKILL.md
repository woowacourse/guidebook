---
name: knowledge-wiki
description: "knowledge/ 디렉터리(Karpathy LLM Wiki 패턴) 운영 스킬. /지식흡수, /지식정제, /지식점검, /지식질의, 지식 흡수, raw 추가, wiki 합성, 위키 정제, wiki 노트 생성, knowledge 위키 작업, raw에서 wiki 만들기, index.md 갱신 요청 시 반드시 이 스킬을 사용할 것. content/ 가 아닌 knowledge/ 안에서의 작업 전용."
---

# Knowledge Wiki 운영 스킬

`knowledge/` 디렉터리(카파시 LLM Wiki 패턴, [Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f))를 유지보수할 때의 공통 컨텍스트와 규약. 모든 `/지식*` 커맨드가 이 스킬을 공유한다.

## 적용 범위

- 대상: `knowledge/` 디렉터리 (raw/wiki/index.md/log.md/AGENTS.md)
- 적용 안 됨: `content/` (Nextra 발행본 — 별도 `/위키정리` 가 담당)

## 핵심 규약 (knowledge/AGENTS.md 요약)

### raw/ — 불변

1. 한 번 들어온 raw는 절대 수정하지 않는다. 오타·오류조차 wiki에서 정정.
2. 하위 폴더 정확히 3개: `conversations/`, `external/`, `assets/`. 그 외는 raw/ 루트에 flat.
3. 파일명: `YYYY-MM-DD-슬러그.md`.
4. frontmatter 권장:
   ```yaml
   source_type: log | retrospective | conversation | external | observation
   author: 작성자
   captured: YYYY-MM-DD
   ```

### wiki/ — LLM 소유

1. **원자성**: 한 노트 = 한 아이디어.
2. **납작**: 하위 폴더 만들지 않는다. 분류는 frontmatter `tags:` 로.
3. 파일명: kebab-case slug (`feedback-loop.md` 등).
4. frontmatter 필수:
   ```yaml
   title: 짧은 피드백 루프
   tags: [개념]               # 개념 | 패턴 | 인물 | 외부영향 | stub
   sources: [raw/...]          # 합성 출처
   links: [other-slug, ...]    # 관련 노트
   updated: YYYY-MM-DD
   ```
5. 본문: 한 줄 요약 → 핵심 (자기 언어) → 근거 인용 → 관련 노트.
6. **백링크는 frontmatter `links:` 로** (본문 `[[slug]]` 금지).

### index.md — 단일 컨텍스트 라우팅

- 노트당 한 줄 절대 원칙. 단락 설명 금지.
- 포맷: `- [slug](wiki/slug.md) — 한 줄 요약. (sources: N, updated: YYYY-MM-DD)`
- 그룹: H2 5개 (`## 핵심 개념`, `## 디자인 패턴`, `## 인물·개체`, `## 외부 영향`, `## 미발달 (stub)`).
- 새 wiki 노트 생성 시 **같은 턴에** 등록.

### log.md — 운영 일지

- append-only, 최신이 위.
- 형식: `## [YYYY-MM-DD] event | target` (event: `ingest` | `compile` | `lint` | `promote` | `refactor` | `bootstrap`)
- 한 단락 이내.

## 절대 금지

- ❌ raw/ 파일 수정 (오타 포함)
- ❌ wiki/ 안 하위 폴더 생성
- ❌ index.md 한 줄을 단락으로 늘림
- ❌ frontmatter 없이 wiki 노트 작성
- ❌ raw → wiki 복붙 (반드시 자기 언어로 재작성)
- ❌ `content/` 직접 편집 (knowledge → content는 별도 큐레이션 단계)

## ingest와 compile의 분리

리서치 검증된 카파시 정통 (praneybehl/llm-wiki-plugin, Astro-Han/karpathy-llm-wiki):

```
사용자가 raw dump → /지식흡수 (싸고 자주, 컴파일 없음)
                         ↓
                    누적 N개
                         ↓
                  /지식정제 (의도적·드물게, wiki 갱신)
                         ↓
                  주기적 /지식점검 (lint)
```

- **흡수(ingest)**: raw 파일 추가 + frontmatter 보강. wiki 안 건드림. 컴파일 트리거 안 함.
- **정제(compile)**: 누적 raw → wiki 노트 합성/갱신 + index.md 등록 + log.md 기록. `wiki-compiler` 에이전트가 수행.
- **점검(lint)**: 4종 검사 — 모순·고아·미생성 개념·낡은 주장 + 정합성 검사. `wiki-linter` 에이전트가 수행. 읽기 전용.

## 워크플로우 진입점

| 사용자 의도 | 커맨드 | 위임 에이전트 |
|---|---|---|
| raw 새로 추가 | `/지식흡수 [파일경로]` | (없음, 직접 처리) |
| 누적 raw를 wiki로 합성 | `/지식정제 [N개\|전부\|특정 raw]` | `wiki-compiler` |
| 위키 정합성 lint (모순·고아·미생성·낡음 4종 + 정합성) | `/지식점검 [--요약\|--차원 <name>]` | `wiki-linter` (읽기 전용) |

## 호출 받았을 때 점검 순서

1. 대상이 `knowledge/` 인가? 아니면 다른 스킬(`research-cycle`, `위키정리` 등)을 고려.
2. `knowledge/AGENTS.md` 의 절대 금지 항목 한 번 더 상기.
3. 작업 후 반드시 `log.md` 에 한 줄 추가.
4. `index.md` 정합성 유지 (새 wiki 노트면 같은 턴에 등록).

## 참고

- 상세 규약: [`knowledge/AGENTS.md`](../../../knowledge/AGENTS.md)
- 패턴 원문: [Karpathy LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- 구현 레퍼런스: [praneybehl/llm-wiki-plugin](https://github.com/praneybehl/llm-wiki-plugin), [Astro-Han/karpathy-llm-wiki](https://github.com/Astro-Han/karpathy-llm-wiki)

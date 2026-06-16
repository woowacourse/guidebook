# MDX Frontmatter 표준 스펙

이 저장소의 모든 새 MDX 페이지는 다음 frontmatter를 가질 수 있다.
**기존 페이지는 강제 마이그레이션하지 않는다.** 새 페이지부터 점진적으로 적용하고, 기존 페이지는 의미 있는 수정 시 함께 갱신한다.

## 필수 필드 (새 페이지 기준)

- `id` — 페이지의 안정적인 식별자. URL slug와 동일하게 유지. 변경 시 redirect 추가 필요.
- `summary` — 한 문장 요약 (최대 120자). LLM이 카탈로그에서 이 페이지를 골라낼 때 사용.
- `last_verified` — `YYYY-MM-DD`. 페이지 내용을 누군가 마지막으로 사실 확인한 날짜.

## 선택 필드

- `related` — 관련 페이지 슬러그 배열. 관계 유형(`similar`, `extends`, `contradicts`)을 명시할 수 있는 형태도 허용:

  ```yaml
  related:
    - slug: progressive-scaffolding
      type: similar
    - slug: poe-discovery-learning
      type: extends
  ```

- `source_logs` — 이 페이지의 근거가 된 실험 로그 슬러그 배열 (insights/curriculum 페이지에서 사용).
- `tags` — 자유 태그. 기존 `logs.ts`의 `phases/tracks/themes`와 다름. 검색 보조용.

## 예시

```yaml
---
id: progressive-scaffolding
summary: 단일 세션으로 전달하면 증발하는 내용을 3~5회 점진적 시퀀스로 분산해 인지 부하를 관리하는 설계 원칙.
last_verified: 2026-05-29
related:
  - slug: poe-discovery-learning
    type: similar
source_logs:
  - ux-research-training
  - fe-level2-16steps
  - demo-day-retrospective
tags: [scaffolding, cognitive-load]
---
```

## 검증

`/위키정리` 커맨드가 다음을 검사한다:

- `summary` 누락 또는 120자 초과
- `last_verified` 가 12개월 이상 지난 페이지
- `related` 가 존재하지 않는 slug를 참조
- `source_logs` 가 `content/logs.ts` 에 없는 slug를 참조

## 왜 이 스펙이 필요한가

- LLM 카탈로그(`public/llms.txt`)가 페이지 목록을 만들 때 `summary` 가 한 줄 설명으로 사용된다. summary 가 없으면 LLM은 본문을 읽어 추론해야 하므로 ingest 비용이 늘어난다.
- `related` / `source_logs` 가 그래프 형태로 위키 페이지를 연결한다. autoresearch 패턴에서 "이 인사이트의 근거가 어떤 실험 로그인가" 를 추적할 수 있다.
- `last_verified` 가 오래된 페이지는 lint 단계에서 표면화된다. 모순 검증과 사실 확인의 진입점.

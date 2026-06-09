# Knowledge Wiki Log

`knowledge/` 의 운영 일지. append-only, 최신이 위.

**형식**: `## [YYYY-MM-DD] event | target`
**event 종류**: `ingest` | `lint` | `promote` | `refactor` | `bootstrap`

본문은 한 단락 이내. 길어지면 wiki 노트로 빼고 여기엔 링크만.

---

## [2026-06-09] ingest | Phase A 시드 마이그레이션 (5개)

기존 `content/education/logs/` 에서 다양성(phase·track·theme) 균형 잡힌 실험 로그 5개를 평문 마크다운으로 변환·복사. Karpathy 권고 "start with ten sources" 의 절반 규모로 위키 거동 검증용 시드.

- `raw/2026-03-10-expedition.md` — 원정대 (자기주도 학습 활동 설계, 코치훈련/소프트스킬)
- `raw/2026-04-07-fe-rendering-strategy-workshop.md` — FE 렌더링 전략 워크숍 (기술 결정 훈련, 레벨4)
- `raw/2026-04-27-crew-autonomy.md` — 선택 미션 자율성 효과 분석 (정량 분석, 레벨1 BE)
- `raw/2026-04-28-android-participatory.md` — 안드로이드 강의→참여 전환 (교수법 전환, 레벨2 안드로이드)
- `raw/2026-05-19-thanks-feedback-workshop.md` — 피드백 워크숍 (Stone & Heen, 레벨2 소프트스킬)

변환 규칙: MDX frontmatter·`import` 제거, `<Callout>` → blockquote, `{/* */}` 주석 제거. 본문 내용은 보존. frontmatter 에 `published_at` 으로 원본 추적 보장.

다음: 누적 5개 raw → `/지식정제` 로 wiki 노트 합성 시도 (PR 머지 후).

## [2026-06-09] bootstrap | knowledge/

Karpathy LLM Wiki 패턴(2026-04-03 Gist)으로 `knowledge/` 디렉터리 골격 생성.

- `raw/` + 하위 3개(`conversations/`, `external/`, `assets/`) — 실험 로그·회고는 raw 루트에 flat
- `wiki/` — 납작 구조, LLM 합성 노트
- `index.md` — 단일 컨텍스트 카탈로그
- `log.md` — 이 파일
- `AGENTS.md` — LLM 운영 스키마
- `README.md` — 팀 온보딩

기존 `content/` 는 그대로 두고 공존. 마이그레이션은 별도 단계.

출처: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

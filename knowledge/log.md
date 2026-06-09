# Knowledge Wiki Log

`knowledge/` 의 운영 일지. append-only, 최신이 위.

**형식**: `## [YYYY-MM-DD] event | target`
**event 종류**: `ingest` | `lint` | `promote` | `refactor` | `bootstrap`

본문은 한 단락 이내. 길어지면 wiki 노트로 빼고 여기엔 링크만.

---

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

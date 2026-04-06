# woowacourse org 207개 저장소 연구 파이프라인 설계

- 작성일: 2026-04-07
- 상태: 승인 대기 (사용자 검토 단계)
- 관련 기존 자산: `.claude/log-quality-rubric.md`, `.claude/promotion-rubric.md`, `.claude/commands/research-cycle.md`, `content/logs.ts`, `components/LogList.tsx`

## 1. 목적

`https://github.com/woowacourse` org의 모든 공개 저장소(약 207개)를 탐색·분석하여, 교육적으로 가치 있는 자산을 우아한테크코스 공식 문서의 단계적 승격 파이프라인에 편입시킨다. 단순 카탈로그가 아니라, 학습자·리뷰어 상호작용을 포함한 **교육 담론 코퍼스**로 취급한다.

Andrej Karpathy의 autoresearch 메커니즘(불변 평가 인프라 + 저비용 측정 루프 + 고비용 개선 루프 + 승격 기록)을 이 문제에 그대로 적용한다. 즉흥적 크롤링이 아니라 재현 가능한 연구 파이프라인으로 만든다.

## 2. 배경과 제약

- 현 프로젝트는 이미 실험 로그용 autoresearch 파이프라인(`/review-log`, `/improve-log`, `/improve-all`, `/extract-insights`, `/sync-model`, `/research-cycle`)이 구축되어 있다.
- 207개 레포 중 상당수는 미션 레포로, 각 미션에 수백~수천 개 학습자 PR과 리뷰 대화가 누적되어 있다. 이는 단순 메타데이터로는 접근 불가능한 교육 자산이다.
- 컨텍스트 윈도·시간은 유한하다. 207개 전부를 한 번에 심층 분석할 수 없으며, 중단·재개 가능한 배치 순회가 필요하다.
- `gh` CLI는 `imakerjun` 계정으로 인증되어 있고 `repo`·`read:org` 스코프를 보유한다(v2.74.2). org 전체 메타데이터·PR·리뷰 접근 가능.

## 3. autoresearch ↔ 레포 분석 매핑

| autoresearch 구성 요소 | 기존 로그 파이프라인 | 레포 분석 파이프라인 (신규) |
|---|---|---|
| `prepare.py` 불변 평가 인프라 | `.claude/log-quality-rubric.md` | `.claude/repo-analysis-rubric.md` (신규) |
| `prepare.py` 승격 평가 인프라 | `.claude/promotion-rubric.md` | 동일 파일 재사용 |
| `val_bpb` 측정 | `/review-log` | `/scan-repo <repo>` (신규) |
| train→measure 루프 | `/improve-log` | `/analyze-repo <repo>` (신규) |
| 밤새 순회 | `/improve-all` | `/analyze-all` (신규) |
| 패턴 추출 | `/extract-insights` | 동일 커맨드, 소스만 확장 |
| 모델 반영 | `/sync-model` | 동일 커맨드 재사용 |
| 마스터 루프 | `/research-cycle` | 동일 커맨드에 레포 단계 통합 |
| `results.tsv` | `research-cycle-log.tsv` | `.research/repo-scores.tsv` (신규) |

루브릭은 autoresearch의 `prepare.py`와 동일한 불변 규율을 따른다: **에이전트가 수정하지 않는다.** 사람이 한 번 쓰고, 수정할 때는 모든 이전 측정값의 비교 가능성이 사라진다는 것을 전제로 한다.

## 4. 티어링 구조

```
T0. 수집         — org 전체 메타데이터 스냅샷 (1회, 저렴)
        ↓
T1. 1차 스캔     — 모든 레포 R1~R3 (구조·README·히스토리) + 미션 자동 분류
        ↓  루브릭 게이트 (총점 ≥ 13 또는 D2 ≥ 4)
T2. 심층 분석    — 미션: M1(전수 정량) + M4(공통 피드백 주제 요약)
                  비미션: R1~R4 (+ 이슈/PR 샘플)
        ↓  루브릭 게이트 (총점 ≥ 18 그리고 D3 ≥ 4)
T3. 유망 레포 집중 — 미션: M2(샘플 PR 20개 리뷰 전문 읽기) + M3(학습 궤적 체인 2~3개)
                    비미션: R5 (대표 코드 파일 샘플)
        ↓  승격 루브릭 P1~P4
T4. 인사이트 추출 → /extract-insights (소스에 .research/repos/*.md 포함)
        ↓  승격 루브릭 P1~P4
T5. 교육 모델 반영 → /sync-model
```

각 티어는 `.research/repo-scores.tsv`에 기록된 (현재 티어, 점수, 마지막 처리 시각)을 기반으로 재개 가능하다. 세션당 티어 1개 원칙을 따른다(autoresearch의 "측정과 개선 분리" 정신).

### 4.1 미션 레포 분석 축 (M1~M4)

- **M1. 정량 지표 (전수)**: 총 PR 수, 머지율, 평균 리뷰 라운드, 평균 리뷰 코멘트 수, 첫 리뷰까지 시간, 참여 크루·리뷰어 수.
- **M2. 리뷰어 소통 패턴 샘플링**: 층화 샘플(오래된·최근·짧은·긴) PR 20개 리뷰 전문 읽기. 리뷰어 톤, 질문 유형, 크루 반응 관찰.
- **M3. 학습 궤적 추적**: 한 크루의 1→2→3단계 PR 체인 2~3개를 끝까지 추적. 피드백이 실제로 반영되는 방식 관찰.
- **M4. 공통 피드백 주제**: 샘플 기반 LLM 요약으로 "이 미션에서 반복 등장하는 리뷰 주제 Top 10" 추출.

### 4.2 비미션 레포 분석 축 (R1~R5)

- **R1. 구조**: 디렉토리 트리, 주요 파일, 언어, 빌드 도구.
- **R2. README/문서**: 전문 읽고 목적·대상·톤 추출.
- **R3. 히스토리**: 최근 커밋, 활성도, 메인테이너.
- **R4. 이슈/PR 샘플**: 최근 몇 개 훑어 상호작용 패턴 관찰.
- **R5. 코드 샘플링**: 대표 파일 일부 읽어 코딩 스타일·주석 문화 관찰.

## 5. 루브릭 설계

### 5.1 `.claude/repo-analysis-rubric.md` (신규, 25점 5차원)

| 차원 | 질문 | 1~5점 기준 |
|---|---|---|
| **D1. 교육적 의도 명확성** | 이 레포는 학습자에게 무엇을 가르치려 하는가? | 1: 목적 불명 / 3: README로 추정 가능 / 5: 학습 목표·단계·선수지식 명시 |
| **D2. 학습자 상호작용 밀도** | 학습자 활동 흔적이 얼마나 풍부한가? | 1: 흔적 없음 / 3: PR 10~100 / 5: PR 100+ & 다기수 누적 |
| **D3. 리뷰어 피드백 품질** | 리뷰 코멘트가 관찰할 가치가 있는가? | 1: 승인만 / 3: 짧은 코멘트 / 5: 긴 대화·질문형 리뷰·왕복 |
| **D4. 패턴 추출 가능성** | 교차 레포 패턴의 원료가 되는가? | 1: 일회성 / 3: 부분 일반화 / 5: 다른 미션·기수와 비교 축 제공 |
| **D5. 최신성·활성도** | 현재 교육에 여전히 유효한가? | 1: 2년+ 정체 / 3: 간헐 활동 / 5: 최근 기수 활동 있음 |

**게이트:**
- T1→T2 승급: 총점 ≥ 13 또는 D2 ≥ 4
- T2→T3 승급: 총점 ≥ 18 그리고 D3 ≥ 4

**미션 vs 비미션 가중치:**
- 미션 레포: D2·D3이 결정적. D2 ≤ 2면 실질 T2 컷.
- 비미션 레포: D1·D4가 결정적. D2는 N/A로 두고 4차원 20점 환산 후 비례 변환.

루브릭 한 파일에 두 버전을 병기한다(평가 인프라 단일 파일 원칙).

### 5.2 `.claude/promotion-rubric.md` (기존, 재사용)

T3→T4(인사이트) / T4→T5(모델 반영) 승급은 기존 P1~P4(20점 만점)를 그대로 사용한다. 소스가 실험 로그든 레포 분석이든 인사이트 승격 기준은 통일되어야 한다.

## 6. 산출물 위치

```
.research/                           # 로컬 상태 (커밋 정책 아래 참조)
├── repos/
│   ├── <repo-name>.md               # 각 레포별 분석 노트 (T1~T3 누적)
│   └── _index.json                  # org 메타데이터 스냅샷
├── repo-scores.tsv                  # 티어·점수·타임스탬프 (커밋 대상)
└── batches/
    └── YYYY-MM-DD-batch-NN.md       # 배치 실행 로그

.claude/
├── repo-analysis-rubric.md          # 신규 루브릭 (사람이 관리)
└── commands/
    ├── bootstrap-repos.md           # 신규
    ├── scan-repo.md                 # 신규
    ├── analyze-repo.md              # 신규
    └── analyze-all.md               # 신규

content/
├── repositories.ts                  # 신규, logs.ts 복제 패턴 (자동 갱신)
└── education-experiment/
    └── repositories/                # 신규 섹션
        ├── _meta.ts
        ├── index.mdx                # <RepoList /> 1줄
        └── <repo-slug>.mdx          # 승격된 레포만 개별 페이지

components/
├── RepoList.tsx                     # 신규, LogList 복제
└── RepoList.module.css              # 신규

mdx-components.tsx                   # RepoList export 추가
content/updates.ts                   # repositories 섹션 추가 항목
content/education-experiment/_meta.ts # repositories 등록
```

### 6.1 `.research/` 커밋 정책 (결정: B안)

- `repo-scores.tsv`: **커밋**. autoresearch의 `results.tsv` 관행과 일치. 상태 공유·재현성.
- `repos/*.md` 분석 노트: **gitignore**. 원노트는 재생성 가능하고, 저장소 비대화를 방지.
- `batches/*.md` 실행 로그: **gitignore**.
- `_index.json`: **커밋**. 메타데이터 스냅샷은 재현성의 기준점.

`.gitignore` 추가:
```
.research/repos/*.md
.research/batches/
```

### 6.2 `content/repositories.ts` 항목 형식

```ts
{
  slug: 'java-racingcar-6',
  name: 'java-racingcar-6',
  title: '자동차 경주 미션 (6기, Java)',
  description: '레벨1 자동차 경주 미션 — 6기 아카이브.',
  category: '미션',          // '미션' | '도구' | '문서' | '인프라' | '기타'
  tier: 'T2',                // 'T2' | 'T3' (T0/T1은 문서 노출 안 함)
  score: 22,
  href: '/education-experiment/repositories/java-racingcar-6',
  url: 'https://github.com/woowacourse/java-racingcar-6',
  lastScanned: '2026-04-08',
}
```

## 7. 커맨드 명세

### 7.1 `/bootstrap-repos` (1회성·재실행 가능)

- `gh api orgs/woowacourse/repos --paginate` 로 전체 레포 메타데이터 수집.
- `.research/repos/_index.json` 생성 또는 diff 업데이트(삭제 마킹 + 신규 T0 추가).
- `.research/repo-scores.tsv` 스키마 생성(비어 있으면) 및 신규 레포를 T0로 추가.
- 미션 레포 1차 자동 분류: 이름 패턴(`{언어}-{이름}`) + topics 기반. 애매한 것은 `is_mission=?`로 마킹.

### 7.2 `/scan-repo <repo>`

- `.research/repo-scores.tsv`에서 해당 레포의 현재 티어 조회.
- 티어에 해당하는 분석 축(T1=R1~R3, T2=M1+M4 또는 R1~R4, T3=M2+M3 또는 R5)을 수행하고 `.research/repos/<repo>.md`에 누적 기록.
- `repo-analysis-rubric.md`에 따라 점수 매기고 TSV 업데이트.
- **티어 승급은 하지 않음.** 수동 검증용.

### 7.3 `/analyze-repo <repo>`

- `/scan-repo` 동작 수행 후, 게이트 통과 시 티어 승급.
- T2로 승급 시 `content/repositories.ts`와 `content/updates.ts` 자동 업서트.
- T2 이상 승급 시 `content/education-experiment/repositories/<repo>.mdx` 생성 또는 업데이트.

### 7.4 `/analyze-all`

- `.research/repo-scores.tsv`에서 **가장 낮은 티어의 가장 오래된 레포**부터 배치 크기 N(기본 5)만큼 선택.
- 각각에 대해 `/analyze-repo` 실행.
- 컨텍스트 사용량이 임계치에 도달하면 안전 종료하고 TSV에 현재 상태 기록.
- 다음 세션에서 재실행하면 멈춘 지점부터 재개.
- 세션당 티어 1개 원칙: 한 배치 안에서 한 레포가 T1→T2→T3으로 연속 승급하지 않는다.

### 7.5 기존 커맨드 확장

- `/extract-insights`: 소스에 `.research/repos/*.md`를 추가. 프롬프트 내 "소스 경로 목록"에 한 줄 추가.
- `/research-cycle`: "측정" 단계에서 `repo-scores.tsv`도 스캔, "개선" 단계에서 `/analyze-all`도 호출.
- `/sync-model`, `/extract-insights`의 본체 로직은 수정하지 않는다.

## 8. 구현 순서 (빌드 시퀀스)

1. **인프라 1차**: `.claude/repo-analysis-rubric.md` 작성, `.research/` 디렉토리·빈 TSV 스키마 생성, `.gitignore` 업데이트.
2. **부트스트랩**: `/bootstrap-repos` 작성 및 1회 실행. 실제 레포 개수 확정.
3. **단건 측정**: `/scan-repo` 작성. 샘플 레포 1~2개로 R1~R3 분석·점수 기록 검증.
4. **단건 사이클**: `/analyze-repo` 작성. 동일 샘플로 T1→T2 게이트 동작 검증.
5. **배치 순회**: `/analyze-all` 작성. 배치 크기 5로 드라이런·재개 검증.
6. **문서 레이어**: `content/repositories.ts` 스키마, `RepoList` 컴포넌트(`LogList` 복제), 빈 `repositories/index.mdx`, `_meta.ts`, `updates.ts` 등록.
7. **자동 업서트 연결**: `/analyze-all`의 승급 스텝에 `repositories.ts`·`updates.ts` 자동 업서트 추가. 샘플 레포 E2E 검증.
8. **T1 완주**: `/analyze-all`을 반복 세션으로 돌려 전체 레포 T1까지 완주(여러 세션).
9. **T2 심화**: T1 통과분에 대해 `/analyze-all` 재실행.
10. **T3 심화**: T2 통과분에 대해 `/analyze-all` 재실행.
11. **승격**: `/extract-insights` → T4 인사이트 생성. 필요 시 `/sync-model`.
12. **마스터 루프 통합**: `/research-cycle`에 레포 단계 통합.

단계 1~7은 인프라, 8~12는 실제 연구 실행이다. 7까지 완료되면 사용자는 세션만 돌리면 데이터가 자동 누적된다.

## 9. 단위와 경계

- **루브릭**(인프라 단위): 한 파일, 사람 소유, 불변. 변경 시 전체 재측정 각오.
- **커맨드**(제어 단위): 각 커맨드는 단일 책임 — scan은 측정, analyze는 측정+승급, analyze-all은 배치 제어.
- **상태**(데이터 단위): `repo-scores.tsv`가 유일한 진실 원천. 모든 커맨드가 이 파일을 읽고 쓴다.
- **문서 데이터**(표현 단위): `repositories.ts`가 단일 진실 원천. 손으로 쓰지 않고 커맨드가 갱신.
- **컴포넌트**(렌더 단위): `RepoList`는 `repositories.ts`만 의존. 내부 구현은 `LogList`를 참조해 복제.

## 10. 테스트·검증 전략

- **단계 3 이후 각 단계에서 샘플 레포 1~2개로 end-to-end 검증**. 전체 207개에 나가기 전에 파이프라인 전체가 한 레포에 대해 정상 동작함을 확인.
- **루브릭 점수의 수동 교차 검증**: 초기 10개 레포에 대해 점수를 사람이 확인하고 루브릭 기준이 의도대로 작동하는지 본다. 게이트 컷이 너무 느슨·빡빡하면 이 시점에 한 번만 조정(이후 고정).
- **문서 노출 검증**: T2 승급된 샘플 레포가 실제로 `content/education-experiment/repositories/` 아래 나타나고 `RepoList`에 렌더되는지 로컬 `npm run dev`로 확인.
- **재개 안정성 검증**: `/analyze-all`을 중간에 중단하고 재실행했을 때 동일 레포가 중복 처리되지 않는지 확인.

## 11. 범위 밖 (YAGNI)

- 사설/아카이브 레포 분석: 공개 레포만 대상으로 한다.
- 비-`woowacourse` org 확장: 현 설계는 단일 org 전용.
- 실시간 동기화: 주기적 `/bootstrap-repos` 재실행으로 충분. 웹훅·cron 기반 자동 동기화는 구현하지 않는다.
- 저장소 코드 품질 정적 분석: D1~D5는 교육적 가치 중심. 린트·보안 스캔 등은 범위 밖.
- 학습자 개인 식별·프로파일링: 분석은 집계·패턴 수준에서만. 개별 크루 단위 평가는 하지 않는다.

## 12. 열린 결정 사항 (구현 중 확정)

- 배치 크기 N의 튜닝: 기본 5로 시작, 첫 실행 후 관찰 기반 조정.
- `repositories/<repo-slug>.mdx` 개별 페이지 템플릿 구조: T2/T3에서 다르게 표현할지 여부는 단계 6에서 결정.
- `RepoList` 필터 UX(티어 탭 vs 체크박스 vs 드롭다운)는 단계 6에서 결정.

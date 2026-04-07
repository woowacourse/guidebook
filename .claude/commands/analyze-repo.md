# 레포 1개 분석 사이클 (측정 → 게이트 → 승급)

> `/scan-repo`의 측정 결과를 기반으로 루브릭 게이트를 확인하고 티어를 승급시킨다.
> 승급 시 문서 레이어(`repositories.ts`·`updates.ts`)도 자동 업서트한다.

## 인자

$ARGUMENTS — 레포 이름. 필수.

## 절차

### Step 1: /scan-repo 로직 실행

`.claude/commands/scan-repo.md`의 Step 1~6을 그대로 수행한다 (측정 + TSV의 점수 컬럼 업데이트, `tier`는 아직 건드리지 않음).

### Step 2: 게이트 판정

현재 티어에 따라:

- **T0 → T1**: 측정이 수행되었으면 항상 승급 (T0은 수집 상태일 뿐). `last_scanned`만 있으면 T1.
- **T1 → T2**: 총점 ≥ 13 **또는** D2 ≥ 4
- **T2 → T3**: 총점 ≥ 18 **그리고** D3 ≥ 4
- **T3 이상**: `/analyze-repo` 범위 밖. "T3 이상은 /extract-insights 영역입니다." 출력 후 종료.

게이트 미달이면 승급 없이 "점수 {N}/25, 게이트 미달로 T{현재} 유지" 출력 후 종료(커밋은 Step 5에서).

### Step 3: 티어 승급

게이트 통과 시 `repo-scores.tsv`의 `tier` 컬럼을 다음 티어로 교체한다.

### Step 4: T2 이상 승급 시 문서 레이어 업서트

**T2 이상으로 승급한 경우에만** 다음을 수행한다 (T1 승급은 문서에 노출하지 않음).

#### 4a. `content/repositories.ts` 업서트

파일을 읽고, 해당 `slug`(레포 이름 그대로) 엔트리가 있으면 `tier`, `score`, `lastScanned`를 업데이트한다. 없으면 배열 맨 위에 새 엔트리를 추가한다.

엔트리 형식:
```ts
{
  slug: '{repo-name}',
  name: '{repo-name}',
  title: '{레포 한국어 제목 — README 또는 description 기반으로 생성}',
  description: '{한 줄 요약 — 분석 노트 기반}',
  category: '미션' | '도구' | '문서' | '인프라' | '기타',
  tier: 'T2' | 'T3',
  score: N,
  href: '/education-experiment/repositories/{repo-name}',
  url: 'https://github.com/woowacourse/{repo-name}',
  lastScanned: 'YYYY-MM-DD',
}
```

`category` 결정:
- `is_mission=true` → '미션'
- 이름에 `docs`/`wiki`/`guidelines` → '문서'
- 이름에 `infra`/`template`/`cli` → '인프라' 또는 '도구'
- 그 외 → '기타'

#### 4b. `_meta.ts`에 hidden 항목 추가

`content/education-experiment/repositories/_meta.ts`를 읽고, 해당 레포 슬러그가 없으면 다음과 같이 추가한다 (사이드바 오염 방지 — 사용자는 `<RepoList />`로 탐색):

```ts
'{repo-name}': {
  title: '{한국어 제목}',
  display: 'hidden',
},
```

#### 4c. `content/education-experiment/repositories/{repo-name}.mdx` 생성

아직 없으면 생성한다. 내용은 분석 노트의 요약(타이틀, description, 주요 발견, GitHub 링크). 이미 있으면 건드리지 않는다 (사람 편집 보존).

최소 템플릿:
```mdx
---
title: {title}
---

# {title}

> [GitHub: woowacourse/{repo-name}](https://github.com/woowacourse/{repo-name})
>
> 분석 티어: T{N} · 점수: {N}/25 · 마지막 스캔: YYYY-MM-DD

## 개요

{description 확장판}

## 주요 발견

{분석 노트에서 추출한 3~5개 핵심 포인트}

## 원본 데이터

`.research/repos/{repo-name}.md` 에 전체 분석 노트가 있습니다.
```

#### 4d. `content/updates.ts` 업서트

배열 맨 위에 다음 항목을 추가 (동일 href가 이미 있으면 스킵):

```ts
{
  date: '2026년 연구',
  title: '{title}',
  description: '{description}',
  href: '/education-experiment/repositories/{repo-name}',
  status: 'active',
}
```

### Step 5: 커밋

승급이 일어났다면:

```bash
git add .research/repo-scores.tsv content/repositories.ts content/updates.ts \
        content/education-experiment/repositories/{repo-name}.mdx
git commit -m "research({repo-name}): promote to T{N} (score {X}/25)"
```

승급이 없었다면 TSV만 커밋:

```bash
git add .research/repo-scores.tsv
git commit -m "research({repo-name}): rescan (score {X}/25, stay T{N})"
```

### Step 6: 결과 보고

```
## 분석 결과: {repo-name}

점수: {N}/25
티어: T{before} → T{after} ({승급|유지})
문서 업서트: {예|아니오}
```

## 제약

- 한 번에 한 레포만 처리.
- 세션당 티어 1개 원칙: 이 커맨드는 한 티어만 올린다 (예: T1→T2만, T2→T3으로 연달아 올라가지 않는다).
- `content/education-experiment/repositories/{repo-name}.mdx`가 이미 존재하면 덮어쓰지 않는다.

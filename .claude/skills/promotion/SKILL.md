---
name: promotion
description: "실험 로그와 검증된 패턴을 교육 모델(curriculum, philosophy)에 반영하고, 검증된 도구(tools/)와 검증된 패턴(insights/)을 추출한다. /sync-model 커맨드와 동일한 기준 적용. 승격 실행, 교육 모델 동기화, sync-model, 검증된 패턴 정리, 커리큘럼에 반영, 교육 철학에 반영 요청 시 반드시 이 스킬을 사용할 것."
---

# 승격 실행 — 교육 모델 동기화

## 시작 전 필수

`.claude/promotion-rubric.md`를 읽는다. 승격 판정 기준(P1~P4, 20점 만점)이 여기에 있다.

## 승격 경로 결정

| 조건 | 승격 대상 | 위치 |
|------|-----------|------|
| P2 ≥ 4 | 검증된 도구 | `content/education/tools/` |
| P3 ≥ 4 | 검증된 패턴 | `content/education/insights/` |
| P4 ≥ 4 + P1 ≥ 3 | 검증된 패턴 강화 | `content/education/insights/` 해당 패턴 문서 |
| P4 ≥ 4 + P1 ≥ 3 | 커리큘럼 원칙 | `content/education/curriculum/` 해당 문서 |
| P4 ≥ 4 + P1 ≥ 4 | 교육 철학 | `content/education/philosophy/core-principles.mdx` |

복수 조건 충족 시 복수 대상에 동시 승격한다.

## 반영 원칙

- 기존 문장·문단을 삭제하거나 재작성하지 않는다. **추가만 한다.**
- 반영하는 내용에 원본 로그·인사이트 링크를 반드시 포함한다.
- 한 사이클에 교육 모델(curriculum + philosophy) 반영은 **최대 3건**.
- 각 반영을 개별 커밋한다.

## 섹션별 반영 패턴

### 검증된 패턴 강화 (insights/)

P4 ≥ 4 + P1 ≥ 3 후보는 별도 카탈로그가 아니라 `content/education/insights/`의 해당 패턴 문서에 반영한다.
대응 패턴 문서가 없으면 새로 만들고(insight-extraction 스킬 협력), 있으면 "적용 가이드"·"근거 로그"를 보강해 검증 강도를 높인다.

### 기존 섹션에 사례 추가 (curriculum/, philosophy/)
```mdx
> **실험 근거**: [{인사이트 제목}](/education/insights/{slug})에서
> {N}개 로그의 교차 분석으로 확인된 패턴. 상세 기록은
> [{로그 제목}](/education/logs/{slug}) 참조.
```

### 도구 문서 작성 (tools/)
```mdx
# {도구명}

<Callout>
{한 줄 요약: 이 도구가 해결하는 문제}
</Callout>

## 사용 조건
## 단계별 절차
## 템플릿/프롬프트
## 출처
- 원본 로그: [{로그 제목}]({링크})
```

## 역참조 추가

반영 완료 후, 검증된 패턴 문서의 "교육 모델 연결" 섹션을 업데이트한다:

```mdx
- [교육 철학 > 핵심 교육 원칙 > {원칙}](/education/philosophy/core-principles#{앵커}) — ✅ 반영 완료 ({날짜})
```

## 메타데이터 업데이트

반영 후 `content/updates.ts`에 항목 추가:
```ts
{
  date: '{기수}',
  title: '{반영 제목}',
  description: '실험 로그에서 검증된 {패턴/원칙}을 교육 모델에 반영.',
  href: '/education/{경로}',
  status: 'active',
}
```

## 커밋 형식

```
promote "{로그/패턴 제목}" → {대상} ({점수 정보})
sync model: "{인사이트 제목}" → education/{섹션}
```

## 제약

- 승격 루브릭(`.claude/promotion-rubric.md`)을 수정하지 않는다.
- 인사이트에 근거가 없는 내용을 교육 모델에 추가하지 않는다.
- 한 사이클 교육 모델 반영 최대 3건 초과 시 P4×P1 곱 기준 상위 3건만 처리.

# TecoWay 별 메타포 재구성 — 설계 (spec)

- 날짜: 2026-07-02
- 상태: 승인됨 (브레인스토밍 완료)
- 요청: TecoWay(랜딩 'Hero 다음' 섹션)의 뻔한 3원칙을, 성장 여정 페이지의 행성이 캐릭터 + 별 컨셉 메타포로 우테코의 10개월을 자연스레 드러내는 우테코만의 스토리텔링으로 바꾼다.
- 선행: `docs/superpowers/specs/2026-07-01-랜딩-서사-아크-design.md`(TecoWay 최초 생성). 이 스펙은 그 TecoWay의 **본문 재구성**이다.

## 배경 — 현재 TecoWay와 자산

현재 `components/TecoWay.tsx`: `Eyebrow("우테코라는 곳") + 제목 + 735 리드 + Claim 3개`(01 진짜 미션 / 02 페어·리뷰 / 03 스스로 '왜'). 사용자 평가: 3원칙이 "뻔하다".

재사용 자산:
- `content/growth-arc.ts` — 레벨0~5 성장 아크. 레벨0 제목이 "낯선 별에 도착", 마감이 "빛나는 개발자로". 별 메타포가 이미 있음.
- `/education/journey`(CrewGrowth) — 행성이가 작은 별에서 빛나는 별로 커지는 6단계 전체 여정. 단, **랜딩에서 이 페이지로 가는 링크가 없다**.
- 캐릭터 포즈: `행성이-반짝`(빛나는 별), `행성이-유성`(유성) 등 별 메타포에 맞는 포즈 존재.
- `crewCount = 735`(`content/crew-voices.ts`) — 735 throughline의 단일 원천.

## 목표 (성공 기준)

1. **뻔함 제거** — 번호 원칙 3개를 없애고, 우테코만이 할 수 있는 스토리텔링 한 단락으로 대체한다.
2. **10개월을 자연스레** — 별 메타포(작은 행성이 → 빛나는 별)로 10개월/레벨0~5를 이야기 안에 드러낸다.
3. **캐릭터 활용** — 성장 여정 페이지의 행성이를 랜딩에도 등장시켜 두 페이지가 한 우주를 공유하게 한다.
4. **구체성 보존** — 우테코의 how(진짜 미션·페어/코드리뷰·동료와 함께·스스로 '왜')를 이야기 문장에 녹인다(불릿 아님).
5. **throughline 유지** — 735를 여기서 소개해, 다운스트림 별자리("앞서 본 735명")·행선지("그 735명")의 지시 대상을 보존한다.
6. **랜딩→journey 연결** — 랜딩에 없던 `/education/journey` 진입점을 TecoWay에 만든다.

## 결정 사항 (브레인스토밍)

- **방향**: 한 캐릭터 + 별 메타포 카피. TecoWay는 짧은 선언으로 유지(6단계 레일은 journey 페이지 몫 — 중복 회피, 링크로 연결).
- **카피 배합**: 이야기 속에 구체성을 녹이기(3~4문장 서사, 불릿 없음).
- **캐릭터**: `행성이-반짝`(빛나는 별) 기본, 은은한 glow. 대안 `행성이-유성`.

## 구현 대상

### 1) 컴포넌트 — `components/TecoWay.tsx` (수정)

- `Claim`(`./Manifesto`) import·사용 **제거**. `Eyebrow`·`crewCount` 유지.
- 구조: `<section>` → `<Eyebrow>` + 캐릭터 `<img>`(glow 래퍼) + `<h2>`(제목) + `<p>`(서사 한 단락, `{crewCount}` 포함) + journey 링크(`next/link` 또는 `<a>` — 형제 컴포넌트 패턴 따름; EnterDocs가 `next/link` 사용).
- 캐릭터 이미지: `/images/characters/행성이-반짝.png`, `alt=""`(장식), glow 래퍼 `aria-hidden`.

**초안 카피** (합니다체, em-dash 금지. 팀 검수로 자유 수정):

- Eyebrow: `우테코의 10개월`
- 제목(h2): `작은 행성이가, 스스로 빛나는 별이 되어 떠납니다`
- 서사(p):
  `우테코의 10개월은, 작은 행성이 하나가 낯선 별에 내려앉는 데서 시작합니다. 강의를 듣는 대신 진짜 미션을 손으로 풀고, 혼자가 아니라 페어와 코드리뷰로 동료와 함께 부딪히고, 답을 받기보다 스스로 '왜'를 물으며 한 단계씩 밝아집니다. 레벨 0에서 5를 지나는 사이 스스로 빛나게 된 크루가 지금까지 {crewCount}명입니다. 이 별들이 이제 소프트웨어 생태계로 걸어 나갑니다.`
  (735는 `<strong>{crewCount}명</strong>`으로 강조)
- 링크: `10개월, 어떻게 자라는지 →` → `/education/journey`

> 카피 주의: em-dash 없음(쉼표·마침표). "낯선 별"은 growth-arc 레벨0 표현과 일치(의도). "동료와 함께"가 별자리 payoff, "735·생태계로 걸어 나감"이 별자리·행선지 setup·throughline을 유지.

### 2) 스타일 — `components/TecoWay.module.css` (수정)

- 기존 `.section`·`.heading`·`.lede`(+다크 토큰) **유지**. `.claims` 관련 클래스는 제거(더 이상 Claim 없음).
- 추가: 캐릭터 `.figure`/`.pose`(중앙, 반응형 `max-width:100%`, 폭 지정), 은은한 `.glow`(Hero/CrewJourney glow 토큰 참고), 다크모드 라인아트 대비(`:global(.dark) .pose { filter: invert(1) }` 패턴 — CrewJourney.module.css 참고), journey 링크 `.journeyLink`(Nextra 링크 밑줄 강제 회피: 링크 클래스에 `text-decoration:none` 패턴 — 기존 Card/AssetCard 사례).
- 모바일: 캐릭터·본문이 세로로 자연스럽게. 가로 오버플로우 금지(정적 모바일 린트 0건 유지).

### 3) 배선 — 변경 없음

- `mdx-components.tsx`·`components/index.ts`: TecoWay는 이미 등록·export됨. 추가 배선 불필요.
- `_meta.ts`·`updates.ts`·`logs.ts`: 해당 없음(신규 페이지 아님, 랜딩 컴포넌트 내부 변경).

## 검증

- `npm run dev` 라이브 서버 SSR: eyebrow·제목·서사·`735`·journey 링크(`/education/journey`)가 모두 렌더되는지 curl로 확인. Claim 잔재(01/02/03)가 없는지 확인.
- `npm run lint:mobile`(정적): `TecoWay.module.css`에 신규 오버플로우 위험 0건(캐릭터 이미지 `max-width` 동반).
- 다크모드: 캐릭터 라인아트가 보이고 텍스트 대비 충분(형제 컴포넌트와 동일 처리).
- 735 throughline 3곳(TecoWay 서사 · 별자리 "앞서 본 735" · 행선지 "그 735")이 여전히 이어지는지 확인.
- 브라우저 잠금 해제 시 `/모바일점검`으로 라이브 뷰포트(375·360·640) 육안 마무리.

## 범위 밖 (YAGNI)

- 6단계 성장 레일을 랜딩에 복제(→ journey 페이지 몫, 링크로만 연결).
- `growth-arc.ts`·`CrewGrowth`·`/education/journey` 수정.
- CrewVoiceMap·CrewJourney 수정(throughline 카피는 이미 정렬됨).
- 신규 일러스트 제작(기존 18종에서만 고름).
- 스크롤 애니메이션 신설(기존 `Reveal` 래퍼만).

## 구현 규율

saligo(살아있게) — 카피/구조 교체 → 캐릭터·glow 스타일 → journey 링크 → 다크·모바일 확인. 각 단계마다 라이브 dev 서버로 살아있음 확인. 커밋은 정확한 파일만 add(병렬 세션 WIP와 격리).

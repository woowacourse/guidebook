---
source_type: planning
captured: 2026-04-14
published_at: docs/plans/2026-04-14-interview-challenge-assetization.md
---

# 인터뷰 챌린지 자산화 계획

## 목표

유튜브 재생목록 `#우아한테크코스 인터뷰 챌린지`의 45개 영상을 링크, 스크립트, 반복 질문, 교육적 시사점 단위로 재구성해 `content/education/conversations` 섹션에 점진적으로 등록한다.

## 2026-04-14 기준 확인된 사실

- 재생목록 수량: 45개
- 총 재생 시간: 31,336초, 약 8시간 42분 16초
- 우선 등록 위치: `content/education/conversations`
- 자막 수집 결과: 45개 중 43개 한국어 자동 자막(`ko`) 확보
- 현재 누락 확인: 7번 `F12 팀을 소개합니다`, 11번 `우테코 프론트엔드 리뷰어 로이, 아사에게 묻다`
- 정리 텍스트 생성 결과: 43개 `.txt` 변환 완료

## 왜 바로 개별 문서 45개를 만들지 않는가

- 자동 자막 품질 편차가 있어서, 먼저 원본 수집과 정규화가 끝나야 질문/답변 단위를 안정적으로 나눌 수 있다.
- 제목만으로는 교육적 가치가 높은 영상과 가벼운 이벤트성 영상을 구분하기 어렵다.
- 현재 레포에는 수다 타임 아카이브 패턴이 있으므로, 먼저 인덱스 페이지를 만들고 이후 고가치 인터뷰부터 개별 자산으로 승격하는 편이 유지보수에 유리하다.

## 제안하는 등록 단위

1. 인덱스 자산
- 재생목록 전체 링크 인벤토리
- 묶음별 분류
- 수집 진행 현황

2. 근거 자산
- 원본 자막 `.vtt`
- 시간표시가 포함된 정리 텍스트 `.txt`

3. 해석 자산
- 영상별 핵심 질문
- 답변 요약
- 반복 주제 태그
- 우테코 교육 철학과 연결되는 패턴

4. 승격 자산
- 개별 인터뷰 문서
- 교차 패턴 문서
- 교육 모델/운영 인사이트 문서

## 묶음 전략

- 코치·리뷰어 인터뷰
- 팀/조직 소개
- 크루 개인 인터뷰
- 릴레이/교차 인터뷰
- 놀이형 콘텐츠

이렇게 나누면 45개를 한 번에 쓰기보다, 성격이 비슷한 영상끼리 비교 분석이 가능해진다.

## 실행 절차

1. 링크 인벤토리 고정
- 재생목록 번호, 제목, URL, 길이를 표준화한다.

2. 자막 원본 수집
- 가능한 영상은 `ko` 자동 자막을 내려받는다.
- 자막이 없는 영상은 누락 사유를 남긴다.

3. 자막 정규화
- `.vtt`를 시간표시 포함 `.txt`로 변환한다.
- 중복 캡션과 태그를 제거해 LLM 분석 입력으로 쓸 수 있게 만든다.

4. 1차 분석
- 각 영상의 질문 유형
- 답변 톤
- 우테코 조직/교육 맥락
- 반복 패턴 후보

5. 문서 승격
- 우선순위가 높은 묶음부터 개별 MDX 문서를 만든다.
- `content/updates.ts`와 `conversations/_meta.ts`를 함께 갱신한다.

## 현재 작업 산출물

- `content/education/conversations/interview-challenge-archive.mdx`
- `scripts/interview-challenge/normalize-vtt.mjs`
- `scripts/interview-challenge/README.md`
- `.temp/interview-challenge/raw/`
- `.temp/interview-challenge/clean/`

## 실행 명령

```bash
# 1. 재생목록 링크/메타데이터 확인
yt-dlp --flat-playlist --dump-single-json 'https://www.youtube.com/watch?v=_DTT3DwFm_U&list=PLgXGHBqgT2TvIil7QNcnkTrZHAwCP7ldZ'

# 2. 한국어 자동 자막 수집
yt-dlp --skip-download --write-auto-subs --sub-langs ko --sub-format vtt \
  -o '.temp/interview-challenge/raw/%(playlist_index)02d-%(id)s.%(ext)s' \
  'https://www.youtube.com/watch?v=_DTT3DwFm_U&list=PLgXGHBqgT2TvIil7QNcnkTrZHAwCP7ldZ'

# 3. 자막 정리본 생성
node scripts/interview-challenge/normalize-vtt.mjs \
  .temp/interview-challenge/raw \
  .temp/interview-challenge/clean
```

## 완료 기준

- 45개 전부 링크 인벤토리에 반영
- 자막 성공/실패 현황 표준화
- 정리 텍스트 생성
- 최소 1개 묶음 이상의 분석 문서 초안 생성
- conversations 섹션에서 사람이 바로 탐색 가능한 상태

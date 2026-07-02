# 페이지 업데이트 소스 레지스트리

`/페이지업데이트` 커맨드가 참조하는, "자라는 콘텐츠" 소스 목록. 커맨드 절차는 `.claude/commands/페이지업데이트.md`에 있고, 소스별 차이(어디서 세는지·무엇을 고치는지·함정)는 전부 이 파일이 담는다. **새 소스 추가 = 여기에 섹션 추가.**

상태 표기: `실측` = 갱신 파일럿을 끝까지 돌려 검증한 레시피 / `조사` = 소스·파일 경로만 확인, 첫 갱신 때 레시피 보강 필요.

---

## 뉴스레터 `실측 2026-07-03`

- **라이브 소스**: <https://maily.so/wooteco.newsletter/>
- **항목 열거법**: 목록 페이지 HTML을 curl로 받아 `<a href=".../posts/SLUG">` 카드에서 제목·날짜·`N호` 추출. 첫 페이지에 최신 10개(더 밀렸으면 페이지네이션 확인).
  - ⚠️ 함정: 푸터의 메일리 사업자 주소에 `501-2-31호`가 있어 `N호` 패턴이 오탐된다. 카드 영역 안에서만 매칭할 것.
  - ⚠️ 19호(2025-10-31)↔20호(2026-05-27) 사이 7개월 공백 = 기수 전환. 긴 공백은 결번이 아니라 시즌 경계일 수 있다.
- **갱신 대상**:
  - `content/education/conversations/newsletter-archive.mdx` — 인라인 테이블형
  - `llm-wiki/raw/YYYY-MM-DD-newsletter-NN-<슬러그>.md` (호수당 1개, 원문 보존)
  - `llm-wiki/raw/derived/newsletter-archive.md` (mdx-to-raw.mjs 재생성)
  - `content/updates.ts`
- **기계적 표면**: 전체 목록 표(행 추가), Callout `전체 발행 수`·`분석 범위`
- **계수 의존 문구(편집 표면)**: "N개를 순서대로 읽어보면", H2 "N개를 다 읽고 나면 보이는 …가지 흐름"과 하위 흐름 절, 관찰 표 헤더 "N개 뉴스레터에서", "무엇이 궁금하면 어디서부터 읽을까" 표, "한 줄로 요약하면"
- **마지막 갱신**: 2026-07-03, 22호까지 (아카이브 22 / 라이브 22)

## 테코톡 `실측 2026-07-03`

- **라이브 소스**: 유튜브 재생목록 [#우아한테크코스 테코톡](https://www.youtube.com/playlist?list=PLgXGHBqgT2TvpJ_p9L_yZKPifgdBOzdVH) (채널: 우아한테크)
- **항목 열거법**:
  - 빠른 계수: `yt-dlp --flat-playlist --print "%(playlist_count)s" --playlist-items 1 <URL>` — 단, 이 값은 **비공개·삭제 영상 포함**이라 실제 나열 가능 수보다 클 수 있다(2026-07 기준 689 vs 686).
  - 전체 열거: `python3 scripts/youtube/enumerate-playlist.py <URL> <out.json>` — YouTube가 재생목록을 lockupViewModel 레이아웃으로 바꿔 **yt-dlp(2026.06 기준)가 102개에서 끊긴다**. 이 스크립트는 InnerTube continuation을 직접 돌아 전량 열거한다(id·원제목·길이·조회수 텍스트).
  - 신선도 판정은 **열거된 listed 수 vs data.json `summary.totalVideos`** + ID diff로 한다(계수만 비교하면 비공개분 +3이 영구 드리프트로 보인다).
- **갱신 절차 (실측)**:
  1. enumerate-playlist.py로 전량 열거 → ID diff (신규/사라짐 확인)
  2. `.temp/techtalk/playlist.json` 합성: 열거 원제목 + **기존 data.json의 viewCount 병합**(정확도 보존), 신규 항목만 조회수 텍스트 파싱(천/만 근사)
  3. `node scripts/techtalk/build-index.mjs` → data.json 재생성 (build 스크립트는 `{title, entries:[{id,title,duration,view_count,url}]}` 형식을 기대)
  4. `techtalk-archive.mdx` 계수 3곳: Callout 영상 수·총 분량, "이 페이지는 이렇게 보면" 문단, "현재 자산화 범위" 문단
- **갱신 대상**: `techtalk-data.json` + `techtalk-archive.mdx` + derived 미러 + `content/updates.ts`
- **마지막 갱신**: 2026-07-03, 686편·137시간 33분 (신규 18, 비공개 전환 1 제거)

## 브이로그 `조사`

- **라이브 소스**: 유튜브 재생목록 [우테코 브이로그](https://www.youtube.com/playlist?list=PLgXGHBqgT2Ttc-rSCpg7SQqL6lzLHEiC6)
- **항목 열거법**: 재생목록 영상 수 vs `vlog-data.json` `summary.totalVideos`(28) 대조.
- **갱신 대상**: `vlog-data.json` — `scripts/vlog/build-report.mjs`가 `.temp/vlog/playlist.json` + `.temp/vlog/clean/*.txt`(자막 정리본)에서 생성 + `vlog-archive.mdx` Callout 계수 + derived 미러 + `content/updates.ts`
- **주의**: `.temp/`는 gitignore 산출물 — 새 영상 추가 시 재생목록 수집과 자막 정리(transcript)부터 다시 해야 한다. `scripts/vlog/README.md` 참고.
- **마지막 갱신**: 28편 (transcriptOk 26).

## 프로젝트 데모데이 `조사`

- **라이브 소스**: 유튜브 재생목록 [데모데이](https://www.youtube.com/playlist?list=PLgXGHBqgT2TsWUA5puZimG3DDlJTd370Q)
- **항목 열거법**: 재생목록 영상 수 vs `demo-day-data.json` `summary.totalVideos`(194) 대조.
- **갱신 대상**: `demo-day-data.json` (`scripts/demo-day/build-report.mjs`) + `demo-day-archive.mdx` Callout 계수·묶음 표 + derived 미러 + `content/updates.ts`
- **주의**: 브이로그와 같은 `.temp/` 파이프라인 구조로 추정 — 첫 갱신 때 입력 경로 확인. 100편 초과 재생목록이므로 전량 열거는 테코톡과 같이 `scripts/youtube/enumerate-playlist.py`를 쓴다.
- **마지막 갱신**: 194편 (transcriptOk 187).

## 교육 설명회 `조사`

- **라이브 소스**: 유튜브 재생목록 [교육 설명회](https://www.youtube.com/playlist?list=PLgXGHBqgT2TsfkEyC9Ca9k28kfSsFSdQI)
- **항목 열거법**: 재생목록 영상 수 vs `education-briefing-data.json` `summary.totalVideos`(23) 대조.
- **갱신 대상**: `education-briefing-data.json` (`scripts/education-briefing/build-report.mjs`) + `education-briefing-archive.mdx` + derived 미러 + `content/updates.ts`
- **마지막 갱신**: 23편. 기수별 설명회라 연 1~2회 단위로만 자란다.

## 인터뷰 챌린지 `조사`

- **라이브 소스**: 유튜브 재생목록 [인터뷰 챌린지](https://www.youtube.com/playlist?list=PLgXGHBqgT2TvIil7QNcnkTrZHAwCP7ldZ)
- **항목 열거법**: 재생목록 영상 수 vs 아카이브 Callout `총 영상 수`(45) 대조.
- **갱신 대상**: `interview-challenge-archive.mdx` — 인라인 테이블형 + derived 미러 + `content/updates.ts`. 자막 정리는 `scripts/interview-challenge/normalize-vtt.mjs`.
- **마지막 갱신**: 45편.

## 우테코 유튜브 채널 `조사`

- **라이브 소스**: [@우아한테크코스 채널](https://www.youtube.com/@우아한테크코스/videos)
- **항목 열거법**: 채널 공개 영상 수 vs 아카이브 `채널 공개 영상 수`(5) 대조. ⚠️ 채널 /videos 탭은 `yt-dlp --print playlist_count`가 NA를 반환한다(2026-07 실측) — `scripts/youtube/enumerate-playlist.py`로 열거하거나 채널 페이지에서 수동 확인.
- **갱신 대상**: `uteco-youtube-archive.mdx` — 인라인형, 사이드바 hidden 페이지. + derived 미러.
- **주의**: 영상 5개를 "핵심 질문 다섯 가지"로 엮은 서사라, 영상이 늘면 표 행 추가가 아니라 서사 재구성이 필요할 수 있다(편집 표면 비중 큼).
- **마지막 갱신**: 5편.

## 테코블 `조사·휴면`

- **라이브 소스**: <https://tecoble.techcourse.co.kr> — Gatsby 정적 블로그. 열거는 `https://tecoble.techcourse.co.kr/page-data/index/page-data.json`.
- **항목 열거법**: page-data.json의 글 수 vs `tecoble-data.json` `summary.totalPosts`(252) 대조.
- **갱신 대상**: `tecoble-data.json` + `tecoble-archive.mdx` + derived 미러.
- **주의**: 마지막 글이 2023-11-23 — 발행이 멈춘 상태다. 신선도 리포트에서 밀림 0이 정상이며, 재개가 감지되면 그때 레시피를 실측으로 승격.
- **마지막 갱신**: 252편 (snapshot 2026-04-21).

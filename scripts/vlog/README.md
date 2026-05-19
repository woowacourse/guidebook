# Vlog Utilities

우아한테크코스 브이로그 재생목록을 자산화하기 위한 보조 스크립트 모음이다.

## 현재 포함된 도구

- `build-report.mjs` — `.temp/vlog/playlist.json` 과 `.temp/vlog/clean/*.txt` 를 읽어
  브이로그 탐색용 리포트 JSON을 생성한다.

## 사용 예시

```bash
node scripts/vlog/build-report.mjs
```

위 명령은 다음 파일을 다시 생성한다.

- `.temp/vlog/report.json`
- `content/education/conversations/vlog-data.json`

생성된 리포트에는 아래 정보가 포함된다.

- 카테고리별 묶음
- 자주 찾는 키워드 집계
- 궁금한 질문별 추천 영상 묶음
- 영상별 요약, 태그, 자막 상태

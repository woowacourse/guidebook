# Interview Challenge Utilities

우아한테크코스 인터뷰 챌린지 재생목록을 자산화하기 위한 보조 스크립트 모음이다.

## 현재 포함된 도구

- `normalize-vtt.mjs` — YouTube 자동 자막 `.vtt` 파일을 시간표시가 있는 정리 텍스트로 변환한다.

## 사용 예시

```bash
node scripts/interview-challenge/normalize-vtt.mjs \
  .temp/interview-challenge/raw \
  .temp/interview-challenge/clean
```

위 명령은 `.temp/interview-challenge/raw` 아래의 `.vtt` 파일들을 찾아,
같은 파일명 기준의 `.txt` 정리본을 `.temp/interview-challenge/clean` 아래에 생성한다.

출력 형식은 아래와 같다.

```text
[00:00:00] 네 안녕하세요 우테코 릴레이 인터뷰
[00:00:03] MC 맡게 된 백엔드 장수입니다
[00:00:05] 그리고 오늘은 프런트엔드 6기 수수를
```

이 파일은 후속 분석에서 다음 용도로 사용한다.

- 질문/답변 구간 빠르게 훑기
- 반복 주제 태깅
- 개별 자산 문서 초안 생성
- 자막 누락/품질 이슈 확인

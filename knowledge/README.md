# Knowledge — LLM Wiki

이 디렉터리는 우테코 코칭 실험·관찰·외부 자료를 LLM이 읽고, 그 위에 백과사전식 노트를 만드는 작업 공간이다. 안드레 카파시의 LLM Wiki 패턴(2026-04-03 Gist)을 따른다.

> "Obsidian is the IDE. The LLM is the programmer. The wiki is the codebase." — Andrej Karpathy

## 구조

```
knowledge/
├── README.md      이 파일 (팀 온보딩)
├── AGENTS.md      LLM이 따를 운영 스키마
├── index.md       모든 wiki 노트의 한 줄 카탈로그 (LLM 라우팅 테이블)
├── log.md         운영 일지 (append-only)
├── raw/           1차 자료. **절대 수정 금지 (append-only).**
│   ├── conversations/   코치·크루 대화 사본 (익명화 필요)
│   ├── external/        외부 책·논문·아티클 발췌 (출처 인용)
│   ├── assets/          이미지·스크린샷
│   └── (실험 로그·회고는 raw/ 루트에 flat)
└── wiki/          LLM이 raw에서 합성한 백과 노트 (납작한 구조)
```

## 팀원이 자주 하는 작업

| 하고 싶은 것 | 어디에 두는가 |
|---|---|
| 실험 직후 거친 메모·회고 | `raw/YYYY-MM-DD-제목.md` (루트에 flat) |
| 코치·크루 대화 사본 | `raw/conversations/` |
| 외부 책·논문 발췌 | `raw/external/` |
| 이미지·스크린샷 | `raw/assets/` |
| 백과 노트 작성 | LLM에 시킨다 (직접 wiki/ 편집도 OK) |

## 절대 규칙

1. **raw/ 안 파일은 절대 수정하지 않는다.** 한 번 들어오면 불변. 오류가 있어도 wiki에서 정정한다 — 그래야 모든 wiki 주장이 출처로 역추적된다.
2. **wiki/ 노트는 한 노트 = 한 아이디어.** 두 아이디어면 두 파일로 분리.
3. **wiki/ 안에 하위 폴더를 만들지 않는다.** 분류는 frontmatter `tags:` 로.
4. **새 wiki 노트를 만들면 같은 턴에 `index.md` 에 한 줄 등록한다.**

## 공식 문서(`content/`)와의 관계

`knowledge/` 는 **사고 공간**, `content/` 는 **발행 공간** 이다. 둘은 완전히 분리되어 있고 흐름은 단방향이다.

```
실험·대화·관찰 → knowledge/raw/ → knowledge/wiki/ → (큐레이션) → content/education/
```

`content/` 를 직접 편집하지 말고, wiki 노트가 무르익으면 큐레이션해서 발행한다. 반대 방향(공식 문서 → 위키)은 없다.

## 참고

- [Karpathy의 LLM Wiki Gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- 자세한 운영 규약: [`AGENTS.md`](./AGENTS.md)
- 현재 위키 카탈로그: [`index.md`](./index.md)

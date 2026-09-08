# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

개인용 할 일 관리 웹 앱. 서버, 회원가입, 빌드 도구, 프레임워크 없이 `index.html`을 브라우저에서 바로 열어서 쓰는 순수 HTML/CSS/JavaScript 프로젝트다. 전체 요구사항 정의는 `PRD.md` 참고.

## 두 버전 구조 (주의)

- 루트(`index.html`/`style.css`/`script.js`) — 모바일 화면 중심의 기본 버전
- `web_version/` (동일한 파일 구성) — 사이드바 + 카드 그리드 레이아웃의 데스크톱 전체 화면 버전

두 버전은 **완전히 독립된 사본**이다. `script.js`의 CRUD/localStorage 로직이 양쪽에 그대로 복제되어 있으므로, 한쪽 로직(추가/수정/삭제/필터/진행률 계산 등)을 고치면 다른 쪽 `script.js`도 반드시 함께 업데이트해야 한다.

## 데이터 모델

```js
Todo {
  id: number        // Date.now() 기반 고유 식별자
  title: string
  category: "업무" | "개인" | "공부"
  completed: boolean
  createdAt: number
}
```

## 저장 방식

`localStorage`의 `'todos'` 키에 배열 전체를 JSON으로 저장한다. `loadTodos`/`saveTodos`는 try/catch로 감싸져 있어, 저장 실패(용량 초과, 프라이빗 모드 등) 시 예외를 던지지 않고 조용히 넘어가도록 설계되어 있다.

## 실행 방법

빌드나 설치 과정 없음. 각 버전 폴더의 `index.html`을 더블클릭하거나 브라우저로 열면 된다 (예: `web_version/index.html`).

## 파일 구조

```
index.html, style.css, script.js   기본 버전
web_version/                        데스크톱 버전 (동일 파일 구성)
PRD.md                              제품 요구사항 문서
README.md                           프로젝트 소개
```

커밋/브랜치/PR 규칙은 저장소 루트의 `CLAUDE.md` 참고.

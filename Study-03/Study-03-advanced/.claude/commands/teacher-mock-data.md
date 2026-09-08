---
description: 테스트용 가짜 학생 기록 파일을 N명 분량 생성한다 ($1=학생 수, 기본 5)
---

`/teacher-report`를 실제 학생 데이터 없이도 테스트할 수 있도록, 가상
학생들의 내보내기 JSON 파일을 만든다.

학생 수: $1 (비어 있으면 5)
저장 폴더: $2 (비어 있으면 `.claude/teacher-data/samples`)

## 절차

1. `questions.js`를 읽어 실제 존재하는 `category` 값 목록을 확인한다
   (하드코딩하지 않는다).
2. $1명(기본 5명)의 가상 학생을 만든다. 실존 인물처럼 보이지 않는
   가명을 쓴다(예: "학생A"~"학생E" 또는 흔한 가명). 학생마다 3~6개의
   게임 기록을 생성한다.
3. 각 기록은 `storage.js`의 `saveGameResult`가 실제로 저장하는 필드를
   모두 채운다: `mode`(`full`/`category`/`speed` 중 하나), `category`
   (`mode`가 `'category'`일 때만 값 설정, 그 외엔 `null`),
   `totalScore`, `correctAnswers`, `totalQuestions`, `accuracy`,
   `avgResponseTime`, `longestStreak`, `categoryScores`, `timestamp`
   (최근 몇 주 내로 분산).
   - `accuracy`는 `correctAnswers`/`totalQuestions`와 실제로 일치해야
     한다.
   - `categoryScores`의 각 `{correct, total}` 합이 `totalQuestions`와
     일치해야 한다.
4. 학생 간 실력 편차를 의도적으로 다르게 만든다 — 한두 명은 전반적으로
   우수, 한두 명은 특정 카테고리에만 약점, 한 명은 최근 기록으로
   갈수록 점수가 상승하는 추세를 갖게 한다. `/teacher-report`의 비교·
   추세 기능이 의미 있게 테스트되도록 하기 위함이다.
5. `/teacher-setup`이 정의한 내보내기 스키마와 동일하게
   `{ studentName, exportedAt, history: [...] }` 형태의 JSON을 학생당
   하나씩 만들어 저장 폴더에 쓴다. 파일명은
   `student_{studentName}_{YYYYMMDD}.json`.
6. 저장 폴더가 없으면 새로 만든다. 저장한 각 파일을 다시 읽어 유효한
   JSON으로 파싱되고 3번의 필수 필드를 모두 갖췄는지 확인한다.

## 출력 형식

생성한 파일 목록과, 학생별 요약(이름, 게임 수, 평균 점수, 의도한
특징 — 예: "과학 약점")을 표로 보여준다. 이 데이터는 테스트용 샘플임을
분명히 표시한다.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

한국사·세계지리·과학·예술과 문화 4개 카테고리, 총 40문제로 구성된 4지선다 상식 퀴즈 게임의 **확장 버전**. `../Study-03-basic/`의 기본 퀴즈 게임에 로컬 기록 저장·리더보드·내 통계·다크모드·사운드·"선생님 모드", 그리고 문제 관리용 슬래시 명령을 얹었다. 서버·빌드 도구 없이 `index.html`을 브라우저에서 바로 연다. 두 버전을 아우르는 전체 설명은 `../README.md` 참고.

basic과 같은 문제 데이터에서 출발했지만 이후 독립적으로 관리되므로, 두 폴더의 `questions.js`가 서로 다를 수 있다.

## 실행 방법

`index.html`을 더블클릭하거나 브라우저로 열면 된다. 설치/빌드 과정 없음.

## 기능

### basic과 공통

- 3가지 게임 모드(전체 도전/카테고리별 도전/스피드 퀴즈), 힌트·콤보·응답시간 보너스 점수 시스템, 즉시 피드백, 일시정지, 키보드 단축키

### 확장 전용

- `localStorage` 기반 게임 기록 저장, 리더보드(전체/주간/일간 · 카테고리 필터), 내 통계(카테고리별 정답률·최근 점수 추이)
- 다크모드(`applyTheme`/`initTheme`), 사운드 효과(`playTone`/`playCorrectSound`/`playIncorrectSound`), 결과 공유(클립보드 복사)
- 학생 이름 입력 + 기록을 JSON으로 내보내는 "선생님 모드" — 여러 학생의 내보내기 파일을 모아 `/teacher-report`(또는 `/teacher-mode`) 슬래시 명령으로 반 전체 비교 리포트를 생성
- 문제 관리용 슬래시 명령: `/quiz-add`, `/quiz-check`, `/quiz-stats`, `/quiz-leaderboard`, `/quiz-range`, `/quiz-validate`, `/quiz-daily`

## 구조

- `questions.js` — `quizQuestions` 배열. 데이터 모델은 basic과 동일: `{id, category, difficulty, question, options[4], correctAnswer(인덱스), explanation}`
- `storage.js` — `LocalDataManager` 클래스. `localStorage` 키는 `quizGameHistory`/`quizTheme`/`quizSoundEnabled`/`quizStudentName`. 게임 기록 저장(`saveGameResult`), 최고 점수/플레이 횟수, 기간·카테고리별 리더보드(`getLeaderboard`), 카테고리별 누적 통계(`getCategoryStats`), 최근 점수 추이(`getRecentScores`), 선생님 모드 내보내기(`exportHistory`)를 담당.
- `script.js` — 게임 로직. `ScoreManager` 클래스(점수/콤보/힌트)는 basic과 동일한 구조이고, 여기에 테마(`applyTheme`)·사운드(`playTone` 계열)·화면 전환(`showScreen`)·리더보드/통계 렌더링(`renderLeaderboard`, `renderStats`)이 추가되어 있다. 게임 흐름 자체(`initGame` → `loadQuestion` → `handleAnswer` → `nextQuestion` → `endGame` → `displayResults`)는 basic과 동일한 이름의 함수로 구성됨 — 두 버전에서 같은 로직을 고칠 때는 함수명 대조로 대응 지점을 찾을 수 있다.
- `index.html`/`style.css` — 마크업/스타일. 다크모드용 CSS 변수 테마 포함.
- `.claude/commands/` — 문제 관리·선생님 모드용 슬래시 명령 정의(`quiz-*.md`, `teacher-*.md`).
- `.claude/teacher-data/` — `samples/`(테스트용 학생 기록 JSON), `reports/`(생성된 비교 리포트), `submissions/`(실제 학생 제출 파일이 들어가면 그것을 우선 사용, 비어있으면 samples로 대체).
- `.claude/backups/` — 문제 데이터(`questions.js`) 수정 전 자동 백업본. 슬래시 명령이 문제를 고칠 때 생성한다.

## 퀴즈 문제 작성 가이드라인

새 문제를 추가하거나 `/quiz-add` 등으로 수정할 때 다음을 확인한다:

1. 정답이 하나뿐인가? — 다른 해석이 가능하면 조건을 명시한다 (예: 면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가? — '가장 큰', '최초의' 등에는 측정 기준을 명시한다
3. 시간과 범위가 명확한가? — 변할 수 있는 정보는 시점을, 지리적·분류적 범위는 한정해서 명시한다
4. 교차 검증했는가? — 의심스러운 정보는 2개 이상 출처로 확인하고, 논란 있는 내용은 주류 학설을 기준으로 한다

공통 규칙(커밋/브랜치/PR)은 모노레포 루트의 `../../CLAUDE.md`를 따른다.

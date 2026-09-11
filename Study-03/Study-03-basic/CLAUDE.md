# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

한국사·세계지리·과학·예술과 문화 4개 카테고리, 총 40문제로 구성된 4지선다 상식 퀴즈 게임의 **기본 버전**. 서버·회원가입·빌드 도구 없이 `index.html`을 브라우저에서 바로 연다. 기록 저장·리더보드·다크모드 등을 얹은 확장판은 `../Study-03-advanced/`, 두 버전을 아우르는 전체 설명은 `../README.md` 참고.

## 실행 방법

`index.html`을 더블클릭하거나 브라우저로 열면 된다. 설치/빌드 과정 없음.

## 기능

- 3가지 게임 모드: 전체 도전(40문제·무제한), 카테고리별 도전(10문제), 스피드 퀴즈(20문제·문제당 15초)
- 힌트(오답 2개 제거, 최대 3회), 연속 정답 콤보 보너스, 응답 시간 보너스를 반영한 점수 시스템
- 문제별 즉시 피드백(정답/오답 표시 + 해설), 일시정지, 키보드 단축키(숫자키 답변, H 힌트, P 일시정지, Enter 다음 문제)

## 구조

- `questions.js` — `quizQuestions` 배열. 문제 데이터 모델: `{id, category, difficulty, question, options[4], correctAnswer(인덱스), explanation}`
- `script.js` — 게임 로직 전체. `ScoreManager` 클래스가 점수/콤보/힌트 계산을 담당하고, 나머지는 함수형 흐름으로 구성됨: `initGame` → `buildQuestionSet`(모드별 문제 구성, `shuffleArray`로 무작위화) → `loadQuestion` → `handleAnswer`/`showAnswerFeedback` → `nextQuestion` → `endGame` → `displayResults`. 모드별 제한시간은 `startQuestionTimer`/`updateTimerUI`가 관리.
- `index.html`/`style.css` — 마크업/스타일. 프레임워크·외부 라이브러리 없음.
- 게임 기록은 저장되지 않는다(새로고침하면 초기화) — 기록/통계가 필요하면 advanced 버전을 사용한다.

## 퀴즈 문제 작성 가이드라인

새 문제를 `questions.js`에 추가할 때 다음을 확인한다:

1. 정답이 하나뿐인가? — 다른 해석이 가능하면 조건을 명시한다 (예: 면적 기준, 2024년 기준)
2. 최상급 표현에 기준이 있는가? — '가장 큰', '최초의' 등에는 측정 기준을 명시한다
3. 시간과 범위가 명확한가? — 변할 수 있는 정보는 시점을, 지리적·분류적 범위는 한정해서 명시한다
4. 교차 검증했는가? — 의심스러운 정보는 2개 이상 출처로 확인하고, 논란 있는 내용은 주류 학설을 기준으로 한다

공통 규칙(커밋/브랜치/PR)은 모노레포 루트의 `../../CLAUDE.md`를 따른다.

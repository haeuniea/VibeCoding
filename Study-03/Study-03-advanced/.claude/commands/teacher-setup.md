---
description: 선생님 모드의 기반인 학생 이름 입력·기록 내보내기 기능을 앱에 구현한다
---

`index.html`/`script.js`/`storage.js`에 "학생 이름 캡처"와 "내 기록
JSON으로 내보내기" 기능을 추가한다. 이 결과물(내보내기 JSON)이
`/teacher-report`가 여러 학생 성적을 비교하는 데 쓰는 원본 데이터가
된다.

- 이미 구현되어 있다면(아래 요소가 이미 존재하면) 다시 만들지 않는다.
  무엇이 이미 있는지 확인하고 중단한다.

## 절차

1. 이미 구현됐는지 먼저 확인한다. `storage.js`에 `exportHistory`,
   `index.html`에 `studentNameInput`, `exportHistoryBtn`이 이미 있으면
   중복 구현하지 말고 사용자에게 알린 뒤 중단한다.
2. `storage.js`의 `STORAGE_KEYS`에 `STUDENT_NAME: 'quizStudentName'`을
   추가하고, `LocalDataManager`에 다음 메서드를 추가한다.
   - `getStudentName()` / `setStudentName(name)`: 마지막으로 입력한
     학생 이름을 localStorage에 저장·조회한다.
   - `exportHistory(studentName)`: `{ studentName, exportedAt: new
     Date().toISOString(), history: this.getGameHistory() }` 형태의
     객체를 반환한다. 이 스키마는 `/teacher-report`, `/teacher-check`가
     그대로 기대하는 형태이므로 필드명을 바꾸지 않는다.
3. `index.html`을 수정한다.
   - `#startScreen`의 `.start-content` 안, `.categories-preview`와
     `.mode-selection` 사이에 이름 입력 필드를 추가한다
     (`id="studentNameInput"`, placeholder "이름을 입력하세요").
   - `#statsScreen`의 `#statsBackBtn` 옆에 내보내기 버튼을 추가한다
     (`id="exportHistoryBtn"`, 라벨 "📤 내 기록 내보내기").
   - 기존 마크업의 들여쓰기·클래스 네이밍 규칙(`btn btn-ghost` 등)을
     그대로 따른다.
4. `script.js`를 수정한다.
   - 화면 로드 시 `studentNameInput.value`를 `dataManager.getStudentName()`
     값으로 채워둔다.
   - `startBtn` 클릭 핸들러에서 이름을 읽어 `gameState.studentName`에
     저장하고, `dataManager.setStudentName(...)`으로 기억한다. 값이
     비어 있으면 `'익명'`으로 채운다(기존 흐름을 막지 않는다 — 이름을
     강제로 요구하지 않는다).
   - `displayResults()`의 `dataManager.saveGameResult({...})` 호출에
     `studentName: gameState.studentName` 필드를 추가한다.
   - `exportHistoryBtn` 클릭 핸들러를 추가한다: `dataManager.exportHistory(...)`
     결과를 `JSON.stringify(..., null, 2)`로 만들고, `Blob` +
     `URL.createObjectURL` + 임시 `<a download>`로 파일을 내려받게
     한다. 파일명은 `quiz_기록_{studentName}_{YYYYMMDD}.json` 형태로
     만들되, 파일명에 쓸 수 없는 문자(공백/슬래시 등)는 치환한다.
     다운로드 트리거 후 `URL.revokeObjectURL`로 정리한다.
     기록이 없으면(`getGameHistory().length === 0`) 다운로드 대신
     안내 메시지를 보여준다.
5. 수정한 세 파일이 서로 참조하는 id/필드명이 전부 일치하는지 다시
   읽어 확인한다(특히 `studentNameInput`, `exportHistoryBtn`,
   `studentName` 필드명).

## 출력 형식

파일별로 추가된 요소(HTML id, JS 메서드/필드명)를 목록으로 보여준다.
마지막에 교사가 학생 파일을 모아둘 위치(`.claude/teacher-data/submissions/`)를
안내한다 — 이 폴더는 이 명령이 만들지 않으며 `/teacher-report`가 처음
실행될 때 없으면 만든다.

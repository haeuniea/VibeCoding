---
description: 선생님 모드 구현(학생 이름 캡처·기록 내보내기·리포트 스키마)의 정합성을 점검한다
---

`/teacher-setup`으로 구현한 학생 이름 캡처·기록 내보내기 기능이
`storage.js`·`script.js`·`index.html` 사이에서, 그리고
`/teacher-mock-data`·`/teacher-report`가 기대하는 스키마와 일관되게
맞물려 있는지 점검한다. 실행 중인 브라우저의 `localStorage`는 직접
조회할 수 없으므로 코드와 파일 스키마 자체의 정합성 검증에 집중한다.

## 절차

1. `storage.js`의 `exportHistory`가 `{ studentName, exportedAt, history }`
   형태를 정확히 반환하는지, `getStudentName`/`setStudentName`이 같은
   `STORAGE_KEYS.STUDENT_NAME` 키를 함께 쓰는지 확인한다.
2. `index.html`의 `#studentNameInput`, `#exportHistoryBtn` id가
   `script.js`에서 참조하는 id와 정확히 일치하는지 확인한다. 철자가
   다르면 버튼이 조용히 동작하지 않는 버그가 되므로 반드시 짚는다.
3. `script.js`의 `displayResults()` 안 `saveGameResult({...})` 호출에
   `studentName` 필드가 실제로 포함되는지, 이름이 비어 있을 때 기본값
   처리(`'익명'` 등)가 되는지 확인한다.
4. 내보내기 다운로드 로직을 점검한다.
   - `Blob`/`URL.createObjectURL` 사용 후 `URL.revokeObjectURL`을
     호출해 정리하는가?
   - 파일명에 공백·슬래시 등 다운로드를 깨뜨릴 수 있는 문자를
     치환하는가?
   - 기록이 0개일 때(빈 배열) 다운로드를 막고 안내 메시지를 보여주는가?
5. `/teacher-mock-data.md`가 생성하는 샘플 JSON 필드명과
   `/teacher-report.md`가 파싱하는 필드명이 완전히 같은지 세 파일
   (`teacher-setup.md`, `teacher-mock-data.md`, `teacher-report.md`)을
   비교해 대조한다.
6. `.claude/teacher-data/`(`submissions/`, `samples/`, `reports/`)
   폴더 경로 표기가 세 명령 파일에서 서로 일치하는지 확인한다.

## 출력 형식

점검 항목별로 ✅(문제없음) 또는 ⚠️(불일치 발견)로 표시하고, ⚠️인 경우
어느 파일 몇 번째 줄에서 무엇이 불일치하는지, 어떻게 고치면 되는지
구체적으로 제안한다. 사용자가 동의하면 그때 수정한다 — 먼저 파일을
수정하지 않는다.

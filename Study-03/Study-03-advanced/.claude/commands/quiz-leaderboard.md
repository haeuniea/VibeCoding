---
description: 리더보드/순위 시스템 구현(storage.js·script.js·index.html)의 정합성을 점검한다
---

`storage.js`의 `LocalDataManager`와 `script.js`의 리더보드 관련 코드,
`index.html`의 리더보드 화면 마크업을 함께 검토해 순위 시스템이 일관되게
구현되어 있는지 점검한다. 실행 중인 브라우저의 `localStorage` 데이터를
직접 조회할 수는 없으므로, 코드 자체의 정합성을 검증하는 데 집중한다.

## 절차

1. `storage.js`의 `getLeaderboard`가 다음을 올바르게 수행하는지 확인한다.
   - `period`(`allTime`/`weekly`/`daily`) 필터링의 기준 시간 계산이
     정확한가?
   - `category`가 지정됐을 때만 걸러지고, 비어 있으면 전체를 대상으로
     하는가?
   - 점수 내림차순 정렬과 `limit` 적용이 올바른가?
2. `index.html`의 `#leaderboardCategoryFilter`에 있는 카테고리
   `<option>` 값들이 `questions.js`에 실제로 존재하는 `category` 값과
   전부 일치하는지 확인한다. 철자가 다르면(공백, 오타 등) 리더보드에
   해당 카테고리 기록이 하나도 안 잡히는 조용한 버그가 되므로 반드시
   짚는다.
3. `script.js`의 `renderLeaderboard`가 `GAME_MODES`의 키와 라벨을
   올바르게 참조하는지 확인한다 (존재하지 않는 모드 키를 참조하면
   화면에 `undefined`가 표시될 수 있다).
4. `#periodFilter` 안 버튼들의 `data-period` 값이 `getLeaderboard`가
   기대하는 값(`allTime`/`weekly`/`daily`)과 일치하는지 확인한다.
5. `displayResults`에서 `saveGameResult`로 저장하는 필드(`mode`,
   `category`, `totalScore`, `categoryScores` 등)가 `renderLeaderboard`,
   `renderStats`에서 실제로 읽는 필드명과 전부 일치하는지 확인한다.

## 출력 형식

점검 항목별로 ✅(문제없음) 또는 ⚠️(불일치 발견)로 표시하고, ⚠️인 경우
어느 파일 몇 번째 줄에서 무엇이 불일치하는지, 어떻게 고치면 되는지
구체적으로 제안한다. 사용자가 동의하면 그때 수정한다 — 먼저 파일을
수정하지 않는다.

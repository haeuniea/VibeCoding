# 할 일 관리 앱

개인용 할 일 관리 웹 앱. 서버, 회원가입, 빌드 도구 없이 `index.html`을 브라우저에서 바로 열어서 사용한다.

## 실행 방법

`index.html`을 더블클릭하거나 브라우저로 열면 된다.

## 기능

- 할 일 추가 / 수정 / 삭제 (빈 값 등록 방지, 삭제 시 확인)
- 텍스트 입력 후 Enter로도 추가 가능
- 완료 체크(체크박스 토글), 완료 항목은 취소선으로 표시
- 카테고리(업무/개인/공부) 분류 및 색상 태그
- 카테고리별 필터(전체/업무/개인/공부)
- 진행률 바 및 "n / 전체 완료" 표시
- `localStorage`에 저장되어 새로고침·브라우저 재시작 후에도 데이터 유지

## 파일 구조

```
index.html   마크업
style.css    스타일
script.js    로직 (CRUD, localStorage 연동, 렌더링)
PRD.md       제품 요구사항 문서
```

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

## 기술 스택

프레임워크·빌드 도구 없이 순수 HTML/CSS/JavaScript로 작성.

## 범위 외 (v1 기준)

마감일/알림, 우선순위/정렬, 다크 모드, 다중 기기 동기화, 데이터 내보내기/가져오기. 자세한 내용은 `PRD.md` 참고.

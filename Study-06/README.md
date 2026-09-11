# Study-06 — 쇼핑 리스트 앱

서버 없이 브라우저에서 바로 실행되는 간단한 쇼핑 리스트 웹앱입니다. 데이터는 Supabase 데이터베이스에 저장됩니다.

## 기능

- 아이템 이름 + 수량 입력 후 추가
- 체크박스로 완료 표시 (취소선 처리)
- 삭제 버튼으로 즉시 삭제
- Supabase `shopping_items` 테이블에 저장되어 새로고침/재접속/다른 기기에서도 목록 유지
- 이전에 `localStorage`에 저장돼 있던 데이터가 있으면 최초 접속 시 1회 자동으로 Supabase로 이전

## 실행 방법

`index.html` 파일을 브라우저에서 열면 바로 사용할 수 있습니다. 별도 설치나 서버 실행이 필요 없습니다. Supabase 프로젝트 URL과 anon(publishable) key는 `index.html`에 포함되어 있으며, 접근 제어는 Supabase Row Level Security로 처리합니다.

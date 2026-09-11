# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

서버 없이 브라우저에서 바로 실행되는 쇼핑 리스트 웹앱. 아이템 이름/수량 입력, 체크(완료 표시), 삭제 기능을 제공하며 데이터는 Supabase `shopping_items` 테이블에 저장된다.

이 폴더는 `index.html` 단일 파일로 구성되어 있고, 동일한 내용이 별도 배포 전용 레포 [`haeuniea/shopping-listapp`](https://github.com/haeuniea/shopping-listapp)에도 복사되어 Vercel(https://shopping-listapp-ivory-xi.vercel.app/)에 배포된다. **`index.html`을 수정했다면 `shopping-listapp` 레포의 `index.html`/`README.md`에도 동일하게 반영하고 main에 push해야 실제 배포에 반영된다** (이 레포는 별도 git remote이며 VibeCoding과 브랜치/PR 워크플로가 다르다 — main에 직접 push).

## 아키텍처

- 완전 클라이언트 단일 HTML 파일(`index.html`). 빌드 도구 없음.
- Supabase JS(v2, `cdn.jsdelivr.net`의 UMD 빌드)를 CDN으로 로드해 브라우저에서 직접 `shopping_items` 테이블에 CRUD.
  - 프로젝트 URL과 anon(publishable) key가 `index.html`에 인라인되어 있음 — RLS로 보호되므로 클라이언트 노출이 정상.
  - Supabase client 변수명은 `supabaseClient`. UMD 스크립트가 전역 `window.supabase`(네임스페이스)를 이미 선점하므로 `const supabase = ...`로 재선언하면 충돌한다.
- 아이템 추가/체크/삭제는 각각 Supabase insert/update/delete 호출 후 로컬 `items` 배열과 화면을 갱신.
- 정렬은 `created_at` 오름차순.
- 기존 `localStorage`(`shopping-list-items`)에 저장된 데이터가 있으면 최초 접속 시 1회 Supabase로 자동 이전하고(`shopping-list-migrated` 플래그로 재실행 방지), localStorage는 비운다.

## Supabase 스키마

프로젝트: `haeuniea's Project` (`hdehyoeodsyrqoojxcef`, ap-northeast-2)

```sql
create table shopping_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  qty integer not null default 1,
  checked boolean not null default false,
  created_at timestamptz not null default now()
);

alter table shopping_items enable row level security;

create policy "anon full access" on shopping_items
  for all to anon using (true) with check (true);

grant select, insert, update, delete on public.shopping_items to anon;
```

로그인/인증이 없는 개인 학습용 앱이라 anon 역할에 전체 CRUD 권한을 허용했다. RLS 정책만으로는 부족하고 테이블 GRANT도 별도로 필요하다(정책 없이 GRANT만 있거나, GRANT 없이 정책만 있으면 `permission denied`/`42501` 에러 발생).

## 실행 방법

`index.html`을 브라우저에서 열면 바로 사용할 수 있다. 별도 설치나 서버 실행이 필요 없다.

## 공통 규칙

커밋/브랜치/PR 규칙은 모노레포 루트의 `../CLAUDE.md`를 따른다.

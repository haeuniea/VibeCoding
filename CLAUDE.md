# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

개인 학습 프로젝트 모음(monorepo)이다. `Study-01`, `Study-02`, `Study-03`... 각 폴더는 독립된 프로젝트이며, 폴더별 아키텍처·실행 방법은 해당 폴더 안의 `CLAUDE.md`를 따른다. 아래 규칙은 모든 프로젝트에 공통으로 적용된다.

## 커밋 규칙

- Conventional Commits 형식 (feat:, fix:, docs: 등)
- 커밋 메시지는 한글로 작성
- 제목은 50자 이내
- type 뒤에 대상 프로젝트 이름을 붙인다 (예: `feat: Study-03 로그인 기능 추가`)

## 브랜치 규칙

- Study-03부터는 프로젝트마다 `feature/Study-03`처럼 `feature/<프로젝트명>` 브랜치를 만들어 작업하고, 완료되면 PR로 main에 merge한다
- main 직접 커밋 금지 (Study-03부터 적용. Study-01, Study-02는 기존 방식대로 main 직접 커밋으로 진행되었음)
- 그 외 브랜치는 feature/, fix/, hitfix/ 접두사 사용

## PR 규칙

- PR 설명에 관련 이슈 번호 포함
- 테스트 계획 필수 포함

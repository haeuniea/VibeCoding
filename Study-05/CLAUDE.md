# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 상태

Study-05는 아직 시작되지 않은 프로젝트다. 현재 폴더에는 소스 코드, 매니페스트 파일(package.json, requirements.txt 등), 테스트, 빌드/lint 설정, README가 전혀 없다. 존재하는 파일은 `.env`(git 미추적) 하나뿐이며, 여기에는 `OPENROUTER_API_KEY` 변수만 정의되어 있다.

## 예정된 스택

`.env`에 정의된 `OPENROUTER_API_KEY`로 미루어 OpenRouter API를 사용할 예정이다. 그 외 언어/프레임워크/아키텍처는 아직 코드가 없어 확정된 바가 없다 — 추측해서 문서화하지 않는다.

## 공통 규칙

커밋/브랜치/PR 규칙은 모노레포 루트의 `../CLAUDE.md`를 따른다.

## 다음 단계

실제 코드가 추가되면 이 문서를 다음 내용으로 갱신해야 한다: 실행/빌드/테스트 명령어, 디렉터리 구조, 주요 아키텍처(엔트리 포인트, 컴포넌트 간 연결 흐름).

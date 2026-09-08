# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Study-04는 초기 단계로, OpenRouter API 호출을 위한 최소 스캐폴딩만 존재한다.

## 실행 방법

```
pip install -r requirements.txt
python main.py
```

## 환경 변수

- `OPENROUTER_API_KEY`: `.env` 파일에 저장한다. `.env`는 `.gitignore`에 등록되어 커밋되지 않는다.
- `.env.example`을 참고해 `.env`를 직접 만든다. 키는 절대 커밋하거나 로그/출력에 노출하지 않는다.
- `config.py`가 `python-dotenv`로 `.env`를 로드하고 `OPENROUTER_API_KEY`를 환경변수에서 읽는다. 키가 없으면 `KeyError`로 즉시 실패한다.

## 모델

텍스트·이미지 인식 모두 `google/gemma-4-26b-a4b-it:free` 하나로 처리한다 (text+image+video→text 멀티모달 무료 모델). 무료 모델이라 업스트림(Google AI Studio) 공유 풀에서 간헐적으로 429(rate limit)가 발생할 수 있다 — 정상적인 현상이며 재시도로 대응한다.

## 구조

- `config.py`: 환경변수 로딩 (모든 API 키 접근은 여기를 거친다)
- `main.py`: OpenRouter(`https://openrouter.ai/api/v1`)에 OpenAI SDK로 호출하는 예제. `chat(prompt)`는 텍스트 질의, `describe_image(image_url, prompt)`는 이미지 인식/설명을 담당한다.

참고: `black-forest-labs/flux.2-klein-4b`는 이미지 인식이 아니라 이미지 생성/편집 모델이라 이 프로젝트 용도에 맞지 않아 사용하지 않는다.

프로젝트 목적과 실제 기능은 아직 정해지지 않았으며, 코드가 추가되면 이 문서를 갱신해야 한다. 공통 규칙(커밋/브랜치/PR)은 상위 `VibeCoding/CLAUDE.md`를 따른다.

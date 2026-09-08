# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

냉장고 사진에서 재료를 인식하고 레시피를 추천하는 웹 앱. `PRD_step1.md`(재료 인식) → `PRD_step2.md`(레시피 생성) → `PRD_step3.md`(사용자 프로필/저장) 3단계 모두 구현 완료.

## 실행 방법

```
pip install -r requirements.txt
python -m uvicorn app:app --reload
```
브라우저에서 http://127.0.0.1:8000 접속.

스크립트로 개별 함수를 테스트하려면 `python main.py`.

## 환경 변수

- `OPENROUTER_API_KEY`: `.env` 파일에 저장한다. `.env`는 `.gitignore`에 등록되어 커밋되지 않는다.
- `.env.example`을 참고해 `.env`를 직접 만든다. 키는 절대 커밋하거나 로그/출력에 노출하지 않는다.
- `config.py`가 `python-dotenv`로 `.env`를 로드하고 `OPENROUTER_API_KEY`를 환경변수에서 읽는다. 키가 없으면 `KeyError`로 즉시 실패한다.

## 모델

텍스트·이미지 인식 모두 `google/gemma-4-26b-a4b-it:free` 하나로 처리한다 (text+image+video→text 멀티모달 무료 모델). 무료 모델이라 업스트림(Google AI Studio) 공유 풀에서 간헐적으로 429(rate limit)가 발생할 수 있다 — 정상적인 현상이며 재시도로 대응한다.

## 구조

- `config.py`: 환경변수 로딩 (모든 API 키 접근은 여기를 거친다)
- `main.py`: OpenRouter API를 직접 호출해보는 실험용 스크립트. `chat(prompt)`, `describe_image(image_url, prompt)`
- `vision.py`: 1단계 핵심 로직. `recognize_ingredients(image_bytes, content_type)`가 이미지를 base64 data URI로 변환해 모델에 보내고, JSON 배열 형태의 재료 목록을 파싱해 반환한다. 429는 최대 2회 재시도한다.
- `recipe.py`: 2단계 핵심 로직. `recommend_recipes(ingredients)`가 재료 목록을 프롬프트로 만들어 모델에 보내고, `title/used_ingredients/missing_ingredients/steps/estimated_time_minutes` 필드를 가진 레시피 배열로 파싱한다.
- `auth.py`: 3단계 핵심 로직. SQLite(`app.db`, gitignore 처리됨)에 회원/세션/저장된 레시피를 저장한다. 비밀번호는 `pbkdf2_hmac`로 솔트와 함께 해싱, 로그인 시 랜덤 토큰을 발급해 `sessions` 테이블에 저장한다(만료 없음, 학습용 단순 구현).
- `app.py`: FastAPI 서버. `GET /`는 `static/index.html`을 서빙하고, `/api/recognize-ingredients`(1단계), `/api/recommend-recipes`(2단계), `/api/signup`·`/api/login`·`/api/recipes/save`·`/api/recipes/saved`·`/api/recipes/saved/{id}`(3단계) 엔드포인트를 제공한다. 인증이 필요한 엔드포인트는 `Authorization: Bearer <token>` 헤더를 요구한다.
- `static/index.html`: 이미지 업로드 → 재료 인식/수정 → 레시피 추천 → 상세 보기 → 저장까지 이어지는 단일 페이지 프론트엔드. 순수 HTML/JS, 별도 빌드 도구 없음. 토큰은 `localStorage`에 보관.

참고: `black-forest-labs/flux.2-klein-4b`는 이미지 인식이 아니라 이미지 생성/편집 모델이라 이 프로젝트 용도에 맞지 않아 사용하지 않는다.

공통 규칙(커밋/브랜치/PR)은 상위 `VibeCoding/CLAUDE.md`를 따른다.

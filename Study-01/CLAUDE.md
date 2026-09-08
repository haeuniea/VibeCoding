# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A handwritten digit recognition project, split into two independent implementations that share the same model architecture and preprocessing algorithm but no runtime files:

- `desktop_version/` — Tkinter GUI, runs locally with no server. See `desktop_version/CLAUDE.md`.
- `web_version/` — Flask backend + HTML5 canvas frontend, runs as a local web server. See `web_version/CLAUDE.md`.

Not a git repo, no root-level package manager or tests — each subfolder is self-contained with its own `train_model.py` and `model.pkl`. There is no shared code between the two folders; if you change the MNIST preprocessing logic (bounding-box crop → 20px resize → center in 28x28) in one, update the equivalent function in the other (`digit_app.py`'s `preprocess` method vs. `app.py`'s `preprocess` function).

Read the relevant subfolder's `CLAUDE.md` for setup/run commands and version-specific architecture details before working in it.

## 커밋 규칙

- Conventional Commits 형식 (feat:, fix:, docs: 등)
- 커밋 메시지는 한글로 작성
- 제목은 50자 이내

## 브랜치 규칙

- feature/, fix/, hitfix/ 접두사 사용
- main 직접 커밋 금지

## PR 규칙
- PR 설명에 관련 이슈 번호 포함
- 테스트 계획 필수 포함
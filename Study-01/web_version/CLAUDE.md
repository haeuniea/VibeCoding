# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The web version of the handwritten-digit-recognition app: a Flask backend serves an HTML5 canvas frontend where the user draws a digit with the mouse/touch, and an `MLPClassifier` trained on MNIST predicts the digit server-side. See `../desktop_version/` for the Tkinter counterpart, which uses the same model architecture and preprocessing logic but is otherwise an independent codebase (own copy of `train_model.py` and `model.pkl` — the two do not share files at runtime).

## Environment

- Python interpreter: `C:\Users\apple\miniconda3\python.exe` (Python 3.13, miniconda). Not a project-local venv — packages are installed into this global miniconda environment via `pip install -r requirements.txt`.
- Required packages: see `requirements.txt` (`flask`, `numpy`, `pandas`, `scikit-learn`, `pillow`, `joblib`).

## Commands

Train (or retrain) the model — downloads MNIST (~15MB) from OpenML on first run via `fetch_openml`, caches it under `~/scikit_learn_data`, and writes `model.pkl` to this folder:

```
python train_model.py
```

Takes about a minute (30 MLP iterations, ~45s fit time). Requires internet access on first run only (subsequent runs reuse the OpenML cache).

Run the dev server (requires `model.pkl` to already exist):

```
python app.py
```

This starts Flask in debug mode on `http://127.0.0.1:5000/` (auto-reload on file changes). There is no build step, linter, or test suite in this project — verify changes by hitting the running server (e.g. `POST /predict` with a base64 PNG data URL, or opening the page in a browser and drawing a digit).

## Architecture

- `train_model.py` — identical training script to the desktop version: loads MNIST, fits an `MLPClassifier(hidden_layer_sizes=(128,))`, and serializes it to `model.pkl` with `joblib`. `app.py` never trains, only loads the model once at import time (module-level global, not per-request).
- `app.py` — Flask app with two routes:
  - `GET /` renders `templates/index.html`.
  - `POST /predict` accepts JSON `{"image": "data:image/png;base64,..."}` (a full canvas snapshot from the frontend), decodes it with PIL, runs `preprocess()`, and returns `{"digit": int, "confidence": float}`.
- `preprocess()` in `app.py` reproduces the classic MNIST normalization pipeline so the live-drawn input matches the training distribution: crop to the drawn content's bounding box, resize the longest side to 20px preserving aspect ratio, and paste centered into a blank 28x28 canvas. This must stay in sync with the equivalent logic in `desktop_version/digit_app.py` if either changes.
- `templates/index.html` — self-contained frontend (inline `<style>`/`<script>`, no build tooling, no external JS libraries). The canvas is filled black on load and stays black between strokes — the backend assumes a plain grayscale (`convert("L")`) image, not an image with a transparent background, so don't switch the canvas fill to `clearRect`/transparent without also updating `app.py`'s decoding. Drawing uses pointer position deltas (`lastX`/`lastY`) and supports both mouse and touch events. On "인식" click it POSTs `canvas.toDataURL('image/png')` to `/predict` and renders the returned digit/confidence.
- `model.pkl` is a generated build artifact (joblib-pickled `MLPClassifier`), not source — regenerate via `train_model.py` rather than hand-editing.

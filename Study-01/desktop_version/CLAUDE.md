# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The desktop version of the handwritten-digit-recognition app: a Tkinter canvas where the user draws a digit with the mouse, classified by an MLP (neural network) trained on MNIST. Standalone — no server, no network access needed at runtime (only for the one-time training download). See `../web_version/` for the browser-based counterpart, which shares the same model architecture and preprocessing logic but is otherwise an independent codebase (own copy of `train_model.py` and `model.pkl`).

## Environment

- Python interpreter: `C:\Users\apple\miniconda3\python.exe` (Python 3.13, miniconda). Not a project-local venv — packages are installed into this global miniconda environment via `pip install`.
- Required packages (not vendored, install if missing): `numpy`, `pandas`, `scikit-learn`, `pillow`, `joblib`.

## Commands

Train (or retrain) the model — downloads MNIST (~15MB) from OpenML on first run via `fetch_openml`, caches it under `~/scikit_learn_data`, and writes `model.pkl` to this folder:

```
python train_model.py
```

Takes about a minute (30 MLP iterations, ~45s fit time). Requires internet access on first run only (subsequent runs reuse the OpenML cache).

Run the app (requires `model.pkl` to already exist):

```
python digit_app.py
```

Or double-click `run_digit_app.bat` in Explorer — it `cd`s to its own directory and launches the app with `pythonw.exe` (no console window). The `.bat` hardcodes the miniconda `pythonw.exe` path, so if the Python install location ever changes, update `run_digit_app.bat` accordingly.

There is no build step, linter, or test suite in this project.

## Architecture

- `train_model.py` — one-shot offline training script. Loads MNIST via `sklearn.datasets.fetch_openml`, splits off a 10k-sample test set, fits an `MLPClassifier(hidden_layer_sizes=(128,))`, prints validation/test accuracy, and serializes the fitted classifier to `model.pkl` with `joblib`. Re-run this whenever the training logic changes; `digit_app.py` never trains, only loads.
- `digit_app.py` — the Tkinter GUI, single class `DigitRecognizerApp`. Key design point: it maintains **two parallel representations of the drawing** — the visible `tk.Canvas` (what the user sees) and an in-memory PIL `Image`/`ImageDraw` of the same strokes (what gets fed to the model). Every mouse-drag draws a line on both simultaneously (`paint`).
- Preprocessing (`DigitRecognizerApp.preprocess`) reproduces the classic MNIST normalization pipeline so the live-drawn input matches the training distribution: crop to the drawn content's bounding box, resize the longest side to 20px preserving aspect ratio, and paste centered into a blank 28x28 canvas. Skipping this step (e.g. naively downscaling the full 280x280 canvas) measurably hurts accuracy since MNIST digits are bounding-box-normalized and centered. `web_version/app.py` implements the identical algorithm server-side — keep the two in sync if this logic changes.
- `model.pkl` is a generated build artifact (joblib-pickled `MLPClassifier`), not source — regenerate via `train_model.py` rather than hand-editing. Current reference run: 97.85% test accuracy.

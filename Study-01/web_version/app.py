"""손글씨 숫자 인식 웹 서버.

브라우저 캔버스에서 그린 숫자 이미지(base64 PNG)를 받아 학습된 모델로 예측한다.
전처리 로직은 desktop_version/digit_app.py의 MNIST 스타일 정규화와 동일하다.
"""
import base64
import io

import joblib
import numpy as np
from flask import Flask, jsonify, render_template, request
from PIL import Image

app = Flask(__name__)
model = joblib.load("model.pkl")


def preprocess(image: Image.Image) -> np.ndarray | None:
    """캔버스 이미지를 MNIST 스타일(28x28, 중앙 정렬)로 변환한다."""
    arr = np.array(image)

    coords = np.argwhere(arr > 20)
    if coords.size == 0:
        return None

    y0, x0 = coords.min(axis=0)
    y1, x1 = coords.max(axis=0)
    cropped = image.crop((int(x0), int(y0), int(x1) + 1, int(y1) + 1))

    w, h = cropped.size
    scale = 20.0 / max(w, h)
    new_w, new_h = max(1, round(w * scale)), max(1, round(h * scale))
    cropped = cropped.resize((new_w, new_h), Image.LANCZOS)

    canvas28 = Image.new("L", (28, 28), color=0)
    offset = ((28 - new_w) // 2, (28 - new_h) // 2)
    canvas28.paste(cropped, offset)

    pixels = np.asarray(canvas28, dtype=np.float32) / 255.0
    return pixels.reshape(1, -1)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data_url = request.json["image"]
    header, encoded = data_url.split(",", 1)
    image_bytes = base64.b64decode(encoded)

    # 프론트엔드 캔버스는 검은 배경 위에 흰 글씨로 그리므로 단순 흑백 변환으로 충분하다.
    image = Image.open(io.BytesIO(image_bytes)).convert("L")

    features = preprocess(image)
    if features is None:
        return jsonify({"error": "empty"}), 400

    pred = int(model.predict(features)[0])
    proba = model.predict_proba(features)[0]
    confidence = float(proba[pred] * 100)
    return jsonify({"digit": pred, "confidence": confidence})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

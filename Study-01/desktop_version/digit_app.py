"""마우스로 숫자를 그리면 학습된 모델이 인식하는 GUI 앱."""
import tkinter as tk
from tkinter import messagebox

import joblib
import numpy as np
from PIL import Image, ImageDraw

CANVAS_SIZE = 280  # 28 * 10, 확대해서 그리기 편하게
PEN_WIDTH = 18


class DigitRecognizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("손글씨 숫자 인식")

        try:
            self.model = joblib.load("model.pkl")
        except FileNotFoundError:
            messagebox.showerror(
                "모델 없음",
                "model.pkl을 찾을 수 없습니다. 먼저 train_model.py를 실행해 학습하세요.",
            )
            root.destroy()
            return

        # 실제 픽셀 데이터를 담을 PIL 이미지 (검은 배경 + 흰 글씨, MNIST와 동일한 방식)
        self.image = Image.new("L", (CANVAS_SIZE, CANVAS_SIZE), color=0)
        self.draw = ImageDraw.Draw(self.image)

        self.canvas = tk.Canvas(
            root, width=CANVAS_SIZE, height=CANVAS_SIZE, bg="black", cursor="cross"
        )
        self.canvas.grid(row=0, column=0, columnspan=3, padx=10, pady=10)
        self.canvas.bind("<B1-Motion>", self.paint)
        self.canvas.bind("<ButtonRelease-1>", self.reset_last_point)

        self.last_x, self.last_y = None, None

        self.result_label = tk.Label(
            root, text="숫자를 그리고 [인식] 버튼을 누르세요", font=("Arial", 16)
        )
        self.result_label.grid(row=1, column=0, columnspan=3, pady=(0, 10))

        predict_btn = tk.Button(
            root, text="인식", font=("Arial", 12), command=self.predict
        )
        predict_btn.grid(row=2, column=0, padx=10, pady=10, sticky="ew")

        clear_btn = tk.Button(
            root, text="지우기", font=("Arial", 12), command=self.clear
        )
        clear_btn.grid(row=2, column=1, padx=10, pady=10, sticky="ew")

        quit_btn = tk.Button(root, text="종료", font=("Arial", 12), command=root.destroy)
        quit_btn.grid(row=2, column=2, padx=10, pady=10, sticky="ew")

    def paint(self, event):
        x, y = event.x, event.y
        if self.last_x is not None:
            self.canvas.create_line(
                self.last_x,
                self.last_y,
                x,
                y,
                width=PEN_WIDTH,
                fill="white",
                capstyle=tk.ROUND,
                smooth=True,
            )
            self.draw.line(
                [self.last_x, self.last_y, x, y], fill=255, width=PEN_WIDTH
            )
        self.last_x, self.last_y = x, y

    def reset_last_point(self, event):
        self.last_x, self.last_y = None, None

    def clear(self):
        self.canvas.delete("all")
        self.draw.rectangle([0, 0, CANVAS_SIZE, CANVAS_SIZE], fill=0)
        self.result_label.config(text="숫자를 그리고 [인식] 버튼을 누르세요")

    def preprocess(self):
        """그린 이미지를 MNIST 스타일(28x28, 중앙 정렬)로 변환한다."""
        arr = np.array(self.image)

        coords = np.argwhere(arr > 20)
        if coords.size == 0:
            return None

        y0, x0 = coords.min(axis=0)
        y1, x1 = coords.max(axis=0)
        cropped = self.image.crop((x0, y0, x1 + 1, y1 + 1))

        # 가장 긴 변을 20px에 맞추고 비율 유지
        w, h = cropped.size
        scale = 20.0 / max(w, h)
        new_w, new_h = max(1, round(w * scale)), max(1, round(h * scale))
        cropped = cropped.resize((new_w, new_h), Image.LANCZOS)

        # 28x28 캔버스 중앙에 붙여넣기 (MNIST 전처리 방식과 동일)
        canvas28 = Image.new("L", (28, 28), color=0)
        offset = ((28 - new_w) // 2, (28 - new_h) // 2)
        canvas28.paste(cropped, offset)

        pixels = np.asarray(canvas28, dtype=np.float32) / 255.0
        return pixels.reshape(1, -1)

    def predict(self):
        features = self.preprocess()
        if features is None:
            self.result_label.config(text="먼저 숫자를 그려주세요")
            return

        pred = self.model.predict(features)[0]
        proba = self.model.predict_proba(features)[0]
        confidence = proba[pred] * 100
        self.result_label.config(
            text=f"인식 결과: {pred}  (확신도 {confidence:.1f}%)"
        )


if __name__ == "__main__":
    root = tk.Tk()
    app = DigitRecognizerApp(root)
    root.mainloop()

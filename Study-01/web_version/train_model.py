"""MNIST 손글씨 숫자 데이터로 분류 모델을 학습해서 model.pkl로 저장한다."""
import time
import joblib
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score

print("MNIST 데이터셋 다운로드 중... (처음 실행 시 시간이 걸릴 수 있습니다)")
mnist = fetch_openml("mnist_784", version=1, as_frame=False, cache=True)
X, y = mnist["data"] / 255.0, mnist["target"].astype(int)
print(f"데이터 로드 완료: {X.shape[0]}개 샘플")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=10000, random_state=42, stratify=y
)

print("모델 학습 중...")
start = time.time()
clf = MLPClassifier(
    hidden_layer_sizes=(128,),
    max_iter=30,
    alpha=1e-4,
    solver="adam",
    random_state=42,
    early_stopping=True,
    verbose=True,
)
clf.fit(X_train, y_train)
print(f"학습 완료 ({time.time() - start:.1f}초)")

acc = accuracy_score(y_test, clf.predict(X_test))
print(f"테스트 정확도: {acc * 100:.2f}%")

joblib.dump(clf, "model.pkl")
print("model.pkl 저장 완료")

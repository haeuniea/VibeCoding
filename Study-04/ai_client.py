"""OpenRouter(OpenAI 호환) 클라이언트와 모델 설정을 한 곳에서 관리한다.

vision.py/recipe.py(비동기 FastAPI 엔드포인트에서 사용)와 main.py(동기 스크립트)가
이 모듈의 client를 공유한다. timeout을 여기서 한 번만 설정하면 모든 호출에 적용된다.
"""
from openai import AsyncOpenAI, OpenAI

from config import OPENROUTER_API_KEY

BASE_URL = "https://openrouter.ai/api/v1"
MODEL = "google/gemma-4-26b-a4b-it:free"
TIMEOUT_SECONDS = 30

# app.py의 async 엔드포인트(vision.py, recipe.py)에서 사용한다.
# 이벤트 루프를 블로킹하지 않도록 반드시 await로 호출해야 한다.
client = AsyncOpenAI(
    base_url=BASE_URL,
    api_key=OPENROUTER_API_KEY,
    timeout=TIMEOUT_SECONDS,
)

# main.py처럼 이벤트 루프 밖(동기 스크립트)에서 호출할 때 사용한다.
sync_client = OpenAI(
    base_url=BASE_URL,
    api_key=OPENROUTER_API_KEY,
    timeout=TIMEOUT_SECONDS,
)

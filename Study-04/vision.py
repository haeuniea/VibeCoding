import base64
import json
import re
import time

from openai import OpenAI, RateLimitError

from config import OPENROUTER_API_KEY

MODEL = "google/gemma-4-26b-a4b-it:free"

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)

INGREDIENT_PROMPT = (
    '이 사진에 보이는 식재료 이름만 한국어로 JSON 배열로 답해줘. '
    '설명 없이 배열만 답해줘. 예: ["당근", "계란", "우유"]'
)


def to_data_uri(content: bytes, content_type: str) -> str:
    encoded = base64.b64encode(content).decode()
    return f"data:{content_type};base64,{encoded}"


def parse_ingredients(text: str) -> list[str]:
    if not text:
        return []

    match = re.search(r"\[.*\]", text, re.S)
    if match:
        try:
            data = json.loads(match.group(0))
            if isinstance(data, list):
                return [str(item).strip() for item in data if str(item).strip()]
        except json.JSONDecodeError:
            pass

    parts = re.split(r"[\n,]", text)
    cleaned = []
    for part in parts:
        part = part.strip().strip("-•* ").strip()
        if part:
            cleaned.append(part)
    return cleaned


def recognize_ingredients(image_bytes: bytes, content_type: str, max_retries: int = 2) -> list[str]:
    data_uri = to_data_uri(image_bytes, content_type)

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": INGREDIENT_PROMPT},
                            {"type": "image_url", "image_url": {"url": data_uri}},
                        ],
                    }
                ],
            )
            return parse_ingredients(response.choices[0].message.content)
        except RateLimitError as e:
            last_error = e
            if attempt < max_retries:
                time.sleep(5)
                continue
            raise
    raise last_error

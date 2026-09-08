import sys

from openai import OpenAI

from config import OPENROUTER_API_KEY

MODEL = "google/gemma-4-26b-a4b-it:free"

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=OPENROUTER_API_KEY,
)


def chat(prompt: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.choices[0].message.content


def describe_image(image_url: str, prompt: str = "이 이미지에 뭐가 보이는지 한국어로 설명해줘.") -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_url}},
                ],
            }
        ],
    )
    return response.choices[0].message.content


def check(name: str, fn) -> bool:
    print(f"[{name}] 확인 중...")
    try:
        result = fn()
    except Exception as e:
        print(f"[{name}] 실패: {e}")
        return False
    if not result:
        print(f"[{name}] 실패: 모델이 빈 응답을 반환했습니다.")
        return False
    print(f"[{name}] 정상 작동. 응답: {result}")
    return True


if __name__ == "__main__":
    text_ok = check("텍스트 모델", lambda: chat("안녕! 너는 어떤 모델이야? 한 문장으로 소개해줘."))
    image_ok = check("이미지 인식 모델", lambda: describe_image("https://httpbin.org/image/jpeg"))

    if text_ok and image_ok:
        print("모든 API 호출이 정상 작동했습니다.")
    else:
        print("일부 API 호출에 문제가 있습니다. 위 로그를 확인하세요.")
        sys.exit(1)

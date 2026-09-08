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


if __name__ == "__main__":
    print(chat("안녕! 너는 어떤 모델이야? 한 문장으로 소개해줘."))
    print(describe_image("https://httpbin.org/image/jpeg"))

import asyncio
import json
import re

from openai import RateLimitError

from ai_client import MODEL, client


def build_recipe_prompt(ingredients: list[str]) -> str:
    ingredient_list = ", ".join(ingredients)
    return (
        f"아래 재료로 만들 수 있는 요리 3개를 추천해줘. 각 요리는 title, used_ingredients, "
        f"missing_ingredients, steps, estimated_time_minutes 필드를 가진 JSON 배열로만 답해줘. "
        f"used_ingredients는 보유 재료 중 실제로 쓰는 것만, missing_ingredients는 추가로 필요한 "
        f"재료(없으면 빈 배열), steps는 조리 순서 문자열 배열, estimated_time_minutes는 숫자로 답해줘. "
        f"설명 없이 JSON 배열만 답해줘.\n보유 재료: {ingredient_list}"
    )


def parse_recipes(text: str) -> list[dict]:
    if not text:
        return []

    match = re.search(r"\[.*\]", text, re.S)
    if not match:
        return []

    try:
        data = json.loads(match.group(0))
    except json.JSONDecodeError:
        return []

    if not isinstance(data, list):
        return []

    recipes = []
    for item in data:
        if not isinstance(item, dict) or not item.get("title"):
            continue
        recipes.append(
            {
                "title": str(item.get("title", "")).strip(),
                "used_ingredients": [str(x).strip() for x in item.get("used_ingredients", []) if str(x).strip()],
                "missing_ingredients": [
                    str(x).strip() for x in item.get("missing_ingredients", []) if str(x).strip()
                ],
                "steps": [str(x).strip() for x in item.get("steps", []) if str(x).strip()],
                "estimated_time_minutes": item.get("estimated_time_minutes"),
            }
        )
    return recipes


async def recommend_recipes(ingredients: list[str], max_retries: int = 2) -> list[dict]:
    prompt = build_recipe_prompt(ingredients)

    last_error = None
    for attempt in range(max_retries + 1):
        try:
            response = await client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
            )
            return parse_recipes(response.choices[0].message.content)
        except RateLimitError as e:
            last_error = e
            if attempt < max_retries:
                await asyncio.sleep(5)
                continue
            raise
    raise last_error

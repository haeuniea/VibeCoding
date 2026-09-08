from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from recipe import recommend_recipes
from vision import recognize_ingredients

MAX_IMAGE_BYTES = 10 * 1024 * 1024


class RecommendRecipesRequest(BaseModel):
    ingredients: list[str]

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def index():
    return FileResponse("static/index.html")


@app.post("/api/recognize-ingredients")
async def recognize_ingredients_endpoint(image: UploadFile = File(...)):
    content = await image.read()

    if len(content) > MAX_IMAGE_BYTES:
        return JSONResponse(status_code=400, content={"error": "이미지 크기는 10MB 이하여야 합니다."})

    try:
        ingredients = recognize_ingredients(content, image.content_type or "image/jpeg")
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"error": f"이미지 인식에 실패했습니다. 잠시 후 다시 시도해주세요. ({e})"},
        )

    return {"ingredients": ingredients}


@app.post("/api/recommend-recipes")
async def recommend_recipes_endpoint(body: RecommendRecipesRequest):
    ingredients = [i.strip() for i in body.ingredients if i.strip()]
    if not ingredients:
        return JSONResponse(status_code=400, content={"error": "재료 목록이 비어 있습니다."})

    try:
        recipes = recommend_recipes(ingredients)
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"error": f"레시피 생성에 실패했어요. 다시 시도해주세요. ({e})"},
        )

    return {"recipes": recipes}

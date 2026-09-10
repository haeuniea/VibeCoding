from fastapi import FastAPI, File, Header, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import auth
from recipe import recommend_recipes
from vision import recognize_ingredients

MAX_IMAGE_BYTES = 10 * 1024 * 1024
IMAGE_READ_CHUNK_BYTES = 1024 * 1024


class RecommendRecipesRequest(BaseModel):
    ingredients: list[str]


class AuthRequest(BaseModel):
    email: str
    password: str


class SaveRecipeRequest(BaseModel):
    recipe: dict


app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
auth.init_db()


def require_user(authorization: str | None = Header(default=None)) -> int:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    token = authorization.removeprefix("Bearer ").strip()
    user_id = auth.get_user_id_from_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")
    return user_id


@app.get("/")
def index():
    return FileResponse("static/index.html")


@app.post("/api/recognize-ingredients")
async def recognize_ingredients_endpoint(image: UploadFile = File(...)):
    # 전체를 한 번에 읽지 않고 청크 단위로 읽어, 한도를 넘는 순간 바로 중단한다.
    # (매우 큰 파일을 통째로 메모리에 올린 뒤 검사하는 낭비를 줄인다.)
    chunks = bytearray()
    while True:
        chunk = await image.read(IMAGE_READ_CHUNK_BYTES)
        if not chunk:
            break
        chunks.extend(chunk)
        if len(chunks) > MAX_IMAGE_BYTES:
            return JSONResponse(status_code=400, content={"error": "이미지 크기는 10MB 이하여야 합니다."})
    content = bytes(chunks)

    try:
        ingredients = await recognize_ingredients(content, image.content_type or "image/jpeg")
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
        recipes = await recommend_recipes(ingredients)
    except Exception as e:
        return JSONResponse(
            status_code=502,
            content={"error": f"레시피 생성에 실패했어요. 다시 시도해주세요. ({e})"},
        )

    return {"recipes": recipes}


@app.post("/api/signup")
async def signup(body: AuthRequest):
    email = body.email.strip().lower()
    if not email or not body.password:
        return JSONResponse(status_code=400, content={"error": "이메일과 비밀번호를 입력해주세요."})
    if auth.email_exists(email):
        return JSONResponse(status_code=409, content={"error": "이미 가입된 이메일입니다."})
    auth.create_user(email, body.password)
    return JSONResponse(status_code=201, content={"message": "가입이 완료됐어요."})


@app.post("/api/login")
async def login(body: AuthRequest):
    email = body.email.strip().lower()
    user_id = auth.authenticate_user(email, body.password)
    if user_id is None:
        return JSONResponse(status_code=401, content={"error": "이메일 또는 비밀번호가 올바르지 않습니다."})
    token = auth.create_session(user_id)
    return {"token": token, "email": email}


@app.post("/api/recipes/save", status_code=201)
async def save_recipe_endpoint(body: SaveRecipeRequest, authorization: str | None = Header(default=None)):
    user_id = require_user(authorization)
    saved = auth.save_recipe(user_id, body.recipe)
    return {"saved_recipe": saved}


@app.get("/api/recipes/saved")
async def list_saved_recipes_endpoint(authorization: str | None = Header(default=None)):
    user_id = require_user(authorization)
    return {"saved_recipes": auth.list_saved_recipes(user_id)}


@app.delete("/api/recipes/saved/{recipe_id}", status_code=204)
async def delete_saved_recipe_endpoint(recipe_id: int, authorization: str | None = Header(default=None)):
    user_id = require_user(authorization)
    if not auth.delete_saved_recipe(user_id, recipe_id):
        raise HTTPException(status_code=404, detail="레시피를 찾을 수 없습니다.")
    return None

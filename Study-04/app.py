from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from vision import recognize_ingredients

MAX_IMAGE_BYTES = 10 * 1024 * 1024

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

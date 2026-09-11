import hashlib
import json
import secrets
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

DB_PATH = "app.db"


@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS saved_recipes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                used_ingredients TEXT NOT NULL,
                missing_ingredients TEXT NOT NULL,
                steps TEXT NOT NULL,
                estimated_time_minutes INTEGER,
                created_at TEXT NOT NULL
            )
            """
        )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()


def create_user(email: str, password: str) -> int:
    salt = secrets.token_hex(16)
    password_hash = _hash_password(password, salt)
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash, salt, created_at) VALUES (?, ?, ?, ?)",
            (email, password_hash, salt, _now()),
        )
        return cursor.lastrowid


def email_exists(email: str) -> bool:
    with get_db() as conn:
        row = conn.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone()
        return row is not None


def authenticate_user(email: str, password: str) -> int | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, password_hash, salt FROM users WHERE email = ?", (email,)
        ).fetchone()
    if row is None:
        return None
    if _hash_password(password, row["salt"]) != row["password_hash"]:
        return None
    return row["id"]


def create_session(user_id: int) -> str:
    token = secrets.token_hex(32)
    with get_db() as conn:
        conn.execute(
            "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
            (token, user_id, _now()),
        )
    return token


def get_user_id_from_token(token: str) -> int | None:
    with get_db() as conn:
        row = conn.execute("SELECT user_id FROM sessions WHERE token = ?", (token,)).fetchone()
    return row["user_id"] if row else None


def save_recipe(user_id: int, recipe: dict) -> dict:
    title = recipe.get("title", "")
    used_ingredients = recipe.get("used_ingredients", [])
    missing_ingredients = recipe.get("missing_ingredients", [])
    steps = recipe.get("steps", [])
    estimated_time_minutes = recipe.get("estimated_time_minutes")
    created_at = _now()

    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO saved_recipes
                (user_id, title, used_ingredients, missing_ingredients, steps, estimated_time_minutes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                title,
                json.dumps(used_ingredients, ensure_ascii=False),
                json.dumps(missing_ingredients, ensure_ascii=False),
                json.dumps(steps, ensure_ascii=False),
                estimated_time_minutes,
                created_at,
            ),
        )
        saved_id = cursor.lastrowid

    # 방금 넣은 값을 그대로 알고 있으므로, 재조회용 커넥션을 한 번 더 열 필요가 없다.
    return {
        "id": saved_id,
        "title": title,
        "used_ingredients": used_ingredients,
        "missing_ingredients": missing_ingredients,
        "steps": steps,
        "estimated_time_minutes": estimated_time_minutes,
        "created_at": created_at,
    }


def _row_to_recipe(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "used_ingredients": json.loads(row["used_ingredients"]),
        "missing_ingredients": json.loads(row["missing_ingredients"]),
        "steps": json.loads(row["steps"]),
        "estimated_time_minutes": row["estimated_time_minutes"],
        "created_at": row["created_at"],
    }


def get_saved_recipe(user_id: int, recipe_id: int) -> dict | None:
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM saved_recipes WHERE id = ? AND user_id = ?", (recipe_id, user_id)
        ).fetchone()
    return _row_to_recipe(row) if row else None


def list_saved_recipes(user_id: int) -> list[dict]:
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM saved_recipes WHERE user_id = ? ORDER BY created_at DESC", (user_id,)
        ).fetchall()
    return [_row_to_recipe(row) for row in rows]


def delete_saved_recipe(user_id: int, recipe_id: int) -> bool:
    with get_db() as conn:
        cursor = conn.execute(
            "DELETE FROM saved_recipes WHERE id = ? AND user_id = ?", (recipe_id, user_id)
        )
    return cursor.rowcount > 0

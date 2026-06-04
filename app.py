from __future__ import annotations

import base64
import re
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, render_template, request

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
VERSION_FILE = BASE_DIR / "VERSION"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 20 * 1024 * 1024  # 20 MB


def get_app_version() -> str:
    try:
        return VERSION_FILE.read_text(encoding="utf-8").strip() or "dev"
    except FileNotFoundError:
        return "dev"


@app.get("/")
def index():
    return render_template("index.html", app_version=get_app_version())


@app.post("/upload")
def upload_photo():
    payload = request.get_json(silent=True) or {}
    image_data = payload.get("image")

    if not image_data or not isinstance(image_data, str):
        return jsonify({"ok": False, "error": "Kein Bild erhalten."}), 400

    match = re.match(r"^data:(image/[a-zA-Z0-9.+-]+);base64,", image_data)
    if not match:
        return jsonify({"ok": False, "error": "Ungültiges Bildformat."}), 400

    mime_type = match.group(1).lower()
    encoded = image_data[match.end() :]

    try:
        raw = base64.b64decode(encoded, validate=True)
    except Exception:
        return jsonify({"ok": False, "error": "Bilddaten konnten nicht dekodiert werden."}), 400

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    extension_map = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/heic": "heic",
        "image/heif": "heif",
    }
    extension = extension_map.get(mime_type, "jpg")

    filename = f"hochzeit_{timestamp}_{uuid4().hex[:8]}.{extension}"
    file_path = UPLOAD_DIR / filename
    file_path.write_bytes(raw)

    return jsonify({"ok": True, "filename": filename})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)

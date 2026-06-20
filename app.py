from __future__ import annotations

import base64
import os
import re
from collections import defaultdict, deque
from datetime import datetime
from pathlib import Path
from threading import Lock
from time import monotonic
from uuid import uuid4

from flask import Flask, jsonify, render_template, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
IMG_DIR = BASE_DIR / "img"
VERSION_FILE = BASE_DIR / "VERSION"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 80 * 1024 * 1024  # 80 MB

RATE_LIMIT_UPLOADS_PER_SECOND = 20
RATE_LIMIT_WINDOW_SECONDS = 1.0
_ip_upload_timestamps: defaultdict[str, deque[float]] = defaultdict(deque)
_rate_limit_lock = Lock()


def get_app_version() -> str:
    try:
        return VERSION_FILE.read_text(encoding="utf-8").strip() or "dev"
    except FileNotFoundError:
        return "dev"


def get_client_ip() -> str:
    # Prefer X-Real-IP from Nginx, then fall back to X-Forwarded-For.
    real_ip = request.headers.get("X-Real-IP", "").strip()
    if real_ip:
        return real_ip

    forwarded_for = request.headers.get("X-Forwarded-For", "").strip()
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()

    return request.remote_addr or "unknown"


def is_rate_limited(ip_address: str) -> bool:
    now = monotonic()
    cutoff = now - RATE_LIMIT_WINDOW_SECONDS

    with _rate_limit_lock:
        timestamps = _ip_upload_timestamps[ip_address]

        while timestamps and timestamps[0] < cutoff:
            timestamps.popleft()

        if len(timestamps) >= RATE_LIMIT_UPLOADS_PER_SECOND:
            return True

        timestamps.append(now)
        return False


@app.get("/")
def index():
    return render_template("index.html", app_version=get_app_version())


@app.get("/healthz")
def healthz():
    return jsonify({"ok": True}), 200


@app.get("/img/<path:filename>")
def image_asset(filename: str):
    return send_from_directory(IMG_DIR, filename)


@app.errorhandler(413)
def payload_too_large(_error):
    return (
        jsonify(
            {
                "ok": False,
                "error": "Upload zu gross. Bitte kleineres Bild waehlen oder nur JPG verwenden.",
            }
        ),
        413,
    )


@app.post("/upload")
def upload_photo():
    client_ip = get_client_ip()
    if is_rate_limited(client_ip):
        return (
            jsonify(
                {
                    "ok": False,
                    "error": "Rate Limit erreicht: maximal 20 Bilder pro Sekunde pro IP.",
                }
            ),
            429,
        )

    payload = request.get_json(silent=True) or {}
    extension_map = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/heic": "heic",
        "image/heif": "heif",
    }
    image_data = payload.get("image")
    capture_id = payload.get("capture_id")

    if not image_data or not isinstance(image_data, str):
        return jsonify({"ok": False, "error": "Kein Bild erhalten."}), 400

    if capture_id is None:
        capture_id = uuid4().hex
    else:
        capture_id = str(capture_id).strip()
        if not re.fullmatch(r"[a-zA-Z0-9_-]{8,64}", capture_id):
            return jsonify({"ok": False, "error": "Ungültige Bild-ID."}), 400

    match = re.match(r"^data:(image/[a-zA-Z0-9.+-]+);base64,", image_data)
    if not match:
        return jsonify({"ok": False, "error": "Ungültiges Bildformat."}), 400

    mime_type = match.group(1).lower()
    encoded = image_data[match.end() :]

    try:
        raw = base64.b64decode(encoded, validate=True)
    except Exception:
        return jsonify({"ok": False, "error": "Bilddaten konnten nicht dekodiert werden."}), 400

    extension = extension_map.get(mime_type, "jpg")
    filename = f"{capture_id}.{extension}"
    file_path = UPLOAD_DIR / filename
    file_path.write_bytes(raw)

    return jsonify({"ok": True, "filename": filename, "capture_id": capture_id})


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "0") == "1"
    app.run(host="0.0.0.0", port=8080, debug=debug_mode)

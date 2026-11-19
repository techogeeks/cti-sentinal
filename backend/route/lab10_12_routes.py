"""Opt-in local-only lab execution routes (not intended for public deployment)."""
import os
from flask import Blueprint, jsonify, request
from pymongo.errors import PyMongoError
from backend.services.lab_10_12 import RUNNERS, LabSetupError

bp = Blueprint("lab10_12", __name__)

@bp.post("/labs/<int:chapter>/<int:lab>/run")
def run_lab(chapter, lab):
    if os.getenv("ENABLE_LAB_RUNNER") != "1":
        return jsonify({"error": "Local lab runner disabled. Set ENABLE_LAB_RUNNER=1 in your .env and restart the backend."}), 403
    origin = request.headers.get("Origin", "")
    if origin and origin not in ("http://localhost:5173", "http://127.0.0.1:5173"):
        return jsonify({"error": "Lab execution allowed only from the local development dashboard."}), 403
    fn = RUNNERS.get((chapter, lab))
    if fn is None:
        return jsonify({"error": "This lab is not implemented in the interactive runner."}), 404
    try:
        return jsonify(fn())
    except (LabSetupError, PyMongoError) as exc:
        return jsonify({"error": str(exc)}), 422

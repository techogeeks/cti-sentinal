from flask import Blueprint, jsonify
from backend.assignment_registry import ASSIGNMENTS
bp = Blueprint("assignments", __name__)
@bp.get("/assignments")
def assignments():
    return jsonify({"assignments": ASSIGNMENTS, "total": len(ASSIGNMENTS)})

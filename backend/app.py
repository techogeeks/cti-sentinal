"""CTI Sentinel - Flask API.   Run:  python app.py   (http://127.0.0.1:5000)"""
from flask import Flask, jsonify
from flask_cors import CORS

from backend.config.connection import DATABASE_NAME, ensure_indexes, get_client, get_db
from backend.route import register_routes


def create_app():
    app = Flask(__name__)
    CORS(app)
    register_routes(app)

    @app.get("/")
    def health():
        get_client().admin.command("ping")
        return jsonify({"service": "CTI Sentinel API", "database": DATABASE_NAME, "mongodb": "connected"})

    @app.errorhandler(ValueError)
    def bad_value(err):
        return jsonify({"error": str(err)}), 400

    @app.errorhandler(Exception)
    def unexpected(err):
        code = getattr(err, "code", 500)
        return jsonify({"error": getattr(err, "description", str(err))}), code if isinstance(code, int) else 500

    return app


if __name__ == "__main__":
    get_client().admin.command("ping")
    ensure_indexes(get_db())
    print(f"MongoDB connected. Database: {DATABASE_NAME}\nAPI running at http://127.0.0.1:5000")
    create_app().run(host="127.0.0.1", port=5000, debug=True)

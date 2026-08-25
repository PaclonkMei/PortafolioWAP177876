from datetime import datetime
from pathlib import Path
from flask import Flask, request, jsonify

app = Flask(__name__)

LAB_TOKEN = "cambia-este-token"
LOG_FILE = Path(__file__).with_name("telemetria_recibida.txt")


def timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


@app.post("/telemetry")
def telemetry():
    if request.headers.get("X-Lab-Token") != LAB_TOKEN:
        return jsonify({
            "status": "error",
            "message": "token de laboratorio no válido"
        }), 403

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "se requiere un objeto JSON"
        }), 400

    required = {"id", "timestamp", "type", "key"}

    if not required.issubset(data):
        return jsonify({
            "status": "error",
            "message": "telemetría incompleta"
        }), 422

    received_at = timestamp()

    linea = (
        f"{received_at} | "
        f"{data['timestamp']} | "
        f"{data['type']} | "
        f"{data['id']} | "
        f"{data['key']}"
    )

    print(linea)

    with LOG_FILE.open("a", encoding="utf-8") as archivo:
        archivo.write(linea + "\n")

    return jsonify({
        "status": "received",
        "event": data["id"],
        "received_at": received_at
    }), 200


if __name__ == "__main__":
    print("=" * 64)
    print("KALI LAB RECEIVER // LISTENING ON TCP 5000")
    print(f"LOG: {LOG_FILE}")
    print("=" * 64)

    app.run(host="0.0.0.0", port=5000, debug=False)

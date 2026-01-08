import os

from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests

from app.alerts import run_alert, run_alert_rainbow
from app.config import (
    get_alert_color_hex,
    get_alert_color_hex_2,
    get_alert_duration_sec,
    update_yaml_config,
)
from app.iot_client import get_device_status_by_id, get_user_devices
from app.schemas import (
    AlertRainbowRequest,
    AlertRequest,
    AlertSettingsRequest,
    CredentialsRequest,
    CredentialsVerifyRequest,
    DeviceSelectionRequest,
)

app = FastAPI(title="Yandex IoT Alert Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _set_env_vars(values: dict) -> None:
    for key, value in values.items():
        if value is None:
            continue
        os.environ[key] = str(value)


@app.post("/startAlert")
async def start_alert(req: AlertRequest, background_tasks: BackgroundTasks):
    """
    Single-color alert.
    """
    background_tasks.add_task(
        run_alert,
        req.color_hex,
        req.duration_sec,
    )
    return {
        "status": "scheduled",
        "color_hex": req.color_hex or get_alert_color_hex(),
        "duration_sec": req.duration_sec or get_alert_duration_sec(),
    }


@app.post("/startAlertRainbow")
async def start_alert_rainbow_endpoint(
    req: AlertRainbowRequest,
    background_tasks: BackgroundTasks,
):
    """
    Blinking alert between two colors.
    """
    background_tasks.add_task(
        run_alert_rainbow,
        req.color_hex,
        req.color_hex_2,
        req.duration_sec,
    )
    return {
        "status": "scheduled",
        "color_hex": req.color_hex or get_alert_color_hex(),
        "color_hex_2": req.color_hex_2 or get_alert_color_hex_2(),
        "duration_sec": req.duration_sec or get_alert_duration_sec(),
    }


@app.post("/setup/credentials")
async def setup_credentials(req: CredentialsRequest):
    values = {
        "IOT_TOKEN": req.yandex_token,
        "TELEGRAM_BOT_TOKEN": req.telegram_bot_token,
        "NGROK_AUTHTOKEN": req.ngrok_authtoken,
    }
    update_yaml_config(values)
    _set_env_vars(values)
    return {"ok": True}


@app.post("/setup/verify")
async def verify_credentials(req: CredentialsVerifyRequest):
    yandex_token = req.yandex_token
    telegram_token = req.telegram_bot_token
    ngrok_token = req.ngrok_authtoken

    results = {
        "yandex": {"ok": None, "message": "не проверяли"},
        "telegram": {"ok": None, "message": "не проверяли"},
        "ngrok": {"ok": None, "message": "не проверяли"},
    }

    if yandex_token:
        try:
            devices = get_user_devices(yandex_token)
            results["yandex"] = {"ok": True, "message": f"devices: {len(devices)}"}
        except requests.RequestException as exc:
            results["yandex"] = {"ok": False, "message": str(exc)}
        except Exception as exc:
            results["yandex"] = {"ok": False, "message": str(exc)}

    if telegram_token:
        try:
            resp = requests.get(
                f"https://api.telegram.org/bot{telegram_token}/getMe",
                timeout=5,
            )
            data = resp.json()
            if resp.ok and data.get("ok") is True:
                results["telegram"] = {"ok": True, "message": data.get("result", {}).get("username", "")}
            else:
                results["telegram"] = {"ok": False, "message": data.get("description") or "telegram error"}
        except requests.RequestException as exc:
            results["telegram"] = {"ok": False, "message": str(exc)}

    if ngrok_token:
        try:
            resp = requests.get(
                "https://api.ngrok.com/tunnels",
                headers={
                    "Authorization": f"Bearer {ngrok_token}",
                    "Ngrok-Version": "2",
                },
                timeout=5,
            )
            if resp.ok:
                results["ngrok"] = {"ok": True, "message": "token accepted"}
            elif resp.status_code in (401, 403):
                results["ngrok"] = {
                    "ok": None,
                    "message": "нужен ngrok API key для проверки; authtoken сохранён",
                }
            else:
                results["ngrok"] = {"ok": False, "message": resp.text or "ngrok error"}
        except requests.RequestException as exc:
            results["ngrok"] = {"ok": False, "message": str(exc)}

    return results


@app.get("/setup/devices")
async def list_light_devices():
    try:
        devices = get_user_devices()
    except KeyError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    lights = []
    for device in devices:
        device_type = device.get("type", "")
        if not str(device_type).startswith("devices.types.light"):
            continue

        device_id = device.get("id")
        if not device_id:
            continue

        status = get_device_status_by_id(device_id)
        if status.get("status") != "ok":
            continue

        lights.append({
            "id": device_id,
            "name": device.get("name") or "",
            "state": status.get("state") or "unknown",
            "type": device_type,
        })

    return {"devices": lights}


@app.post("/setup/device")
async def select_device(req: DeviceSelectionRequest):
    if not req.device_id.strip():
        raise HTTPException(status_code=400, detail="device_id is required")
    values = {"IOT_DEVICE_ID": req.device_id}
    update_yaml_config(values)
    _set_env_vars(values)
    return {"ok": True, "device_id": req.device_id}


@app.post("/setup/alert-settings")
async def setup_alert_settings(req: AlertSettingsRequest):
    values = {
        "ALERT_COLOR_HEX": req.color_hex,
        "ALERT_COLOR_HEX_2": req.color_hex_2,
        "ALERT_DURATION_SEC": str(req.duration_sec),
        "ALERT_BLINK_INTERVAL": str(req.blink_interval_sec),
    }
    update_yaml_config(values)
    _set_env_vars(values)
    return {
        "ok": True,
        "color_hex": req.color_hex,
        "color_hex_2": req.color_hex_2,
        "duration_sec": req.duration_sec,
        "blink_interval_sec": req.blink_interval_sec,
    }


@app.post("/telegram/webhook")
async def telegram_webhook(update: dict, background_tasks: BackgroundTasks):
    """
    Telegram webhook: trigger rainbow alert on any incoming message.
    """
    message = (
        update.get("message")
        or update.get("edited_message")
        or update.get("channel_post")
        or update.get("edited_channel_post")
    )
    if message is None:
        return {"ok": True, "ignored": True}
    chat = message.get("chat") or {}
    chat_type = chat.get("type")
    if chat_type not in ("private", "group", "supergroup"):
        return {"ok": True, "ignored": True, "reason": "unsupported_chat_type"}

    background_tasks.add_task(
        run_alert_rainbow,
        None,
        None,
        None,
    )
    return {"ok": True}

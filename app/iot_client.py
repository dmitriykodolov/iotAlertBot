import colorsys
import logging
from typing import Optional

import requests

from app.config import get_iot_device_id, get_iot_host, get_iot_token

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("iot-alert")

DEFAULT_TIMEOUT_SEC = 5


def _headers(token: Optional[str] = None) -> dict:
    auth_token = token or get_iot_token()
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json",
    }


def hex_to_yandex_rgb(color: str) -> int:
    """
    Convert '#RRGGBB' or 'RRGGBB' to a 24-bit integer for Yandex.
    Examples:
      '#FF0000' -> 0xFF0000 -> 16711680
      '00FF00'  -> 0x00FF00 -> 65280
    """
    s = color.strip().lower()
    if s.startswith("#"):
        s = s[1:]
    if s.startswith("0x"):
        s = s[2:]

    if len(s) != 6:
        raise ValueError(f"Invalid hex color: {color}")

    return int(s, 16)


def rgb_int_to_yandex_hsv(rgb_value: int) -> dict:
    """
    Convert a 24-bit integer (0xRRGGBB) to Yandex HSV payload.
    Yandex expects h=0..360, s=0..100, v=0..100.
    """
    if rgb_value < 0 or rgb_value > 0xFFFFFF:
        raise ValueError(f"Invalid RGB value: {rgb_value}")

    r = (rgb_value >> 16) & 0xFF
    g = (rgb_value >> 8) & 0xFF
    b = rgb_value & 0xFF

    h, s, v = colorsys.rgb_to_hsv(r / 255.0, g / 255.0, b / 255.0)
    h_val = int(round(h * 360))
    if h_val >= 360:
        h_val = 0

    return {
        "h": h_val,
        "s": int(round(s * 100)),
        "v": int(round(v * 100)),
    }


def get_device_status() -> dict:
    """Get current device state."""
    url = f"{get_iot_host()}/v1.0/devices/{get_iot_device_id()}"
    resp = requests.get(url, headers=_headers(), timeout=DEFAULT_TIMEOUT_SEC)
    resp.raise_for_status()
    data = resp.json()
    logger.info("device status: %s", data)
    return data


def get_device_status_by_id(device_id: str, token: Optional[str] = None) -> dict:
    """Get device state by ID."""
    url = f"{get_iot_host()}/v1.0/devices/{device_id}"
    resp = requests.get(url, headers=_headers(token), timeout=DEFAULT_TIMEOUT_SEC)
    resp.raise_for_status()
    return resp.json()


def find_capability(capabilities: list, cap_type: str) -> Optional[dict]:
    for cap in capabilities:
        if cap.get("type") == cap_type:
            return cap
    return None


def is_device_available(status: dict) -> bool:
    """Check if device is online."""
    return status.get("state") == "online"


def is_device_on(status: dict) -> bool:
    """
    Determine if the lamp is on using the on_off capability.
    """
    caps = status.get("capabilities", [])
    on_off = find_capability(caps, "devices.capabilities.on_off")
    if not on_off:
        return False
    state = on_off.get("state") or {}
    value = state.get("value")
    return bool(value)


def get_color_state(status: dict) -> Optional[dict]:
    """
    Extract current color state (instance + value).
    """
    caps = status.get("capabilities", [])
    color_cap = find_capability(caps, "devices.capabilities.color_setting")
    if not color_cap:
        return None
    state = color_cap.get("state")
    if not state:
        return None
    return {
        "instance": state.get("instance"),
        "value": state.get("value"),
    }


def get_brightness_value(status: dict) -> Optional[int]:
    """
    Extract current brightness value (0..100) if supported.
    """
    caps = status.get("capabilities", [])
    for cap in caps:
        if cap.get("type") != "devices.capabilities.range":
            continue
        params = cap.get("parameters") or {}
        state = cap.get("state") or {}
        instance = params.get("instance") or state.get("instance")
        if instance != "brightness":
            continue
        value = state.get("value")
        if isinstance(value, (int, float)):
            return int(value)
    return None


def get_color_model(status: dict) -> Optional[str]:
    """
    Extract supported color model from device capabilities (e.g. "rgb", "hsv").
    """
    caps = status.get("capabilities", [])
    color_cap = find_capability(caps, "devices.capabilities.color_setting")
    if not color_cap:
        return None
    params = color_cap.get("parameters") or {}
    model = params.get("color_model")
    if isinstance(model, str):
        return model.lower()
    return None


def send_actions(actions: list[dict]) -> dict:
    """Send actions to the device."""
    url = f"{get_iot_host()}/v1.0/devices/actions"
    payload = {
        "devices": [
            {
                "id": get_iot_device_id(),
                "actions": actions,
            }
        ]
    }
    resp = requests.post(url, headers=_headers(), json=payload, timeout=DEFAULT_TIMEOUT_SEC)
    resp.raise_for_status()
    data = resp.json()
    logger.info("actions response: %s", data)
    return data


def get_user_devices(token: Optional[str] = None) -> list[dict]:
    """Get all user devices from Yandex IoT."""
    url = f"{get_iot_host()}/v1.0/user/info"
    resp = requests.get(url, headers=_headers(token), timeout=DEFAULT_TIMEOUT_SEC)
    resp.raise_for_status()
    data = resp.json()
    return data.get("devices", []) if isinstance(data, dict) else []


def turn_on() -> None:
    """Turn the device on."""
    send_actions([
        {
            "type": "devices.capabilities.on_off",
            "state": {"instance": "on", "value": True},
        }
    ])


def turn_off() -> None:
    """Turn the device off."""
    send_actions([
        {
            "type": "devices.capabilities.on_off",
            "state": {"instance": "on", "value": False},
        }
    ])


def set_color_rgb_int(rgb_value: int, color_model: Optional[str] = None) -> None:
    """Set color by 24-bit integer (0..16777215) using the device model."""
    if color_model == "rgb":
        instance = "rgb"
        value = rgb_value
    else:
        if color_model == "hsl":
            logger.warning("Device reports color_model=hsl; using hsv payload.")
        elif color_model is None:
            logger.warning("Device color_model is unknown; using hsv payload.")
        instance = "hsv"
        value = rgb_int_to_yandex_hsv(rgb_value)

    send_actions([
        {
            "type": "devices.capabilities.color_setting",
            "state": {
                "instance": instance,
                "value": value,
            },
        }
    ])


def set_brightness(value: int) -> None:
    """Set brightness (0..100)."""
    send_actions([
        {
            "type": "devices.capabilities.range",
            "state": {
                "instance": "brightness",
                "value": value,
            },
        }
    ])


def restore_color_state(state: dict) -> None:
    """
    Restore original color state.
    """
    send_actions([
        {
            "type": "devices.capabilities.color_setting",
            "state": state,
        }
    ])

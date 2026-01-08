import os
from typing import Any, Optional

import yaml

try:
    # Optional: load env vars from .env if python-dotenv is installed.
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


DEFAULT_CONFIG_PATH = os.environ.get("IOTALARM_CONFIG_PATH", "config.yaml")


def _load_yaml_config(path: Optional[str] = None) -> dict:
    config_path = path or DEFAULT_CONFIG_PATH
    if not os.path.exists(config_path):
        return {}
    with open(config_path, "r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    return data if isinstance(data, dict) else {}


def save_yaml_config(config: dict, path: Optional[str] = None) -> None:
    config_path = path or DEFAULT_CONFIG_PATH
    with open(config_path, "w", encoding="utf-8") as handle:
        yaml.safe_dump(config, handle, allow_unicode=False, sort_keys=True)


def update_yaml_config(values: dict, path: Optional[str] = None) -> dict:
    config = _load_yaml_config(path)
    config.update(values)
    save_yaml_config(config, path)
    return config


def _get_value(key: str, default: Optional[Any] = None) -> Any:
    if key in os.environ:
        return os.environ[key]
    config = _load_yaml_config()
    return config.get(key, default)


def _get_required_value(key: str) -> str:
    value = _get_value(key)
    if value is None or value == "":
        raise KeyError(f"Missing required config value: {key}")
    return str(value)


def get_iot_token() -> str:
    return _get_required_value("IOT_TOKEN")


def get_iot_host() -> str:
    host = _get_value("IOT_HOST", "https://api.iot.yandex.net")
    return str(host).rstrip("/")


def get_iot_device_id() -> str:
    return _get_required_value("IOT_DEVICE_ID")


def get_alert_color_hex() -> str:
    return str(_get_value("ALERT_COLOR_HEX", "#FF0000"))


def get_alert_color_hex_2() -> str:
    return str(_get_value("ALERT_COLOR_HEX_2", "#E30306"))


def get_alert_duration_sec() -> int:
    return int(_get_value("ALERT_DURATION_SEC", "10"))


def get_alert_blink_interval_sec() -> float:
    return float(_get_value("ALERT_BLINK_INTERVAL", "0.5"))


def get_telegram_bot_token() -> Optional[str]:
    value = _get_value("TELEGRAM_BOT_TOKEN")
    return str(value) if value else None


def get_ngrok_authtoken() -> Optional[str]:
    value = _get_value("NGROK_AUTHTOKEN")
    if value:
        return str(value)
    value = _get_value("NGROK_TOKEN")
    return str(value) if value else None

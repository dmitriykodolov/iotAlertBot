"""Lightweight API client used by the TUI sketches."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Any, Dict, Optional

import requests


def _default_base_url() -> str:
    return os.getenv("IOTALERT_API_URL", "http://localhost:8000")


@dataclass
class AlertApiClient:
    base_url: str = _default_base_url()
    timeout_sec: float = 5.0

    def _post(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        response = requests.post(url, json=payload, timeout=self.timeout_sec)
        response.raise_for_status()
        return response.json() if response.content else {}

    def _get(self, path: str) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        response = requests.get(url, timeout=self.timeout_sec)
        response.raise_for_status()
        return response.json() if response.content else {}

    def start_alert(self, color_hex: str, duration_sec: int) -> Dict[str, Any]:
        return self._post("/startAlert", {"color_hex": color_hex, "duration_sec": duration_sec})

    def start_alert_rainbow(
        self, color_hex: str, color_hex_2: str, duration_sec: int
    ) -> Dict[str, Any]:
        return self._post(
            "/startAlertRainbow",
            {"color_hex": color_hex, "color_hex_2": color_hex_2, "duration_sec": duration_sec},
        )

    def save_credentials(
        self,
        yandex_token: str,
        telegram_bot_token: Optional[str] = None,
        ngrok_authtoken: Optional[str] = None,
    ) -> Dict[str, Any]:
        payload = {
            "yandex_token": yandex_token,
            "telegram_bot_token": telegram_bot_token,
            "ngrok_authtoken": ngrok_authtoken,
        }
        return self._post("/setup/credentials", payload)

    def get_devices(self) -> Dict[str, Any]:
        return self._get("/setup/devices")

    def set_device(self, device_id: str) -> Dict[str, Any]:
        return self._post("/setup/device", {"device_id": device_id})

    def set_alert_settings(
        self,
        color_hex: str,
        color_hex_2: str,
        duration_sec: int,
        blink_interval_sec: float,
    ) -> Dict[str, Any]:
        payload = {
            "color_hex": color_hex,
            "color_hex_2": color_hex_2,
            "duration_sec": duration_sec,
            "blink_interval_sec": blink_interval_sec,
        }
        return self._post("/setup/alert-settings", payload)

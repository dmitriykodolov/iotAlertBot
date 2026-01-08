from typing import Optional

from pydantic import BaseModel


class AlertRequest(BaseModel):
    color_hex: Optional[str] = None
    duration_sec: Optional[int] = None


class AlertRainbowRequest(BaseModel):
    color_hex: Optional[str] = None
    color_hex_2: Optional[str] = None
    duration_sec: Optional[int] = None


class CredentialsRequest(BaseModel):
    yandex_token: str
    telegram_bot_token: str
    ngrok_authtoken: str


class CredentialsVerifyRequest(BaseModel):
    yandex_token: Optional[str] = None
    telegram_bot_token: Optional[str] = None
    ngrok_authtoken: Optional[str] = None


class DeviceSelectionRequest(BaseModel):
    device_id: str


class AlertSettingsRequest(BaseModel):
    color_hex: str
    color_hex_2: str
    duration_sec: int
    blink_interval_sec: float

import logging
import time
from dataclasses import dataclass
from typing import Optional

from app.config import (
    get_alert_blink_interval_sec,
    get_alert_color_hex,
    get_alert_color_hex_2,
    get_alert_duration_sec,
)
from app.iot_client import (
    get_brightness_value,
    get_device_status,
    get_color_model,
    get_color_state,
    hex_to_yandex_rgb,
    is_device_available,
    is_device_on,
    restore_color_state,
    set_color_rgb_int,
    set_brightness,
    turn_off,
    turn_on,
)

logger = logging.getLogger("iot-alert")


@dataclass
class DeviceSnapshot:
    available: bool
    was_on: bool
    color_state: Optional[dict]
    color_model: Optional[str]
    brightness: Optional[int]


def remember_device_state() -> DeviceSnapshot:
    """
    Capture device state:
    - availability (online)
    - whether it was on
    - original color
    """
    status = get_device_status()
    available = is_device_available(status)
    was_on = is_device_on(status)
    color_state = get_color_state(status)
    color_model = get_color_model(status)
    brightness = get_brightness_value(status)

    snapshot = DeviceSnapshot(
        available=available,
        was_on=was_on,
        color_state=color_state,
        color_model=color_model,
        brightness=brightness,
    )

    logger.info("snapshot: %s", snapshot)
    return snapshot


def run_alert(
    color_hex: Optional[str] = None,
    duration_sec: Optional[int] = None,
) -> None:
    """
    Flow:
      1. Remember state.
      2. If offline -> log and exit.
      3. If lamp was off -> turn on.
      4. Set alert color, wait.
      5. Restore original color.
      6. If it was off -> turn off again.
    """
    alert_color_hex = color_hex or get_alert_color_hex()
    alert_duration = duration_sec or get_alert_duration_sec()

    logger.info("Starting alert: color=%s, duration=%s",
                alert_color_hex, alert_duration)

    snapshot = remember_device_state()

    if not snapshot.available:
        logger.warning("Device is not available (offline), aborting alert.")
        return

    if not snapshot.was_on:
        logger.info("Lamp was OFF, turning ON for alert...")
        turn_on()
        time.sleep(0.5)

    rgb_value = hex_to_yandex_rgb(alert_color_hex)
    logger.info("Set alert color: %s -> %d", alert_color_hex, rgb_value)
    set_color_rgb_int(rgb_value, snapshot.color_model)

    time.sleep(alert_duration)

    if snapshot.color_state is not None:
        logger.info("Restoring original color: %s", snapshot.color_state)
        restore_color_state(snapshot.color_state)
        time.sleep(0.3)

    if snapshot.brightness is not None:
        logger.info("Restoring original brightness: %s", snapshot.brightness)
        set_brightness(snapshot.brightness)
        time.sleep(0.2)

    if not snapshot.was_on:
        logger.info("Lamp was initially OFF, turning OFF again.")
        turn_off()

    logger.info("Alert finished.")


def run_alert_rainbow(
    color_hex: Optional[str] = None,
    color_hex_2: Optional[str] = None,
    duration_sec: Optional[int] = None,
) -> None:
    """
    Flow:
      1. Remember state.
      2. If offline -> exit.
      3. If lamp was off -> turn on.
      4. Blink between two colors.
      5. Restore original color.
      6. If it was off -> turn off again.
    """
    alert_color_hex_1 = color_hex or get_alert_color_hex()
    alert_color_hex_2 = color_hex_2 or get_alert_color_hex_2()
    alert_duration = duration_sec or get_alert_duration_sec()

    logger.info(
        "Starting rainbow alert: color1=%s, color2=%s, duration=%s",
        alert_color_hex_1, alert_color_hex_2, alert_duration
    )

    snapshot = remember_device_state()

    if not snapshot.available:
        logger.warning("Device is not available (offline), aborting rainbow alert.")
        return

    if not snapshot.was_on:
        logger.info("Lamp was OFF, turning ON for rainbow alert...")
        turn_on()
        time.sleep(0.5)

    rgb_value_1 = hex_to_yandex_rgb(alert_color_hex_1)
    rgb_value_2 = hex_to_yandex_rgb(alert_color_hex_2)

    start_ts = time.time()
    toggle = False
    while time.time() - start_ts < alert_duration:
        set_color_rgb_int(
            rgb_value_1 if toggle else rgb_value_2,
            snapshot.color_model,
        )
        toggle = not toggle
        time.sleep(get_alert_blink_interval_sec())

    if snapshot.color_state is not None:
        logger.info("Restoring original color: %s", snapshot.color_state)
        restore_color_state(snapshot.color_state)
        time.sleep(0.3)

    if snapshot.brightness is not None:
        logger.info("Restoring original brightness: %s", snapshot.brightness)
        set_brightness(snapshot.brightness)
        time.sleep(0.2)

    if not snapshot.was_on:
        logger.info("Lamp was initially OFF, turning OFF again.")
        turn_off()

    logger.info("Rainbow alert finished.")

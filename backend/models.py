"""
Data models and validation routines for the Structural Health Monitoring System.
"""

from datetime import datetime, timezone
import math
from typing import Dict, Any, Tuple, Optional

def get_utc_iso_timestamp() -> str:
    """Returns current UTC ISO-8601 formatted timestamp string."""
    return datetime.now(timezone.utc).isoformat()

def sanitize_float(val: Any, default: float = 0.0) -> float:
    try:
        f = float(val)
        return default if math.isnan(f) or math.isinf(f) else round(f, 4)
    except (ValueError, TypeError):
        return default

def validate_sensor_reading(payload: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
    """
    Validates incoming sensor reading payload from ESP32 or simulation generator.
    
    Expected JSON Structure:
    {
        "floor_id": 1,                          # 1 or 2
        "timestamp": "2026-10-21T11:30:00Z",   # Optional; backend fills if missing
        "tilt": {                               # Degrees
            "pitch": 0.45,
            "roll": -0.12,
            "magnitude": 0.46                   # Optional; auto-calculated if missing
        },
        "accelerometer": {                      # g or m/s^2 (standardized to g)
            "x": 0.01,
            "y": -0.02,
            "z": 0.98
        },
        "gyroscope": {                          # deg/s
            "x": 0.0,
            "y": 0.1,
            "z": 0.0
        },
        "vibration": {
            "detected": false,
            "intensity": 0.02                   # 0.0 to 1.0 normalized
        },
        "crack_detected": false,                # Optional boolean
        "data_source": "live_hardware"          # "live_hardware" | "simulated"
    }
    """
    if not isinstance(payload, dict):
        return False, "Payload must be a JSON object", None

    floor_id = payload.get("floor_id")
    if floor_id not in (1, 2, "1", "2"):
        return False, "floor_id must be 1 or 2", None
    floor_id = int(floor_id)

    timestamp = payload.get("timestamp") or get_utc_iso_timestamp()

    # Accelerometer validation
    raw_accel = payload.get("accelerometer") or {}
    accel = {
        "x": sanitize_float(raw_accel.get("x", 0.0)),
        "y": sanitize_float(raw_accel.get("y", 0.0)),
        "z": sanitize_float(raw_accel.get("z", 1.0))
    }

    # Gyroscope validation
    raw_gyro = payload.get("gyroscope") or {}
    gyro = {
        "x": sanitize_float(raw_gyro.get("x", 0.0)),
        "y": sanitize_float(raw_gyro.get("y", 0.0)),
        "z": sanitize_float(raw_gyro.get("z", 0.0))
    }

    # Tilt validation
    raw_tilt = payload.get("tilt") or {}
    pitch = sanitize_float(raw_tilt.get("pitch", 0.0))
    roll = sanitize_float(raw_tilt.get("roll", 0.0))
    # Calculate magnitude if not explicitly given: sqrt(pitch^2 + roll^2)
    default_mag = round(math.sqrt(pitch**2 + roll**2), 4)
    magnitude = sanitize_float(raw_tilt.get("magnitude", default_mag))

    tilt = {
        "pitch": pitch,
        "roll": roll,
        "magnitude": magnitude
    }

    # Vibration validation
    raw_vib = payload.get("vibration") or {}
    vib_detected = bool(raw_vib.get("detected", False))
    vib_intensity = max(0.0, min(1.0, sanitize_float(raw_vib.get("intensity", 0.0))))

    vibration = {
        "detected": vib_detected,
        "intensity": vib_intensity
    }

    crack_detected = bool(payload.get("crack_detected", False))
    data_source = payload.get("data_source", "live_hardware")

    clean_reading = {
        "floor_id": floor_id,
        "timestamp": timestamp,
        "tilt": tilt,
        "accelerometer": accel,
        "gyroscope": gyro,
        "vibration": vibration,
        "crack_detected": crack_detected,
        "data_source": data_source
    }

    return True, None, clean_reading

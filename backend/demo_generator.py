"""
Demo Data Generator for Simulated Structural Health Monitoring
=============================================================
Provides realistic simulated sensor telemetry for a two-floor miniature building
model when physical ESP32 hardware is not yet connected or during demo testing.
Every reading generated here is explicitly marked with data_source: "simulated".
"""

import time
import math
import random
from datetime import datetime, timezone
from typing import Dict, Any, Tuple

class DemoDataGenerator:
    def __init__(self):
        self.start_time = time.time()
        # Simulated structural state
        self.f1_base_pitch = 0.3
        self.f1_base_roll = -0.1
        self.f2_base_pitch = 0.6
        self.f2_base_roll = 0.2

        # Shock/quake event state
        self.shock_active = False
        self.shock_start_time = 0.0
        self.shock_duration = 6.0
        self.shock_intensity = 0.0

    def trigger_shock(self, intensity: float = 0.8, duration: float = 6.0):
        """Simulates an earthquake or structural impact on the building model."""
        self.shock_active = True
        self.shock_start_time = time.time()
        self.shock_intensity = max(0.2, min(1.0, intensity))
        self.shock_duration = duration

    def _get_shock_decay(self) -> float:
        """Returns the current decaying shock multiplier (0.0 to 1.0)."""
        if not self.shock_active:
            return 0.0
        elapsed = time.time() - self.shock_start_time
        if elapsed > self.shock_duration:
            self.shock_active = False
            # Leave a slight residual tilt after shock
            self.f1_base_pitch += (self.shock_intensity * 0.4)
            self.f2_base_pitch += (self.shock_intensity * 0.8)
            return 0.0
        # Exponential decay envelope
        progress = elapsed / self.shock_duration
        envelope = math.exp(-3.0 * progress) * math.sin(elapsed * 12.0)
        return envelope * self.shock_intensity

    def generate_pair(self) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """Generates synchronized readings for Floor 1 and Floor 2."""
        now_iso = datetime.now(timezone.utc).isoformat()
        t = time.time() - self.start_time
        shock = self._get_shock_decay()

        # --- Floor 1 (Lower Floor: Stiffer, Ground-coupled) ---
        f1_vib_intensity = abs(0.04 * math.sin(t * 0.8) + random.uniform(-0.02, 0.02))
        f1_pitch = self.f1_base_pitch + 0.1 * math.sin(t * 0.5)
        f1_roll = self.f1_base_roll + 0.08 * math.cos(t * 0.4)

        if shock != 0.0:
            f1_pitch += shock * 2.5
            f1_roll += shock * 1.8
            f1_vib_intensity = min(1.0, f1_vib_intensity + abs(shock) * 0.85)

        f1_tilt_mag = round(math.sqrt(f1_pitch**2 + f1_roll**2), 2)
        f1_ax = round(0.02 * math.sin(t * 2.0) + (shock * 0.4), 3)
        f1_ay = round(0.02 * math.cos(t * 2.0) + (shock * 0.3), 3)
        f1_az = round(0.98 + (shock * 0.2), 3)

        f1_reading = {
            "floor_id": 1,
            "timestamp": now_iso,
            "tilt": {
                "pitch": round(f1_pitch, 2),
                "roll": round(f1_roll, 2),
                "magnitude": f1_tilt_mag
            },
            "accelerometer": {"x": f1_ax, "y": f1_ay, "z": f1_az},
            "gyroscope": {
                "x": round(0.1 * math.sin(t * 1.5) + (shock * 15.0), 2),
                "y": round(0.1 * math.cos(t * 1.5) + (shock * 12.0), 2),
                "z": round(0.05 * math.sin(t * 0.5), 2)
            },
            "vibration": {
                "detected": f1_vib_intensity > 0.25,
                "intensity": round(f1_vib_intensity, 3)
            },
            "crack_detected": False,
            "data_source": "simulated"
        }

        # --- Floor 2 (Upper Floor: Flexible, Sway Amplification) ---
        f2_sway_amp = 1.6  # Upper floor amplifies sway by 1.6x
        f2_vib_intensity = abs(0.06 * math.sin(t * 0.9) + random.uniform(-0.03, 0.03))
        f2_pitch = self.f2_base_pitch + 0.25 * math.sin(t * 0.6)
        f2_roll = self.f2_base_roll + 0.20 * math.cos(t * 0.5)

        if shock != 0.0:
            f2_pitch += shock * (2.5 * f2_sway_amp)
            f2_roll += shock * (1.8 * f2_sway_amp)
            f2_vib_intensity = min(1.0, f2_vib_intensity + abs(shock) * 1.0)

        f2_tilt_mag = round(math.sqrt(f2_pitch**2 + f2_roll**2), 2)
        f2_ax = round(0.05 * math.sin(t * 2.5) + (shock * 0.7), 3)
        f2_ay = round(0.05 * math.cos(t * 2.5) + (shock * 0.5), 3)
        f2_az = round(0.97 + (shock * 0.35), 3)

        f2_reading = {
            "floor_id": 2,
            "timestamp": now_iso,
            "tilt": {
                "pitch": round(f2_pitch, 2),
                "roll": round(f2_roll, 2),
                "magnitude": f2_tilt_mag
            },
            "accelerometer": {"x": f2_ax, "y": f2_ay, "z": f2_az},
            "gyroscope": {
                "x": round(0.2 * math.sin(t * 2.0) + (shock * 28.0), 2),
                "y": round(0.2 * math.cos(t * 2.0) + (shock * 22.0), 2),
                "z": round(0.1 * math.sin(t * 0.8), 2)
            },
            "vibration": {
                "detected": f2_vib_intensity > 0.25,
                "intensity": round(f2_vib_intensity, 3)
            },
            "crack_detected": False,
            "data_source": "simulated"
        }

        return f1_reading, f2_reading

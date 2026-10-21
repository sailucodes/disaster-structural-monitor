"""
Sensor Service and State Store
==============================
Maintains real-time telemetry buffer, hardware heartbeat, alert generation,
and historical ring buffers for Floor 1 and Floor 2.
"""

import time
import uuid
from collections import deque
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from models import validate_sensor_reading, get_utc_iso_timestamp
from demo_generator import DemoDataGenerator
import ml_service

class SensorStateStore:
    def __init__(self, max_history: int = 300, esp32_timeout_sec: float = 15.0):
        self.max_history = max_history
        self.esp32_timeout_sec = esp32_timeout_sec

        # Telemetry ring buffers
        self.history_f1 = deque(maxlen=max_history)
        self.history_f2 = deque(maxlen=max_history)

        # Latest readings
        self.latest_f1: Optional[Dict[str, Any]] = None
        self.latest_f2: Optional[Dict[str, Any]] = None

        # Hardware connection tracking
        self.last_live_hardware_ping: Optional[float] = None
        self.last_esp32_ip: Optional[str] = None
        self.esp32_uptime_seconds: Optional[int] = None
        self.total_packets_received: int = 0

        # Demo simulation generator
        self.demo_generator = DemoDataGenerator()
        self.demo_mode_enabled = True
        self.last_demo_tick = 0.0

        # Alerts store
        self.alerts = deque(maxlen=200)

        # Individual sensor health states
        self.sensor_health = {
            "mpu6050_f1": {"status": "ok", "mux_channel": 0, "name": "MPU6050 Floor 1", "last_seen": None},
            "mpu6050_f2": {"status": "ok", "mux_channel": 1, "name": "MPU6050 Floor 2", "last_seen": None},
            "vibration_f1": {"status": "ok", "pin": "GPIO 32", "name": "Vibration Sensor Floor 1", "last_seen": None},
            "vibration_f2": {"status": "ok", "pin": "GPIO 33", "name": "Vibration Sensor Floor 2", "last_seen": None},
            "crack_sensor": {"status": "standby", "pin": "GPIO 34", "name": "Expansion Crack Detector", "last_seen": None}
        }

        # Initialize with baseline demo reading so frontend isn't blank
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Seed initial state with demo readings."""
        f1, f2 = self.demo_generator.generate_pair()
        self.record_reading(f1, is_live=False)
        self.record_reading(f2, is_live=False)
        self.add_alert(
            floor_id=0,
            severity="info",
            title="System Initialized",
            message="Structural health monitoring daemon running in simulated demo mode awaiting ESP32 hardware."
        )

    def is_hardware_live(self) -> bool:
        if self.last_live_hardware_ping is None:
            return False
        return (time.time() - self.last_live_hardware_ping) <= self.esp32_timeout_sec

    def get_system_mode(self) -> str:
        """Returns 'live', 'demo', or 'offline'."""
        if self.is_hardware_live():
            return "live"
        if self.demo_mode_enabled:
            return "demo"
        return "offline"

    def record_reading(self, reading: Dict[str, Any], is_live: bool = False, remote_ip: Optional[str] = None):
        floor_id = reading["floor_id"]
        now = time.time()
        iso_now = reading.get("timestamp") or get_utc_iso_timestamp()

        if is_live:
            reading["data_source"] = "live_hardware"
            self.last_live_hardware_ping = now
            self.total_packets_received += 1
            if remote_ip:
                self.last_esp32_ip = remote_ip
        else:
            if "data_source" not in reading:
                reading["data_source"] = "simulated"

        # Update per-floor buffers and sensor health
        if floor_id == 1:
            self.latest_f1 = reading
            self.history_f1.append(reading)
            self.sensor_health["mpu6050_f1"]["last_seen"] = iso_now
            self.sensor_health["mpu6050_f1"]["status"] = "ok"
            self.sensor_health["vibration_f1"]["last_seen"] = iso_now
            self.sensor_health["vibration_f1"]["status"] = "ok"
        elif floor_id == 2:
            self.latest_f2 = reading
            self.history_f2.append(reading)
            self.sensor_health["mpu6050_f2"]["last_seen"] = iso_now
            self.sensor_health["mpu6050_f2"]["status"] = "ok"
            self.sensor_health["vibration_f2"]["last_seen"] = iso_now
            self.sensor_health["vibration_f2"]["status"] = "ok"

        # Check safety thresholds and emit alerts
        self._evaluate_safety_thresholds(reading)

    def _evaluate_safety_thresholds(self, reading: Dict[str, Any]):
        floor_id = reading["floor_id"]
        tilt_mag = reading.get("tilt", {}).get("magnitude", 0.0)
        vib_intensity = reading.get("vibration", {}).get("intensity", 0.0)
        vib_detected = reading.get("vibration", {}).get("detected", False)
        crack_detected = reading.get("crack_detected", False)

        # Severe tilt check (> 5.0 deg)
        if tilt_mag >= 5.0:
            self.add_alert(
                floor_id=floor_id,
                severity="critical",
                title=f"Critical Tilt on Floor {floor_id}",
                message=f"Severe structural inclination of {tilt_mag:.1f}° exceeds critical threshold (5.0°)."
            )
        elif tilt_mag >= 2.5:
            # Only alert occasionally or if not recently alerted
            self.add_alert(
                floor_id=floor_id,
                severity="warning",
                title=f"Elevated Tilt Warning - Floor {floor_id}",
                message=f"Structural tilt of {tilt_mag:.1f}° observed. Exceeds warning threshold (2.5°)."
            )

        # Vibration shock check
        if vib_intensity >= 0.7:
            self.add_alert(
                floor_id=floor_id,
                severity="critical",
                title=f"High Dynamic Vibration - Floor {floor_id}",
                message=f"Intense oscillatory tremor detected with intensity {vib_intensity:.2f}."
            )
        elif vib_detected and vib_intensity >= 0.35:
            self.add_alert(
                floor_id=floor_id,
                severity="warning",
                title=f"Vibration Alert - Floor {floor_id}",
                message=f"Moderate vibration event registered (intensity: {vib_intensity:.2f})."
            )

        # Crack sensor trigger
        if crack_detected:
            self.add_alert(
                floor_id=floor_id,
                severity="critical",
                title=f"Surface Crack Detected - Floor {floor_id}",
                message="Expansion crack sensor impedance changed. Possible structural fissure."
            )

    def add_alert(self, floor_id: int, severity: str, title: str, message: str):
        # Deduplicate consecutive identical alerts within short time
        if self.alerts:
            last = self.alerts[0]
            if last["title"] == title and last["floor_id"] == floor_id:
                # avoid spamming same alert repeatedly
                return

        alert_item = {
            "id": str(uuid.uuid4())[:8],
            "timestamp": get_utc_iso_timestamp(),
            "floor_id": floor_id,
            "severity": severity,  # "info", "warning", "critical"
            "title": title,
            "message": message
        }
        self.alerts.appendleft(alert_item)

    def trigger_shock_simulation(self, intensity: float = 0.8):
        """Simulate an earthquake shock across the building."""
        self.demo_generator.trigger_shock(intensity=intensity)
        self.add_alert(
            floor_id=0,
            severity="warning",
            title="Simulated Shock Event Triggered",
            message=f"Manual test seismic shock impulse applied at intensity {intensity:.1f}."
        )

    def tick_demo_generator_if_needed(self):
        """Called periodically to inject simulated readings if hardware is absent."""
        if not self.is_hardware_live() and self.demo_mode_enabled:
            now = time.time()
            if now - self.last_demo_tick >= 1.5:  # Every 1.5 seconds
                self.last_demo_tick = now
                f1, f2 = self.demo_generator.generate_pair()
                self.record_reading(f1, is_live=False)
                self.record_reading(f2, is_live=False)

    def get_latest_readings(self) -> Dict[str, Any]:
        self.tick_demo_generator_if_needed()
        return {
            "system_mode": self.get_system_mode(),
            "hardware_connected": self.is_hardware_live(),
            "timestamp": get_utc_iso_timestamp(),
            "floor_1": self.latest_f1,
            "floor_2": self.latest_f2
        }

    def get_history(self, limit: int = 60, floor_id: Optional[int] = None) -> List[Dict[str, Any]]:
        self.tick_demo_generator_if_needed()
        if floor_id == 1:
            records = list(self.history_f1)[-limit:]
        elif floor_id == 2:
            records = list(self.history_f2)[-limit:]
        else:
            # Interleave both floors ordered by timestamp
            combined = list(self.history_f1) + list(self.history_f2)
            combined.sort(key=lambda r: r.get("timestamp", ""))
            records = combined[-(limit * 2):]
        return records

    def get_risk_assessment(self) -> Dict[str, Any]:
        self.tick_demo_generator_if_needed()
        # Call the dedicated ML service integration hook
        risk_result = ml_service.predict_structural_risk(
            latest_f1=self.latest_f1,
            latest_f2=self.latest_f2,
            history_window=list(self.history_f1)[-15:]
        )
        risk_result["hardware_connected"] = self.is_hardware_live()
        risk_result["system_mode"] = self.get_system_mode()
        risk_result["last_update"] = get_utc_iso_timestamp()
        return risk_result

    def get_alerts(self, severity: Optional[str] = None, floor_id: Optional[int] = None) -> List[Dict[str, Any]]:
        results = list(self.alerts)
        if severity and severity.lower() != "all":
            results = [a for a in results if a.get("severity", "").lower() == severity.lower()]
        if floor_id is not None and str(floor_id).lower() != "all":
            try:
                fid = int(floor_id)
                results = [a for a in results if a.get("floor_id") == fid]
            except ValueError:
                pass
        return results

    def get_system_status(self) -> Dict[str, Any]:
        self.tick_demo_generator_if_needed()
        is_live = self.is_hardware_live()
        now = time.time()
        
        # Calculate active sensors
        active_count = 0
        sensors_report = {}
        for key, s in self.sensor_health.items():
            status = "ok" if (is_live or self.demo_mode_enabled) else "disconnected"
            if key == "crack_sensor":
                status = "standby (optional)"
            else:
                active_count += 1
            sensors_report[key] = {
                "name": s["name"],
                "status": status,
                "interface": s.get("pin") or f"MUX Channel {s.get('mux_channel')}",
                "last_seen": s.get("last_seen")
            }

        return {
            "backend": {
                "status": "online",
                "mode": self.get_system_mode(),
                "timestamp": get_utc_iso_timestamp()
            },
            "esp32_connection": {
                "is_connected": is_live,
                "ip_address": self.last_esp32_ip or ("192.168.1.105 (simulated)" if self.demo_mode_enabled else None),
                "last_heartbeat": self.last_live_hardware_ping,
                "seconds_since_last_ping": round(now - self.last_live_hardware_ping, 1) if self.last_live_hardware_ping else None,
                "total_packets_received": self.total_packets_received
            },
            "sensors": sensors_report,
            "active_sensor_count": active_count,
            "total_sensor_count": 4, # 2 MPU6050 + 2 Vibration
            "ml_model": ml_service.get_ml_status(),
            "unresolved_alerts_count": len([a for a in self.alerts if a.get("severity") in ("critical", "warning")])
        }

# Global Singleton Instance
state_store = SensorStateStore()

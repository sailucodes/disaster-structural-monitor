"""
Automated unit & integration test suite for the Flask backend.
"""

import json
import unittest
from app import app
from sensor_service import state_store

class TestStructuralHealthBackend(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["ml_model_status"], "not_integrated")
        self.assertIn("system_mode", data)

    def test_02_readings_endpoint(self):
        res = self.client.get("/api/readings")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("floor_1", data)
        self.assertIn("floor_2", data)
        self.assertIn("system_mode", data)
        self.assertIsNotNone(data["floor_1"])
        self.assertIsNotNone(data["floor_2"])

    def test_03_post_single_reading(self):
        payload = {
            "floor_id": 1,
            "timestamp": "2026-10-21T12:00:00Z",
            "tilt": {"pitch": 1.1, "roll": 0.2, "magnitude": 1.12},
            "accelerometer": {"x": 0.01, "y": 0.02, "z": 0.99},
            "gyroscope": {"x": 0.0, "y": 0.0, "z": 0.0},
            "vibration": {"detected": False, "intensity": 0.04},
            "crack_detected": False
        }
        res = self.client.post("/api/readings", data=json.dumps(payload), content_type="application/json")
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertEqual(data["floor_id"], 1)

    def test_04_post_batch_reading(self):
        batch = [
            {
                "floor_id": 1,
                "tilt": {"pitch": 0.5, "roll": 0.1},
                "accelerometer": {"x": 0.0, "y": 0.0, "z": 1.0},
                "vibration": {"detected": False, "intensity": 0.02}
            },
            {
                "floor_id": 2,
                "tilt": {"pitch": 0.8, "roll": 0.3},
                "accelerometer": {"x": 0.0, "y": 0.0, "z": 0.98},
                "vibration": {"detected": False, "intensity": 0.03}
            }
        ]
        res = self.client.post("/api/readings", data=json.dumps(batch), content_type="application/json")
        self.assertEqual(res.status_code, 201)

    def test_05_history_endpoint(self):
        res = self.client.get("/api/history?limit=10")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("readings", data)
        self.assertGreater(len(data["readings"]), 0)

    def test_06_risk_assessment_endpoint(self):
        res = self.client.get("/api/risk")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["model_status"], "not_integrated")
        self.assertFalse(data["is_ml_prediction"])
        self.assertIn(data["overall_risk_level"], ["Low", "Medium", "High"])
        self.assertIn("floor_risks", data)
        self.assertIn("floor_1", data["floor_risks"])
        self.assertIn("floor_2", data["floor_risks"])

    def test_07_alerts_endpoint(self):
        res = self.client.get("/api/alerts")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("alerts", data)

    def test_08_system_status_endpoint(self):
        res = self.client.get("/api/system-status")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("backend", data)
        self.assertIn("esp32_connection", data)
        self.assertIn("sensors", data)
        self.assertIn("ml_model", data)
        self.assertEqual(data["ml_model"]["status"], "not_integrated")

    def test_09_trigger_shock_simulation(self):
        res = self.client.post("/api/demo/trigger-shock", data=json.dumps({"intensity": 0.9}), content_type="application/json")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "active")

if __name__ == "__main__":
    unittest.main()

"""
Flask REST API for AI-Based Post-Disaster Structural Health Monitoring System
============================================================================
"""

import os
import time
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

from models import validate_sensor_reading, get_utc_iso_timestamp
from sensor_service import state_store
import ml_service

load_dotenv()

app = Flask(__name__)
# Enable CORS for all routes so Vite frontend can access it seamlessly
CORS(app, resources={r"/api/*": {"origins": "*"}})

START_TIME = time.time()

@app.route("/api/health", methods=["GET"])
def get_health():
    """Backend status and ML model integration health."""
    uptime_sec = round(time.time() - START_TIME, 1)
    return jsonify({
        "status": "online",
        "service": "AI-Based Structural Health Monitoring Backend",
        "uptime_seconds": uptime_sec,
        "system_mode": state_store.get_system_mode(),
        "hardware_connected": state_store.is_hardware_live(),
        "ml_model_status": ml_service.MODEL_STATUS,
        "timestamp": get_utc_iso_timestamp()
    }), 200

@app.route("/api/readings", methods=["GET"])
def get_latest_readings():
    """Retrieve latest telemetry for Floor 1 and Floor 2."""
    readings = state_store.get_latest_readings()
    return jsonify(readings), 200

@app.route("/api/readings", methods=["POST"])
def post_readings():
    """
    Ingress endpoint for ESP32 microcontroller or test clients.
    Supports single reading object or a batch list of readings.
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    payload = request.get_json()
    remote_ip = request.remote_addr

    if isinstance(payload, list):
        success_count = 0
        errors = []
        for idx, item in enumerate(payload):
            valid, err, cleaned = validate_sensor_reading(item)
            if valid:
                state_store.record_reading(cleaned, is_live=True, remote_ip=remote_ip)
                success_count += 1
            else:
                errors.append(f"Item #{idx}: {err}")
        return jsonify({
            "message": f"Processed {success_count} readings successfully",
            "errors": errors if errors else None
        }), 201

    # Single reading payload
    valid, err, cleaned = validate_sensor_reading(payload)
    if not valid:
        return jsonify({"error": err}), 400

    state_store.record_reading(cleaned, is_live=True, remote_ip=remote_ip)
    return jsonify({
        "message": "Reading recorded successfully",
        "floor_id": cleaned["floor_id"],
        "timestamp": cleaned["timestamp"]
    }), 201

@app.route("/api/history", methods=["GET"])
def get_history():
    """Historical sensor telemetry with query parameters: limit and floor_id."""
    limit = request.args.get("limit", default=60, type=int)
    floor_id = request.args.get("floor_id", default=None, type=int)
    
    # Cap limit between 5 and 300
    limit = max(5, min(300, limit))
    history = state_store.get_history(limit=limit, floor_id=floor_id)
    return jsonify({
        "count": len(history),
        "limit": limit,
        "floor_id": floor_id,
        "readings": history
    }), 200

@app.route("/api/risk", methods=["GET"])
def get_risk():
    """
    Current risk assessment results. Calls ml_service.predict_structural_risk().
    Transparently reports model_status: 'not_integrated'.
    """
    risk = state_store.get_risk_assessment()
    return jsonify(risk), 200

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    """Recent alerts with severity and floor filters."""
    severity = request.args.get("severity", default=None, type=str)
    floor_id = request.args.get("floor_id", default=None, type=str)

    alerts = state_store.get_alerts(severity=severity, floor_id=floor_id)
    return jsonify({
        "total": len(alerts),
        "alerts": alerts
    }), 200

@app.route("/api/system-status", methods=["GET"])
def get_system_status():
    """Hardware connectivity, individual sensors, backend, and ML integration status."""
    status = state_store.get_system_status()
    return jsonify(status), 200

@app.route("/api/demo/trigger-shock", methods=["POST"])
def trigger_shock():
    """Simulates an earthquake or seismic impulse on the building model."""
    data = request.get_json(silent=True) or {}
    intensity = float(data.get("intensity", 0.85))
    state_store.trigger_shock_simulation(intensity=intensity)
    return jsonify({
        "message": f"Simulated seismic shock triggered with intensity {intensity:.2f}",
        "status": "active"
    }), 200

@app.route("/api/demo/toggle", methods=["POST"])
def toggle_demo():
    """Toggle demo simulation generation on or off."""
    state_store.demo_mode_enabled = not state_store.demo_mode_enabled
    return jsonify({
        "demo_mode_enabled": state_store.demo_mode_enabled,
        "system_mode": state_store.get_system_mode()
    }), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"[*] AI-Based Structural Health Monitoring Backend starting on http://{host}:{port}")
    app.run(host=host, port=port, debug=False)

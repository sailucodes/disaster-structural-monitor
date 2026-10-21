"""
Machine Learning Service Integration Point
==========================================
Project: AI-Based Post-Disaster Structural Health Monitoring System

INTEGRATION INSTRUCTIONS FOR ML TEAM MEMBER:
1. Place your trained model file(s) in this directory (e.g., `model.pkl`, `weights.onnx`, or `saved_model/`).
2. Update `MODEL_STATUS` below from "not_integrated" to "ready" or "active".
3. Implement the `load_ml_model()` function to load your weights once at startup.
4. Replace the baseline fallback logic in `predict_structural_risk()` with your model's inference code.
5. Ensure your prediction function adheres to the documented return dictionary contract.
"""

import os
from typing import Dict, Any, List

# Model Integration Flag: Kept as "not_integrated" per project requirements.
# When your teammate provides the model file, set this to "ready" or "active".
MODEL_STATUS = "not_integrated"
MODEL_METADATA = {
    "model_name": "Post-Disaster Structural Health Evaluator (Pending)",
    "version": "v0.0-unintegrated",
    "framework": "TBD (TensorFlow / PyTorch / Scikit-Learn)",
    "target_inputs": [
        "MPU6050 Floor 1: ax, ay, az, gx, gy, gz, pitch, roll",
        "MPU6050 Floor 2: ax, ay, az, gx, gy, gz, pitch, roll",
        "Dual Vibration Sensor States & Intensities"
    ],
    "target_outputs": [
        "structural_damage_probability (0.0 to 1.0)",
        "risk_level (Low, Medium, High)",
        "floor_specific_impact"
    ],
    "integration_guide": "See comments in backend/ml_service.py to connect model weights."
}

_LOADED_MODEL = None

def load_ml_model():
    """
    HOOK FOR TEAM MEMBER:
    Load your trained model weights here.
    Example:
        global _LOADED_MODEL
        import joblib
        model_path = os.path.join(os.path.dirname(__file__), "trained_model.joblib")
        if os.path.exists(model_path):
            _LOADED_MODEL = joblib.load(model_path)
            return True
        return False
    """
    global _LOADED_MODEL
    # Currently no model files are present. Do not invent fake weights.
    _LOADED_MODEL = None
    return False

def predict_structural_risk(latest_f1: Dict[str, Any], latest_f2: Dict[str, Any], history_window: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Clean integration point for Structural Risk Prediction.
    
    Parameters:
    -----------
    latest_f1 : dict
        Cleaned telemetry payload for Floor 1 (tilt, accel, gyro, vibration).
    latest_f2 : dict
        Cleaned telemetry payload for Floor 2 (tilt, accel, gyro, vibration).
    history_window : list of dicts, optional
        Recent sequential readings (e.g. past 30 seconds) for temporal recurrent/CNN/transformer models.

    Returns:
    --------
    dict:
        {
            "model_status": "not_integrated",   # or "active" once loaded
            "is_ml_prediction": False,          # True only when actual ML runs
            "method": "rule_based_baseline",    # or "neural_network", "random_forest"
            "overall_risk_level": "Low" | "Medium" | "High",
            "overall_score": float (0.0 - 1.0),
            "floor_risks": {
                "floor_1": {
                    "level": "Low" | "Medium" | "High",
                    "score": float,
                    "explanation": str
                },
                "floor_2": {
                    "level": "Low" | "Medium" | "High",
                    "score": float,
                    "explanation": str
                }
            },
            "disclaimer": str
        }
    """
    # ------------------------------------------------------------------------
    # STEP 1: Check if external ML model is loaded
    # ------------------------------------------------------------------------
    if _LOADED_MODEL is not None and MODEL_STATUS == "active":
        # --- ML inference code will go here once model is provided ---
        pass

    # ------------------------------------------------------------------------
    # STEP 2: Baseline Fallback Evaluation (Non-ML Heuristic Baseline)
    # This evaluates known structural thresholds transparently WITHOUT
    # fabricating neural network / ML inferences.
    # ------------------------------------------------------------------------
    f1_risk = _evaluate_floor_baseline(latest_f1, floor_name="Floor 1")
    f2_risk = _evaluate_floor_baseline(latest_f2, floor_name="Floor 2")

    # Combine overall risk
    max_score = max(f1_risk["score"], f2_risk["score"])
    if max_score >= 0.7:
        overall_level = "High"
    elif max_score >= 0.35:
        overall_level = "Medium"
    else:
        overall_level = "Low"

    return {
        "model_status": MODEL_STATUS,
        "is_ml_prediction": False,
        "method": "baseline_engineering_rules",
        "overall_risk_level": overall_level,
        "overall_score": round(max_score, 2),
        "floor_risks": {
            "floor_1": f1_risk,
            "floor_2": f2_risk
        },
        "ml_metadata": MODEL_METADATA,
        "disclaimer": "ML model is not integrated yet. Displayed risk is computed from baseline engineering thresholds (tilt angles and vibration intensity)."
    }

def _evaluate_floor_baseline(floor_reading: Dict[str, Any], floor_name: str) -> Dict[str, Any]:
    """Helper to compute deterministic physical threshold evaluation."""
    if not floor_reading:
        return {
            "level": "Low",
            "score": 0.0,
            "explanation": f"Awaiting initial sensor data for {floor_name}."
        }

    tilt_mag = floor_reading.get("tilt", {}).get("magnitude", 0.0)
    vib_intensity = floor_reading.get("vibration", {}).get("intensity", 0.0)
    vib_detected = floor_reading.get("vibration", {}).get("detected", False)
    crack_detected = floor_reading.get("crack_detected", False)

    explanations = []
    score = 0.0

    # Tilt angle evaluation
    if tilt_mag >= 5.0:
        score += 0.55
        explanations.append(f"Critical permanent tilt observed ({tilt_mag:.1f}°)")
    elif tilt_mag >= 2.5:
        score += 0.30
        explanations.append(f"Noticeable inclination angle ({tilt_mag:.1f}°)")
    else:
        score += 0.05
        explanations.append(f"Structure within acceptable alignment ({tilt_mag:.1f}°)")

    # Vibration evaluation
    if vib_intensity >= 0.6 or (vib_detected and vib_intensity >= 0.4):
        score += 0.35
        explanations.append(f"High vibration or dynamic oscillation detected (intensity: {vib_intensity:.2f})")
    elif vib_intensity >= 0.2:
        score += 0.15
        explanations.append(f"Moderate transient tremor detected (intensity: {vib_intensity:.2f})")

    # Crack detection (optional sensor)
    if crack_detected:
        score += 0.40
        explanations.append("Crack sensor trigger reported on expansion pin")

    score = min(1.0, round(score, 2))

    if score >= 0.65:
        level = "High"
    elif score >= 0.35:
        level = "Medium"
    else:
        level = "Low"

    return {
        "level": level,
        "score": score,
        "explanation": "; ".join(explanations)
    }

def get_ml_status() -> Dict[str, Any]:
    """Returns current status of ML subsystem."""
    return {
        "status": MODEL_STATUS,
        "is_ready": _LOADED_MODEL is not None,
        "integration_target": "backend/ml_service.py -> predict_structural_risk()",
        "metadata": MODEL_METADATA
    }

# AI-Based Post-Disaster Structural Health Monitoring System

> **College Prototype Disclaimer**: This project is an experimental engineering prototype designed for monitoring a two-floor miniature building model subjected to simulated seismic vibrations. It is built for laboratory demonstration and academic research, and is **not certified for real-world municipal or building life safety**.

---

## 1. Project Overview

The **AI-Based Post-Disaster Structural Health Monitoring System** is a full-stack IoT and analytics dashboard that monitors structural integrity after simulated seismic or impact events. 

### Core Hardware Setup
* **Microcontroller**: ESP32 (Wi-Fi + Dual-Core Xtensa).
* **Multiplexer**: PCA9548A 8-Channel I²C Multiplexer (Address `0x70`) resolving I²C address conflicts between identical sensors.
* **Inertial Transducers**: 2× MPU6050 6-Axis Accelerometers & Gyroscopes (Floor 1 on MUX Ch 0, Floor 2 on MUX Ch 1).
* **Vibration Sensors**: 2× Piezoelectric / SW-420 Vibration Modules (Floor 1 on GPIO 32, Floor 2 on GPIO 33).
* **Expansion Slot**: Surface crack detection interface (GPIO 34).

### Key Software Architecture
* **Frontend**: React 18 with Vite, Tailwind CSS, Recharts time-series graphs, and Lucide icons.
* **Backend**: Python 3 Flask REST API with CORS support and ring-buffer telemetry storage.
* **ML Model Integration Point**: A clean, decoupled service (`backend/ml_service.py`) with zero fabricated predictions. It currently reports `model_status: "not_integrated"` with deterministic baseline engineering rules until your teammate provides the trained model weights.
* **Built-in Demo Simulator**: Automatically simulates structural micro-tremors and sway when hardware is offline, and allows simulating earthquake shocks via a single click in the UI.

---

## 2. System Architecture & Topology

```
+-----------------------------------------------------------------------------------+
|                            HARDWARE PROTOTYPE                                     |
|                                                                                   |
|  [Floor 1: MPU6050] ---> Ch 0 \                                                   |
|                                [PCA9548A MUX (0x70)] <---> [ESP32 Microcontroller]|
|  [Floor 2: MPU6050] ---> Ch 1 /                              |                    |
|                                                              |                    |
|  [Floor 1: Vibration] ---> GPIO 32 --------------------------+                    |
|  [Floor 2: Vibration] ---> GPIO 33 --------------------------+                    |
|  [Crack Sensor Exp.]  ---> GPIO 34 --------------------------/                    |
+-----------------------------------------------------------------------------------+
                                                               |
                                              Wi-Fi POST /api/readings (JSON)
                                                               v
+-----------------------------------------------------------------------------------+
|                        PYTHON FLASK BACKEND (:5000)                               |
|                                                                                   |
|   - POST /api/readings    : Sensor data ingress & validation                      |
|   - GET  /api/readings    : Latest readings for Floor 1 & 2                       |
|   - GET  /api/history     : Sequential time-series buffer                         |
|   - GET  /api/risk        : Risk calculation (Hook to ml_service.py)              |
|   - GET  /api/alerts      : Anomaly & threshold events                            |
|   - GET  /api/system-status: Gateway & Transducer bus diagnostics                 |
|   - ml_service.py         : Dedicated ML Integration Hook                         |
+-----------------------------------------------------------------------------------+
                                                               ^
                                               REST Polling (1.5s interval)
                                                               |
+-----------------------------------------------------------------------------------+
|                        REACT + VITE DASHBOARD (:5173)                             |
|                                                                                   |
|   1. Dashboard            : Structural risk index, floor cards, active KPIs       |
|   2. Floor Monitoring     : 2D Inclinometer bubble, 6-DoF telemetry, piezo meters |
|   3. Analytics            : Recharts tilt & vibration comparison, CSV export      |
|   4. Alerts & History     : Incident logs with severity & floor filters           |
|   5. System Status        : ESP32 ping, sensor topology, ML status card           |
+-----------------------------------------------------------------------------------+
```

---

## 3. Hardware Wiring Guide

### I²C Multiplexer (PCA9548A) to ESP32
| PCA9548A Pin | ESP32 Pin | Function |
| :--- | :--- | :--- |
| **VCC** | 3.3V / 5V | Power Supply |
| **GND** | GND | Ground Reference |
| **SDA** | GPIO 21 | I²C Serial Data |
| **SCL** | GPIO 22 | I²C Serial Clock |
| **A0, A1, A2** | GND | Sets I²C Address to `0x70` |
| **RESET** | 3.3V | Pulled HIGH to enable chip |

### MPU6050 Transducers to PCA9548A
| Sensor | VCC | GND | SCL | SDA | AD0 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Floor 1 MPU6050** | 3.3V | GND | PCA9548A **SC0** (Channel 0) | PCA9548A **SD0** (Channel 0) | GND (`0x68`) |
| **Floor 2 MPU6050** | 3.3V | GND | PCA9548A **SC1** (Channel 1) | PCA9548A **SD1** (Channel 1) | GND (`0x68`) |

### Vibration & Crack Sensors to ESP32
| Sensor | ESP32 Pin | Mode |
| :--- | :--- | :--- |
| **Floor 1 Vibration Module (DO / AO)** | GPIO 32 | Digital / ADC In |
| **Floor 2 Vibration Module (DO / AO)** | GPIO 33 | Digital / ADC In |
| **Crack Detector Module (Optional)** | GPIO 34 | Analog / Digital In |

---

## 4. ESP32 Arduino C++ Firmware Sample

Flash this sketch onto the ESP32 to transmit real sensor readings to the Flask backend:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <MPU6050.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://192.168.1.100:5000/api/readings"; // Replace with your laptop's IP

#define PCA9548A_ADDR 0x70
#define VIB_PIN_F1 32
#define VIB_PIN_F2 33
#define CRACK_PIN  34

MPU6050 mpu;

void selectI2CChannel(uint8_t channel) {
  if (channel > 7) return;
  Wire.beginTransmission(PCA9548A_ADDR);
  Wire.write(1 << channel);
  Wire.endTransmission();
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);

  pinMode(VIB_PIN_F1, INPUT);
  pinMode(VIB_PIN_F2, INPUT);
  pinMode(CRACK_PIN, INPUT);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n[+] WiFi Connected! IP: " + WiFi.localIP().toString());

  // Initialize Floor 1 MPU6050
  selectI2CChannel(0);
  mpu.initialize();

  // Initialize Floor 2 MPU6050
  selectI2CChannel(1);
  mpu.initialize();
}

void sendFloorReading(int floorId, uint8_t muxChannel, int vibPin) {
  selectI2CChannel(muxChannel);

  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

  // Convert raw readings to physical units
  float ax_g = ax / 16384.0;
  float ay_g = ay / 16384.0;
  float az_g = az / 16384.0;
  float gx_ds = gx / 131.0;
  float gy_ds = gy / 131.0;
  float gz_ds = gz / 131.0;

  // Approximate pitch and roll
  float pitch = atan2(-ax_g, sqrt(ay_g * ay_g + az_g * az_g)) * 180.0 / PI;
  float roll  = atan2(ay_g, az_g) * 180.0 / PI;
  float magnitude = sqrt(pitch * pitch + roll * roll);

  bool vibDetected = digitalRead(vibPin) == HIGH;
  float vibIntensity = vibDetected ? 0.75 : 0.05;

  StaticJsonDocument<512> doc;
  doc["floor_id"] = floorId;
  
  JsonObject tilt = doc.createNestedObject("tilt");
  tilt["pitch"] = round(pitch * 100) / 100.0;
  tilt["roll"] = round(roll * 100) / 100.0;
  tilt["magnitude"] = round(magnitude * 100) / 100.0;

  JsonObject accel = doc.createNestedObject("accelerometer");
  accel["x"] = round(ax_g * 1000) / 1000.0;
  accel["y"] = round(ay_g * 1000) / 1000.0;
  accel["z"] = round(az_g * 1000) / 1000.0;

  JsonObject gyro = doc.createNestedObject("gyroscope");
  gyro["x"] = round(gx_ds * 10) / 10.0;
  gyro["y"] = round(gy_ds * 10) / 10.0;
  gyro["z"] = round(gz_ds * 10) / 10.0;

  JsonObject vibration = doc.createNestedObject("vibration");
  vibration["detected"] = vibDetected;
  vibration["intensity"] = vibIntensity;

  doc["crack_detected"] = digitalRead(CRACK_PIN) == HIGH;
  doc["data_source"] = "live_hardware";

  String jsonString;
  serializeJson(doc, jsonString);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(jsonString);
    http.end();
  }
}

void loop() {
  sendFloorReading(1, 0, VIB_PIN_F1);
  delay(100);
  sendFloorReading(2, 1, VIB_PIN_F2);
  delay(1400); // Send data every 1.5 seconds
}
```

---

## 5. Machine Learning Model Integration Guide

### Step 1: Place Model Files
Save your trained model file (`model.pkl`, `saved_model.joblib`, `model.onnx`, or PyTorch `.pt`) inside the `backend/` directory:
```
backend/
├── model.pkl            <-- Place model weights here
├── ml_service.py
└── app.py
```

### Step 2: Update `backend/ml_service.py`
Open [`backend/ml_service.py`](file:///C:/Users/saila/.gemini/antigravity/scratch/structural-health-monitoring/backend/ml_service.py):

1. Change `MODEL_STATUS = "not_integrated"` to `MODEL_STATUS = "active"`.
2. Implement model loading in `load_ml_model()`:
   ```python
   import joblib, os
   def load_ml_model():
       global _LOADED_MODEL
       model_path = os.path.join(os.path.dirname(__file__), "model.pkl")
       if os.path.exists(model_path):
           _LOADED_MODEL = joblib.load(model_path)
           return True
       return False
   ```
3. Connect inference in `predict_structural_risk(...)`:
   ```python
   # Extract features from latest_f1 and latest_f2
   features = [
       latest_f1["tilt"]["magnitude"],
       latest_f1["vibration"]["intensity"],
       latest_f2["tilt"]["magnitude"],
       latest_f2["vibration"]["intensity"]
   ]
   pred_risk_score = float(_LOADED_MODEL.predict_proba([features])[0][1])
   ```
4. Return the standard output dictionary:
   ```python
   return {
       "model_status": "active",
       "is_ml_prediction": True,
       "method": "random_forest_classifier", # or "neural_network"
       "overall_risk_level": "High" if pred_risk_score > 0.65 else ("Medium" if pred_risk_score > 0.35 else "Low"),
       "overall_score": round(pred_risk_score, 2),
       "floor_risks": { ... }
   }
   ```

---

## 6. Setup and Installation

### Prerequisites
* Python 3.10+
* Node.js v18+ and npm

### 1. Start the Flask Backend
```bash
cd backend

# (Optional) Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Start backend server
python app.py
```
* The backend will start on **`http://localhost:5000`**.
* The server automatically runs in **Demo Simulation Mode** if no ESP32 hardware is sending data, providing live simulated telemetry and shock responses.

### 2. Start the React + Vite Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
* Open your browser at **`http://localhost:5173`**.

---

## 7. REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check, uptime, ML model status, and operating mode (`demo` or `live`). |
| `/api/readings` | `GET` | Latest telemetry readings for Floor 1 and Floor 2. |
| `/api/readings` | `POST` | Ingestion endpoint for ESP32. Accepts single reading or batch array. |
| `/api/history` | `GET` | Historical sequential telemetry. Supports query parameters `limit` and `floor_id`. |
| `/api/risk` | `GET` | Structural risk assessment computed via `ml_service.py`. |
| `/api/alerts` | `GET` | Anomaly alert incident list. Supports filtering by `severity` and `floor_id`. |
| `/api/system-status`| `GET` | ESP32 heartbeat, PCA9548A multiplexer channel health, and backend stats. |
| `/api/demo/trigger-shock` | `POST` | Simulates an earthquake shock impulse on the miniature building. |
| `/api/demo/toggle` | `POST` | Toggles demo data simulation generator on or off. |

---

## 8. Automated Testing

To run the backend test suite:
```bash
cd backend
python test_backend.py
```

To verify the frontend production build:
```bash
cd frontend
npm run build
```

/**
 * API client module for Structural Health Monitoring System
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export const api = {
  getBaseUrl() {
    return API_BASE_URL;
  },

  async getHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      return await handleResponse(res);
    } catch (err) {
      console.warn("API health check failed:", err.message);
      return { status: "offline", error: err.message };
    }
  },

  async getReadings() {
    const res = await fetch(`${API_BASE_URL}/api/readings`);
    return await handleResponse(res);
  },

  async getRisk() {
    const res = await fetch(`${API_BASE_URL}/api/risk`);
    return await handleResponse(res);
  },

  async getHistory(limit = 60, floorId = null) {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (floorId !== null && floorId !== undefined && floorId !== "all") {
      params.append("floor_id", floorId.toString());
    }
    const res = await fetch(`${API_BASE_URL}/api/history?${params.toString()}`);
    return await handleResponse(res);
  },

  async getAlerts(severity = null, floorId = null) {
    const params = new URLSearchParams();
    if (severity && severity !== "all") params.append("severity", severity);
    if (floorId && floorId !== "all") params.append("floor_id", floorId.toString());
    const res = await fetch(`${API_BASE_URL}/api/alerts?${params.toString()}`);
    return await handleResponse(res);
  },

  async getSystemStatus() {
    const res = await fetch(`${API_BASE_URL}/api/system-status`);
    return await handleResponse(res);
  },

  async sendReading(readingPayload) {
    const res = await fetch(`${API_BASE_URL}/api/readings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(readingPayload)
    });
    return await handleResponse(res);
  },

  async triggerShock(intensity = 0.85) {
    const res = await fetch(`${API_BASE_URL}/api/demo/trigger-shock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intensity })
    });
    return await handleResponse(res);
  },

  async toggleDemo() {
    const res = await fetch(`${API_BASE_URL}/api/demo/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return await handleResponse(res);
  }
};

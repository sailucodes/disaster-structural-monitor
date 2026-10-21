import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/layout/Navbar';
import PrototypeBanner from './components/layout/PrototypeBanner';
import Dashboard from './pages/Dashboard';
import FloorMonitoring from './pages/FloorMonitoring';
import Analytics from './pages/Analytics';
import AlertsHistory from './pages/AlertsHistory';
import SystemStatus from './pages/SystemStatus';
import { api } from './api/client';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [historyLimit, setHistoryLimit] = useState(60);

  // Telemetry States
  const [latestReadings, setLatestReadings] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  // Connection & UI states
  const [backendOnline, setBackendOnline] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isShocking, setIsShocking] = useState(false);
  const pollTimerRef = useRef(null);

  // Fetch all live data from backend
  const fetchTelemetry = useCallback(async () => {
    try {
      const [readingsRes, riskRes, statusRes, alertsRes, histRes] = await Promise.all([
        api.getReadings().catch(() => null),
        api.getRisk().catch(() => null),
        api.getSystemStatus().catch(() => null),
        api.getAlerts().catch(() => ({ alerts: [] })),
        api.getHistory(historyLimit).catch(() => ({ readings: [] }))
      ]);

      if (readingsRes && riskRes) {
        setLatestReadings(readingsRes);
        setRiskData(riskRes);
        setSystemStatus(statusRes);
        setAlerts(alertsRes?.alerts || []);
        setHistoryData(histRes?.readings || []);
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }
    } catch (err) {
      console.warn("Telemetry polling failed:", err);
      setBackendOnline(false);
    } finally {
      setInitialLoading(false);
    }
  }, [historyLimit]);

  // Polling loop (every 1.5s for real-time feel)
  useEffect(() => {
    fetchTelemetry();
    pollTimerRef.current = setInterval(fetchTelemetry, 1500);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchTelemetry]);

  // Handle Shock Simulation trigger
  const handleTriggerShock = async (intensity = 0.85) => {
    setIsShocking(true);
    try {
      await api.triggerShock(intensity);
      await fetchTelemetry();
    } catch (err) {
      console.error("Failed to trigger shock:", err);
    } finally {
      setTimeout(() => setIsShocking(false), 3000);
    }
  };

  // Handle Demo Mode toggle
  const handleToggleDemo = async () => {
    try {
      await api.toggleDemo();
      await fetchTelemetry();
    } catch (err) {
      console.error("Failed to toggle demo:", err);
    }
  };

  const handleNavigateToFloor = (floorNum) => {
    setSelectedFloor(floorNum);
    setActiveTab('floors');
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Top Prototype Disclaimer */}
      <PrototypeBanner />

      {/* Main Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        systemStatus={systemStatus}
        backendOnline={backendOnline}
      />

      {/* Offline Alert Banner */}
      {!backendOnline && !initialLoading && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 px-4 py-2 text-rose-200 text-xs font-mono flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Backend server unreachable at <code className="text-white">{api.getBaseUrl()}</code>. Ensure Flask backend is running on port 5000.</span>
            </span>
            <button 
              onClick={fetchTelemetry}
              className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded border border-rose-500/40 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Page Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {initialLoading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-sm">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span>Connecting to Structural Health Telemetry Bus...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                latestReadings={latestReadings}
                riskData={riskData}
                systemStatus={systemStatus}
                backendOnline={backendOnline}
                onNavigateToFloor={handleNavigateToFloor}
                onTriggerShock={handleTriggerShock}
                onRefresh={fetchTelemetry}
                isShocking={isShocking}
              />
            )}

            {activeTab === 'floors' && (
              <FloorMonitoring
                latestReadings={latestReadings}
                riskData={riskData}
                selectedFloor={selectedFloor}
                setSelectedFloor={setSelectedFloor}
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics
                historyData={historyData}
                onRefresh={fetchTelemetry}
                historyLimit={historyLimit}
                setHistoryLimit={setHistoryLimit}
              />
            )}

            {activeTab === 'alerts' && (
              <AlertsHistory
                alerts={alerts}
              />
            )}

            {activeTab === 'status' && (
              <SystemStatus
                systemStatus={systemStatus}
                backendOnline={backendOnline}
                onRefresh={fetchTelemetry}
                onToggleDemo={handleToggleDemo}
              />
            )}
          </>
        )}
      </main>

      {/* Subtle Engineering Footer */}
      <footer className="border-t border-navy-800/80 bg-navy-900/40 py-4 px-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AI-Based Post-Disaster Structural Health Monitoring System • College Prototype</span>
          <span>Dual MPU6050 (PCA9548A MUX 0x70) + Vibration Modules • REST API :5000</span>
        </div>
      </footer>
    </div>
  );
}

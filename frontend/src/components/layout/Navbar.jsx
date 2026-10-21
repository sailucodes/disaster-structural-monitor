import React from 'react';
import { 
  Building2, 
  Activity, 
  LineChart, 
  AlertCircle, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Brain,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, systemStatus, backendOnline }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'floors', label: 'Floor Monitoring', icon: Building2 },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'alerts', label: 'Alerts & History', icon: AlertCircle },
    { id: 'status', label: 'System Status', icon: Cpu },
  ];

  const isLive = systemStatus?.esp32_connection?.is_connected;
  const isDemo = systemStatus?.backend?.mode === 'demo';

  return (
    <header className="bg-navy-900 border-b border-navy-700/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-slate-100 tracking-tight leading-snug">
                AI-Based Post-Disaster Structural Health Monitoring
              </h1>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                ESP32 • Dual MPU6050 (PCA9548A MUX) • Vibration Sensors
              </p>
            </div>
          </div>

          {/* System Indicators (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Backend Connectivity */}
            <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 border ${
              backendOnline 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              {backendOnline ? 'API Connected' : 'API Offline'}
            </div>

            {/* Hardware / Data Mode */}
            <div className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 border ${
              isLive
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}>
              {isLive ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isLive ? 'ESP32 Live' : 'Demo Simulated'}
            </div>

            {/* ML Model Status */}
            <div className="px-2.5 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 bg-slate-800 text-slate-300 border border-slate-700">
              <Brain className="w-3.5 h-3.5 text-amber-400" />
              <span>ML: Not Integrated Yet</span>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:flex space-x-1 border-t border-navy-800/80 pt-1 pb-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-navy-800 space-y-2">
            <div className="flex flex-wrap gap-2 pb-2 border-b border-navy-800 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded-full ${backendOnline ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {backendOnline ? '● API Online' : '○ API Offline'}
              </span>
              <span className={`px-2 py-0.5 rounded-full ${isLive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'}`}>
                {isLive ? '● Live ESP32' : '○ Demo Data'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                ML: Not Integrated
              </span>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-500/20 text-sky-400 font-semibold border border-sky-500/30'
                        : 'text-slate-300 hover:bg-navy-800'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-sky-400" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </header>
  );
}

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Activity, ShieldAlert, Cpu, Sun, Moon } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useTheme } from '../context/ThemeContext';

const Header = ({ user }) => {
  const location = useLocation();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [activeReqId, setActiveReqId] = useState('IDLE');
  const { theme, toggleTheme } = useTheme() || { theme: 'dark', toggleTheme: () => {} };

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format page titles nicely based on paths
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Enterprise Intelligence';
    if (path.includes('employees')) return 'Talent Resource Matrix';
    if (path.includes('branches')) return 'Global Branch Network';
    if (path.includes('ai-insights')) return 'Explainable AI Predictions (SHAP)';
    if (path.includes('prediction-history')) return 'AI Decision History Tracking';
    if (path.includes('approvals')) return 'Human-in-the-Loop Queue';
    if (path.includes('courses')) return 'Continuous Learning Center';
    if (path.includes('pip')) return 'PIP Accountability Center';
    if (path.includes('audit-logs')) return 'Immutable Security Audit logs';
    if (path.includes('settings')) return 'Algorithmic Guardrails (Bias/Ethics)';
    return 'AlphaMatrix Intelligence';
  };

  // Listen to custom correlation event (for frontend demo tracing!)
  useEffect(() => {
    const handleTrace = (e) => {
      if (e.detail?.requestId) {
        setActiveReqId(e.detail.requestId);
      }
    };
    window.addEventListener('api-trace', handleTrace);
    return () => window.removeEventListener('api-trace', handleTrace);
  }, []);

  return (
    <header className="h-16 glass-panel border-b border-slate-800 flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-10">
      {/* Title section */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-wide font-sans m-0 p-0">
          {getPageTitle()}
        </h2>
      </div>

      {/* Action controls & Diagnostics */}
      <div className="flex items-center gap-6">
        {/* Diagnostic correlation trace panel */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[10px] text-purple-300">
          <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>TRACE KEY:</span>
          <span className="text-slate-400 select-all max-w-[120px] truncate">{activeReqId}</span>
        </div>

        {/* Ethical state guard */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 font-mono text-[10px] text-purple-300">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>ETHICAL FIREWALL:</span>
          <span className="text-purple-400 font-bold">ACTIVE</span>
        </div>

        {/* Real-time system clocks */}
        <div className="hidden sm:block text-xs font-mono text-slate-400 tracking-wider">
          {time}
        </div>

        {/* Notification Bell */}
        <NotificationBell />

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800/40 transition-colors"
          title="Toggle UI Theme"
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

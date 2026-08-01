import React, { useState, useRef, useEffect } from 'react';
import { Bell, UserPlus, ShieldAlert, CheckSquare, Trash2, Check } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, markAllAsRead, clearNotifications } = useSocket();
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotiIcon = (type) => {
    switch (type) {
      case 'NEW_EMPLOYEE':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      case 'HIGH_RISK_AI':
        return <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />;
      case 'APPROVAL_ACTION':
        return <CheckSquare className="w-4 h-4 text-violet-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNotiContent = (n) => {
    const { type, data } = n;
    switch (type) {
      case 'NEW_EMPLOYEE':
        return (
          <div>
            <p className="text-xs text-white font-semibold">New Talent Onboarded</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              <span className="text-purple-400 font-medium">{data.name}</span> joined as {data.position} ({data.department})
            </p>
          </div>
        );
      case 'HIGH_RISK_AI':
        return (
          <div>
            <p className="text-xs text-rose-400 font-bold">High Risk Prediction Alert</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              AI predicted Attrition Risk <span className="text-rose-400 font-semibold">{data.score}%</span> for {data.employeeName}
            </p>
          </div>
        );
      case 'APPROVAL_ACTION':
        return (
          <div>
            <p className="text-xs text-white font-semibold">HIP Queue Decided</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Decision for {data.employeeName} has been <span className={data.status === 'APPROVED' ? 'text-purple-400 font-semibold' : 'text-rose-400 font-semibold'}>{data.status}</span>
            </p>
          </div>
        );
      default:
        return (
          <div>
            <p className="text-xs text-white font-semibold">System Notification</p>
            <p className="text-[11px] text-slate-400 mt-0.5">System action triggered successfully.</p>
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          markAllAsRead();
        }}
        className="relative p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:bg-slate-800/40 transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-rose-600 rounded-full border border-darkBg animate-bounce shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 glass-panel border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
              <span className="text-xs font-bold text-white">System Alerts</span>
              {notifications.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearNotifications}
                    className="p-1 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Clear All"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3.5 hover:bg-slate-800/20 transition-colors ${
                      !n.read ? 'bg-purple-950/10' : ''
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center shadow-inner">
                      {getNotiIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0 pr-1">
                      {getNotiContent(n)}
                      <span className="text-[9px] text-slate-500 font-mono block mt-1">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 font-mono text-[10px]">
                  NO ACTIVE SYSTEM NOTIFICATIONS
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;

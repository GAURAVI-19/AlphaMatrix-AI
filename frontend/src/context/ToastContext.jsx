import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Set up global event listener so socket/API errors can trigger toasts easily
  useEffect(() => {
    const handleToastEvent = (e) => {
      const { type, data } = e.detail || {};
      let msg = 'System Alert Received';
      let toastType = 'info';

      if (type === 'NEW_EMPLOYEE') {
        msg = `👤 New employee created: ${data.name} (${data.position} - ${data.department})`;
        toastType = 'success';
      } else if (type === 'HIGH_RISK_AI') {
        msg = `🚨 CRITICAL RISK: High attrition risk detected for ${data.employeeName} (${data.score}% - ${data.riskLevel})`;
        toastType = 'error';
      } else if (type === 'APPROVAL_ACTION') {
        msg = `✍️ HIP Queue Action: Prediction for ${data.employeeName} was ${data.status} (${data.type})`;
        toastType = data.status === 'APPROVED' ? 'success' : 'warning';
      } else if (e.detail?.message) {
        msg = e.detail.message;
        toastType = e.detail.type || 'info';
      }

      showToast(msg, toastType);
    };

    window.addEventListener('app-toast', handleToastEvent);
    return () => window.removeEventListener('app-toast', handleToastEvent);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            let Icon = Info;
            let bgClass = 'bg-slate-900/90 border-slate-800 text-slate-100';
            let iconClass = 'text-blue-400';

            if (toast.type === 'success') {
              Icon = CheckCircle;
              bgClass = 'bg-purple-950/90 border-purple-900/60 text-purple-100';
              iconClass = 'text-purple-400';
            } else if (toast.type === 'warning') {
              Icon = AlertTriangle;
              bgClass = 'bg-amber-950/90 border-amber-900/60 text-amber-100';
              iconClass = 'text-amber-400';
            } else if (toast.type === 'error') {
              Icon = AlertCircle;
              bgClass = 'bg-red-950/90 border-red-900/60 text-red-100';
              iconClass = 'text-red-400';
            }

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 55, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className={`flex items-center gap-3.5 p-4.5 rounded-2xl border shadow-2xl pointer-events-auto backdrop-blur-md ${bgClass}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${iconClass}`} />
                <p className="text-xs font-semibold flex-1 leading-relaxed">{toast.message}</p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 hover:bg-slate-800/60 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-200" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

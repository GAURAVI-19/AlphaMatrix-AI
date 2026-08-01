import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

const ChartCard = ({ title, subtitle, children, infoTip }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 rounded-2xl glass-card border border-slate-800 flex flex-col h-[380px] shadow-glass relative hover:border-slate-800/80 transition-colors"
    >
      {/* Header title block */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide font-sans m-0">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-1">
              {subtitle}
            </p>
          )}
        </div>
        
        {infoTip && (
          <div className="relative group cursor-help">
            <HelpCircle className="w-4 h-4 text-slate-500 hover:text-slate-300 transition-colors" />
            <div className="absolute right-0 top-6 w-48 p-2 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] text-slate-400 leading-normal opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 shadow-lg">
              {infoTip}
            </div>
          </div>
        )}
      </div>

      {/* Chart container slot */}
      <div className="flex-1 w-full min-h-0 relative">
        {children}
      </div>
    </motion.div>
  );
};

export default React.memo(ChartCard);

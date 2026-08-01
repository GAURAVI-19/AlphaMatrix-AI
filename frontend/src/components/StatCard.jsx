import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, trend, colorClass = 'text-purple-400', glowClass = 'glow-purple' }) => {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between hover:border-slate-700/60 transition-colors"
    >
      <div>
        <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase mb-1.5">
          {label}
        </span>
        <span className="text-2xl font-bold text-white tracking-tight leading-none">{value}</span>
        
        {trend && (
          <div className="flex items-center gap-1 mt-2.5">
            <span className={`text-[10px] font-semibold font-mono ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? '▲' : '▼'} {trend.value}
            </span>
            <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">vs last month</span>
          </div>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-900/60 border border-slate-800/80 shadow-md ${colorClass} ${glowClass}`}>
        <Icon className="w-5.5 h-5.5" />
      </div>
    </motion.div>
  );
};

export default React.memo(StatCard);

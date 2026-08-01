import React from 'react';
import { ShieldAlert, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const RiskAlert = ({ score, confidence, riskLevel, ethicalCheck = {} }) => {
  const isHighRisk = score >= 70 || riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Primary Risk Threshold Alert */}
      {isHighRisk ? (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/80 to-red-900/40 border border-red-500/30 flex gap-3 shadow-md shadow-red-950/20 relative overflow-hidden animate-pulse">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="relative z-10">
            <h4 className="text-xs font-bold text-red-200 uppercase tracking-wider font-mono">
              ⚠ High-Risk Decision Threshold Exceeded
            </h4>
            <p className="text-[10px] text-red-300/95 mt-1.5 leading-relaxed">
              Exit risk metrics exceed the configured corporate firewall guardrails (70%). An automated audit log has been issued and human-in-the-loop validation is MANDATORY before operational actions.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-purple-950/15 border border-purple-900/40 flex gap-3 shadow-md">
          <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              ✓ Optimal Operational Bounds
            </h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Predicted values reside comfortably inside risk safety envelopes. Automated processing is authorized under default branch permissions.
            </p>
          </div>
        </div>
      )}

      {/* Ethical Firewall Details Card */}
      <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">
            Ethical Guardrails Status
          </span>
          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
            ethicalCheck.passed !== false 
              ? 'bg-purple-950/40 text-purple-400 border border-purple-800/40' 
              : 'bg-red-950/40 text-red-400 border border-red-800/40'
          }`}>
            {ethicalCheck.passed !== false ? 'Passed' : 'Bias Flagged'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900">
            <span className="text-[9px] text-slate-500 font-mono block mb-1">BIAS DETECTION</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ethicalCheck.biasDetected ? 'bg-red-500' : 'bg-green-500'}`}></span>
              <span className="text-xs font-semibold text-white">
                {ethicalCheck.biasDetected ? 'Demographic Disparity' : 'Zero Bias Detected'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900">
            <span className="text-[9px] text-slate-500 font-mono block mb-1">SAFETY METRIC CONFIDENCE</span>
            <span className="text-xs font-semibold text-white tracking-wider">
              {Math.round(confidence * 100)}% Match
            </span>
          </div>
        </div>

        {ethicalCheck.biasDetected && (
          <div className="p-3 rounded-lg bg-yellow-950/10 border border-yellow-900/30 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-[9px] text-yellow-400/90 leading-normal">
              Variance detected across comparative group sizes exceeds acceptable boundaries. Manual review recommended.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RiskAlert;

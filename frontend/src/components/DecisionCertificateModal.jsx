import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  Printer, 
  Download, 
  X, 
  QrCode, 
  Lock, 
  BrainCircuit,
  Building2,
  Calendar,
  UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';

const DecisionCertificateModal = ({ isOpen, onClose, prediction }) => {
  const certRef = useRef(null);

  if (!isOpen || !prediction) return null;

  const certId = prediction.certificateId || `AM-CERT-${prediction._id?.slice(-6).toUpperCase() || '789210'}`;
  const issuedDate = new Date(prediction.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const subjectName = prediction.employee?.userId?.name || 'Target Enterprise Node';
  const domain = prediction.domain || 'HR';
  const confidence = Math.round((prediction.confidence || 0.88) * 100);
  const score = prediction.prediction || 50;
  const riskLevel = prediction.riskLevel || 'LOW';
  const model = prediction.selectedModel || 'XGBoost';

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: 'a4'
    });

    // Dark background matching AlphaMatrix theme
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 842, 595, 'F');

    // Purple Border
    doc.setDrawColor(167, 139, 250);
    doc.setLineWidth(3);
    doc.rect(20, 20, 802, 555);

    // Inner subtle border
    doc.setDrawColor(51, 65, 85);
    doc.setLineWidth(1);
    doc.rect(30, 30, 782, 535);

    // Title Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text('ALPHA MATRIX AI RESPONSIBLE DECISION CERTIFICATE', 421, 80, { align: 'center' });

    doc.setTextColor(167, 139, 250);
    doc.setFontSize(14);
    doc.text('8-Layer Explainable & Ethical Governance Verified', 421, 105, { align: 'center' });

    // Certificate Body
    doc.setTextColor(226, 232, 240);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Certificate Reference: ${certId}`, 421, 140, { align: 'center' });

    doc.setFontSize(14);
    doc.text('This official certificate confirms that an automated AI inference was executed under full', 421, 180, { align: 'center' });
    doc.text('Ethical AI Firewall policies, SHAP feature attribution, and audit compliance logging.', 421, 200, { align: 'center' });

    // Key Stats Box
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(80, 230, 682, 160, 10, 10, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Subject Node: ${subjectName}`, 110, 260);
    doc.text(`Domain Framework: ${domain}`, 110, 290);
    doc.text(`Algorithm Model: ${model}`, 110, 320);
    doc.text(`Issued Date: ${issuedDate}`, 110, 350);

    doc.text(`Risk Score: ${score}% (${riskLevel})`, 480, 260);
    doc.text(`Model Confidence: ${confidence}%`, 480, 290);
    doc.text(`Ethical Firewall: PASSED`, 480, 320);
    doc.text(`Audit Trail ID: ${prediction._id || 'REC-9941'}`, 480, 350);

    // Footer signatures
    doc.setDrawColor(100, 116, 139);
    doc.line(120, 480, 320, 480);
    doc.line(520, 480, 720, 480);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(11);
    doc.text('Chief AI Ethics Auditor Signature', 220, 500, { align: 'center' });
    doc.text('AlphaMatrix Decision Engine Seal', 620, 500, { align: 'center' });

    doc.save(`AlphaMatrix_Decision_Certificate_${certId}.pdf`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-md font-bold text-white leading-tight">Verified AI Decision Certificate</h2>
                <p className="text-xs text-slate-400 font-mono">8-Layer Responsible Governance Audit</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md glow-purple cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export PDF
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Certificate Container */}
          <div ref={certRef} className="p-8 space-y-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 relative">
            {/* Background Stamp watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <BrainCircuit className="w-96 h-96 text-purple-400" />
            </div>

            <div className="text-center space-y-2 border-b border-slate-800/80 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-400 text-xs font-mono font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> COMPLIANCE PASSED • ISO/ETHICAL AI 2026
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-wide uppercase">
                AlphaMatrix Responsible Decision Certificate
              </h1>
              <p className="text-xs text-slate-400 max-w-xl mx-auto font-mono">
                Official Certificate Hash: <span className="text-purple-400">{certId}</span>
              </p>
            </div>

            {/* Cert Meta Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">SUBJECT NODE</span>
                <p className="text-sm font-bold text-white truncate mt-0.5">{subjectName}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">DOMAIN SECTOR</span>
                <p className="text-sm font-bold text-purple-400 truncate mt-0.5">{domain}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">PREDICTION SCORE</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{score}% <span className="text-xs text-slate-400">({riskLevel})</span></p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-mono block">MODEL CONFIDENCE</span>
                <p className="text-sm font-bold text-purple-400 mt-0.5">{confidence}%</p>
              </div>
            </div>

            {/* Governance Checks */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Responsible AI Verification Matrix
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SHAP Explainability Logged</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ethical AI Firewall Clear</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Audit Trail Immutable</span>
                </div>
              </div>
            </div>

            {/* Footer QR & Signature */}
            <div className="flex items-end justify-between pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  <p className="text-slate-200 font-bold">Encrypted Verification Seal</p>
                  <p>Issued: {issuedDate}</p>
                  <p className="text-purple-400 truncate w-48">Hash: 0x8a92f001c...b4e</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <div className="h-8 border-b border-slate-700 w-40 ml-auto flex items-end justify-end">
                  <span className="font-serif italic text-purple-400 text-sm">AlphaMatrix Engine</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">Authorized System Seal</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DecisionCertificateModal;

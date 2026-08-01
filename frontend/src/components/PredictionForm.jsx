import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  User, 
  Settings, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  BookOpen, 
  Smile, 
  Activity 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PredictionForm = ({ 
  employees, 
  selectedEmployee, 
  setSelectedEmployee, 
  predictionType, 
  setPredictionType, 
  onSubmit, 
  isSubmitting,
  params = {},
  setParams = {}
}) => {
  const [activeTab, setActiveTab] = useState('core'); // 'core' or 'tuning'

  // Safely unpack parameter properties
  const {
    performanceScore = 75,
    attendance = 95,
    productivity = 80,
    quality = 80,
    teamwork = 80,
    initiative = 80,
    satisfactionScore = 5,
    projectsCompleted = 5,
    skillCount = 3,
    certificationCount = 1,
    courseCount = 2
  } = params;

  const {
    setPerformanceScore = () => {},
    setAttendance = () => {},
    setProductivity = () => {},
    setQuality = () => {},
    setTeamwork = () => {},
    setInitiative = () => {},
    setSatisfactionScore = () => {},
    setProjectsCompleted = () => {},
    setSkillCount = () => {},
    setCertificationCount = () => {},
    setCourseCount = () => {}
  } = setParams;

  return (
    <div className="p-6 rounded-2xl glass-card border border-slate-800 shadow-glass space-y-5">
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
        <div className="w-9 h-9 rounded-xl bg-purple-950/40 border border-purple-900/60 flex items-center justify-center glow-purple">
          <Brain className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">Decision Engine</h3>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">Predictive Parameter Injectors</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Tab Selection Switches */}
        {selectedEmployee && (
          <div className="flex border-b border-slate-800/80 pb-1.5 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('core')}
              className={`flex-1 pb-2 text-[10px] font-mono font-bold tracking-wider text-center border-b-2 transition-all ${
                activeTab === 'core'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              CORE SETTINGS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tuning')}
              className={`flex-1 pb-2 text-[10px] font-mono font-bold tracking-wider text-center border-b-2 transition-all ${
                activeTab === 'tuning'
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              PARAMETER TUNING
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {(!selectedEmployee || activeTab === 'core') ? (
            <motion.div
              key="core"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Employee select */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                  Select Employee Node
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <select
                    required
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="">Choose an active employee...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.userId?.name || 'Jane Doe'} ({emp.employeeId}) — {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prediction Type */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 tracking-wider uppercase mb-1.5 font-mono">
                  Target Analysis Model
                </label>
                <div className="relative">
                  <Settings className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <select
                    value={predictionType}
                    onChange={(e) => setPredictionType(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/50 border border-slate-800 text-white text-xs focus:border-purple-500 focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="ATTRITION">Cognitive Attrition & Exit Risk</option>
                    <option value="PROMOTION">Corporate Advancement / Promotion</option>
                    <option value="PERFORMANCE">Continuous Performance Forecast</option>
                  </select>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tuning"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              {/* Group 1: Quantitative Outputs */}
              <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/30 border border-slate-900/60">
                <span className="text-[8px] font-mono text-purple-400 font-bold uppercase tracking-wider block mb-1">
                  1. Quantitative Metrics
                </span>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Performance Score</span>
                    <span className="text-purple-400 font-bold">{performanceScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={performanceScore}
                    onChange={(e) => setPerformanceScore(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Attendance rate</span>
                    <span className="text-purple-400 font-bold">{attendance}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Productivity index</span>
                    <span className="text-purple-400 font-bold">{productivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={productivity}
                    onChange={(e) => setProductivity(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Output Quality</span>
                    <span className="text-purple-400 font-bold">{quality}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              {/* Group 2: Behavioral Synergy */}
              <div className="space-y-3.5 p-4 rounded-xl bg-slate-950/30 border border-slate-900/60">
                <span className="text-[8px] font-mono text-purple-400 font-bold uppercase tracking-wider block mb-1">
                  2. Behavioral Indices
                </span>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Satisfaction index</span>
                    <span className="text-purple-400 font-bold">{satisfactionScore}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={satisfactionScore}
                    onChange={(e) => setSatisfactionScore(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Teamwork Synergy</span>
                    <span className="text-purple-400 font-bold">{teamwork}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={teamwork}
                    onChange={(e) => setTeamwork(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>Initiative Score</span>
                    <span className="text-purple-400 font-bold">{initiative}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={initiative}
                    onChange={(e) => setInitiative(Number(e.target.value))}
                    className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>

              {/* Group 3: Structural Footprints */}
              <div className="space-y-3 p-4 rounded-xl bg-slate-950/30 border border-slate-900/60 font-mono">
                <span className="text-[8px] font-mono text-purple-400 font-bold uppercase tracking-wider block mb-1">
                  3. Operational Footprint
                </span>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Completed Projects</span>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={projectsCompleted}
                    onChange={(e) => setProjectsCompleted(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-[10px] text-center focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Total Skills Count</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={skillCount}
                    onChange={(e) => setSkillCount(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-[10px] text-center focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Certifications count</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={certificationCount}
                    onChange={(e) => setCertificationCount(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-[10px] text-center focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>LMS Course Count</span>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={courseCount}
                    onChange={(e) => setCourseCount(Number(e.target.value))}
                    className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-white font-mono text-[10px] text-center focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={isSubmitting || !selectedEmployee}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-xs transition-all duration-200 shadow-lg glow-purple flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-white animate-spin"></div>
              <span>COMPUTING EXPLAINABLE GRADIENTS...</span>
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Prediction Insight</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PredictionForm;

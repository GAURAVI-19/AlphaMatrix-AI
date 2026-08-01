import React from 'react';
import { 
  Users, 
  GraduationCap, 
  Stethoscope, 
  Landmark, 
  Factory, 
  Building, 
  ShieldCheck, 
  Crosshair 
} from 'lucide-react';

export const DOMAINS = [
  { id: 'HR', name: 'Human Resources', subtitle: 'Employee Attrition & Performance', icon: Users, color: 'from-blue-600 to-indigo-600' },
  { id: 'UNIVERSITIES', name: 'Higher Education', subtitle: 'Student Academic Retention', icon: GraduationCap, color: 'from-violet-600 to-purple-600' },
  { id: 'HOSPITALS', name: 'Clinical Healthcare', subtitle: 'Patient Readmission & Triage', icon: Stethoscope, color: 'from-rose-600 to-pink-600' },
  { id: 'BANKING', name: 'Banking & Finance', subtitle: 'Credit Default & Fraud Intelligence', icon: Landmark, color: 'from-purple-600 to-indigo-600' },
  { id: 'MANUFACTURING', name: 'Smart Industry', subtitle: 'Predictive Equipment Maintenance', icon: Factory, color: 'from-amber-600 to-orange-600' },
  { id: 'GOVERNMENT', name: 'Public Sector', subtitle: 'Welfare & Resource Allocation', icon: Building, color: 'from-violet-600 to-blue-600' },
  { id: 'INSURANCE', name: 'Insurance SaaS', subtitle: 'Claims Risk & Fraud Detection', icon: ShieldCheck, color: 'from-purple-600 to-violet-600' },
  { id: 'DEFENSE', name: 'Defense & Security', subtitle: 'Personnel & System Readiness', icon: Crosshair, color: 'from-slate-700 to-slate-900' }
];

const DomainSelector = ({ activeDomain = 'HR', onSelectDomain }) => {
  return (
    <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            Universal Enterprise AI Domain Target
          </h3>
          <p className="text-[11px] text-slate-400">
            AlphaMatrix core backend routes and explainability layers dynamically adapt across enterprise sectors.
          </p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-purple-400 font-semibold">
          Active: {DOMAINS.find(d => d.id === activeDomain)?.name}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {DOMAINS.map((domain) => {
          const Icon = domain.icon;
          const isActive = activeDomain === domain.id;

          return (
            <button
              key={domain.id}
              onClick={() => onSelectDomain(domain.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between h-24 ${
                isActive 
                  ? 'bg-purple-950/50 border-purple-500 text-white shadow-md glow-purple'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>}
              </div>
              <div>
                <p className={`text-xs font-bold truncate ${isActive ? 'text-purple-300' : 'text-slate-300'}`}>
                  {domain.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono">
                  {domain.id}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DomainSelector;

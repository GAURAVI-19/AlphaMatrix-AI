import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BrainCircuit, 
  CheckSquare, 
  History, 
  GraduationCap, 
  TrendingDown, 
  Sliders,
  LogOut,
  Clock,
  Cpu,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ user, handleLogout }) => {
  const location = useLocation();
  const role = user?.role || 'EMPLOYEE';

  // Navigation schema based on role access
  const allNavigation = [
    {
      name: 'Executive Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE']
    },
    {
      name: 'Prediction Engine',
      path: '/predictions',
      icon: Cpu,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER']
    },
    {
      name: 'Explainability XAI',
      path: '/explainability',
      icon: BrainCircuit,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER']
    },
    {
      name: 'Ethical Firewall',
      path: '/ethics',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER']
    },
    {
      name: 'Human Approvals',
      path: '/approvals',
      icon: CheckSquare,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE']
    },
    {
      name: 'AI Analytics',
      path: '/analytics',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER']
    },
    {
      name: 'Security Audit Logs',
      path: '/audit-logs',
      icon: History,
      roles: ['SUPER_ADMIN']
    },
    {
      name: 'AI Configuration',
      path: '/settings',
      icon: Sliders,
      roles: ['SUPER_ADMIN']
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: Users,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER']
    },
    {
      name: 'Branches',
      path: '/branches',
      icon: Building2,
      roles: ['SUPER_ADMIN']
    },
    {
      name: 'AI Prediction History',
      path: '/prediction-history',
      icon: Clock,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER']
    },
    {
      name: 'LMS Courses',
      path: '/courses',
      icon: GraduationCap,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE']
    },
    {
      name: 'PIP Monitoring',
      path: '/pip',
      icon: TrendingDown,
      roles: ['SUPER_ADMIN', 'BRANCH_MANAGER', 'EMPLOYEE']
    }
  ];

  const filteredNavigation = allNavigation.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-lg glow-purple">
          ΑM
        </div>
        <div>
          <h1 className="text-md font-bold tracking-wider text-white m-0 p-0 font-sans leading-none">
            ALPHA<span className="text-purple-400">MATRIX</span>
          </h1>
          <span className="text-[10px] text-slate-500 font-mono tracking-widest block uppercase mt-0.5">
            Enterprise Decision AI
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                isActive 
                  ? 'bg-purple-950/40 text-purple-300 border-l-2 border-purple-500 shadow-sm shadow-purple-950/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`}
            >
              <Icon 
                className={`w-5 h-5 mr-3 transition-transform duration-200 group-hover:scale-105 ${
                  isActive ? 'text-purple-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} 
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Session Actions */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="truncate pr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.name || 'Jane Doe'}</p>
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">{role.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-red-950/30 hover:border-red-900/40 transition-all duration-200 text-xs font-semibold"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out Session
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import DemoMode from './DemoMode';

const Layout = ({ user, handleLogout, children }) => {
  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex overflow-hidden">
      {/* Dynamic Nav Sidebar */}
      <Sidebar user={user} handleLogout={handleLogout} />

      {/* Main Container Area */}
      <div className="flex-1 flex flex-col min-w-0 pl-64">
        {/* Unified diagnostics header */}
        <Header user={user} />

        {/* Scrollable Page Wrapper */}
        <main className="flex-1 overflow-y-auto px-8 pt-24 pb-8 h-screen mt-0">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Floating Stepper Automated Demo Mode Walkthrough */}
      <DemoMode />
    </div>
  );
};

export default Layout;

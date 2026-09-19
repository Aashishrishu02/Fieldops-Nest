'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ProtectedRoute } from '../../lib/auth/protected-route';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string | string[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  requiredPermission,
  requiredRole,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedRoute requiredPermission={requiredPermission} requiredRole={requiredRole}>
      <div className="min-h-screen bg-[#F7F7F5] text-slate-900 flex">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
          <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

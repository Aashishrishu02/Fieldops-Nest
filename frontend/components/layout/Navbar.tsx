'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import { Menu, Search, Bell } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes('/users/create')) return 'Create User';
    if (pathname.includes('/users')) return 'Users';
    if (pathname.includes('/attendance')) return 'Attendance';
    if (pathname.includes('/visits')) return 'Field Visits';
    if (pathname.includes('/roles')) return 'Roles';
    if (pathname.includes('/permissions')) return 'Permissions';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/reset-password')) return 'Security';
    return 'Dashboard';
  };

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-[#E7E7E3] bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
      {/* Left side: Hamburger button + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-400 hidden sm:inline">FieldOps</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-900">{getPageTitle()}</span>
        </div>
      </div>

      {/* Right side: Search, notifications, role badge, user profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-[#F7F7F5] hover:bg-[#F1F1EE] border border-[#E7E7E3] rounded-lg px-2.5 py-1 text-xs text-slate-500 transition cursor-pointer">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 pr-4">Search operations...</span>
          <kbd className="font-mono text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-400">
            ⌘K
          </kbd>
        </div>

        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
        </button>

        <div className="h-4 w-px bg-slate-200 mx-0.5" />

        {/* Role Badge */}
        {user?.role && (
          <Badge
            variant={
              user.role.name === 'SUPERADMIN'
                ? 'danger'
                : user.role.name === 'MANAGER'
                ? 'primary'
                : 'success'
            }
          >
            {user.role.name}
          </Badge>
        )}

        {/* User Avatar */}
        <Link
          href="/profile"
          className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition"
        >
          <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center font-semibold text-xs">
            {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-800 hidden lg:inline">
            {user?.name || user?.email.split('@')[0]}
          </span>
        </Link>
      </div>
    </header>
  );
};

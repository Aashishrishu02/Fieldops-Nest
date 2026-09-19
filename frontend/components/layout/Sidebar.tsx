'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth/auth-context';
import {
  LayoutDashboard,
  Users,
  Shield,
  KeyRound,
  Clock,
  MapPin,
  User,
  LogOut,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  title: string;
  items: {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout, hasPermission } = useAuth();

  const sections: NavSection[] = [
    {
      title: 'MAIN',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          permission: 'DASHBOARD_VIEW',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          name: 'Users',
          href: '/users',
          icon: Users,
          permission: 'USER_VIEW',
        },
        {
          name: 'Attendance',
          href: '/attendance',
          icon: Clock,
          permission: 'ATTENDANCE_VIEW',
        },
        {
          name: 'Field Visits',
          href: '/visits',
          icon: MapPin,
          permission: 'VISIT_VIEW',
        },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        {
          name: 'Roles',
          href: '/roles',
          icon: Shield,
          permission: 'ROLE_VIEW',
        },
        {
          name: 'Permissions',
          href: '/permissions',
          icon: KeyRound,
          permission: 'PERMISSION_VIEW',
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        {
          name: 'Profile',
          href: '/profile',
          icon: User,
        },
      ],
    },
  ];

  const getFilteredSections = () => {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => !item.permission || hasPermission(item.permission),
        ),
      }))
      .filter((section) => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-60 bg-white border-r border-[#E7E7E3] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-[#E7E7E3] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                FieldOps
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                CRM
              </span>
            </div>
          </Link>
        </div>

        {/* Categorized Navigation links */}
        <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {filteredSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider text-slate-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose()}
                    className={cn(
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150',
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 flex-shrink-0',
                        isActive ? 'text-slate-900' : 'text-slate-400',
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User profile & Logout Footer */}
        <div className="p-3 border-t border-[#E7E7E3] bg-[#FAFAF8]">
          <Link
            href="/profile"
            onClick={() => onClose()}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white hover:border-slate-200 border border-transparent transition mb-1"
          >
            <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
              {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {user?.name || user?.email.split('@')[0]}
              </div>
              <div className="text-[10px] text-slate-500 font-medium truncate">
                {user?.role?.name?.toLowerCase().replace(/_/g, ' ')}
              </div>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

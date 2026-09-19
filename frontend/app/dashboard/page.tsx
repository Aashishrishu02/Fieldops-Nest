'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../lib/auth/auth-context';
import { apiClient } from '../../lib/api/client';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckInOutWidget } from '../../components/attendance/CheckInOutWidget';
import { VisitStatusBadge } from '../../components/visits/VisitStatusBadge';
import { formatDate, formatTime } from '../../lib/utils/cn';
import {
  Users,
  UserCheck,
  MapPin,
  Clock,
  PlusCircle,
  ArrowUpRight,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<any>('/dashboard/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const role = user?.role?.name || 'FIELD_EMPLOYEE';
  const userName = user?.name || user?.email?.split('@')[0] || 'Admin';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout requiredPermission="DASHBOARD_VIEW">
      <div className="space-y-6">
        {/* Editorial Greeting Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E7E3]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Here&apos;s what&apos;s happening with your field operations today.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {role === 'SUPERADMIN' && (
              <>
                <Link href="/users/create">
                  <Button variant="secondary" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Create User
                  </Button>
                </Link>
                <Link href="/visits">
                  <Button variant="primary" size="sm" icon={<MapPin className="w-3.5 h-3.5" />}>
                    Dispatch Visit
                  </Button>
                </Link>
              </>
            )}
            {role === 'MANAGER' && (
              <Link href="/visits">
                <Button variant="primary" size="sm" icon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Dispatch Visit
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Compact Metric Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <StatCard
              title="Total Users"
              value={stats.overview?.totalUsers || 0}
              subtitle="Provisioned accounts"
              icon={<Users />}
              trend={{
                value: `${stats.overview?.activeUsers || 0} active`,
                isPositive: true,
              }}
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={stats.overview?.activeUsers || 0}
              subtitle="Verified & operational"
              icon={<UserCheck />}
              trend={{
                value: stats.overview?.totalUsers
                  ? `${Math.round(((stats.overview?.activeUsers || 0) / stats.overview.totalUsers) * 100)}% online`
                  : '100%',
                isPositive: true,
              }}
              color="emerald"
            />
            <StatCard
              title="Today's Attendance"
              value={stats.attendance?.todayTotal || 0}
              subtitle={`${stats.attendance?.todayLate || 0} marked late`}
              icon={<Clock />}
              trend={{
                value: `${stats.attendance?.todayOnTime || 0} on time`,
                isPositive: (stats.attendance?.todayLate || 0) === 0,
              }}
              color="amber"
            />
            <StatCard
              title="Active Visits"
              value={stats.visits?.inProgress || 0}
              subtitle={`${stats.visits?.planned || 0} scheduled`}
              icon={<MapPin />}
              trend={{
                value: `${stats.visits?.completed || 0} completed`,
                isPositive: true,
              }}
              color="purple"
            />
          </div>
        )}

        {/* Middle Grid: Attendance Overview (Left) + Visit Status (Right) */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Attendance Overview */}
            <Card className="p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Attendance Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Today&apos;s operational shift distribution</p>
                </div>
                <Link
                  href="/attendance"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  View logs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Present</span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {stats.attendance?.todayTotal || 0}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Logged in</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">On-Time</span>
                  <div className="text-xl font-bold text-emerald-600 mt-0.5">
                    {stats.attendance?.todayOnTime || 0}
                  </div>
                  <span className="text-[11px] text-slate-500">Punctual</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Late</span>
                  <div className="text-xl font-bold text-amber-600 mt-0.5">
                    {stats.attendance?.todayLate || 0}
                  </div>
                  <span className="text-[11px] text-slate-500">Delay recorded</span>
                </div>
              </div>

              {/* Progress Distribution Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Shift Punctuality</span>
                  <span className="font-medium text-slate-800">
                    {stats.attendance?.todayTotal
                      ? `${Math.round(((stats.attendance?.todayOnTime || 0) / stats.attendance.todayTotal) * 100)}%`
                      : '0%'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: stats.attendance?.todayTotal
                        ? `${((stats.attendance.todayOnTime || 0) / stats.attendance.todayTotal) * 100}%`
                        : '0%',
                    }}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{
                      width: stats.attendance?.todayTotal
                        ? `${((stats.attendance.todayLate || 0) / stats.attendance.todayTotal) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Right: Visit Status */}
            <Card className="p-5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Visit Status</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Dispatched field technician appointments</p>
                </div>
                <Link
                  href="/visits"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  All visits <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Planned</span>
                  <div className="text-lg font-bold text-blue-700 mt-0.5">
                    {stats.visits?.planned || 0}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
                  <div className="text-lg font-bold text-amber-700 mt-0.5">
                    {stats.visits?.inProgress || 0}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
                  <div className="text-lg font-bold text-emerald-700 mt-0.5">
                    {stats.visits?.completed || 0}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Cancelled</span>
                  <div className="text-lg font-bold text-slate-500 mt-0.5">
                    {stats.visits?.cancelled || 0}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Total Dispatches Recorded:</span>
                <span className="font-semibold text-slate-800 font-mono">
                  {stats.visits?.total || 0} visits
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Live Attendance Clock-In Widget for Non-Superadmin or On-Duty Team */}
        <div>
          <CheckInOutWidget onStatusChange={fetchStats} />
        </div>

        {/* Lower Grid: Recent Users & Upcoming Visits */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Users Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Recent Users</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Latest provisioned user accounts</p>
                </div>
                <Link
                  href="/users"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  Manage <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {stats.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.slice(0, 5).map((u: any) => (
                    <div key={u.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {u.name || u.email.split('@')[0]}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Badge
                          variant={u.creationType === 'SYSTEM_GENERATED' ? 'purple' : 'primary'}
                        >
                          {u.creationType === 'SYSTEM_GENERATED' ? 'System' : 'Invited'}
                        </Badge>
                        <Badge variant="secondary">{u.role}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-xs text-slate-400 text-center">No user accounts found</p>
                )}
              </div>
            </Card>

            {/* Upcoming Visits Card */}
            <Card className="p-5">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Upcoming Visits</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Active & upcoming customer visits</p>
                </div>
                <Link
                  href="/visits"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  View calendar <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {stats.recentVisits && stats.recentVisits.length > 0 ? (
                  stats.recentVisits.slice(0, 5).map((v: any) => (
                    <div key={v.id} className="py-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {v.customerName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{v.location}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="truncate">{v.employee?.name || v.employee?.email?.split('@')[0]}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                          {formatDate(v.date)}
                        </span>
                        <VisitStatusBadge status={v.status} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-6 text-xs text-slate-400 text-center">No active visits scheduled</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

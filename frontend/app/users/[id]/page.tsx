'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { apiClient } from '../../../lib/api/client';
import { useAuth } from '../../../lib/auth/auth-context';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { RegenerateCredentialsModal } from '../../../components/users/RegenerateCredentialsModal';
import { VisitStatusBadge } from '../../../components/visits/VisitStatusBadge';
import { formatDate, formatTime } from '../../../lib/utils/cn';
import {
  ArrowLeft,
  Edit2,
  KeyRound,
  Shield,
  Clock,
  MapPin,
  Sparkles,
  Mail,
  User,
} from 'lucide-react';

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [regenerateOpen, setRegenerateOpen] = useState(false);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<any>(`/users/${userId}`);
      setUser(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load user', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchUser();
  }, [userId]);

  if (isLoading) {
    return (
      <DashboardLayout requiredPermission="USER_VIEW">
        <div className="py-24 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading user details...
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout requiredPermission="USER_VIEW">
        <div className="p-8 text-center text-slate-500">User account not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredPermission="USER_VIEW">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E3]">
          <Link
            href="/users"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Users
          </Link>

          <div className="flex items-center gap-2">
            {hasPermission('USER_UPDATE') && user.creationType === 'SYSTEM_GENERATED' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setRegenerateOpen(true)}
                icon={<KeyRound className="w-3.5 h-3.5 text-slate-700" />}
              >
                Regenerate Credentials
              </Button>
            )}

            {hasPermission('USER_UPDATE') && (
              <Link href={`/users/${user.id}/edit`}>
                <Button variant="primary" size="sm" icon={<Edit2 className="w-3.5 h-3.5" />}>
                  Edit User
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Profile Card */}
        <Card className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-xs">
                {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{user.name || 'Unnamed User'}</h1>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role?.name === 'SUPERADMIN' ? 'danger' : 'primary'}>
                    {user.role?.name}
                  </Badge>
                  <Badge variant={user.isActive ? 'success' : 'outline'}>
                    {user.isActive ? 'Active' : 'Deactivated'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="text-slate-400 font-medium">Provisioning Type:</div>
              {user.creationType === 'SYSTEM_GENERATED' ? (
                <Badge variant="purple">System Generated</Badge>
              ) : (
                <Badge variant="primary">Invited User</Badge>
              )}
              <div className="text-slate-400 text-[11px] pt-1">
                Enrolled: {formatDate(user.createdAt)}
              </div>
            </div>
          </div>

          {/* Permissions Grid */}
          <div className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Role Permissions ({user.permissions?.length || 0})
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {user.permissions?.map((p: string) => (
                <span
                  key={p}
                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[11px] font-mono text-slate-700"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Assigned Visits & Recent Attendance Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Assigned Visits */}
          <Card className="p-5">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Assigned Field Visits ({user.assignedVisits?.length || 0})
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {user.assignedVisits && user.assignedVisits.length > 0 ? (
                user.assignedVisits.slice(0, 5).map((v: any) => (
                  <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{v.customerName}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {v.location} &bull; {formatDate(v.date)}
                      </div>
                    </div>
                    <VisitStatusBadge status={v.status} />
                  </div>
                ))
              ) : (
                <p className="py-6 text-xs text-slate-400 text-center">No assigned visits found.</p>
              )}
            </div>
          </Card>

          {/* Recent Attendance */}
          <Card className="p-5">
            <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                Recent Attendance Logs ({user.attendanceRecords?.length || 0})
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {user.attendanceRecords && user.attendanceRecords.length > 0 ? (
                user.attendanceRecords.slice(0, 5).map((a: any) => (
                  <div key={a.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{formatDate(a.date)}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        In: {formatTime(a.checkInTime)} {a.checkOutTime && `| Out: ${formatTime(a.checkOutTime)}`}
                      </div>
                    </div>
                    <Badge variant={a.status === 'PRESENT' ? 'success' : a.status === 'LATE' ? 'warning' : 'secondary'}>
                      {a.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="py-6 text-xs text-slate-400 text-center">No attendance records logged.</p>
              )}
            </div>
          </Card>
        </div>

        {/* Credentials Modal */}
        <RegenerateCredentialsModal
          isOpen={regenerateOpen}
          onClose={() => setRegenerateOpen(false)}
          user={user}
        />
      </div>
    </DashboardLayout>
  );
}

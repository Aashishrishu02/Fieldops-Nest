'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../lib/auth/auth-context';
import { apiClient } from '../../lib/api/client';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { User, Shield, Lock, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isSystemGenerated = user?.creationType === 'SYSTEM_GENERATED';

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSystemGenerated) {
      showToast(
        'System-generated users are not permitted to change passwords. Contact SuperAdmin.',
        'error',
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast(err.message || 'Failed to change password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="pb-2 border-b border-[#E7E7E3]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Profile & Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            View active credentials, role clearance, and password settings.
          </p>
        </div>

        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg font-bold shadow-xs">
              {user?.name ? user.name[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{user?.name || 'FieldOps Operator'}</h2>
                <Badge variant={user?.isActive ? 'success' : 'secondary'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user?.role?.name === 'SUPERADMIN' ? 'danger' : 'primary'}>
                  {user?.role?.name}
                </Badge>
                {user?.creationType === 'SYSTEM_GENERATED' ? (
                  <Badge variant="purple">System Generated Account</Badge>
                ) : (
                  <Badge variant="primary">Invited Account</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Assigned Permissions */}
          <div className="pt-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Authorized Capabilities ({user?.permissions?.length || 0})
              </h3>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {user?.permissions?.map((perm) => (
                <span
                  key={perm}
                  className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[11px] font-mono text-slate-700"
                >
                  {perm}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Security & Password Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Lock className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-semibold text-slate-900">Security & Password</h3>
          </div>

          {isSystemGenerated ? (
            /* Callout for System-Generated Users */
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-amber-900">
                  Password changes are disabled for this account.
                </h4>
                <p className="text-xs text-amber-800 leading-relaxed">
                  This is a system-generated account managed centrally by the SuperAdmin. If you require credentials modification, please contact your operations supervisor.
                </p>
              </div>
            </div>
          ) : (
            /* Normal Password Change Form for Invited Users */
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  type="submit"
                  isLoading={isLoading}
                >
                  Update Password
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

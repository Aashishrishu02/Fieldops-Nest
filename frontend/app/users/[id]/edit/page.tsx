'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import { apiClient } from '../../../../lib/api/client';
import { useToast } from '../../../../components/ui/Toast';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { Card } from '../../../../components/ui/Card';
import { ArrowLeft, Save, Shield } from 'lucide-react';

export default function EditUserPage() {
  const params = useParams();
  const userId = params.id as string;
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, rolesData] = await Promise.all([
          apiClient.get<any>(`/users/${userId}`),
          apiClient.get<any[]>('/roles'),
        ]);

        setName(userData.name || '');
        setEmail(userData.email);
        setRoleId(userData.role?.id || '');
        setIsActive(userData.isActive);
        setRoles(rolesData);
      } catch (err: any) {
        showToast(err.message || 'Failed to load user', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) loadData();
  }, [userId, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiClient.patch(`/users/${userId}`, {
        name: name.trim() || undefined,
        roleId,
        isActive,
      });

      showToast('User updated successfully', 'success');
      router.push(`/users/${userId}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update user', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout requiredPermission="USER_UPDATE">
        <div className="py-24 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading user record...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredPermission="USER_UPDATE">
      <div className="max-w-xl mx-auto space-y-5">
        {/* Header */}
        <div className="pb-2 border-b border-[#E7E7E3]">
          <Link
            href={`/users/${userId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition font-medium mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to User Details
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Edit User Profile
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify profile metadata, assigned operational roles, and account state.
          </p>
        </div>

        {/* Edit Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email (Read-only)"
              type="email"
              value={email}
              disabled
              className="bg-slate-50 text-slate-500 cursor-not-allowed"
            />

            <Input
              label="Full Name"
              placeholder="e.g. Alex Chen"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              label="Assigned Operational Role"
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              required
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.description || 'Role'}
                </option>
              ))}
            </Select>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span>Account Active & Operational (Permit login access)</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Link href={`/users/${userId}`}>
                <Button variant="secondary" size="sm" type="button" disabled={isSaving}>
                  Cancel
                </Button>
              </Link>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                isLoading={isSaving}
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

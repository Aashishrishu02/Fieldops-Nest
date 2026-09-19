'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RegenerateCredentialsModal } from '../../components/users/RegenerateCredentialsModal';
import { formatDate } from '../../lib/utils/cn';
import {
  UserPlus,
  Search,
  KeyRound,
  Eye,
  Edit2,
  Trash2,
  Power,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCreationType, setSelectedCreationType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals state
  const [regenerateUser, setRegenerateUser] = useState<any | null>(null);
  const [toggleUser, setToggleUser] = useState<any | null>(null);
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedRole) params.roleId = selectedRole;
      if (selectedCreationType) params.creationType = selectedCreationType;
      if (selectedStatus) params.isActive = selectedStatus;

      const data = await apiClient.get<any[]>('/users', params);
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await apiClient.get<any[]>('/roles');
      setRoles(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedRole, selectedCreationType, selectedStatus]);

  const handleToggleActive = async () => {
    if (!toggleUser) return;
    setActionLoading(true);
    try {
      const res = await apiClient.patch<any>(`/users/${toggleUser.id}/toggle-active`);
      showToast(res.message, 'success');
      setToggleUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setActionLoading(true);
    try {
      await apiClient.delete(`/users/${deleteUser.id}`);
      showToast('User deleted successfully', 'success');
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout requiredPermission="USER_VIEW">
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E7E3]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Users</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Manage users, roles and access.
            </p>
          </div>

          {hasPermission('USER_CREATE') && (
            <Link href="/users/create">
              <Button variant="primary" size="sm" icon={<UserPlus className="w-3.5 h-3.5" />}>
                Create User
              </Button>
            </Link>
          )}
        </div>

        {/* Toolbar Card */}
        <Card className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">All Roles</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>

            <Select
              value={selectedCreationType}
              onChange={(e) => setSelectedCreationType(e.target.value)}
            >
              <option value="">All Provisioning Types</option>
              <option value="SYSTEM_GENERATED">System Generated</option>
              <option value="INVITED">Invited User</option>
            </Select>

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </Select>
          </div>
        </Card>

        {/* Data Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E7E3] bg-[#FAFAF8] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Creation Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading user records...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 transition-colors duration-150"
                    >
                      {/* User Column */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                          </div>
                          <span className="truncate max-w-[140px] sm:max-w-[200px]">
                            {u.name || 'Unnamed User'}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-slate-600 truncate max-w-[220px]">
                        {u.email}
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            u.role?.name === 'SUPERADMIN'
                              ? 'danger'
                              : u.role?.name === 'MANAGER'
                              ? 'primary'
                              : 'secondary'
                          }
                        >
                          {u.role?.name || 'No Role'}
                        </Badge>
                      </td>

                      {/* Creation Type */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={u.creationType === 'SYSTEM_GENERATED' ? 'purple' : 'primary'}
                        >
                          {u.creationType === 'SYSTEM_GENERATED' ? 'System' : 'Invited'}
                        </Badge>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className={u.isActive ? 'text-slate-700' : 'text-slate-400'}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/users/${u.id}`}>
                            <button
                              title="View details"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </Link>

                          {hasPermission('USER_UPDATE') && (
                            <Link href={`/users/${u.id}/edit`}>
                              <button
                                title="Edit user"
                                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </Link>
                          )}

                          {hasPermission('USER_UPDATE') && u.creationType === 'SYSTEM_GENERATED' && (
                            <button
                              onClick={() => setRegenerateUser(u)}
                              title="Regenerate credentials"
                              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {hasPermission('USER_UPDATE') && (
                            <button
                              onClick={() => setToggleUser(u)}
                              title={u.isActive ? 'Deactivate user' : 'Activate user'}
                              className={`p-1 rounded transition ${
                                u.isActive
                                  ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                                  : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {hasPermission('USER_DELETE') && (
                            <button
                              onClick={() => setDeleteUser(u)}
                              title="Delete user"
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Status Confirmation Modal */}
        <ConfirmDialog
          isOpen={!!toggleUser}
          onClose={() => setToggleUser(null)}
          onConfirm={handleToggleActive}
          title={toggleUser?.isActive ? 'Deactivate User Account' : 'Activate User Account'}
          message={`Are you sure you want to ${
            toggleUser?.isActive ? 'deactivate' : 'activate'
          } ${toggleUser?.email}? Deactivated users are blocked from logging in.`}
          confirmText={toggleUser?.isActive ? 'Deactivate' : 'Activate'}
          variant={toggleUser?.isActive ? 'danger' : 'primary'}
          isLoading={actionLoading}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmDialog
          isOpen={!!deleteUser}
          onClose={() => setDeleteUser(null)}
          onConfirm={handleDeleteUser}
          title="Delete User Permanently"
          message={`Are you sure you want to permanently delete user account ${deleteUser?.email}? This action cannot be undone.`}
          confirmText="Delete User"
          variant="danger"
          isLoading={actionLoading}
        />

        {/* Regenerate Credentials Modal */}
        <RegenerateCredentialsModal
          isOpen={!!regenerateUser}
          onClose={() => setRegenerateUser(null)}
          user={regenerateUser}
        />
      </div>
    </DashboardLayout>
  );
}

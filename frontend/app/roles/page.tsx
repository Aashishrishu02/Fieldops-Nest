'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { RolePermissionsModal } from '../../components/roles/RolePermissionsModal';
import { formatDate } from '../../lib/utils/cn';
import { Shield, PlusCircle, KeyRound, Edit2, Trash2, Users } from 'lucide-react';

export default function RolesPage() {
  const { hasPermission } = useAuth();
  const { showToast } = useToast();

  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit Role Modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Permissions Modal
  const [permRole, setPermRole] = useState<any | null>(null);

  // Delete Dialog
  const [deleteRole, setDeleteRole] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get<any[]>('/roles');
      setRoles(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch roles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDescription('');
    setRoleModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description || '');
    setRoleModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showToast('Role name is required', 'error');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        await apiClient.patch(`/roles/${editingRole.id}`, {
          name: roleName.trim(),
          description: roleDescription.trim() || undefined,
        });
        showToast('Role updated successfully', 'success');
      } else {
        await apiClient.post('/roles', {
          name: roleName.trim(),
          description: roleDescription.trim() || undefined,
        });
        showToast('New role created successfully', 'success');
      }
      setRoleModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      showToast(err.message || 'Failed to save role', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRole) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/roles/${deleteRole.id}`);
      showToast('Role deleted successfully', 'success');
      setDeleteRole(null);
      fetchRoles();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete role', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout requiredPermission="ROLE_VIEW">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E7E3]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Roles</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Role definitions, user counts, and subsystem permissions.
            </p>
          </div>

          {hasPermission('ROLE_CREATE') && (
            <Button
              variant="primary"
              size="sm"
              onClick={openCreateModal}
              icon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              Add Custom Role
            </Button>
          )}
        </div>

        {/* Roles Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E7E3] bg-[#FAFAF8] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Users Assigned</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading system roles...
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No roles defined in the system.
                    </td>
                  </tr>
                ) : (
                  roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      {/* Role Name */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <Badge
                            variant={
                              r.name === 'SUPERADMIN'
                                ? 'danger'
                                : r.name === 'MANAGER'
                                ? 'primary'
                                : 'secondary'
                            }
                          >
                            {r.name}
                          </Badge>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                        {r.description || 'System standard role'}
                      </td>

                      {/* Users Count */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-mono text-slate-700">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {r._count?.users ?? r.users?.length ?? 0}
                        </span>
                      </td>

                      {/* Permissions Count */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {r.permissions?.length || 0} permissions
                        </span>
                      </td>

                      {/* Updated */}
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        {formatDate(r.updatedAt || r.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('PERMISSION_ASSIGN') && (
                            <button
                              onClick={() => setPermRole(r)}
                              title="Edit permissions matrix"
                              className="px-2 py-1 rounded text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium transition flex items-center gap-1"
                            >
                              <KeyRound className="w-3 h-3 text-slate-500" />
                              Permissions
                            </button>
                          )}

                          {hasPermission('ROLE_UPDATE') && r.name !== 'SUPERADMIN' && (
                            <button
                              onClick={() => openEditModal(r)}
                              title="Edit role metadata"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {hasPermission('ROLE_DELETE') &&
                            !['SUPERADMIN', 'MANAGER', 'FIELD_EMPLOYEE'].includes(r.name) && (
                              <button
                                onClick={() => setDeleteRole(r)}
                                title="Delete role"
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

        {/* Role Create / Edit Modal */}
        <Modal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          title={editingRole ? 'Edit Role Details' : 'Create New Role'}
          description="Define the role identifier and functional scope"
          maxWidth="sm"
        >
          <form onSubmit={handleSaveRole} className="space-y-4 mt-2">
            <Input
              label="Role Name *"
              placeholder="e.g. DISPATCH_OPERATOR"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
              helperText="Auto-formatted uppercase identifier"
              required
            />

            <Input
              label="Description (Optional)"
              placeholder="e.g. Field dispatch coordinator"
              value={roleDescription}
              onChange={(e) => setRoleDescription(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setRoleModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
                {editingRole ? 'Update Role' : 'Create Role'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Permissions Modal */}
        <RolePermissionsModal
          isOpen={!!permRole}
          onClose={() => setPermRole(null)}
          role={permRole}
          onSuccess={fetchRoles}
        />

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteRole}
          onClose={() => setDeleteRole(null)}
          onConfirm={handleDeleteRole}
          title="Delete Role"
          message={`Are you sure you want to delete role ${deleteRole?.name}? This action cannot be undone.`}
          confirmText="Delete Role"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}

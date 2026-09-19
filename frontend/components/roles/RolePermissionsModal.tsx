'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { apiClient } from '../../lib/api/client';
import { useToast } from '../ui/Toast';
import { ShieldCheck, CheckSquare, Square } from 'lucide-react';

interface RolePermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: { id: string; name: string; permissions: Array<{ id: string; name: string }> } | null;
  onSuccess: () => void;
}

export const RolePermissionsModal: React.FC<RolePermissionsModalProps> = ({
  isOpen,
  onClose,
  role,
  onSuccess,
}) => {
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, any[]>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && role) {
      setSelectedIds(role.permissions.map((p) => p.id));
      fetchPermissions();
    }
  }, [isOpen, role]);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<any>('/permissions');
      setGroupedPermissions(res.grouped || {});
    } catch (err: any) {
      showToast(err.message || 'Failed to load permissions', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const toggleModule = (modulePerms: any[]) => {
    const moduleIds = modulePerms.map((p) => p.id);
    const allSelected = moduleIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !moduleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...moduleIds])));
    }
  };

  const handleSave = async () => {
    if (!role) return;
    setIsSaving(true);
    try {
      await apiClient.post(`/roles/${role.id}/permissions`, {
        permissionIds: selectedIds,
      });
      showToast(`Permissions updated for role ${role.name}`, 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to update permissions', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!role) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permission Matrix: ${role.name}`}
      description="Configure operational access rights grouped by subsystem"
      maxWidth="2xl"
    >
      {isLoading ? (
        <div className="py-12 text-center text-slate-400">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading permissions catalog...
        </div>
      ) : (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 my-2">
          {Object.entries(groupedPermissions).map(([moduleName, perms]) => {
            const allSelected = perms.every((p) => selectedIds.includes(p.id));

            return (
              <div
                key={moduleName}
                className="bg-slate-50/60 border border-slate-200/90 rounded-xl p-4 transition"
              >
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {moduleName} Module
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      ({perms.filter((p) => selectedIds.includes(p.id)).length}/{perms.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleModule(perms)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {perms.map((perm) => {
                    const isChecked = selectedIds.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer select-none transition ${
                          isChecked
                            ? 'bg-blue-50/60 border-blue-300 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <div className="mt-0.5 text-slate-800 flex-shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-slate-900" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold font-mono text-slate-900">
                            {perm.name}
                          </div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">
                            {perm.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-4">
        <span className="text-xs text-slate-500">
          Total Selected:{' '}
          <strong className="text-slate-900 font-mono">{selectedIds.length}</strong> permissions
        </span>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving}>
            Apply Permissions
          </Button>
        </div>
      </div>
    </Modal>
  );
};

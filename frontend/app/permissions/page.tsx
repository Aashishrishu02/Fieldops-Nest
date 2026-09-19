'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function PermissionsPage() {
  const { showToast } = useToast();
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, any[]>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerms = async () => {
      try {
        const res = await apiClient.get<any>('/permissions');
        setGroupedPermissions(res.grouped || {});
        setTotalCount(res.totalCount || 0);
      } catch (err: any) {
        showToast(err.message || 'Failed to load permissions', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerms();
  }, [showToast]);

  return (
    <DashboardLayout requiredPermission="PERMISSION_VIEW">
      <div className="space-y-5">
        {/* Header */}
        <div className="pb-2 border-b border-[#E7E7E3]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Operational capability catalogue grouped by subsystem ({totalCount} distinct permission nodes).
          </p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-400">
            <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading system permissions...
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
              <Card key={moduleName} className="overflow-hidden">
                <div className="px-4 py-3 bg-[#FAFAF8] border-b border-[#E7E7E3] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      {moduleName} Module
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {perms.length} capabilities
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="py-2.5 px-4 w-1/4">Permission</th>
                        <th className="py-2.5 px-4 w-1/6">Module</th>
                        <th className="py-2.5 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {perms.map((perm) => (
                        <tr key={perm.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">
                            <div className="flex items-center gap-1.5">
                              <KeyRound className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{perm.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-500">
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                              {perm.module}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600">
                            {perm.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

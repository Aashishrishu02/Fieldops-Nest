'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { VisitModal, VisitData } from '../../components/visits/VisitModal';
import { VisitStatusBadge } from '../../components/visits/VisitStatusBadge';
import { formatDate, formatDateTime } from '../../lib/utils/cn';
import {
  MapPin,
  PlusCircle,
  Search,
  Calendar,
  User,
  Edit2,
  Trash2,
  CheckCircle,
  PlayCircle,
  XCircle,
  Clock,
  Navigation,
} from 'lucide-react';

export default function VisitsPage() {
  const { user, hasPermission, hasRole } = useAuth();
  const { showToast } = useToast();

  const [visits, setVisits] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals
  const [visitModalOpen, setVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<VisitData | null>(null);

  // Status transition modal
  const [statusModalVisit, setStatusModalVisit] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Delete dialog
  const [deleteVisit, setDeleteVisit] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSupervisor = hasRole(['SUPERADMIN', 'MANAGER']);

  const fetchVisits = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedEmployee) params.assignedTo = selectedEmployee;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await apiClient.get<any[]>('/visits', params);
      setVisits(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch visits', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await apiClient.get<any[]>('/users');
      setEmployees(data.filter((u) => u.isActive));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisits();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedStatus, selectedEmployee, startDate, endDate]);

  const handleOpenCreate = () => {
    setEditingVisit(null);
    setVisitModalOpen(true);
  };

  const handleOpenEdit = (v: any) => {
    setEditingVisit({
      id: v.id,
      assignedTo: v.assignedTo,
      customerName: v.customerName,
      location: v.location,
      date: v.date,
      purpose: v.purpose,
      status: v.status,
      notes: v.notes,
    });
    setVisitModalOpen(true);
  };

  const handleOpenStatusModal = (v: any) => {
    setStatusModalVisit(v);
    setNewStatus(v.status);
    setStatusNotes('');
  };

  const handleUpdateStatus = async () => {
    if (!statusModalVisit) return;
    setIsUpdatingStatus(true);
    try {
      await apiClient.patch(`/visits/${statusModalVisit.id}/status`, {
        status: newStatus,
        notes: statusNotes.trim() || undefined,
      });
      showToast(`Visit marked as ${newStatus}`, 'success');
      setStatusModalVisit(null);
      fetchVisits();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteVisit = async () => {
    if (!deleteVisit) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/visits/${deleteVisit.id}`);
      showToast('Visit deleted successfully', 'success');
      setDeleteVisit(null);
      fetchVisits();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete visit', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Upcoming visits (planned or in progress)
  const upcomingVisits = visits
    .filter((v) => v.status === 'PLANNED' || v.status === 'IN_PROGRESS')
    .slice(0, 3);

  return (
    <DashboardLayout requiredPermission="VISIT_VIEW">
      <div className="space-y-5">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E7E7E3]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Field Visits
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Plan, assign and track field operations.
            </p>
          </div>

          {hasPermission('VISIT_CREATE') && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCreate}
              icon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              New Visit
            </Button>
          )}
        </div>

        {/* Small "Upcoming Visits" Cards section */}
        {upcomingVisits.length > 0 && (
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Upcoming Schedule
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {upcomingVisits.map((v) => (
                <Card key={v.id} className="p-3.5 hover:border-slate-300 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {v.customerName}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{v.location}</span>
                      </div>
                    </div>
                    <VisitStatusBadge status={v.status} />
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">{formatDateTime(v.date)}</span>
                    <span className="font-medium text-slate-700 truncate max-w-[100px]">
                      {v.employee?.name || v.employee?.email?.split('@')[0]}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Top Controls Toolbar */}
        <Card className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <Input
              placeholder="Search customer, location or purpose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PLANNED">PLANNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </Select>

            {isSupervisor && (
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">All Assignees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name || emp.email}
                  </option>
                ))}
              </Select>
            )}

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Filter Date"
            />
          </div>
        </Card>

        {/* Main Visits Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E7E3] bg-[#FAFAF8] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Assigned Employee</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading visits...
                    </td>
                  </tr>
                ) : visits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No field visits found matching criteria.
                    </td>
                  </tr>
                ) : (
                  visits.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/70 transition">
                      {/* Customer */}
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {v.customerName}
                      </td>

                      {/* Assigned Employee */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                            {v.employee?.name ? v.employee.name[0].toUpperCase() : v.employee?.email[0].toUpperCase()}
                          </div>
                          <span className="text-slate-800 font-medium truncate max-w-[130px]">
                            {v.employee?.name || v.employee?.email?.split('@')[0]}
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{v.location}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px] whitespace-nowrap">
                        {formatDateTime(v.date)}
                      </td>

                      {/* Purpose */}
                      <td className="py-3 px-4 text-slate-600 truncate max-w-[180px]">
                        {v.purpose}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <VisitStatusBadge status={v.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {hasPermission('VISIT_UPDATE') && (
                            <button
                              onClick={() => handleOpenStatusModal(v)}
                              title="Update status"
                              className="px-2 py-1 rounded text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition"
                            >
                              Status
                            </button>
                          )}

                          {hasPermission('VISIT_UPDATE') && (
                            <button
                              onClick={() => handleOpenEdit(v)}
                              title="Edit visit"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {hasPermission('VISIT_DELETE') && (
                            <button
                              onClick={() => setDeleteVisit(v)}
                              title="Delete visit"
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

        {/* Visit Create / Edit Modal */}
        <VisitModal
          isOpen={visitModalOpen}
          onClose={() => setVisitModalOpen(false)}
          visit={editingVisit}
          onSuccess={() => {
            setVisitModalOpen(false);
            fetchVisits();
          }}
          employees={employees}
        />

        {/* Update Status Modal */}
        <Modal
          isOpen={!!statusModalVisit}
          onClose={() => setStatusModalVisit(null)}
          title="Update Visit Status"
          description={`Change dispatch status for visit with ${statusModalVisit?.customerName}`}
          maxWidth="sm"
        >
          <div className="space-y-4 mt-2">
            <Select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as any)}
            >
              <option value="PLANNED">PLANNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </Select>

            <Input
              label="Status Update Notes (Optional)"
              placeholder="e.g. Completed inspection, signed by manager"
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStatusModalVisit(null)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleUpdateStatus}
                isLoading={isUpdatingStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmDialog
          isOpen={!!deleteVisit}
          onClose={() => setDeleteVisit(null)}
          onConfirm={handleDeleteVisit}
          title="Cancel & Delete Visit"
          message={`Are you sure you want to delete the scheduled visit for ${deleteVisit?.customerName}? This dispatch record will be permanently removed.`}
          confirmText="Delete Visit"
          variant="danger"
          isLoading={isDeleting}
        />
      </div>
    </DashboardLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { apiClient } from '../../lib/api/client';
import { useAuth } from '../../lib/auth/auth-context';
import { useToast } from '../../components/ui/Toast';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { CheckInOutWidget } from '../../components/attendance/CheckInOutWidget';
import { formatDate, formatTime } from '../../lib/utils/cn';
import { Clock, Filter, Calendar, User, Search, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';

export default function AttendancePage() {
  const { user, hasRole } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isSupervisor = hasRole(['SUPERADMIN', 'MANAGER']);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedUser) params.userId = selectedUser;
      if (selectedStatus) params.status = selectedStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const data = await apiClient.get<any[]>('/attendance', params);
      setRecords(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendance logs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!isSupervisor) return;
    try {
      const data = await apiClient.get<any[]>('/users');
      setUsersList(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [isSupervisor]);

  useEffect(() => {
    fetchRecords();
  }, [selectedUser, selectedStatus, startDate, endDate]);

  const calculateDuration = (inTime?: string, outTime?: string) => {
    if (!inTime) return '—';
    if (!outTime) return 'Active session';
    const diffMs = new Date(outTime).getTime() - new Date(inTime).getTime();
    if (isNaN(diffMs) || diffMs < 0) return '—';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Compute metrics from records
  const presentCount = records.filter((r) => r.status === 'PRESENT').length;
  const lateCount = records.filter((r) => r.status === 'LATE').length;
  const checkedOutCount = records.filter((r) => !!(r.checkOut || r.checkOutTime)).length;
  const activeCount = records.filter((r) => !(r.checkOut || r.checkOutTime)).length;

  return (
    <DashboardLayout requiredPermission="ATTENDANCE_VIEW">
      <div className="space-y-5">
        {/* Page Header */}
        <div className="pb-2 border-b border-[#E7E7E3]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Today&apos;s attendance overview.
          </p>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Present
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {presentCount}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Logged shifts</p>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Late
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-1">
              {lateCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Arrived late</p>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Now
            </span>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {activeCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Currently on duty</p>
          </Card>

          <Card className="p-4">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Checked Out
            </span>
            <div className="text-2xl font-bold text-slate-700 mt-1">
              {checkedOutCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Shift completed</p>
          </Card>
        </div>

        {/* My Attendance Panel */}
        <CheckInOutWidget onStatusChange={fetchRecords} />

        {/* Filters Card */}
        <Card className="p-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {isSupervisor && (
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">All Team Members</option>
                {usersList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </Select>
            )}

            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Punch Statuses</option>
              <option value="PRESENT">On Time (Present)</option>
              <option value="LATE">Late Arrival</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ABSENT">Absent</option>
            </Select>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="From Date"
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="To Date"
            />
          </div>
        </Card>

        {/* Today's Attendance Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-[#E7E7E3] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Attendance Log</h2>
              <p className="text-xs text-slate-500 mt-0.5">Historical and real-time punch timestamps</p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {records.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E7E7E3] bg-[#FAFAF8] text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Check In</th>
                  <th className="py-3 px-4">Check Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading attendance records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No attendance records found matching filters.
                    </td>
                  </tr>
                ) : (
                  records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition">
                      {/* Employee */}
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {r.user?.name ? r.user.name[0].toUpperCase() : r.user?.email[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900">
                              {r.user?.name || r.user?.email.split('@')[0]}
                            </span>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {r.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <Badge variant="secondary">
                          {r.user?.role?.name || 'FIELD_EMPLOYEE'}
                        </Badge>
                      </td>

                      {/* Check In */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div>{formatTime(r.checkIn || r.checkInTime)}</div>
                        <div className="text-[10px] text-slate-400">
                          {formatDate(r.checkIn || r.createdAt || r.date)}
                        </div>
                      </td>

                      {/* Check Out */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {(r.checkOut || r.checkOutTime) ? (
                          formatTime(r.checkOut || r.checkOutTime)
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {calculateDuration(
                          r.checkIn || r.checkInTime,
                          r.checkOut || r.checkOutTime
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            r.status === 'LATE'
                              ? 'warning'
                              : r.status === 'PRESENT'
                              ? 'success'
                              : r.status === 'ABSENT'
                              ? 'danger'
                              : 'secondary'
                          }
                        >
                          {r.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

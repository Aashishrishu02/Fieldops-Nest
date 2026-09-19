'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { apiClient } from '../../lib/api/client';
import { useToast } from '../ui/Toast';

export interface VisitData {
  id?: string;
  assignedTo: string;
  customerName: string;
  location: string;
  date: string;
  purpose: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit?: VisitData | null;
  onSuccess: () => void;
  employees: Array<{ id: string; name: string | null; email: string }>;
}

export const VisitModal: React.FC<VisitModalProps> = ({
  isOpen,
  onClose,
  visit,
  onSuccess,
  employees,
}) => {
  const [formData, setFormData] = useState<VisitData>({
    assignedTo: '',
    customerName: '',
    location: '',
    date: new Date().toISOString().slice(0, 16),
    purpose: '',
    status: 'PLANNED',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  useEffect(() => {
    if (visit) {
      setFormData({
        id: visit.id,
        assignedTo: visit.assignedTo || '',
        customerName: visit.customerName || '',
        location: visit.location || '',
        date: visit.date ? new Date(visit.date).toISOString().slice(0, 16) : '',
        purpose: visit.purpose || '',
        status: visit.status || 'PLANNED',
        notes: visit.notes || '',
      });
    } else {
      setFormData({
        assignedTo: employees[0]?.id || '',
        customerName: '',
        location: '',
        date: new Date(Date.now() + 2 * 3600 * 1000).toISOString().slice(0, 16),
        purpose: '',
        status: 'PLANNED',
        notes: '',
      });
    }
    setErrors({});
  }, [visit, employees, isOpen]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.assignedTo) errs.assignedTo = 'Please select a field employee';
    if (!formData.customerName.trim()) errs.customerName = 'Customer/Client name is required';
    if (!formData.location.trim()) errs.location = 'Location or address is required';
    if (!formData.date) errs.date = 'Scheduled date is required';
    if (!formData.purpose.trim()) errs.purpose = 'Purpose of visit is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      if (visit?.id) {
        await apiClient.patch(`/visits/${visit.id}`, payload);
        showToast('Visit updated successfully', 'success');
      } else {
        await apiClient.post('/visits', payload);
        showToast('Field visit scheduled and dispatched', 'success');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save visit', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={visit ? 'Edit Field Visit' : 'Schedule Field Visit'}
      description={visit ? 'Update visit details, assignments or status' : 'Dispatch a new site appointment'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Select
          label="Assign Field Employee *"
          value={formData.assignedTo}
          onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
          error={errors.assignedTo}
        >
          <option value="">-- Choose Employee --</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name || emp.email} ({emp.email})
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Client / Facility Name *"
            placeholder="e.g. Apex Hub Logistics"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            error={errors.customerName}
          />
          <Input
            label="Scheduled Date & Time *"
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            error={errors.date}
          />
        </div>

        <Input
          label="Site Location / Address *"
          placeholder="e.g. 450 Industrial Parkway, Sector 4"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          error={errors.location}
        />

        <Input
          label="Purpose of Visit *"
          placeholder="e.g. HVAC Telemetry Inspection & Safety Audit"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
          error={errors.purpose}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Visit Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
          >
            <option value="PLANNED">PLANNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </Select>

          <Input
            label="Site Notes / Access Info"
            placeholder="Gate code, site contact, etc."
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            {visit ? 'Save Changes' : 'Schedule Visit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

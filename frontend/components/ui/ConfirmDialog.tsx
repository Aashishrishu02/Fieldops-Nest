'use client';

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 flex-1">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

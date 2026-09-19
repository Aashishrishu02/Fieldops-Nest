'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { apiClient } from '../../lib/api/client';
import { useToast } from '../ui/Toast';
import { RefreshCw, Check, Copy, AlertTriangle } from 'lucide-react';

interface RegenerateCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string | null; email: string; role: { name: string } } | null;
}

export const RegenerateCredentialsModal: React.FC<RegenerateCredentialsModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [newCredentials, setNewCredentials] = useState<{ email: string; newPassword: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  if (!user) return null;

  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<any>(`/users/${user.id}/regenerate-credentials`);
      setNewCredentials(response);
      showToast('New credentials generated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to regenerate credentials', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const copyPassword = () => {
    if (!newCredentials) return;
    navigator.clipboard.writeText(newCredentials.newPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setNewCredentials(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="sm">
      <div className="text-center mb-4">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto mb-2.5">
          <RefreshCw className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Regenerate Credentials</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate a new secure password for <strong className="text-slate-800">{user.email}</strong>
        </p>
      </div>

      {!newCredentials ? (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-800 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              This will immediately invalidate the user&apos;s current password and any active sessions.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRegenerate}
              isLoading={isLoading}
            >
              Generate New Password
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
              New Generated Password
            </span>
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono font-bold text-slate-900">
                {newCredentials.newPassword}
              </code>
              <Button
                variant="secondary"
                size="sm"
                onClick={copyPassword}
                icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Provide this new password securely to the operator.
          </p>

          <Button variant="primary" size="sm" onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      )}
    </Modal>
  );
};

'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Check, Copy, ShieldAlert, KeyRound } from 'lucide-react';

export interface GeneratedCredentials {
  email: string;
  password: string;
  role: string;
}

interface GeneratedCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: GeneratedCredentials | null;
}

export const GeneratedCredentialsModal: React.FC<GeneratedCredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!credentials) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const copyAll = () => {
    const text = `FieldOps System Account Credentials:\nRole: ${credentials.role}\nEmail: ${credentials.email}\nPassword: ${credentials.password}\nLogin URL: ${window.location.origin}/login`;
    copyToClipboard(text, 'all');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="text-center mb-5">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-2.5">
          <KeyRound className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">Account Created</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          System-generated account for role <strong className="text-slate-800">{credentials.role}</strong>
        </p>
      </div>

      <div className="space-y-3">
        {/* Email */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Email / Username
            </span>
            <code className="text-xs font-semibold text-slate-900 truncate block font-mono mt-0.5">
              {credentials.email}
            </code>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(credentials.email, 'email')}
            icon={copiedField === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedField === 'email' ? 'Copied' : 'Copy Email'}
          </Button>
        </div>

        {/* Temporary Password */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Temporary Password
            </span>
            <code className="text-xs font-semibold text-slate-900 truncate block font-mono mt-0.5">
              {credentials.password}
            </code>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => copyToClipboard(credentials.password, 'password')}
            icon={copiedField === 'password' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedField === 'password' ? 'Copied' : 'Copy Password'}
          </Button>
        </div>
      </div>

      {/* Security notice */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-3 my-4 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <strong>Important:</strong> Store these credentials securely. Password changes are disabled for system-generated accounts.
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <Button
          variant="outline"
          size="sm"
          onClick={copyAll}
          icon={copiedField === 'all' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <KeyRound className="w-3.5 h-3.5" />}
        >
          {copiedField === 'all' ? 'Copied All Info' : 'Copy Full Details'}
        </Button>
        <Button variant="primary" size="sm" onClick={onClose}>
          Done & Close
        </Button>
      </div>
    </Modal>
  );
};

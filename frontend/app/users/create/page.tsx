'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { apiClient } from '../../../lib/api/client';
import { useToast } from '../../../components/ui/Toast';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Card } from '../../../components/ui/Card';
import { GeneratedCredentialsModal } from '../../../components/users/GeneratedCredentialsModal';
import {
  Sparkles,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../../../lib/utils/cn';

export default function CreateUserPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [provisioningType, setProvisioningType] = useState<'generate' | 'invite'>('generate');
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Option 1: System Generated
  const [generateRoleId, setGenerateRoleId] = useState('');
  const [generateName, setGenerateName] = useState('');
  const [generateRecipientEmail, setGenerateRecipientEmail] = useState('');
  const [isSubmittingGenerate, setIsSubmittingGenerate] = useState(false);

  // Option 2: Invite User
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRoleId, setInviteRoleId] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [invitedSuccess, setInvitedSuccess] = useState<any | null>(null);

  // Generated credentials modal
  const [generatedCreds, setGeneratedCreds] = useState<any | null>(null);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const data = await apiClient.get<any[]>('/roles');
        setRoles(data);
        if (data.length > 0) {
          const defaultRole = data.find((r) => r.name === 'FIELD_EMPLOYEE') || data[0];
          setGenerateRoleId(defaultRole.id);
          setInviteRoleId(defaultRole.id);
        }
      } catch (err: any) {
        showToast(err.message || 'Failed to load roles', 'error');
      } finally {
        setIsLoadingRoles(false);
      }
    };
    loadRoles();
  }, [showToast]);

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateRoleId) {
      showToast('Please select a role', 'error');
      return;
    }

    setIsSubmittingGenerate(true);
    try {
      const response = await apiClient.post<any>('/users/system-generated', {
        roleId: generateRoleId,
        name: generateName.trim() || undefined,
        recipientEmailToSendCreds: generateRecipientEmail.trim() || undefined,
      });

      showToast('System user created successfully', 'success');
      setGeneratedCreds(response.credentials);
      setGenerateName('');
      setGenerateRecipientEmail('');
    } catch (err: any) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setIsSubmittingGenerate(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteRoleId) {
      showToast('Please provide an email and select a role', 'error');
      return;
    }

    setIsSubmittingInvite(true);
    try {
      const response = await apiClient.post<any>('/users/invite', {
        email: inviteEmail.trim(),
        roleId: inviteRoleId,
        name: inviteName.trim() || undefined,
      });

      showToast('Invitation dispatched successfully', 'success');
      setInvitedSuccess({
        email: response.user?.email || inviteEmail,
        role: response.user?.role?.name || 'Assigned Role',
        temporaryPasswordStatus: 'Generated & Active (Must change on first login)',
      });
      setInviteEmail('');
      setInviteName('');
    } catch (err: any) {
      showToast(err.message || 'Failed to invite user', 'error');
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  return (
    <DashboardLayout requiredPermission="USER_CREATE">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E3]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link
                href="/users"
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to Users
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Create User
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Choose how you want to provision this user.
            </p>
          </div>
        </div>

        {/* Two Selectable Provisioning Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: System Generated */}
          <div
            onClick={() => setProvisioningType('generate')}
            className={cn(
              'p-5 rounded-xl border cursor-pointer transition duration-150 relative bg-white',
              provisioningType === 'generate'
                ? 'border-slate-900 ring-1 ring-slate-900 shadow-sm'
                : 'border-[#E7E7E3] hover:border-slate-300 shadow-xs',
            )}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <div
                className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center',
                  provisioningType === 'generate'
                    ? 'border-slate-900 bg-slate-900'
                    : 'border-slate-300 bg-white',
                )}
              >
                {provisioningType === 'generate' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                SYSTEM GENERATED
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Create a new FieldOps account with system-generated credentials.
              </p>
            </div>
          </div>

          {/* Card 2: Invite User */}
          <div
            onClick={() => setProvisioningType('invite')}
            className={cn(
              'p-5 rounded-xl border cursor-pointer transition duration-150 relative bg-white',
              provisioningType === 'invite'
                ? 'border-slate-900 ring-1 ring-slate-900 shadow-sm'
                : 'border-[#E7E7E3] hover:border-slate-300 shadow-xs',
            )}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div
                className={cn(
                  'w-4 h-4 rounded-full border flex items-center justify-center',
                  provisioningType === 'invite'
                    ? 'border-slate-900 bg-slate-900'
                    : 'border-slate-300 bg-white',
                )}
              >
                {provisioningType === 'invite' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-bold tracking-tight text-slate-900">
                INVITE USER
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Invite an existing email address with a temporary password.
              </p>
            </div>
          </div>
        </div>

        {/* Selected Flow Form */}
        <Card className="p-6 sm:p-7">
          {provisioningType === 'generate' ? (
            /* CASE 1: SYSTEM GENERATED */
            <form onSubmit={handleGenerateSubmit} className="space-y-4">
              <div className="pb-3 mb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">
                  System-Generated Account Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The system will automatically create a unique username and secure password.
                </p>
              </div>

              <div className="space-y-4">
                <Select
                  label="Assigned Role *"
                  value={generateRoleId}
                  onChange={(e) => setGenerateRoleId(e.target.value)}
                  disabled={isLoadingRoles}
                  required
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </Select>

                <Input
                  label="Technician / Operator Name (Optional)"
                  placeholder="e.g. Alex Morgan"
                  value={generateName}
                  onChange={(e) => setGenerateName(e.target.value)}
                />

                <Input
                  label="Send Credentials Copy To (Optional)"
                  type="email"
                  placeholder="supervisor@fieldops.local"
                  value={generateRecipientEmail}
                  onChange={(e) => setGenerateRecipientEmail(e.target.value)}
                  helperText="Optionally forward the generated credentials to a supervisor email."
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                <p>
                  No manual password entry required. Credentials will be securely displayed in a modal immediately after creation.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingGenerate}
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                >
                  Generate User
                </Button>
              </div>
            </form>
          ) : (
            /* CASE 2: INVITE USER */
            <div className="space-y-4">
              <div className="pb-3 mb-2 border-b border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900">
                  Invite User with Temporary Credentials
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  An email invitation will be created with a temporary password.
                </p>
              </div>

              {invitedSuccess ? (
                /* Invitation Sent Card */
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Invitation Sent</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-700 pl-6">
                    <p>
                      <strong>Email:</strong> <span className="font-mono">{invitedSuccess.email}</span>
                    </p>
                    <p>
                      <strong>Role:</strong> {invitedSuccess.role}
                    </p>
                    <p>
                      <strong>Temporary password status:</strong> {invitedSuccess.temporaryPasswordStatus}
                    </p>
                  </div>

                  <div className="pt-2 flex gap-2 pl-6">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setInvitedSuccess(null)}
                    >
                      Invite Another User
                    </Button>
                    <Link href="/users">
                      <Button variant="secondary" size="sm">
                        View Users List
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInviteSubmit} className="space-y-4">
                  <Input
                    label="User Email Address *"
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />

                  <Select
                    label="Assigned Role *"
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    disabled={isLoadingRoles}
                    required
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Full Name (Optional)"
                    placeholder="e.g. Jordan Lee"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                  />

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-slate-700 flex-shrink-0 mt-0.5" />
                    <p>
                      The recipient will receive their temporary password and will be required to configure a permanent password upon first login.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSubmittingInvite}
                      icon={<Send className="w-3.5 h-3.5" />}
                    >
                      Send Invitation
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Card>

        {/* Credentials Modal for Case 1 */}
        <GeneratedCredentialsModal
          isOpen={!!generatedCreds}
          onClose={() => setGeneratedCreds(null)}
          credentials={generatedCreds}
        />
      </div>
    </DashboardLayout>
  );
}

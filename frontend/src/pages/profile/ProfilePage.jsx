import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Shield, User, Mail, Building, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.full_name || 'Dr. Alex Rivera');
  const [organization, setOrganization] = useState(user?.organization || 'TRACE-X Campus Safety Intelligence');
  const [role, setRole] = useState(user?.role || 'Senior Forensic Analyst');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        full_name: fullName,
        organization,
        role,
      });
      setIsSaving(false);
      toast.success('Analyst profile updated successfully');
    }, 400);
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Analyst Credentials
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Investigator Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Identity, agency affiliation, and cryptographic access parameters.
        </p>
      </div>

      {/* Avatar & Personal Info Card */}
      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-slate-100">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-card"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-card">
                {(user?.full_name || 'A')[0]}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
              <p className="text-xs text-slate-500">{user?.email || 'investigator@trace-x.ai'}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  {role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                  {organization}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={User}
              />
              <Input
                label="Email Address"
                value={user?.email || 'investigator@trace-x.ai'}
                disabled
                icon={Mail}
                helperText="Email is managed via identity provider"
              />
              <Input
                label="Organization / Agency"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                icon={Building}
              />
              <Input
                label="Assigned Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                icon={Shield}
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Member since {new Date(user?.created_at || '2024-01-15').toLocaleDateString()}
              </span>
              <Button type="submit" size="sm" loading={isSaving}>
                Save Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Security & Sessions */}
      <Card>
        <CardHeader
          title="Security & Session Management"
          subtitle="Manage active authorization tokens"
        />
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-900">Current Session (This Device)</div>
              <div className="text-[11px] text-slate-500">Active • Last verified just now</div>
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
              SECURE
            </span>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need to terminate credentials across all active devices?
            </span>
            <Button
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

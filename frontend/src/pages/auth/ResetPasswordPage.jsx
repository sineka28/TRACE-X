import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useToast } from '../../hooks/useToast';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!password || password !== confirmPassword) {
      toast.error('Passwords must match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Password updated successfully');
      navigate('/login');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-700 text-white font-bold shadow-card mb-4">
          <Shield className="w-6 h-6 text-indigo-100" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          Create New Password
        </h2>
        <p className="text-xs uppercase tracking-widest font-bold text-indigo-600 mt-1">
          Secure Credential Update
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-card">
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              required
            />

            <div className="pt-2">
              <Button type="submit" className="w-full" loading={loading}>
                Update Password & Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

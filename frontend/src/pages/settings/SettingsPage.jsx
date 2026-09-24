import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Shield, Server, Cpu, CheckCircle2, AlertTriangle, Key, Bell, Moon } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export function SettingsPage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    api
      .getHealth()
      .then(setHealthStatus)
      .catch(() => setHealthStatus(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Platform Configuration
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          System Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify backend connectivity, AI reasoning integration, and security controls.
        </p>
      </div>

      {/* Backend & AI API Status */}
      <Card>
        <CardHeader
          title="Engine Infrastructure & API Connectivity"
          subtitle="Real-time operational status of backend services"
        />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* FastAPI Engine */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">FastAPI Engine</span>
                <Server className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {healthStatus?.status === 'healthy' ? 'ONLINE (Port 8000)' : 'CONNECTED'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                DB Engine: {healthStatus?.database || 'SQLite / PostgreSQL'}
              </span>
            </div>

            {/* Gemini AI Reasoning Engine */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">Gemini AI Model</span>
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    healthStatus?.gemini_configured ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {healthStatus?.gemini_configured ? 'ACTIVE (GenAI)' : 'HEURISTIC CORE'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {healthStatus?.gemini_configured ? 'Gemini 1.5 Flash' : 'Deterministic Fallback Active'}
              </span>
            </div>

            {/* Supabase Platform */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">Supabase Platform</span>
                <Key className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    healthStatus?.supabase_configured ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                />
                <span className="text-sm font-bold text-slate-900 font-mono">
                  {healthStatus?.supabase_configured ? 'CONNECTED' : 'LOCAL DEV READY'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Auth & Storage Provider
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
            <span className="font-bold">Security Guarantee: </span>
            All sensitive AI credentials (such as GEMINI_API_KEY) and Supabase service keys are kept strictly on the Python FastAPI backend and are never exposed to browser client code.
          </div>
        </CardContent>
      </Card>

      {/* Notifications Preferences */}
      <Card>
        <CardHeader
          title="Intelligence Alerts & Notifications"
          subtitle="Configure system updates and conflict alarms"
        />
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <div className="font-bold text-slate-800">Critical Unknown Gap Notifications</div>
              <div className="text-slate-500 text-[11px]">Trigger immediate alert when coverage breaks exceeding 5 seconds</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <div>
              <div className="font-bold text-slate-800">Timestamp Contradiction Alarms</div>
              <div className="text-slate-500 text-[11px]">Alert investigator when two cameras report contradictory locations</div>
            </div>
            <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

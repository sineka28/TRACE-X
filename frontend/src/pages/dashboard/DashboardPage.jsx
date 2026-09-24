import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  FolderKanban,
  Clock,
  Layers,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  FileText,
  Search,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { SyntheticDemoBanner } from '../../components/common/SyntheticDemoBanner';
import { NewInvestigationWizard } from '../../components/investigation/NewInvestigationWizard';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [investigations, setInvestigations] = useState([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isResettingDemo, setIsResettingDemo] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await api.getInvestigations();
      setInvestigations(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSeedDemo = async () => {
    try {
      setIsResettingDemo(true);
      const res = await api.seedDemo();
      toast.success('Campus Parking Incident synthetic demo loaded');
      await fetchDashboardData();
      navigate(`/investigations/${res.investigation_id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to seed demo');
    } finally {
      setIsResettingDemo(false);
    }
  };

  // Compute metrics
  const activeCount = investigations.filter((i) => i.status === 'ACTIVE' || i.status === 'COMPLETED').length;
  const totalEvidenceCount = investigations.reduce((acc, i) => acc + (i.evidence_count || 0), 0);
  const totalGapsCount = investigations.reduce((acc, i) => acc + (i.gaps_count || 0), 0);
  const totalHypotheses = investigations.reduce((acc, i) => acc + (i.hypotheses_count || 0), 0);

  const greetingName = user?.full_name?.split(' ')[0] || 'Investigator';

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            Evidence Intelligence Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Good morning, {greetingName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Multi-modal investigation timelines, unobserved gap intelligence, and competing hypotheses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            icon={Sparkles}
            onClick={handleSeedDemo}
            loading={isResettingDemo}
            className="border-amber-300 text-amber-950 bg-amber-50 hover:bg-amber-100"
          >
            Explore Live Demo
          </Button>
          <Button icon={Plus} onClick={() => setIsWizardOpen(true)}>
            New Investigation
          </Button>
        </div>
      </div>

      {/* Synthetic Demo Notification Banner */}
      <SyntheticDemoBanner onReset={handleSeedDemo} isResetting={isResettingDemo} />

      {/* Compact Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Active Investigations
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : activeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Multi-modal active cases</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Evidence Sources
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : totalEvidenceCount || 6}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <span>CCTV, GPS, sensor feeds</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Unknown Gaps
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1.5 font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : totalGapsCount || 1}
          </div>
          <div className="text-[11px] text-amber-800 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Unobserved time intervals</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Competing Hypotheses
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 font-mono">
            {loading ? <Skeleton className="h-8 w-12" /> : totalHypotheses || 3}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            <span>Scored with heuristic engine</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Investigations & Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Investigations Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Recent Investigations
            </h3>
            <Link
              to="/investigations"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-card">
            {loading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : investigations.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No investigations yet. Create one or explore the synthetic demo.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {investigations.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => navigate(`/investigations/${inv.id}`)}
                    className="p-5 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {inv.title}
                        </span>
                        {inv.is_synthetic_demo && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-extrabold text-[9px] uppercase border border-amber-300">
                            DEMO
                          </span>
                        )}
                        <Badge status={inv.status}>{inv.status}</Badge>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                        <span className="font-semibold text-slate-700">{inv.domain}</span>
                        <span>•</span>
                        <span>{inv.evidence_count || 6} Evidence Sources</span>
                        <span>•</span>
                        <span className="text-amber-800 font-medium">
                          {inv.gaps_count || 1} Unknown Gap
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                      <span className="font-mono text-[11px] text-slate-400">
                        {new Date(inv.updated_at || inv.created_at).toLocaleDateString()}
                      </span>
                      <Button size="sm" variant="outline" className="text-xs">
                        Open
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Critical Evidence Gaps & Next Actions */}
        <div className="space-y-6">
          {/* Critical Evidence Gaps Card */}
          <Card>
            <CardHeader
              title="Critical Evidence Gaps"
              subtitle="Unobserved intervals requiring priority resolution"
            />
            <CardContent className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-950 font-mono">10:02:18 → 10:02:27</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold uppercase">
                    9s Duration
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  Person A disappears behind concrete retaining wall near Restricted Gate #2; emerges near Building B stairwell.
                </p>
                <div className="pt-2 text-[10px] text-amber-900 font-semibold flex items-center justify-between">
                  <span>Distinguishes: Fast Transit vs Staged Handoff</span>
                  <Link
                    to="/investigations/demo-campus-parking-001?tab=timeline"
                    className="underline text-indigo-700"
                  >
                    View Timeline
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Actions Card */}
          <Card>
            <CardHeader
              title="Next Priority Actions"
              subtitle="High-information-value collection targets"
            />
            <CardContent className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">Camera C3 Local SD Card</span>
                  <Badge status="HIGH">HIGH</Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  Target: East Alleyway Pole 12 (10:02:15 - 10:02:30). Resolves blindspot between Camera B & C.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-slate-900">Van CAN-Bus Telematics</span>
                  <Badge status="HIGH">HIGH</Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  Verifies whether cargo hatch latch pulse at 10:02:20 corresponds to physical interior entry.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Investigation Wizard Modal */}
      <NewInvestigationWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onSuccess={() => fetchDashboardData()}
      />
    </div>
  );
}

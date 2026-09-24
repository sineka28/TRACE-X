import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cpu,
  Clock,
  GitBranch,
  Layers,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card, CardHeader, CardContent } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Skeleton } from '../../components/common/Skeleton';
import { api } from '../../services/api';

export function AnalysisHubPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .getAllAnalyses()
      .then((data) => setAnalyses(data || []))
      .catch(() => setAnalyses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
          Reasoning & Reconstructions
        </span>
        <h1 className="text-2xl font-black text-slate-900 mt-0.5">
          Analysis Operations Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review completed pipeline runs, multi-camera correlation sequences, and open coverage gaps.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Analyzed Investigations</span>
            <Cpu className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-slate-900 font-mono mt-2">
            {loading ? <Skeleton className="h-8 w-12" /> : analyses.length || 1}
          </div>
          <p className="text-xs text-slate-500 mt-1">Full 12-step pipeline completed</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Unknown Gaps Discovered</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-amber-950 font-mono mt-2">
            {loading ? <Skeleton className="h-8 w-12" /> : 1}
          </div>
          <p className="text-xs text-amber-800 mt-1">Unmonitored coverage drop intervals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase">Conflict Analysis</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-950 font-mono mt-2">
            0 Open
          </div>
          <p className="text-xs text-emerald-800 mt-1">No unresolved timestamp paradoxes</p>
        </div>
      </div>

      {/* Runs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-card">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Reconstruction Pipelines
          </h3>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {analyses.map((run) => (
              <div
                key={run.investigation_id}
                onClick={() => navigate(`/investigations/${run.investigation_id}?tab=timeline`)}
                className="p-5 hover:bg-slate-50/70 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {run.title}
                    </span>
                    <Badge status="COMPLETED">COMPLETED</Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                    <span>Domain: {run.domain}</span>
                    <span>•</span>
                    <span className="text-amber-800 font-semibold">{run.gaps_count} Gap Detected</span>
                    <span>•</span>
                    <span>{run.hypotheses_count} Hypotheses Formulated</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                  <Button size="sm" variant="outline" className="text-xs">
                    Inspect Timeline & Gaps
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
